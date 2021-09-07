# Keycloak-extensions
This repository contains all changes and extensions that we use at our Keycloak instance.

This repository contains:
- **User-Client-Linkage:** 
  REST API extension for creation of clients with linkage of the client to the user 
  that has created it.
  
- **account-console:**
  Extension of the account console of Keycloak to create and manage UserClients of the
  user.
  
- **adapters:**
  Directory containing necessary file from official Keycloak repostory for compiling the account-console
  
## Usage
Each extension is deployed in form of a single `.jar`file. For this, you can simply copy the
file into the `/standalone/deployments` directory of your Keycloak instance. If your
Keycloak instance is running inside a Docker container, the path of the direcotry
is `/org/jboss/keycloak/standalone/deployments`.

You can find instructions to build each extension in the respective directories. For
some guidance on how to use the extensions, please have a look at the [wiki pages](path-to-wiki)
of this repository.



More information will follow soon...