package rest;

import org.keycloak.models.KeycloakSession;
import org.keycloak.services.resource.RealmResourceProvider;

public class LinkageResourceProvider implements RealmResourceProvider {

    private final KeycloakSession session;

    public LinkageResourceProvider(KeycloakSession session) {
        this.session = session;
    }

    @Override
    public Object getResource() {
        return new LinkageResource(session);
    }

    @Override
    public void close() {

    }
}
