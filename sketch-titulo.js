let tituloSketch = (p) => {

  const CONFIG = {
    PARTICLE_COUNT: 900,      
    SCL: 60,                   
    INC: 0.1,
    ZOFF_SPEED: 0.00022,
    FLOW_UPDATE_EVERY: 9,      
    MAX_FPS: 55,
    TRAIL_ALPHA: 22,
    PARTICLE_STROKEWEIGHT: 1.4,
    MAXSPEED: 0.65
  };

  let scl = CONFIG.SCL;
  let inc = CONFIG.INC;
  let cols, rows;
  let zoff = 0;
  let particles = [];
  let flowfield;
  let canvas;
  let flowUpdateCounter = 0;

  p.setup = () => {
    p.frameRate(CONFIG.MAX_FPS);

    canvas = p.createCanvas(p.windowWidth, p.windowHeight);
    canvas.parent("anim-titulo");

    canvas.elt.style.position = "absolute";
    canvas.elt.style.top = "0";
    canvas.elt.style.left = "0";
    canvas.elt.style.zIndex = "-1";
    canvas.elt.style.pointerEvents = "none";

    p.background(28, 35, 26);

    cols = Math.max(2, Math.floor(p.width / scl));
    rows = Math.max(2, Math.floor(p.height / scl));
    flowfield = new Array(cols * rows);

    const targetParticles = CONFIG.PARTICLE_COUNT;
    for (let i = 0; i < targetParticles; i++) {
      particles[i] = new Particle();
    }

    computeFlowfield();

    const container = document.getElementById("anim-titulo");
    if (container && "IntersectionObserver" in window) {
      const io = new IntersectionObserver(
        (entries) => {
          entries.forEach((en) => {
            if (en.isIntersecting) p.loop();
            else p.noLoop();
          });
        },
        { threshold: 0.1 }
      );
      io.observe(container);
    }

    document.addEventListener("visibilitychange", () => {
      if (document.hidden) p.noLoop();
      else p.loop();
    });
  };

  p.draw = () => {
    p.noStroke();
    p.fill(28, 35, 26, CONFIG.TRAIL_ALPHA);
    p.rect(0, 0, p.width, p.height);

    flowUpdateCounter++;
    if (flowUpdateCounter >= CONFIG.FLOW_UPDATE_EVERY) {
      computeFlowfield();
      flowUpdateCounter = 0;
    }

    zoff += CONFIG.ZOFF_SPEED;

    for (let part of particles) {
      part.follow(flowfield);
      part.update();
      part.edges();
      part.show();
    }
  };

  function computeFlowfield() {
    let yoff = 0;
    for (let y = 0; y < rows; y++) {
      let xoff = 0;
      for (let x = 0; x < cols; x++) {
        const index = x + y * cols;
        const angle = p.noise(xoff, yoff, zoff) * p.TWO_PI * 3;
        const v = p5.Vector.fromAngle(angle);
        v.setMag(0.16);
        flowfield[index] = v;
        xoff += inc;
      }
      yoff += inc;
    }
  }

  // ------------------ PARTICULA ------------------
  class Particle {
    constructor() {
      this.pos = p.createVector(p.random(p.width), p.random(p.height));
      this.vel = p.createVector(0, 0);
      this.acc = p.createVector(0, 0);
      this.maxspeed = CONFIG.MAXSPEED;

      const warm1 = p.color(255, 200, 120, 190);
      const warm2 = p.color(255, 180, 110, 150);
      const warm3 = p.color(255, 220, 150, 160);

      const palette = [warm1, warm2, warm3];
      this.g = palette[Math.floor(Math.random() * palette.length)];
    }

    follow(flow) {
      let x = Math.floor(this.pos.x / scl);
      let y = Math.floor(this.pos.y / scl);
      x = p.constrain(x, 0, cols - 1);
      y = p.constrain(y, 0, rows - 1);
      const index = x + y * cols;
      const f = flow[index];
      if (f) this.applyForce(f);
    }

    applyForce(f) {
      this.acc.add(f);
    }

    update() {
      this.vel.add(this.acc);
      this.vel.limit(this.maxspeed);
      this.pos.add(this.vel);
      this.acc.mult(0);
    }

    show() {
      p.stroke(this.g);
      p.strokeWeight(CONFIG.PARTICLE_STROKEWEIGHT);
      p.point(this.pos.x, this.pos.y);
    }

    edges() {
      if (this.pos.x > p.width) this.pos.x = 0;
      if (this.pos.x < 0) this.pos.x = p.width;
      if (this.pos.y > p.height) this.pos.y = 0;
      if (this.pos.y < 0) this.pos.y = p.height;
    }
  }

  p.windowResized = () => {
    p.resizeCanvas(p.windowWidth, p.windowHeight);

    cols = Math.max(2, Math.floor(p.width / scl));
    rows = Math.max(2, Math.floor(p.height / scl));
    flowfield = new Array(cols * rows);

    particles.forEach((part) => {
      part.pos.x = p.constrain(part.pos.x, 0, p.width);
      part.pos.y = p.constrain(part.pos.y, 0, p.height);
    });

    computeFlowfield();
  };
};
