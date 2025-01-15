export interface IApplication {
  // Common Fields
  crabd_getzapplicationid?: string;                        // Unique ID for the application
  crabd_applicationname: string;                            // Name of the application
  crabd_datasourcetype: 'Dataverse' | 'SQL' | 'SPList'|'API';   // Type of data source
  crabd_appurl:string;
  // Dataverse-specific Fields
  crabd_dv_primaryentityname?: string;                      // Main entity name in Dataverse
  crabd_dv_relationshipname?: string;                       // Relationship name for linking related entities in Dataverse
  crabd_dv_environmenturl?: string;                         // URL of the Dataverse environment
  
  // SQL-specific Fields
  crabd_sql_servername?: string;                            // SQL server name or IP
  crabd_sql_databasename?: string;                          // Name of the SQL database
  crabd_sql_schemaname?: string;                            // SQL schema (e.g., 'dbo')
  crabd_sql_username?: string;                              // Username for SQL connection (handle securely)
  crabd_sql_password?: string;                              // Password for SQL connection (handle securely)

  // SharePoint List-specific Fields
  crabd_sp_listsiteurl?: string;                            // URL of the SharePoint site
  
  //Api Specific Fields
  crabd_api_method?:string;
  crabd_api_url?:string;
  crabd_api_screentype?:string;
  crabd_api_querystring?:string;
  crabd_api_body?:string;
  crabd_api_headers?:string;
  crabd_api_authentication?:string;
  crabd_api_username?:string;
  crabd_api_password?:string;
  // Common Fields for all data source types
  crabd_tablename?: string;                                 // Table name
  crabd_colname?: string;                                   // Column name
  crabd_childtable?: string;                                // Child table name
  crabd_childcol?: string;                                  // Child column name
}
