import * as azdev from "azure-devops-node-api";

export interface WorkItem {
  id: number;
  title: string;
  state: string;
  description?: string;
  project?: string;
  areaPath?: string;
  // Aggiungi altri campi se necessario
}

interface TeamProjectReference {
  id: string;
  name: string;
  description: string;
  url: string;
  state: string;
  revision: number;
  visibility: string;
  lastUpdateTime: Date;
}

class AzureDevOpsManager {
  private _orgUrl: string;
  private _personalAccessToken: string;
  private _connection: azdev.WebApi;

  constructor(orgUrl: string, personalAccessToken: string) {
    this._orgUrl = orgUrl;
    this._personalAccessToken = personalAccessToken;
    this._connection = this._getAzureDevOpsConnection();
  }

  private _getAzureDevOpsConnection(): azdev.WebApi {
    const authHandler = azdev.getPersonalAccessTokenHandler(
      this._personalAccessToken
    );
    return new azdev.WebApi(this._orgUrl, authHandler);
  }

  async getAssignedTasks(userId: string): Promise<WorkItem[]> {
    console.log("connection", this._connection);
    try {
      const workItemTrackingApi = await this._connection.getWorkItemTrackingApi(this._orgUrl);
      const query = `SELECT [System.Id], [System.Title], [System.State] FROM workitems LIMIT 100`;
      const workItems = await workItemTrackingApi.queryByWiql({ query: query });

      if (workItems && workItems.workItems) {
        const workItemRefs = workItems.workItems;
        const workItemIds = workItemRefs
          .map((ref) => ref.id!)
          .filter((id) => id !== undefined) as number[];

        const detailedWorkItems = await workItemTrackingApi.getWorkItems(
          workItemIds
        );
        return detailedWorkItems.map((item) => ({
          id: item.id!,
          title:
            item.fields && item.fields["System.Title"]
              ? item.fields["System.Title"]
              : "N/A",
          state:
            item.fields && item.fields["System.State"]
              ? item.fields["System.State"]
              : "N/A",
          description: item.fields && item.fields["System.Description"],
          project: item.fields && item.fields["System.TeamProject"],
          areaPath: item.fields && item.fields["System.AreaPath"],
          // Aggiungi altri campi se necessario
        }));
      }
      return [];
    } catch (error) {
      console.error("Error retrieving assigned tasks:", error);
      throw error;
    }
  }

  async getProjects(): Promise<TeamProjectReference[]> {
    try {
      const coreApi = await this._connection.getCoreApi();
      const projects = await coreApi.getProjects();
      console.log("projects", projects);
      return projects as unknown as TeamProjectReference[]; // Add type assertion to match the local interface definition
    } catch (error) {
      console.error("Error retrieving projects:", error);
      throw error;
    }
  }
}

export default AzureDevOpsManager;
