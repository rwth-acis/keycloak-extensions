import * as React from "react";
import {AccountServiceContext} from "../../account-service/AccountServiceContext";
import {Client, ClientsPageProps, ClientsPageState} from "./UserClientPage";


export interface ManagePageState {
    // isRowOpen already here for later use and expanding the list of clients
    isExtended: boolean[];
    clientId: string;
}

export class ManageClientPage extends React.Component<any, ManagePageState> {
    static contextType = AccountServiceContext;
    context: React.ContextType<typeof AccountServiceContext>;

    public constructor(props: ClientsPageProps, context: React.ContextType<typeof AccountServiceContext>) {
        super(props);
        this.context = context;
        if(this.props.location.clientId != null || this.props.location.clientId != '') {
            this.setState({
                isExtended: [false, false],
                clientId: this.props.location.clientId,
            })
        } else {
            this.state = {
                isExtended: [],
                clientId: ''
            };
        }
    }

}