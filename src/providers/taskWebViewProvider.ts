import * as vscode from "vscode";

export class taskWebViewProvider implements vscode.WebviewViewProvider {
  public static readonly viewType = "taskWebview";

  private _view?: vscode.WebviewView;

  constructor(private readonly _extensionUri: vscode.Uri) {}

  public resolveWebviewView(
    webviewView: vscode.WebviewView,
    context: vscode.WebviewViewResolveContext,
    _token: vscode.CancellationToken
  ) {
    this._view = webviewView;

    webviewView.webview.options = {
      // Allow scripts in the webview
      enableScripts: true,

      localResourceRoots: [this._extensionUri],
    };
  }
  public async getHtmlForWebview(data: any) {
    if (this._view) {
      this._view.webview.html = data.description;
    }
  }
}
