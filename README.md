# bower-nexus-resolver

# Problematic

For now, Nexus does not integrate Bower. Bower 1.5 offers pluggable resolvers which could make it possible.

The future Nexus behavior should mimic the default bower registry behavior.

For nexus to properly integrate Bower, it needs to respond some JSON info to this URL:
```json
http://<domain>/nexus/content/repositories/<bower-repo>/packages/<package-name>
```
This JSON should be formed as (url below is a suggestion)
```json
{
  "name" : "angular",
  "url" : "nexus://angular/angular"
}
```

Thus bower, thanks to the resolver, can recognise it's talking to a Nexus registry.

Today, Nexus doesn't implement this functionality, so we need to fake it with a fake server.
Any server responding some JSON is fine. I recommend express.

You will also need to add in the `.bowerrc` a new entry `nexusRegistry` which is the URL of your Nexus registry.
The default `registry` key is taken by your fake express server.

A typical `.bowerrc` would be
```json
{
  "directory": "bower_components",
  "registry": "http://localhost:3000/nexus-bower/",
  "nexusRegistry": "http://localhost:8081/nexus/content/repositories/my-bower-repository/",
  "resolvers": [
    "bower-nexus-resolver"
  ]
}
```


## Installation
`npm install -g bower-nexus-resolver`

In order to use Bower with Nexus you need:

1. [bower-nexus-resolver](https://www.npmjs.com/package/bower-art-resolver): `npm install -g bower-nexus-resolver`
2. [bower](https://www.npmjs.com/package/bower) - Bower version 1.5.0 and above: `npm install -g bower-nexus-resolver`
3. [express](https://www.npmjs.com/package/express) - To mimic default repo responses

## Client Configuration
Edit your ~/.bowerrc and add Nexus Bower Resolver
```json
{
  "resolvers": [
    "bower-nexus-resolver"
  ]
}
```
Edit your ~/.bowerrc and point the registry to Nexus (use a npm respository):
```json
{
  "registry": "http://<domain>/nexus/content/repositories/<npm-repo>"
}
```

## Nexus Configuring 

### NPM remote repository for bower components
1. Simply create a new npm repository
2. Run the node.js server that respond JSON

## Usage

Use the client to install packages from Nexus, e.g. `bower install bootstrap`