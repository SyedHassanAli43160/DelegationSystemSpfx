import { WebPartContext } from "@microsoft/sp-webpart-base";
import { IApplicationRegisteration } from '../../ListInterfaces/Appregisteration';
import { SPHttpClient, SPHttpClientResponse } from '@microsoft/sp-http';

export class DataService {
  private listName: string;
  private context: WebPartContext;

  constructor(context: WebPartContext) {
    this.listName = "Getz-Applications"; // SharePoint list name
    this.context = context;
  }

  // Method to get applications from the SharePoint list
  public async getApplications(): Promise<IApplicationRegisteration[]> {
    try {
      const baseUri = this.context.pageContext.web.absoluteUrl;
      // const baseUri="https://getzpharma.sharepoint.com/sites/GetPortalData";
      const response: SPHttpClientResponse = await this.context.spHttpClient.get(
        `${baseUri}/_api/web/lists/GetByTitle('${this.listName}')/items`,
        SPHttpClient.configurations.v1
      );

      if (!response.ok) {
        throw new Error(`Error fetching applications: ${response.statusText}`);
      }

      const data = await response.json();
      return data.value.map((item: any) => ({
        Id: item.Id,
        ApplicationName: item.ApplicationName,
        tablename: item.tablename,
        colname: item.colname,
        childtable: item.childtable,
        childcol: item.childcol,
        ColStatus: item.ColStatus,
        ChildColStatus: item.ChildColStatus,
        Active: item.Active,
        AppUrl: item.AppUrl,
        PrevAssigneeColName: item.PrevAssigneeColName,
        PrevAssigneeColNameChild: item.PrevAssigneeColNameChild,
        datasourceType: item.datasourceType,
        dv_primaryEntityName: item.dv_primaryEntityName,
        dv_relationshipName: item.dv_relationshipName,
        dv_environmentUrl: item.dv_environmentUrl,
        sql_ServerName: item.sql_ServerName,
        sql_DatabaseName: item.sql_DatabaseName,
        sql_SchemaName: item.sql_SchemaName,
        sql_Username: item.sql_Username,
        sql_Password: item.sql_Password,
        sql_ApiUrl: item.sql_ApiUrl,
        sql_ApiUserName:item.sql_ApiUserName,
        sql_ApiPassword:item.sql_ApiPassword,
        sp_ListSiteUrl: item.sp_ListSiteUrl,
        Api_method: item.Api_method,
        Api_url: item.Api_url,
        Api_querystring: item.Api_querystring,
        Api_body: item.Api_body,
        Api_headers: item.Api_headers,
        Api_authentication: item.Api_authentication,
        Api_username: item.Api_username,
        Api_password: item.Api_password,
        MyPending_Api_method: item.MyPending_Api_method,
        MyPending_Api_url: item.MyPending_Api_url,
        MyPending_Api_querystring: item.MyPending_Api_querystring,
        MyPending_Api_body: item.MyPending_Api_body,
        MyPending_Api_headers: item.MyPending_Api_headers,
      }));
    } catch (error) {
      console.error("Error fetching applications:", error);
      throw error;
    }
  } 

