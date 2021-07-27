package rest;

import jpa.ClientUserLink;
import org.jboss.logging.Logger;
import org.keycloak.common.util.Time;
import org.keycloak.connections.jpa.JpaConnectionProvider;
import org.keycloak.crypto.AsymmetricSignatureSignerContext;
import org.keycloak.crypto.KeyUse;
import org.keycloak.crypto.KeyWrapper;
import org.keycloak.jose.jws.DefaultTokenManager;
import org.keycloak.jose.jws.JWSBuilder;
import org.keycloak.models.ClientModel;
import org.keycloak.models.ClientScopeModel;
import org.keycloak.models.KeycloakSession;
import org.keycloak.models.utils.KeycloakModelUtils;
import org.keycloak.models.utils.ModelToRepresentation;
import org.keycloak.models.utils.RepresentationToModel;
import org.keycloak.representations.JsonWebToken;
import org.keycloak.representations.idm.ClientRepresentation;
import org.keycloak.services.managers.AppAuthManager;
import org.keycloak.services.managers.AuthenticationManager;

import javax.json.Json;
import javax.persistence.EntityManager;
import javax.ws.rs.*;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;
import java.util.LinkedList;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;


class AdminTokenParams {
    private String adminToken;

    public String getAdminToken() {
        return adminToken;
    }
}

// TODO: remove all loggin stuff
public class LinkageResource {

    private static final Logger log = Logger.getLogger(LinkageResourceProvider.class);

    private final KeycloakSession session;
    private final AuthenticationManager.AuthResult auth;

    public LinkageResource(KeycloakSession session){
        this.session = session;
        this.auth = new AppAuthManager().authenticateIdentityCookie(session, session.getContext().getRealm());
        log.debug("!!!No authentication during development!!!");
    }

    /**
     * Requests all clientsIds that are linked to the user who performs the request.
     *
     * @return List of clientIds
     */
    @GET
    @Path("/clients")
    @Produces({MediaType.APPLICATION_JSON})
    public Response getUserClients(){
        if(auth == null) {
            return forbidden();
        }

        String userId = auth.getUser().getId();
        log.info("User " + userId + " tried to request its clients");

        List<ClientRepresentation> clients = getUserClients(userId);
        // for logging:
        List<String> clientIdsForDebugging = new LinkedList<>();
        for(ClientRepresentation cli : clients) {
            clientIdsForDebugging.add(cli.getClientId());
        }
        log.info("Found clients: " + clientIdsForDebugging);
        return Response.status(Response.Status.OK).entity(clients).build();
    }

    /**
     * Requests the client representation of the given clientId, which contains all information of the client
     *
     * @param clientId clientId of the client of which the representation should be given
     * @return ClientRepresentation of the client specified by clientId
     */
    @GET
    @Path("/client/{clientId}")
    @Produces(MediaType.APPLICATION_JSON)
    public Response getClient(@PathParam("clientId") String clientId) {
        if(clientId.equals("")) {
            return badRequest("no client id given in request");
        }
        if(auth == null || !userHasAccess(auth.getUser().getId(), clientId)) {
            return forbidden();
        }

        ClientModel client = session.clientLocalStorage().getClientByClientId(session.getContext().getRealm(), clientId);
        log.info("User " + auth.getUser().getUsername() + " requested client " + client.getClientId());
        ClientRepresentation rep = ModelToRepresentation.toRepresentation(client, session);
        rep.setSecret(client.getSecret());
        rep.setRegistrationAccessToken(client.getRegistrationToken());

        return Response.status(Response.Status.OK).entity(rep).build();
    }

    /**
     * Creates a new client and creates a new entry in the clientUserLinkage table to link the new client to the user
     * who has created it. Additionally it creates a new administration token that grants a user access to a specific client.

     * @param clientRep ClientRepresentation with the configuration of the client that should be created
     * @return the administration token that gives user access to the client
     */
    @POST
    @Path("/client/create")
    @Consumes(MediaType.APPLICATION_JSON)
    @Produces(MediaType.APPLICATION_JSON)
    public Response createClient(ClientRepresentation clientRep) {
        if(auth == null) {
            return forbidden();
        }
        if(clientRep.getClientId().equals("") || clientRep.getRedirectUris().isEmpty() ) {
            return badRequest("please choose at least a clientId and one redirect URI");
        }
        if(session.clientStorageManager().getClientByClientId(session.getContext().getRealm(), clientRep.getClientId()) != null) {
            return badRequest("clientId already in use. Select a different one");
        }
        // add new client
        ClientModel newClient = RepresentationToModel.createClient(session, session.getContext().getRealm(), clientRep);
        Set<ClientScopeModel> scopes = session.getContext().getRealm().getDefaultClientScopesStream(true).collect(Collectors.toSet());
        newClient.addClientScopes(scopes, true);
        log.info("User " + auth.getUser().getUsername() + " creates client " + newClient.getClientId());

        // create new entry in CLIENT_USER_LINKAGE table
        String adminTok = generateAdminTok(newClient.getId());
        addClientUserLink(clientRep.getId(), auth.getUser().getId(), adminTok);
        return Response.status(Response.Status.OK).entity(adminTok).build();
    }

