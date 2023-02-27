import {Action, ActionPanel, Color, Form, Icon, Keyboard, List, LocalStorage, useNavigation} from "@raycast/api";
import {useEffect, useState} from "react";
import {randomUUID} from "crypto";

/*
 IQU task master
 TODO:
 - [x] use search bar value for create
 - [x] create hyper urgent task
 - [x] use Icons for urgency
 - [x] use select field for urgency
 - [x] toggle urgency
 - [x] persistence
 - [x] fix insert bug when key not found.
 - [x] fix key for list elements
 - [x] allow editing title
 - [ ] make a section for done tasks
 - [x] edit title / todo
 - [ ] description?
 - [ ] clean code
   -[ ] multiple files
   -[ ] increase code reuse
 - [ ] remote backend?
 */

interface Todo {
  title: string;
  isCompleted: boolean;
  urgent: boolean;
  important: boolean;
  quick: boolean;

  id: string
}

const todo_icons= {
  urgent: { source: Icon.Alarm, tintColor: Color.Red },
  important: { source: Icon.Important, tintColor: Color.Yellow },
  quick:{ source: Icon.Bolt, tintColor: Color.Green }
}

const gray=  {
    light: "999999",
    dark: "444444",
    adjustContrast: true,
}

const gray_todo_icons= {
  urgent: { ...todo_icons.urgent, tintColor: gray },
  important: {...todo_icons.important, tintColor: gray },
  quick:{ ...todo_icons.quick, tintColor: gray }
}

const IQU_STORAGE_KEY = "IQU_TODO_LIST";


export default function Command() {

  // the entire set of todos
  const [todos, setTodos] = useState<Todo[]>([]);
  // the app is loading when loading todos
  const [loading, setLoading] = useState<boolean>(true);
  // search state
  const [searchText, setSearchText] = useState<string>("");
  // shown todos
  const [filteredList, setFilteredList] = useState<Todo[]>([]);

  if (loading) {
    void LocalStorage.getItem(IQU_STORAGE_KEY)
      .then((data) => {
          if (data && typeof data === 'string') {
            const parsed_ = JSON.parse(data).map(
                (todo: Todo): Todo => ({
                  ...todo,
                  id: todo.id || randomUUID()
                })
            );
            setTodos(parsed_);
          } else if (data){
            console.warn("could not parse data from local storage");
          } else {
            console.log("no data found in local storage");
          }
          setLoading(false);
      });
  }

  useEffect(() => {
    if(!loading){
      void LocalStorage.setItem(IQU_STORAGE_KEY, JSON.stringify(todos))
    }
  }, [todos, loading]);

  useEffect(() => {
    setFilteredList(todos.filter(
        (todo) => todo.title.toLowerCase().includes(searchText.toLowerCase())
    ));
  }, [todos, searchText]);

  // attention, this function mutates todo_list
  function insert_todo(todo: Todo, todo_list: Todo[]){
    const todo_score = score(todo);
    const index = todo_list.findIndex(t => score(t) <= todo_score);
    if (index === -1) {
      todo_list.push(todo);
    } else {
      todo_list.splice(index, 0, todo);
    }
    return todo_list;
  }

  function CreateTodo(todo: Todo) {
    setTodos(insert_todo(todo, [...(todos||[])]))
  }

  function EditTodo(index: number, todo: Partial<Todo>) {
    const original: Todo = todos?.[index] as Todo
    setTodos(insert_todo(
        {...original, ...todo },
        (todos??[]).filter((_, i)=> i!== index)
    ))
  }

  function handleToggleCompleted(index: number) {
    const newTodos = [...(todos||[])];
    newTodos[index].isCompleted = !newTodos[index].isCompleted;
    setTodos(newTodos);
  }

  function handleTogglePriority(index: number, priority_type: "urgent" | "important" | "quick") {
    // todo: write as patch
    const original: Todo = todos?.[index] as Todo
    setTodos(insert_todo(
        {...original, [priority_type]: !original[priority_type] },
        (todos??[]).filter((_, i)=> i!== index)
    ))
  }

  function handleDelete(index: number) {
    const newTodos = [...(todos??[])];
    newTodos.splice(index, 1);
    setTodos(newTodos);
  }

  return (
    <List
      actions={
        <ActionPanel>
          <CreateTodoAction onCreate={CreateTodo}
                            defaultTitle={searchText} />
          <CreateTopPriorityTodoAction onCreate={CreateTodo}
                                       defaultTitle={searchText}/>
        </ActionPanel>
      }
      isLoading={loading}
      filtering={false}
      onSearchTextChange={setSearchText}
      navigationTitle="Search Todos"
      searchBarPlaceholder="Search Todos"
    >
      {filteredList.map((todo, index) => (
        <List.Item key={todo.id}
          icon={todo.isCompleted ? Icon.Checkmark : Icon.Circle}
          title={todo.title}
          actions={
            <ActionPanel>
              <ActionPanel.Section>
                <ToggleTodoAction todo={todo}
                                  onToggle={() => handleToggleCompleted(index)} />
                <EditTodoAction todo={todo}
                                onUpdate={(todo: Partial<Todo>) => EditTodo(index, todo)} />
              </ActionPanel.Section>
              <ActionPanel.Section>

                <TogglePriority todo={todo}
                                onToggle={() => handleTogglePriority(index, "urgent")}
                                priority_type="urgent" />
                <TogglePriority todo={todo}
                                onToggle={() => handleTogglePriority(index, "important")}
                                priority_type="important" />
                <TogglePriority todo={todo}
                                onToggle={() => handleTogglePriority(index, "quick")}
                                priority_type="quick" />
                <CreateTodoAction onCreate={CreateTodo}
                                  defaultTitle={searchText}/>
                <CreateTopPriorityTodoAction onCreate={CreateTodo}
                                             defaultTitle={searchText}/>
                <DeleteTodoAction onDelete={() => handleDelete(index)} />
              </ActionPanel.Section>
            </ActionPanel>
          }
          accessories={GetAccessories(todo)}
        />
      ))}
    </List>
  );
}

