import { PublicClientApplication, AuthenticationResult, InteractionRequiredAuthError, BrowserAuthError } from '@azure/msal-browser';
import { msalConfig, loginRequest } from '../../Config/msalConfig';

class AuthTokenService {
  private msalInstance: PublicClientApplication;
  private isInitialized: boolean = false;

  constructor() {
    this.msalInstance = new PublicClientApplication(msalConfig);
  }

  private async initialize(): Promise<void> {
    if (!this.isInitialized) {
      await this.msalInstance.initialize();
      this.isInitialized = true;
    }
  }

  public async getAccessToken(): Promise<string | undefined> { // Updated return type to include 'undefined'
    await this.initialize();

    try {
      const accounts = this.msalInstance.getAllAccounts();
      if (accounts.length === 0) {
        // Trigger login popup if no account exists
        const loginResponse: AuthenticationResult = await this.msalInstance.loginPopup({
          ...loginRequest,
          prompt: 'select_account', // Prompts user to select account
        });
        return loginResponse.accessToken;
      } else {
        // Try to acquire token silently for the existing account
        const tokenResponse: AuthenticationResult = await this.msalInstance.acquireTokenSilent({
          ...loginRequest,
          account: accounts[0],
        });
        return tokenResponse.accessToken;
      }
    } catch (error) {
      if (error instanceof InteractionRequiredAuthError) {
        // If token acquisition silently fails, trigger interactive login
        const loginResponse: AuthenticationResult = await this.msalInstance.loginPopup({
          ...loginRequest,
          prompt: 'select_account', // Ensures the user is prompted to choose an account
        });
        return loginResponse.accessToken;
      } else if (error instanceof BrowserAuthError) {
        // Handle specific BrowserAuthError: monitor_window_timeout
        if (error.errorCode === 'monitor_window_timeout') {
          console.error('Token acquisition timed out. Please try again.');
          // Handle retry logic or fallback here
          return undefined; // You can also retry the operation if necessary
        } else {
          console.error('Browser authentication error:', error);
          // Handle other browser authentication errors
          return undefined;
        }
      } else {
        console.error("Error acquiring access token:", error);
        // Return undefined if an unexpected error occurs
        return undefined;
      }
    }
  }
}

// Create a singleton instance for global use
export const tokenService = new AuthTokenService();
