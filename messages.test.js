const messages = require("./messages");

const user = { id: "1234ghg", name: "John", userClass: "user" };
const opts = { user, done: false, canceled: false };
const message = {
  date: Date.now(),
  authorId: user.id,
  authorName: user.name,
  payload: {
    ["part-number"]: "324544658",
    count: "2",
    machine: "865545",
    place: "12",
    priority: "high"
  },
  done: false,
  canceled: false
};

const msg = messages.add(message);
messages.add(message);
const id = msg.id;

console.log("messages.getAll()", messages.getAll());

console.log("messages.get(id)", messages.get(id));
console.log("messages.get()", messages.get());

console.log("messages.done(id)", messages.done(id));
console.log("messages.done", messages.getAll());
console.log("messages.done()", messages.done());

console.log("messages.undone(id)", messages.undone(id));
console.log("messages.undone - getAll", messages.getAll());

console.log("messages.cancel(id)", messages.cancel(id));
console.log("messages.cancel - getAll", messages.getAll());
console.log("messages.cancel()", messages.cancel());

console.log("messages.togglDone(id)", messages.toggleDone(id));
console.log("messages.toggleDone - getAll", messages.getAll());
console.log("messages.toggleDone()", messages.toggleDone());

console.log("messages.isAuthor(author,id)", messages.isAuthor(user.id, id));
console.log("messages.isAuthor(author-wrong,id)", messages.isAuthor("", id));

console.log("messages.remove(id)", messages.remove(id));
console.log("messages.remove(id) - again", messages.remove(id));
