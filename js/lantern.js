class Lantern {
  constructor(xPosition, yPosition, startingFuelAMount, containsCricket) {
    this.node = document.createElement("img");
    this.node.className = "lantern";
    this.node.src = "../images/lantern-floating.png"; // access this as if you were accessing the image from the HTML file
    gameBoxNode.append(this.node);

    // this.x= Math.floor(Math.random()*gameBoxNode.offsetWidth)
    // this.y= gameBoxNode.offsetHeight
    this.x = xPosition;
    this.y = yPosition;

    this.h = 150;
    this.w = 80;

    //adjust size of Lantern
    this.node.style.width = `${this.w}px`;
    this.node.style.height = `${this.h}px`;

    //adjust position
    this.node.style.position = "absolute";
    this.node.style.left = `${this.x}px`;
    this.node.style.top = `${this.y}px`;

    this.floatSpeed = 1;
    this.gravitySpeed = 0.5 * this.floatSpeed;
    this.remainingFuel = startingFuelAMount;
    this.containsCricket = containsCricket;
    this.currentSpeed = this.floatSpeed
  }

  automaticMovement() {
    if (this.remainingFuel) {
      this.currentSpeed = -this.floatSpeed;
      this.remainingFuel--;
    } else if (this.remainingFuel === 0) {
        this.currentSpeed=this.gravitySpeed
        }

    this.y += this.currentSpeed
    this.node.style.top = `${this.y}px`;
    
  }

  flicker() {}
}
