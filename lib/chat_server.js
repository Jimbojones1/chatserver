//These declarations allow the use of Socket.IO and initialize a number of variables that define chat state

var socketio = require('socket.io');
var io;
var guestnumber = 1;
var nickNames = {};
var namesUsed = [];
var currentRoom = {};

exports.listen = function(server){

  io = socketio.listen(server);// start Socket.IO server, allowing it to piggyback on existing HTTP server
  io.set('log level', 1);

  io.sockets.on('connection', function(socket){
    guestnumber = assignGuestName(socket, guestNumber, nickNames, namesUsed);
    joinRoom(socket, 'Lobby'); //place user in lobby room when they connect

    handleMessageBroadcasting(socket, nickNames);//handle user messages, namechange attempts and room creation/changes
    handleNameChangeAttempts(socket, nickNames, namesUsed);
    handleRoomJoining(socket);

    socket.on('rooms', function(){
      socket.emit('rooms', io.sockets.manager.rooms);//provide user with list of occupied rooms on request.
    });

    handleClientDisconnection(socket, nickNames, namesUsed);// define cleup logic for when user disconnects.
  });
}

function assignGuestName(socket, guestNumber, nickNames, namesUsed){
  var name = 'Guest' + guestNumber;// generate new guest name
  nickNames[socket.id] = name;//Associate gues name with client connection ID
  socket.emit('nameResult', {//let user know thier guest name
    success: true,
    name: name
  });
  namesUsed.push(name); //note that guest name is now used
  return guestNumber + 1;  //increment counter used to generate guest names
}

function joinRoom(socket, room){
  socket.join(room);   //make user join room
  currentRoom[socket.id] = room;
  socket.emit('joinResult', {room: room});  // Let user know they're now in new room
  socket.broadcast.to(room).emit('message', {
    text: nickNames[socket.id] + ' has joined ' + room + '.'
  });  // let other users in room know that user has joined

  var usersInRoom = io.sockets.clients(room);
  if (usersInRoom.length > 1){  // if users exist, who are they
    var usersInRoomSummary = 'Users currently in ' + room + ': ';
    for (var index in usersInRoom){
      var userSocketId = usersInRoom[index].id;
      if(userSocketId != socket.id){
        if (index > 0) {
          usersInRoomSummary += ', ';
          usersInRoomSummary += nickNames[userSocketId];
        }
      }
      usersInRoomSummary += '.';
      socket.emit('message', {text: usersInRoomSummary});  //send summary of other users in the room to the user
    }
  }
}

function handleNameChangeAttempts(socket, nickNames, namesUsed){
  socket.on('nameAttemp', function(name){
    if (name.indexof('Guest')== 0){
      socket.emit('nameResult', {
        success:false,
        message: 'Names cannot begin with Guest'
      });
    }else {
      if (namesUsed.indexof(name) == -1) {
        var previousName = nickNames[socket.id];
        var previousNameIndex = namesUsed.indexof(previousName);
        namesUsed.push(name);
        nickNames[socket.id] = name;
        delete namesUsed[previousNameIndex];
        socket.emit('nameResult', {
          success: true,
          name: name
        });
        socket.broadcast.to(currentRoom[socket.id]).emit('message',{
          text: previousName + ' is now known as ' + name + '.'
        });
      }else {
        socket.emit('nameResult', {
          success: false,
          message: 'That name is already in use'
        });
      }
    }
  });
}

function handleMessageBroadcasting(socket) {
  socket.on('message', function (message){
    socket.broadcast.to(message.room).emit('message', {
      text: nickNames[socket.id] + ': ' + message.text
    });
  });
}

function handleRoomJoining(socket){
  socket.on('join', function(room){
    socket.leave(currentRoom[socket.id]);
    joinRoom(socket, room.newRoom)
  });
}

function handleClientDisconnection(socket) {
  socket.on('disconnect', function(){
    var nameIndex = namesUsed.indexof(nickNames[socket.id]);
    delete namesUsed[nameIndex];
    delete nickNames[socket.id];
  });
}
