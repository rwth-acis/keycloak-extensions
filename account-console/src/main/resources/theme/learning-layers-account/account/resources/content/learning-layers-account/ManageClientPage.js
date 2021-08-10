function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

import * as React from "../../../../common/keycloak/web_modules/react.js";
import { AccountServiceContext } from "../../account-service/AccountServiceContext.js";
import { ContentPage } from "../ContentPage.js";
import { withRouter } from "../../../../common/keycloak/web_modules/react-router-dom.js";
import { Msg } from "../../widgets/Msg.js";
export class ManageClient extends React.Component {
  constructor(props, context) {
    super(props);

    _defineProperty(this, "context", void 0);

    this.context = context;

    if (this.props.match.params.id !== undefined) {
      this.state = {
        //isExtended: [false, false],
        clientId: this.props.match.params.id
      };
    } else {
      this.state = {
        //isExtended: [],
        clientId: ''
      };
    }
  }

  render() {
    console.log(this.props);
    return React.createElement(ContentPage, {
      title: this.state.clientId == '' ? 'Create new client' : Msg.localize("manageClientTitle") + this.state.clientId,
      introMessage: this.state.clientId == '' ? '' : Msg.localize("manageClientDescription")
    }, React.createElement("h1", null, "This is a test if anything is shown"));
  }

}

_defineProperty(ManageClient, "contextType", AccountServiceContext);

export const ManageClientPage = withRouter(ManageClient);
//# sourceMappingURL=ManageClientPage.js.map