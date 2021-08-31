function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

import * as React from "../../../../common/keycloak/web_modules/react.js";
import { Button, DataList, DataListCell, DataListItem, DataListItemCells, DataListItemRow, DataListToggle, Form, FormGroup, Grid, GridItem, TextInput } from "../../../../common/keycloak/web_modules/@patternfly/react-core.js";
import { ContentPage } from "../ContentPage.js";
import { Msg } from "../../widgets/Msg.js";
import { AccountServiceContext } from "../../account-service/AccountServiceContext.js";
import { AngleUpIcon, MinusCircleIcon, TrashIcon } from "../../../../common/keycloak/web_modules/@patternfly/react-icons.js";
import { ContentAlert } from "../ContentAlert.js"; // can be found at /keycloak.v2/account/index.ftl

export class UserClientPage extends React.Component {
  constructor(props, context) {
    super(props);

    _defineProperty(this, "context", void 0);

    _defineProperty(this, "handleAddClient", event => {
      event.preventDefault();
      const form = event.target;
      const isValid = form.checkValidity();

      if (isValid && this.state.adminTok != '') {
        let url = authUrl + 'realms/' + realm + '/userClientAdministration/access';
        this.context.doPost(url, {
          adminToken: this.state.adminTok
        }).then(response => {
          if (response.ok) {
            this.fetchClients();
            ContentAlert.success(Msg.localize('successfullClientCreation'));
          } else {
            ContentAlert.warning('Could not link client.\n' + response.status + ' ' + response.statusText);
          }
        });
      } else {
        ContentAlert.warning('Given administration token invalid.');
      }
    });

    _defineProperty(this, "handleChangeAdminTok", (value, event) => {
      const target = event.currentTarget;
      const name = target.name;
      this.setState({
        adminTok: value
      });
    });

    _defineProperty(this, "toggleLinkClient", () => {
      this.setState({
        tokenInputEnabled: !this.state.tokenInputEnabled,
        adminTok: ''
      });
    });

    this.context = context;
    this.state = {
      isUnlinkEnabled: [],
      isDeleteEnabled: [],
      isRowOpen: [],
      tokenInputEnabled: false,
      adminTok: '',
      clients: []
    };
    this.fetchClients();
  }

  fetchClients() {
    let url = authUrl + 'realms/' + realm + '/userClientAdministration/clients';
    this.context.doGet(url).then(response => {
      const clients = response.data || [];
      this.setState({
        isUnlinkEnabled: new Array(clients.length).fill(false),
        isDeleteEnabled: new Array(clients.length).fill(false),
        isRowOpen: new Array(clients.length).fill(false),
        tokenInputEnabled: false,
        adminTok: '',
        clients: clients
      });
    });
  }

  elementId(item, client) {
    return `application-${item}-${client.clientId}`;
  }

  handleCreate() {
    return window.location.hash = 'userClients/client';
  }

  handleDeleteClient(clientId, index) {
    if (this.state.isDeleteEnabled[index]) {
      let url = authUrl + 'realms/' + realm + '/userClientAdministration/client/' + clientId;
      this.context.doDelete(url).then(response => {
        if (response.ok) {
          this.fetchClients();
          ContentAlert.success('Client successfully deleted');
        } else {
          ContentAlert.warning('Client could not be deleted.\n' + response.status + ' ' + response.statusText);
        }
      });
    } else {
      let tmp = new Array(this.state.clients.length).fill(false);
      tmp[index] = true;
      this.setState({
        isDeleteEnabled: tmp,
        isUnlinkEnabled: new Array(this.state.clients.length).fill(false)
      });
    }
  }

  handleUnlinkClient(clientId, index) {
    if (this.state.isUnlinkEnabled[index]) {
      let url = authUrl + 'realms/' + realm + '/userClientAdministration/access/' + clientId;
      this.context.doDelete(url).then(response => {
        if (response.ok) {
          this.fetchClients();
          ContentAlert.success('Client successfully unlinked from you');
        } else {
          ContentAlert.warning('Client could not be unlinked.\n' + response.status + ' ' + response.statusText);
        }
      });
    } else {
      let tmp = new Array(this.state.clients.length).fill(false);
      tmp[index] = true;
      this.setState({
        isUnlinkEnabled: tmp,
        isDeleteEnabled: new Array(this.state.clients.length).fill(false)
      });
    }
  }

  handleManageClient(clientId) {
    window.location.hash = 'userClients/client/' + clientId;
  }

