function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

import * as React from "../../../../common/keycloak/web_modules/react.js";
import { AccountServiceContext } from "../../account-service/AccountServiceContext.js";
import { ContentPage } from "../ContentPage.js";
import { withRouter } from "../../../../common/keycloak/web_modules/react-router-dom.js";
import { Msg } from "../../widgets/Msg.js";
import { ActionGroup, Button, ButtonVariant, Expandable, Form, FormGroup, Grid, GridItem, InputGroup, Select, SelectOption, SelectVariant, Switch, Text, TextInput } from "../../../../common/keycloak/web_modules/@patternfly/react-core.js";
import { ContentAlert } from "../ContentAlert.js";
import { MinusCircleIcon, PlusCircleIcon } from "../../../../common/keycloak/web_modules/@patternfly/react-icons.js"; // can be found at /keycloak.v2/account/index.ftl

var pkceChallence;

(function (pkceChallence) {
  pkceChallence["S256"] = "S256";
  pkceChallence["plain"] = "plain";
  pkceChallence["none"] = "none";
})(pkceChallence || (pkceChallence = {}));

var accessTypes;

(function (accessTypes) {
  accessTypes["confidential"] = "confidential";
  accessTypes["public"] = "public";
  accessTypes["bearer_only"] = "bearer-only";
})(accessTypes || (accessTypes = {}));

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
    "exclude.session.state.from.auth.response": 'false'
  }
};
export class ManageClient extends React.Component {
  constructor(props, context) {
    super(props);

    _defineProperty(this, "context", void 0);

    _defineProperty(this, "handleChange", (value, event) => {
      const target = event.currentTarget;
      const name = target.name;
      this.setState({
        client: { ...this.state.client,
          [name]: value
        }
      });
    });

    _defineProperty(this, "handleAttrChange", (value, event) => {
      const target = event.currentTarget;
      const name = target.name;
      let tmp = this.state.client.attributes;

      if (target.type == 'number') {
        tmp[name] = (parseInt(value) * 60).toString();
      } else {
        tmp[name] = value.toString();
      }

      this.setState({
        client: { ...this.state.client,
          attributes: tmp
        }
      });
    });

    _defineProperty(this, "handleArrayChange", (value, event) => {
      const target = event.currentTarget;
      const name = target.name.split('-');
      let tmp = [];

      switch (name[0]) {
        case 'redirectUris':
          tmp = this.state.client.redirectUris;
          tmp[parseInt(name[1])] = value;
          this.setState({
            client: { ...this.state.client,
              redirectUris: tmp
            }
          });
          break;

        case 'webOrigins':
          tmp = this.state.client.webOrigins;
          tmp[parseInt(name[1])] = value;
          this.setState({
            client: { ...this.state.client,
              webOrigins: tmp
            }
          });
          break;

        default:
          console.log('Some not defined array should be fixed');
      }
    });

    _defineProperty(this, "toggleAccessType", accessTypeExpanded => {
      this.setState({
        accessTypeExpanded
      });
    });

    _defineProperty(this, "selectAccessType", (_event, selection) => {
      switch (selection) {
        case accessTypes.confidential:
          this.setState({
            accessTypeSelected: selection,
            accessTypeExpanded: false,
            client: { ...this.state.client,
              publicClient: false,
              bearerOnly: false
            }
          });
          break;

        case accessTypes.public:
          this.setState({
            accessTypeSelected: selection,
            accessTypeExpanded: false,
            client: { ...this.state.client,
              publicClient: true,
              bearerOnly: false
            }
          });
          break;

        case accessTypes.bearer_only:
          this.setState({
            accessTypeSelected: selection,
            accessTypeExpanded: false,
            client: { ...this.state.client,
              publicClient: false,
              bearerOnly: true
            }
          });
          break;

        default:
          console.log("Error: selected value is neither confidential, public or bearer_only. Value is instead: " + selection);
          ContentAlert.warning('Something went wrong when selection the access type.');
      }
    });

    _defineProperty(this, "togglePKCEChallenge", pkceChallengeExpanded => {
      this.setState({
        pkceChallengeExpanded
      });
    });

    _defineProperty(this, "selectPKCEChallenge", (_event, selection) => {
      let tmp = this.state.client.attributes;
      tmp["pkce.code.challenge.method"] = selection;
      this.setState({
        pkceChallengeExpanded: false,
        pkceChallengeSelected: selection,
        client: { ...this.state.client,
          attributes: tmp
        }
      });
    });

    _defineProperty(this, "addUri", uriType => {
      let tmpArr = [];

      switch (uriType) {
        case 'redirectUris':
          tmpArr = this.state.client.redirectUris;
          tmpArr.push('');
          this.setState({
            client: { ...this.state.client,
              redirectUris: tmpArr
            }
          });
          break;

        case 'webOrigins':
          tmpArr = this.state.client.webOrigins;
          tmpArr.push('');
          this.setState({
            client: { ...this.state.client,
              webOrigins: tmpArr
            }
          });
          break;
      }
    });

    _defineProperty(this, "onToggle", index => {
      let tmp = this.state.isExtended;
      tmp[index] = !tmp[index];
      this.setState({
        isExtended: tmp
      });
    });

    _defineProperty(this, "handleCopyAdminTok", () => {
      navigator.clipboard.writeText(this.state.adminToken);
      ContentAlert.success(Msg.localize('copiedToClipboard'));
    });

    _defineProperty(this, "handleCancel", () => {
      if (this.state.noClient) {
        window.location.hash = 'userClients';
      } else {
        this.requestClient(this.props.match.params.id);
      }
    });

    _defineProperty(this, "handleSubmit", event => {
      event.preventDefault();
      const form = event.target;
      const isValid = form.checkValidity();
      console.log(this.state);

      if (isValid) {
        const reqData = this.state.client; // DEBUGGING
        // console.log("Submit client:");
        // console.log(reqData);

        if (this.state.noClient) {
          if (reqData.rootUrl) {
            reqData.redirectUris.push(reqData.rootUrl + '/*');
            reqData.webOrigins.push(reqData.rootUrl);
            reqData.adminUrl = reqData.rootUrl;
          }

          let url = authUrl + 'realms/' + realm + '/userClientAdministration/create';
          this.context.doPost(url, reqData).then(response => {
            if (response.ok) {
              ContentAlert.success(Msg.localize('successfullClientCreation'));
              window.location.hash = 'userClients/client/' + reqData.clientId;
              window.location.reload();
            } else {
              ContentAlert.warning('Could not create client.\n' + response.status + ' ' + response.statusText);
              console.log(response.status + ' ' + response.statusText);
            }
          });
        } else {
          let url = authUrl + 'realms/' + realm + '/userClientAdministration/client/' + this.state.client.id; // DEBUGGING
          // console.log("Changing existent client")
          // console.log(reqData);

          this.context.doPost(url, reqData).then(response => {
            if (response.ok) {
              ContentAlert.success(Msg.localize('successfullClientUpdate'));
            } else {
              ContentAlert.warning('Could not change client.\n' + response.status + ' ' + response.statusText);
              console.log(response.status + ' ' + response.statusText);
            }
          });
        }
      } else {
        // TODO: improve alerts/warnings at invalid input
        ContentAlert.info("A client needs at least a clientId, one valid redirectUri. Confidential clients also need a client secret.\n" + " Note that you should begin urls with http:// or https://?"); // DEBUGGING
        // console.log('HTMLFormElement not valid')
        // console.log(form.querySelectorAll(':invalid'))
      }
    });

    this.context = context;
    this.state = {
      noClient: true,
      isExtended: [false, false],
      accessTypeExpanded: false,
      accessTypeSelected: accessTypes.public,
      pkceChallengeExpanded: false,
      pkceChallengeSelected: pkceChallence.none,
      adminToken: '',
      client: emptyClientFields
    };

    if (this.props.match.params.id !== '' && this.props.match.params.id !== undefined) {
      this.requestClient(this.props.match.params.id);
    }
  }

