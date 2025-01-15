import * as React from 'react';
import { IPeoplePickerContext, PeoplePicker, PrincipalType } from "@pnp/spfx-controls-react/lib/PeoplePicker";

interface PeoplePickerComponentProps {
  context: any; // Replace with the specific type if available
  onChange: (items: any[]) => void; // Callback for handling the selected items
  selectedEmails?: string[]; // Optional prop to pass selected emails
}

const PeoplePickerComponent: React.FC<PeoplePickerComponentProps> = ({ context, onChange, selectedEmails }) => {
  const peoplePickerContext: IPeoplePickerContext = {
    absoluteUrl: context.pageContext.web.absoluteUrl,
    msGraphClientFactory: context.msGraphClientFactory,
    spHttpClient: context.spHttpClient,
  };

  return (
    <PeoplePicker
      context={peoplePickerContext}
      personSelectionLimit={1}
      groupName={""} // Leave blank if filtering from all users
      showtooltip={true}
      required={true}
      disabled={false}
      searchTextLimit={5}
      onChange={onChange} // Callback to handle selected items
      principalTypes={[PrincipalType.User]}
      resolveDelay={1000}
      defaultSelectedUsers={selectedEmails} // Pass the selectedEmails as default selected users
    />
  );
};

export default PeoplePickerComponent;
