import * as React from "react";
import {AccountServiceContext} from "../../account-service/AccountServiceContext";
import {ContentPage} from "../ContentPage";
import {withRouter, RouteComponentProps} from 'react-router-dom';
import {Msg} from "../../widgets/Msg";
import {Form, FormGroup, Switch, TextInput} from "@patternfly/react-core";
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

    private handleChange = (value: string, event: React.FormEvent<HTMLInputElement>) => {
        const target = event.currentTarget;
        const name = target.name;

        this.setState({
            noClient: this.state.noClient,
            isExtended: this.state.isExtended,
            client: { ...this.state.client, [name]: value }
        });
    }

    private handleButtonChange = (value: boolean, event: React.FormEvent<HTMLInputElement>) => {
        const target = event.currentTarget;
        const name = target.name;

        this.setState({
            noClient: this.state.noClient,
            isExtended: this.state.isExtended,
            client: { ...this.state.client, [name]: value}
        });
    }

    private handleSubmit = (event: React.FormEvent<HTMLFormElement>): void => {

    }

    public render(): React.ReactNode {
        console.log(this.props);
        return(
            <ContentPage title={(this.state.noClient ? 'Create new client' : Msg.localize("manageClientTitle") + this.state.client.clientId)}
                         introMessage={(this.state.noClient ? '' : Msg.localize("manageClientDescription"))}>
                <Form isHorizontal onSubmit={event => this.handleSubmit(event)}>
                    <FormGroup
                        label={Msg.localize('clientId')}
                        isRequired
                        fieldId='client-id'
                    >
                        <TextInput
                            isRequired
                            type='text'
                            id='client-id'
                            name='clientId'
                            maxLength={254}
                            value={this.state.client.clientId}
                            onChange={this.handleChange}
                        />
                    </FormGroup>
                    <FormGroup
                        label={Msg.localize('clientName')}
                        fieldId='client-name'
                    >
                        <TextInput
                            type='text'
                            id='client-name'
                            name='name'
                            maxLength={254}
                            value={this.state.client.name ? this.state.client.name : ''}
                            onChange={this.handleChange}
                        />
                    </FormGroup>
                    <FormGroup
                        label={Msg.localize('clientDescription')}
                        fieldId='client-description'
                    >
                        <TextInput
                            type='text'
                            id='client-description'
                            name='description'
                            maxLength={254}
                            value={this.state.client.description ? this.state.client.description : ''}
                            onChange={this.handleChange}
                        />
                    </FormGroup>
                    <FormGroup
                        label={Msg.localize('clientSecret')}
                        isRequired
                        fieldId='client-secret'
                    >
                        <TextInput
                            isRequired
                            type='text'
                            id='client-secret'
                            name='secret'
                            maxLength={254}
                            value={this.state.client.secret ? this.state.client.secret : ''}
                            onChange={this.handleChange}
                        />
                    </FormGroup>
                    <FormGroup
                        label={Msg.localize('clientEnabled')}
                        fieldId='client-enabled'
                    >
                        <Switch
                            id='client-enabled'
                            name='enabled'
                            label='Disable the client'
                            labelOff='Enable the client'
                            isChecked={this.state.client.enabled}
                            onChange={this.handleButtonChange}
                        />
                    </FormGroup>
                    <FormGroup
                        label={Msg.localize('clientAlwaysDisplayInConsole')}
                        fieldId='client-always-display-in-console'
                    >
                        <Switch
                            id='client-always-display-in-console'
                            name='alwaysDisplayInConsole'
                            label='Client will not be shown in account console if unregistered'
                            labelOff='Client will be shown in account console if unregistered'
                            isChecked={this.state.client.alwaysDisplayInConsole}
                            onChange={this.handleButtonChange}
                        />
                    </FormGroup>
                    <FormGroup
                        label={Msg.localize('clientConsentRequired')}
                        fieldId='client-consent-required'
                    >
                        <Switch
                            id='client-consent-required'
                            name='consentRequired'
                            label='Login will not requests user consent'
                            labelOff='Login will requests user consent'
                            isChecked={this.state.client.consentRequired}
                            onChange={this.handleButtonChange}
                        />
                    </FormGroup>
                    // TODO: access type part -> bearerOnly, publicClient etc
                    <FormGroup
                        label={Msg.localize('clientStandardFlowEnabled')}
                        fieldId='client-standard-flow-enabled'
                    >
                        <Switch
                            id='client-standard-flow-enabled'
                            name='standardFlowEnabled'
                            label='Disable Standard Flow'
                            labelOff='Enable Standard Flow'
                            isChecked={this.state.client.standardFlowEnabled}
                            onChange={this.handleButtonChange}
                        />
                    </FormGroup>
                    <FormGroup
                        label={Msg.localize('clientImplicitFlowEnabled')}
                        fieldId='client-implicit-flow-enabled'
                    >
                        <Switch
                            id='client-implicit-flow-enabled'
                            name='implicitFlowEnabled'
                            label='Disable Implicit Flow'
                            labelOff='Enable Implicit Flow'
                            isChecked={this.state.client.implicitFlowEnabled}
                            onChange={this.handleButtonChange}
                        />
                    </FormGroup>
                    <FormGroup
                        label={Msg.localize('clientDirectAccessGrantsEnabled')}
                        fieldId='client-direct-access-grants-enabled'
                    >
                        <Switch
                            id='client-direct-access-grants-enabled'
                            name='directAccessGrantsEnabled'
                            label='Disable Direct Access Grants'
                            labelOff='Enable Direct Access Grants'
                            isChecked={this.state.client.directAccessGrantsEnabled}
                            onChange={this.handleButtonChange}
                        />
                    </FormGroup>
                    <FormGroup
                        label={Msg.localize('clientServiceAccountsEnabled')}
                        fieldId='client-service-accounts-enabled'
                    >
                        <Switch
                            id='client-service-accounts-enabled'
                            name='serviceAccountsEnabled'
                            label='Disable Service Accounts'
                            labelOff='Enable Service Accounts'
                            isChecked={this.state.client.serviceAccountsEnabled}
                            onChange={this.handleButtonChange}
                        />
                    </FormGroup>
                    <FormGroup
                        label={Msg.localize('clientOAuth2DeviceEnabled')}
                        fieldId='client-oauth2-device-enabled'
                    >
                        <Switch
                            id='client-oauth2-device-enabled'
                            name='attributes[\"oauth2.device.authorization.grant.enabled\"]'
                            label='Disable Service Accounts'
                            labelOff='Enable Service Accounts'
                            isChecked={this.state.client.attributes["oauth2.device.authorization.grant.enabled"] === 'true'}
                            onChange={this.handleButtonChange}
                        />
                    </FormGroup>
                    // TODO: BOOLEAN für enabled bis serviceAccountsEnabled + oauth2 device enabled
                    <FormGroup
                        label={Msg.localize('clientRootUrl')}
                        fieldId='client-root-url'
                    >
                        <TextInput
                            type='text'
                            id='client-root-url'
                            name='rootUrl'
                            maxLength={254}
                            value={this.state.client.rootUrl ? this.state.client.rootUrl : ''}
                            onChange={this.handleChange}
                        />
                    </FormGroup>
                    // TODO: string array fpr redirectUris _required
                    <FormGroup
                        label={Msg.localize('clientBaseUrl')}
                        fieldId='client-base-url'
                    >
                        <TextInput
                            type='text'
                            id='client-base-url'
                            name='baseUrl'
                            maxLength={254}
                            value={this.state.client.baseUrl ? this.state.client.baseUrl : ''}
                            onChange={this.handleChange}
                        />
                    </FormGroup>
                    <FormGroup
                        label={Msg.localize('clientAdminUrl')}
                        fieldId='client-admin-url'
                    >
                        <TextInput
                            type='text'
                            id='client-admin-url'
                            name='adminUrl'
                            maxLength={254}
                            value={this.state.client.adminUrl ? this.state.client.adminUrl : ''}
                            onChange={this.handleChange}
                        />
                    </FormGroup>
                    // TODO: webOrigins as array
                    <FormGroup
                        label={Msg.localize('clientBackChannelLogoutUrl')}
                        fieldId='client-backchannel-logout-url'
                    >
                        <TextInput
                            type='text'
                            id='client-backchannel-logout-url'
                            name='\"backchannel.logout.url\"'
                            maxLength={254}
                            value={this.state.client.baseUrl ? this.state.client.baseUrl : ''}
                            onChange={this.handleChange}
                        />
                    </FormGroup>
                    // TODO: the last bools here for backchannel logout
                </Form>
                <h1>{this.state.client.clientId}</h1>
            </ContentPage>
        );
    }


}
export const ManageClientPage = withRouter(ManageClient);