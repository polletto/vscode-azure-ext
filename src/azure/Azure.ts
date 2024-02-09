import axios from 'axios';
import * as vscode from "vscode";
import { getCurrentWeekNumber } from '../utils';

interface connetion {
    queryByWiql(arg0: { query: string; }): any;
}

export class AzureDevOpsAPI {
  private _orgUrl: string;
  private _personalAccessToken: string;
  private _baseUrl: string;
  private headers: any;
  constructor(organization: string, personalAccessToken: string) {
    this._orgUrl = organization;
    this._personalAccessToken = personalAccessToken;
    this._baseUrl = `${this._orgUrl}_apis/wit/wiql?api-version=6.0`;
    this.headers = {
      'Content-Type': 'application/json',
      'Authorization': `Basic ${Buffer.from(`:${this._personalAccessToken}`).toString('base64')}`
    };
  }

  async assignedWorkItems(week: string = "", team: string = "", email: string = "") {
    if (email === "") {
      email = vscode.workspace.getConfiguration("azureDevOpsTest").get("userEmail") ?? "";
    }
    if (week === "") {
      week = `Week ${getCurrentWeekNumber()} - ${new Date().getFullYear()}`;
    }
    if (team === "") {
      team = "B2C - Team Delivery";
    }
    const query = `SELECT [System.Id], [System.Title], [System.State] FROM workitems WHERE [System.AssignedTo] = '${email}' AND [System.iterationPath] = '${team}\\Week ${week} - ${new Date().getFullYear()}'`;
    try {
      const response = await axios.post(this._baseUrl, { query }, { headers: this.headers });
      const ids = response.data.workItems;
      console.log("ids", ids);
      const workItems = ids.map(async (id: any) => {
        const workItem = await axios.get(`${this._orgUrl}_apis/wit/workitems/${id.id}`, { headers: this.headers });
        let dd = {id: workItem.data.id, title: workItem.data.fields["System.Title"], state: workItem.data.fields["System.State"], description: workItem.data.fields["System.Description"], project: workItem.data.fields["System.TeamProject"], areaPath: workItem.data.fields["System.AreaPath"]};
        console.log("workItem", workItem.data);
        return dd;
      });
      const result = await Promise.all(workItems);
      return result;
    } catch (error: any) {
      throw new Error(`Error querying work items: ${error.message}`);
    }
  }
}

export class Azure {
    private _orgUrl: string;
    private _personalAccessToken: string;
    private _connection: connetion;

    constructor(orgUrl: string, personalAccessToken: string) {
        this._orgUrl = orgUrl;
        this._personalAccessToken = personalAccessToken;
        this.getBasicHandler("",this._personalAccessToken);
        this._connection = this;
    }

    private getBasicHandler(username: string, password: string, allowCrossOriginAuthentication?: boolean){
        let config = {
            method: 'POST',
            maxBodyLength: Infinity,
            url: this._orgUrl + '_apis/wit/wiql?api-version=6.0',
            headers: { 
              'Authorization': 'Basic ' + this._personalAccessToken
            }
          };
          
          axios.request(config)
          .then((response) => {
            console.log("response", JSON.stringify(response.data));
          })
          .catch((error) => {
            console.log("error", error);
          });
        
    }

    public async getTasksByUser(userId: string) {
        const query = "SELECT [System.Id], [System.Title], [System.State] FROM workitems WHERE [System.AssignedTo] = 's.rossi@sintraconsulting.eu' AND [System.iterationPath] = 'B2C - Team Delivery\\Week 3 - 2024'";
        const workItems = await this._connection.queryByWiql({ query: query });
        return workItems;
    }

    queryByWiql(arg0: { query: string; }) {
        
    }
}