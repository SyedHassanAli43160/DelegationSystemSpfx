// UserService.ts
import { SPHttpClient } from "@microsoft/sp-http";
import { WebPartContext } from "@microsoft/sp-webpart-base";

export class UserService {
  private spHttpClient: SPHttpClient;
  private baseUri: string;

  constructor(context: WebPartContext) {
    this.spHttpClient = context.spHttpClient;
    this.baseUri = context.pageContext.web.absoluteUrl;
  }

  async getUserProfile(): Promise<{ email: string; id: string }> {
    // Step 1: Fetch user profile
    const userProfile = await this.spHttpClient
      .get(`${this.baseUri}/_api/SP.UserProfiles.PeopleManager/GetMyProperties`, SPHttpClient.configurations.v1)
      .then((response) => response.json());

    const email = userProfile?.Email;

    // Step 2: Fetch user ID using email
    const userData = await this.spHttpClient
      .get(`${this.baseUri}/_api/web/siteusers/getbyemail('${email}')`, SPHttpClient.configurations.v1)
      .then((response) => response.json());

    return { email, id: userData?.Id };
  }
}
