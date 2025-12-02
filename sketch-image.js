let animAntesSketch = function (p) {

  let stars = [];
  let meltAmount = 0;

  let startMeltFrame = 80;
  let meltSpeed = 1.4;
  let fadeSpeed = 1.1;

  let loopDuration = 420;

  let frame = 0;

  p.setup = function () {
    iniciarAnimacion();
  };

  function iniciarAnimacion() {
    stars = [];
    meltAmount = 0;
    frame = 0;
    crearEstrellas();
  }

  function crearEstrellas() {
    p.createCanvas(p.windowWidth, p.windowHeight);
    p.angleMode(p.DEGREES);
    p.noFill();

    const colors = [
      [200, 220, 255],
      [255, 230, 150],
      [255, 255, 255],
    ];

    const w = p.width;
    const h = p.height;

    stars.push(new Moon(w * 0.78, h * 0.22, Math.min(w, h) * 0.18));

    const positions = [
      [0.18, 0.35], [0.32, 0.50], [0.48, 0.33],
      [0.62, 0.48], [0.80, 0.38], [0.22, 0.68],
      [0.40, 0.78], [0.58, 0.70], [0.75, 0.65]
    ];

    const microPos = [
      [0.26, 0.42], [0.55, 0.28], [0.70, 0.50],
      [0.38, 0.62], [0.63, 0.76], [0.50, 0.58]
    ];

    const minDim = Math.min(w, h);

    for (let i = 0; i < positions.length; i++) {
      let sz = minDim * p.map(i, 0, positions.length, 0.06, 0.12);
      stars.push(new MandalaStar(w * positions[i][0], h * positions[i][1], sz, colors[i % colors.length]));
    }

    for (let i = 0; i < microPos.length; i++) {
      let sz = minDim * p.map(i, 0, microPos.length, 0.02, 0.035);
      stars.push(new MandalaStar(w * microPos[i][0], h * microPos[i][1], sz, colors[(i + 1) % colors.length]));
    }
  }

  p.draw = function () {
    frame++;
    p.background(5, 10, 25);

    if (frame > startMeltFrame) meltAmount += meltSpeed;

    for (let s of stars) s.show(frame, meltAmount);

    if (frame > loopDuration) iniciarAnimacion();
  };

  /* -------- LUNA -------- */
  class Moon {
    constructor(x, y, sz) {
      this.x = x;
      this.y = y;
      this.sz = sz;
      this.alpha = 255;
    }

    show() {
      this.alpha -= fadeSpeed * 0.5;

      p.push();
      p.translate(this.x, this.y);
      p.noStroke();

      for (let r = this.sz; r > 0; r -= 4) {
        p.fill(255, 230, 170, (r / this.sz) * this.alpha);
        p.circle(0, 0, r);
      }
      p.pop();
    }
  }

  /* -------- MANDALA ESTRELLA -------- */
  class MandalaStar {
    constructor(x, y, sz, col) {
      this.x = x;
      this.y = y;
      this.sz = sz;
      this.col = col;
      this.alpha = 255;

      this.layers = [];
      this.layerCount = 10;

      for (let i = 0; i < this.layerCount; i++) {
        this.layers.push({
          radius: p.map(i, 0, this.layerCount, sz, 6)
        });
      }
    }

    show(frame, meltAmount) {
      this.alpha -= fadeSpeed;

      p.push();
      p.translate(this.x, this.y);

      p.strokeWeight(1);

      for (let layer of this.layers) {
        p.stroke(this.col[0], this.col[1], this.col[2], this.alpha);
        let r0 = layer.radius;

        p.beginShape();
        for (let a = 0; a < 360; a += 4) {

          let melt =
            p.noise(a * 0.05, frame * 0.01) * meltAmount * 2.2 +
            p.sin(a * 3) * meltAmount * 0.15;

          let r = r0 + p.sin(a * 10) * 6;

          let px = r * p.cos(a);
          let py = r * p.sin(a) + melt;

          p.vertex(px, py);
        }
        p.endShape(p.CLOSE);
      }

      p.pop();
    }
  }
};

new p5(animAntesSketch, "anim-antes");
