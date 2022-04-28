import * as React from "react";
import {AccountServiceContext} from "../../account-service/AccountServiceContext";
import {ContentPage} from "../ContentPage";
import {withRouter, RouteComponentProps} from 'react-router-dom';
import {Msg} from "../../widgets/Msg";
import {
    ActionGroup,
    Button, ButtonVariant, ExpandableSection,
    Form,
    FormGroup, Grid, GridItem, InputGroup, PageSectionVariants,
    Select,
    SelectOption,
    SelectVariant,
    Switch, Text,
    TextInput,
    Stack, PageSection
} from "@patternfly/react-core";
import {ClientRepresentation} from "./ClientRepresentation";
import {HttpResponse} from "../../account-service/account.service";
import {ContentAlert} from "../ContentAlert";
import {MinusCircleIcon, PlusCircleIcon} from "@patternfly/react-icons";

// can be found at /keycloak.v2/account/index.ftl
declare const authUrl: string;
declare const realm: string;

interface routeParams {
    id: string;
}

enum pkceChallence {
    'S256' = 'S256',
    'plain' = 'plain',
    'none' = 'none'
}

enum accessTypes {
    'confidential' = 'confidential',
    'public' = 'public',
    'bearer_only' = 'bearer-only',
}

export interface ManagePageProps extends RouteComponentProps<routeParams> {
}

export interface ManagePageState {
    noClient: boolean;
    isExtended: boolean[];
    accessTypeExpanded: boolean;
    accessTypeSelected: accessTypes;
    pkceChallengeExpanded: boolean;
    pkceChallengeSelected: pkceChallence;
    adminToken: string;
    client: ClientRepresentation;
}

interface ClientResponse {
    adminToken: string;
    clientRep: ClientRepresentation;
}

