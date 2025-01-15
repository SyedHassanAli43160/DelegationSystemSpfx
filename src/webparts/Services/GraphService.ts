import { SPHttpClient, SPHttpClientResponse } from '@microsoft/sp-http';

export class GraphService {
  constructor(private spHttpClient: SPHttpClient, private siteUrl: string) {}

  // Fetch user profile properties from SharePoint REST API
  public getSharePointUserProfile(): Promise<any> {
    return this.spHttpClient.get(
      `${this.siteUrl}/_api/sp.userprofiles.peoplemanager/GetMyProperties`,
      SPHttpClient.configurations.v1
    )
    .then((response: SPHttpClientResponse): Promise<any> => {
      if (!response.ok) {
        throw new Error('Failed to fetch user profile properties');
      }
      return response.json();
    })
    .then((userProfile: any): void => {
      // Handle the user profile data as needed
      return userProfile;
    })
    .catch((error: any): void => {
      console.error("Error fetching user profile properties:", error);
      throw error;
    });
  }
}
