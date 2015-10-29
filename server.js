var http = require('http');  //module provides HTTP server and client functionality
var fs = require('fs'); //filepath system path
var path = require('path');
var mime = require('mime');//module provides ability to derive MIME type based on filename extension
var cache = {};  // cach object is where the contents of cached files are stored


//Helper functions
function send404(response){
  response.writeHead(404, {'content-type': 'text/plain'});
  response.write('Error 404: Not found little guy');
  response.end();
}

// Helper function helps serves files data
function sendFile(response, filePath, fileContents) {
  response.writeHead(200, {"content-type": mime.lookup(path.basename(filePath))});
  response.end(fileContents);
}

//Accessing memory storage (RAM ) is faster than accessing the filesystem.  Node application cache frequently used data in memory.
function serveStatic(response, cache, absPath) {
  if(cache[absPath]){//check if file is cached in memory
    sendFile(response, absPath, cache[absPath]);//Serve file from memory
  }else {
    fs.exists(absPath, function(exists){//check if file exists
      if(exists){
        fs.readFile(absPath, function(err, data){//read file from disk
          if(err) {
            send404(response);
          }else {
            cache[absPath] = data;
            sendFile(response, absPath, data);//serve file read from disk
          }
        });
      }else {
        send404(response); //send http 404 response
      }
    });
  }
}

//for the HTTP server, an anonymous function is provided as an argument to createServer, acting as a callback the defines how each HTTP request should be handled. THe call back accepts two arguments(request, response).

var server = http.createServer(function(request, response){
  var filePath = false;
  if(request.url == '/'){
    filePath = 'public/index.html';  //Determine html file to be served by default
  }else {
    filePath = 'public' + request.url; //translate URL path to relative file Path
  }
  var absPath = './' + filePath;
  serveStatic(response, cache, absPath);//serve static file
});

server.listen(3000, function(){
  console.log("server is listening buddy on port 3000");
});


// Setting up the Socket.IO server
var chatServer = require('./lib/chat_server');//load functionality from a custon node module that supplies logic to handle socke.io based server side chat functionality
chatserver.listen(server)//starts the socket.io functionality, providing it with an already defined HTTP server so it can share the same TCP/IP port
