const io = require("./socket.io");
const { userMessageParser, handlerMessageParser } = require("./messageParsers");
const socket = io();

let user = {};
let messageParser;

const scrollDown = () => window.scrollTo(0, document.body.scrollHeight);

/* FORM SUBMIT */

document.querySelector(".io-form").onsubmit = function() {
  const data = [];
  const inp = document.querySelectorAll("input");
  inp.forEach(element => {
    data.push({ name: element.name, value: element.value });
    element.value = "";
  });
  socket.emit("message", data);
  return false;
};

document.querySelectorAll(".collapse-control").forEach(
  e =>
    (e.onclick = function() {
      document
        .querySelector("#" + e.getAttribute("control-target"))
        .classList.toggle("collapsed");
    })
);

const removeMessage = id => () => {
  socket.emit("remove", id);
};

const cancelMessage = id => () => {
  socket.emit("cancel", id);
};

const toggleDone = id => () => {
  socket.emit("toggleDone", id);
};

const addMessage = message =>
  message && document.querySelector("#messages").append(message);

/*** SOCKET EVENTS ***/

socket.on("message", function(msg) {
  const message = JSON.parse(msg);

  addMessage(messageParser(message));

  scrollDown();
});

socket.on("done", function(id) {
  document.querySelector("#id" + id).classList.add("done");
});

socket.on("undone", function(id) {
  document.querySelector("#id" + id).classList.remove("done");
});

socket.on("remove", function(id) {
  document.querySelector("#id" + id).remove();
});

socket.on("cancel", function(id) {
  document.querySelector("#id" + id).classList.add("canceled");
});

socket.on("authenticated", function(msg) {
  user.id = msg.id;
  user.userClass = msg.userClass;

  if (user.userClass === "user") {
    messageParser = userMessageParser({ cancelMessage, user });
  } else if (user.userClass === "handler") {
    messageParser = handlerMessageParser({ removeMessage, toggleDone });
  } else {
    throw Error("Authentication failed, invalid userClass.");
  }
});

socket.on("history", function(msg) {
  const serverHistory = JSON.parse(msg);

  document.querySelector("#messages").innerHTML = "";

  for (const m in serverHistory) {
    addMessage(messageParser(serverHistory[m]));
  }

  scrollDown();
});

socket.on("disconnect", function() {
  console.warn("disconnected");
});

/****  TEST  ****/

// const u = { id: "1234AB", name: "Papo", userClass: "user" };

// const mp = userMessageParser({ cancelMessage, user: u });

// const m = {
//   id: Date.now(),
//   date: Date.now(),
//   authorId: "1234AB",
//   authorName: "Pepa Nahlovsky",
//   done: false,
//   canceled: false,
//   payload: [
//     { name: "part-number", value: "324544658" },
//     { name: "count", value: "2" },
//     { name: "machine", value: "865545" },
//     { name: "place", value: "12" },
//     { name: "priority", value: "high" }
//   ]
// };

// addMessage(mp(m));
