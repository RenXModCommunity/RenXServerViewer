const http = require("http");
const fs = require("fs");
var renxdata;

// Loading the index file . html displayed to the client
var server = http.createServer(function(req, res) {
  fs.readFile("./index.html", "utf-8", function(error, content) {
    res.writeHead(200, {"Content-Type": "text/html"});
    res.end(content);
  });
});

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

var nstatic = require("node-static");

var file = new(nstatic.Server)(__dirname);

http.createServer(function (req, res) {
  file.serve(req, res);
}).listen(8081);

server.listen(8080);
