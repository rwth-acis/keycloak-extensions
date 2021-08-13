import * as React from "react";
import {AccountServiceContext} from "../../account-service/AccountServiceContext";
import {ContentPage} from "../ContentPage";
import {withRouter, RouteComponentProps} from 'react-router-dom';
import {Msg} from "../../widgets/Msg";
import {Form} from "@patternfly/react-core";
import {ClientRepresentation} from "./ClientRepresentation";
import {HttpResponse} from "../../account-service/account.service";
import {Client} from "./UserClientPage";
import {ContentAlert} from "../ContentAlert";

// can be found at /keycloak.v2/account/index.ftl
declare const authUrl: string;
declare const realm: string;

interface routeParams {
    id: string;
}

export interface ManagePageProps extends RouteComponentProps<routeParams> {
}

export interface ManagePageState {
    // isRowOpen already here for later use and expanding the list of clients
    noClient: boolean;
    isExtended: boolean[];
    client: ClientRepresentation;
}

export const emptyClientFields = {
    clientId: '',
    name: '',
    description: '',
    secret: '',
    enabled: false,
    alwaysDisplayInConsole: false,
    consentRequired: false,
    bearerOnly: false,
    publicClient: false,
    standardFlowEnabled: false,
    implicitFlowEnabled: false,
    directAccessGrantsEnabled: false,
    serviceAccountsEnabled: false,

    rootUrl: '',
    redirectUris: [],
    baseUrl: '',
    adminUrl: '',
    webOrigins: [],

    defaultClientScopes: [],
    optionalClientScopes: [],

    attributes: {
        "backchannel.logout.url": '',
        "backchannel.logout.session.required": "false",
        "backchannel.logout.revoke.offline.tokens": "false",
        "oauth2.device.authorization.grant.enabled": "false",

        "access.token.lifespan": '',
        "client.session.idle.timeout": '',
        "client.session.max.lifespan": '',
        "client.offline.session.idle.timeout": '',
        "client.offline.session.max.lifespan": '',
        "tls.client.certificate.bound.access.tokens": '',
        "pkce.code.challenge.method": '',
        "use.refresh.tokens": "false",
        "client_credentials.use_refresh_token": "false",
        "exclude.session.state.from.auth.response": "false",
    }
}


export class ManageClient extends React.Component<ManagePageProps, ManagePageState> {
    static contextType = AccountServiceContext;
    context: React.ContextType<typeof AccountServiceContext>;


    public constructor(props: ManagePageProps, context: React.ContextType<typeof AccountServiceContext>) {
        super(props);
        this.context = context;
        this.state = {
            noClient: true,
            isExtended: [false, false],
            client: emptyClientFields,
        }

        if (this.props.match.params.id !== undefined) {
            this.requestClient(this.props.match.params.id)
        }
    }

    private requestClient(clientId: string): void {
        let url = authUrl + 'realms/' + realm + '/userClientAdministration/client/' + clientId;
        this.context!.doGet<ClientRepresentation>(url).then((response: HttpResponse<ClientRepresentation>) => {
            if (response.ok){
                console.log(this.state)
                const clientData = response.data || emptyClientFields;
                this.setState({
                    noClient: false,
                    isExtended: [false, false],
                    client: clientData,
                });
                console.log("got client data:");
                console.log(response.data);
                console.log(this.state.client)
            }
            else {
                ContentAlert.warning('You have no access to the client!.\n' +  response.status + ' ' + response.statusText);
            }
        });
        if (this.state.client == emptyClientFields){
            console.log("got no data for client")
            ContentAlert.warning('No data was send for the client ' + clientId)
        }
    }

    private handleSubmit = (event: React.FormEvent<HTMLFormElement>): void => {

    }

    public render(): React.ReactNode {
        console.log(this.props);
        return(
            <ContentPage title={(this.state.noClient ? 'Create new client' : Msg.localize("manageClientTitle") + this.state.client.clientId)}
                         introMessage={(this.state.noClient ? '' : Msg.localize("manageClientDescription"))}>
                {/*<Form isHorizontal onSubmit={event => this.handleSubmit(event)}>*/}

                {/*</Form>*/}
                <h1>{this.state.client.clientId}</h1>
            </ContentPage>
        );
    }

}
export const ManageClientPage = withRouter(ManageClient);