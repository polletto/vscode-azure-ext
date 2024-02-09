import * as vscode from "vscode";
import { EventEmitter } from "vscode";
import { Event } from "vscode";
import { AzureDevOpsAPI } from "./Azure";
import { taskWebViewProvider } from "../providers/taskWebViewProvider";
import {getCurrentWeekNumber} from '../utils';

export class tasksProvider implements vscode.TreeDataProvider<Task> {
  private changeEvent = new EventEmitter<void>();
  protected azureDevOpsManager: AzureDevOpsAPI;
  protected orgUrl: string;
  protected personalAccessToken: string;
  protected userEmail: string;
  public tasks: Task[] = [];

  constructor() {
    this.orgUrl = vscode.workspace
      .getConfiguration("azureDevOpsTest")
      .get("orgUrl") ?? "";
    this.personalAccessToken = atob(
      vscode.workspace
        .getConfiguration("azureDevOpsTest")
        .get("personalAccessToken") ?? ""
    );
    this.userEmail = vscode.workspace
      .getConfiguration("azureDevOpsTest")
      .get("userEmail") ?? "";
      this.azureDevOpsManager = new AzureDevOpsAPI(this.orgUrl,this.personalAccessToken);
  }

  // public get onDidChangeTreeData(): Event<void> {
  //   this.tasks = this.getChildren() as unknown as Task[];
  //   return this.changeEvent.event;
  // }

  public getTreeItem(element: Task): vscode.TreeItem {
    return {
      label: element.label,
      collapsibleState: vscode.TreeItemCollapsibleState.None,
      command: {
          command: 'tasksProvider.itemClicked',
          title: '',
          arguments: [element]
      }
    };
  }

  public refreshEntries(): void {
    this.changeEvent.fire();
  }

  public async nextWeek() {
    const currentWeek = getCurrentWeekNumber();
    // Ottieni i nuovi dati per la settimana successiva
    const newChildren = await this.getChildren(this.tasks[0], (currentWeek + 1).toString());
    // Aggiorna i dati nell'albero
    this.tasks = newChildren;
    // Emetti l'evento di cambiamento
    this.changeEvent.fire();
  }

  public async itemClicked(item: Task, view: taskWebViewProvider) {
    view.getHtmlForWebview(item);
  }

  public async getChildren(element?: Task, week?: string, project?: string): Promise<Task[]> {
    if (week === undefined || week === "") {
        week = getCurrentWeekNumber().toString();
    }
    if (project === undefined || project === "") {
        project = "B2C - Team Delivery";
    }
    const childs = await this.azureDevOpsManager.assignedWorkItems(week, project, this.userEmail as string);
    if (element) {
        return childs.map((t: any) => {
            return new Task(
                t.title,
                t.title,
                t.state,
                vscode.TreeItemCollapsibleState.None,
                t.description ?? "",
                t.project,
                t.areaPath
            );
        });
    }else {
        return this.tasks = childs.map((t: any) => {
            return new Task(
                t.title,
                t.title,
                t.state,
                vscode.TreeItemCollapsibleState.None,
                t.description ?? "",
                t.project,
                t.areaPath
            );
        });
    }
      
    // return this.azureDevOpsManager
    //   .assignedWorkItems(week, project, this.userEmail as string)
    //   .then((tasks: any) => {
    //     console.log(tasks);
    //     if (element) {
    //       return Promise.resolve(
    //         tasks.forEach((t: any) => {
    //           return new Task(
    //             t.title,
    //             t.title,
    //             t.state,
    //             vscode.TreeItemCollapsibleState.None,
    //             t.description ?? "",
    //             t.project,
    //             t.areaPath
    //           );
    //         })
    //       );
    //     } else {
    //       return Promise.resolve(
    //         tasks.map((t: any) => {
    //           return new Task(
    //             t.title,
    //             t.title,
    //             t.state,
    //             vscode.TreeItemCollapsibleState.None,
    //             t.description ?? "",
    //             t.project,
    //             t.areaPath
    //           );
    //         })
    //       );
    //     }
    //   });
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
    this.tooltip = `${this.project}`;
    this.description = description;
    this.project = project;
    this.areaPath = areaPath;
    this.command = command;

    this.contextValue = "task";
  }
}
