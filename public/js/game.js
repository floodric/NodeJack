/* game.js: client side javascript for NodeJack */

var socket = io.connect("http://floodric.com");

function checkPlayer(player){
  return true;
}

function updatePlayer(player){
  if(!checkPlayer(player)){
    alert('something went wrong talking to the server.  try again later');
  }
  $("#playerTotal").html(player.total);
  $("#playerState").html(player.state);

  for(var i=0; i<player.cards.length; i++){
    if(!$("#playerCard"+i).attr("src"){ // look up if we hae a valid src
      var img = "";
      switch(player.cards[i].rank{
        case 2:
          img += "Two";
          break;
        case 3:
          img += "Three";
          break;
        case 4:
          img += "Four";
          break;
        case 5:
          img += "Five";
          break;
        case 6:
          img += "Six";
          break;
        case 7:
          img += "Seven";
          break;
        case 8:
          img += "Eight"
          break;
        case 9:
          img += "Nine";
          break;
        default: // at this point, we assume we have a valid string card rank
          img += player.cards[i].rank;\
      }
      img += player.cards[i].suit;
      img += ".bmp";
      $("#playerCard"+i).attr("src",img); // write our img into src
    }
  }
}

// hook the screen updating functions to socket.io packets
socket.on('player',updatePlayer);
socket.on('dealer',updateDealer);
socket.on('game',updateGame);
