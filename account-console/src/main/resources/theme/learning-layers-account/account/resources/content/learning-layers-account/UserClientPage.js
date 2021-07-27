function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

import * as React from "../../../../common/keycloak/web_modules/react.js";
import { Button, DataList, DataListCell, DataListItem, DataListItemCells, DataListItemRow, DataListToggle, Grid, GridItem } from "../../../../common/keycloak/web_modules/@patternfly/react-core.js";
import { ContentPage } from "../ContentPage.js";
import { Msg } from "../../widgets/Msg.js";
import { AccountServiceContext } from "../../account-service/AccountServiceContext.js";
import { MinusCircleIcon, TrashIcon } from "../../../../common/keycloak/web_modules/@patternfly/react-icons.js";
import { ContentAlert } from "../ContentAlert.js"; // can be found at /keycloak.v2/account/index.ftl

export class UserClientPage extends React.Component {
  constructor(props, context) {
    super(props);

    _defineProperty(this, "context", void 0);

    this.context = context;
    this.state = {
      isRowOpen: [],
      clients: []
    };
    this.fetchClients();
  }

  fetchClients() {
    let url = authUrl + 'realms/' + realm + '/userClientAdministration/clients';
    this.context.doGet(url).then(response => {
      const clients = response.data || [];
      this.setState({
        isRowOpen: new Array(clients.length).fill(false),
        clients: clients
      });
    });
  }

  elementId(item, client) {
    return `application-${item}-${client.clientId}`;
  } // maybe useless, might deleted but currently creates link to request client information of given client


  getClientManagementLink(clientId) {
    return authUrl + 'realms/' + realm + '/userClientAdministration/client/' + clientId;
  } // TODO: create


  handleCreate() {
    return window.open('https://tenor.com/8F2P.gif');
  }

  handleDeleteClient(clientId) {
    let url = authUrl + 'realms/' + realm + '/userClientAdministration/client/' + clientId;
    this.context.doDelete(url).then(response => {
      if (response.ok) {
        this.fetchClients();
        ContentAlert.success('Client successfully deleted');
      } else {
        ContentAlert.warning('Client could not be deleted.\n' + response.status + ' ' + response.statusText);
      }
    });
  }

  handleUnlinkClient(clientId) {
    let url = authUrl + 'realms/' + realm + '/userClientAdministration/client/access/' + clientId;
    this.context.doDelete(url).then(response => {
      if (response.ok) {
        this.fetchClients();
        ContentAlert.success('Client successfully unlinked from you');
      } else {
        ContentAlert.warning('Client could not be unlinked.\n' + response.status + ' ' + response.statusText);
      }
    });
  } // TODO: set correct window.open() link


  render() {
    return React.createElement(ContentPage, {
      title: "personalClientTitle",
      introMessage: "personalClientDescription"
    }, React.createElement(Grid, null, React.createElement(GridItem, {
      offset: 12
    }, React.createElement(Button, {
      id: "create-btn",
      variant: "control",
      onClick: this.handleCreate
    }, React.createElement(Msg, {
      msgKey: "doCreateClient"
    })))), React.createElement(DataList, {
      id: "client-list",
      "aria-label": "Clients",
      isCompact: true
    }, React.createElement(DataListItem, {
      id: "client-list-header",
      "aria-labelledby": "Column names"
    }, React.createElement(DataListItemRow, null, "// invisible toggle allows headings to line up properly", React.createElement("span", {
      style: {
        visibility: 'hidden'
      }
    }, React.createElement(DataListToggle, {
      isExpanded: false,
      id: "applications-list-header-invisible-toggle",
      "aria-controls": "hidden"
    })), React.createElement(DataListItemCells, {
      dataListCells: [React.createElement(DataListCell, {
        key: "client-list-client-id-header",
        width: 2
      }, React.createElement("strong", null, React.createElement(Msg, {
        msgKey: "clientId"
      }))), React.createElement(DataListCell, {
        key: "client-list-client-name-header",
        width: 2
      }, React.createElement("strong", null, React.createElement(Msg, {
        msgKey: "clientName"
      }))), React.createElement(DataListCell, {
        key: "client-list-client-description-header",
        width: 2
      }, React.createElement("strong", null, React.createElement(Msg, {
        msgKey: "clientDescription"
      }))), React.createElement(DataListCell, {
        key: "client-list-client-delete-header",
        width: 1
      }, React.createElement("strong", null, React.createElement(Msg, {
        msgKey: "clientDelete"
      }))), React.createElement(DataListCell, {
        key: "client-list-client-unlink-header",
        width: 1
      }, React.createElement("strong", null, React.createElement(Msg, {
        msgKey: "clientUnlink"
      })))]
    }))), this.state.clients.map((client, appIndex) => {
      return React.createElement(DataListItem, {
        id: this.elementId("client-id", client),
        key: 'client-' + appIndex,
        "aria-labelledby": "client-list",
        isExpanded: this.state.isRowOpen[appIndex]
      }, React.createElement(DataListItemRow, null, React.createElement(DataListItemCells, {
        dataListCells: [React.createElement(DataListCell, {
          id: this.elementId('id', client),
          width: 2,
          key: 'id-' + appIndex
        }, React.createElement(Button, {
          component: "a",
          variant: "link",
          onClick: () => window.open('https://tenor.com/8F2P.gif')
        }, client.clientId)), React.createElement(DataListCell, {
          id: this.elementId('name', client),
          width: 2,
          key: 'name-' + appIndex
        }, client.name || ''), React.createElement(DataListCell, {
          id: this.elementId('description', client),
          width: 2,
          key: 'description-' + appIndex
        }, client.description || ''), React.createElement(DataListCell, {
          id: this.elementId('delete', client),
          width: 1,
          key: 'delete-' + appIndex
        }, React.createElement(Button, {
          component: "a",
          variant: "danger",
          onClick: () => this.handleDeleteClient(client.clientId)
        }, React.createElement(TrashIcon, null))), React.createElement(DataListCell, {
          id: this.elementId('unlink', client),
          width: 1,
          key: 'unlink-' + appIndex
        }, React.createElement(Button, {
          component: "a",
          variant: "secondary",
          onClick: () => this.handleUnlinkClient(client.clientId)
        }, React.createElement(MinusCircleIcon, null)))]
      })));
    })));
  }

}

_defineProperty(UserClientPage, "contextType", AccountServiceContext);
//# sourceMappingURL=UserClientPage.js.map