export const emptyClientFields = {
    clientId: '',
    name: '',
    description: '',
    secret: undefined,
    enabled: true,
    alwaysDisplayInConsole: false,
    consentRequired: false,
    bearerOnly: false,
    publicClient: true,
    standardFlowEnabled: true,
    implicitFlowEnabled: false,
    directAccessGrantsEnabled: true,
    serviceAccountsEnabled: false,

    rootUrl: '',
    redirectUris: [],
    baseUrl: '',
    adminUrl: '',
    webOrigins: [],

    // defaultClientScopes: [],
    // optionalClientScopes: [],

    attributes: {
        "backchannel.logout.url": '',
        "backchannel.logout.session.required": 'true',
        "backchannel.logout.revoke.offline.tokens": 'false',
        "oauth2.device.authorization.grant.enabled": 'false',

        "access.token.lifespan": '',
        "client.session.idle.timeout": '',
        "client.session.max.lifespan": '',
        "client.offline.session.idle.timeout": '',
        "client.offline.session.max.lifespan": '',
        "tls.client.certificate.bound.access.tokens": '',
        "pkce.code.challenge.method": undefined,
        "use.refresh.tokens": 'true',
        "client_credentials.use_refresh_token": 'false',
        "exclude.session.state.from.auth.response": 'false',
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
            accessTypeExpanded: false,
            accessTypeSelected: accessTypes.public,
            pkceChallengeExpanded: false,
            pkceChallengeSelected: pkceChallence.none,
            adminToken: '',
            client: emptyClientFields,
        }

        if (this.props.match.params.id !== '' && this.props.match.params.id !== undefined) {
            this.requestClient(this.props.match.params.id);
        }
    }

    private requestClient(clientId: string): void {
        let url = authUrl + 'realms/' + realm + '/userClientAdministration/client/' + clientId;
        this.context!.doGet<ClientResponse>(url).then((response: HttpResponse<ClientResponse>) => {
            if (response.ok){
                const responseData = response.data ||  {adminToken: '', clientRep: emptyClientFields};
                console.log(responseData)
                this.setState({
                    noClient: false,
                    isExtended: [false, false],
                    accessTypeSelected: this.setAccessType(responseData.clientRep.publicClient, responseData.clientRep.bearerOnly),
                    pkceChallengeSelected: this.setPKCEChallenge(responseData.clientRep.attributes["pkce.code.challenge.method"]),
                    adminToken: responseData.adminToken,
                    client: responseData.clientRep,
                });
                console.log("got client data:");
                console.log(this.state)
                if (this.state.client == emptyClientFields){
                    console.log("got no data for client")
                    ContentAlert.warning('No data was send for the client ' + clientId)
                }
            }
            else {
                ContentAlert.warning('You have no access to the client!.\n' +  response.status + ' ' + response.statusText);
            }
        });

    }

    private setAccessType(pubClient: boolean, bearer: boolean): accessTypes {
        if (pubClient && bearer) {
            ContentAlert.warning('Client is configured to be public and bearer-only. This is seems to be an error.');
            return accessTypes.bearer_only;
        } else if (pubClient) {
            return accessTypes.public;
        } else if (bearer) {
            return accessTypes.bearer_only;
        } else {
            return accessTypes.confidential;
        }
    }

    private setPKCEChallenge(challenge?: string): pkceChallence {
        switch (challenge) {
            case undefined:
                return pkceChallence.none;
            case 'S256':
                return pkceChallence.S256;
            case 'plain':
                return pkceChallence.plain;
            default:
                ContentAlert.warning("pkce challenge was not correctly defined. Set to default value \"none\"");
                console.log("pkce challenge was not correctly defined. Set to default value \"none\"");
                return pkceChallence.none
        }
    }


    private handleChange = (value: any, event: React.FormEvent<HTMLInputElement>) => {
        const target = event.currentTarget;
        const name = target.name;

        this.setState({
            client: {...this.state.client, [name]: value }
        });
    }

    private handleAttrChange = (value: any, event: React.FormEvent<HTMLInputElement>) => {
        const target = event.currentTarget;
        const name = target.name;

        let tmp = this.state.client.attributes;
        if(target.type == 'number'){
            tmp[name] = (parseInt(value)*60).toString();
        } else {
            tmp[name] = value.toString();
        }
        this.setState({
            client: { ...this.state.client, attributes: tmp }
        })
    }

    private handleArrayChange = (value: string, event: React.FormEvent<HTMLInputElement>) => {
        const target = event.currentTarget;
        const name = target.name.split('-');
        let tmp = []
        switch (name[0]) {
            case 'redirectUris':
                tmp = this.state.client.redirectUris
                tmp[parseInt(name[1])] = value;
                this.setState({
                    client: {...this.state.client, redirectUris: tmp}
                });
                break;
            case 'webOrigins':
                tmp = this.state.client.webOrigins
                tmp[parseInt(name[1])] = value;
                this.setState({
                    client: {...this.state.client, webOrigins: tmp}
                });
                break;
            default:
                console.log('Some not defined array should be fixed')
        }
    }

    private toggleAccessType = (accessTypeExpanded: boolean) => {
        this.setState({
            accessTypeExpanded
        })
    }

    private selectAccessType = (_event: React.MouseEvent | React.ChangeEvent, selection: accessTypes): void => {
        switch (selection) {
            case accessTypes.confidential:
                this.setState({
                    accessTypeSelected: selection,
                    accessTypeExpanded: false,
                    client: { ...this.state.client, publicClient: false, bearerOnly: false }
                });
                break;
            case accessTypes.public:
                this.setState({
                    accessTypeSelected: selection,
                    accessTypeExpanded: false,
                    client: { ...this.state.client, publicClient: true, bearerOnly: false }
                });
                break;
            case accessTypes.bearer_only:
                this.setState({
                    accessTypeSelected: selection,
                    accessTypeExpanded: false,
                    client: { ...this.state.client, publicClient: false, bearerOnly: true }
                });
                break;
            default:
                console.log("Error: selected value is neither confidential, public or bearer_only. Value is instead: " + selection)
                ContentAlert.warning('Something went wrong when selection the access type.')
        }
    }

    private togglePKCEChallenge = (pkceChallengeExpanded: boolean) => {
        this.setState({
            pkceChallengeExpanded
        })
    }

    private selectPKCEChallenge = (_event: React.MouseEvent | React.ChangeEvent, selection: pkceChallence): void => {
        let tmp = this.state.client.attributes;
        tmp["pkce.code.challenge.method"] = selection;

        this.setState({
            pkceChallengeExpanded: false,
            pkceChallengeSelected: selection,
            client: { ...this.state.client, attributes: tmp }
        })
    }

    private addUri = (uriType: string): void => {
        let tmpArr = []
        switch (uriType) {
            case 'redirectUris':
                tmpArr = this.state.client.redirectUris;
                tmpArr.push('');
                this.setState({
                    client: { ...this.state.client, redirectUris: tmpArr }
                })
                break;
            case 'webOrigins':
                tmpArr = this.state.client.webOrigins;
                tmpArr.push('');
                this.setState({
                    client: { ...this.state.client, webOrigins: tmpArr }
                })
                break;
        }

    }

    private removeUri(index: number, uriType: string): void {
        let tmpArr = [];
        switch (uriType) {
            case 'redirectUris':
                console.log(this.state.client.redirectUris);
                tmpArr = this.state.client.redirectUris;
                tmpArr.splice(index, 1);
                console.log(tmpArr);
                this.setState({
                    client: { ...this.state.client, redirectUris: tmpArr }
                });
                break;
            case 'webOrigins':
                tmpArr = this.state.client.webOrigins;
                tmpArr.splice(index, 1);
                this.setState({
                    client: { ...this.state.client, webOrigins: tmpArr }
                });
                break;
        }
    }

    private onToggle = (index: number): void => {
        let tmp = this.state.isExtended;
        tmp[index] = !tmp[index];
        this.setState({
            isExtended: tmp
        });
    }

    private handleCopyAdminTok = (): void => {
        navigator.clipboard.writeText(this.state.adminToken)
        ContentAlert.success(Msg.localize('copiedToClipboard'))
    }

    private handleCancel = (): void => {
        if(this.state.noClient) {
            window.location.hash = 'userClients';
        } else {
            this.requestClient(this.props.match.params.id)
        }
    }

    private handleSubmit = (event: React.FormEvent<HTMLFormElement>): void => {
        event.preventDefault();
        const form = event.target as HTMLFormElement;
        const isValid = form.checkValidity();
        console.log(this.state)
        if (isValid) {
            const reqData = this.state.client;
            // DEBUGGING
            // console.log("Submit client:");
            // console.log(reqData);
            if (this.state.noClient) {
                if(reqData.rootUrl) {
                    reqData.redirectUris.push(reqData.rootUrl + '/*');
                    reqData.webOrigins.push(reqData.rootUrl);
                    reqData.adminUrl = reqData.rootUrl;
                }
                let url = authUrl + 'realms/' + realm + '/userClientAdministration/create'
                this.context!.doPost<HttpResponse>(url, reqData)
                    .then((response: HttpResponse) => {
                        if(response.ok) {
                            ContentAlert.success(Msg.localize('successfullClientCreation'));
                            window.location.hash = 'userClients/client/' + reqData.clientId;
                            window.location.reload();
                        } else {
                            ContentAlert.warning('Could not create client.\n' + response.status + ' ' + response.statusText)
                            console.log(response.status + ' ' + response.statusText)
                        }
                    });
            } else {
                let url = authUrl + 'realms/' + realm + '/userClientAdministration/client/' + this.state.client.id;
                // DEBUGGING
                // console.log("Changing existent client")
                // console.log(reqData);
                this.context!.doPost<HttpResponse>(url, reqData)
                    .then((response: HttpResponse) => {
                        if (response.ok) {
                            ContentAlert.success(Msg.localize('successfullClientUpdate'));
                        } else {
                            ContentAlert.warning('Could not change client.\n' + response.status + ' ' + response.statusText)
                            console.log(response.status + ' ' + response.statusText)
                        }
                    });
            }
        } else {
            // TODO: improve alerts/warnings at invalid input
            ContentAlert.info("A client needs at least a clientId, one valid redirectUri. Confidential clients also need a client secret.\n" +
                " Note that you should begin urls with http:// or https://?")
            // DEBUGGING
            // console.log('HTMLFormElement not valid')
            // console.log(form.querySelectorAll(':invalid'))
        }
    }

    public render(): React.ReactNode {
        const client: ClientRepresentation = this.state.client;
        return(
            <ContentPage title={(this.state.noClient ? 'Create new client' : Msg.localize("manageClientTitle") + ' ' + this.state.client.clientId)}
                         introMessage={(this.state.noClient ? '' : Msg.localize("manageClientDescription"))}>
                <PageSection isFilled variant={PageSectionVariants.light}>
                    <Stack hasGutter>
                        {!this.state.noClient && (
                            <React.Fragment>
                                <Grid>
                                    <GridItem offset={12}>
                                        <Button id="admin-token-btn" variant="tertiary" onClick={this.handleCopyAdminTok}>
                                            <Msg msgKey="doCopyAdminToken" />
                                        </Button>
                                    </GridItem>
                                </Grid>
                            </React.Fragment>
                        )}
                        <Form isHorizontal onSubmit={event => this.handleSubmit(event)}>
                            {this.state.noClient ?
                                <React.Fragment>
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
                                            value={client.clientId}
                                            onChange={this.handleChange}
                                        />
                                    </FormGroup>
                                    <FormGroup
                                        label={Msg.localize('clientRootUrl')}
                                        fieldId='client-root-url'
                                    >
                                        <TextInput
                                            type='url'
                                            id='client-root-url'
                                            name='rootUrl'
                                            maxLength={254}
                                            value={client.rootUrl ? client.rootUrl : ''}
                                            onChange={this.handleChange}
                                        />
                                    </FormGroup>
                                </React.Fragment>
                                :
                                <React.Fragment>
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
                                            value={client.clientId}
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
                                            value={client.name ? client.name : ''}
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
                                            value={client.description ? client.description : ''}
                                            onChange={this.handleChange}
                                        />
                                    </FormGroup>
                                    <FormGroup
                                        label={Msg.localize('clientSecret')}
                                        isRequired={!client.publicClient && !client.bearerOnly}
                                        fieldId='client-secret'
                                    >
                                        <TextInput
                                            isRequired={!client.publicClient && !client.bearerOnly}
                                            isDisabled={client.publicClient || client.bearerOnly}
                                            type='text'
                                            id='client-secret'
                                            name='secret'
                                            maxLength={254}
                                            value={(!client.secret && (client.publicClient || client.bearerOnly)) ? 'This type of clients do not have secrets' : (!client.secret ? '' : client.secret) }
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
                                            label=' '
                                            labelOff=' '
                                            isChecked={client.enabled}
                                            onChange={this.handleChange}
                                        />
                                    </FormGroup>
                                    <FormGroup
                                        label={Msg.localize('clientAlwaysDisplayInConsole')}
                                        fieldId='client-always-display-in-console'
                                    >
                                        <Switch
                                            id='client-always-display-in-console'
                                            name='alwaysDisplayInConsole'
                                            label=' '
                                            labelOff=' '
                                            isChecked={client.alwaysDisplayInConsole}
                                            onChange={this.handleChange}
                                        />
                                    </FormGroup>
                                    <FormGroup
                                        label={Msg.localize('clientConsentRequired')}
                                        fieldId='client-consent-required'
                                    >
                                        <Switch
                                            id='client-consent-required'
                                            name='consentRequired'
                                            label=' '
                                            labelOff=' '
                                            isChecked={client.consentRequired}
                                            onChange={this.handleChange}
                                        />
                                    </FormGroup>
                                    <FormGroup
                                        label={Msg.localize('clientAccessType')}
                                        fieldId='client-access-type'
                                    >
                                        <Select
                                            direction='down'
                                            variant={SelectVariant.single}
                                            aria-label="Select the access type"
                                            onToggle={this.toggleAccessType}
                                            onSelect={this.selectAccessType}
                                            selections={this.state.accessTypeSelected}
                                            isOpen={this.state.accessTypeExpanded}
                                        >
                                            {[
                                                <SelectOption key={0} value={accessTypes.confidential}/>,
                                                <SelectOption key={1} value={accessTypes.public}/>,
                                                <SelectOption key={2} value={accessTypes.bearer_only}/>
                                            ]}
                                        </Select>
                                    </FormGroup>
                                    <FormGroup
                                        label={Msg.localize('clientStandardFlowEnabled')}
                                        fieldId='client-standard-flow-enabled'
                                    >
                                        <Switch
                                            id='client-standard-flow-enabled'
                                            name='standardFlowEnabled'
                                            label=' '
                                            labelOff=' '
                                            isChecked={client.standardFlowEnabled}
                                            onChange={this.handleChange}
                                        />
                                    </FormGroup>
                                    <FormGroup
                                        label={Msg.localize('clientImplicitFlowEnabled')}
                                        fieldId='client-implicit-flow-enabled'
                                    >
                                        <Switch
                                            id='client-implicit-flow-enabled'
                                            name='implicitFlowEnabled'
                                            label=' '
                                            labelOff=' '
                                            isChecked={client.implicitFlowEnabled}
                                            onChange={this.handleChange}
                                        />
                                    </FormGroup>
                                    <FormGroup
                                        label={Msg.localize('clientDirectAccessGrantsEnabled')}
                                        fieldId='client-direct-access-grants-enabled'
                                    >
                                        <Switch
                                            id='client-direct-access-grants-enabled'
                                            name='directAccessGrantsEnabled'
                                            label=' '
                                            labelOff=' '
                                            isChecked={client.directAccessGrantsEnabled}
                                            onChange={this.handleChange}
                                        />
                                    </FormGroup>
                                    <FormGroup
                                        label={Msg.localize('clientServiceAccountsEnabled')}
                                        fieldId='client-service-accounts-enabled'
                                    >
                                        <Switch
                                            id='client-service-accounts-enabled'
                                            name='serviceAccountsEnabled'
                                            label=' '
                                            labelOff=' '
                                            isChecked={client.serviceAccountsEnabled}
                                            onChange={this.handleChange}
                                        />
                                    </FormGroup>
                                    <FormGroup
                                        label={Msg.localize('clientOauth2DeviceEnabled')}
                                        fieldId='client-oauth2-device-enabled'
                                    >
                                        <Switch
                                            id='client-oauth2-device-enabled'
                                            name='oauth2.device.authorization.grant.enabled'
                                            label=' '
                                            labelOff=' '
                                            isChecked={client.attributes["oauth2.device.authorization.grant.enabled"] === 'true'}
                                            onChange={this.handleAttrChange}
                                        />
                                    </FormGroup>
                                    <FormGroup
                                        label={Msg.localize('clientRootUrl')}
                                        fieldId='client-root-url'
                                    >
                                        <TextInput
                                            type='url'
                                            id='client-root-url'
                                            name='rootUrl'
                                            maxLength={254}
                                            value={client.rootUrl ? client.rootUrl : ''}
                                            onChange={this.handleChange}
                                        />
                                    </FormGroup>
                                    <FormGroup
                                        label={Msg.localize("clientRedirectUris")}
                                        fieldId="client-redirect-uri"
                                        isRequired
                                        // labelIcon={
                                        //     <HelpItem
                                        //         helpText="clients-help:validRedirectURIs"
                                        //         forLabel={t("validRedirectUri")}
                                        //         forID={t(`common:helpLabel`, { label: t("validRedirectUri") })}
                                        //     />
                                        // }
                                    >
                                        {client.redirectUris.length > 1 ?
                                            client.redirectUris.map((uri: string, index: number) => {
                                                return (
                                                    <React.Fragment>
                                                        <InputGroup>
                                                            <TextInput
                                                                type='text'
                                                                isRequired
                                                                id='client-redirect-uri'
                                                                name={'redirectUris-' + index}
                                                                value={uri}
                                                                onChange={this.handleArrayChange}
                                                            />
                                                            <Button
                                                                variant={ButtonVariant.link}
                                                                onClick={() => this.removeUri(index, 'redirectUris')}
                                                                tabIndex={-1}
                                                                aria-label='remove'
                                                            >
                                                                <MinusCircleIcon/>
                                                            </Button>
                                                        </InputGroup>
                                                    </React.Fragment>
                                                )
                                            }) :
                                            <InputGroup>
                                                <TextInput
                                                    type='text'
                                                    isRequired
                                                    id='client-redirect-uri'
                                                    name={'redirectUris-' + 0}
                                                    value={client.redirectUris[0] ? client.redirectUris[0] : ''}
                                                    onChange={this.handleArrayChange}
                                                />
                                                <Button
                                                    variant={ButtonVariant.link}
                                                    onClick={() => this.removeUri(0, 'redirectUris')}
                                                    tabIndex={-1}
                                                    aria-label='remove'
                                                    isDisabled={client.redirectUris.length !== 1}
                                                >
                                                    <MinusCircleIcon/>
                                                </Button>
                                            </InputGroup>
                                        }
                                        <Button
                                            variant={ButtonVariant.link}
                                            onClick={() => this.addUri('redirectUris')}
                                            tabIndex={-1}
                                            ara-label='add'
                                        >
                                            <PlusCircleIcon/> {'add URI'}
                                        </Button>
                                    </FormGroup>
                                    <FormGroup
                                        label={Msg.localize('clientBaseUrl')}
                                        fieldId='client-base-url'
                                    >
                                        <TextInput
                                            type='text'
                                            id='client-base-url'
                                            name='baseUrl'
                                            maxLength={254}
                                            value={client.baseUrl ? client.baseUrl : ''}
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
                                            value={client.adminUrl ? client.adminUrl : ''}
                                            onChange={this.handleChange}
                                        />
                                    </FormGroup>
                                    <FormGroup
                                        label={Msg.localize("clientWebOrigins")}
                                        fieldId="client-web-origins"
                                        // labelIcon={
                                        //     <HelpItem
                                        //         helpText="clients-help:validRedirectURIs"
                                        //         forLabel={t("validRedirectUri")}
                                        //         forID={t(`common:helpLabel`, { label: t("validRedirectUri") })}
                                        //     />
                                        // }
                                    >
                                        {client.webOrigins.length > 1 ?
                                            client.webOrigins.map((origin: string, index: number) => (
                                                <React.Fragment>
                                                    <InputGroup>
                                                        <TextInput
                                                            type='text'
                                                            id='client-web-origins'
                                                            name={'webOrigins-' + index}
                                                            value={origin}
                                                            onChange={this.handleArrayChange}
                                                        />
                                                        <Button
                                                            variant={ButtonVariant.link}
                                                            onClick={() => this.removeUri(index, 'webOrigins')}
                                                            tabIndex={-1}
                                                            aria-label='remove'
                                                        >
                                                            <MinusCircleIcon/>
                                                        </Button>
                                                    </InputGroup>
                                                </React.Fragment>
                                            )) :
                                            <InputGroup>
                                                <TextInput
                                                    type='text'
                                                    id='client-web-origins'
                                                    name={'webOrigins-' + 0}
                                                    value={client.webOrigins[0] ? client.webOrigins[0] : ''}
                                                    onChange={this.handleArrayChange}
                                                />
                                                <Button
                                                    variant={ButtonVariant.link}
                                                    onClick={() => this.removeUri(0, 'webOrigins')}
                                                    tabIndex={-1}
                                                    aria-label='remove'
                                                    isDisabled={client.webOrigins.length !== 1}
                                                >
                                                    <MinusCircleIcon/>
                                                </Button>
                                            </InputGroup>
                                        }
                                        <Button
                                            variant={ButtonVariant.link}
                                            onClick={() => this.addUri('webOrigins')}
                                            tabIndex={-1}
                                            ara-label='add'
                                        >
                                            <PlusCircleIcon/> {'add URI'}
                                        </Button>
                                    </FormGroup>
                                    <FormGroup
                                        label={Msg.localize('clientBackchannelLogoutUrl')}
                                        fieldId='client-backchannel-logout-url'
                                    >
                                        <TextInput
                                            type='text'
                                            id='client-backchannel-logout-url'
                                            name='backchannel.logout.url'
                                            maxLength={254}
                                            value={client.attributes["backchannel.logout.url"] ? client.attributes["backchannel.logout.url"] : ''}
                                            onChange={this.handleAttrChange}
                                        />
                                    </FormGroup>
                                    <FormGroup
                                        label={Msg.localize('clientBackchannelRequired')}
                                        fieldId='client-backchannel-required'
                                    >
                                        <Switch
                                            id='client-backchannel-required'
                                            name='backchannel.logout.session.required'
                                            label=' '
                                            labelOff=' '
                                            isChecked={client.attributes["backchannel.logout.session.required"] === 'true'}
                                            onChange={this.handleAttrChange}
                                        />
                                    </FormGroup>
                                    <FormGroup
                                        label={Msg.localize('clientBackchannelRevokeOfflineTokens')}
                                        fieldId='client-backchannel-revoke-offline-tokens'
                                    >
                                        <Switch
                                            id='client-backchannel-revoke-offline-tokens'
                                            name='backchannel.logout.revoke.offline.tokens'
                                            label=' '
                                            labelOff=' '
                                            isChecked={client.attributes["backchannel.logout.revoke.offline.tokens"] === 'true'}
                                            onChange={this.handleAttrChange}
                                        />
                                    </FormGroup>
                                    <ExpandableSection
                                        toggleText='OpenID Connect Compatibility Modes'
                                        onToggle={() => this.onToggle(0)}
                                        isExpanded={this.state.isExtended[0]}
                                    >
                                        <FormGroup
                                            label={Msg.localize('clientExcludeSessionState')}
                                            fieldId='client-exclude-session-state'
                                        >
                                            <Switch
                                                id='client-exclude-session-state'
                                                name='exclude.session.state.from.auth.response'
                                                label=' '
                                                labelOff=' '
                                                isChecked={client.attributes["exclude.session.state.from.auth.response"] === 'true'}
                                                onChange={this.handleAttrChange}
                                            />
                                        </FormGroup>
                                        <FormGroup
                                            label={Msg.localize('clientUseRefreshTokens')}
                                            fieldId='client-use-refresh-tokens'
                                        >
                                            <Switch
                                                id='client-use-refresh-tokens'
                                                name='use.refresh.tokens'
                                                label=' '
                                                labelOff=' '
                                                isChecked={client.attributes["use.refresh.tokens"] === 'true'}
                                                onChange={this.handleAttrChange}
                                            />
                                        </FormGroup>
                                        <FormGroup
                                            label={Msg.localize('clientUseRefreshTokensCredentialGrant')}
                                            fieldId='client-use-refresh-tokens-for-credential-grant'
                                        >
                                            <Switch
                                                id='client-use-refresh-tokens-for-credential-grant'
                                                name='client_credentials.use_refresh_token'
                                                label=' '
                                                labelOff=' '
                                                isChecked={client.attributes["client_credentials.use_refresh_token"] === 'true'}
                                                onChange={this.handleAttrChange}
                                            />
                                        </FormGroup>
                                    </ExpandableSection>
                                    <ExpandableSection
                                        toggleText='Advanced Settings'
                                        onToggle={() => this.onToggle(1)}
                                        isExpanded={this.state.isExtended[1]}
                                    >
                                        <FormGroup
                                            label={Msg.localize('clientAccessTokenLifeSpan')}
                                            fieldId='client-access-token-lifespan'
                                        >
                                            <InputGroup>
                                                <TextInput
                                                    type='number'
                                                    id='client-access-token-lifespan'
                                                    name='access.token.lifespan'
                                                    value={client.attributes["access.token.lifespan"] ? parseInt(client.attributes["access.token.lifespan"])/60 : ''}
                                                    onChange={this.handleAttrChange}
                                                />
                                                <Text>Minutes</Text>
                                            </InputGroup>
                                        </FormGroup>
                                        <FormGroup
                                            label={Msg.localize('clientSessionIdle')}
                                            fieldId='client-session-idle'
                                        >
                                            <InputGroup>
                                                <TextInput
                                                    type='number'
                                                    id='client-session-idle'
                                                    name='client.session.idle.timeout'
                                                    value={client.attributes["client.session.idle.timeout"] ? parseInt(client.attributes["client.session.idle.timeout"])/60 : '' }
                                                    onChange={this.handleAttrChange}
                                                />
                                                <Text>Minutes</Text>
                                            </InputGroup>
                                        </FormGroup>
                                        <FormGroup
                                            label={Msg.localize('clientSessionMax')}
                                            fieldId='client-session-max'
                                        >
                                            <InputGroup>
                                                <TextInput
                                                    type='number'
                                                    id='client-session-max'
                                                    name='client.session.max.lifespan'
                                                    value={client.attributes["client.session.max.lifespan"] ? parseInt(client.attributes["client.session.max.lifespan"])/60 : ''}
                                                    onChange={this.handleAttrChange}
                                                />
                                                <Text>Minutes</Text>
                                            </InputGroup>
                                        </FormGroup>
                                        <FormGroup
                                            label={Msg.localize('clientOfflineSessionIdle')}
                                            fieldId='client-offline-session-idle'
                                        >
                                            <InputGroup>
                                                <TextInput
                                                    type='number'
                                                    id='client-offline-session-idle'
                                                    name='client.offline.session.idle.timeout'
                                                    value={client.attributes["client.offline.session.idle.timeout"] ? parseInt(client.attributes["client.offline.session.idle.timeout"])/60 : ''}
                                                    onChange={this.handleAttrChange}
                                                />
                                                <Text>Minutes</Text>
                                            </InputGroup>
                                        </FormGroup>
                                        <FormGroup
                                            label={Msg.localize('clientOfflineSessionMax')}
                                            fieldId='client-offline-session-max'
                                        >
                                            <InputGroup>
                                                <TextInput
                                                    type='number'
                                                    id='client-offline-session-max'
                                                    name='client.offline.session.max.lifespan'
                                                    value={client.attributes["client.offline.session.max.lifespan"] ? parseInt(client.attributes["client.offline.session.max.lifespan"])/60 : ''}
                                                    onChange={this.handleAttrChange}
                                                />
                                                <Text>Minutes</Text>
                                            </InputGroup>
                                        </FormGroup>
                                        <FormGroup
                                            label={Msg.localize('clientTlsCertBoundAccessTokens')}
                                            fieldId='client-tls-cert-bound-access-tokens'
                                        >
                                            <Switch
                                                id='client-tls-cert-bound-access-tokens'
                                                name='tls.client.certificate.bound.access.tokens'
                                                label=' '
                                                labelOff=' '
                                                isChecked={client.attributes["tls.client.certificate.bound.access.tokens"] === 'true'}
                                                onChange={this.handleAttrChange}
                                            />
                                        </FormGroup>
                                        <FormGroup
                                            label={Msg.localize('clientPKCECodeChallenge')}
                                            fieldId='client-pkce-code-challenge'
                                        >
                                            <Select
                                                direction='down'
                                                variant={SelectVariant.single}
                                                aria-label="Select the PKCE code challenge"
                                                onToggle={this.togglePKCEChallenge}
                                                onSelect={this.selectPKCEChallenge}
                                                selections={this.state.pkceChallengeSelected}
                                                isOpen={this.state.pkceChallengeExpanded}
                                            >
                                                {[
                                                    <SelectOption key={0} value={pkceChallence.S256}/>,
                                                    <SelectOption key={1} value={pkceChallence.plain} />,
                                                    <SelectOption key={2} value={pkceChallence.none} />
                                                ]}
                                            </Select>
                                        </FormGroup>
                                    </ExpandableSection>
                                </React.Fragment>
                            }
                            <ActionGroup>
                                <Button
                                    type="submit"
                                    id="save-client-btn"
                                    variant="primary"
                                >
                                    <Msg msgKey="doSaveClient" />
                                </Button>
                                <Button
                                    id="cancel-client-btn"
                                    variant="secondary"
                                    onClick={this.handleCancel}
                                >
                                    <Msg msgKey="doCancelClient" />
                                </Button>
                            </ActionGroup>
                        </Form>
                    </Stack>
                </PageSection>
            </ContentPage>
        );
    }


}
export const ManageClientPage = withRouter(ManageClient);