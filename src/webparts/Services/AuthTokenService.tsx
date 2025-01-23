// AuthTokenService.ts

import { PublicClientApplication, AuthenticationResult, InteractionRequiredAuthError, BrowserAuthError } from '@azure/msal-browser';
import { msalConfig, getScopes } from '../../Config/msalConfig';

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

  public async getAccessToken(service: 'graph' | 'flow'): Promise<string | undefined> { // Accept service type
    await this.initialize();

    const scopes = getScopes(service); // Dynamically get the scopes based on service

    try {
      const accounts = this.msalInstance.getAllAccounts();
      if (accounts.length === 0) {
        // Trigger login popup if no account exists
        const loginResponse: AuthenticationResult = await this.msalInstance.loginPopup({
          scopes, // Use dynamically determined scopes
          prompt: 'select_account',
        });
        return loginResponse.accessToken;
      } else {
        // Try to acquire token silently for the existing account
        const tokenResponse: AuthenticationResult = await this.msalInstance.acquireTokenSilent({
          scopes, // Use dynamically determined scopes
          account: accounts[0],
        });
        return tokenResponse.accessToken;
      }
    } catch (error) {
      if (error instanceof InteractionRequiredAuthError) {
        // If token acquisition silently fails, trigger interactive login
        const loginResponse: AuthenticationResult = await this.msalInstance.loginPopup({
          scopes, // Use dynamically determined scopes
          prompt: 'select_account',
        });
        return loginResponse.accessToken;
      } else if (error instanceof BrowserAuthError) {
        if (error.errorCode === 'monitor_window_timeout') {
          console.error('Token acquisition timed out. Please try again.');
          return undefined;
        } else {
          console.error('Browser authentication error:', error);
          return undefined;
        }
      } else {
        console.error("Error acquiring access token:", error);
        return undefined;
      }
    }
  }
}

// Create a singleton instance for global use
export const tokenService = new AuthTokenService();
