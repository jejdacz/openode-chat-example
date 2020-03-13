const initSocket = (socket, user, messages) => {
  socket.emit("authenticated", user);
  socket.emit("init", JSON.stringify(messages.getAll()));
};

const handlerSocket = (io, socket, user, messages) => {
  initSocket(socket, user, messages);

  socket.on("message", function(msg) {
    const message = messages.add({
      date: Date.now(),
      authorId: user.id,
      authorName: user.name,
      payload: msg
    });
    io.emit("message", JSON.stringify(message));
  });
  socket.on("done", function(id) {
    messages.done(id) && io.emit("done", id);
  });
  socket.on("undone", function(id) {
    messages.undone(id) && io.emit("undone", id);
  });
  socket.on("toggleDone", function(id) {
    messages.toggleDone(id) &&
      (messages.get(id).done ? io.emit("done", id) : io.emit("undone", id));
  });
  socket.on("remove", function(id) {
    messages.remove(id) && io.emit("remove", id);
  });
};

const userSocket = (io, socket, user, messages) => {
  initSocket(socket, user, messages);

  socket.on("message", function(msg) {
    const message = messages.add({
      date: Date.now(),
      authorId: user.id,
      authorName: user.name,
      payload: msg,
      done: false,
      canceled: false
    });
    io.emit("message", JSON.stringify(message));
  });
  socket.on("cancel", function(id) {
    isAuthor(user.id, id) && messages.cancel(id) && io.emit("cancel", id);
  });
};

module.exports = { userSocket, handlerSocket };
