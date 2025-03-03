const { join } = require("path/posix");

$(document).ready(function () {
  /* global io */
  let socket = io();
  
  socket.on('user', (data) => {
    $('#num-users').text(data.currentUsers + ' users online');
    let message = 
      `${data.name} ${data.connected ? ' has joined the chat.' : ' has left the chat.'}`;
      $('#messages').append($('<li>').html('<b>' + message + '</b>'));
  });

  socket.on('chat message', msg => {
    $('#messages').append($('<li>').html(`${msg.name}: ${msg.msg}`));
  });


  // Form submittion with new message in field with id 'm'
  $('form').submit(function () {
    var messageToSend = $('#m').val();
    socket.emit('chat message', messageToSend);

    $('#m').val('');
    return false; // prevent form submit from refreshing page
  });
});