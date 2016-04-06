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
  "registry": "http://localhost:8082/nexus-bower/",
  "nexusRegistry": "http://localhost:8081/nexus/content/repositories/my-bower-repository/",
  "resolvers": [
    "bower-nexus-resolver"
  ]
}
```


## Installation
`npm install -g bower-nexus-resolver`

In order to use Bower with Nexus you need:

2. [bower](https://www.npmjs.com/package/bower) - Bower version 1.5.0 and above: `npm install -g bower`
1. [bower-nexus-resolver](https://www.npmjs.com/package/bower-nexus-resolver): `npm install -g bower-nexus-resolver` (if bower is installed globally)
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

You will need an interface between Nexus and this resolver. Since Nexus doesn't implement bower registry features, you need to mimic it.
To do so, create a node.js (or whatever else) server that respond a JSON like (example with angular):
```json
{
  "name":"angular",
  "url":"nexus://angular/angular"
}
```
to a request like `http://<YOUR_SERVER>/<SOME_REPO_NAME>/packages/<PACKAGE-NAME>`.

## Minic the bower registry response

This example depends on express to create the server.

```js
var express = require('express'),
    json = require('express-json'),
    http = require('http'),

    config = {
      port: 8082,
      context: 'nexus-bower',
      prefix: 'nexus://'
    },

    app = express(),
    server = http.createServer(app).listen( process.env.PORT || config.port);

app.use( json() );

// wait for a request as: 
// http://<hostname>/<context>/packages/<package-name> 
// respond a simple JSON 
app.get('/' + config.context + '/packages/:name', function(req, res){
    res.json({
        "name": req.params.name,
        "url": config.prefix + req.params.name + '/' +req.params.name
    });
});

console.log("STARTUP:: Express Bower registry simulator server listening on port::", server.address().port, ", environment:: ", app.settings.env);
```


Once, done, edit your ~/.bowerrc and point the registry to your brand new server
```json
{
  "registry": "`http://<YOUR_SERVER>/<SOME_REPO_NAME>/"
}
```

Then tell bower the real URL of your Nexus npm repository
```json
{
  "nexusRegistry": "http://<domain>/nexus/content/repositories/<npm-repo>"
}
```

## Nexus Configuring 

### NPM remote repository for bower components
1. Simply create a new npm repository
2. Run the node.js server that respond JSON

## Usage

Use the client to install packages from Nexus, e.g. `bower install bootstrap`