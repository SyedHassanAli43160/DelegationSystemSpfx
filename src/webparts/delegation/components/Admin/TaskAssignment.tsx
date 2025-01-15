import * as React from "react";
import { useState, useEffect } from "react";
import { WebPartContext } from "@microsoft/sp-webpart-base";
import { DataService } from "../../../Services/ApplicationService";
import PeoplePickerComponent from "./PeoplePicker";  // Assuming this is your custom PeoplePicker component
import { IApplication } from "../../../../Interfaces/IApplication";
import { TaskService } from "../../../Services/TaskService";
import { Itask } from "../../../../Interfaces/TaskInterFace";
// import { Itask } from "../../../../Interfaces/TaskInterFace"; // Ensure you import the correct interface

interface IAddTaskForm {
  taskName: string;
  startDate: string;
  taskDescription: string;
  endDate: string;
  assignedTo: string;
  assignedBy: string;
  selectedApplication: string;  // Store selected application ID
}

interface AddTaskProps {
  context: WebPartContext;
}

const AddTask: React.FC<AddTaskProps> = ({ context }) => {
  const [applications, setApplications] = useState<IApplication[]>([]);
  const [formData, setFormData] = useState<IAddTaskForm>({
    taskName: "",
    taskDescription: "",
    startDate: "",  // Default to current date
    endDate: "",
    assignedTo: "",
    assignedBy: "",
    selectedApplication: "" // Store application ID
  });
  const [, setError] = useState<string | null>(null);
  const dataService = new DataService(context);

  // Fetch applications
  useEffect(() => {
    fetchApplications();
  }, [context]);

  const fetchApplications = async () => {
    try {
      const apps = await dataService.getApplications();
      setApplications(apps);
    } catch (error) {
      console.error("Error fetching applications:", error);
      setError(`Failed to fetch applications: ${error.message}`);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;

    setFormData(prevState => {
      let newState = { ...prevState, [name]: type === "checkbox" ? checked : value };
      return newState;
    });
  };

  const handlePeoplePickerChange = (field: "assignedBy" | "assignedTo") => (items: any[]) => {
    if (items.length > 0) {
      const selectedEmail = items[0].secondaryText;  // This should be the email or ID of the selected user
      setFormData(prevFormData => ({
        ...prevFormData,
        [field]: selectedEmail || ""
      }));
    } else {
      setFormData(prevFormData => ({
        ...prevFormData,
        [field]: ""  // Clear field if no user is selected
      }));
    }
  };


  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const taskService = new TaskService(context); // Pass your WebPartContext if needed
    try {

      const newTask: Itask = {
        // Assuming this is handled by your backend or service
        crabd_taskname: formData.taskName,
        crabd_taskdescription: formData.taskDescription,
        crabd_assigndate: new Date(formData.startDate), // Assigned date is current date
        crabd_enddate: new Date(formData.endDate), // Use user-defined end date
        crabd_isactive: true, // Assuming task is active by default
        crabd_assignedby: formData.assignedBy, // Assigned by the user picked
        crabd_assignedto: formData.assignedTo, // Assigned to the selected user
        crabd_applicationid: formData.selectedApplication // Using selected application ID
      };
      // Call the CreateTask method from TaskService
      const createdTask = await taskService.CreateTask(newTask);

      setError(null);
      console.log("Task created successfully:", createdTask);
      setFormData({
        taskName: "",
        taskDescription: "",
        startDate: "",  // Default to current date
        endDate: "",
        assignedTo: "",
        assignedBy: "",
        selectedApplication: ""
      })
    } catch (error) {
      console.error("Error creating task:", error);
      setError(`Failed to create task: ${error.message}`);
    }
  };

  return (
    <div className="container mt-4">
      <div className="card">
        <div className="card-header">
          <h3>Add Task</h3>
        </div>
        <div className="card-body">
          {/* <div className="mb-2">
            <label className="form-label">Task Creator: <b>{formData.assignedBy || "Not Assigned"}</b></label>
            {error && <div className="alert alert-danger">{error}</div>}
          </div> */}

          <form onSubmit={handleSubmit}>
            <div className="row">
              <div className="col-sm-4">
                <div className="mb-2 form-floating">
                  <input
                    type="text"
                    className="form-control"
                    name="taskName"
                    id="taskName"
                    value={formData.taskName}
                    onChange={handleInputChange}
                    required
                  />
                  <label htmlFor="taskName">Task Name</label>

                </div>
                <div className="mb-2 form-floating">
                  
                  <select
                    className="form-select"
                    name="selectedApplication"
                    id="selectedApplication"
                    value={formData.selectedApplication}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">Select an Application</option>
                    {applications.map(app => (
                      <option key={app.crabd_getzapplicationid} value={app.crabd_getzapplicationid}>
                        {app.crabd_applicationname}
                      </option>
                    ))}
                  </select>
                  <label htmlFor="selectedApplication">Select Application</label>

                </div>
               
               
              </div>
              <div className="col-sm-4">
              <div className="mb-2 form-floating">
                  <input
                    type="date"
                    className="form-control"
                    name="startDate"
                    id="startDate"
                    value={formData.startDate} // Default to current date
                    onChange={handleInputChange}
                    required
                  />
                  <label htmlFor="startDate">Start Date</label>

                </div>
               

                <div className="mb-2">
                  <label className="form-label">Assign By</label>
                  <PeoplePickerComponent
                    context={context}
                    onChange={handlePeoplePickerChange("assignedBy")}
                    selectedEmails={formData.assignedBy ? [formData.assignedBy] : undefined}
                  />
                </div>

               
              </div>
              <div className="col-sm-4">
              <div className="mb-2 form-floating">
                  <input
                    type="date"
                    className="form-control"
                    name="endDate"
                    id="endDate"
                    value={formData.endDate}
                    onChange={handleInputChange}
                    required
                  />
                  <label htmlFor="endDate">End Date</label>

                </div>
                <div className="mb-2">
                  <label className="form-label">Assign To</label>
                  <PeoplePickerComponent
                    context={context}
                    onChange={handlePeoplePickerChange("assignedTo")}
                    selectedEmails={formData.assignedTo ? [formData.assignedTo] : undefined}
                  />
                </div>
              </div>

            </div>
<div className="row">
  <div className="col-sm-12">
  <div className="mb-2 form-floating">
                  <input
                    type="textarea"
                    className="form-control"
                  
                    id="taskDescription"
                    name="taskDescription"
                    value={formData.taskDescription}
                    onChange={handleInputChange}
                    required
                  />
                  <label htmlFor="taskDescription">Task Description</label>

                </div>
  </div>
</div>




            <button type="submit" className="btn btn-primary text-white mt-4 w-100">Submit Task</button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddTask;
