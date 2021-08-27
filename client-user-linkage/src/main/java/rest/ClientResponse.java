package rest;

import org.keycloak.representations.idm.ClientRepresentation;

/**
 * Class to bundle the response of requesting clients.
 */
public class ClientResponse {
    protected String adminToken;
    protected ClientRepresentation clientRep;

    public ClientResponse(String adminTok, ClientRepresentation client) {
        this.adminToken = adminTok;
        this.clientRep = client;
    }

    public String getAdminToken() {
        return adminToken;
    }

    public ClientRepresentation getClientRep() {
        return clientRep;
    }

    public void setAdminToken(String adminToken) {
        this.adminToken = adminToken;
    }

    public void setClient(ClientRepresentation client) {
        this.clientRep = client;
    }
}
