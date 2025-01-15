export interface IMyPending {
    ID: number;
    TaskName: string; // Mapped from "Title"
    TaskDescription?: string; // Optional, mapped from "Status"
    AssignDate?: Date; // Optional, mapped from "Created"
    AssignBy?: string; // Optional, mapped from "AssignByStringId"
    IsActive: boolean; // Defaulted to true
    ApplicationName?: string; // Mapped from app data
    AppUrl?: string; // URL for application
}
