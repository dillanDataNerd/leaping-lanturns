class Cricket {
  constructor() {
    this.node = document.createElement("img");
    this.node.className = "cricket";
    this.node.src = "../images/cricket.png"; // access this as if you were accessing the image from the HTML file
    gameBoxNode.append(this.node);

    this.x = 100;
    this.y = 200;
    this.h = 80;
    this.w = 80;

    //adjust size of cricket
    this.node.style.width = `${this.w}px`;
    this.node.style.height = `${this.h}px`;

    //adjust position
    this.node.style.position = "absolute";
    this.node.style.left = `${this.x}px`;
    this.node.style.top = `${this.y}px`;

    this.gravitySpeed = 1;
    this.jumpSpeed = 30;
    this.jumpDirection = "right";
    this.onPlatform = false;
  }

  automaticMovement(lanternSpeed) {
    //check if the cricket is not on the platform
    if (this.onPlatform) {
      this.y += this.currentLantern.currentSpeed;
    }
    // what to do when falling
    else {
      this.y += this.gravitySpeed;
    }
    this.node.style.top = `${this.y}px`;
  }

  changeDirection(event) {
    //If the user changes direction, change the image orientation
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

  traverse(event) {
    // check if the cricket changed direction
    this.changeDirection(event);

    // move the crickets position in javascript only if the cricket is not already on a wall
    if (
      this.jumpDirection === "right" &&
      this.x < gameBoxNode.offsetWidth - this.w
    ) {
      this.x += this.jumpSpeed;
    } else if (this.jumpDirection === "left" && this.x > 0) {
      this.x -= this.jumpSpeed;
    }

    if ((this.onPlatform === true)) {
      this.onPlatform = false;
      this.jump();
    }

    //move the image of the cricket to its actual position
    this.node.style.left = `${this.x}px`;
  }

  jump() {
    this.y -= this.jumpSpeed;
    this.node.style.top = `${this.y}px`;
  }
}
