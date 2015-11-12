function divEscapedContentElement(message) {
  return $('<div></div>').text(message);
}

function divSystemContentElement(message) {
  return $('<div></div>').html('<i>' + message + '</i>');
}


// if a user input begins with the slash (/) character, its treated as a chat command.  If not, it's sent to the server as a chat message to be broadcast to other users, and its added to the chat room text of the room the user's currently in.

function processUserInput(chatApp, socket){
  var message = $('#send-message').val();
  var systemMessage;

  if (message.charAt(0) == '/') {
    systemMessage = chatApp.processCommand(message);
    if (systemMessage) {
      $('#messages').append(divSystemContentElement(systemMessage))
    }
  } else {
    chatApp.sendMessage($('#room').text(), message);
    $('#messages').append(divSystemContentElement(message));
    $('#messages').scrollTop($('#messages').prop('scrollHeight'));
  }
  $('#send-message').val(' ')
}

var socket = io.connect();

$(document).ready(function(){

  var chatApp = new Chat(socket);

  socket.on('nameResult', function(result){
    var message;

    if (result.success) {
      message = 'You are now known as ' + result.name + '.';
    }else {
      message = result.message;
    }
    $('#messages').append(divSystemContentElement(message));
  })

  socket.on('joinResult', function(result){
    $('#room').text(result.room);
    $('#messages').append(divSystemContentElement('Room changed.'));
  });

  socket.on('message', function(message){
    var newElement = $('<div></div>').text(message.text);
    $('#messages').append(newElement);
  });

  socket.on('rooms', function(rooms){})





})//end of doc ready
