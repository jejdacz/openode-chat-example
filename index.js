require("dotenv").config();

const express = require("express");
const app = express();
const http = require("http").Server(app);
const io = require("socket.io")(http);
const port = process.env.PORT || 3000;
const cookieParser = require("cookie-parser");

// TODO
// store messages to file
// remove messages older than 1 hour

let messages = {};

app.use(express.urlencoded({ extended: true }));
app.use(cookieParser(process.env.COOKIE_SECRET));

app.use(express.static(__dirname + "/dist"));

// cookie auth middleware

app.use((req, res, next) => {
  const authToken = req.signedCookies["auth"];
  //req.user = authTokens[authToken];
  next();
});

app.get("/login", (req, res) => {
  res.sendFile(__dirname + "/dist/login.html");
});

app.post("/login", (req, res) => {
  const password = req.body.password;
  if (password === process.env.HANDLER_PASSWORD) {
    //set cookie
    res.cookie("auth", "secretToken", {
      maxAge: 3600000,
      httpOnly: true,
      signed: true
      //secure: true   https only
    });
    res.redirect("/handler"); //redirect to protected area
  }
});

//app.get("/", (req, res) => res.sendFile(__dirname + "/dist/index.html"));

// TODO
// login route
// handler route
// user route

app.use(function(err, req, res, next) {
  if (err.name === "UnauthorizedError") {
    res.status(401).sendFile(__dirname + "/dist/login.html");
  } else {
    res.sendStatus(500);
  }
});

// TODO
// message sender id
// message remove

io.on("connection", function(socket) {
  socket.emit("connection", JSON.stringify(messages));
  socket.on("message", function(msg) {
    const m = { text: msg, date: Date.now(), done: false };
    messages[m.date] = m;
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
