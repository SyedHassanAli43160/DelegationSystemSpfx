import * as React from 'react';
import ApplicationRegistration from './ListComponents/ApplicationRegistration';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../../../Assets/style.css';
import Delegation from './ListComponents/Delegation';
import GroupedTasksTable from './ListComponents/MyPending';

interface TabNavigationProps {
  context: any; // Replace 'any' with the specific type if needed
  ActiveDelegation: boolean;
  ActiveMyPending: boolean;
  ActiveAppRegistration:boolean;
}

interface TabNavigationState {
  activeTab: string;
}

export default class TabNavigation extends React.Component<TabNavigationProps, TabNavigationState> {
  constructor(props: TabNavigationProps) {
    super(props);
    this.state = {
      activeTab: '', // Default active tab
    };
  }

  handleTabClick = (tab: string) => {
    this.setState({ activeTab: tab });
  };

  render() {
    const { activeTab } = this.state;
    const { context, ActiveDelegation, ActiveMyPending,ActiveAppRegistration } = this.props;

    return (
      <div>
        {!ActiveAppRegistration&&!ActiveDelegation&&!ActiveMyPending &&(
          <div className='text-center p-4'>
           <h5 className='text-quaternary'>Please Enable Navigation From Edit Menu</h5> 
          </div>
        )}
        {/* Navigation Tabs */}
        <ul className="nav nav-tabs bg-light justify-content-center mb-4">
          {ActiveAppRegistration && 
  <li className="nav-item">
  <a
    className={`nav-link ${activeTab === 'ApplicationRegistration' ? 'active fw-bold' : 'text-black'}`}
    href="#"
    onClick={() => this.handleTabClick('ApplicationRegistration')}
  >
    Application Registration
  </a>
</li>
          }
        

          {/* Conditional rendering of the Delegation tab */}
          {ActiveDelegation && (
            <li className="nav-item">
              <a
                className={`nav-link ${activeTab === 'Delegation' ? 'active fw-bold' : 'text-black'}`}
                href="#"
                onClick={() => this.handleTabClick('Delegation')}
              >
                Delegation
              </a>
            </li>
          )}

          {/* Conditional rendering of the My Pending tab */}
          {ActiveMyPending && (
            <li className="nav-item">
              <a
                className={`nav-link ${activeTab === 'MyPending' ? 'active fw-bold' : 'text-black'}`}
                href="#"
                onClick={() => this.handleTabClick('MyPending')}
              >
                My Pending
              </a>
            </li>
          )}
        </ul>

        {/* Tab Content */}
        <div className="tab-content">
          {activeTab === 'ApplicationRegistration' && (
            <div className="tab-pane fade show active">
              <ApplicationRegistration context={context} />
            </div>
          )}
          {activeTab === 'Delegation' && (
            <div className="tab-pane fade show active">
              <Delegation context={context} />
            </div>
          )}
          {activeTab === 'MyPending' && (
            <div className="tab-pane fade show active">
              <GroupedTasksTable context={context} />
            </div>
          )}
        </div>
      </div>
    );
  }
}