function score(todo: Todo){
    return +todo.urgent*1.5 + +todo.important + +todo.quick*0.5
  }

function GetAccessories(todo: Todo) {
  return [
      {
        icon: todo.urgent ? todo_icons.urgent: gray_todo_icons.urgent,
        tooltip: "Urgent"
      },
      {
        icon: todo.important ? todo_icons.important: gray_todo_icons.important,
        tooltip: "Important"
      },
      {
        icon: todo.quick ? todo_icons.quick: gray_todo_icons.quick,
        tooltip: "Quick"
      },
  ]
}

function CreateTodoForm(props: { onCreate: (todo: Todo) => void, defaultTitle?: string, topPriority?: boolean, todo?: Todo }) {
  const { pop } = useNavigation();

  function handleSubmit(values: {
    title: string;
    urgent: boolean;
    important: boolean;
    quick: boolean;
  }) {
    props.onCreate({
      title: values.title,
      isCompleted: false,
      urgent: values.urgent,
      important: values.important,
      quick: values.quick,
      id: props.todo?.id || randomUUID() // maybe this is not necessary, depending on how we handle update
    });
    pop();
  }

  return (
    <Form
      actions={
        <ActionPanel>
          <Action.SubmitForm title={props.todo ? "Edit Todo" : "Create Todo"}
                             onSubmit={handleSubmit} />
        </ActionPanel>
      }
    >
      <Form.TextField id="title"
                      title="Title"
                      defaultValue={props.defaultTitle || props.todo?.title} />
      <Form.Checkbox id="urgent"
                     label="Urgent"
                     defaultValue={props.topPriority || props.todo?.urgent}/>
      <Form.Checkbox id="important"
                     label="Important"
                     defaultValue={props.topPriority || props.todo?.important}/>
      <Form.Checkbox id="quick"
                     label="Quick"
                     defaultValue={props.topPriority || props.todo?.quick}/>
    </Form>
  );
}

function CreateTodoAction(props: { onCreate: (todo: Todo) => void , defaultTitle?: string }) {
  return (
    <Action.Push
      icon={Icon.Pencil}
      title="Create Todo"
      shortcut={{ modifiers: ["cmd"], key: "n" }}
      target={
        <CreateTodoForm onCreate={props.onCreate}
                        defaultTitle={props.defaultTitle}/>
      }
    />
  );
}

function EditTodoAction(props: { onUpdate: (todo: Todo) => void , todo: Todo }) {
  return (
    <Action.Push
      icon={Icon.Pencil}
      title="Edit Todo"
      shortcut={{ modifiers: ["cmd"], key: "e" }}
      target={
        <CreateTodoForm onCreate={props.onUpdate}
                        todo={props.todo}/>
      }
    />
  );
}

function CreateTopPriorityTodoAction(props: { onCreate: (todo: Todo) => void , defaultTitle?: string }) {
  return (
    <Action.Push
      icon={Icon.Pencil}
      title="Create Top Priority Todo"
      shortcut={{ modifiers: ["cmd", "shift"], key: "n" }}
      target={
        <CreateTodoForm onCreate={props.onCreate}
                        defaultTitle={props.defaultTitle}
                        topPriority={true}/>
      }
    />
  );
}

function ToggleTodoAction(props: { todo: Todo; onToggle: () => void }) {
  return (
    <Action
      icon={props.todo.isCompleted ? Icon.Circle : Icon.Checkmark}
      title={props.todo.isCompleted ? "Uncomplete Todo" : "Complete Todo"}
      onAction={props.onToggle}
    />
  );
}

function TogglePriority(props: { todo: Todo; onToggle: () => void, priority_type: "important"|"urgent"|"quick" }) {
  const key=props.priority_type
  const icon= props.todo[key] ? gray_todo_icons[key] : todo_icons[key]
  const title= props.todo[key] ? `Mark not ${key}` : `Mark ${key}`
  const shortcut= {
    modifiers: ["cmd"] as Keyboard.KeyModifier[],
    key: key[0] as Keyboard.KeyEquivalent
  }
  return (
    <Action
      icon={icon}
      title={title}
      shortcut={shortcut}
      onAction={props.onToggle}
    />
  );
}

function DeleteTodoAction(props: { onDelete: () => void }) {
  return (
    <Action
      icon={Icon.Trash}
      title="Delete Todo"
      shortcut={{ modifiers: ["ctrl"], key: "x" }}
      onAction={props.onDelete}
    />
  );
}