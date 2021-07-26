package rest;

import org.keycloak.Config;
import org.keycloak.models.KeycloakSession;
import org.keycloak.models.KeycloakSessionFactory;
import org.keycloak.services.resource.RealmResourceProvider;
import org.keycloak.services.resource.RealmResourceProviderFactory;

public class LinkageResourceProviderFactory implements RealmResourceProviderFactory {

    // http://localhost:8080/auth/realms/klaus/apis/extensions/userclients/clients
    // http://localhost:8080/auth/realms/klaus/userClientAdministration/
    public static final String ID = "userClientAdministration";

    @Override
    public RealmResourceProvider create(KeycloakSession keycloakSession) {
        return new LinkageResourceProvider(keycloakSession);
    }

    @Override
    public void init(Config.Scope scope) {

    }

    @Override
    public void postInit(KeycloakSessionFactory keycloakSessionFactory) {

    }

    @Override
    public void close() {

    }

    @Override
    public String getId() {
        return ID;
    }
}
