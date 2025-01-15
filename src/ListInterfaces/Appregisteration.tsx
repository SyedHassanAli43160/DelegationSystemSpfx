export interface IApplicationRegisteration {
    //Global Entries
    Id?: number;
    ApplicationName: string;
    tablename: string;
    colname: string;
    childtable: string;
    childcol: string;
    AppUrl: string;
    datasourceType: string;
    ColStatus: string;
    ChildColStatus: string;
    PrevAssigneeColName?: string;
    PrevAssigneeColNameChild?: string;
    Active?: boolean;
    //Dataverse Related Entities
    dv_primaryEntityName: string;
    dv_relationshipName: string;
    dv_environmentUrl: string;
    //Sql Related Entities
    sql_ServerName: string;
    sql_DatabaseName: string;
    sql_SchemaName: string;
    sql_Username: string;
    sql_Password: string;
    sql_ApiUrl?: string;
    sql_ApiUserName?:string;
    sql_ApiPassword?:string;
    //SharePoint Related Entities
    sp_ListSiteUrl: string;

    //Api Generic Fields
    Api_authentication: string;
    Api_username: string;
    Api_password: string;
    //Delegation Api Related Entries
    Api_method: string;
    Api_url: string;
    Api_querystring: string;
    Api_body: string;
    Api_headers: string;
  
    //My Pending Api Related Entries
    MyPending_Api_method: string;
    MyPending_Api_url: string;
    MyPending_Api_querystring: string;
    MyPending_Api_body: string;
    MyPending_Api_headers: string;
   
}