  render() {
    return React.createElement(ContentPage, {
      title: "personalClientTitle",
      introMessage: "personalClientDescription"
    }, React.createElement(Grid, null, React.createElement(GridItem, {
      offset: 11,
      span: 1
    }, React.createElement(Button, {
      id: "add-client-btn",
      variant: "control",
      onClick: this.toggleLinkClient
    }, React.createElement(Msg, {
      msgKey: "doAddClient"
    }))), React.createElement(GridItem, {
      offset: 12,
      span: 1
    }, React.createElement(Button, {
      id: "create-btn",
      variant: "control",
      onClick: this.handleCreate
    }, React.createElement(Msg, {
      msgKey: "doCreateClient"
    })))), this.state.tokenInputEnabled && React.createElement(React.Fragment, null, React.createElement(Form, {
      isHorizontal: true,
      onSubmit: event => this.handleAddClient(event)
    }, React.createElement(FormGroup, {
      label: Msg.localize('adminToken'),
      fieldId: "admin-token"
    }, React.createElement(TextInput, {
      type: "text",
      id: "admin-token",
      name: "adminTok",
      value: this.state.adminTok,
      onChange: this.handleChangeAdminTok
    }), React.createElement(Grid, null, React.createElement(GridItem, {
      span: 1
    }, React.createElement(Button, {
      type: "submit",
      id: "add-client-btn",
      variant: "primary"
    }, React.createElement(Msg, {
      msgKey: "doAddClient"
    }))), React.createElement(GridItem, {
      offset: 1,
      span: 1
    }, React.createElement(Button, {
      id: "clear-tok-field-btn",
      variant: "tertiary",
      onClick: () => this.setState({
        adminTok: ''
      })
    }, React.createElement(Msg, {
      msgKey: "doClearTokenField"
    })))))), React.createElement("div", {
      className: "pf-c-divider pf-m-vertical pf-m-inset-md",
      role: "separator"
    }, " ")), React.createElement(DataList, {
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
      }, React.createElement(Grid, null, React.createElement(GridItem, {
        span: 6
      }, React.createElement("strong", null, React.createElement(Msg, {
        msgKey: "clientUnlink"
      }))), React.createElement(GridItem, {
        span: 6
      }, React.createElement("strong", null, React.createElement(Msg, {
        msgKey: "clientDelete"
      })))))]
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
          onClick: () => this.handleManageClient(client.clientId)
        }, client.clientId)), React.createElement(DataListCell, {
          id: this.elementId('name', client),
          width: 2,
          key: 'name-' + appIndex
        }, client.name || '---'), React.createElement(DataListCell, {
          id: this.elementId('description', client),
          width: 2,
          key: 'description-' + appIndex
        }, client.description || '---'), React.createElement(DataListCell, {
          id: this.elementId('delete', client),
          width: 1,
          key: 'delete-' + appIndex
        }, React.createElement(Grid, null, React.createElement(GridItem, {
          span: 6
        }, React.createElement(Grid, null, this.state.isUnlinkEnabled[appIndex] && React.createElement(GridItem, {
          span: 12
        }, React.createElement("p", {
          style: {
            color: 'red'
          }
        }, React.createElement(Msg, {
          msgKey: "deleteClientWarning"
        }))), React.createElement(GridItem, {
          span: 6
        }, React.createElement(Button, {
          component: "a",
          variant: "secondary",
          onClick: () => this.handleUnlinkClient(client.clientId, appIndex)
        }, React.createElement(MinusCircleIcon, null))), this.state.isUnlinkEnabled[appIndex] && React.createElement(GridItem, {
          span: 6
        }, React.createElement(Button, {
          component: "a",
          variant: "tertiary",
          onClick: () => this.setState({
            isUnlinkEnabled: new Array(this.state.clients.length).fill(false)
          })
        }, React.createElement(AngleUpIcon, null))))), React.createElement(GridItem, {
          span: 6
        }, React.createElement(Grid, null, this.state.isDeleteEnabled[appIndex] && React.createElement(GridItem, {
          span: 12
        }, React.createElement("p", {
          style: {
            color: 'red'
          }
        }, React.createElement(Msg, {
          msgKey: "deleteClientWarning"
        }))), React.createElement(GridItem, {
          span: 6
        }, React.createElement(Button, {
          component: "a",
          variant: "danger",
          onClick: () => this.handleDeleteClient(client.clientId, appIndex)
        }, React.createElement(TrashIcon, null))), this.state.isDeleteEnabled[appIndex] && React.createElement(GridItem, {
          span: 6
        }, React.createElement(Button, {
          component: "a",
          variant: "tertiary",
          onClick: () => this.setState({
            isDeleteEnabled: new Array(this.state.clients.length).fill(false)
          })
        }, React.createElement(AngleUpIcon, null)))))))]
      })));
    })));
  }

}

_defineProperty(UserClientPage, "contextType", AccountServiceContext);
//# sourceMappingURL=UserClientPage.js.map