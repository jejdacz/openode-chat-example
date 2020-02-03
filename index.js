var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var port = process.env.PORT || 3000;
var messages = [];

app.get('/', function(req, res){
  res.sendFile(__dirname + '/index.html');
});

io.on('connection', function(socket){
  socket.emit('history', JSON.stringify(messages));
  socket.on('chat message', function(msg){    
    const m = {text:msg,date:Date.now()}; 
    messages.push(m);   
    io.emit('chat message', JSON.stringify(m));  
  });
});

http.listen(port, function(){
  console.log('listening on *:' + port);
});
