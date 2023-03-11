import { Action } from "@raycast/api";
import { BACKUP_PATH } from "./constants";

export function BackupOpendirComponent() {
  return (
    <Action.ShowInFinder path={BACKUP_PATH}
                         title="Show Backups in finder"
                         shortcut={{modifiers: ["cmd", "shift"], key: "b"}}/>
  );
}