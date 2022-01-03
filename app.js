const http = require("http");
const fs = require("fs");
var renxdata;
var path = require('path');//helps with file paths

//a helper function to handle HTTP requests
function requestHandler(req, res) {
    var
    content = '',
    fileName = path.basename(req.url),//the file that was requested
    localFolder = __dirname + '/public/';//where our public files are located

    //NOTE: __dirname returns the root folder that
    //this javascript file is in.

  if (fileName == '') fileName = 'index.html'

    if(fileName){//if index.html was requested...
        content = localFolder + fileName;//setup the file name to be returned

        //reads the file referenced by 'content'
        //and then calls the anonymous function we pass in
        fs.readFile(content,function(err,contents){
            //if the fileRead was successful...
            if(!err){
                //send the contents of index.html
                //and then close the request
                res.end(contents);
            } else {
                //otherwise, let us inspect the eror
                //in the console
                console.dir(err);
            };
        });
    } else {
        //if the file was not found, set a 404 header...
        res.writeHead(404, {'Content-Type': 'text/html'});
        //send a custom 'file not found' message
        //and then close the request
        res.end('<h1>Sorry, the page you are looking for cannot be found.</h1>');
    };
};

//step 2) create the server
var server = http.createServer(requestHandler)

function fetchData() {
  const https = require("http");
  const options = {
    hostname: "brotherhoodofnod.net",
    port: 8080,
    path: "/api/server/?Game%20Version=latest",
    method: "GET"
  };

  var data = "";

  const req = https.request(options, res => {
    console.log(`statusCode: ${res.statusCode}`);

    res.on("data", d => {
      data += d;
    });

    res.on("end", () => {
      data = JSON.parse(data);

      fs.writeFileSync("./data.json", JSON.stringify(data, null, 2));
    });
  });

  req.on("error", error => {
    console.error(error);
  });

  req.end();
}

fetchData();
setInterval(fetchData, 15000);
setInterval(broadcastToSocket, 5000);

// Loading socket.io
const io = require("socket.io")(server);
// When a client connects, we note it in the console
io.sockets.on("connection", function (socket) {
  console.log("Incoming: " + socket.handshake.address);
  socket.emit("message", "You are connected!");
  renxdata = JSON.parse(fs.readFileSync("data.json", "utf8"));
  io.local.emit("renxData", renxdata);
});

function broadcastToSocket() {
  renxdata = JSON.parse(fs.readFileSync("data.json", "utf8"));
  io.local.emit("renxData", renxdata);
}

server.listen(80);