    /**
     * Changes settings of the client with the given clientId. Can also change the clientID, but not the internal id of
     * the client.
     *
     * @param clientId clientId of the client which should be changed
     * @param clientRep clientRepresentation that contains the settings which should be changed. Does not have to contain
     *                  settings that should not be changed
     * @return HTTP 200
     */
    @POST
    @Path("/client/{clientId}")
    @Consumes(MediaType.APPLICATION_JSON)
    @Produces(MediaType.APPLICATION_JSON)
    public Response changeClient(@PathParam("clientId") String clientId, ClientRepresentation  clientRep) {
        if(clientId.equals("")){
            return badRequest("no client id given in request");
        }
        if(auth == null || !userHasAccess(auth.getUser().getId(), clientId)) {
            return forbidden();
        }
        log.info("Client " + clientId + " will be changed.");
        ClientModel oldClient = session.clientStorageManager().getClientByClientId(session.getContext().getRealm(), clientId);
        RepresentationToModel.updateClient(clientRep, oldClient);

        ClientModel updatedClient = session.clientLocalStorage().getClientByClientId(session.getContext().getRealm(), clientRep.getClientId());
        ClientRepresentation newRep = ModelToRepresentation.toRepresentation(updatedClient, session);
        newRep.setSecret(updatedClient.getSecret());
        newRep.setRegistrationAccessToken(updatedClient.getRegistrationToken());

        return Response.status(Response.Status.OK).entity(newRep).build();
    }

    /**
     * Deletes the client with the given client Id. Also deletes the linkage in the CLIENT_USER_LINKAGE table
     *
     * @param clientId clientId of the client that should be deleted
     * @return HTTP 200
     */
    @DELETE
    @Path("/client/{clientId}")
    @Produces(MediaType.TEXT_PLAIN)
    public Response deleteClient(@PathParam("clientId") String clientId) {
        if(clientId.equals("")){
            return badRequest("no client id given in request");
        }
        if(auth == null || !userHasAccess(auth.getUser().getId(), clientId)) {
            return forbidden();
        }
        log.info("Client " + clientId + " will be removed");
        String intClientId = session.clientStorageManager().getClientByClientId(session.getContext().getRealm(), clientId).getId();
        boolean removed = session.clientStorageManager().removeClient(session.getContext().getRealm(), intClientId);
        if(!removed) {
            log.error("Could not remove client " + clientId + " from the realm");
            return badRequest("Could not remove client " +  clientId);
        }
        getEntityManager().createNamedQuery("deleteClientAndLinkage").setParameter("idClient", intClientId).executeUpdate();
        return Response.status(Response.Status.OK).entity("client " + clientId + " deleted successfully").build();
    }

    /**
     * Creates a Linkage between the current user and the client that is specified in the administration token. The
     * administration token was created and issued during the creation of a client
     *
     * @param adminTok administration token that grants the user access to a client and contains the internal client id
     *                 of the client
     * @return HTTP 200
     */
    @POST
    @Path("/client/access")
    @Consumes(MediaType.APPLICATION_JSON)
    @Produces(MediaType.TEXT_PLAIN)
    public Response addUserToClient(AdminTokenParams adminTokenInfo) {
        if(adminTokenInfo == null || adminTokenInfo.getAdminToken().equals("")) {
            return badRequest("no administration token given");
        }
        if(auth == null) {
            return forbidden();
        }

        String adminTok = adminTokenInfo.getAdminToken();
        log.info("User " + auth.getUser().getUsername() + " creates linkage with administration token " + adminTok);
        // verification of the token
        DefaultTokenManager tokManager = new DefaultTokenManager(session);
        JsonWebToken tok = tokManager.decode(adminTok, JsonWebToken.class);
        if(tok == null) {
            return Response.status(Response.Status.UNAUTHORIZED).build();
        }
        String intClientId = tok.getAudience()[0];
        if(!tok.getIssuer().equals(session.getContext().getAuthServerUrl().toASCIIString()) ||
                tok.getIat() > Time.currentTime() ||
                session.clientStorageManager().getClientById(session.getContext().getRealm(), intClientId) == null
        ) {
            return Response.status(Response.Status.UNAUTHORIZED).build();
        }

        addClientUserLink(intClientId, auth.getUser().getId(), adminTok);
        log.info("Created new user-client linkage between user " + auth.getUser().getUsername() + " and client with id " + intClientId);
        return Response.status(Response.Status.OK).entity("You got access to client " + intClientId).build();
    }

