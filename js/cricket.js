class Cricket {
  constructor() {
    this.node = document.createElement("img");
    this.node.className = "cricket";
    this.node.src = "../images/cricket.png"; // access this as if you were accessing the image from the HTML file
    gameBoxNode.append(this.node);

    this.h = 80;
    this.w = 80;
    this.x = gameBoxNode.offsetWidth / 2 - this.w / 2; //set these at the start so the cricket is centered on the lantern
    this.y = gameBoxNode.offsetHeight - this.h - 100;

    //adjust size of cricket
    this.node.style.width = `${this.w}px`;
    this.node.style.height = `${this.h}px`;

    //adjust position
    this.node.style.position = "absolute";
    this.node.style.left = `${this.x}px`;
    this.node.style.top = `${this.y}px`;

    this.gravitySpeed = 5;
    this.jumpSpeed = 70;
    this.jumpVector = null;
    this.traverseSpeed = 12;
    this.VectorReduction=1.3
    this.traverseVector=0
    this.jumpDirection = "right";
    this.onPlatform = false;
    this.currentLantern = null;
  }

  automaticMovement() {
    // run the animation vectors
    this.jumpAnimation()
    this.traverseAnimation()


    //check if the cricket is not on the platform

    if (this.onPlatform) {
      this.y += this.currentLantern.currentFloatSpeed;
      this.x += this.currentLantern.currentWindSpeed;
      this.traverseVector=0
    }
    // what to do when falling
    else {
      this.y = this.y + this.gravitySpeed - this.jumpVector;
    }
    this.x= this.x + this.traverseVector

    this.node.style.top = `${this.y}px`;
    this.node.style.left = `${this.x}px`
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
      this.traverseVector=this.traverseSpeed


    } else if (this.jumpDirection === "left" && this.x > 0) {
      this.traverseVector = this.traverseSpeed * -1
    }

    if (this.onPlatform === true) {
      this.jump();
    }

    //move the image of the cricket to its actual position
    this.node.style.left = `${this.x}px`;
  }

  jump() {
    this.jumpVector = this.jumpSpeed;
    this.currentLantern.releaseCricket(this); // let the lantern restore itself
    this.currentLantern = null;
    this.onPlatform = false;
    jumpSound.play();
  }

  // when the user jumps, we nowly moves up trigger a jump vector so that the cricket smooth
  jumpAnimation() {
      this.jumpVector = this.jumpVector / this.VectorReduction;
  }
  // can you refactor this to change images when you land

  traverseAnimation(){

    if(this.jumpDirection==="right" && this.traverseVector>0){
    this.traverseVector = this.traverseVector-this.VectorReduction
    }
    else if(this.jumpDirection==="right" && this.traverseVector<0){
    this.traverseVector = 0
    }
        if(this.jumpDirection==="left" && this.traverseVector<0){
    this.traverseVector = this.traverseVector+this.VectorReduction
    }
    else if(this.jumpDirection==="left" && this.traverseVector>0){
    this.traverseVector = 0
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
    this.traverseVector=0
    this.x = this.currentLantern.x + this.currentLantern.w / 2 - this.w / 2;
    this.y = this.currentLantern.y + this.currentLantern.h / 2;

    this.node.style.left = `${this.x}px`;
    this.node.style.top = `${this.y}px`;
  }
}
