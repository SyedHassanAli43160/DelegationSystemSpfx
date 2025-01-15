import * as React from "react";
import { useEffect, useState } from "react";
import { WebPartContext } from "@microsoft/sp-webpart-base";
import { GraphService } from "../../../Services/GraphService";
import { DataService } from "../../../Services/ApplicationService";
import { DelegationService } from "../../../Services/DelegationService";
import PeoplePickerComponent from "./PeoplePicker";
import { IApplication } from "../../../../Interfaces/IApplication";

interface IDelegationForm {
  delegateTo: string;
  startDate: string;
  endDate: string;
  applyToExisting: boolean;
  applyToAll: boolean;
  selectedApplications: string[];
}

interface IRule {
  applicationId: string;
  delegateTo: string;
  skip: boolean;
  applicationName?: string;
}

interface DelegationProps {
  context: WebPartContext;
}

const Delegation: React.FC<DelegationProps> = ({ context }) => {
  const [userName, setUserName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [applications, setApplications] = useState<IApplication[]>([]);
  const [rules, setRules] = useState<IRule[]>([]);
  const [formData, setFormData] = useState<IDelegationForm>({
    delegateTo: "",
    startDate: "",
    endDate: "",
    applyToExisting: false,
    applyToAll: false,
    selectedApplications: []
  });

  const dataService = new DataService(context);
  const delegationService = new DelegationService(context);

  useEffect(() => {
    const graphService = new GraphService(context.spHttpClient, context.pageContext.web.absoluteUrl);

    graphService.getSharePointUserProfile()
      .then(userProfile => {
        setUserName(userProfile.DisplayName);
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
      setApplications(apps);
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
        newState.selectedApplications = checked ? applications.map(app => app.crabd_getzapplicationid!) : [];
      }

      return newState;
    });
  };

  const handleAddRule = () => {
    setRules([...rules, { applicationId: "", delegateTo: formData.delegateTo, skip: false }]);
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
      const application = applications.find(app => app.crabd_getzapplicationid === value);
      if (application) {
        setRules(prevRules =>
          prevRules.map((rule, i) =>
            i === index ? { ...rule, applicationName: application.crabd_applicationname } : rule
          )
        );
      }
    }
  };

  const handlePeoplePickerChange = (items: any[]) => {
    const selectedEmail = items.length > 0 ? items[0].secondaryText : "";
    setFormData(prevFormData => ({
      ...prevFormData,
      delegateTo: selectedEmail || ""
    }));

    setRules(prevRules =>
      prevRules.map(rule => ({ ...rule, delegateTo: selectedEmail }))
    );
  };

  const handleRulePeoplePickerChange = (index: number, items: any[]) => {
    const selectedEmail = items.length > 0 ? items[0].secondaryText : "";
    setRules(prevRules =>
      prevRules.map((rule, i) =>
        i === index ? { ...rule, delegateTo: selectedEmail } : rule
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
      // Create the main delegation
      const newDelegation = {
        crabd_enddate: new Date(formData.endDate),
        crabd_startdate: new Date(formData.startDate),
        crabd_applytoexistingtask: formData.applyToExisting
      };

      const createdDelegation = await delegationService.createDelegation(newDelegation);
      const delegationId = createdDelegation.crabd_delegationfrom;

      // Prepare delegation details based on whether 'applyToAll' is checked
      let delegationDetails: any[] = [];

      if (formData.applyToAll) {
        // If applying to all, create delegation details for all selected applications
        delegationDetails = formData.selectedApplications
          .filter(applicationId => {
            const rule = rules.find(rule => rule.applicationId === applicationId);
            return !(rule && rule.skip); // Don't include the skipped ones
          })
          .map(applicationId => {
            const ruleToApply = rules.find(rule => rule.applicationId === applicationId);
            return {
              crabd_delegationid: delegationId,
              crabd_applicationid: applicationId,
              createdon: new Date(),
              crabd_delegateto: ruleToApply ? ruleToApply.delegateTo : formData.delegateTo
            };
          });
      } else {
        // If applying to individual users, create delegation details for each rule
        delegationDetails = rules
          .filter(rule => rule.applicationId && rule.delegateTo) // Ensure the rule has an application and delegateTo
          .map(rule => {
            return {
              crabd_delegationid: delegationId,
              crabd_applicationid: rule.applicationId,
              createdon: new Date(),
              crabd_delegateto: rule.delegateTo
            };
          });
      }

      // Save delegation details
      await Promise.all(
        delegationDetails.map(detail => delegationService.createDelegationDetail(detail))
      );

      // Reset form after successful submission
      setFormData({
        delegateTo: "",
        startDate: "",
        endDate: "",
        applyToExisting: false,
        applyToAll: false,
        selectedApplications: []
      });
      setRules([]);
      setError(null);
      console.log("Delegation created successfully:", createdDelegation);
    } catch (error) {
      console.error("Error processing delegation:", error);
      setError(`Failed to create delegation: ${error.message}`);
    }
  };

  return (
    <div className="container mt-4">
      <div className="card">
        <div className="card-header">
          <h3>Delegation Form</h3>
        </div>
        <div className="card-body">
          <div className="mb-3">
            <label className="form-label">Delegation From: <b>{userName || "Loading..."}</b></label>
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
              <label className="form-check-label">Apply to all applications</label>
            </div>

            {formData.applyToAll && (
              <div className="mb-3">
                <label className="form-label">Delegate To</label>
                <PeoplePickerComponent
                  context={context}
                  onChange={handlePeoplePickerChange}
                  selectedEmails={formData.delegateTo ? [formData.delegateTo] : undefined}
                />
              </div>
            )}


            <div className="row">
              <div className="col-sm-6">
                <div className="form-floating mb-2">
                  <input
                    type="date"
                    className="form-control"
                    name="startDate"
                    id="startDate"
                    value={formData.startDate}
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
                    value={formData.endDate}
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

            <button type="button" className="btn btn-secondary mt-2" onClick={handleAddRule}>
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
                          <option key={app.crabd_getzapplicationid} value={app.crabd_getzapplicationid}>
                            {app.crabd_applicationname}
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

            <button type="submit" className="btn btn-primary text-white mt-4 w-100">Submit Delegation</button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Delegation;
