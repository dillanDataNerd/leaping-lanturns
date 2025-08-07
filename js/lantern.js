class Lantern {
  constructor(xPosition, yPosition, startingFuelAMount, containsCricket) {
    this.node = document.createElement("img");
    this.node.className = "lantern";
    this.node.src = "../images/lantern-floating.png"; 
    gameBoxNode.append(this.node);

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
    this.windSpeed=1
    this.windDirection=Math.random()-0.5
    this.remainingFuel = startingFuelAMount;
    this.containsCricket = containsCricket;
    this.currentFloatSpeed = this.floatSpeed
    this.currentWindSpeed= this.windDirection*this.windSpeed
    this.justReleased= false
  }

  automaticMovement() {
    // y movement of lanturn
    if (this.remainingFuel) {
      this.currentFloatSpeed = -this.floatSpeed;
      this.remainingFuel--;
    } else if (this.remainingFuel === 0) {
        this.currentFloatSpeed=this.gravitySpeed
        }

    this.y += this.currentFloatSpeed
    this.node.style.top = `${this.y}px`;

    //x movement of lanturn
    
    this.reverseWind()
    
    this.x += this.currentWindSpeed
    this.node.style.left = `${this.x}px`;

    
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
    this.containsCricket = false
    
    this.justReleased = true;
    setTimeout(() => this.justReleased = false, 200)
  }

// if the lantern hits a wall, change the x direction of thel lantern
  reverseWind(){
    if (this.x < 0 || (this.x > gameBoxNode.offsetWidth - this.w) ){
      this.currentWindSpeed *= -1
    }
  }
  

}