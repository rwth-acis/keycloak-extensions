# Keycloak-extensions
This repository is a collection of changes and extensions that we have created for our Keycloak instance.

The repository contains the following directories:
- **[Client-User-Linkage](https://github.com/rwth-acis/keycloak-extensions/tree/main/client-user-linkage):** 
  - REST API extension for creation of clients with linkage of the client to the user that has created it.
  
- **[account-console](https://github.com/rwth-acis/keycloak-extensions/tree/main/account-console):**
  - Extension of the account console of Keycloak to create and manage UserClients of the user.
  
- **adapters:**
  - Directory containing necessary file from official Keycloak repostory for compiling the account-console
  
## How to deploy the extensions
Each extension is deployed in form of a single `.jar`file. The file has to be copied into the `/providers` 
directory of your Keycloak instance. If your Keycloak instance is running inside a Docker container, the directory is
located at `/org/jboss/keycloak/standalone/deployments`.

Instructions to build each extension are in the respective directories. For some guidance on how to use the extensions, 
please have a look at the [wiki pages](https://github.com/rwth-acis/keycloak-extensions/wiki) of this repository.
