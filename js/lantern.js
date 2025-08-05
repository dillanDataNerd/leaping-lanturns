class Lantern {
  constructor(xPosition, yPosition, startingFuelAMount, containsCricket) {
    this.node = document.createElement("img");
    this.node.className = "lantern";
    this.node.src = "../images/lantern-floating.png"; // access this as if you were accessing the image from the HTML file
    gameBoxNode.append(this.node);

    // this.x= Math.floor(Math.random()*gameBoxNode.offsetWidth)
    // this.y= gameBoxNode.offsetHeight
    this.h = 150;
    this.w = 80;

    this.x = xPosition;
    this.y = yPosition-this.h/2;

 
    //adjust size of Lantern
    this.node.style.width = `${this.w}px`;
    this.node.style.height = `${this.h}px`;

    //adjust position
    this.node.style.position = "absolute";
    this.node.style.left = `${this.x}px`;
    this.node.style.top = `${this.y}px`;

    this.floatSpeed = 1.5;
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

  burntOut() {

    if (this.y<0){
        this.remainingFuel=0
    }

    if (this.remainingFuel === 0){
        this.node.src = "../images/burntOutLantern.png"
    }

     if (this.remainingFuel === 0 && this.containsCricket ===true){
        this.node.src = "../images/landedCricketFallingLanturn.png"
    }
  }

  absorbCricket(cricket) {
    if (this.remainingFuel>0){
        this.node.src = "../images/landedCricketRisingLanturn.png"
    }
    else {
        this.node.src = "../images/landedCricketFallingLanturn.png"
    }
    cricket.node.style.display = "none"; // hide cricket
    ; // swap lantern image
    this.containsCricket = true;
  }

  releaseCricket(cricket) {
    cricket.node.style.display = "block"; // show cricket

    if(this.remainingFuel===0){
    this.node.src = "../images/burntOutLantern.png"
    }else{
    this.node.src = "../images/lantern-floating.png";} // restore lantern
    this.containsCricket = false;
  }

}