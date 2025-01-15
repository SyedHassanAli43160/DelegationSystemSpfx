import * as React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { DataService } from '../../../Services/ApplicationService';
import { WebPartContext } from "@microsoft/sp-webpart-base";
import { IApplication } from "../../../../Interfaces/IApplication";
const ApplicationRegistration = ({ context }: { context: WebPartContext }) => {
  const [applications, setApplications] = React.useState<IApplication[]>([]);
  const [currentApplication, setCurrentApplication] = React.useState<IApplication | null>(null);
  const [selectedDataSource, setSelectedDataSource] = React.useState<string>('Dataverse');
  const [showForm, setShowForm] = React.useState(false);
  const service = new DataService(context);

  React.useEffect(() => {
    async function fetchApplications() {
      const applications = await service.getApplications();
      setApplications(applications);
    }
    fetchApplications();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setCurrentApplication(prevState =>
      prevState ? { ...prevState, [name]: value } : null
    );
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      if (currentApplication) {
        const applicationToSave: IApplication = { ...currentApplication };

        // Check if we are updating or creating
        if (applicationToSave.crabd_getzapplicationid) {
          // Update existing application
          await service.updateApplication(applicationToSave);
          setApplications(applications.map(app => (app.crabd_getzapplicationid === applicationToSave.crabd_getzapplicationid ? applicationToSave : app)));
        } else {
          // Create new application
          const createdApplication = await service.createApplication(applicationToSave);
          setApplications(prevApplications => [...prevApplications, createdApplication]);
        }

        setShowForm(false);
        setCurrentApplication(null);
      }
    } catch (error) {
      console.error("Error saving application:", error);
    }
  };


  const handleEdit = (application: IApplication) => {
    console.log(application);
    setCurrentApplication(application);

    setSelectedDataSource(application.crabd_datasourcetype || 'Dataverse');
    setShowForm(true);
  };

  const handleDelete = async (getzapplicationid: string) => {
    try {
      await service.deleteApplication(getzapplicationid);
      setApplications(applications.filter(app => app.crabd_getzapplicationid !== getzapplicationid));
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
      <h1 className='w-100 text-center'>Applications</h1>
      <a className="btn btn-outline-primary w-25" onClick={() => {
        setCurrentApplication({
          crabd_getzapplicationid: "",
          crabd_applicationname: '',
          crabd_datasourcetype: 'Dataverse',
          crabd_dv_primaryentityname: '',
          crabd_dv_relationshipname: '',
          crabd_dv_environmenturl: '',
          crabd_appurl: '',
          crabd_sql_servername: '',
          crabd_sql_databasename: '',
          crabd_sql_schemaname: '',
          crabd_sql_username: '',
          crabd_sql_password: '',
          crabd_sp_listsiteurl: '',
          // crabd_sp_listname: '',
          // crabd_sp_listidcolumn: '',
          crabd_tablename: '',
          crabd_colname: '',
          crabd_childtable: '',
          crabd_childcol: ''
        });
        setSelectedDataSource('Dataverse');
        setShowForm(true);
      }}>Add New +</a>

      {showForm && (
        <form onSubmit={handleSubmit} className="mt-3">

          <div className="row">

            <div className="col-sm-6">
              <div className="form-floating mb-2">
                <input type="text" id="crabd_applicationname" className="form-control" name="crabd_applicationname" value={currentApplication?.crabd_applicationname || ''} onChange={handleInputChange} required />
                <label htmlFor="crabd_applicationname">Application Name</label>

              </div>
              <div className="form-floating mb-2">

                <input type="text" className="form-control" id="crabd_appurl" name="crabd_appurl" value={currentApplication?.crabd_appurl || ''} onChange={handleInputChange} required />
                <label htmlFor='crabd_appurl'>Application Url</label>

              </div>
              <div className="form-floating mb-2">
                <input type="text" className="form-control" id="crabd_childtable" name="crabd_childtable" value={currentApplication?.crabd_childtable || ''} onChange={handleInputChange} />
                <label htmlFor='crabd_childtable'>Child Table/List</label>

              </div>
            </div>
            <div className="col-sm-6">
              <div className="form-floating mb-2">
                <input type="text" className="form-control" id="crabd_tablename" name="crabd_tablename" value={currentApplication?.crabd_tablename || ''} onChange={handleInputChange} required />
                <label htmlFor='crabd_tablename'>Table/List Name</label>
                
              </div>
              <div className="form-floating mb-2">
                <input type="text" className="form-control" id="crabd_colname" name="crabd_colname" value={currentApplication?.crabd_colname || ''} onChange={handleInputChange} required />
                <label htmlFor='crabd_colname'>Column Name</label>

              </div>
              <div className="form-floating mb-2">
                <input type="text" className="form-control" id="crabd_childcol" name="crabd_childcol" value={currentApplication?.crabd_childcol || ''} onChange={handleInputChange} />
                <label htmlFor='crabd_childcol'>Child Column</label>

              </div>
            </div>
          </div>
          <div className="form-floating mb-2">
            <select className="form-select" id="datasource" value={selectedDataSource} onChange={(e) => {
              setSelectedDataSource(e.target.value);
              if (currentApplication) {
                setCurrentApplication({
                  ...currentApplication,
                  crabd_datasourcetype: e.target.value as "Dataverse" | "SQL" | "SPList" | "API"
                });
              }
            }} disabled={!!currentApplication?.crabd_getzapplicationid}>
              <option value="">Select Data Source</option>
              <option value="Dataverse">Dataverse</option>
              <option value="SPList">SPList</option>
              <option value="SQL">SQL</option>
              <option value="API">Api</option>

            </select>
            <label htmlFor='datasource'>Data Source Type</label>

          </div>




          {selectedDataSource === 'Dataverse' && (
            <>
              <div className="row">
                <div className="col-sm-4">
                  <div className="form-floating mb-2">
                    <input type="text" className="form-control" id="crabd_dv_primaryentityname" name="crabd_dv_primaryentityname" value={currentApplication?.crabd_dv_primaryentityname || ''} onChange={handleInputChange} required />
                    <label htmlFor='crabd_dv_primaryentityname'>Primary Entity Name</label>

                  </div>

                </div>
                <div className="col-sm-4">
                  <div className="form-floating mb-2">
                    <input type="url" className="form-control" id="crabd_dv_environmenturl" name="crabd_dv_environmenturl" value={currentApplication?.crabd_dv_environmenturl || ''} onChange={handleInputChange} required />
                    <label htmlFor='crabd_dv_environmenturl'>Environment URL</label>
                  </div>
                </div>
                <div className="col-sm-4">
                  <div className="form-floating mb-2">
                    <input type="text" className="form-control" id="crabd_dv_relationshipname" name="crabd_dv_relationshipname" value={currentApplication?.crabd_dv_relationshipname || ''} onChange={handleInputChange} required />
                    <label htmlFor='crabd_dv_relationshipname'>Relationship Name</label>
                  </div>
                </div>

              </div>
            </>
          )}

          {selectedDataSource === 'SQL' && (
            <>
              <div className="row">
                <div className="col-sm-4">
                  <div className="form-floating mb-2">
                    <input type="text" className="form-control" id="crabd_sql_servername" name="crabd_sql_servername" value={currentApplication?.crabd_sql_servername || ''} onChange={handleInputChange} required />
                    <label htmlFor='crabd_sql_servername'>Server Name</label>

                  </div>
                  <div className="form-floating mb-2">
                    <input type="text" className="form-control" id="crabd_sql_username" name="crabd_sql_username" value={currentApplication?.crabd_sql_username || ''} onChange={handleInputChange} required />
                    <label htmlFor='crabd_sql_username'>Username</label>
                  </div>


                </div>
                <div className="col-sm-4">
                  <div className="form-floating mb-2">
                    <input type="text" className="form-control" id="crabd_sql_schemaname" name="crabd_sql_schemaname" value={currentApplication?.crabd_sql_schemaname || ''} onChange={handleInputChange} required />
                    <label htmlFor='crabd_sql_schemaname'>Schema Name</label>

                  </div>
                  <div className="form-floating mb-2">
                    <input type="password" className="form-control" id="crabd_sql_password" name="crabd_sql_password" value={currentApplication?.crabd_sql_password || ''} onChange={handleInputChange} required />
                    <label htmlFor='crabd_sql_password'>Password</label>

                  </div>
                </div>
                <div className="col-sm-4">
                  <div className="form-floating mb-2">
                    <input type="text" className="form-control" id="crabd_sql_databasename" name="crabd_sql_databasename" value={currentApplication?.crabd_sql_databasename || ''} onChange={handleInputChange} required />
                    <label htmlFor='crabd_sql_databasename'>Database Name</label>

                  </div>

                </div>
              </div>


            </>
          )}

          {selectedDataSource === 'SPList' && (
            <>
              <div className="form-floating mb-2">
                <input type="url" className="form-control" id="crabd_sp_listsiteurl" name="crabd_sp_listsiteurl" value={currentApplication?.crabd_sp_listsiteurl || ''} onChange={handleInputChange} required />
                <label htmlFor='crabd_sp_listsiteurl'>Site URL</label>

              </div>
            </>
          )}
          {selectedDataSource === 'API' && (
            <>
              <div className="row">
                <div className="col-sm-4">
                  <div className="form-floating mb-2">
                    <input type="url" className="form-control" id="crabd_api_url" name="crabd_api_url" value={currentApplication?.crabd_api_url || ''} onChange={handleInputChange} required />
                    <label htmlFor='crabd_api_url'>Api Url</label>

                  </div>
                  <div className="form-floating mb-2">
                    <input type="text" className="form-control" id="crabd_api_headers" name="crabd_api_headers" value={currentApplication?.crabd_api_headers || ''} onChange={handleInputChange} required />
                    <label htmlFor='crabd_api_headers'>Header</label>

                  </div>
                  <div className="form-floating mb-2">
                    <select name="crabd_api_authentication" id="crabd_api_authentication" className='form-select' value={currentApplication?.crabd_api_authentication || ''} onChange={handleInputChange}>
                      <option value="None">None</option>
                      <option value="JWT">JWT</option>
                      <option value="OAuth">OAuth</option>
                      <option value="Bearer">Bearer</option>
                      <option value="ApiKey">Api Key</option>
                    </select>
                    {/* <input type="text" className="form-control" name="crabd_api_authentication" value={currentApplication?.crabd_api_authentication || ''} onChange={handleInputChange} required /> */}
                    <label htmlFor='crabd_api_authentication'>Authentication Type</label>

                  </div>

                </div>
                <div className="col-sm-4">

                  <div className="form-floating mb-2">
                    <select name="crabd_api_method" id="crabd_api_method" className='form-select' value={currentApplication?.crabd_api_method || ''} onChange={handleInputChange}>
                      <option value="Get">Get</option>
                      <option value="Post">Post</option>
                      <option value="Put">Put</option>
                      <option value="Delete">Delete</option>

                    </select>
                    <label htmlFor='crabd_api_method'>HTTP Method</label>

                    {/* <input type="text" className="form-control" name="crabd_api_method" value={currentApplication?.crabd_api_method || ''} onChange={handleInputChange} required /> */}
                  </div>
                  <div className="form-floating mb-2">
                    <input type="text" className="form-control" id="crabd_api_body" name="crabd_api_body" value={currentApplication?.crabd_api_body || ''} onChange={handleInputChange} required />
                    <label htmlFor='crabd_api_body'>Body</label>

                  </div>
                  <div className="form-floating mb-2">
                    <input type="text" className="form-control" id="crabd_api_username" name="crabd_api_username" value={currentApplication?.crabd_api_username || ''} onChange={handleInputChange} required />
                    <label htmlFor='crabd_api_username'>User name</label>
                    </div>




                </div>
                <div className="col-sm-4">
                  <div className="form-floating mb-2">
                    <select name="crabd_api_screentype" id="crabd_api_screentype" className='form-select' value={currentApplication?.crabd_api_screentype || ''} onChange={handleInputChange}>
                      <option value="Delegation">Delegation</option>
                      <option value="MyPending">My Pending</option>
                    </select>
                    <label htmlFor='crabd_api_screentype'>Screen Type</label>

                  </div>
                  <div className="form-floating mb-2">
                    <input type="text" id="crabd_api_querystring" className="form-control" name="crabd_api_querystring" value={currentApplication?.crabd_api_querystring || ''} onChange={handleInputChange} required />
                    <label htmlFor='crabd_api_querystring'>Query String</label>

                  </div>


                  <div className="form-floating mb-2">
                    <input type="text" className="form-control" id="crabd_api_password" name="crabd_api_password" value={currentApplication?.crabd_api_password || ''} onChange={handleInputChange} required />
                    <label htmlFor='crabd_api_password'>Password</label>

                  </div>
                </div>

              </div>



            </>
          )}
          <div className="row mt-2">
            <div className="col-sm-6">
              <button type="submit" className="btn btn-primary w-100 text-center">Save</button>

            </div>
            <div className="col-sm-6">
              <button type="button" className="btn btn-secondary w-100 text-center" onClick={handleCloseForm}>Close</button>

            </div>
          </div>
        </form>
      )}

      <div className='overflow-auto'>
      <table className="table table-striped table-bordered mt-4 ">
        <thead>
          <tr className='table-primary'>
            <th className='text-nowrap'>Application Name</th>
            <th className='text-nowrap'>Application Url</th>
            <th className='text-nowrap'>Data Source Type</th>
            <th className='text-nowrap'>Table Name</th>
            <th className='text-nowrap'>Column Name</th>
            <th className='text-nowrap'>Child Table Name</th>
            <th className='text-nowrap'>Child Column Name</th>
            <th className='text-nowrap'>Actions</th>
          </tr>
        </thead>
        <tbody>
          {applications.map(application => (
            <tr key={application.crabd_getzapplicationid}>
              <td className='text-nowrap'>{application.crabd_applicationname}</td>
              <td className='text-nowrap'><a href={application.crabd_appurl} target='_blank'>{application.crabd_appurl}</a></td>

              <td className='text-nowrap'>{application.crabd_datasourcetype}</td>
              <td className='text-nowrap'>{application.crabd_tablename != null ? application.crabd_tablename : 'N/A'}</td>
              <td className='text-nowrap'>{application.crabd_colname != null ? application.crabd_colname : 'N/A'}</td>
              <td className='text-nowrap'>{application.crabd_childtable != null ? application.crabd_childtable : 'N/A'}</td>
              <td className='text-nowrap'>{application.crabd_childcol != null ? application.crabd_childcol : 'N/A'}</td>

              <td className='text-nowrap' style={{ display: 'flex', gap: '8px' }}>
  <button 
    className="btn btn-warning" 
    onClick={() => handleEdit(application)}
  >
    Edit
  </button>
  <button
    className="btn btn-danger"
    onClick={() => {
      if (application.crabd_getzapplicationid) {
        handleDelete(application.crabd_getzapplicationid);
      } else {
        console.error("Application ID is undefined, cannot delete the application.");
      }
    }}
  >
    Delete
  </button>
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
