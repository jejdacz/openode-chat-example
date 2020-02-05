import "./styles.scss";
import io from "./socket.io";

let messages = {};

const scrollDown = () => document.querySelector("#messages").scrollTo(0, document.querySelector("#messages").scrollHeight);

const toggleDone = (id) => {
  messages[id].done  ? socket.emit("undone", id) : socket.emit("done", id);  
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
  const $t = document.createElement("p");
  $t.innerText = msg.text;
  const $m = document.createElement("li");
  $m.id = "id"+msg.date;
  $m.append($d);
  $m.append($t);   
  
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
  document.querySelector("#messages").append(createMessage(message));
  messages[message.date] = message;

  scrollDown();
});

socket.on("done", function(id) {
  messages[id].done = true;
  document.querySelector("#id"+id).classList.add("done");
});

socket.on("undone", function(id) {
  messages[id].done = false;
  document.querySelector("#id"+id).classList.remove("done");
});

socket.on("connection", function(msg) {
  const serverHistory = JSON.parse(msg);
  
  messages = {...serverHistory};
  
  for (const m in messages) {
    document.querySelector("#messages").append(createMessage(messages[m]));
  }
  
  scrollDown();
});

