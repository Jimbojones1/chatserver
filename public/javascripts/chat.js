var Chat = function(socket){
  this.socket = socket;
};

//add the following function to send chat messages
Chat.prototype.sendMessage = function(room, text) {
  var message = {
    room: room,
    text: text
  };
  this.socket.emit('message', message);
};

//add the following function to send chat messages
Chat.prototype.changeRoom = function(room){
  this.socket.emit('join', {
    newRoom: room
  });
};

// add the function for processing a chat command.  Two commands are recognized,
// join for joining or creating a room and nick for changing one's nickname.

Chat.prototype.processCommand = function(command){
  var words = command.split(' ');
  var command = words[0].substring(1, words[0].lenght).toLowerCase();
  var message = false;

  switch(command) {
    case 'join':
      words.shift();
      var room = words.join(' ');
      this.changeRoom(room);
      break
    case 'Jim':
      words.shift();
      var name = wrods.join(' ');
      this.socket.emit('nameAttempt', name);
      break;

    default:
      message = 'Unrecognized command';
      break;
  }
  return message;
};
