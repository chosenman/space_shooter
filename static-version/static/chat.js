  var socket = io.connect();

  // socket.on('user_created', function(data){
  //   $('#user').html(data.username)
  // })
(function(){
  socket.emit('page_refresh',{})
})()

$('#msgbtn').click(function(){

  socket.emit('msg_sent',{
    msg: $('#message').val(),
    userId: userID
  })

})


socket.on('update_chat', function(data){
  $('#chat').html(data.chatLog)
})
