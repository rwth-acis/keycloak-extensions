package jpa;

import javax.persistence.*;

/**
 * Representation of the CLIENT_USER_LINKAGE table in the Keycloak database
 *
 * -> Query findUserClients returns all client IDs which belong to the user with given userId
 */

@Entity
@Table(name = "CLIENT_USER_LINKAGE")
@NamedQueries({ @NamedQuery(name = "findUserClients", query = "select link.idClient from ClientUserLink link where link.userId = :userId"),
        @NamedQuery(name = "checkLinkage", query = "select link.idClient from ClientUserLink link where link.userId = :userId and link.idClient = :idClient"),
        @NamedQuery(name = "deleteClientAndLinkage", query = "delete from ClientUserLink link where link.idClient = :idClient"),
        @NamedQuery(name = "removeLinkage", query = "delete from ClientUserLink link where link.userId = :userId and link.idClient = :idClient")
})
public class ClientUserLink {

    public ClientUserLink(String id, String idClient, String userId, String adminToken){
        this.id = id;
        this.idClient = idClient;
        this.userId = userId;
        this.adminToken = adminToken;
    }

    @Id
    @Column(name = "ID")
    private String id;

    @Column(name = "ID_CLIENT", nullable = false)
    private String idClient;

    @Column(name = "USER_ID", nullable = false)
    private String userId;

    @Column(name = "ADMIN_TOKEN", nullable = true)
    private String adminToken;

    public String getId() {
        return id;
    }

    public String getIdClient() {
        return idClient;
    }

    public String getUserId() {
        return userId;
    }

    public String getAdminToken() {
        return adminToken;
    }

    public void setId(String id) {
        this.id = id;
    }

    public void setIdClient(String idClient) {
        this.idClient = idClient;
    }

    public void setUserId(String userId) {
        this.userId = userId;
    }

    public void setAdminToken(String adminToken) {
        this.adminToken = adminToken;
    }
}