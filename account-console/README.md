# Account-Console
This directory contains the source files of the account console of Keycloak with an extension to enable to use the 
[client-user-linkage](https://github.com/rwth-acis/keycloak-extensions/tree/main/client-user-linkage) REST API extension
from within the account console. The extension contains additional sections for listing and managing clients, list them 
and link new ones to their account by using administration tokens. Currently, users are not able to manage all settings
from there, e.g. a section for changing the scopes of the client is missing at the moment. However, we are willing to 
add it in the near future.

## Build and Deploy
The account console is written in TypeScript using React. The code is located at
`src/main/resources/theme/learning-layers-account/account/src`. To build the account console, you first have to compile
it to JavaScript by going into the directory and execute
```bash
npm install 
npm run build
```
Afterwards, the files can be packed into a jar file, which then can be deployed at Keycloak. For this run
````bash
mvn clean install
````
The jar file will be located in the `/target` directory. To deploy it, copy the file into the
`/standalone/deployments` directory of your Keycloak instance. After a successful deployment, the additional pages should
be visible in the account console. Note, that if you want to use it, you have to deploy the 
[client-user-linkage](https://github.com/rwth-acis/keycloak-extensions/tree/main/client-user-linkage) REST API extension
too.

## Usage
For an overview of the functions and how to use the extended pages, please have a look at the 
[Wiki pages](https://github.com/rwth-acis/keycloak-extensions/wiki) of this repository.

## Development
Some notes about the structure of this project and if you want to add something to the extension:

In the file `src/main/resources/META-INF/keycloak-themes.json` is a description to Keycloak what kind of theme this is.
The `name` value specifies the name of the theme, which will be visible in the theme seleciton at the admin console. 
The `types` value defines what kind of theme it is. In this case, it is a theme for the account console, so it can not be
selected as a login theme.

In the following, we will have a closer look into `src/main/resources/theme/learning-layers-account/account`.  
The directory `/messages` can be used to store property files that contain messages or text in different languages.
Depending on the language, the file has to be named differently. In our case `messages_en.properties` defines the
messages in english, while the file for german text would have to be named `messages_de.properties`. The messages and
text segments are stored as key-value pair: 
````properties
myMessage=This is some beautiful message!
````
You can use them in your typescript code by calling `Msg.localize(myMessage);` or you use them in the HTML part by using
the element
````html
<Msg msgKey="myMessage"/>
````

The directory `src/app` contains the whole code of the account console. For sake of completeness, it should be said that
we have done some small changes to the files `ContentPages.tsx` and `PageNav.tsx`. All other changes are located in the 
directory `/content/learning-layers-account`.

Last important file is the `/resources/content.json` file. This file describes the whole structure and components of the
account console. Additionally, the react router is created based on the modules defined in there. So if you plan to add
a page to the account console, it has to be specified there.
---
If you have already deployed the extension and want to redeploy it with some changes, it might be that the changes will
not be visible directly. This is because Keycloak caches the themes which is defined in the `standalone(-ha).xml`
file in the `/standalone/configuration` directory. Somewhere in the lower half of the file, there should be the part
````xml
<theme>
    <staticMaxAge>2592000</staticMaxAge>
    <cacheThemes>true</cacheThemes>
    <cacheTemplates>true</cacheTemplates>
    <dir>${jboss.home.dir}/themes</dir>
</theme>
````
To turn of caching, simply replace it with
````xml
<theme>
    <staticMaxAge>-1</staticMaxAge>
    <cacheThemes>false</cacheThemes>
    <cacheTemplates>false</cacheTemplates>
    <dir>${jboss.home.dir}/themes</dir>
</theme>
````
Also remember that your browser might also use caching.