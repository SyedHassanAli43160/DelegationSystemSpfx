import { Configuration } from '@azure/msal-browser';

export const msalConfig: Configuration = {
  auth: {
     clientId: '72ce2e08-267f-4d3b-b173-46af7663631a', // sepia Azure AD app client ID
    // clientId:'b0fbfac7-d0a8-4b0c-9618-63424bba6e0c', //Getz Azure AD app client ID
    //tenantIDSepia:d47cdcb6-440e-4098-b123-dd3e56360888
    //tenantIDGetz:bce03466-f793-402c-9ae9-9c0d6d4f1a87
    authority: 'https://login.microsoftonline.com/d47cdcb6-440e-4098-b123-dd3e56360888', // Your tenant ID
    redirectUri: 'https://xy76b.sharepoint.com/sites/GetzDelegation', // Ensure this matches the one in your Azure AD App registration
  // redirectUri:"https://getzpharma.sharepoint.com/sites/MyPendingTask"
  },
  cache: {
    cacheLocation: 'localStorage', // Cache location
    storeAuthStateInCookie: true, // True if you're facing issues with IE11 or Edge
  },
};

export const getScopes = (service: 'graph' | 'flow') => {
  switch (service) {
    case 'graph':
      return ['https://graph.microsoft.com/.default']; // Microsoft Graph scopes
    case 'flow':
      return ['https://service.flow.microsoft.com/.default']; // Power Automate Flow scopes
    default:
      return [];
  }
};