    /**
     * Deletes a Linkage between the current user and the client that has the given clientId
     *
     * @param clientId clientId of the client that should be unlinked of the current user
     * @return HTTP 200
     */
    @DELETE
    @Path("/client/access/{clientId}")
    @Produces(MediaType.TEXT_PLAIN)
    public Response removeUserFromClient(@PathParam("clientId") String clientId) {
        if(clientId.equals("")) {
            return badRequest("no clientId given");
        }
        if(auth == null || !userHasAccess(auth.getUser().getId(), clientId)) {
            return forbidden();
        }
        String intClientId = session.clientStorageManager().getClientByClientId(session.getContext().getRealm(), clientId).getId();
        getEntityManager().createNamedQuery("removeLinkage")
                .setParameter("userId", auth.getUser().getId())
                .setParameter("idClient", intClientId).executeUpdate();
        log.info("Deleted user-client linkage between user " + auth.getUser().getUsername() + " and client " + clientId);
        return Response.status(Response.Status.OK).entity("You has removed client " + clientId + " from your list of clients").build();
    }


    /**
     * Creates a new custom JsonWebToken that contains a token id, the ID of the client as audience, our url as issuer and the
     * creation time as issuedAt value.
     *
     * @param intClientId internal ID of the client for which the token should grant access
     * @return a signed token as String
     */
    private String generateAdminTok(String intClientId){
        JsonWebToken adminTok = new JsonWebToken();
        adminTok.id(KeycloakModelUtils.generateId());
        adminTok.addAudience(intClientId);
        adminTok.issuer(session.getContext().getAuthServerUrl().toASCIIString());
        adminTok.iat((long) Time.currentTime());

        KeyWrapper key = session.keys().getActiveKey(session.getContext().getRealm(), KeyUse.SIG, "RS256");
        AsymmetricSignatureSignerContext sign = new AsymmetricSignatureSignerContext(key);
        String signedTok = new JWSBuilder()
                .kid(sign.getKid())
                .type("JWT")
                .jsonContent(adminTok)
                .sign(sign);
        log.info("Generated new administration token for client with id " + intClientId);
        return signedTok;
    }

    /**
     * Checks if user has access to specific client, based on the linkage of the user and the clients in the
     * ClientUserLinkage table
     *
     * @param userId userId of user that requests access
     * @param clientId clientId of the client that the user wants to access
     * @return true if the client is linked to the user
     *         false if user has no permissions for this client or client does not exist
     */
    private boolean userHasAccess(String userId, String clientId) {
        ClientModel client = session.clientStorageManager().getClientByClientId(session.getContext().getRealm(), clientId);
        if(client == null) {
            return false;
        }
        List<String> result = getEntityManager().createNamedQuery("checkLinkage", String.class)
                .setParameter("userId", userId)
                .setParameter("idClient", client.getId())
                .getResultList();
        return (!result.isEmpty() && result.contains(client.getId()));
    }

    /**
     * Returns the clientRepresentation of the clients that are linked to the user.
     *
     * @param userId userID of the linked user
     * @return List of ClientRepresentation
     */
    // TODO: [ENHANCEMENT] delete the linkage of the user with the client if one id was not found
    private List<ClientRepresentation> getUserClients(String userId){
        List<String> ids = getEntityManager()
                .createNamedQuery("findUserClients", String.class)
                .setParameter("userId", userId)
                .getResultList();
        List<ClientRepresentation> clients = new LinkedList<>();
        for(String id : ids){
            ClientModel cli = session.clientStorageManager().getClientById(session.getContext().getRealm(), id);
            if(cli != null) {
                clients.add(ModelToRepresentation.toRepresentation(cli, session));
            } else {
                log.info("No client was found for id " + id + ". It might be deleted by an admin via the admin console");
            }
        }
        return clients;
    }

    /**
     * Creates a new entry in the CLIENT_USER_LINKAGE table that links user with clients which they should be allowed
     * to manage/change
     *
     * @param intClientId the internal id of the client, not the clientId, to which the user should get access
     * @param userId userId of the user that should get management permissions
     * @param adminTok the administration token that enables a user to get permissions to the client
     */
    private void addClientUserLink(String intClientId, String userId, String adminTok) {
        String newId = KeycloakModelUtils.generateId();
        ClientUserLink cul = new ClientUserLink(newId, intClientId, userId, adminTok);
        getEntityManager().persist(cul);
    }

    private EntityManager getEntityManager() {
        return session.getProvider(JpaConnectionProvider.class).getEntityManager();
    }

    private Response badRequest(String string){
        return Response.status(Response.Status.BAD_REQUEST).entity(string).build();
    }

    private Response forbidden(){
        return Response.status(Response.Status.FORBIDDEN).build();
    }


}
