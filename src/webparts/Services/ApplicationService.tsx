import { WebPartContext } from "@microsoft/sp-webpart-base";
import { IApplication } from '../../Interfaces/IApplication';
import { PublicClientApplication, AuthenticationResult } from '@azure/msal-browser';
import { msalConfig, loginRequest } from '../../Config/msalConfig';

export class DataService {
  private entityName: string;
  private msalInstance: PublicClientApplication;
  private isInitialized: boolean = false;

  constructor(context: WebPartContext) {
    this.entityName = "crabd_getzapplications"; // Dataverse entity name
    this.msalInstance = new PublicClientApplication(msalConfig);
  }

  private async initialize(): Promise<void> {
    if (!this.isInitialized) {
      await this.msalInstance.initialize();
      this.isInitialized = true;
    }
  }

  private async getAccessToken(): Promise<string> {
    await this.initialize();
    try {
      const accounts = this.msalInstance.getAllAccounts();
      if (accounts.length === 0) {
        const loginResponse: AuthenticationResult = await this.msalInstance.loginPopup(loginRequest);
        return loginResponse.accessToken;
      } else {
        const tokenResponse: AuthenticationResult = await this.msalInstance.acquireTokenSilent({
          ...loginRequest,
          account: accounts[0]
        });
        return tokenResponse.accessToken;
      }
    } catch (error) {
      console.error("Error acquiring access token:", error);
      throw error;
    }
  }

  private mapToDataverseFormat(application: IApplication): any {
    let payload: any = {
      crabd_applicationname: application.crabd_applicationname,
      crabd_datasourcetype: application.crabd_datasourcetype,
      crabd_tablename: application.crabd_tablename || null,
      crabd_colname: application.crabd_colname || null,
      crabd_childtable: application.crabd_childtable || null,
      crabd_childcol: application.crabd_childcol || null,
      crabd_appurl:application.crabd_appurl
    };
  
    switch (application.crabd_datasourcetype) {
      case 'Dataverse':
        payload.crabd_dv_primaryentityname = application.crabd_dv_primaryentityname || null;
        payload.crabd_dv_relationshipname = application.crabd_dv_relationshipname || null;
        payload.crabd_dv_environmenturl = application.crabd_dv_environmenturl || null;
        break;
      case 'SQL':
        payload.crabd_sql_servername = application.crabd_sql_servername || null;
        payload.crabd_sql_databasename = application.crabd_sql_databasename || null;
        payload.crabd_sql_schemaname = application.crabd_sql_schemaname || null;
        payload.crabd_sql_username = application.crabd_sql_username || null;
        payload.crabd_sql_password = application.crabd_sql_password || null;
        break;
      case 'SPList':
        payload.crabd_sp_listsiteurl = application.crabd_sp_listsiteurl || null;
        break;
      case 'API':
        payload.crabd_api_method = application.crabd_api_method || null;
        payload.crabd_api_url = application.crabd_api_url || null;
        payload.crabd_api_screentype = application.crabd_api_screentype || null;
        payload.crabd_api_querystring = application.crabd_api_querystring || null;
        payload.crabd_api_body = application.crabd_api_body || null;
        payload.crabd_api_headers = application.crabd_api_headers || null;
        payload.crabd_api_authentication = application.crabd_api_authentication || null;
        payload.crabd_api_username = application.crabd_api_username || null;
        payload.crabd_api_password = application.crabd_api_password || null;
        break;
      default:
        throw new Error("Invalid data source type");
    }
  
    return payload;
  }
  
