import * as React from "../../../../common/keycloak/web_modules/react.js";
import { Card, CardBody, EmptyState, EmptyStateVariant, Title } from "../../../../common/keycloak/web_modules/@patternfly/react-core.js";
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
  render() {
    return React.createElement(Card, null, React.createElement(CardBody, null, React.createElement(EmptyState, {
      variant: EmptyStateVariant.small
    }, React.createElement(Title, {
      headingLevel: "h4",
      size: "lg"
    }, "This is a test if everything worked."))));
  }

}
;
//# sourceMappingURL=UserClientPage.js.map