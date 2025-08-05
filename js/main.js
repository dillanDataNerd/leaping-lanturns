// DOM elements
const startScreenNode = document.querySelector("#start-screen");
const gameScreenNode = document.querySelector("#game-screen");
const gameOverScreenNode = document.querySelector("gameover-screen");
const gameBoxNode = document.querySelector("#game-box");

const startButtonNode = document.querySelector("#start-button");
const restartButtonNode = document.querySelector("#restart-button");

// Global variables
let cricketObj = null;
const lanternArray = [];
let gameIntervalID = null;
let spawnIntervalID = null;
let score = 0;
let activeLanternMovementSpeed = 0;
const lanternSpawnLocationBelowScreen = 0;
const lanternSpawnRate = 2000;
const minimumStartingFuel = 100;
const platformHeight = 10;
const platformWidth = 30

// Global functions

// Game start

function startGame() {
  startScreenNode.style.display = "none";
  gameScreenNode.style.display = "flex";
  cricketObj = new Cricket();
  lanternArray[0] = new Lantern(cricketObj.x, cricketObj.y, 100, true);

  gameIntervalID = setInterval(gameLoop, Math.round(1000 / 60));
  spawnIntervalID = setInterval(spawnLantern, lanternSpawnRate);
}

function gameLoop() {

  //Despawn all lanterns that are falling and out of screen
  // When the cricket is not on a platform check if it is in the vicinity of one and land on it
  sortLanternArrayDescending();
  lanternArray.forEach((lanternObj) => {
    despawnLantern(lanternObj);
    lanternObj.burntOut()

    if (checkLanding(cricketObj, lanternObj)) {
      cricketObj.onPlatform = true;
      cricketObj.currentLantern=lanternObj
      cricketObj.repositionOnLanturn()
      lanternObj.absorbCricket(cricketObj)

    }
  }

    )
    score += 60/1000
  
  // move the lanturn and cricket based on objectives above
  lanternArray.forEach((lanternObj) => lanternObj.automaticMovement());
  cricketObj.automaticMovement(activeLanternMovementSpeed);

  //check if the bug has hit the ground. When it does, finish the game
  gameOver();
}

function gameOver() {
  if (checkCricketCollisionFloor()) {
    clearInterval(gameIntervalID);
    clearInterval(spawnIntervalID);
  }
}

function checkCricketCollisionFloor() {
  if (cricketObj.y + cricketObj.h > gameBoxNode.offsetHeight) {
    return true;
  } else {
    return false;
  }
}

function checkLanternCollisionFloor(lanternObj) {
  if (
    lanternObj.y > gameBoxNode.offsetHeight + lanternObj.h &&
    lanternObj.remainingFuel === 0
  ) {
    return true;
  } else {
    return false;
  }
}

function checkCollision(element1, element2) {
  if (
    element1.x < element2.x + element2.w &&
    element1.x + element1.w > element2.x &&
    element1.y < element2.y + element2.h &&
    element1.y + element1.h > element2.y
  ) {
    return true;
  } else {
    return false;
  }
}

function checkLanding(cricketObj, eachLanternObj) {
  const cricketMidX = cricketObj.x + cricketObj.w / 2;
  const platformLeft = eachLanternObj.x + (eachLanternObj.w - platformWidth) / 2;
  const platformRight = eachLanternObj.x + eachLanternObj.w - (eachLanternObj.w - platformWidth) / 2;

  if (
    cricketMidX > platformLeft &&
    cricketMidX < platformRight &&
    cricketObj.y + cricketObj.h - platformHeight< eachLanternObj.y + eachLanternObj.h &&
    cricketObj.y + cricketObj.h > eachLanternObj.y + eachLanternObj.h - platformHeight &&
    cricketObj.onPlatform == false
  ) {
    return true;
  }
  return false;
}

function cricketAction(event) {
  // check what the user pressed
  if (
    event.key === "a" ||
    event.key === "ArrowLeft" ||
    event.key === "d" ||
    event.key === "ArrowRight"
  ) {
    cricketObj.traverse(event);
    cricketObj.onPlatform = false;
  }
}

function spawnLantern() {
  let randomXPosition = Math.floor(
    Math.random() * (gameBoxNode.offsetWidth - lanternArray[0].w)
  );
  let randomYPosition =
    gameBoxNode.offsetHeight;
  let startingFuelAMount =
    Math.floor(Math.random() * gameBoxNode.offsetHeight) + minimumStartingFuel;

  lanternArray.push(
    new Lantern(randomXPosition, randomYPosition, startingFuelAMount, false)
  );

  return;
}
function despawnLantern(lanternObj) {
  if (checkLanternCollisionFloor(lanternObj)) {
    lanternArray[0].node.remove();
    lanternArray.shift();
  }
}

function sortLanternArrayDescending() {
  lanternArray.sort((a, b) => b.y - a.y);
}



// Global listners

startButtonNode.addEventListener("click", startGame);
document.addEventListener("keydown", cricketAction);
