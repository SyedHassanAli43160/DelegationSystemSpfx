export interface IDelegationDetails {
    ApplicationId: number; // Foreign key to Application
    DelegateTo: number; // User to whom the delegation is assigned
    DelegationId?: number; // Foreign key to Delegation
  }
  
  export interface IDelegation {
    Id?: number; // Primary key (autogenerated number)
    EndDate: Date; // End date of the delegation
    StartDate: Date;
    DelegateBy?:number;
    ApplyToExistingTasks:boolean; // Start date of the delegation
    // createdby: string; // User who created the delegation (logged in user)
  }
  