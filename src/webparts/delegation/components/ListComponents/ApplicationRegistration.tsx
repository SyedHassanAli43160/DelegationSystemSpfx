import * as React from 'react';
import { DataService } from '../../../ListServices/AppService';
import { WebPartContext } from "@microsoft/sp-webpart-base";
import { IApplicationRegisteration } from "../../../../ListInterfaces/Appregisteration";

const ApplicationRegistration = ({ context }: { context: WebPartContext }) => {
  const [applications, setApplications] = React.useState<IApplicationRegisteration[]>([]);
  const [currentApplication, setCurrentApplication] = React.useState<IApplicationRegisteration | null>(null);
  const [selectedDataSource, setSelectedDataSource] = React.useState<string>('SPList');
  const [showForm, setShowForm] = React.useState(false);
  const service = new DataService(context);

  // Fetch applications on component mount
  React.useEffect(() => {
    async function fetchApplications() {
      const applications = await service.getApplications();
      setApplications(applications);
    }
    fetchApplications();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, type, value } = e.target;

    // Narrow down type to handle `checked` property for checkboxes
    const isCheckbox = type === "checkbox";
    const checkedValue = isCheckbox ? (e.target as HTMLInputElement).checked : value;

    setCurrentApplication((prevState) => {
      if (prevState) {
        return {
          ...prevState,
          [name]: checkedValue,
        };
      }
      return null;
    });
  };


  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      if (currentApplication) {
        const applicationToSave: IApplicationRegisteration = { ...currentApplication };

        // Check if we are updating or creating
        if (applicationToSave.Id) {
          // Update existing application
          await service.updateApplication(applicationToSave);
          setApplications(
            applications.map((app) =>
              app.Id === applicationToSave.Id ? applicationToSave : app
            )
          );
        } else {
          // Create new application
          const createdApplication = await service.createApplication(applicationToSave);
          createdApplication.Api_password = createdApplication.Api_password != null ? applicationToSave.Api_password : createdApplication.Api_password ?? "";
          createdApplication.sql_Password = createdApplication.sql_Password != null ? applicationToSave.sql_Password : createdApplication.sql_Password ?? "";
          createdApplication.sql_ApiPassword = createdApplication.sql_ApiPassword != null ? applicationToSave.sql_ApiPassword : createdApplication.sql_ApiPassword ?? "";

          setApplications((prevApplications) => [...prevApplications, createdApplication]);
        }

        setShowForm(false);
        setCurrentApplication(null);
      }
    } catch (error) {
      console.error("Error saving application:", error);
    }
  };

  const handleEdit = (application: IApplicationRegisteration) => {
    application.sql_ApiPassword
    setCurrentApplication(application);
    setSelectedDataSource(application.datasourceType || 'SPList');
    setShowForm(true);
  };

  const handleDelete = async (Id: number) => {
    try {
      await service.deleteApplication(Id);
      setApplications(applications.filter((app) => app.Id !== Id));
    } catch (error) {
      console.error("Error deleting application:", error);
    }
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setCurrentApplication(null);
  };

  return (
    <div className="mt-2">
      <h4 className="w-100  h2 py-4 text-quaternary text-center">Applications</h4>
      {!showForm && (
        <a
          className="btn text-white w-auto secondary"
          onClick={() => {
            setCurrentApplication({
              ApplicationName: '',
              datasourceType: 'SPList',
              dv_primaryEntityName: '',
              dv_relationshipName: '',
              dv_environmentUrl: '',
              AppUrl: '',
              Active: true,
              PrevAssigneeColName: '',
              sql_ServerName: '',
              sql_DatabaseName: '',
              sql_SchemaName: '',
              sql_Username: '',
              sql_Password: '',
              sql_ApiUrl: '',
              sql_ApiUserName:'',
              sql_ApiPassword:'',
              sp_ListSiteUrl: '',
              tablename: '',
              colname: '',
              ColStatus: '',
              ChildColStatus: '',
              childtable: '',
              childcol: '',
              Api_authentication: '',
              Api_body: '',
              Api_headers: '',
              Api_method: 'POST',
              Api_password: '',
              Api_querystring: '',
              Api_url: '',
              Api_username: '',

              MyPending_Api_method: 'GET',
              MyPending_Api_url: '',
              MyPending_Api_querystring: '',
              MyPending_Api_body: '',
              MyPending_Api_headers: '',

            });
            setSelectedDataSource('SPList');
            setShowForm(true);
          }}
        >
          Register New Application +
        </a>
      )}


      {showForm && (
        <form onSubmit={handleSubmit} className="mt-3">
          <div className="row">
            <div className="col-sm-6">
              <div className="form-floating mb-2">
                <input
                  type="text"
                  id="applicationName"
                  className="form-control"
                  name="ApplicationName"
                  value={currentApplication?.ApplicationName || ''}
                  onChange={handleInputChange}
                  required
                />
                <label htmlFor="applicationName">Application Name</label>
              </div>
              {currentApplication?.datasourceType !== "API" && (
                <>
                  <div className="form-floating mb-2">
                    <input
                      type="text"
                      className="form-control"
                      id="tableName"
                      name="tablename"
                      value={currentApplication?.tablename || ''}
                      onChange={handleInputChange}
                      required
                    />
                    <label htmlFor="tableName">Table/List Name</label>
                  </div>
                  <div className="form-floating mb-2">
                    <input
                      type="text"
                      className="form-control"
                      id="childTable"
                      name="childtable"
                      value={currentApplication?.childtable || ''}
                      onChange={handleInputChange}
                    />
                    <label htmlFor="childTable">Child Table/List</label>
                  </div>
                  <div className="form-floating mb-2">
                    <input
                      type="text"
                      className="form-control"
                      id="ColStatus"
                      name="ColStatus"
                      value={currentApplication?.ColStatus || ''}
                      onChange={handleInputChange}
                    />
                    <label htmlFor="ColStatus">Status Column Name</label>
                  </div>
                  <div className="form-floating mb-2">
                    <input
                      type="text"
                      className="form-control"
                      id="PrevAssigneeColName"
                      name="PrevAssigneeColName"
                      value={currentApplication?.PrevAssigneeColName || ''}
                      onChange={handleInputChange}
                    />
                    <label htmlFor="PrevAssigneeColName">Previous Assignee Col</label>
                  </div>
                </>
              )}

              <div className="form-check mb-2">
                <input
                  type="checkbox"
                  className="form-check-input"
                  id="Active"
                  name="Active"
                  checked={currentApplication?.Active || false} // Use `checked` instead of `value`
                  onChange={handleInputChange} // This should toggle the boolean value
                />
                <label className="form-check-label" htmlFor="Active">
                  Is Active
                </label>
              </div>

            </div>
            <div className="col-sm-6">
              <div className="form-floating mb-2">
                <input
                  type="text"
                  className="form-control"
                  id="appUrl"
                  name="AppUrl"
                  value={currentApplication?.AppUrl || ''}
                  onChange={handleInputChange}
                  required
                />
                <label htmlFor="appUrl">Application Url</label>
              </div>
              {currentApplication?.datasourceType !== "API" && (
                <><div className="form-floating mb-2">
                  <input
                    type="text"
                    className="form-control"
                    id="columnName"
                    name="colname"
                    value={currentApplication?.colname || ''}
                    onChange={handleInputChange}
                    required />
                  <label htmlFor="columnName">Approver Column Name</label>
                </div><div className="form-floating mb-2">
                    <input
                      type="text"
                      className="form-control"
                      id="childColumn"
                      name="childcol"
                      value={currentApplication?.childcol || ''}
                      onChange={handleInputChange} />
                    <label htmlFor="childColumn">Child Approver Column Name</label>
                  </div><div className="form-floating mb-2">
                    <input
                      type="text"
                      className="form-control"
                      id="ChildColStatus"
                      name="ChildColStatus"
                      value={currentApplication?.ChildColStatus || ''}
                      onChange={handleInputChange} />
                    <label htmlFor="ChildColStatus">Child Status Column Name</label>
                  </div><div className="form-floating mb-2">
                    <input
                      type="text"
                      className="form-control"
                      id="PrevAssigneeColNameChild"
                      name="PrevAssigneeColNameChild"
                      value={currentApplication?.PrevAssigneeColNameChild || ''}
                      onChange={handleInputChange} />
                    <label htmlFor="PrevAssigneeColNameChild">Child Previous Assignee Col</label>
                  </div></>
              )}

            </div>
          </div>

          <div className="form-floating mb-2">
            <select
              className="form-select"
              id="dataSource"
              value={selectedDataSource}
              onChange={(e) => {
                setSelectedDataSource(e.target.value);
                if (currentApplication) {
                  setCurrentApplication({
                    ...currentApplication,
                    datasourceType: e.target.value as  'SQL' | 'SPList' | 'API',
                  });
                }
              }}
              disabled={!!currentApplication?.Id}
            >
              <option value="">Select Data Source</option>
              <option value="SPList">SharePoint List</option>
              <option value="SQL">Azure SQL</option>
              <option value="API">API</option>
            </select>
            <label htmlFor="dataSource">Data Source Type</label>
          </div>

          {/* Dataverse Specific Fields */}
          {/* {selectedDataSource === 'Dataverse' && (
            <div className="row">
              <div className="col-sm-4">
                <div className="form-floating mb-2">
                  <input
                    type="text"
                    className="form-control"
                    id="primaryEntityName"
                    name="dv_primaryEntityName"
                    value={currentApplication?.dv_primaryEntityName || ''}
                    onChange={handleInputChange}
                    required
                  />
                  <label htmlFor="primaryEntityName">Primary Entity Name</label>
                </div>
              </div>
              <div className="col-sm-4">
                <div className="form-floating mb-2">
                  <input
                    type="url"
                    className="form-control"
                    id="environmentUrl"
                    name="dv_environmentUrl"
                    value={currentApplication?.dv_environmentUrl || ''}
                    onChange={handleInputChange}
                    required
                  />
                  <label htmlFor="environmentUrl">Environment URL</label>
                </div>
              </div>
              <div className="col-sm-4">
                <div className="form-floating mb-2">
                  <input
                    type="text"
                    className="form-control"
                    id="relationshipName"
                    name="dv_relationshipName"
                    value={currentApplication?.dv_relationshipName || ''}
                    onChange={handleInputChange}
                    required
                  />
                  <label htmlFor="relationshipName">Relationship Name</label>
                </div>
              </div>
            </div>
          )} */}

          {/* SQL Specific Fields */}
          {selectedDataSource === 'SQL' && (
            <div className="row">
              <div className="col-sm-4">
                <div className="form-floating mb-2">
                  <input
                    type="text"
                    className="form-control"
                    id="serverName"
                    name="sql_ServerName"
                    value={currentApplication?.sql_ServerName || ''}
                    onChange={handleInputChange}
                    required
                  />
                  <label htmlFor="serverName">SQL Server Name</label>
                </div>
              </div>
              <div className="col-sm-4">
                <div className="form-floating mb-2">
                  <input
                    type="text"
                    className="form-control"
                    id="databaseName"
                    name="sql_DatabaseName"
                    value={currentApplication?.sql_DatabaseName || ''}
                    onChange={handleInputChange}
                    required
                  />
                  <label htmlFor="databaseName">SQL Database Name</label>
                </div>
              </div>
              <div className="col-sm-4">
                <div className="form-floating mb-2">
                  <input
                    type="text"
                    className="form-control"
                    id="schemaName"
                    name="sql_SchemaName"
                    value={currentApplication?.sql_SchemaName || ''}
                    onChange={handleInputChange}
                    required
                  />
                  <label htmlFor="schemaName">Schema Name</label>
                </div>
              </div>
              <div className="col-sm-4">
                <div className="form-floating mb-2">
                  <input
                    type="text"
                    className="form-control"
                    id="username"
                    name="sql_Username"
                    value={currentApplication?.sql_Username || ''}
                    onChange={handleInputChange}
                    required
                  />
                  <label htmlFor="username">User Name</label>
                </div>
              </div>
              <div className="col-sm-4">
                <div className="form-floating mb-2">
                  <input
                    type="text"
                    className="form-control"
                    id="sql_Password"
                    name="sql_Password"
                    value={currentApplication?.sql_Password || ''}
                    onChange={handleInputChange}
                    required
                  />
                  <label htmlFor="sql_Password">Password</label>
                </div>
              </div>
              <div className="col-sm-4">
                <div className="form-floating mb-2">
                  <input
                    type="url"
                    className="form-control"
                    id="sql_ApiUrl"
                    name="sql_ApiUrl"
                    value={currentApplication?.sql_ApiUrl || ''}
                    onChange={handleInputChange}
                    required
                  />
                  <label htmlFor="sql_ApiUrl">Sql Api Url</label>
                </div>
              </div>
              <div className="col-sm-4">
                <div className="form-floating mb-2">
                  <input
                    type="text"
                    className="form-control"
                    id="sql_ApiUserName"
                    name="sql_ApiUserName"
                    value={currentApplication?.sql_ApiUserName || ''}
                    onChange={handleInputChange}
                    required
                  />
                  <label htmlFor="sql_ApiUserName">Sql Api UserName</label>
                </div>
              </div>
              <div className="col-sm-4">
                <div className="form-floating mb-2">
                  <input
                    type="text"
                    className="form-control"
                    id="sql_ApiPassword"
                    name="sql_ApiPassword"
                    value={currentApplication?.sql_ApiPassword || ''}
                    onChange={handleInputChange}
                    required
                  />
                  <label htmlFor="sql_ApiPassword">Sql Api Password</label>
                </div>
              </div>
            </div>
          )}

          {selectedDataSource === 'SPList' && (
            <>
              <div className="form-floating mb-2">
                <input type="url" className="form-control" id="sp_ListSiteUrl" name="sp_ListSiteUrl" value={currentApplication?.sp_ListSiteUrl || ''} onChange={handleInputChange} required />
                <label htmlFor='sp_ListSiteUrl'>Site URL</label>

              </div>
            </>
          )}
          {selectedDataSource === 'API' && (
            <>
              <h5 className='text-quaternary text-center'>Authentication</h5>

              <div className="row">
                <div className="col-sm-4">
                  <div className="form-floating mb-2">
                    <select name="Api_authentication" id="Api_authentication" className='form-select' value={currentApplication?.Api_authentication || ''} onChange={handleInputChange}>
                      <option value="None">None</option>
                      <option value="Basic">Basic</option>
                      <option value="JWT">JWT</option>
                      <option value="OAuth">OAuth</option>
                      <option value="Bearer">Bearer</option>
                      <option value="ApiKey">Api Key</option>
                    </select>
                    {/* <input type="text" className="form-control" name="Api_authentication" value={currentApplication?.Api_authentication || ''} onChange={handleInputChange} required /> */}
                    <label htmlFor='Api_authentication'>Authentication Type</label>

                  </div>
                </div>
                <div className="col-sm-4">
                  <div className="form-floating mb-2">
                    <input type="text" className="form-control" id="Api_username" name="Api_username" value={currentApplication?.Api_username || ''} onChange={handleInputChange} />
                    <label htmlFor='Api_username'>User name</label>
                  </div>

                </div>
                <div className="col-sm-4">
                  <div className="form-floating mb-2">
                    <input type="text" className="form-control" id="Api_password" name="Api_password" value={currentApplication?.Api_password || ''} onChange={handleInputChange} />
                    <label htmlFor='Api_password'>Password</label>

                  </div>
                </div>
              </div>
              <h5 className='text-quaternary text-center'>Delegation Api</h5>
              <div className="row">
                <div className="col-sm-4">
                  <div className="form-floating mb-2">
                    <input type="url" className="form-control" id="Api_url" name="Api_url" value={currentApplication?.Api_url || ''} onChange={handleInputChange} required />
                    <label htmlFor='Api_url'> Api Url</label>

                  </div>
                  <div className="form-floating mb-2">
                    <input type="text" className="form-control" id="Api_headers" name="Api_headers" value={currentApplication?.Api_headers || ''} onChange={handleInputChange} />
                    <label htmlFor='Api_headers'>Headers</label>

                  </div>


                </div>
                <div className="col-sm-4">

                  <div className="form-floating mb-2">
                    <select name="Api_method" id="Api_method" className='form-select' value={currentApplication?.Api_method || ''} onChange={handleInputChange}>
                      <option value="GET">Get</option>
                      <option value="POST">Post</option>
                      <option value="PUT">Put</option>
                      <option value="DELETE">Delete</option>

                    </select>
                    <label htmlFor='Api_method'>HTTP Method</label>

                    {/* <input type="text" className="form-control" name="crabd_api_method" value={currentApplication?.crabd_api_method || ''} onChange={handleInputChange} required /> */}
                  </div>
                  <div className="form-floating mb-2">
                    <input type="text" className="form-control" id="Api_body" name="Api_body" value={currentApplication?.Api_body || ''} onChange={handleInputChange} />
                    <label htmlFor='Api_body'>Body PayLoad</label>

                  </div>




                </div>
                <div className="col-sm-4">

                  <div className="form-floating mb-2">
                    <input type="text" id="Api_querystring" className="form-control" name="Api_querystring" value={currentApplication?.Api_querystring || ''} onChange={handleInputChange} />
                    <label htmlFor='Api_querystring'>Query String</label>

                  </div>



                </div>

              </div>
              <h5 className='text-quaternary text-center'>My Pending Api</h5>
              <div className="row">
                <div className="col-sm-4">
                  <div className="form-floating mb-2">
                    <input type="url" className="form-control" id="MyPending_Api_url" name="MyPending_Api_url" value={currentApplication?.MyPending_Api_url || ''} onChange={handleInputChange} required />
                    <label htmlFor='MyPending_Api_url'>Api url</label>

                  </div>
                  <div className="form-floating mb-2">
                    <input type="text" className="form-control" id="MyPending_Api_headers" name="MyPending_Api_headers" value={currentApplication?.MyPending_Api_headers || ''} onChange={handleInputChange} />
                    <label htmlFor='MyPending_Api_headers'>Headers</label>

                  </div>


                </div>
                <div className="col-sm-4">

                  <div className="form-floating mb-2">
                    <select name="MyPending_Api_method" id="MyPending_Api_method " className='form-select' value={currentApplication?.MyPending_Api_method || ''} onChange={handleInputChange}>
                      <option value="GET">Get</option>
                      <option value="POST">Post</option>
                      <option value="PUT">Put</option>
                      <option value="DELETE">Delete</option>

                    </select>
                    <label htmlFor='MyPending_Api_method '>MyPending Api HTTP Method</label>

                    {/* <input type="text" className="form-control" name="crabd_api_method" value={currentApplication?.crabd_api_method || ''} onChange={handleInputChange} required /> */}
                  </div>
                  <div className="form-floating mb-2">
                    <input type="text" className="form-control" id="MyPending_Api_body" name="MyPending_Api_body" value={currentApplication?.MyPending_Api_body || ''} onChange={handleInputChange} />
                    <label htmlFor='MyPending_Api_body'>Body PayLoad</label>

                  </div>

                </div>
                <div className="col-sm-4">

                  <div className="form-floating mb-2">
                    <input type="text" id="MyPending_Api_querystring" className="form-control" name="MyPending_Api_querystring" value={currentApplication?.MyPending_Api_querystring || ''} onChange={handleInputChange} />
                    <label htmlFor='MyPending_Api_querystring'>Query String</label>

                  </div>
                </div>

              </div>

            </>
          )}
          <div className="d-flex justify-content-end mt-3 d-grid gap-1 d-md-flex">
            <button type="submit" className="btn tertiary text-white col-3">
              {currentApplication?.Id ? 'Update' : 'Save'}
            </button>
            <button type="button" className="btn text-white secondary col-3" onClick={handleCloseForm}>
              Cancel
            </button>
          </div>
        </form>
      )}
      <div className="overflow-auto">
        <table className="table mt-3 bordered">
          <thead >
            <tr>
              <th className="py-2 quaternary text-white text-nowrap ">Application Name</th>
              <th className="py-2 quaternary text-white text-nowrap ">Data Source Type</th>
              <th className="py-2 quaternary text-white text-nowrap ">Table Name</th>
              <th className="py-2 quaternary text-white text-nowrap">Approver Column Name</th>
              <th className="py-2 quaternary text-white text-nowrap">Actions</th>
            </tr>
          </thead>
          <tbody>
            {applications.map((application) => (
              <tr key={application.Id}>
                <td className='text-nowrap bg-light'>{application.ApplicationName}</td>
                <td className="text-nowrap">
                  {application.datasourceType === "SQL"
                    ? "Azure SQL"
                    : application.datasourceType === "SPList"
                      ? "SharePoint List"
                      : application.datasourceType}
                </td>
                <td className='text-nowrap'>{application.tablename??"N/A"}</td>
                <td className='text-nowrap'>{application.colname??"N/A"}</td>

                <td className="text-nowrap">
                  <div className="d-flex justify-content-center align-items-center">
                    <button
                      className="btn secondary text-white"
                      onClick={() => handleEdit(application)}
                    >
                      Edit
                    </button>
                    <button
                      className="btn btn-danger text-white ms-2"
                      onClick={() => application.Id && handleDelete(application.Id)} // Check if Id is defined
                    >
                      Delete
                    </button>
                  </div>
                </td>

              </tr>
            ))}
          </tbody>
        </table>
      </div>

    </div>
  );
};

export default ApplicationRegistration;
