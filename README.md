# IQU to-do management

This [Raycast](https://raycast.com/) extension helps you manage your to-dos by automatically prioritising them for you.

## How it works 

When you create a new to-do, you can mark it with any of the following flags.

- *Urgency*: This to-do has a deadline, and it feels relatively close by.  
- *Importance*: This to-do is relatively important compared to other tasks. 
- *Quickness*: This to-do can be completed with relatively low effort.

Based on these flags a score is assigned to these to-dos. The basic formula is as follows:
```python
todo.urgency * 3 + todo.importance * 2 + todo.quickness * 1.1 
```
Your to-dos will then be automatically ordered based on this score. When a todo is completed, then it will appear in a 
separate section in order to not clutter the list of to-dos that still need to be performed

## Quick guide

These shortcuts are important to interact with the todos

| Shortcut    | Action                                            |
|-------------|---------------------------------------------------|
| cmd+n       | Create new to-do                                  |
| cmd+shift+n | Create new top priority to-do (all flags checked) |
| cmd+e       | Edit the to-do                                    |
| cmd+(u/i/q) | toggle urgency/importance/quickness               |
| enter       | mark as completed or continue a completed task    |

Basic filtering is supported, just start typing:

| Query                   | meaning                                                                  |
|-------------------------|--------------------------------------------------------------------------|
| any text                | Fuzzy match the title of the todo                                        |
| `quick=true`<br/>`q=t`  | Only show quick tasks (also works for important and urgent)              |
| `quick=false`<br/>`q=f` | Only show tasks that are not quick (also works for important and urgent) |

## Roadmap

> Ironically, the items are not necessarily in order of priority! 

- [x] Create new to-dos
- [x] Edit to-dos
- [x] Automatic ordering 
- [x] Quick toggle priority
- [x] Filtering to-dos using queries
- [ ] Attach a url or link to the task
- [ ] Backups
- [ ] Categories or labels
- [ ] Automated tests
- [ ] Remote persistence
- [ ] Allow deleting to-dos
- [ ] Checklists in a to-do
- [ ] Allow configuring the weights 
- [ ] Import / Export

## Contributions

Any help is welcome! 

## License

MIT