/* Deck model
  
  deck has 52 cards
  deck can shuffle
  deck can draw
 
  deck may have jokers

  card has suit and rank

{ cards: card[]
  size:  len(card[])
  shuffle: fn to reorder remaining cards
  draw: fn to remove a card and update deck state
}
*/
 
/************* CARDS FUNCTIONS *************/
var suits = ["Spades","Diamonds","Hearts","Clubs"];
var ranks = ["2","3","4","5","6","7","8","9","10",
             "Jack","Queen","King","Ace"];

var joker = {rank:"Joker", suit:"Special"};

function makeCard(suit, rank){
  checkSuit(suit);
  checkRank(rank);
  return {"suit":suit, "rank":rank};
}

// checkSuit: throws error if suit does not work as a suit type
function checkSuit(suit){
  suit = "" + suit + ""; // coerce to string
  if(suits.indexOf(suit) == -1 && suit != joker.suit){
    throw new Error("Invalid suit: " + suit + ":" + typeof(suit) +
                    " not in " + suits.join(","));
    return;
  }
  return;
}

// checkRank: throw error if rank doesnt work as a rank type
function checkRank(rank){
  rank = "" + rank + "";
  if(ranks.indexOf(rank) == -1 && rank != joker.rank){
    throw new Error("Invalid rank: " + rank + ":" + typeof(rank) + 
                    " not in " + ranks.join(", "));
    return;
  } 
  return;
}

// checkCard: throws error on invalid cards
function checkCard(card){
  if(!card || !card.suit || !card.rank){
    throw new Error("Invalid card object");
  }
  checkSuit(card.suit);
  checkRank(card.rank);
  return;
}


/************* DECK FUNCTIONS *************/

// createDeck: will generate an unshuffled deck of cards
//             will include joker cards if jokers is truthy
function createDeck(jokers){
  var deck = {};
  var cards = [];
  suits.forEach(function(suitval,i,arr){
    ranks.forEach(function(rankval,i,arr){
      // make a card of the suit & rank
      cards.push(makeCard(suitval,rankval));
    });
  });
  if(jokers){
    // make copies of the card and do not pass around the joker reference
    cards.push(makeCard("Special","Joker"));
    cards.push(makeCard("Special","Joker"));
  }

  deck.cards = cards;
  deck.size = jokers ? 54 : 52; 
  deck.draw = function(){ deck.size -= 1; return deck.cards.pop();}; 
  deck.shuffle = function(){deck.cards = shuffle(deck.cards);};
  
  return deck;
}

function mergeDecks(deckA, deckB){
  var deck = {};
  deck.size = deckA.size + deckB.size;
  deck.cards = deckA.cards.concat(deckB.cards);

  deck.shuffle = function(){deck.cards = shuffle(deck.cards);};
  deck.draw = function(){ deck.size -= 1; return deck.deck.pop();}; 
}

// shuffle a deck of cards via Fisher-Yates
// http://en.wikipedia.org/wiki/Fisher–Yates_shuffle
function shuffle(cards){
  var len = cards.length;
  
  for(len; len > 0; len-=1){
    // pick a random number within len unshuffled to be replaced
    index = Math.floor((Math.random() * 100) % len);

    victim = cards[index]; // victim card to be replaced
    cards[index] = cards[len]
    cards[len] = victim;
  }

  return cards;
}

// checkDeck: will throw errors on bad decks.
function checkDeck(deck){
  // check existence & data types of everything size special 0 is falsey
  if(!deck || !deck.cards || (typeof(deck.size) != "number") || 
     !deck.draw || !deck.shuffle){
    throw new Error("Invalid deck object");
    return;
  }
  // duck-typing deck.cards here.  just sayin
  if(!deck.cards.length || (deck.cards.length != deck.size)){
    throw new Error("Invalid deck size");
    return;
  }

  if(typeof(deck.draw) != "function" || typeof(deck.shuffle) != "function"){
    throw new Error("Invalid deck methods");
    return;
  }

  deck.cards.forEach(function(val,i,arr){
    checkCard(val);
  });
  return;
}


// testDeck: tests general flow of deck operations as a normal user would
//           catches no errors and throws errors on assumption violations
function testDeck(){
  // check both types of decks
  var noJokers = createDeck(0);
  checkDeck(noJokers);
  var jokers = createDeck(1);
  checkDeck(jokers);

  console.log("Passed initialization checks");
  
  // draw all the cards from each deck and validate assumptions about them 
  var noJokerCards = [];
  var jokerCards = []; 

  var card, oldSize;
  for(var i = 0; i < noJokers.size; i++){
    oldSize = noJokers.size;
    card = noJokerCards.push(noJokers.draw);

    if(noJokers.cards.indexOf(card) != -1){
      throw new Error("noJokers has duplicate" + card.rank + " " + card.suit);
      return;
    }
    if(oldSize <= noJokers.size){
      throw new Error("noJokers size innaccurate: is " + oldSize + " was " +
                      noJokers.size + "should be " + (52 - i));
      return;
    }
    
    checkDeck(noJokers);
  }
  for(var i = 0; i < jokers.size; i++){
    oldSize = jokers.size;
    card = jokerCards.push(jokers.draw);

    if(noJokers.cards.indexOf(card) != -1 && card.rank != joker.rank){
      throw new Error("jokers has duplicate" + card.rank + " " + card.suit);
      return;
    }
    if(oldSize <= jokers.size){
      throw new Error("jokers size innaccurate: is " + oldSize + " was " +
                      noJokers.size + "should be " + (54 - i));
      return;
    }
  
    checkDeck(jokers);
  }

  console.log("Passed drawing checks");

  // check shuffling by comparing a shuffled & unshuffled deck
  // there are better ways to do this, but perfect statistical randomness 
  // is outside the scope of a non-monetary game
  var refDeck = createDeck(0);
  var testDeck = createDeck(0);
  var otherTestDeck = createDeck(0);
  testDeck.shuffle(); 
  otherTestDeck.shuffle(); 

  var refShuff = 0;
  var shuffOther = 0;
  var refOther = 0;
  for(var i=0; i<52; i++){
    if(refDeck.cards[i].rank == testDeck.cards[i].rank &&
       refDeck.cards[i].suit == testDeck.cards[i].suit){
      refShuff++;
    }
    if(refDeck.cards[i].rank == otherTestDeck.cards[i].rank &&
       refDeck.cards[i].suit == otherTestDeck.cards[i].suit){
      refOther++;
    }
    if(testDeck.cards[i].rank == otherTestDeck.cards[i].rank &&
       testDeck.cards[i].suit == otherTestDeck.cards[i].suit){
      shufffOther++;
    }
  }
  var randThresh = 1.0 / 3.0 ; // % match between two decks that is too high
  if(refShuff > (52 * randThresh) || refOther > (52 * randThresh) ||
     shuffOther > (52 * randThresh)){
    throw new Error("shuffling not random enough");
    return;
  }
  return;
}

exports.createDeck = createDeck;
exports.mergeDecks = mergeDecks;
exports.test = testDeck;
