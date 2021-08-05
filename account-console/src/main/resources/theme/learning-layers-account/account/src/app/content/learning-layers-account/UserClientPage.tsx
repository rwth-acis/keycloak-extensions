import * as React from 'react';
import {
    Button,
    Card,
    CardBody, DataList, DataListCell, DataListContent, DataListItem, DataListItemCells, DataListItemRow, DataListToggle,
    EmptyState,
    EmptyStateBody,
    EmptyStateVariant, Form,
    Grid,
    GridItem,
    Title
} from '@patternfly/react-core';
import { ContentPage } from '../ContentPage'
import { Msg } from '../../widgets/Msg'
import { AccountServiceContext } from '../../account-service/AccountServiceContext';
import { HttpResponse } from '../../account-service/account.service'
import {ExternalLinkAltIcon, MinusCircleIcon, TrashIcon} from "@patternfly/react-icons";
import {ContentAlert} from "../ContentAlert";
import {Link} from "react-router-dom";

// can be found at /keycloak.v2/account/index.ftl
declare const authUrl: string;
declare const baseUrl: string;
declare const realm: string;

export interface ClientsPageProps {
}

export interface ClientsPageState {
    // isRowOpen already here for later use and expanding the list of clients
    isRowOpen: boolean[];
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
                clients: clients
            });
        });
    }

    private elementId(item: string, client: Client): string {
        return `application-${item}-${client.clientId}`;
    }

    // maybe useless, might deleted but currently creates link to request client information of given client
    private getClientManagementLink(clientId: string): string {
        return authUrl + 'realms/' + realm + '/userClientAdministration/client/' + clientId;
    }

    // TODO: create
    private handleCreate() {
        return window.open('https://tenor.com/8F2P.gif');
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
        let url = authUrl + 'realms/' + realm + '/userClientAdministration/client/access/' + clientId;
        this.context!.doDelete(url).then((response: HttpResponse) => {
            if (response.ok) {
                this.fetchClients();
                ContentAlert.success('Client successfully unlinked from you');
            } else {
                ContentAlert.warning('Client could not be unlinked.\n' + response.status + ' ' + response.statusText);
            }
        })
    }

    // private handleManageClient(clientId: string) {
    //     let url = baseUrl + 'userClients/client'
    //     window.open()
    // }

    // TODO: set correct window.open() link
    public render(): React.ReactNode {
        return (
            <ContentPage title="personalClientTitle" introMessage="personalClientDescription">
                <Grid>
                    <GridItem offset={12}>
                        <Button id="create-btn" variant="control" onClick={this.handleCreate}>
                            <Msg msgKey="doCreateClient" />
                        </Button>
                    </GridItem>
                </Grid>
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
                                        <strong><Msg msgKey='clientDelete'/></strong>
                                    </DataListCell>,
                                    <DataListCell key='client-list-client-unlink-header' width={1}>
                                        <strong><Msg msgKey='clientUnlink'/></strong>
                                    </DataListCell>
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
                                                <Link to={{
                                                    pathname: '/client',
                                                    state: { clientId: client.clientId },
                                                }}>
                                                    { client.clientId }
                                                </Link>

                                                {/*<Button component="a" variant="link" onClick={() => this.handleManageClient(client.clientId)}>*/}
                                                {/*    { client.clientId }*/}
                                                {/*</Button>*/}
                                            </DataListCell>,
                                            <DataListCell id={this.elementId('name', client)} width={2} key={'name-' + appIndex}>
                                                { client.name || '---' }
                                            </DataListCell>,
                                            <DataListCell id={this.elementId('description', client)} width={2} key={'description-' + appIndex}>
                                                { client.description || '---'}
                                            </DataListCell>,
                                            <DataListCell id={this.elementId('delete', client)} width={1} key={'delete-' + appIndex}>
                                                <Button component="a" variant="danger" onClick={() => this.handleDeleteClient(client.clientId)}>
                                                    <TrashIcon/>
                                                </Button>
                                            </DataListCell>,
                                            <DataListCell id={this.elementId('unlink', client)} width={1} key={'unlink-' + appIndex}>
                                                <Button component="a" variant="secondary" onClick={() => this.handleUnlinkClient(client.clientId)}>
                                                    <MinusCircleIcon/>
                                                </Button>
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