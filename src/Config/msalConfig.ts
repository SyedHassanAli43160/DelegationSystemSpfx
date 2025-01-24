import { Configuration } from '@azure/msal-browser';

export const msalConfig: Configuration = {
  auth: {
     clientId: 'dfa8d1e0-a396-4e87-99c2-3bad70153994', // sepia Azure AD app client ID
    // clientId:'b0fbfac7-d0a8-4b0c-9618-63424bba6e0c', //Getz Azure AD app client ID
    //tenantIDSepia:d47cdcb6-440e-4098-b123-dd3e56360888
    //tenantIDGetz:bce03466-f793-402c-9ae9-9c0d6d4f1a87
    authority: 'https://login.microsoftonline.com/3f9827bd-3709-41bc-9f53-0ec850e140cf', // Your tenant ID
    redirectUri: 'https://sepiahost.sharepoint.com/sites/GetzDelegation', // Ensure this matches the one in your Azure AD App registration
  // redirectUri:"https://getzpharma.sharepoint.com/sites/MyPendingTask"
  },
  cache: {
    cacheLocation: 'localStorage', // Cache location
    storeAuthStateInCookie: true, // True if you're facing issues with IE11 or Edge
  },
};

export const loginRequest = {
  scopes: [
    'https://service.flow.microsoft.com/.default'
  ],
};