  requestClient(clientId) {
    let url = authUrl + 'realms/' + realm + '/userClientAdministration/client/' + clientId;
    this.context.doGet(url).then(response => {
      if (response.ok) {
        const responseData = response.data || {
          adminToken: '',
          clientRep: emptyClientFields
        };
        console.log(responseData);
        this.setState({
          noClient: false,
          isExtended: [false, false],
          accessTypeSelected: this.setAccessType(responseData.clientRep.publicClient, responseData.clientRep.bearerOnly),
          pkceChallengeSelected: this.setPKCEChallenge(responseData.clientRep.attributes["pkce.code.challenge.method"]),
          adminToken: responseData.adminToken,
          client: responseData.clientRep
        });
        console.log("got client data:");
        console.log(this.state);

        if (this.state.client == emptyClientFields) {
          console.log("got no data for client");
          ContentAlert.warning('No data was send for the client ' + clientId);
        }
      } else {
        ContentAlert.warning('You have no access to the client!.\n' + response.status + ' ' + response.statusText);
      }
    });
  }

  setAccessType(pubClient, bearer) {
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

  setPKCEChallenge(challenge) {
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
        return pkceChallence.none;
    }
  }

  removeUri(index, uriType) {
    let tmpArr = [];

    switch (uriType) {
      case 'redirectUris':
        console.log(this.state.client.redirectUris);
        tmpArr = this.state.client.redirectUris;
        tmpArr.splice(index, 1);
        console.log(tmpArr);
        this.setState({
          client: { ...this.state.client,
            redirectUris: tmpArr
          }
        });
        break;

      case 'webOrigins':
        tmpArr = this.state.client.webOrigins;
        tmpArr.splice(index, 1);
        this.setState({
          client: { ...this.state.client,
            webOrigins: tmpArr
          }
        });
        break;
    }
  }

