import { Todo } from "./todo";
import { randomUUID } from "crypto";
import { environment, LocalStorage } from "@raycast/api";
import { IQU_STORAGE_KEY, IQU_STORAGE_KEY_DONE } from "./constants";
import * as fs from "fs";
import { concatMap, debounceTime, Subject } from "rxjs";

function load_todo(todo: Todo): Todo {
  return {
    ...todo,
    id: todo.id || randomUUID(),
    title: todo.title || "[Title not found]"
  };
}

export async function load_todos(): Promise<[Todo[], Todo[]]> {
  const [todos, dones] = await Promise.all([
    LocalStorage.getItem(IQU_STORAGE_KEY),
    LocalStorage.getItem(IQU_STORAGE_KEY_DONE)
  ]);
  return [
    JSON.parse(todos as string ?? "[]").map(load_todo),
    JSON.parse(dones as string ?? "[]").map(load_todo)
  ];
}

export async function store_todos(todos: Todo[]): Promise<void> {
  await LocalStorage.setItem(IQU_STORAGE_KEY, JSON.stringify(todos));
}


export const to_backup = new Subject<[Todo[], Todo[]]>();

const persist_todos = to_backup.pipe(
  debounceTime(2000),
  concatMap(async ([todos, dones]) => new Promise((resolve, reject) => {
    const now = new Date();
    const date = now.getFullYear() + "-" + (now.getMonth() + 1) + "-" + now.getDate();
    console.log(`storing backup`)
    fs.writeFile(
      `${environment.supportPath}/backup_${date}.txt`,
      JSON.stringify([...todos, ...dones], null, 2),
      "utf8",
      resolve
    );
  }))
);

persist_todos.subscribe()

export async function store_dones(dones: Todo[]): Promise<void> {
  await LocalStorage.setItem(IQU_STORAGE_KEY_DONE, JSON.stringify(dones));
}
