// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from "vscode";
import AzureDevOpsManager from "./azure/AzureDevOpsManager";

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
  // Use the console to output diagnostic information (console.log) and errors (console.error)
  // This line of code will only be executed once when your extension is activated
  console.log('Congratulations, your extension "test" is now active!');

  // The command has been defined in the package.json file
  // Now provide the implementation of the command with registerCommand
  // The commandId parameter must match the command field in package.json
  let disposable = vscode.commands.registerCommand("test.helloWorld", () => {
    // The code you place here will be executed every time your command is executed
    // Display a message box to the user
    vscode.window.showInformationMessage("Hello World from testONE!090");
  });

  let command = vscode.commands.registerCommand("test.apiCall", async () => {
    const userData = {
      orgUrl: "",
      personalAccessToken: "",
      userEmail: "",
    };

    userData.orgUrl =
      (await vscode.window.showInputBox({
        prompt: "Enter Azure DevoOps Organization Url",
        ignoreFocusOut: true,
      })) ?? "";

    userData.personalAccessToken =
      (await vscode.window.showInputBox({
        prompt: "Enter Azure DevoOps Personal Access Token",
        ignoreFocusOut: true,
      })) ?? "";
    userData.userEmail =
      (await vscode.window.showInputBox({
        prompt: "Enter Azure DevoOps user email",
        ignoreFocusOut: true,
      })) ?? "";

    if (userData.orgUrl && userData.personalAccessToken && userData.userEmail) {
      await createApiCall(
        userData.orgUrl,
        userData.personalAccessToken,
        userData.userEmail
      );
    }
  });
  context.subscriptions.push(disposable);
  context.subscriptions.push(command);
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
