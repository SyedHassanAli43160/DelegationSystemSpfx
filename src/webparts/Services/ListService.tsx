// import { WebPartContext } from "@microsoft/sp-webpart-base";
// import { IApplication } from '../../Interfaces/IApplication'; // Adjust the path as necessary
// import { SPHttpClient, SPHttpClientResponse } from '@microsoft/sp-http';

// export class DataService {
//   private context: WebPartContext;
//   private listName: string;

//   constructor(context: WebPartContext) {
//     this.context = context;
//     this.listName = "Applications"; // SharePoint list name
//   }

//   public async getApplications(): Promise<IApplication[]> {
//     try {
//       const baseUri = this.context.pageContext.web.absoluteUrl;
//       const response: SPHttpClientResponse = await this.context.spHttpClient.get(
//         `${baseUri}/_api/web/lists/GetByTitle('${this.listName}')/items`,
//         SPHttpClient.configurations.v1
//       );

//       if (!response.ok) {
//         throw new Error(`Error fetching applications: ${response.statusText}`);
//       }

//       const data = await response.json();
//       return data.value.map((item: IApplication) => ({
//         Id: item.Id,
//         ApplicationName: item.ApplicationName,
//         DataSource: item.DataSource,
//         Table1Name: item.Table1Name,
//         Column1Name: item.Column1Name,
//         Table2Name: item.Table2Name,
//         Column2Name: item.Column2Name
//       }));
//     } catch (error) {
//       console.error("Error fetching applications:", error);
//       throw error;
//     }
//   }

//   public async createApplication(application: IApplication): Promise<IApplication> {
//     try {
//       const baseUri = this.context.pageContext.web.absoluteUrl;
//       const response: SPHttpClientResponse = await this.context.spHttpClient.post(
//         `${baseUri}/_api/web/lists/GetByTitle('${this.listName}')/items`,
//         SPHttpClient.configurations.v1,
//         {
//           headers: {
//             'Accept': 'application/json;odata=nometadata',
//             'Content-type': 'application/json;odata=nometadata',
//             'odata-version': ''
//           },
//           body: JSON.stringify(application)
//         }
//       );

//       if (!response.ok) {
//         throw new Error(`Error creating application: ${response.statusText}`);
//       }

//       const data = await response.json();
//       return data;
//     } catch (error) {
//       console.error("Error creating application:", error);
//       throw error;
//     }
//   }

//   public async updateApplication(application: IApplication): Promise<void> {
//     try {
//       const baseUri = this.context.pageContext.web.absoluteUrl;
//       const response: SPHttpClientResponse = await this.context.spHttpClient.post(
//         `${baseUri}/_api/web/lists/GetByTitle('${this.listName}')/items(${application.Id})`,
//         SPHttpClient.configurations.v1,
//         {
//           headers: {
//             'Accept': 'application/json;odata=nometadata',
//             'Content-type': 'application/json;odata=nometadata',
//             'odata-version': '',
//             'IF-MATCH': '*',
//             'X-HTTP-Method': 'MERGE'
//           },
//           body: JSON.stringify(application)
//         }
//       );

//       if (!response.ok) {
//         throw new Error(`Error updating application: ${response.statusText}`);
//       }
//     } catch (error) {
//       console.error("Error updating application:", error);
//       throw error;
//     }
//   }

//   public async deleteApplication(applicationId: number): Promise<void> {
//     try {
//       const baseUri = this.context.pageContext.web.absoluteUrl;
//       const response: SPHttpClientResponse = await this.context.spHttpClient.post(
//         `${baseUri}/_api/web/lists/GetByTitle('${this.listName}')/items(${applicationId})`,
//         SPHttpClient.configurations.v1,
//         {
//           headers: {
//             'Accept': 'application/json;odata=nometadata',
//             'Content-type': 'application/json;odata=nometadata',
//             'odata-version': '',
//             'IF-MATCH': '*',
//             'X-HTTP-Method': 'DELETE'
//           }
//         }
//       );

//       if (!response.ok) {
//         throw new Error(`Error deleting application: ${response.statusText}`);
//       }
//     } catch (error) {
//       console.error("Error deleting application:", error);
//       throw error;
//     }
//   }
// }
