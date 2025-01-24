import { WebPartContext } from "@microsoft/sp-webpart-base";
import { IDelegation, IDelegationDetails } from "../../ListInterfaces/DelegationInterface"; // Ensure correct import path
import { SPHttpClient, SPHttpClientResponse } from '@microsoft/sp-http';

export class DelegationService {
  private context: WebPartContext;

  constructor(context: WebPartContext) {
    this.context = context;
  }

  public async createDelegation(delegation: Omit<IDelegation, 'Id'>): Promise<IDelegation> {
    try {
      // const baseUri="https://getzpharma.sharepoint.com/sites/GetPortalData";

      const baseUri = this.context.pageContext.web.absoluteUrl;
      const response: SPHttpClientResponse = await this.context.spHttpClient.post(
        `${baseUri}/_api/web/lists/GetByTitle('Getz-Delegations')/items`,
            SPHttpClient.configurations.v1,
     { method: 'POST',
      headers: {
        'Accept': 'application/json;odata=nometadata',
        'Content-type': 'application/json;odata=nometadata',
         'odata-version': ''
      },
          body: JSON.stringify({
            EndDate: delegation.EndDate,
            StartDate: delegation.StartDate,
            ApplyToExistingTasks: delegation.ApplyToExistingTasks,
            DelegateById:delegation.DelegateBy
          })
        }
      );

      if (!response.ok) {
        const errorDetails = await response.text();
        throw new Error(`Error creating delegation: ${response.statusText}, Details: ${errorDetails}`);
      }

      const data = await response.json();

      return data.Id;
    } catch (error) {
      console.error("Error creating delegation:", error);
      throw error;
    }
  }

 
 
  public async createDelegationDetail(delegationDetail: IDelegationDetails): Promise<any> {
    try {
      const baseUri = this.context.pageContext.web.absoluteUrl;
      // const baseUri="https://getzpharma.sharepoint.com/sites/GetPortalData";

      // Construct the request URL
      const requestUrl = `${baseUri}/_api/web/lists/GetByTitle('Getz-DelegationDetails')/items`;
  
      // Construct the request body
      const requestBody = {
        DelegationId: delegationDetail.DelegationId,
        ApplicationId: delegationDetail.ApplicationId,
        DelegateToId: delegationDetail.DelegateTo, // Assuming DelegateTo contains the necessary ID
      };
  
      // Log the request body for debugging
      console.debug("Request body:", requestBody);
  
      // Make the HTTP POST request
      const response: SPHttpClientResponse = await this.context.spHttpClient.post(
        requestUrl,
        SPHttpClient.configurations.v1,
        {
          headers: {
            'Accept': 'application/json;odata=nometadata',
            'Content-Type': 'application/json;odata=nometadata',  
            'OData-Version': '',
          },
          body: JSON.stringify(requestBody),
        }
      );
  
      // Check for HTTP response success
      if (!response.ok) {
        const errorDetails = await response.text();
        throw new Error(
          `Failed to create delegation detail. Status: ${response.status} - ${response.statusText}. Details: ${errorDetails}`
        );
      }
  
      // Parse the response data
      const data = await response.json();
  
      return data.d; // Assuming `data.d` contains the desired response
    } catch (error) {
      // Log and rethrow the error for further handling
      console.error("Error creating delegation detail:", error);
      throw error;
    }
  }
  

  public async getDelegationsForCurrentUser(): Promise<Array<{ DelegateTo: number; StartDate: Date; EndDate: Date }>> {
    try {
      const baseUri = this.context.pageContext.web.absoluteUrl;
      // const baseUri="https://getzpharma.sharepoint.com/sites/GetPortalData";

      const currentUserId = this.context.pageContext.legacyPageContext.userId;
  
      // Step 1: Get delegations created by the current user
      const delegationsResponse = await this.context.spHttpClient.get(
        `${baseUri}/_api/web/lists/GetByTitle('Getz-Delegations')/items?$filter=DelegateBy eq ${currentUserId}`,
        SPHttpClient.configurations.v1
      );
  
      if (!delegationsResponse.ok) {
        const errorDetails = await delegationsResponse.text();
        throw new Error(
          `Error fetching delegations. Status: ${delegationsResponse.status} - ${delegationsResponse.statusText}. Details: ${errorDetails}`
        );
      }
  
      const delegationsData = await delegationsResponse.json();
      const delegations: IDelegation[] = delegationsData.value;
  
      const delegationIds = delegations.map((d) => d.Id);
  
      // Step 2: Get related delegation details using delegation IDs
      const delegationDetailsResponse = await this.context.spHttpClient.get(
        `${baseUri}/_api/web/lists/GetByTitle('Getz-DelegationDetails')/items?$filter=(${delegationIds
          .map((id) => `DelegationId eq ${id}`)
          .join(" or ")})`,
        SPHttpClient.configurations.v1
      );
  
      if (!delegationDetailsResponse.ok) {
        const errorDetails = await delegationDetailsResponse.text();
        throw new Error(
          `Error fetching delegation details. Status: ${delegationDetailsResponse.status} - ${delegationDetailsResponse.statusText}. Details: ${errorDetails}`
        );
      }
  
      const delegationDetailsData = await delegationDetailsResponse.json();
      const delegationDetails: any[] = delegationDetailsData.value;
  
      const results = delegationDetails.map((detail) => {
        const matchingDelegation = delegations.find((d) => d.Id === detail.DelegationId);
        return {
          DelegateTo: detail.DelegateToId,
          StartDate: matchingDelegation?.StartDate instanceof Date
            ? matchingDelegation.StartDate
            : new Date(matchingDelegation?.StartDate || ""),
          EndDate: matchingDelegation?.EndDate instanceof Date
            ? matchingDelegation.EndDate
            : new Date(matchingDelegation?.EndDate || ""),
        };
      });
  
      return results;
    } catch (error) {
      console.error("Error fetching delegations and details:", error);
      throw error;
    }
  }
  
  
}