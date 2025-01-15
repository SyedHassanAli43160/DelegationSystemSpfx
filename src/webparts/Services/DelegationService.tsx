import { WebPartContext } from "@microsoft/sp-webpart-base";
import { IDelegation, IDelegationDetails } from "../../Interfaces/DelegationInterFaces"; // Ensure correct import path
import { tokenService } from "../Services/AuthTokenService";

export class DelegationService {
 

  constructor(context: WebPartContext) {
   
  }

  

  public async createDelegation(delegation: Omit<IDelegation, 'crabd_delegationfrom'>): Promise<IDelegation> {
    try {
      console.log("Delegation Data:"+delegation);
      const accessToken = await tokenService.getAccessToken();
            console.log("Token:"+accessToken);
      const response = await fetch(
        `https://orge6d50e70.crm5.dynamics.com/api/data/v9.2/crabd_getzdelegations`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Prefer': 'return=representation'
          },
          body: JSON.stringify(delegation)
        }
      );
  
      // Check for response body before parsing JSON
      if (!response.ok) {
        const errorDetails = await response.text();
        throw new Error(`Error creating delegation: ${response.statusText}, Details: ${errorDetails}`);
      }
  
      const text = await response.text();
      const data = text ? JSON.parse(text) : {}; // Only parse if there is a response body
      console.log("Created delegation data:", data);
  
      return data;
    } catch (error) {
      console.error("Error creating delegation:", error);
      throw error;
    }
  }
  
  public async createDelegationDetail(delegationDetail: Omit<IDelegationDetails, 'crabd_newcolumn'>): Promise<IDelegationDetails> {
    try {
      const accessToken = await tokenService.getAccessToken();

      const response = await fetch(
        `https://orge6d50e70.crm5.dynamics.com/api/data/v9.2/crabd_getzdelegationdetailses`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(delegationDetail)
        }
      );
  
      if (!response.ok) {
        const errorDetails = await response.text();
        throw new Error(`Error creating delegation detail: ${response.statusText}, Details: ${errorDetails}`);
      }
  
      const text = await response.text();
      const data = text ? JSON.parse(text) : {}; // Only parse if there is a response body
      console.log("Created delegation detail data:", data);
  
      return data;
    } catch (error) {
      console.error("Error creating delegation detail:", error);
      throw error;
    }
  }
  
  
}
