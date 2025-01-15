import * as React from "react";
import { useEffect, useState } from "react";
import { TaskService } from "../../../Services/TaskService";
import { Itask } from "../../../../Interfaces/TaskInterFace";
import { WebPartContext } from "@microsoft/sp-webpart-base";

interface MyPendingProps {
  context: WebPartContext;
}

const MyPending: React.FC<MyPendingProps> = ({ context }) => {
  const [groupedTasks, setGroupedTasks] = useState<Record<string, Itask[]>>({});
  const [applicationNames, setApplicationNames] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [currentUserEmail, setCurrentUserEmail] = useState<string>("");

  useEffect(() => {
    const fetchCurrentUserEmail = async () => {
      try {
        const userInfo = await context.pageContext.legacyPageContext;
        const email = userInfo.userEmail || ""; 
        setCurrentUserEmail(email);
      } catch (err) {
        console.error("Error fetching current user email:", err);
        setError("Unable to retrieve user information.");
      }
    };

    fetchCurrentUserEmail();
  }, [context]);

  useEffect(() => {
    if (!currentUserEmail) return;
  
    const fetchTasksAndApplications = async () => {
      try {
        setLoading(true);
        const taskService = new TaskService(context);
  
        // Fetch grouped tasks
        const tasks = await taskService.fetchTasksGroupedByApplicationForUser(currentUserEmail);
        setGroupedTasks(tasks);
  
        // Resolve application names
        const applicationIds = Object.keys(tasks);
        const appNameMap: Record<string, string> = {};
        await Promise.all(
          applicationIds.map(async (applicationId) => {
            try {
              appNameMap[applicationId] = await taskService.fetchApplicationName(applicationId);
            } catch (err) {
              appNameMap[applicationId] = "Unknown Application";
            }
          })
        );
        setApplicationNames(appNameMap);
      } catch (err) {
        console.error("Error fetching tasks or application names:", err);
        setError("Failed to load data. Please try again later.");
      } finally {
        setLoading(false);
      }
    };
  
    fetchTasksAndApplications();
  }, [context, currentUserEmail]);
  
  if (loading) {
    return <p>Loading tasks...</p>;
  }

  if (error) {
    return <p className="error">{error}</p>;
  }

  return (
    <div className="my-pending-tasks">
      <h2>My Pending Tasks</h2>
      {Object.keys(groupedTasks).length === 0 ? (
        <p>No tasks found for you.</p>
      ) : (
        <div className="overflow-auto">
            <table className="table mt-3">
          <thead>
            <tr className='table-primary'>
              <th className='py-2 quaternary text-nowrap text-white text-center'>Application Name</th>
              <th className='py-2 quaternary text-nowrap text-white text-center'>Activity</th>
              <th className='py-2 quaternary text-nowrap text-white text-center'>Assigned By</th>
              <th className='py-2 quaternary text-nowrap text-white text-center'>Approve</th>
              <th className='py-2 quaternary text-nowrap text-white text-center'>Reject</th>
              <th className='py-2 quaternary text-nowrap text-white text-center'>Comments</th>


            </tr>
          </thead>
          <tbody>
  {Object.entries(groupedTasks).map(([applicationId, tasks]) => (
    <React.Fragment key={applicationId}>
      {tasks.map((task, index) => (
        <tr key={task.crabd_getztaskid}>
          {index === 0 && (
            // Only show application name for the first task
            <td rowSpan={tasks.length} className="text-nowrap text-center">
  {applicationNames[applicationId] || "Unknown Application"}
</td>

          )}
          <td className="border p-2">{task.crabd_taskname}</td>
          <td className="border p-2">{task.crabd_assignedby}</td>
          <td className="border p-2">
            <button type="button" className="btn text-white primary m-2">Approve</button>
          </td>
          <td className="border p-2">
            <button type="button" className="btn text-white secondary m-2">Reject</button>
          </td>
          <td className="border p-2">
            <input type="text" name="Comments" className="form-control m-2" />
          </td>
        </tr>
      ))}
    </React.Fragment>
  ))}
</tbody>


        </table>
        </div>
      )}
    </div>
  );
};

export default MyPending;
