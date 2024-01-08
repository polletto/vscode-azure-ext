import * as vscode from "vscode";
import * as path from "path";
import AzureDevOpsManager from "../azure/AzureDevOpsManager";

export class tasksProvider implements vscode.TreeDataProvider<Task> {
  getTreeItem(element: Task): vscode.TreeItem {
    return element;
  }

  getChildren(element?: Task): Thenable<Task[]> {
    // use azuredevopsmanager to get tasks from azure devops
    const orgUrl = vscode.workspace
      .getConfiguration("azureDevOpsTest")
      .get("orgUrl");
    const personalAccessToken = atob(
      vscode.workspace
        .getConfiguration("azureDevOpsTest")
        .get("personalAccessToken") ?? ""
    );
    const userEmail = vscode.workspace
      .getConfiguration("azureDevOpsTest")
      .get("userEmail");

    const azureDevOpsManager = new AzureDevOpsManager(
      orgUrl as string,
      personalAccessToken
    );

    return azureDevOpsManager
      .getAssignedTasks(userEmail as string)
      .then((tasks: any) => {
        console.log(tasks);
        if (element) {
          return Promise.resolve(
            tasks.forEach((t: any) => {
              return new Task(
                t.title,
                t.title,
                t.state,
                vscode.TreeItemCollapsibleState.None,
                t.description,
                t.project,
                t.areaPath
              );
            })
          );
        } else {
          return Promise.resolve(
            tasks.map((t: any) => {
              return new Task(
                t.title,
                t.title,
                t.state,
                vscode.TreeItemCollapsibleState.None,
                t.description,
                t.project,
                t.areaPath
              );
            })
          );
        }
      });
  }
}

class Task extends vscode.TreeItem {
  constructor(
    public readonly label: string,
    public readonly title: string,
    public readonly state: string,
    public readonly collapsibleState: vscode.TreeItemCollapsibleState,
    public readonly description?: string,
    public readonly project?: string,
    public readonly areaPath?: string,
    public readonly command?: vscode.Command
  ) {
    super(label, collapsibleState);
    this.tooltip = `${this.label}`;
    this.description = description;
    this.project = project;
    this.areaPath = areaPath;
    this.command = command;

    this.contextValue = "task";
  }
}
