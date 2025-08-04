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
const lanternSpawnLocationBelowScreen = 100;
const lanternSpawnRate = 2000;

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
      cricketObj.automaticMovement();

  sortLanternArrayDescending();

  lanternArray.forEach((lanternObj) => {
    lanternObj.automaticMovement();
    despawnLantern(lanternObj);

    if (cricketObj.onPlatform === false && checkLanding(cricketObj, lanternObj)) {
      console.log("landed")
      cricketObj.onPlatform=true
      lanternObj.containsCricket=true
    }
  });



  //gameOver();
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
  if (
    cricketObj.x < eachLanternObj.x + eachLanternObj.w &&
    cricketObj.x + cricketObj.w > eachLanternObj.x &&
    cricketObj.y < eachLanternObj.y + eachLanternObj.h &&
    cricketObj.y + cricketObj.h > eachLanternObj.y  &&
    cricketObj.onPlatform === false &&
    eachLanternObj.containsCricket === false
  ) {
    console.log("landed");
    cricketObj.onPlatform = true
    
    return true;
  } else {
    return false;
  }
}

function checkCricketLandedOnLantern() {
  if (cricketObj.onPlatform) {
    return;
  }

  lanternArray.forEach((eachLanternObj) => {
    isColliding = checkCollision(cricketObj, eachLanternObj);
    if (isColliding) {
      gameOver();
    }
  });
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
    cricketObj.onPlatform = false
  }
}

function spawnLantern() {
  let randomXPosition = Math.floor(
    Math.random() * (gameBoxNode.offsetWidth - lanternArray[0].w)
  );
  let randomYPosition =
    Math.floor(Math.random() * lanternSpawnLocationBelowScreen) +
    gameBoxNode.offsetHeight;
  let startingFuelAMount = Math.floor(Math.random() * gameBoxNode.offsetHeight);

  lanternArray.push(
    new Lantern(randomXPosition, randomYPosition, startingFuelAMount, false)
  );

  console.log(lanternArray);
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
