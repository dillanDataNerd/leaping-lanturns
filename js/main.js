// DOM elements
const startScreenNode = document.querySelector("#start-screen");
const gameScreenNode = document.querySelector("#game-screen");
const gameOverScreenNode = document.querySelector("#gameover-screen");
const gameBoxNode = document.querySelector("#game-box");

const startButtonNode = document.querySelector("#start-button");
const restartButtonNode = document.querySelector("#restart-button");
const saveScoreButtonNode = document.querySelector("#save-button");
const liveScoreNode = document.querySelector(".score");
const finalScoreNode = document.querySelector("#gameover-screen .score");
const highScoreListNode = document.querySelector("#high-score-list");
const nameInputNode = document.querySelector("#high-score-name");
// Audio elements
const backgroundMusic = new Audio("./sounds/backgroundFireworks.wav"); // background music when the game starts
const jumpSound = new Audio("./sounds/jumpSound.wav");
const landSound = new Audio("./sounds/landSound.wav");
const endGameMusic = new Audio("./sounds/endGameMusic.flac");
backgroundMusic.volume = 0.1;
jumpSound.volume = 0.3;
landSound.volume = 1;
endGameMusic.volume = 0.1;

const splatSound = new Audio("/sounds/splat.wav");

// Global variables

let cricketObj = null;
let lanternArray = [];
let gameIntervalID = null;
let spawnIntervalID = null;
let score = 0;
const lanternSpawnLocationBelowScreen = 0;
const lanternSpawnRate = 2000;
const minimumStartingFuel = 100;
const platformHeight = 20;
const platformWidth = 40;
let highScoresString = null;

//initial check for high scores incase the person is playing for the first time and its emprty
if (!localStorage.getItem("previousHighScoreArray")) {
  localStorage.setItem("previousHighScoreArray", `[]`); // initialise an empty array
}
// Global functions

// Game start

function startGame() {
  startScreenNode.style.display = "none";
  gameScreenNode.style.display = "flex";
  //backgroundMusic.play()

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
    lanternObj.burntOut();

    if (checkLanding(cricketObj, lanternObj)) {
      cricketObj.onPlatform = true;
      cricketObj.currentLantern = lanternObj;
      cricketObj.repositionOnLanturn();
      lanternObj.absorbCricket(cricketObj);
    }
  });
  updateScore();

  // move the lanturn and cricket based on objectives above
  lanternArray.forEach((lanternObj) => lanternObj.automaticMovement());
  cricketObj.automaticMovement();

  // scroll the background up as the user get higher
  scrollBackground()
  
  //check if the bug has hit the ground. When it does, finish the game
  
  gameOver();
}

function gameOver() {
  if (checkCricketCollisionFloor()) {
    clearInterval(gameIntervalID);
    clearInterval(spawnIntervalID);

    splatSound.play();
    setTimeout(() => {}, 500);
    endGameMusic.play();

    gameScreenNode.style.display = "none";
    gameOverScreenNode.style.display = "flex";

    showHighScoreList();
    checkNewScoreIsTop5();

    finalScoreNode.innerHTML = `${Math.round(score)}m`;
    finalScoreNode.innerHTML = `${Math.round(score)}m`;
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

function checkLanding(cricketObj, eachLanternObj) {
  const cricketMidX = cricketObj.x + cricketObj.w / 2;
  const platformLeft =
    eachLanternObj.x + (eachLanternObj.w - platformWidth) / 2;
  const platformRight =
    eachLanternObj.x +
    eachLanternObj.w -
    (eachLanternObj.w - platformWidth) / 2;

  if (
    cricketMidX > platformLeft &&
    cricketMidX < platformRight &&
    cricketObj.y + cricketObj.h - platformHeight <
      eachLanternObj.y + eachLanternObj.h &&
    cricketObj.y + cricketObj.h >
      eachLanternObj.y + eachLanternObj.h - platformHeight &&
    cricketObj.onPlatform == false &&
    eachLanternObj.justReleased == false
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
  let randomYPosition = gameBoxNode.offsetHeight;
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

function updateScore() {
  score += 60 / 1000;
  liveScoreNode.innerHTML = Math.round(score);
}

function restartGame() {
  resetGameState();
  resetSaveButtonState();
  startGame();
}

function save() {

  restartButtonNode.style.display="flex"
saveScoreButtonNode.style.display="none"
nameInputNode.style.display="none"

  addHighScoreToList();
}

function checkNewScoreIsTop5() {

  //retrieve the latest high score and compare it to the scores stored in memory
  let newHighScore = {
    name: nameInputNode.value || "Unknown Cricket",
    score: Math.round(score),
  };

  let highScoresArray = JSON.parse(
    localStorage.getItem("previousHighScoreArray")
  );
  highScoresArray.push(newHighScore);
  sortHighScores(highScoresArray);

// check if the high score is high enough that we should save the score
  if (
    highScoresArray.length < 5 ||
    highScoresArray[4].score < newHighScore.score
  ) {
    
    nameInputNode.style.display="block"
    saveScoreButtonNode.style.display="flex"
    saveScoreButtonNode.style.disabled = true;
    restartButtonNode.style.display="none"
  } 
  // if the score was not worth saving only show the oplay game button
  else {
    nameInputNode.style.display="none"
    saveScoreButtonNode.style.display="none"
    saveScoreButtonNode.style.disabled = true;

  }
}

function addHighScoreToList() {
  let newHighScore = {
    name: nameInputNode.value || "Unknown Cricket",
    score: Math.round(score),
  };
  let highScoresArray = JSON.parse(
    localStorage.getItem("previousHighScoreArray")
  );
  highScoresArray.push(newHighScore);
  sortHighScores(highScoresArray);

  localStorage.setItem(
    "previousHighScoreArray",
    JSON.stringify(highScoresArray)
  );
}

function getHighScoresArray() {
  let currentHighScoresArray = JSON.parse(
    localStorage.getItem("previousHighScoreArray")
  );
  sortHighScores(currentHighScoresArray);
  return currentHighScoresArray;
}

function sortHighScores(list) {
  return list.sort((b, a) => a.score - b.score);
}

function resetSaveButtonState() {
  saveScoreButtonNode.disabled = false;
  saveScoreButtonNode.classList.remove("disabled");
  saveScoreButtonNode.innerHTML = "Save score";
  nameInputNode.value=""
}

function resetGameState() {
  cricketObj.node.style.display = "none";
  gameOverScreenNode.style.display = "none";
  lanternArray.forEach(
    (thisLantern) => (thisLantern.node.style.display = "none")
  );

  score = 0;
  cricketObj = null;
  lanternArray = [];
}

function showHighScoreList() {
  highScoreListNode.innerHTML = "";
  let i = 0;
  let highScoreArray = getHighScoresArray();
  while (i < 5) {
    if (!highScoreArray[i]) {
      return;
    } else {
      let highScoreEntryNode = document.createElement("li");
      let innerText = `<span class="name">${highScoreArray[i].name}</span>
      
  <span class="score">${highScoreArray[i].score}</span>`;

      highScoreEntryNode.innerHTML = innerText;
      highScoreListNode.appendChild(highScoreEntryNode);
    }
    i++;
  }
}

function scrollBackground(){



}

// Global listners
document.addEventListener("keydown", cricketAction);
startButtonNode.addEventListener("click", startGame);
restartButtonNode.addEventListener("click", restartGame);
saveScoreButtonNode.addEventListener("click", save);

//
