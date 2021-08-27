import * as React from 'react';
import {
    ActionGroup,
    Button,
    Card,
    CardBody, DataList, DataListCell, DataListContent, DataListItem, DataListItemCells, DataListItemRow, DataListToggle,
    EmptyState,
    EmptyStateBody,
    EmptyStateVariant, Form, FormGroup,
    Grid,
    GridItem, TextArea, TextInput,
    Title
} from '@patternfly/react-core';
import { ContentPage } from '../ContentPage'
import { Msg } from '../../widgets/Msg'
import { AccountServiceContext } from '../../account-service/AccountServiceContext';
import { HttpResponse } from '../../account-service/account.service'
import {ExternalLinkAltIcon, MinusCircleIcon, TrashIcon} from "@patternfly/react-icons";
import {ContentAlert} from "../ContentAlert";
import {Link, Route, RouteComponentProps} from "react-router-dom";

// can be found at /keycloak.v2/account/index.ftl
declare const authUrl: string;
declare const realm: string;

export interface ClientsPageProps {
}

export interface ClientsPageState {
    // isRowOpen already here for later use and expanding the list of clients
    isRowOpen: boolean[];
    tokenInputEnabled: boolean;
    adminTok: string;
    clients: Client[];
}

export interface Client {
    clientId: string;
    name: string;
    description: string;
}


export class UserClientPage extends React.Component<ClientsPageProps, ClientsPageState> {
    static contextType = AccountServiceContext;
    context: React.ContextType<typeof AccountServiceContext>;

    public constructor(props: ClientsPageProps, context: React.ContextType<typeof AccountServiceContext>) {
        super(props);
        this.context = context;
        this.state = {
            isRowOpen: [],
            tokenInputEnabled: false,
            adminTok: '',
            clients: []
        };

        this.fetchClients();
    }



    private fetchClients(): void {
        let url = authUrl + 'realms/' + realm + '/userClientAdministration/clients'
        this.context!.doGet<Client[]>(url).then((response: HttpResponse<Client[]>) => {
            const clients = response.data || [];
            this.setState({
                isRowOpen: new Array(clients.length).fill(false),
                tokenInputEnabled: false,
                adminTok: '',
                clients: clients
            });
        });
    }

    private elementId(item: string, client: Client): string {
        return `application-${item}-${client.clientId}`;
    }

    private handleCreate() {
        return window.location.hash = 'userClients/client'
    }

    private handleDeleteClient(clientId: string) {
        let url = authUrl + 'realms/' + realm + '/userClientAdministration/client/' + clientId;
        this.context!.doDelete(url).then((response: HttpResponse) => {
            if(response.ok) {
                this.fetchClients();
                ContentAlert.success('Client successfully deleted');
            } else {
                ContentAlert.warning('Client could not be deleted.\n' +  response.status + ' ' + response.statusText);
            }
        })
    }

    private handleUnlinkClient(clientId: string) {
        let url = authUrl + 'realms/' + realm + '/userClientAdministration/access/' + clientId;
        this.context!.doDelete(url).then((response: HttpResponse) => {
            if (response.ok) {
                this.fetchClients();
                ContentAlert.success('Client successfully unlinked from you');
            } else {
                ContentAlert.warning('Client could not be unlinked.\n' + response.status + ' ' + response.statusText);
            }
        })
    }

    private handleManageClient(clientId: string) {
        window.location.hash = 'userClients/client/' + clientId;
    }

    private handleAddClient = (event: React.FormEvent<HTMLFormElement>): void => {
        event.preventDefault();
        const form = event.target as HTMLFormElement;
        const isValid = form.checkValidity();
        if (isValid && this.state.adminTok != '') {
            let url = authUrl + 'realms/' + realm + '/userClientAdministration/access';
            this.context!.doPost<HttpResponse>(url, {adminToken: this.state.adminTok})
                .then((response: HttpResponse) => {
                    if(response.ok) {
                        this.fetchClients();
                        ContentAlert.success(Msg.localize('successfullClientCreation'));
                    } else {
                        ContentAlert.warning('Could not link client.\n' + response.status + ' ' + response.statusText);
                    }
                });
        } else {
            ContentAlert.warning('Given administration token invalid.');
        }

    }

    private handleChangeAdminTok = (value: string, event: React.FormEvent<HTMLInputElement>) => {
        const target = event.currentTarget;
        const name = target.name;

        this.setState({
            adminTok: value
        });
    }

    private toggleLinkClient = () => {
        this.setState({
            tokenInputEnabled: !this.state.tokenInputEnabled,
            adminTok: '',
        })
    }

