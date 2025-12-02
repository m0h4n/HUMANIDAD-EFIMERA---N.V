let animFinalSketch = (p) => {

  let mandalaPoints = [];
  let particles = [];
  let phase = 1;  
  let drawnPoints = 0;
  let sym = 12;

  p.setup = () => {
    let canvas = p.createCanvas(p.windowWidth, p.windowHeight);
    canvas.parent("anim-final");
    p.angleMode(p.DEGREES);
    p.noFill();

    generateMandala();
    createExplosion();
  };

  p.draw = () => {
    p.background(5, 10, 25);
    p.translate(p.width / 2, p.height / 2);

    if (phase === 0) drawMandala();
    else if (phase === 1) updateExplosion();
    else if (phase === 2) reformParticles();
  };

  function generateMandala() {
    mandalaPoints = [];

    let layers = p.int(p.random(6, 12));
    let maxR = p.min(p.width, p.height) * 0.45;

    for (let l = 0; l < layers; l++) {
      let r = p.map(l, 0, layers - 1, 30, maxR);

      let waveAmp = p.random(20, 80);
      let waveFreq = p.random(2, 10);

      for (let a = 0; a < 360; a += 1.2) {
        let offset = p.sin(a * waveFreq) * waveAmp;
        let x = (r + offset) * p.cos(a);
        let y = (r + offset) * p.sin(a);

        mandalaPoints.push(p.createVector(x, y));
      }
    }

    drawnPoints = 0;
  }

  function drawMandala() {
    p.push();
    p.rotate(p.frameCount * 0.3); 

    p.stroke(255, 215, 130); 
    p.strokeWeight(1.6);

    drawnPoints += 25; 
    if (drawnPoints > mandalaPoints.length)
      drawnPoints = mandalaPoints.length;

    for (let i = 0; i < drawnPoints; i++) {
      let pt = mandalaPoints[i];

      for (let s = 0; s < sym; s++) {
        p.push();
        p.rotate((360 / sym) * s);
        p.point(pt.x, pt.y);
        p.pop();
      }
    }

    p.pop();

    if (drawnPoints >= mandalaPoints.length) {
      createExplosion();
      phase = 1;
    }
  }

  function createExplosion() {
    particles = [];

    for (let pt of mandalaPoints) {
      for (let s = 0; s < sym; s++) {
        let rotated = pt.copy().rotate(s * (360 / sym));

        particles.push({
          pos: rotated.copy(),
          vel: p5.Vector.random2D().mult(p.random(4, 18)), 
          target: null
        });
      }
    }
  }

  function updateExplosion() {
    p.noStroke();
    p.fill(255, 215, 130); 

    for (let pt of particles) {
      pt.pos.add(pt.vel);
      pt.vel.mult(0.90); 
      p.circle(pt.pos.x, pt.pos.y, 2.5);
    }

    if (p.frameCount % 40 === 0) {
      generateMandala();
      assignTargets();
      phase = 2;
    }
  }

  function assignTargets() {
    let targets = [];

    for (let pt of mandalaPoints) {
      for (let s = 0; s < sym; s++) {
        let rotated = pt.copy().rotate(s * (360 / sym));
        targets.push(rotated);
      }
    }

    particles.forEach((pt, i) => {
      pt.target = targets[i % targets.length].copy();
    });
  }

  function reformParticles() {
    p.noStroke();
    p.fill(255, 215, 130);

    let allClose = true;

    for (let pt of particles) {
      let dir = p5.Vector.sub(pt.target, pt.pos).mult(0.16); 
      pt.pos.add(dir);

      if (dir.mag() > 1) allClose = false;

      p.circle(pt.pos.x, pt.pos.y, 2.4);
    }

    if (allClose) {
      drawnPoints = 0;
      phase = 0;
    }
  }

  p.windowResized = () => {
    p.resizeCanvas(p.windowWidth, p.windowHeight);
    generateMandala();
  };
};

new p5(animFinalSketch, "anim-final");
