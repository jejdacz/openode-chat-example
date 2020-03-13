require("dotenv").config();

const express = require("express");
const app = express();
const http = require("http").createServer(app);
const io = require("socket.io")(http);
const { userSocket, handlerSocket } = require("./socketHandlers");
const port = process.env.PORT || 3000;
const cookieParser = require("cookie-parser");
const crypto = require("crypto");
const cookie = require("cookie");
const messages = require("./messages");

const users = {};

const generateAuthToken = () => {
  return crypto.randomBytes(30).toString("hex");
};

const verifyToken = id => (users.hasOwnProperty(id) ? users[id] : undefined);

app.use(express.urlencoded({ extended: true }));
app.use(cookieParser(process.env.COOKIE_SECRET));

app.use(express.static(__dirname + "/dist"));

// auth cookie middleware
app.use((req, res, next) => {
  const authToken = req.signedCookies["auth"];

  if (authToken) {
    const user = verifyToken(authToken);

    if (user) {
      req.user = user;
    }
  }
  next();
});

const redirectUnauthorized = (req, res, next) => {
  if (!req.user) {
    res.redirect("/login");
  } else {
    next();
  }
};

app.get("/", redirectUnauthorized, (req, res) => {
  if (req.user.userClass === "handler") {
    res.redirect("/handler");
  } else if (req.user.userClass === "user") {
    res.redirect("/user");
  }
});

app.get("/login", (req, res) => {
  res.sendFile(__dirname + "/dist/login.html");
});

app.get("/handler", redirectUnauthorized, (req, res) => {
  if (req.user.userClass === "handler") {
    res.sendFile(__dirname + "/dist/handler.html");
  }
});

app.get("/user", redirectUnauthorized, (req, res) => {
  if (req.user.userClass === "user") {
    res.sendFile(__dirname + "/dist/user.html");
  }
});

app.post("/login", (req, res) => {
  const password = req.body.password;
  const name = req.body.name || "noname";

  const saveUser = userClass => {
    const token = generateAuthToken();
    users[token] = { id: token, name, userClass };
    // set cookie
    res.cookie("auth", token, {
      maxAge: 3600000,
      httpOnly: true,
      signed: true
      //secure: true   https only
    });
  };

  if (password === process.env.HANDLER_PASSWORD) {
    saveUser("handler");
    res.redirect("/handler"); // redirect to protected area
  } else if (password === process.env.USER_PASSWORD) {
    saveUser("user");
    res.redirect("/user"); //redirect to protected area
  } else {
    res.redirect("/login");
  }
});

app.get("/logout", redirectUnauthorized, (req, res) => {
  delete users[req.user.id];
  res.clearCookie("auth");
  res.clearCookie("io");
  res.redirect("/login");
});

app.use(function(err, req, res, next) {
  if (err.name === "UnauthorizedError") {
    res.status(401).sendFile(__dirname + "/dist/login.html");
  } else {
    res.sendStatus(500);
  }
});

io.on("connection", function(socket) {
  // parse auth cookie
  const cookies = cookie.parse(socket.handshake.headers.cookie);
  const authCookie = cookieParser.signedCookie(
    cookies.auth,
    process.env.COOKIE_SECRET
  );

  // test cookie
  if (!authCookie) {
    socket.disconnect(true);
    return;
  }

  // authenticate user
  const user = verifyToken(authCookie);
  if (!user) {
    socket.disconnect(true);
    return;
  }

  // is handler
  if (user.userClass === "handler") {
    handlerSocket(io, socket, user, messages);
  }
  // is user
  else if (user.userClass === "user") {
    userSocket(io, socket, user, messages);
  }
  // unauthorized
  else {
    socket.disconnect(true);
  }
});

http.listen(port, function() {
  console.log("listening on *:" + port);
});
