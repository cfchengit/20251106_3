let questionsTable;
let questions = [];
let currentQuestionIndex = 0;
let score = 0;
let quizStarted = false;
let quizEnded = false;
let selectedOption = -1; // -1 for no selection, 0-3 for options
let optionEffectTimer = 0;
let optionEffectDuration = 15; // frames

// Animation variables
let confetti = [];
let canvasWidth;
let canvasHeight;
let encouragementParticles = [];
let fireworks = [];

function preload() { 
  questionsTable = loadTable('questions.csv', 'csv', 'header');
}

function setup() {
  canvasWidth = windowWidth * 0.8;
  canvasHeight = windowHeight * 0.9;
  createCanvas(canvasWidth, canvasHeight);
  centerCanvas();
  background('#f8edeb');
  parseQuestions(questionsTable);
  textAlign(CENTER, CENTER);
  textSize(canvasWidth / 30);
}

function windowResized() {
  canvasWidth = windowWidth * 0.8;
  canvasHeight = windowHeight * 0.9;
  resizeCanvas(canvasWidth, canvasHeight);
  centerCanvas();
  background('#f8edeb');
  textSize(canvasWidth / 30);
}
function draw() {
  background('#f8edeb'); // 將背景顏色設定為 #f8edeb

  if (!quizStarted) {
    drawStartScreen();
  } else if (!quizEnded) {
    drawQuestion(); 
    drawCursorEffect();
  } else {
    drawEndScreen();
    drawEndAnimation();
  }
}

function mousePressed() {
  if (!quizStarted) {
    if (mouseX > width / 2 - 100 && mouseX < width / 2 + 100 &&
        mouseY > height / 2 - 25 && mouseY < height / 2 + 25) {
      quizStarted = true;
    }
  } else if (!quizEnded) {
    let optionYStart = height / 2 + 50;
    for (let i = 0; i < 4; i++) {
      let optionY = optionYStart + i * 60;
      if (mouseX > width / 2 - 150 && mouseX < width / 2 + 150 &&
          mouseY > optionY - 20 && mouseY < optionY + 20) {
        selectedOption = i;
        optionEffectTimer = optionEffectDuration; // Start option effect
        setTimeout(() => {
          checkAnswer();
          nextQuestion();
        }, 500); // Small delay for effect
        break;
      }
    }
  }
}

function parseQuestions(table) {
  for (let r = 0; r < table.getRowCount(); r++) {
    let row = table.getRow(r);
    questions.push({
      question: row.getString(0),
      options: [
        row.getString(1),
        row.getString(2),
        row.getString(3),
        row.getString(4)
      ],
      correctAnswer: parseInt(row.getString(5)) // CSV stores as string, convert to int
    });
  }
}

function drawStartScreen() {
  fill('#450920'); // 將文字顏色設定為 #450920
  textSize(32); //設定標題的文字大小
  text('Welcome to the Quiz!', width / 2, height / 2 - 50);

  // Start Button
  fill(50, 200, 50);  // 綠色按鈕
  rect(width / 2 - 100, height / 2 - 25, 200, 50, 10); // 圓角矩形按鈕
  fill('#450920'); // 將文字顏色設定為 #450920
  textSize(24);  //設定按鈕文字的大小
  text('Start Quiz', width / 2, height / 2); // 文字
}

function drawQuestion() {
  let q = questions[currentQuestionIndex]; // 取得當前問題
  fill('#450920'); // 將文字顏色設定為 #450920
  text(q.question, width / 2, height / 2 - 100);

  let optionYStart = height / 2 + 50;
  for (let i = 0; i < q.options.length; i++) {
    let optionY = optionYStart + i * 60;
    let isSelected = (selectedOption === i && optionEffectTimer > 0);

    if (isSelected) {
      fill(100, 100, 255, map(optionEffectTimer, 0, optionEffectDuration, 0, 200)); // Fading effect
    } else {
      fill(200);
    }
    rect(width / 2 - 150, optionY - 20, 300, 40, 5); 
    fill('#450920'); // 將文字顏色設定為 #450920
    text(q.options[i], width / 2, optionY);
  }

  if (optionEffectTimer > 0) {
    optionEffectTimer--;
  }
}

function checkAnswer() {
  let q = questions[currentQuestionIndex];
  if (selectedOption === q.correctAnswer) {
    score++;
  }
}

function nextQuestion() {
  selectedOption = -1; // Reset selection
  currentQuestionIndex++;
  if (currentQuestionIndex >= questions.length) {
    quizEnded = true;
  }
}

function drawEndScreen() {
  fill('#450920'); // 將文字顏色設定為 #450920
  textSize(32);
  text('Quiz Ended!', width / 2, height / 2 - 100);
  text(`Your Score: ${score} / ${questions.length}`, width / 2, height / 2);
}

function centerCanvas() {
  let x = (windowWidth - width) / 2;
  let y = (windowHeight - height) / 2;
  select('canvas').position(x, y);
}

function drawCursorEffect() {
  noFill();
  stroke(255, 200, 0, 150);
  strokeWeight(2);
  ellipse(mouseX, mouseY, 30, 30);
  stroke(255, 200, 0, 50);
  ellipse(mouseX, mouseY, 50, 50);
}