    public render(): React.ReactNode {
        return (
            <ContentPage title="personalClientTitle" introMessage="personalClientDescription">
                <Grid>
                    <GridItem offset={11} span={1}>
                        <Button id="add-client-btn" variant="control" onClick={this.toggleLinkClient}>
                            <Msg msgKey="doAddClient" />
                        </Button>
                    </GridItem>
                    <GridItem offset={12} span={1}>
                        <Button id="create-btn" variant="control" onClick={this.handleCreate}>
                            <Msg msgKey="doCreateClient" />
                        </Button>
                    </GridItem>
                </Grid>
                {this.state.tokenInputEnabled && (
                    <React.Fragment>
                        <Form isHorizontal onSubmit={event => this.handleAddClient(event)}>
                            <FormGroup label={Msg.localize('adminToken')}
                                       fieldId='admin-token'
                            >
                                <TextInput
                                    type='text'
                                    id='admin-token'
                                    name='adminTok'
                                    value={this.state.adminTok}
                                    onChange={this.handleChangeAdminTok}
                                />
                                <Grid>
                                    <GridItem span={1}>
                                        <Button
                                            type="submit"
                                            id="add-client-btn"
                                            variant="primary"
                                        >
                                            <Msg msgKey="doAddClient" />
                                        </Button>
                                    </GridItem>
                                    <GridItem offset={1} span={1}>
                                        <Button
                                            id='clear-tok-field-btn'
                                            variant='tertiary'
                                            onClick={() => this.setState({ adminTok: ''})}
                                        >
                                            <Msg msgKey='doClearTokenField' />
                                        </Button>
                                    </GridItem>
                                </Grid>
                            </FormGroup>
                        </Form>
                        <div className="pf-c-divider pf-m-vertical pf-m-inset-md" role="separator"> </div>
                    </React.Fragment>
                )}
                <DataList id="client-list" aria-label="Clients" isCompact>
                    <DataListItem id="client-list-header" aria-labelledby="Column names">
                        <DataListItemRow>
                            // invisible toggle allows headings to line up properly
                            <span style={{ visibility: 'hidden' }}>
                                <DataListToggle
                                    isExpanded={false}
                                    id='applications-list-header-invisible-toggle'
                                    aria-controls="hidden"
                                />
                            </span>
                            <DataListItemCells
                                dataListCells={[
                                    <DataListCell key='client-list-client-id-header' width={2}>
                                        <strong><Msg msgKey='clientId' /></strong>
                                    </DataListCell>,
                                    <DataListCell key='client-list-client-name-header' width={2}>
                                        <strong><Msg msgKey='clientName' /></strong>
                                    </DataListCell>,
                                    <DataListCell key='client-list-client-description-header' width={2}>
                                        <strong><Msg msgKey='clientDescription' /></strong>
                                    </DataListCell>,
                                    <DataListCell key='client-list-client-delete-header' width={1}>
                                        <Grid>
                                            <GridItem span={6}>
                                                <strong><Msg msgKey='clientUnlink'/></strong>
                                            </GridItem>
                                            <GridItem span={6}>
                                                <strong><Msg msgKey='clientDelete'/></strong>
                                            </GridItem>
                                        </Grid>
                                    </DataListCell>,
                                ]}
                            />
                        </DataListItemRow>
                    </DataListItem>
                    {this.state.clients.map((client: Client, appIndex: number) => {
                        return (
                            <DataListItem id={this.elementId("client-id", client)} key={'client-' + appIndex} aria-labelledby="client-list" isExpanded={this.state.isRowOpen[appIndex]}>
                                <DataListItemRow>
                                    {/*<DataListToggle*/}
                                    {/*    onClick={() => this.onToggle(appIndex)}*/}
                                    {/*    isExpanded={this.state.isRowOpen[appIndex]}*/}
                                    {/*    id={this.elementId('toggle', application)}*/}
                                    {/*    aria-controls={this.elementId("expandable", application)}*/}
                                    {/*/>*/}
                                    <DataListItemCells
                                        dataListCells={[
                                            <DataListCell id={this.elementId('id', client)} width={2} key={'id-' + appIndex}>
                                                <Button component="a" variant="link" onClick={() => this.handleManageClient(client.clientId)}>
                                                    { client.clientId }
                                                </Button>
                                            </DataListCell>,
                                            <DataListCell id={this.elementId('name', client)} width={2} key={'name-' + appIndex}>
                                                { client.name || '---' }
                                            </DataListCell>,
                                            <DataListCell id={this.elementId('description', client)} width={2} key={'description-' + appIndex}>
                                                { client.description || '---'}
                                            </DataListCell>,
                                            <DataListCell id={this.elementId('delete', client)} width={1} key={'delete-' + appIndex}>
                                                <Grid>
                                                    <GridItem span={6}>
                                                        <Button component="a" variant="secondary" onClick={() => this.handleUnlinkClient(client.clientId)}>
                                                            <MinusCircleIcon/>
                                                        </Button>
                                                    </GridItem>
                                                    <GridItem span={6}>
                                                        <Button component="a" variant="danger" onClick={() => this.handleDeleteClient(client.clientId)}>
                                                            <TrashIcon/>
                                                        </Button>
                                                    </GridItem>
                                                </Grid>
                                            </DataListCell>
                                        ]}
                                    />
                                </DataListItemRow>
                            </DataListItem>
                        )
                    })}
                </DataList>
            </ContentPage>
        );
    };
}