"use strict";
const fs = require('fs');
const http = require('http');
const path = require('path');

var server;

function init() {
    if (server) {
        server.close();
    }
    server = http.createServer(handler);
    server.listen(process.env.PORT || 3000, console.log("Server is running on - http://localhost:3000"));
}

function handler(request, response) {
    var requrl = new URL(request.url, 'http://simpleracerresearchplatform.com');
    var reqpath = path.parse(path.normalize(requrl.pathname));

    if (request.method == 'GET') {
        console.log('get: ' + JSON.stringify(reqpath));
        if (reqpath.dir == '/'){
            if (reqpath.base == '' || 
                reqpath.base == 'driving-mouse.html' ||
                reqpath.base == 'index.html'){
                fs.createReadStream('driving-mouse.html').pipe(response);
            } else if (reqpath.base == "driving.js") {
                fs.createReadStream('driving.js').pipe(response);
            }
                
        } else if (reqpath.dir == '/models') {
            fs.createReadStream('models/' + reqpath.base).pipe(response);
        } else {
            response.statusCode = 404;
            response.end();
        }
    }
}

init();

// start this server with "node server.js" or "PORT=3000 node server.js"

