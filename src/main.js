import io from "./socket.io";

let messages = {};
let auth = "";

const scrollDown = () =>
  document
    .querySelector("#messages")
    .scrollTo(0, document.querySelector("#messages").scrollHeight);

const toggleDone = id => {
  messages[id].done ? socket.emit("undone", id) : socket.emit("done", id);
};

const removeMessage = id => {
  socket.emit("remove", id);
};

const createMessage = msg => {
  const date = new Date(msg.date);

  const $d = document.createElement("small");
  $d.innerText =
    date
      .getHours()
      .toString()
      .padStart(2, "0") +
    " : " +
    date
      .getMinutes()
      .toString()
      .padStart(2, "0");
  const $n = document.createElement("h5");
  $n.innerText = msg.name;
  const $t = document.createElement("p");
  $t.innerText = msg.text;
  const $m = document.createElement("li");
  $m.id = "id" + msg.date;
  const $e = document.createElement("button");
  $e.innerText = "x";
  $e.onclick = function(e) {
    e.stopPropagation();
    removeMessage(msg.date);
  };
  $m.append($d);
  $m.append($n);
  $m.append($t);

  if (auth === msg.author) $m.append($e);

  $m.onclick = function() {
    toggleDone(msg.date);
  };

  if (msg.done) {
    $m.classList.add("done");
  }

  return $m;
};

var socket = io();

document.querySelector("form").onsubmit = function() {
  socket.emit("message", document.querySelector("#m").value);
  document.querySelector("#m").value = "";
  return false;
};

socket.on("message", function(msg) {
  const message = JSON.parse(msg);

  // abort when same message
  if (messages[message.date]) return;

  document.querySelector("#messages").append(createMessage(message));
  messages[message.date] = message;

  scrollDown();
});

socket.on("done", function(id) {
  messages[id].done = true;
  document.querySelector("#id" + id).classList.add("done");
});

socket.on("undone", function(id) {
  messages[id].done = false;
  document.querySelector("#id" + id).classList.remove("done");
});

socket.on("remove", function(id) {
  delete messages[id];
  document.querySelector("#id" + id).remove();
});

socket.on("authenticated", function(msg) {
  auth = msg;
});

socket.on("init", function(msg) {
  const serverHistory = JSON.parse(msg);

  messages = serverHistory;

  document.querySelector("#messages").innerHTML = "";

  for (const m in messages) {
    document.querySelector("#messages").append(createMessage(messages[m]));
  }

  scrollDown();
});

socket.on("disconnect", function() {
  console.warn("disconnected");
});
