import * as React from "react";
import { useEffect, useState } from "react";
import { WebPartContext } from "@microsoft/sp-webpart-base";
import { GraphService } from "../../../Services/GraphService";
import { DataService } from "../../../ListServices/AppService";
import { DelegationService } from "../../../ListServices/DelegationService";
import PeoplePickerComponent from "./PeoplePicker";
import { IApplicationRegisteration } from "../../../../ListInterfaces/Appregisteration";
import { SPHttpClient, SPHttpClientResponse } from "@microsoft/sp-http";
// import DelegationsPage from "../ListComponents/DelegationData";
// import { IDelegation } from "../../../../ListInterfaces/DelegationInterface";

interface IDelegationForm {
  delegateTo: string;
  delegateBy: string;
  startDate: Date;
  endDate: Date;
  applyToExisting: boolean;
  applyToAll: boolean;
  selectedApplications: number[];
}

interface IRule {
  applicationId: number;
  delegateTo: string;
  skip: boolean;
  applicationName?: string;
}

interface DelegationProps {
  context: WebPartContext;
}

const Delegation: React.FC<DelegationProps> = ({ context }) => {
  const [currentUserEmail, setcurrentUserEmail] = useState("");
  const [currentUserid, setcurrentUserid] = useState("");

  const [error, setError] = useState<string | null>(null);
  const [applications, setApplications] = useState<IApplicationRegisteration[]>([]);
  const [rules, setRules] = useState<IRule[]>([]);
  const [formData, setFormData] = useState<IDelegationForm>({
    delegateTo: "",
    delegateBy: "",
    startDate: new Date(),
    endDate: new Date(),
    applyToExisting: false,
    applyToAll: false,
    selectedApplications: []
  });

  const dataService = new DataService(context);
  const delegationService = new DelegationService(context);

  useEffect(() => {
    const graphService = new GraphService(context.spHttpClient, context.pageContext.web.absoluteUrl);

    const baseUri = context.pageContext.web.absoluteUrl;

    // 1. Fetch the current user's profile using SharePoint REST API
    graphService.getSharePointUserProfile()
      .then(userProfile => {

        // Set email and user name
        setcurrentUserEmail(userProfile.Email);
console.log("UserEmail",userProfile);
        // 2. Now, fetch the user ID from SharePoint REST API using the current email
        context.spHttpClient.get(
          `${baseUri}/_api/web/siteusers/getbyemail('${userProfile.Email}')`,
          SPHttpClient.configurations.v1
        )
          .then((response: SPHttpClientResponse) => response.json())
          .then(userData => {
            // Set the current user ID
            console.log("UserData:",userData);
            setcurrentUserid(userData.Id);  // This will set the user ID
          })
          .catch(error => {
            console.error("Error fetching user ID from SharePoint:", error);
            setError(`Failed to fetch user ID: ${error.message}`);
          });
      })
      .catch(error => {
        console.error("Error fetching user profile:", error);
        setError(`Failed to fetch user profile: ${error.message}`);
      });

    fetchApplications();
  }, [context]);

  const fetchApplications = async () => {
    try {
      const apps = await dataService.getApplications();
      const activeApplications = apps.filter(app => app.Active);

      setApplications(activeApplications);
    } catch (error) {
      console.error("Error fetching applications:", error);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;

    setFormData(prevState => {
      let newState = { ...prevState, [name]: type === "checkbox" ? checked : value };

      if (name === "applyToAll" && type === "checkbox") {
        newState.selectedApplications = checked ? applications.map(app => app.Id!) : [];
      }

      return newState;
    });
  };

  const handleAddRule = () => {
    setRules([...rules, { applicationId: 0, delegateTo: formData.delegateTo, skip: false }]);
  };

  const handleRemoveRule = (index: number) => {
    setRules(rules.filter((_, i) => i !== index));
  };

  const handleRuleChange = (index: number, field: string, value: string | boolean) => {
    setRules(prevRules =>
      prevRules.map((rule, i) =>
        i === index ? { ...rule, [field]: value } : rule
      )
    );

    if (field === "applicationId") {
      const application = applications.find(app => app.Id?.toString() === value);
      if (application) {
        setRules(prevRules =>
          prevRules.map((rule, i) =>
            i === index ? { ...rule, applicationName: application.ApplicationName } : rule
          )
        );
      }
    }
  };
  const handlePeopleByPickerChange = (items: any[]) => {
    console.log("User Data:",items);
    const user = items.length > 0 ? items[0] : null;
    const userId = user?.id || "";
    setFormData(prevFormData => ({
      ...prevFormData,
      delegateBy: userId,
    }));
  };
  const handlePeoplePickerChange = (items: any[]) => {
    const user = items.length > 0 ? items[0] : null;
    const userId = user?.id || "";
    setFormData(prevFormData => ({
      ...prevFormData,
      delegateTo: userId,
    }));

    setRules(prevRules =>
      prevRules.map(rule =>
        rule.skip ? rule : { ...rule, delegateTo: userId }
      )
    );
  };
  const handleRulePeoplePickerChange = (index: number, items: any[]) => {
    const user = items.length > 0 ? items[0] : null;
    const userId = user?.id || ""; // Ensure a fallback empty string

    setRules(prevRules =>
      prevRules.map((rule, i) =>
        i === index ? { ...rule, delegateTo: userId } : rule
      )
    );
  };


  const handleSkipChange = (index: number) => {
    setRules(prevRules =>
      prevRules.map((rule, i) =>
        i === index ? { ...rule, skip: !rule.skip } : rule
      )
    );
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {

      const newDelegation = {
        EndDate: new Date(formData.endDate),
        StartDate: new Date(formData.startDate),
        ApplyToExistingTasks: formData.applyToExisting,
        DelegateBy: parseInt(formData.delegateBy ? formData.delegateBy : currentUserid, 10)
      };

      const createdDelegationId = await delegationService.createDelegation(newDelegation);
      const delegationId = createdDelegationId;

      let delegationDetails: any[] = [];

      if (formData.applyToAll) {
        delegationDetails = formData.selectedApplications.map(applicationId => {
          const rule = rules.find(rule => rule.applicationId == applicationId);
          if (rule?.skip) return null; // Skip this application if marked for skipping
          return {
            DelegationId: delegationId,
            ApplicationId: applicationId,
            DelegateTo: rule ? rule.delegateTo : formData.delegateTo, // Use rule delegateTo or fallback
          };
        }).filter(detail => detail !== null); // Filter out skipped applications
      } else {
        delegationDetails = rules.map(rule => {
          if (!rule.applicationId || rule.skip) return null;

          return {
            DelegationId: delegationId,
            ApplicationId: rule.applicationId,
            DelegateTo: rule ? rule.delegateTo : formData.delegateTo,
          };
        }).filter(detail => detail !== null); // Filter out invalid or skipped rules
      }

      await Promise.all(
        delegationDetails.map(detail => delegationService.createDelegationDetail(detail))
      );

      // Reset form
      setFormData({
        delegateTo: "",
        delegateBy: "",
        startDate: new Date(),
        endDate: new Date(),
        applyToExisting: false,
        applyToAll: false,
        selectedApplications: [],
      });
      setRules([]);
      setError(null);
    } catch (error) {
      console.error("Error processing delegation:", error);
      setError(`Failed to create delegation: ${error.message}`);
    }
  };


  return (
    <div className="container mt-4">
      <div className="card">
        <div className="card-header">
          <h3>Delegation Formss</h3>
        </div>

        <div className="card-body">
          <div className="mb-3">
            {error && <div className="alert alert-danger">{error}</div>}
          </div>

          <form onSubmit={handleSubmit}>
           
          <div className="mb-3 form-check">
              <input
                type="checkbox"
                className="form-check-input"
                name="applyToAll"
                checked={formData.applyToAll}
                onChange={handleInputChange}
              />
              <label className="form-check-label">Apply to all Applications</label>
            </div>

            <div className="row">
  {currentUserEmail === "syed.ibrahim@getzpharma.com" ? (
    <>
      {/* Admin Mode: Apply "Assign From" and "Assign To" side by side */}
      <div className={`mb-2 col-sm-${formData.applyToAll ? '6' : '12'}`}>
        <label className="form-label">Assign From</label>
        <PeoplePickerComponent
          context={context}
          onChange={handlePeopleByPickerChange}
          selectedEmails={formData.delegateBy ? [formData.delegateBy] : undefined}
        />
      </div>

      {formData.applyToAll && (
        <div className={`mb-2 col-sm-${formData.applyToAll ? '6' : '12'}`}>
          <label className="form-label">Assign To</label>
          <PeoplePickerComponent
            context={context}
            onChange={handlePeoplePickerChange}
            selectedEmails={formData.delegateTo ? [formData.delegateTo] : undefined}
          />
        </div>
      )}
    </>
  ) : (
    // Non-Admin Mode: "Assign To" takes 100% width after "Assign From"
    <>
      {formData.applyToAll && (
         <div className="mb-2 col-sm-12">
         <label className="form-label">Assign To</label>
         <PeoplePickerComponent
           context={context}
           onChange={handlePeoplePickerChange}
           selectedEmails={formData.delegateTo ? [formData.delegateTo] : undefined}
         />
       </div>
      )}
     
    </>
  )}
</div>


            <div className="row">
              <div className="col-sm-6">
                <div className="form-floating mb-2">
                  <input
                    type="date"
                    className="form-control"
                    name="startDate"
                    id="startDate"
                    value={formData.startDate.toString()}
                    onChange={handleInputChange}
                    required
                  />
                  <label htmlFor="startDate">Start Date</label>

                </div>
              </div>
              <div className="col-sm-6">
                <div className="form-floating mb-2">
                  <input
                    type="date"
                    className="form-control"
                    name="endDate"
                    id="endDate"
                    value={formData.endDate.toString()}
                    onChange={handleInputChange}
                    required
                  />
                  <label htmlFor="endDate">End Date</label>

                </div>
              </div>
            </div>

            <div className="mb-3 form-check">
              <input
                type="checkbox"
                className="form-check-input"
                name="applyToExisting"
                checked={formData.applyToExisting}
                onChange={handleInputChange}
              />
              <label className="form-check-label">Apply to existing tasks</label>
            </div>

            <button type="button" className="btn text-white tertiary mt-2" onClick={handleAddRule}>
              Add Rule
            </button>
            <table className="table mt-3">
              <thead>
                <tr>
                  <th>Application</th>
                  {formData.applyToAll && <th>Skip</th>}
                  <th>Delegate To</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {rules.map((rule, index) => (
                  <tr key={index}>
                    <td>
                      <select
                        className="form-select"
                        value={rule.applicationId}
                        onChange={(e) => handleRuleChange(index, "applicationId", e.target.value)}
                      >
                        <option value="">Select Application</option>
                        {applications.map(app => (
                          <option key={app.Id} value={app.Id}>
                            {app.ApplicationName}
                          </option>
                        ))}
                      </select>
                    </td>

                    {formData.applyToAll && (
                      <td>
                        <input
                          type="checkbox"
                          checked={rule.skip}
                          onChange={() => handleSkipChange(index)}
                        />
                      </td>
                    )}
                    <td>
                      {!rule.skip && (
                        <PeoplePickerComponent
                          context={context}
                          onChange={(items) => handleRulePeoplePickerChange(index, items)}
                          selectedEmails={rule.delegateTo ? [rule.delegateTo] : undefined}
                        />
                      )}
                    </td>
                    <td>
                      <button
                        type="button"
                        className="btn btn-danger"
                        onClick={() => handleRemoveRule(index)}
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                ))}

              </tbody>
            </table>

            <div className="d-flex justify-content-end">
    <button type="submit" className="btn tertiary text-white mt-4 w-auto">Assign</button>
</div>
          </form>
        </div>
      </div>
      {/* <DelegationsPage context={context}/> */}
    </div>
  );
};

export default Delegation;