  render() {
    const client = this.state.client;
    return React.createElement(ContentPage, {
      title: this.state.noClient ? 'Create new client' : Msg.localize("manageClientTitle") + ' ' + this.state.client.clientId,
      introMessage: this.state.noClient ? '' : Msg.localize("manageClientDescription")
    }, !this.state.noClient && React.createElement(React.Fragment, null, React.createElement(Grid, null, React.createElement(GridItem, {
      offset: 12
    }, React.createElement(Button, {
      id: "admin-token-btn",
      variant: "tertiary",
      onClick: this.handleCopyAdminTok
    }, React.createElement(Msg, {
      msgKey: "doCopyAdminToken"
    })))), React.createElement("div", {
      className: "pf-c-divider pf-m-vertical pf-m-inset-md",
      role: "separator"
    }, " ")), React.createElement(Form, {
      isHorizontal: true,
      onSubmit: event => this.handleSubmit(event)
    }, this.state.noClient ? React.createElement(React.Fragment, null, React.createElement(FormGroup, {
      label: Msg.localize('clientId'),
      isRequired: true,
      fieldId: "client-id"
    }, React.createElement(TextInput, {
      isRequired: true,
      type: "text",
      id: "client-id",
      name: "clientId",
      maxLength: 254,
      value: client.clientId,
      onChange: this.handleChange
    })), React.createElement(FormGroup, {
      label: Msg.localize('clientRootUrl'),
      fieldId: "client-root-url"
    }, React.createElement(TextInput, {
      type: "url",
      id: "client-root-url",
      name: "rootUrl",
      maxLength: 254,
      value: client.rootUrl ? client.rootUrl : '',
      onChange: this.handleChange
    }))) : React.createElement(React.Fragment, null, React.createElement(FormGroup, {
      label: Msg.localize('clientId'),
      isRequired: true,
      fieldId: "client-id"
    }, React.createElement(TextInput, {
      isRequired: true,
      type: "text",
      id: "client-id",
      name: "clientId",
      maxLength: 254,
      value: client.clientId,
      onChange: this.handleChange
    })), React.createElement(FormGroup, {
      label: Msg.localize('clientName'),
      fieldId: "client-name"
    }, React.createElement(TextInput, {
      type: "text",
      id: "client-name",
      name: "name",
      maxLength: 254,
      value: client.name ? client.name : '',
      onChange: this.handleChange
    })), React.createElement(FormGroup, {
      label: Msg.localize('clientDescription'),
      fieldId: "client-description"
    }, React.createElement(TextInput, {
      type: "text",
      id: "client-description",
      name: "description",
      maxLength: 254,
      value: client.description ? client.description : '',
      onChange: this.handleChange
    })), React.createElement(FormGroup, {
      label: Msg.localize('clientSecret'),
      isRequired: !client.publicClient && !client.bearerOnly,
      fieldId: "client-secret"
    }, React.createElement(TextInput, {
      isRequired: !client.publicClient && !client.bearerOnly,
      isDisabled: client.publicClient || client.bearerOnly,
      type: "text",
      id: "client-secret",
      name: "secret",
      maxLength: 254,
      value: !client.secret && (client.publicClient || client.bearerOnly) ? 'This type of clients do not have secrets' : !client.secret ? '' : client.secret,
      onChange: this.handleChange
    })), React.createElement(FormGroup, {
      label: Msg.localize('clientEnabled'),
      fieldId: "client-enabled"
    }, React.createElement(Switch, {
      id: "client-enabled",
      name: "enabled",
      label: " ",
      labelOff: " ",
      isChecked: client.enabled,
      onChange: this.handleChange
    })), React.createElement(FormGroup, {
      label: Msg.localize('clientAlwaysDisplayInConsole'),
      fieldId: "client-always-display-in-console"
    }, React.createElement(Switch, {
      id: "client-always-display-in-console",
      name: "alwaysDisplayInConsole",
      label: " ",
      labelOff: " ",
      isChecked: client.alwaysDisplayInConsole,
      onChange: this.handleChange
    })), React.createElement(FormGroup, {
      label: Msg.localize('clientConsentRequired'),
      fieldId: "client-consent-required"
    }, React.createElement(Switch, {
      id: "client-consent-required",
      name: "consentRequired",
      label: " ",
      labelOff: " ",
      isChecked: client.consentRequired,
      onChange: this.handleChange
    })), React.createElement(FormGroup, {
      label: Msg.localize('clientAccessType'),
      fieldId: "client-access-type"
    }, React.createElement(Select, {
      direction: "down",
      variant: SelectVariant.single,
      "aria-label": "Select the access type",
      onToggle: this.toggleAccessType,
      onSelect: this.selectAccessType,
      selections: this.state.accessTypeSelected,
      isExpanded: this.state.accessTypeExpanded
    }, [React.createElement(SelectOption, {
      key: 0,
      value: accessTypes.confidential
    }), React.createElement(SelectOption, {
      key: 1,
      value: accessTypes.public
    }), React.createElement(SelectOption, {
      key: 2,
      value: accessTypes.bearer_only
    })])), React.createElement(FormGroup, {
      label: Msg.localize('clientStandardFlowEnabled'),
      fieldId: "client-standard-flow-enabled"
    }, React.createElement(Switch, {
      id: "client-standard-flow-enabled",
      name: "standardFlowEnabled",
      label: " ",
      labelOff: " ",
      isChecked: client.standardFlowEnabled,
      onChange: this.handleChange
    })), React.createElement(FormGroup, {
      label: Msg.localize('clientImplicitFlowEnabled'),
      fieldId: "client-implicit-flow-enabled"
    }, React.createElement(Switch, {
      id: "client-implicit-flow-enabled",
      name: "implicitFlowEnabled",
      label: " ",
      labelOff: " ",
      isChecked: client.implicitFlowEnabled,
      onChange: this.handleChange
    })), React.createElement(FormGroup, {
      label: Msg.localize('clientDirectAccessGrantsEnabled'),
      fieldId: "client-direct-access-grants-enabled"
    }, React.createElement(Switch, {
      id: "client-direct-access-grants-enabled",
      name: "directAccessGrantsEnabled",
      label: " ",
      labelOff: " ",
      isChecked: client.directAccessGrantsEnabled,
      onChange: this.handleChange
    })), React.createElement(FormGroup, {
      label: Msg.localize('clientServiceAccountsEnabled'),
      fieldId: "client-service-accounts-enabled"
    }, React.createElement(Switch, {
      id: "client-service-accounts-enabled",
      name: "serviceAccountsEnabled",
      label: " ",
      labelOff: " ",
      isChecked: client.serviceAccountsEnabled,
      onChange: this.handleChange
    })), React.createElement(FormGroup, {
      label: Msg.localize('clientOauth2DeviceEnabled'),
      fieldId: "client-oauth2-device-enabled"
    }, React.createElement(Switch, {
      id: "client-oauth2-device-enabled",
      name: "oauth2.device.authorization.grant.enabled",
      label: " ",
      labelOff: " ",
      isChecked: client.attributes["oauth2.device.authorization.grant.enabled"] === 'true',
      onChange: this.handleAttrChange
    })), React.createElement(FormGroup, {
      label: Msg.localize('clientRootUrl'),
      fieldId: "client-root-url"
    }, React.createElement(TextInput, {
      type: "url",
      id: "client-root-url",
      name: "rootUrl",
      maxLength: 254,
      value: client.rootUrl ? client.rootUrl : '',
      onChange: this.handleChange
    })), React.createElement(FormGroup, {
      label: Msg.localize("clientRedirectUris"),
      fieldId: "client-redirect-uri",
      isRequired: true // labelIcon={
      //     <HelpItem
      //         helpText="clients-help:validRedirectURIs"
      //         forLabel={t("validRedirectUri")}
      //         forID={t(`common:helpLabel`, { label: t("validRedirectUri") })}
      //     />
      // }

    }, client.redirectUris.length > 1 ? client.redirectUris.map((uri, index) => {
      return React.createElement(React.Fragment, null, React.createElement(InputGroup, null, React.createElement(TextInput, {
        type: "text",
        isRequired: true,
        id: "client-redirect-uri",
        name: 'redirectUris-' + index,
        value: uri,
        onChange: this.handleArrayChange
      }), React.createElement(Button, {
        variant: ButtonVariant.link,
        onClick: () => this.removeUri(index, 'redirectUris'),
        tabIndex: -1,
        "aria-label": "remove"
      }, React.createElement(MinusCircleIcon, null))));
    }) : React.createElement(InputGroup, null, React.createElement(TextInput, {
      type: "text",
      isRequired: true,
      id: "client-redirect-uri",
      name: 'redirectUris-' + 0,
      value: client.redirectUris[0] ? client.redirectUris[0] : '',
      onChange: this.handleArrayChange
    }), React.createElement(Button, {
      variant: ButtonVariant.link,
      onClick: () => this.removeUri(0, 'redirectUris'),
      tabIndex: -1,
      "aria-label": "remove",
      isDisabled: client.redirectUris.length !== 1
    }, React.createElement(MinusCircleIcon, null))), React.createElement(Button, {
      variant: ButtonVariant.link,
      onClick: () => this.addUri('redirectUris'),
      tabIndex: -1,
      "ara-label": "add"
    }, React.createElement(PlusCircleIcon, null), " ", 'add URI')), React.createElement(FormGroup, {
      label: Msg.localize('clientBaseUrl'),
      fieldId: "client-base-url"
    }, React.createElement(TextInput, {
      type: "text",
      id: "client-base-url",
      name: "baseUrl",
      maxLength: 254,
      value: client.baseUrl ? client.baseUrl : '',
      onChange: this.handleChange
    })), React.createElement(FormGroup, {
      label: Msg.localize('clientAdminUrl'),
      fieldId: "client-admin-url"
    }, React.createElement(TextInput, {
      type: "text",
      id: "client-admin-url",
      name: "adminUrl",
      maxLength: 254,
      value: client.adminUrl ? client.adminUrl : '',
      onChange: this.handleChange
    })), React.createElement(FormGroup, {
      label: Msg.localize("clientWebOrigins"),
      fieldId: "client-web-origins" // labelIcon={
      //     <HelpItem
      //         helpText="clients-help:validRedirectURIs"
      //         forLabel={t("validRedirectUri")}
      //         forID={t(`common:helpLabel`, { label: t("validRedirectUri") })}
      //     />
      // }

    }, client.webOrigins.length > 1 ? client.webOrigins.map((origin, index) => React.createElement(React.Fragment, null, React.createElement(InputGroup, null, React.createElement(TextInput, {
      type: "text",
      id: "client-web-origins",
      name: 'webOrigins-' + index,
      value: origin,
      onChange: this.handleArrayChange
    }), React.createElement(Button, {
      variant: ButtonVariant.link,
      onClick: () => this.removeUri(index, 'webOrigins'),
      tabIndex: -1,
      "aria-label": "remove"
    }, React.createElement(MinusCircleIcon, null))))) : React.createElement(InputGroup, null, React.createElement(TextInput, {
      type: "text",
      id: "client-web-origins",
      name: 'webOrigins-' + 0,
      value: client.webOrigins[0] ? client.webOrigins[0] : '',
      onChange: this.handleArrayChange
    }), React.createElement(Button, {
      variant: ButtonVariant.link,
      onClick: () => this.removeUri(0, 'webOrigins'),
      tabIndex: -1,
      "aria-label": "remove",
      isDisabled: client.webOrigins.length !== 1
    }, React.createElement(MinusCircleIcon, null))), React.createElement(Button, {
      variant: ButtonVariant.link,
      onClick: () => this.addUri('webOrigins'),
      tabIndex: -1,
      "ara-label": "add"
    }, React.createElement(PlusCircleIcon, null), " ", 'add URI')), React.createElement(FormGroup, {
      label: Msg.localize('clientBackchannelLogoutUrl'),
      fieldId: "client-backchannel-logout-url"
    }, React.createElement(TextInput, {
      type: "text",
      id: "client-backchannel-logout-url",
      name: "backchannel.logout.url",
      maxLength: 254,
      value: client.attributes["backchannel.logout.url"] ? client.attributes["backchannel.logout.url"] : '',
      onChange: this.handleAttrChange
    })), React.createElement(FormGroup, {
      label: Msg.localize('clientBackchannelRequired'),
      fieldId: "client-backchannel-required"
    }, React.createElement(Switch, {
      id: "client-backchannel-required",
      name: "backchannel.logout.session.required",
      label: " ",
      labelOff: " ",
      isChecked: client.attributes["backchannel.logout.session.required"] === 'true',
      onChange: this.handleAttrChange
    })), React.createElement(FormGroup, {
      label: Msg.localize('clientBackchannelRevokeOfflineTokens'),
      fieldId: "client-backchannel-revoke-offline-tokens"
    }, React.createElement(Switch, {
      id: "client-backchannel-revoke-offline-tokens",
      name: "backchannel.logout.revoke.offline.tokens",
      label: " ",
      labelOff: " ",
      isChecked: client.attributes["backchannel.logout.revoke.offline.tokens"] === 'true',
      onChange: this.handleAttrChange
    })), React.createElement(Expandable, {
      toggleText: "OpenID Connect Compatibility Modes",
      onToggle: () => this.onToggle(0),
      isExpanded: this.state.isExtended[0]
    }, React.createElement(FormGroup, {
      label: Msg.localize('clientExcludeSessionState'),
      fieldId: "client-exclude-session-state"
    }, React.createElement(Switch, {
      id: "client-exclude-session-state",
      name: "exclude.session.state.from.auth.response",
      label: " ",
      labelOff: " ",
      isChecked: client.attributes["exclude.session.state.from.auth.response"] === 'true',
      onChange: this.handleAttrChange
    })), React.createElement(FormGroup, {
      label: Msg.localize('clientUseRefreshTokens'),
      fieldId: "client-use-refresh-tokens"
    }, React.createElement(Switch, {
      id: "client-use-refresh-tokens",
      name: "use.refresh.tokens",
      label: " ",
      labelOff: " ",
      isChecked: client.attributes["use.refresh.tokens"] === 'true',
      onChange: this.handleAttrChange
    })), React.createElement(FormGroup, {
      label: Msg.localize('clientUseRefreshTokensCredentialGrant'),
      fieldId: "client-use-refresh-tokens-for-credential-grant"
    }, React.createElement(Switch, {
      id: "client-use-refresh-tokens-for-credential-grant",
      name: "client_credentials.use_refresh_token",
      label: " ",
      labelOff: " ",
      isChecked: client.attributes["client_credentials.use_refresh_token"] === 'true',
      onChange: this.handleAttrChange
    }))), React.createElement(Expandable, {
      toggleText: "Advanced Settings",
      onToggle: () => this.onToggle(1),
      isExpanded: this.state.isExtended[1]
    }, React.createElement(FormGroup, {
      label: Msg.localize('clientAccessTokenLifeSpan'),
      fieldId: "client-access-token-lifespan"
    }, React.createElement(InputGroup, null, React.createElement(TextInput, {
      type: "number",
      id: "client-access-token-lifespan",
      name: "access.token.lifespan",
      value: client.attributes["access.token.lifespan"] ? parseInt(client.attributes["access.token.lifespan"]) / 60 : '',
      onChange: this.handleAttrChange
    }), React.createElement(Text, null, "Minutes"))), React.createElement(FormGroup, {
      label: Msg.localize('clientSessionIdle'),
      fieldId: "client-session-idle"
    }, React.createElement(InputGroup, null, React.createElement(TextInput, {
      type: "number",
      id: "client-session-idle",
      name: "client.session.idle.timeout",
      value: client.attributes["client.session.idle.timeout"] ? parseInt(client.attributes["client.session.idle.timeout"]) / 60 : '',
      onChange: this.handleAttrChange
    }), React.createElement(Text, null, "Minutes"))), React.createElement(FormGroup, {
      label: Msg.localize('clientSessionMax'),
      fieldId: "client-session-max"
    }, React.createElement(InputGroup, null, React.createElement(TextInput, {
      type: "number",
      id: "client-session-max",
      name: "client.session.max.lifespan",
      value: client.attributes["client.session.max.lifespan"] ? parseInt(client.attributes["client.session.max.lifespan"]) / 60 : '',
      onChange: this.handleAttrChange
    }), React.createElement(Text, null, "Minutes"))), React.createElement(FormGroup, {
      label: Msg.localize('clientOfflineSessionIdle'),
      fieldId: "client-offline-session-idle"
    }, React.createElement(InputGroup, null, React.createElement(TextInput, {
      type: "number",
      id: "client-offline-session-idle",
      name: "client.offline.session.idle.timeout",
      value: client.attributes["client.offline.session.idle.timeout"] ? parseInt(client.attributes["client.offline.session.idle.timeout"]) / 60 : '',
      onChange: this.handleAttrChange
    }), React.createElement(Text, null, "Minutes"))), React.createElement(FormGroup, {
      label: Msg.localize('clientOfflineSessionMax'),
      fieldId: "client-offline-session-max"
    }, React.createElement(InputGroup, null, React.createElement(TextInput, {
      type: "number",
      id: "client-offline-session-max",
      name: "client.offline.session.max.lifespan",
      value: client.attributes["client.offline.session.max.lifespan"] ? parseInt(client.attributes["client.offline.session.max.lifespan"]) / 60 : '',
      onChange: this.handleAttrChange
    }), React.createElement(Text, null, "Minutes"))), React.createElement(FormGroup, {
      label: Msg.localize('clientTlsCertBoundAccessTokens'),
      fieldId: "client-tls-cert-bound-access-tokens"
    }, React.createElement(Switch, {
      id: "client-tls-cert-bound-access-tokens",
      name: "tls.client.certificate.bound.access.tokens",
      label: " ",
      labelOff: " ",
      isChecked: client.attributes["tls.client.certificate.bound.access.tokens"] === 'true',
      onChange: this.handleAttrChange
    })), React.createElement(FormGroup, {
      label: Msg.localize('clientPKCECodeChallenge'),
      fieldId: "client-pkce-code-challenge"
    }, React.createElement(Select, {
      direction: "down",
      variant: SelectVariant.single,
      "aria-label": "Select the PKCE code challenge",
      onToggle: this.togglePKCEChallenge,
      onSelect: this.selectPKCEChallenge,
      selections: this.state.pkceChallengeSelected,
      isExpanded: this.state.pkceChallengeExpanded
    }, [React.createElement(SelectOption, {
      key: 0,
      value: pkceChallence.S256
    }), React.createElement(SelectOption, {
      key: 1,
      value: pkceChallence.plain
    }), React.createElement(SelectOption, {
      key: 2,
      value: pkceChallence.none
    })])))), React.createElement(ActionGroup, null, React.createElement(Button, {
      type: "submit",
      id: "save-client-btn",
      variant: "primary"
    }, React.createElement(Msg, {
      msgKey: "doSaveClient"
    })), React.createElement(Button, {
      id: "cancel-client-btn",
      variant: "secondary",
      onClick: this.handleCancel
    }, React.createElement(Msg, {
      msgKey: "doCancelClient"
    })))));
  }

}

_defineProperty(ManageClient, "contextType", AccountServiceContext);

export const ManageClientPage = withRouter(ManageClient);
//# sourceMappingURL=ManageClientPage.js.map