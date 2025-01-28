import { WebPartContext } from "@microsoft/sp-webpart-base";
import { SPHttpClient } from "@microsoft/sp-http";
import { IMyPending } from "../../ListInterfaces/IMyPending";
import {decryptString} from "./EncryptionService";

interface IMyPendingApiBody {
  assignTo?: string;
  childtable?: string;
  childcol?: string;
}

export class TaskService {
  private context: WebPartContext;

  constructor(context: WebPartContext) {
    this.context = context;
  }

  /**
   * Fetch tasks for the current user
   */
  public async fetchTasksForUser(): Promise<Record<string, IMyPending[]>> {
    try {
      const currentUser = await this.getCurrentUser();
      const applications = await this.getApplications();
      
      const groupedTasks: Record<string, IMyPending[]> = {};

      // Process all applications in parallel
      const taskPromises = applications.map((app) =>
        this.fetchTasksForApplication(app, currentUser)
      );

      const allTasks = await Promise.all(taskPromises);

      // Merge all tasks into groupedTasks
      allTasks.forEach((tasks, index) => {
        const appName = applications[index].ApplicationName;
        if (!groupedTasks[appName]) {
          groupedTasks[appName] = [];
        }
        groupedTasks[appName].push(...tasks);
      });

      return groupedTasks;
    } catch (error) {
      console.error("Error fetching tasks:", error);
      throw error;
    }
  }

  /**
   * Get current user details
   */
  private async getCurrentUser(): Promise<{ Id: number; Email: string }> {
    // const baseUri="https://getzpharma.sharepoint.com/sites/GetPortalData";

    const baseUri = this.context.pageContext.web.absoluteUrl;
    const response = await this.context.spHttpClient.get(
      `${baseUri}/_api/web/currentuser`,
      SPHttpClient.configurations.v1
    );

    if (!response.ok) {
      throw new Error(`Error fetching current user: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Fetch active applications
   */
  private async getApplications(): Promise<any[]> {
    const baseUri = this.context.pageContext.web.absoluteUrl;
    // const baseUri="https://getzpharma.sharepoint.com/sites/GetPortalData";

    const response = await this.context.spHttpClient.get(
      `${baseUri}/_api/web/lists/GetByTitle('Getz-Applications')/items?$filter=Active eq 1`,
      SPHttpClient.configurations.v1
    );

    if (!response.ok) {
      throw new Error(`Error fetching applications: ${response.statusText}`);
    }

    const data = await response.json();
    return data.value;
  }

  /**
   * Fetch tasks for a specific application
   */
  private async fetchTasksForApplication(
    app: any,
    currentUser: { Id: number; Email: string }
  ): Promise<IMyPending[]> {
    let tasks: IMyPending[] = [];

    // Attempt to fetch tasks from each data source
    try {
      switch (app.datasourceType) {
        case "SPList":
          tasks = await this.fetchSPListTasks(app, currentUser);
          break;
        case "SQL":
          tasks = await this.fetchSQLTasks(app, currentUser);
          break;
        case "API":
          tasks = await this.fetchAPITasks(app, currentUser);
          break;
        default:
          console.warn(`Unsupported datasourceType: ${app.datasourceType}`);
          break;
      }
    } catch (error) {
      console.warn(`Error fetching tasks for application ${app.ApplicationName}:`, error);
    }

    // Fallback to return empty array if no tasks could be fetched
    return tasks.length > 0 ? tasks : [];
  }


  /**
   * Fetch tasks from SharePoint List
   */
  private async fetchSPListTasks(app: any, currentUser: { Id: number }): Promise<IMyPending[]> {
    const listUrl = `${app.sp_ListSiteUrl}/_api/web/lists/GetByTitle('${app.tablename}')/items?$filter=${app.colname}/Id eq ${currentUser.Id} and Status eq 'Pending'`;

    const response = await this.context.spHttpClient.get(
      listUrl,
      SPHttpClient.configurations.v1
    );

    if (!response.ok) {
      console.warn(`Error fetching SPList tasks from ${app.tablename}: ${response.statusText}`);
      return [];
    }

    const data = await response.json();
    console.log(data);
    return data.value.map((item: any) => ({
      ID: item.Id,
      TaskName: item.Title,
      AssignDate: item.Created ? new Date(item.Created) : undefined,
      AssignBy: item.AssignBy,
      ApplicationName: app.ApplicationName,
      AppUrl: app.AppUrl,
    }));
  }

  /**
   * Fetch tasks from SQL API
   */
  private async fetchSQLTasks(app: any, currentUser: { Email: string }): Promise<IMyPending[]> {
    const payload = {
      assignto: currentUser.Email,
      childtable: app.childtable,
      childcol: app.childcol,
    };

    const response = await fetch(app.sql_ApiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Basic " + btoa(`${app.sql_ApiUserName}:${decryptString(app.sql_ApiPassword)}`), // Properly concatenate username and password
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      console.warn(`Error fetching SQL tasks from ${app.sql_ApiUrl}: ${response.statusText}`);
      return [];
    }

    const data = await response.json();
    return data.map((item: any) => ({
      ID: item.id,
      TaskName: item.taskName,
      AssignDate: item.created ? new Date(item.created) : undefined,
      AssignBy: item.assignBy,
      ApplicationName: app.ApplicationName,
      AppUrl: app.AppUrl,
    }));
  }

  /**
   * Fetch tasks from external API
   */
  private async fetchAPITasks(app: any, currentUser: { Email: string }): Promise<IMyPending[]> {
    let payload: IMyPendingApiBody = {};
    if (app.MyPending_Api_body) {
      try {
        payload = JSON.parse(app.MyPending_Api_body);
        payload.assignTo = currentUser.Email;
      } catch (error) {
        console.error("Error parsing API body:", error);
      }
    }

    const headers = app.MyPending_Api_headers
      ? JSON.parse(app.MyPending_Api_headers)
      : {};

    if (app.Api_authentication === "Basic") {
      headers["Authorization"] = "Basic " + btoa(`${app.Api_username}:${decryptString(app.Api_password)}`);
    }

    const requestOptions: RequestInit = {
      method: app.MyPending_Api_method || "GET",
      headers,
      body: app.MyPending_Api_method === "POST" ? JSON.stringify(payload) : undefined,
    };

    const apiUrl = `${app.MyPending_Api_url}?${app.MyPending_Api_querystring || ""}`;

    const response = await fetch(apiUrl, requestOptions);
    if (!response.ok) {
      console.warn(`Error fetching tasks from API ${apiUrl}: ${response.statusText}`);
      return [];
    }

    const data = await response.json();
    return data.map((item: any) => ({
      ID: item.id,
      TaskName: item.taskName,
      AssignDate: item.created ? new Date(item.created) : undefined,
      AssignBy: item.assignBy,
      ApplicationName: app.ApplicationName,
      AppUrl: app.AppUrl,
    }));
  }
}
