import { WebPartContext } from "@microsoft/sp-webpart-base";
import { tokenService } from "../Services/AuthTokenService";
import { Itask } from "../../Interfaces/TaskInterFace";

export class TaskService {
  constructor( context: WebPartContext) {
    // Additional initialization if needed
  }

  public async CreateTask(task: Itask): Promise<Itask> {
    try {
      console.log("I'm inside try block", task);

      // Retrieve the access token
      const accessToken = await tokenService.getAccessToken();

      const response = await fetch(
        `https://orge6d50e70.crm5.dynamics.com/api/data/v9.2/crabd_getztasks`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Prefer': 'return=representation'
          },
          body: JSON.stringify(task),
        }
      );

      // Check for response body before parsing JSON
      if (!response.ok) {
        const errorDetails = await response.text();
        throw new Error(`Error creating Task: ${response.statusText}, Details: ${errorDetails}`);
      }

      const text = await response.text();
      const data = text ? JSON.parse(text) : {}; // Only parse if there is a response body
      console.log("Created task data:", data);

      return data;
    } catch (error) {
      console.error("Error creating task:", error);
      throw error;
    }
  }
  public async fetchTasksGroupedByApplicationForUser(currentUserEmail: string): Promise<Record<string, Itask[]>> {
    try {
      const accessToken = await tokenService.getAccessToken();
  
      const response = await fetch(
        `https://orge6d50e70.crm5.dynamics.com/api/data/v9.2/crabd_getztasks`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            Accept: "application/json",
          },
        }
      );
  
      if (!response.ok) {
        const errorDetails = await response.text();
        throw new Error(`Error fetching tasks: ${response.statusText}, Details: ${errorDetails}`);
      }
  
      const allTasks = await response.json();
  
      // Log the response to inspect the format
      console.log("allTasks response:", allTasks);
  
      // If the tasks are in a `value` property, adjust accordingly
      const tasksArray = Array.isArray(allTasks) ? allTasks : allTasks.value;
  
      // Filter tasks assigned to the current user
      const filteredTasks = tasksArray.filter((task: Itask) => task.crabd_assignedto === currentUserEmail);
  
      // Group tasks by application name
      const groupedTasks = filteredTasks.reduce((acc: Record<string, Itask[]>, task: Itask) => {
        const applicationName = task.crabd_applicationid || "Unknown Application";
        if (!acc[applicationName]) {
          acc[applicationName] = [];
        }
        acc[applicationName].push(task);
        return acc;
      }, {});
  
      return groupedTasks;
    } catch (error) {
      console.error("Error fetching tasks grouped by application for user:", error);
      throw error;
    }
  }
  public async fetchApplicationName(applicationId: string): Promise<string> {
    try {
      // Fetch the access token
      const accessToken = await tokenService.getAccessToken();
  
      // Make the API request to get application details
      const response = await fetch(
        `https://orge6d50e70.crm5.dynamics.com/api/data/v9.2/crabd_getzapplications(${applicationId})`, // Using dynamic query for specific application ID
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            Accept: "application/json",
          },
        }
      );
  
      if (!response.ok) {
        throw new Error("Failed to fetch application name");
      }
  
      const data = await response.json();
  console.log(data);
      // Ensure the API response includes the application name
      return data.crabd_applicationname || "Unknown Application"; // Adjust based on actual response structure
    } catch (error) {
      console.error("Error fetching application name:", error);
      throw error;
    }
  }
  
}