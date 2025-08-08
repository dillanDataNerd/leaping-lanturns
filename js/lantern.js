class Lantern {
  constructor(xPosition, yPosition, startingFuelAMount, containsCricket) {
    this.node = document.createElement("img");
    this.node.className = "lantern";
    this.node.src = "./images/lantern-floating.png";
    gameBoxNode.append(this.node);

    //Show position of cricket in gamebox
    this.h = 150;
    this.w = 80;
    this.x = xPosition;
    this.y = yPosition - this.h / 2;

    //Show position of Lantern in gamebox
    this.node.style.width = `${this.w}px`;
    this.node.style.height = `${this.h}px`;
    this.node.style.position = "absolute";
    this.node.style.left = `${this.x}px`;
    this.node.style.top = `${this.y}px`;

    //config variables for the lantern
    this.floatSpeed = 1.5;
    this.gravitySpeed = 0.5 * this.floatSpeed;
    this.windSpeed = 1;
    this.windDirection = Math.random() - 0.5;

    // variables that change during the
    this.remainingFuel = startingFuelAMount;
    this.containsCricket = containsCricket;
    this.currentFloatSpeed = this.floatSpeed;
    this.currentWindSpeed = this.windDirection * this.windSpeed;
    this.justReleased = false;
  }

  automaticMovement() {
    // y movement of lanturn
    if (this.remainingFuel) {
      this.currentFloatSpeed = -this.floatSpeed;
      this.remainingFuel--;
    } else if (this.remainingFuel === 0) {
      this.currentFloatSpeed = this.gravitySpeed;
    }

    this.y += this.currentFloatSpeed;
    this.node.style.top = `${this.y}px`;

    //x movement of lanturn

    this.reverseWind();
    this.x += this.currentWindSpeed;
    this.node.style.left = `${this.x}px`;
  }

  burntOut() {
    if (this.y < 0) {
      this.remainingFuel = 0;
    }

    if (this.remainingFuel === 0) {
      this.node.src = "./images/burntOutLantern.png";
    }

    if (this.remainingFuel === 0 && this.containsCricket === true) {
      this.node.src = "./images/landedCricketFallingLanturn.png";
    }
  }

  // when the cricket lands change the image for the lantern
  absorbCricket(cricket) {
    if (this.remainingFuel > 0) {
      this.node.src = "./images/landedCricketRisingLanturn.png";
    } else {
      this.node.src = "./images/landedCricketFallingLanturn.png";
    }
    cricket.node.style.display = "none";
    this.containsCricket = true;
  }

  // When the cricket jumps off change the image of the lantern and have the cricket reappear
  // Also set a cool down so that the cricekt is not immediatly reabsorbed into the lantern it jumped out of
  releaseCricket(cricket) {
    if (this.remainingFuel === 0) {
      this.node.src = "./images/burntOutLantern.png";
    } else {
      this.node.src = "./images/lantern-floating.png";
    }

    this.containsCricket = false;
    this.justReleased = true;

    cricket.node.style.display = "block";

    setTimeout(() => (this.justReleased = false), 200);
  }

  // if the lantern hits a wall, change the x direction of thel lantern
  reverseWind() {
    if (this.x < 0 || this.x > gameBoxNode.offsetWidth - this.w) {
      this.currentWindSpeed *= -1;
    }
  }
}