  // Create Application method
  public async createApplication(application: Omit<IApplicationRegisteration, 'Id'>): Promise<IApplicationRegisteration> {
    try {
      const payload = {
        ApplicationName: application.ApplicationName,
        tablename: application.tablename,
        colname: application.colname,
        childtable: application.childtable,
        childcol: application.childcol,
        AppUrl: application.AppUrl,
        Active: true,
        ColStatus: application.ColStatus,
        ChildColStatus: application.ChildColStatus,
        PrevAssigneeColName: application.PrevAssigneeColName,
        PrevAssigneeColNameChild: application.PrevAssigneeColNameChild,

        datasourceType: application.datasourceType,
        dv_primaryEntityName: application.dv_primaryEntityName,
        dv_relationshipName: application.dv_relationshipName,
        dv_environmentUrl: application.dv_environmentUrl,
        sql_ServerName: application.sql_ServerName,
        sql_DatabaseName: application.sql_DatabaseName,
        sql_SchemaName: application.sql_SchemaName,
        sql_Username: application.sql_Username,
        sql_Password: application.sql_Password,
        sql_ApiUrl: application.sql_ApiUrl,
        sql_ApiUserName:application.sql_ApiUserName,
        sql_ApiPassword:application.sql_ApiPassword,
        sp_ListSiteUrl: application.sp_ListSiteUrl,
        Api_method: application.Api_method,
        Api_url: application.Api_url,
        Api_querystring: application.Api_querystring,
        Api_body: application.Api_body,
        Api_headers: application.Api_headers,
        Api_authentication: application.Api_authentication,
        Api_username: application.Api_username,
        Api_password: application.Api_password,
        MyPending_Api_method: application.MyPending_Api_method,
        MyPending_Api_url: application.MyPending_Api_url,
        MyPending_Api_querystring: application.MyPending_Api_querystring,
        MyPending_Api_body: application.MyPending_Api_body,
        MyPending_Api_headers: application.MyPending_Api_headers,

      };
      const baseUri = this.context.pageContext.web.absoluteUrl;
      // const baseUri="https://getzpharma.sharepoint.com/sites/GetPortalData";
      const response: SPHttpClientResponse = await this.context.spHttpClient.post(
        `${baseUri}/_api/web/lists/GetByTitle('${this.listName}')/items`,
        SPHttpClient.configurations.v1,
        {
          method: 'POST',
          headers: {
            'Accept': 'application/json;odata=nometadata',
            'Content-type': 'application/json;odata=nometadata',
            'odata-version': ''
          },
          body: JSON.stringify(payload)
        }
      );

      if (!response.ok) {
        const errorDetails = await response.text();
        console.error("Error details:", errorDetails);
        throw new Error(`Error creating application: ${response.statusText}, Details: ${errorDetails}`);
      }

      const responseData = await response.json();
      return responseData;
    } catch (error) {
      console.error("Error creating application:", error);
      throw error;
    }
  }


  // Update Application method
  public async updateApplication(application: IApplicationRegisteration): Promise<void> {
    try {
      // const baseUri="https://getzpharma.sharepoint.com/sites/GetPortalData";
      const baseUri = this.context.pageContext.web.absoluteUrl;
      const response: SPHttpClientResponse = await this.context.spHttpClient.post(
        `${baseUri}/_api/web/lists/GetByTitle('${this.listName}')/items(${application.Id})`,
        SPHttpClient.configurations.v1,
        {
          headers: {
            'Accept': 'application/json;odata=nometadata',
            'Content-type': 'application/json;odata=nometadata',
            'odata-version': '',
            'IF-MATCH': '*',
            'X-HTTP-Method': 'MERGE'
          },
          body: JSON.stringify(application)
        }
      );

      if (!response.ok) {
        throw new Error(`Error updating application: ${response.statusText}`);
      }
    } catch (error) {
      console.error("Error updating application:", error);
      throw error;
    }
  }

  // Delete Application method
  public async deleteApplication(applicationId: number): Promise<void> {
    try {
      const baseUri = this.context.pageContext.web.absoluteUrl;
      // const baseUri="https://getzpharma.sharepoint.com/sites/GetPortalData";
      const response: SPHttpClientResponse = await this.context.spHttpClient.post(
        `${baseUri}/_api/web/lists/GetByTitle('${this.listName}')/items(${applicationId})`,
        SPHttpClient.configurations.v1,
        {
          headers: {
            'Accept': 'application/json;odata=nometadata',
            'Content-type': 'application/json;odata=nometadata',
            'odata-version': '',
            'IF-MATCH': '*',
            'X-HTTP-Method': 'DELETE'
          }
        }
      );

      if (!response.ok) {
        throw new Error(`Error deleting application: ${response.statusText}`);
      }
    } catch (error) {
      console.error("Error deleting application:", error);
      throw error;
    }
  }
}