function drawEndAnimation() {
  let passRate = score / questions.length;

  if (passRate === 1) { // Perfect score: fireworks animation
    if (frameCount % 30 === 0) { // Launch a new firework every 30 frames
      fireworks.push(new Firework());
    }
    for (let i = fireworks.length - 1; i >= 0; i--) {
      fireworks[i].update();
      fireworks[i].display();
      if (fireworks[i].isFinished()) {
        fireworks.splice(i, 1);
      }
    }
  }
  else if (passRate >= 0.7) { // High score: praise animation (confetti)
    for (let i = 0; i < 5; i++) {
      confetti.push(new Confetti());
    }
    for (let i = confetti.length - 1; i >= 0; i--) {
      confetti[i].update();
      confetti[i].display();
      if (confetti[i].isFinished()) {
        confetti.splice(i, 1);
      }
    }
  } else { // Low score: encouragement animation (floating particles)
    for (let i = 0; i < 2; i++) {
      encouragementParticles.push(new Particle());
    }
    for (let i = encouragementParticles.length - 1; i >= 0; i--) {
      encouragementParticles[i].update();
      encouragementParticles[i].display();
      if (encouragementParticles[i].isFinished()) {
        encouragementParticles.splice(i, 1);
      }
    }
  }
}

// Confetti Class
class Confetti {
  constructor() {
    this.pos = createVector(random(width), -10);
    this.vel = createVector(0, random(5, 10));
    this.acc = createVector(0, 0.1);
    this.color = color(random(255), random(255), random(255));
    this.size = random(10, 20);
    this.lifespan = 255;
  }

  update() {
    this.vel.add(this.acc);
    this.pos.add(this.vel);
    this.lifespan -= 5;
  }

  display() {
    noStroke();
    fill(this.color, this.lifespan);
    rect(this.pos.x, this.pos.y, this.size, this.size);
  }

  isFinished() {
    return this.lifespan < 0 || this.pos.y > height + 20;
  }
}

// Particle Class for encouragement
class Particle {
  constructor() {
    this.pos = createVector(random(width), random(height));
    this.vel = createVector(random(-0.5, 0.5), random(-0.5, 0.5));
    this.color = color(0, 150, 255, 150);
    this.size = random(5, 15);
    this.lifespan = 255;
  }

  update() {
    this.pos.add(this.vel);
    this.lifespan -= 1;
  }

  display() {
    noStroke();
    fill(this.color, this.lifespan);
    ellipse(this.pos.x, this.pos.y, this.size);
  }

  isFinished() {
    return this.lifespan < 0;
  }
}

// FireworkParticle Class (for explosion effect)
class FireworkParticle {
  constructor(x, y, col) {
    this.pos = createVector(x, y); // 初始位置
    this.vel = p5.Vector.random2D(); // 隨機初始方向
    this.vel.mult(random(2, 12)); // 隨機初始速度
    this.acc = createVector(0, 0.15); // 重力
    this.color = col; // 初始顏色
    this.lifespan = 255; // 生命週期
    this.size = random(2, 6); // 大小
    this.originalHue = hue(this.color); // 儲存原始色相
  }

  update() {
    // 讓顏色隨著時間變化，創造漸層感
    colorMode(HSB, 360, 100, 100);
    let currentBrightness = brightness(this.color);
    this.color = color(this.originalHue, saturation(this.color), currentBrightness - 0.5);
    colorMode(RGB); // 恢復預設的 RGB 模式

    this.vel.add(this.acc);
    this.pos.add(this.vel);
    this.lifespan -= 5; // Particles fade out
  }

  display() {
    noStroke();
    fill(this.color, this.lifespan);
    ellipse(this.pos.x, this.pos.y, this.size);
  }

  isFinished() {
    return this.lifespan < 0;
  }
}

// Firework Class (for perfect score)
class Firework {
  constructor() {
    this.pos = createVector(random(width), height);
    this.vel = createVector(0, random(-10, -15));
    this.acc = createVector(0, 0);
    this.particles = [];
    this.exploded = false;
  }

  applyForce(force) {
    this.acc.add(force);
  }

  update() {
    if (!this.exploded) {
      this.applyForce(createVector(0, 0.2)); // Gravity
      this.vel.add(this.acc);
      this.pos.add(this.vel);
      this.acc.mult(0);

      if (this.vel.y >= 0) {
        this.exploded = true;
        this.explode();
      }
    }

    for (let i = this.particles.length - 1; i >= 0; i--) {
      this.particles[i].update();
      if (this.particles[i].isFinished()) {
        this.particles.splice(i, 1);
      }
    }
  }

  explode() {
    const baseHue = random(360); // 為這次爆炸選擇一個基礎色相

    for (let i = 0; i < 100; i++) {
      colorMode(HSB, 360, 100, 100); // 切換到 HSB 模式以創造鮮豔色彩
      // 圍繞基礎色相、飽和度和亮度做些微變化
      const particleHue = (baseHue + random(-20, 20) + 360) % 360;
      const particleSaturation = random(80, 100);
      const particleBrightness = random(90, 100);
      const particleColor = color(particleHue, particleSaturation, particleBrightness);
      let p = new FireworkParticle(this.pos.x, this.pos.y, particleColor);
      this.particles.push(p);
    }
  }

  display() {
    if (!this.exploded) {
      strokeWeight(4);
      stroke(255, 255, 0);
      point(this.pos.x, this.pos.y);
    }

    for (let p of this.particles) {
      p.display();
    }
  }

  isFinished() {
    return this.exploded && this.particles.length === 0;
  }
}