  public async createApplication(application: Omit<IApplication, 'crabd_getzapplicationid'>): Promise<IApplication> {
    try {
      const accessToken = await this.getAccessToken();
      const payload = this.mapToDataverseFormat(application);
      console.log("Payload:", payload); // Log the payload
  
      const response = await fetch(
        `https://orge6d50e70.crm5.dynamics.com/api/data/v9.2/${this.entityName}`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(payload)
        }
      );
  
      if (!response.ok) {
        const errorDetails = await response.text();
        console.error("Error details:", errorDetails);
        throw new Error(`Error creating application: ${response.statusText}, Details: ${errorDetails}`);
      }
  
      const responseText = await response.text();
      console.log("Raw response:", responseText);
      if (!responseText) {
        // Handle empty response body
        return {
          ...application,
          crabd_getzapplicationid: "GeneratedID" // Use a placeholder or another method to get the ID
        };
      }
  
      let data;
      try {
        data = JSON.parse(responseText);
      } catch (error) {
        console.error("Error parsing JSON:", error);
        throw new Error("Invalid JSON response");
      }
  
      return {
        ...application,
        crabd_getzapplicationid: data.crabd_getzapplicationid
      };
    } catch (error) {
      console.error("Error creating application:", error);
      throw error;
    }
  }
  
  
  

  public async getApplications(): Promise<IApplication[]> {
    try {
      const accessToken = await this.getAccessToken();
      const response = await fetch(
        `https://orge6d50e70.crm5.dynamics.com/api/data/v9.2/${this.entityName}`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          }
        }
      );
  
      if (!response.ok) {
        const errorDetails = await response.text();
        throw new Error(`Error fetching applications: ${response.statusText}, Details: ${errorDetails}`);
      }
  
      const data = await response.json();
      
      return data.value.map((item: any): IApplication => ({
        crabd_getzapplicationid: item.crabd_getzapplicationid,
        crabd_applicationname: item.crabd_applicationname,
        crabd_datasourcetype: item.crabd_datasourcetype,
        crabd_appurl:item.crabd_appurl,
        // Include the new fields in the mapping
        crabd_tablename: item.crabd_tablename,
        crabd_colname: item.crabd_colname,
        crabd_childtable: item.crabd_childtable,
        crabd_childcol: item.crabd_childcol,
      
        // Conditional mapping based on the data source type
        ...(item.crabd_datasourcetype === 'Dataverse' && {
          crabd_dv_primaryentityname: item.crabd_dv_primaryentityname,
          crabd_dv_relationshipname: item.crabd_dv_relationshipname,
          crabd_dv_environmenturl: item.crabd_dv_environmenturl,
        }),
      
        ...(item.crabd_datasourcetype === 'SQL' && {
          crabd_sql_servername: item.crabd_sql_servername,
          crabd_sql_databasename: item.crabd_sql_databasename,
          crabd_sql_schemaname: item.crabd_sql_schemaname,
          crabd_sql_username: item.crabd_sql_username,
          crabd_sql_password: item.crabd_sql_password,
        }),
      
        ...(item.crabd_datasourcetype === 'SPList' && {
          crabd_sp_listsiteurl: item.crabd_sp_listsiteurl,
          crabd_sp_listname: item.crabd_sp_listname,
          crabd_sp_listidcolumn: item.crabd_sp_listidcolumn,
        }),
        ...(item.crabd_datasourcetype === 'API' && {
          crabd_api_method: item.crabd_api_method,
          crabd_api_url: item.crabd_api_url,
          crabd_api_screentype: item.crabd_api_screentype,
          crabd_api_querystring:item.crabd_api_querystring,
          crabd_api_body:item.crabd_api_body,
          crabd_api_headers:item.crabd_api_headers,
          crabd_api_authentication:item.crabd_api_authentication,
          crabd_api_username:item.crabd_api_username,
          crabd_api_password:item.crabd_api_password
        }),
      }));
    } catch (error) {
      console.error("Error fetching applications:", error);
      throw error;
    }
  }
  

 

  public async updateApplication(application: IApplication): Promise<void> {
    try {
      const accessToken = await this.getAccessToken();
      const payload = this.mapToDataverseFormat(application);

      const response = await fetch(
        `https://orge6d50e70.crm5.dynamics.com/api/data/v9.2/${this.entityName}(${application.crabd_getzapplicationid})`,
        {
          method: 'PATCH',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'If-Match': '*'
          },
          body: JSON.stringify(payload)
        }
      );

      if (!response.ok) {
        const errorDetails = await response.text();
        throw new Error(`Error updating application: ${response.statusText}, Details: ${errorDetails}`);
      }
    } catch (error) {
      console.error("Error updating application:", error);
      throw error;
    }
  }

  public async deleteApplication(getzapplicationid: string): Promise<void> {
    try {
      const accessToken = await this.getAccessToken();
      const response = await fetch(
        `https://orge6d50e70.crm5.dynamics.com/api/data/v9.2/${this.entityName}(${getzapplicationid})`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'If-Match': '*'
          }
        }
      );

      if (!response.ok) {
        const errorDetails = await response.text();
        throw new Error(`Error deleting application: ${response.statusText}, Details: ${errorDetails}`);
      }
    } catch (error) {
      console.error("Error deleting application:", error);
      throw error;
    }
  }
}