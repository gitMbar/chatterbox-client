// YOUR CODE HERE:
var app = {
  server: 'https://api.parse.com/1/classes/chatterbox',
  rooms: {},
  friends: {},

  init: function(){
    this.message = {
      username: this.findUsername(),
      text: '',
      roomname: null
    };
    this.fetch();

    $("form").on("keypress", "#msgtext", function(e){
      if (e.which === 13){
        e.preventDefault();
        app.message.text = $(this).val();
        app.send(app.message);
        $(this).val("");
        app.fetch();
      }
    });

    $("form").on("keypress", "#roomtext", function(e){
      if (e.which === 13){
        e.preventDefault();
        var newRoom = $(this).val();
        app.createRoom(newRoom);
        $(this).val("");
      }
    });

    $("ul").on("click", "li", function(e){

      //console.log('checking data friend ', $(this).data("friend-name"));
      app.addFriend($(this).data("friend-name"));


    });

    $("#roomChooser").on("change", function(){
      app.message.roomname = $(this).val();
      app.fetch();
    })

    setInterval(app.fetch,1000);

  },
  send: function(message){
    $.ajax({
      url: app.server,
      type: 'POST',
      data: JSON.stringify(message),
      contentType: 'application/json',
      success: function(data){
        console.log('data is: ' , data);
      },
      error: function(data){
        console.error('chatterbox: Failed to send message');
      }
    });
  },
  fetch: function(){
    $.ajax({
      url: app.server + "?order=-createdAt",
      type: 'GET',
      success: function(data){
        //console.log('data is: ' , data);
        app.getRooms(data.results);
        if (app.message.roomname !== null){
         app.display(data.results);
        }
      },
      error: function(data){
        console.error('chatterbox: Failed to send message');
      }
    });
  },

  display: function(data){
    //console.log(data);
    var counter = 0;
    this.clearMessages();
    for (var i = 0; i < data.length; i++){
      if (data[i].roomname === app.message.roomname){
        app.addMessage(data[i]);
        counter++;
      }
      if (counter >=15){
        break;
      }

    }

  },

  addFriend: function(friend){
    app.friends[friend] = true;
    console.log('friends list ',app.friends);
  },

  findUsername: function(){
    if (/(&|\?)username=/.test(window.location.search)) {
      return window.location.search.slice(10);
    }


  },

  addMessage: function(msgObject){
    var friend = escape(msgObject.username);
    var premessage = "<li>" + escape(msgObject.username) + ": " + escape(msgObject.text) + "</li>";
    $message = $(premessage).attr("data-friend-name", escape(msgObject.username));
    $message.addClass('chat');
    if (app.friends[friend] !== undefined){
      $message.addClass('username');
    }
    $('#chats').append($message);
  },

  clearMessages: function(){
     $("#chats").children().remove();
  },

  getRooms: function(data){
    //note: rooms will last foreve
    $('#roomChooser').children().remove();
    for (var i = 0; i < data.length; i++){
      if (app.rooms[data[i].roomname] === undefined){
        app.rooms[data[i].roomname] = true;
      }
    }
    //TODO: check if room has a value and set that prop to selected
    for (var key in app.rooms){
      var selectStatus = '';
      if (key === app.message.roomname){
        selectStatus = " selected=\"selected\" ";
      }
        $('#roomChooser').append("<option " + selectStatus+ ">" + key + "</option>");
        selectStatus = '';
    }
  },

  createRoom: function(roomname){
    app.message.roomname = roomname;
    $('#roomChooser').append("<option selected=\"selected\">" + roomname + "</option>");
    $('#roomChooser').val(roomname);
    app.clearMessages()
  }
  //getUsers: function(){}
};

$(document).ready(function(){
  app.init();})
