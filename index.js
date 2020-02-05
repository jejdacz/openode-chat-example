var express = require("express");
var app = express();
var http = require("http").Server(app);
var io = require("socket.io")(http);
var port = process.env.PORT || 3000;
var messages = {};

app.use(express.static("dist"));

app.get("/", function(req, res) {
  res.sendFile(__dirname + "/dist/index.html");
});

io.on("connection", function(socket) {
  socket.emit("connection", JSON.stringify(messages));
  socket.on("message", function(msg) {
    const m = { text: msg, date: Date.now(), done: false };
    messages = { ...messages, [m.date]: m };
    io.emit("message", JSON.stringify(m));
  });
  socket.on("done", function(msg) {
    messages[msg].done = true;
    io.emit("done", msg);
  });
  socket.on("undone", function(msg) {
    messages[msg].done = false;
    io.emit("undone", msg);
  });
});

http.listen(port, function() {
  console.log("listening on *:" + port);
});
