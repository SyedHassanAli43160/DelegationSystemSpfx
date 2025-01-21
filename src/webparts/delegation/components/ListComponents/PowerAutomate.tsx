import * as React from 'react';
import { useState, useEffect } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import { tokenService } from '../../../Services/AuthTokenService';

interface IApproval {
  id: string;
  title: string;
  status: string;
  details: string;
  assignedTo: string;
}

const MyApprovals: React.FC<{ context: any }> = () => {
  const [approvals, setApprovals] = useState<IApproval[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedApprovalId, setSelectedApprovalId] = useState<string | null>(null);
  const [comment, setComment] = useState('');
  const [showModal, setShowModal] = useState(false);  
  const [showReassignModal, setShowReassignModal] = useState(false);
  const [newUserEmail, setNewUserEmail] = useState('');
  // const envid = "Default-d47cdcb6-440e-4098-b123-dd3e56360888";
  const envid = "Default-bce03466-f793-402c-9ae9-9c0d6d4f1a87";

  // Fetch approvals data from Power Automate API
  const getApprovalData = async (): Promise<IApproval[]> => {
    const accessToken = await tokenService.getAccessToken();
    try {
      // Fetch approval requests using the Power Automate API
      const url = `https://api.flow.microsoft.com/providers/Microsoft.ProcessSimple/environments/${envid}/approvalViews?$top=50&$filter=properties/userRole+eq+'Approver'+and+properties/isActive+eq+'true'+and+properties/isDescending+eq+'true'&api-version=2016-11-01`;
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Error fetching approvals: ${response.status}`);
      }

      const data = await response.json();

      // Map approval data to fit your structure
      return data.value.map((item: any) => ({
        id: item.name,
        title: item.properties.title,
        details: item.properties.details,
        status: 'Pending',
      }));
    } catch (error) {
      console.error('Error fetching approvals: ', error);
      return [];
    }
  };

  // Handle action (approve/reject)
  const handleAction = async (action: 'Approve' | 'Reject') => {
    if (!selectedApprovalId) return;

    const accessToken = await tokenService.getAccessToken();
    const url = `https://api.flow.microsoft.com/providers/Microsoft.ProcessSimple/environments/${envid}/approvals/${selectedApprovalId}/approvalResponses`;

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          properties: { response: action, comments: comment },
        }),
      });

      if (!response.ok) {
        throw new Error(`Error processing approval with ID: ${selectedApprovalId}`);
      }

      // Update the approval status in the UI
      setApprovals((prevApprovals) =>
        prevApprovals.map((approval) =>
          approval.id === selectedApprovalId ? { ...approval, status: action.toLowerCase() } : approval
        )
      );

      setLoading(true);
      const approvalData = await getApprovalData(); // Fetch updated approval list
      setApprovals(approvalData);
      setLoading(false);

      // Reset states and notify user
      setSelectedApprovalId(null);
      setComment('');
      alert(`Approval ${action.toLowerCase()}d successfully!`);
      setShowModal(false);
    } catch (error) {
      console.error('Error processing action:', error);
      alert(`Failed to ${action.toLowerCase()} the approval. Please try again.`);
    }
  };

  // Handle reassign action
  const handleReassign = async () => {
    if (!newUserEmail || !selectedApprovalId) return;

    const accessToken = await tokenService.getAccessToken();

    // Step 1: Fetch the approval request details
    const requestIdUrl = `https://api.flow.microsoft.com/providers/Microsoft.ProcessSimple/environments/${envid}/approvals/${selectedApprovalId}/approvalRequests`;

    try {
      const requestIdResponse = await fetch(requestIdUrl, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
      });

      if (!requestIdResponse.ok) {
        throw new Error(`Error fetching request ID for approval with ID: ${selectedApprovalId}`);
      }

      const requestIdData = await requestIdResponse.json();
      if (!requestIdData || requestIdData.length === 0) {
        throw new Error('No approval request found for this approval.');
      }

      // Extract the requestId (this is the part after the last slash in the 'id' field)
      const fullRequestId = requestIdData[0].id; // Full URI
      const requestId = fullRequestId.split('/').pop(); // Extract only the last part
      // Step 2: Reassign the approval using the fetched requestId
      const reassignUrl = `https://api.flow.microsoft.com/providers/Microsoft.ProcessSimple/environments/${envid}/approvals/${selectedApprovalId}/approvalRequests/${requestId}/reassign?api-version=2016-11-01`;

      const reassignResponse = await fetch(reassignUrl, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ "assignedTo": newUserEmail }
        ),
      });

      if (!reassignResponse.ok) {
        throw new Error(`Error reassigning task with ID: ${selectedApprovalId}`);
      }

      // Step 3: Update the approval list in the UI
      setApprovals((prevApprovals) =>
        prevApprovals.map((approval) =>
          approval.id === selectedApprovalId ? { ...approval, assignedTo: newUserEmail } : approval
        )
      );

      alert('Task reassigned successfully!');

      setLoading(true);
      const approvalData = await getApprovalData(); // Fetch updated approval list
      setApprovals(approvalData);
      setLoading(false);
      setShowReassignModal(false);
      setNewUserEmail('');
    } catch (error) {
      console.error('Error reassigning task:', error);
      alert(`Failed to reassign the task. Error: ${error.message}`);
    }
  };



  // Fetch approvals when the component mounts
  useEffect(() => {
    const fetchApprovals = async () => {
      try {
        const approvalData = await getApprovalData();
        setApprovals(approvalData);
      } catch (error) {
        console.error('Error fetching approvals: ', error);
      } finally {
        setLoading(false);
      }
    };

    fetchApprovals();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h2 className="w-100 h2 py-4 text-quaternary text-center">My Pending Approvals</h2>
      {approvals.length === 0 ? (
        <div>No pending approvals found.</div>
      ) : (
        <div className="overflow-auto">
          <table className="table mt-3" style={{ width: '100%'}}>
            <thead>
              <tr>
                <th className="py-2 quaternary text-white">Title</th>
                <th className="py-2 quaternary text-white">Details</th>
                <th className="py-2 quaternary text-white">Status</th>
                <th className="py-2 quaternary text-white">Requested By</th>
                <th className="py-2 quaternary text-white">Actions</th>
              </tr>
            </thead>
            <tbody>
              {approvals.map((approval) => (
                <tr key={approval.id}>
                  <td>{approval.title.split("by")[0].trim()}</td>
                  <td>{approval.details}</td>
                  <td>{approval.status}</td>
                  <td>{approval.title.split("by")[1].trim()}</td>

                  <td>
                    {approval.status === 'Pending' && (
                      <>
                        <div className="d-flex gap-2">
                          <button
                            className="btn tertiary text-white"
                            onClick={() => {
                              setSelectedApprovalId(approval.id);
                              setShowModal(true);
                            }}
                          >
                            Take Action
                          </button>
                          <button
                            className="btn secondary text-white"
                            onClick={() => {
                              setSelectedApprovalId(approval.id);
                              setShowReassignModal(true);
                            }}
                          >
                            Reassign
                          </button>
                        </div>
                      </>
                    )}
                  </td>

                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Take Action</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Enter your comment..."
            style={{ width: '100%', height: '80px' }}
          />
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Cancel
          </Button>
          <Button className="text-white tertiary" onClick={() => handleAction('Approve')}>
            Approve
          </Button>
          <Button variant="danger" onClick={() => handleAction('Reject')}>
            Reject
          </Button>
        </Modal.Footer>
      </Modal>

      <Modal show={showReassignModal} onHide={() => setShowReassignModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Reassign Task</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group>
              <Form.Label>New User Email</Form.Label>
              <Form.Control
                type="email"
                value={newUserEmail}
                onChange={(e) => setNewUserEmail(e.target.value)}
                placeholder="Enter the new user's email"
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowReassignModal(false)}>
            Cancel
          </Button>
          <Button className="text-white tertiary" onClick={handleReassign}>
            Reassign
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default MyApprovals;
