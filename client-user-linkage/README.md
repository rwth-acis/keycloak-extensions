# Client-User-Linkage
This directory contains an extension of the REST API of Keycloak. It enables
authenticated users to create clients that are linked to the ID of the user. 
Only linked users and admins via the admin console can manage these clients. 
In addition to the client, an administration token is created during the client 
creation which can be given to other users to link their account to the client and
get access to it.
The linkage together with the administration token is stored in the database of
Keycloak. For this, this extension creates a custom JPA entity to the database.

## Basic Concept
The extension contains an additional table in the database, called `CLIENT_USER_LINKAGE` with the fields:
- **ID**: A random unique id of the entry as primary key
- **ID_CLIENT**: The internal id of the client (not the client id!) that is linked to the specific user
- **USER_ID**: The unique id of the user entity that is linked to the client
- **ADMIN_TOKEN**: An access token, that authorizes a user to link his account to the client

Whenever a user creates a new client, a new admin token is created and stored together with the internal
id of the client, the user id and a new unique id in the `CLIENT_USER_LINKAGE` table. The client itself
is stored in the database as usual. If a user tries to manage one of the clients, it gets checked if he 
is linked in the table with the requested client. Only then he is able to request client information, 
change settings or delete the client.

The `admin tokens` are JSON web tokens, with the internal client id as audience value. They can be
used to grant other users access to a client that they do not have created. If they are used, 
a new entry in the `CLIENT_USER_LINKAGE` table is created linking the user that has used the 
token to the internal client id that is stored as audience in it. 

## Build and Deploy
The extension is deployed as a single `.jar`file. It can be build by running 
`mvn clean install` within this directory. Currently, this extension is compiled
to Java version 8. It is specified for the maven plugin in the `pom.xml` file and can
be set to higher Java versions, if your Keycloak instance can handle them. If you want
to change them, simply change the `source`and `target` values in the following part 
of the pom file.
```xml
<plugin>
    <groupId>org.apache.maven.plugins</groupId>
    <artifactId>maven-compiler-plugin</artifactId>
    <version>${maven-compiler-plugin.version}</version>
    <configuration>
        <source>1.8</source>
        <target>1.8</target>
    </configuration>
</plugin>
```

To deploy the extension, the jar file has to be copied into the `/standalone/deployments` 
directory of your running Keycloak instance. After a successful deployment, restart
your Keycloak instance. This is necessary to add the JPA entity to the database.
Additionally, a restart can indicate possible problems of the deployment.

## Usage
For an overview and a description on how to use the added REST endpoints, please have
a look at the [Wiki pages](https://github.com/rwth-acis/keycloak-extensions/wiki) of this repository.

## Development
Some notes for you if you want to add or change something of this extension:

The `src/main/resources/META-INF` directory contains files that tell Keycloak the
structure, dependencies and names of modules and JPA entities. If you want to extend
the database entity with additional rows or new tables, they have to be specified in
the `client-user-linkage-changelog.xml` file. If you want to add dependencies, they 
have to be specified in the `jboss-deployment-structure.xml` file. 

The additional table in the database contains some named queries which might be useful:
| **Name** | **Description** | **Parameter** | **Returns** |
| --- | --- | --- | --- |
| **findUserClients** | returns all internal ids of the clients that are linked to a user id | userId | idClient |
| **checkLinkage** | checks if a given user id is linked to a given id of a client | userId, idClient | idClient |
| **deleteClientAndLinkage** | deletes all entries in the table with the given id of the client | idClient | - |
| **removeLinkage** | removes the linkage of the given user id with the given id of the client | userId, idClient | - |
| **getAdminTok** | returns the admin token of a linkage in the table | userId, idClient | adminTok |

One last thing: In general, we suggest developing the extension with a dockerized Keycloak instance. 
The reason for this is that in some cases when you miss something or one of the 
above mentioned files is not correct, Keycloak will shut down with a couple of 
errors and will not be able to start again. In these cases, it is quite nice to 
quickly set up a new instance by just creating a new Keycloak container. 
