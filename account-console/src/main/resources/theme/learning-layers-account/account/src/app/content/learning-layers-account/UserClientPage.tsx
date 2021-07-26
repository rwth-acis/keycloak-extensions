import * as React from 'react';
import {
    Card,
    CardBody,
    EmptyState,
    EmptyStateBody,
    EmptyStateVariant,
    Grid,
    GridItem,
    Title
} from '@patternfly/react-core';

declare const baseUrl: string;
declare const realm: string;

export class UserClientPage extends React.Component {

    // constructor(props: any) {
    //     super(props);
    //
    //     this.state = { clients: this.requestUserClients };
    // }

    // requestUserClients() {
    //     let url = baseUrl + 'auth/realms/' + realm + '/userClientAdministration/clients'
    //     this.context.doGet(url).then((response: { data: any; }) => {
    //         return [response.data];
    //     })
    // }
    //
    // getClients(){
    //     let a = this.state.clients;
    //     return this.state.clients.forEach( (element: string) => {
    //         <tr>
    //             <td>{element}</td>
    //         </tr>
    //     })
    // }

    public render(): React.ReactNode {
        return (
            <Card>
                <CardBody>
                    <EmptyState variant={EmptyStateVariant.small}>
                        <Title headingLevel="h4" size="lg">
                            This is a test if everything worked.
                        </Title>
                    </EmptyState>
                </CardBody>
            </Card>
        );
    }
};
