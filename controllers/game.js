function checkGame(game){
  if(typeof(game) != "object"){
    return false;
  }
  if(typeof(game.state) == "undefined"){
    return false; // no game state
  }
}


function createGame(){

}

function endGame(game){
  checkGame(game);
}

exports.startGame = createGame;
exports.endGame = endGame;

