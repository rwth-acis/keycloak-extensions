import * as React from "react";
import {AccountServiceContext} from "../../account-service/AccountServiceContext";
import {ContentPage} from "../ContentPage";
import {withRouter, RouteComponentProps} from 'react-router-dom';
import {Msg} from "../../widgets/Msg";

interface routeParams {
    id: string;
}
export interface ManagePageProps extends RouteComponentProps<routeParams> {
}

export interface ManagePageState {
    // isRowOpen already here for later use and expanding the list of clients
    // isExtended: boolean[];
    clientId: string;
}

export class ManageClient extends React.Component<ManagePageProps, ManagePageState> {
    static contextType = AccountServiceContext;
    context: React.ContextType<typeof AccountServiceContext>;


    public constructor(props: ManagePageProps, context: React.ContextType<typeof AccountServiceContext>) {
        super(props);
        this.context = context;
        if(this.props.match.params.id !== undefined) {
            this.state = {
                //isExtended: [false, false],
                clientId: this.props.match.params.id
            };
        } else {
            this.state = {
                //isExtended: [],
                clientId: ''
            };
        }
    }

    public render(): React.ReactNode {
        console.log(this.props);
        return(
            <ContentPage title={(this.state.clientId == '' ? 'Create new client' : Msg.localize("manageClientTitle") + this.state.clientId)}
                         introMessage={(this.state.clientId == '' ? '' : Msg.localize("manageClientDescription"))}>
                <h1>This is a test if anything is shown</h1>
            </ContentPage>
        );
    }

}
export const ManageClientPage = withRouter(ManageClient);