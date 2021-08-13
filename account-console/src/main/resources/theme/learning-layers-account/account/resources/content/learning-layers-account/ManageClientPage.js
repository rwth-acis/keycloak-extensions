function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

import * as React from "../../../../common/keycloak/web_modules/react.js";
import { AccountServiceContext } from "../../account-service/AccountServiceContext.js";
import { ContentPage } from "../ContentPage.js";
import { withRouter } from "../../../../common/keycloak/web_modules/react-router-dom.js";
import { Msg } from "../../widgets/Msg.js";
import { ContentAlert } from "../ContentAlert.js"; // can be found at /keycloak.v2/account/index.ftl

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
    "exclude.session.state.from.auth.response": "false"
  }
};
export class ManageClient extends React.Component {
  constructor(props, context) {
    super(props);

    _defineProperty(this, "context", void 0);

    _defineProperty(this, "handleSubmit", event => {});

    this.context = context;
    this.state = {
      noClient: true,
      isExtended: [false, false],
      client: emptyClientFields
    };

    if (this.props.match.params.id !== undefined) {
      this.requestClient(this.props.match.params.id);
    }
  }

  requestClient(clientId) {
    let url = authUrl + 'realms/' + realm + '/userClientAdministration/client/' + clientId;
    this.context.doGet(url).then(response => {
      if (response.ok) {
        console.log(this.state);
        const clientData = response.data || emptyClientFields;
        this.setState({
          noClient: false,
          isExtended: [false, false],
          client: clientData
        });
        console.log("got client data:");
        console.log(response.data);
        console.log(this.state.client);
      } else {
        ContentAlert.warning('You have no access to the client!.\n' + response.status + ' ' + response.statusText);
      }
    });

    if (this.state.client == emptyClientFields) {
      console.log("got no data for client");
    }
  }

  render() {
    console.log(this.props);
    return React.createElement(ContentPage, {
      title: this.state.noClient ? 'Create new client' : Msg.localize("manageClientTitle") + this.state.client.clientId,
      introMessage: this.state.noClient ? '' : Msg.localize("manageClientDescription")
    }, React.createElement("object", null, this.state.client), React.createElement("h1", null, this.state.client.clientId));
  }

}

_defineProperty(ManageClient, "contextType", AccountServiceContext);

export const ManageClientPage = withRouter(ManageClient);
//# sourceMappingURL=ManageClientPage.js.map