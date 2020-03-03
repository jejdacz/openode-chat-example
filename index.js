require("dotenv").config();

const express = require("express");
const app = express();
const http = require("http").Server(app);
const io = require("socket.io")(http);
const port = process.env.PORT || 3000;
const cookieParser = require("cookie-parser");
const crypto = require("crypto");
const cookie = require("cookie");

// TODO
// store messages to file
// remove messages older than 1 hour

let messages = {};

const getHash = s =>
  crypto
    .createHash("sha256")
    .update(s)
    .digest("base64");

console.log(process.env.USER_PASSWORD);
console.log(process.env.HANDLER_PASSWORD);

const userHash = getHash(process.env.USER_PASSWORD);
const handlerHash = getHash(process.env.HANDLER_PASSWORD);

console.log(userHash, handlerHash);

app.use(express.urlencoded({ extended: true }));
app.use(cookieParser(process.env.COOKIE_SECRET));

app.use(express.static(__dirname + "/dist"));

// cookie auth middleware
app.use((req, res, next) => {
  const authToken = req.signedCookies["auth"];
  console.log(authToken);
  if (authToken === handlerHash) {
    req.handler = true;
    console.log("handler verified");
  } else if (authToken === userHash) {
    req.user = true;
    console.log("user verified");
  }
  next();
});

app.get("/", (req, res) => {
  if (req.handler) {
    res.redirect("/handler");
  } else if (req.user) {
    res.redirect("/user");
  } else {
    res.redirect("/login");
  }
});

app.get("/login", (req, res) => {
  res.sendFile(__dirname + "/dist/login.html");
});

app.get("/handler", (req, res) => {
  if (req.handler) {
    res.sendFile(__dirname + "/dist/handler.html");
  } else {
    res.redirect("/login");
  }
});

app.get("/user", (req, res) => {
  if (req.user) {
    res.sendFile(__dirname + "/dist/user.html");
  } else {
    res.redirect("/login");
  }
});

app.post("/login", (req, res) => {
  const password = req.body.password;
  if (password === process.env.HANDLER_PASSWORD) {
    console.log("handler logged");
    //set cookie
    res.cookie("auth", handlerHash, {
      //maxAge: 3600000,
      httpOnly: true,
      signed: true
      //secure: true   https only
    });
    res.redirect("/handler"); //redirect to protected area
  } else if (password === process.env.USER_PASSWORD) {
    console.log("user logged");
    //set cookie
    res.cookie("auth", userHash, {
      //maxAge: 3600000,
      httpOnly: true,
      signed: true
      //secure: true   https only
    });
    res.redirect("/user"); //redirect to protected area
  } else {
    res.redirect("/login");
  }
});

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
// create rooms handlers users

io.on("connection", function(socket) {
  const cookies = cookie.parse(socket.handshake.headers.cookie);
  console.log(cookies);
  const result = cookieParser.signedCookie(
    cookies.auth,
    process.env.COOKIE_SECRET
  );
  console.log(result);
  console.log(result === handlerHash);

  if (result !== handlerHash) socket.disconnect(true);

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
