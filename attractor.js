class Attractor {
  constructor(x, y) {
    this.position = createVector(x, y);
    this.velocity = createVector(0, 0);
    this.targetVel = createVector(0, 0);
    this.speed = 4;
    this.lerpAmount = 0.05;
    this.radius = 24;
  }

  // Set target direction based on a voice command
  setDirection(word) {
    if (word === "up") {
      this.targetVel.set(0, -this.speed);
    } else if (word === "down") {
      this.targetVel.set(0, this.speed);
    } else if (word === "left") {
      this.targetVel.set(-this.speed, 0);
    } else if (word === "right") {
      this.targetVel.set(this.speed, 0);
    }
  }

  update() {
    // Smoothly blend velocity toward target direction
    this.velocity.x = lerp(this.velocity.x, this.targetVel.x, this.lerpAmount);
    this.velocity.y = lerp(this.velocity.y, this.targetVel.y, this.lerpAmount);
    this.position.add(this.velocity);

    // Keep within canvas bounds
    this.position.x = constrain(this.position.x, this.radius, width - this.radius);
    this.position.y = constrain(this.position.y, this.radius, height - this.radius);
  }

  show() {
    fill(0);
    noStroke(0);
    strokeWeight(2);
    circle(this.position.x, this.position.y, this.radius * 2);
  }
}
