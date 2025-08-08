class Cricket {
  constructor() {
    this.node = document.createElement("img");
    this.node.className = "cricket";
    this.node.src = "./images/cricket.png";
    gameBoxNode.append(this.node);

    this.h = 80;
    this.w = 80;
    this.x = gameBoxNode.offsetWidth / 2 - this.w / 2;
    this.y = gameBoxNode.offsetHeight - this.h - 100;

    //adjust size and location of cricket on gamebox
    this.node.style.position = "absolute";
    this.node.style.width = `${this.w}px`;
    this.node.style.height = `${this.h}px`;
    this.node.style.left = `${this.x}px`;
    this.node.style.top = `${this.y}px`;

    //Config variables
    this.gravitySpeed = 8;
    this.jumpSpeed = 70;
    this.traverseSpeed = 12;
    this.VectorReduction = 1.3;

    // properties changed during the game
    this.traverseVector = 0;
    this.jumpDirection = "right";
    this.onPlatform = false;
    this.jumpVector = null;
    this.currentLantern = null;
  }

  automaticMovement() {
    // run the vector calculations and update the location of the cricket
    this.jumpAnimation();
    this.traverseAnimation();

    //check if the cricket is on a platform. Match the cricket speed with the lantern it is riding

    if (this.onPlatform) {
      this.y += this.currentLantern.currentFloatSpeed;
      this.x += this.currentLantern.currentWindSpeed;
      this.traverseVector = 0;
    }

    // Set the falling and traverse speed based when not connected to a lantern
    else {
      this.y = this.y + this.gravitySpeed - this.jumpVector;
    }
    this.x = this.x + this.traverseVector;

    this.node.style.top = `${this.y}px`;
    this.node.style.left = `${this.x}px`;
  }

  traverse(event) {
    // check if the cricket changed direction and adjust image
    this.changeDirection(event);

    // move the crickets position only if the cricket is not touching a wall
    if (
      this.jumpDirection === "right" &&
      this.x < gameBoxNode.offsetWidth - this.w
    ) {
      this.traverseVector = this.traverseSpeed;
    } else if (this.jumpDirection === "left" && this.x > 0) {
      this.traverseVector = this.traverseSpeed * -1;
    }

    if (this.onPlatform === true) {
      this.jump();
    }

    this.node.style.left = `${this.x}px`;
  }

  jump() {
    this.jumpVector = this.jumpSpeed;
    this.currentLantern.releaseCricket(this);
    this.currentLantern = null;
    this.onPlatform = false;
    jumpSound.play();
  }

  // the animations now decelerate the jump vector to make for a smoother animation
  jumpAnimation() {
    this.jumpVector = this.jumpVector / this.VectorReduction;
  }

  traverseAnimation() {
    if (this.jumpDirection === "right" && this.traverseVector > 0) {
      this.traverseVector = this.traverseVector - this.VectorReduction;
    } else if (this.jumpDirection === "right" && this.traverseVector < 0) {
      this.traverseVector = 0;
    }
    if (this.jumpDirection === "left" && this.traverseVector < 0) {
      this.traverseVector = this.traverseVector + this.VectorReduction;
    } else if (this.jumpDirection === "left" && this.traverseVector > 0) {
      this.traverseVector = 0;
    }
  }
  landed() {
    cricketObj.onPlatform = true;
    lanternObj.containsCricket = true;
    cricketObj.currentLantern = lanternObj;
    landSound.play();
  }

  // when the cricket lands it needs to be centered on the lanturn and traverse should be reset
  repositionOnLanturn() {
    this.traverseVector = 0;
    this.x = this.currentLantern.x + this.currentLantern.w / 2 - this.w / 2;
    this.y = this.currentLantern.y + this.currentLantern.h / 2;

    this.node.style.left = `${this.x}px`;
    this.node.style.top = `${this.y}px`;
  }

  //If the user changes direction, change the image orientation of cricket
  changeDirection(event) {
    if (
      (event.key === "a" || event.key === "ArrowLeft") &&
      this.jumpDirection === "right"
    ) {
      this.jumpDirection = "left";
      this.node.style.transform = "scaleX(-1)";
    } else if (
      (event.key === "d" || event.key === "ArrowRight") &&
      this.jumpDirection === "left"
    ) {
      this.jumpDirection = "right";
      this.node.style.transform = "scaleX(1)";
    }
  }
}
