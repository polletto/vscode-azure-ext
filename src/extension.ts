// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from "vscode";
import AzureDevOpsManager from "./azure/AzureDevOpsManager";
import { tasksProvider } from "./azure/tasksProvider";
import { taskWebViewProvider } from "./providers/taskWebViewProvider";

interface UserData {
  orgUrl: string;
  personalAccessToken: string;
  userEmail: string;
}

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export async function activate(context: vscode.ExtensionContext) {
  // Use the console to output diagnostic information (console.log) and errors (console.error)
  // This line of code will only be executed once when your extension is activated
  // console.log('Congratulations, your extension "test" is now active!');

  const userData: UserData = {
    orgUrl: "",
    personalAccessToken: "",
    userEmail: "",
  };
  if (
    vscode.workspace.getConfiguration("azureDevOpsTest").get("orgUrl") === ""
  ) {
    userData.orgUrl = (await vscode.window.showInputBox({
      prompt: "Enter Azure DevoOps Organization Url",
      ignoreFocusOut: true,
    })) as string;
    vscode.workspace
      .getConfiguration("azureDevOpsTest")
      .update("orgUrl", userData.orgUrl);
  }
  if (
    vscode.workspace
      .getConfiguration("azureDevOpsTest")
      .get("personalAccessToken") === ""
  ) {
    userData.personalAccessToken = (await vscode.window.showInputBox({
      prompt: "Enter Azure DevoOps Personal Access Token",
      ignoreFocusOut: true,
    })) as string;
    vscode.workspace
      .getConfiguration("azureDevOpsTest")
      .update(
        "personalAccessToken",
        btoa(userData.personalAccessToken as string)
      );
  }
  if (
    vscode.workspace.getConfiguration("azureDevOpsTest").get("userEmail") === ""
  ) {
    userData.userEmail = (await vscode.window.showInputBox({
      prompt: "Enter Azure DevoOps user email",
      ignoreFocusOut: true,
    })) as string;
    vscode.workspace
      .getConfiguration("azureDevOpsTest")
      .update("userEmail", userData.userEmail);
  }

  console.log("userData", userData);
  console.log("conf", vscode.workspace.getConfiguration("azureDevOpsTest"));

  // The command has been defined in the package.json file
  // Now provide the implementation of the command with registerCommand
  // The commandId parameter must match the command field in package.json
  // let disposable = vscode.commands.registerCommand("test.helloWorld", () => {
  // The code you place here will be executed every time your command is executed
  // Display a message box to the user
  //   vscode.window.showInformationMessage("Hello World from test");
  // });
  // context.subscriptions.push(disposable);
  const treeDataProvider = new tasksProvider();
  const rootPath =
    vscode.workspace.workspaceFolders &&
    vscode.workspace.workspaceFolders.length > 0
      ? vscode.workspace.workspaceFolders[0].uri.fsPath
      : undefined;

  vscode.window.createTreeView("tasksExplorer", {
    treeDataProvider: treeDataProvider,
  });
  let refreshCommand = vscode.commands.registerCommand(
    "azureDevOpsTest.refreshEntry",
    () => {
      treeDataProvider.refreshEntries();
      vscode.window.showInformationMessage("Refreshed");
    }
  );
  const webviewprovider = new taskWebViewProvider(context.extensionUri);
  vscode.window.registerWebviewViewProvider("taskWebview", webviewprovider);
  let testItemCommand = vscode.commands.registerCommand(
    "azureDevOpsTest.testItem",
    (item: any) => {
      webviewprovider.getHtmlForWebview(item);
    }
  );
  context.subscriptions.push(refreshCommand);
  context.subscriptions.push(testItemCommand);
}

function updateWebviewContent(webview: vscode.Webview, item: any) {
  webview.html = item.description;
}

export async function createApiCall(
  orgUrl: string,
  personalAccessToken: string,
  userEmail: string
) {
  const azureDevOpsManager = new AzureDevOpsManager(
    orgUrl,
    personalAccessToken
  );

  azureDevOpsManager
    .getAssignedTasks(userEmail)
    .then((tasks) => {
      console.log("Assigned Tasks:", tasks);
    })
    .catch((err) => {
      console.error("Error retrieving assigned tasks:", err);
    });
}
// azureDevOpsManager
//   .getProjects()
//   .then((projects) => {
//     console.log("Projects:", projects);
//   })
//   .catch((err) => {
//     console.error("Error retrieving projects:", err);
//   });

// This method is called when your extension is deactivated
export function deactivate() {}
function getWebviewContent(item: any): string {
  throw new Error("Function not implemented.");
}
