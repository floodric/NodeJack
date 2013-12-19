/* player has
 
  hand : card[]
  total : current total
  otherTotals : array of other possible totals
  socket : socket.io socket to contact player
  money?
  state : ("active","stay","waiting","bust")
  dealer : bool
  
  // to be added by Game
  hit : add a card to hand
  stay : change state to waiting
  endTurn : next steps after player finished turn
  takeTurn : if dealer, the ai to take the turn
 */

function initPlayer(dealer){
  var player = {}
  player.cards = [];
  player.total = 0;
  player.otherTotals = [];

  // add in socket to be overwritten
  player.socket = {};
  player.socket.emit = function(a,b){}

  player.takeTurn = {};

  player.state = "waiting";
  player.dealer = dealer;

  return player;
}

exports.newPlayer = initPlayer;
