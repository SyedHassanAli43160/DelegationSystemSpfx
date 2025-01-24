import * as React from "react";
import { useEffect, useState } from "react";
import { TaskService } from "../../../ListServices/MyPending"; // Adjust the path as necessary
import { IMyPending } from "../../../../ListInterfaces/IMyPending";
import { WebPartContext } from "@microsoft/sp-webpart-base";
// import { SPHttpClient } from "@microsoft/sp-http";
import MyApprovals from "./PowerAutomate";
interface Props {
  context: WebPartContext;
}

const GroupedTasksTable: React.FC<Props> = ({ context }) => {
  const [groupedTasks, setGroupedTasks] = useState<Record<string, IMyPending[]>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // const [userEmails, setUserEmails] = useState<Record<string, string>>({});

  // const fetchUserName = async (identifier: string, isEmail: boolean): Promise<string> => {
  //   try {
  //     console.log(userEmails);
  //     const url = isEmail
  //       ? `${context.pageContext.web.absoluteUrl}/_api/web/siteusers/getbyemail('${identifier}')`
  //       : `${context.pageContext.web.absoluteUrl}/_api/web/getuserbyid(${identifier})`;
  
  //     const response = await context.spHttpClient.get(url, SPHttpClient.configurations.v1);
  
  //     if (response.ok) {
  //       const user = await response.json();
  //       return user.Title || "Unknown User";
  //     }
  
  //     return "Unknown User";
  //   } catch (err) {
  //     console.error(`Error fetching username for ${isEmail ? "email" : "ID"} ${identifier}:`, err);
  //     return "Error Fetching Username";
  //   }
  // };
  

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        setIsLoading(true);
        const taskService = new TaskService(context);

        const grouped: Record<string, IMyPending[]> = await taskService.fetchTasksForUser();

        setGroupedTasks(grouped);
      } catch (err: any) {
        setError("Unable to fetch tasks.");
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTasks();
  }, [context]);

  // useEffect(() => {
  //   const resolveUsernames = async () => {
  //     const emails: Record<string, string> = {};
  //     for (const taskGroup of Object.values(groupedTasks)) {
  //       for (const task of taskGroup) {
  //         // Check if AssignBy is defined before calling .includes()
  //         const isEmail = task.AssignBy ? task.AssignBy.includes("@") : false; // Default to false if undefined
  
  //         if (task.AssignBy && !emails[task.AssignBy]) {
  //           const username = await fetchUserName(task.AssignBy, isEmail);
  //           emails[task.AssignBy] = username;
  //         }
  //       }
  //     }
  //     setUserEmails((prevEmails) => ({ ...prevEmails, ...emails }));
  //   };
  
  //   if (Object.keys(groupedTasks).length > 0) {
  //     resolveUsernames();
  //   }
  // }, [groupedTasks]);
  
  if (isLoading) {
    return <div className="alert alert-info">Loading tasks...</div>;
  }

  if (error) {
    return <div className="alert alert-danger">Error: {error}</div>;
  }

  return (
    <div className="container">
      <h2 className="w-100  h2 py-4 text-quaternary text-center">My Pending Tasks</h2>
      {Object.keys(groupedTasks).length === 0 ? (
        <div className="alert alert-warning">No tasks found for the current user.</div>
      ) : (
        <div className="overflow-auto">
     <table className="table mt-3" style={{ width: '100%', tableLayout: 'fixed' }}>
  <thead>
    <tr>
      <th className="py-2 quaternary text-white ">Application Name</th>
      <th className="py-2 quaternary text-white ">Task Name</th>
      <th className="py-2 quaternary text-white ">Created By</th>
      <th className="py-2 quaternary text-white ">Assign Date</th>
      <th className="py-2 quaternary text-white ">Actions</th>
    </tr>
  </thead>
  <tbody>
    {Object.entries(groupedTasks).map(([applicationName, tasks]) => (
      <React.Fragment key={applicationName}>
        {tasks.map((task, index) => (
          <tr key={task.ID}>
            {index === 0 && (
              <td rowSpan={tasks.length} className="bg-light ">
                {applicationName}
              </td>
            )}
            <td className="">{task.TaskName}</td>
            <td className="w-auto">
              {/* {task.AssignBy ? userEmails[task.AssignBy] || "Loading..." : "Unknown User"} */}
              {task.AssignBy}
            </td>
            <td className="">
              {task.AssignDate ? new Date(task.AssignDate).toLocaleDateString() : "N/A"}
            </td>
            <td className="">
              <a className="btn secondary text-white" href={task.AppUrl}>
                View Task
              </a>
            </td>
          </tr>
        ))}
      </React.Fragment>
    ))}
  </tbody>
</table>
<MyApprovals context={context} />
        </div>
      )}
    </div>
  );
};

export default GroupedTasksTable;
