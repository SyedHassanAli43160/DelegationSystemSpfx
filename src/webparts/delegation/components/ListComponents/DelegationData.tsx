import * as React from 'react';
import { useEffect, useState, useCallback, useMemo } from 'react';
import { DelegationService } from '../../../ListServices/DelegationService';
import { WebPartContext } from '@microsoft/sp-webpart-base';

interface DelegationsPageProps {
  context: WebPartContext;  // Define a prop for context
}

const DelegationsPage: React.FC<DelegationsPageProps> = ({ context }) => {
  const [delegations, setDelegations] = useState<Array<{ DelegateTo: number; StartDate: Date; EndDate: Date }>>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Memoize the delegationService so it doesn't get recreated on each render
  const delegationService = useMemo(() => new DelegationService(context), [context]);

  // useCallback ensures the function is not redefined unless context changes
  const fetchDelegations = useCallback(async () => {
    try {
      const data = await delegationService.getDelegationsForCurrentUser();
      setDelegations(data);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching delegations:', err);
      setError(err.message || "An unknown error occurred");
      setLoading(false);
    }
  }, [delegationService]);  // Dependency is only on the delegationService

  // Only fetch the data if delegations are not already loaded
  useEffect(() => {
    if (delegations.length === 0) {  // Fetch only if delegations array is empty
      fetchDelegations();
    }
  }, [fetchDelegations, delegations.length]);  // This will only run again if delegations length changes

  // Handle loading and error states
  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div>
      <h1>Delegations for Current User</h1>
      <table>
        <thead>
          <tr>
            <th>Delegate To</th>
            <th>Start Date</th>
            <th>End Date</th>
          </tr>
        </thead>
        <tbody>
          {delegations.length > 0 ? (
            delegations.map((delegation, index) => (
              <tr key={index}>
                <td>{delegation.DelegateTo}</td>
                <td>{delegation.StartDate.toLocaleDateString()}</td> {/* Formatting date */}
                <td>{delegation.EndDate.toLocaleDateString()}</td> {/* Formatting date */}
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={3}>No delegations available.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default DelegationsPage;
