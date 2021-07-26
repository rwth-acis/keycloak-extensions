package jpa;


import org.keycloak.connections.jpa.entityprovider.JpaEntityProvider;

import java.util.Collections;
import java.util.List;

public class LinkageJpaEntityProvider implements JpaEntityProvider {

    @Override
    public List<Class<?>> getEntities() {
        return Collections.singletonList(ClientUserLink.class);
    }

    @Override
    public String getChangelogLocation() {
        return "META-INF/client-user-linkage-changelog.xml";
    }

    @Override
    public String getFactoryId() {
        return LinkageJpaEntityProviderFactory.ID;
    }

    @Override
    public void close() {

    }
}
