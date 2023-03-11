import { concatMap, Subject, throttleTime } from "rxjs";
import { Todo } from "./todo";
import fs from "fs/promises";
import { BACKUP_PATH } from "./constants";
import { join } from "path";

function file_name() {
  const now = new Date();
  const date = now.getFullYear() + "-" + (now.getMonth() + 1) + "-" + now.getDate();
  return join(BACKUP_PATH, `backup_${date}.txt`);
}

export const to_backup = new Subject<[Todo[], Todo[]]>();

const backup_todos = to_backup.pipe(
  throttleTime(2000, undefined, { leading: false, trailing: true }),
  concatMap(async ([todos, dones]) => await fs.writeFile(
      file_name(),
      [...todos, ...dones].map(todo => JSON.stringify(todo)+'\n'),
      "utf8"
    )
  )
);

backup_todos.subscribe();
