// Canvas setup

const canvas = document.querySelector("#main-canvas");
const ctx = canvas.getContext("2d");
const pixelRatio = window.devicePixelRatio;
ctx.imageSmoothingQuality = "high";
ctx.canvas.width = canvas.clientWidth * pixelRatio;
ctx.canvas.height = canvas.clientHeight * pixelRatio;
ctx.setTransform(1, 0, 0, 1, 0, 0);
ctx.scale(pixelRatio, pixelRatio);

// State

const screenW = ctx.canvas.width;
const screenH = ctx.canvas.height;
const canvasW = screenW / pixelRatio;
const canvasH = screenH / pixelRatio;
const centerX = canvasW / 2;
const centerY = canvasH / 2;
const treeWidth = 50;
const treeHeight = 200;
const levelScore = 5;
const maxLeaves = 1000;
const leavesScore = 500;
const colors = {
  1: ["darkgreen"],
  2: [
    "#00ff00",
    "#00cc00",
    "#00aa00",
    "#009900",
    "#33ff33",
    "#33ff00",
    "#00ff33",
  ],
};

let touchDown = false;
let numLeaves = 10;
let leaves = [];
let touchStart = -1;

let levelType = "time";
let level = 1;

let score = 0;

const startHandler = (clientY) => {
  touchStart = clientY;
  touchDown = true;
  scoreHandler();
};

const moveHandler = (clientY) => {
  if (touchDown) {
    const factor = level < 2 ? 0.05 : 0.1;
    if (clientY < touchStart && leaves.length < maxLeaves) {
      numLeaves = numLeaves + numLeaves * factor;
    } else {
      numLeaves = numLeaves - numLeaves * factor;
    }
    leaves = [];
    calculateLeaves();
  }
};

const stopHandler = () => {
  touchDown = false;
};

const nextLevel = () => {
  touchDown = false;
  score = 0;
  level += 1;
  levelType = rand(0, 10) % 2 === 0 ? "time" : "size";
};

let timer;
const scoreHandler = () => {
  clearTimeout(timer);

  timer = setTimeout(() => {
    if (touchDown) {
      if (score >= levelScore) {
        nextLevel();
        return;
      }

      if (levelType === "time") {
        score += 1;
      } else if (leaves.length >= leavesScore) {
        score += 1;
        leaves = [];
      }
      scoreHandler();
    }
  }, 1000);
};

// Events
document.addEventListener("mousedown", (event) => {
  startHandler(event.clientY);
  event.preventDefault();
  event.stopPropagation();
});
document.addEventListener("mousemove", (event) => {
  moveHandler(event.clientY);
  event.preventDefault();
  event.stopPropagation();
});
document.addEventListener("mouseup", (event) => {
  stopHandler();
  event.preventDefault();
  event.stopPropagation();
});

document.addEventListener("touchstart", (event) => {
  startHandler(event.touches[0].clientY);
  event.preventDefault();
  event.stopPropagation();
});
document.addEventListener("touchmove", (event) => {
  moveHandler(event.touches[0].clientY);
  event.preventDefault();
  event.stopPropagation();
});
document.addEventListener("touchend", (event) => {
  stopHandler();
  event.preventDefault();
  event.stopPropagation();
});

// Drawing

// Draw the trunk
const drawTrunk = () => {
  ctx.fillStyle = "brown";
  ctx.fillRect(
    centerX - treeWidth / 2,
    canvasH - treeHeight,
    treeWidth,
    treeHeight
  );
};

const rand = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

const calculateLeaves = () => {
  const leavesDiameter = (canvasW / 4) * 3;
  const startX = canvasW - leavesDiameter;
  const endX = leavesDiameter;
  const startY = canvasH - treeHeight - leavesDiameter;
  const endY = canvasH - treeHeight;

  for (let i = 0; i < numLeaves; i++) {
    const x = rand(startX, endX);
    const y = rand(startY, endY);
    const radius = rand(10, 30);
    let color;

    if (colors[level]) {
      if (colors[level].length === 1) {
        color = colors[level][0];
      } else {
        color = colors[level][rand(0, colors[level].length - 1)];
      }
    } else {
      color = `rgb(${rand(0, 100)},${rand(150, 255)},${rand(0, 100)})`;
    }

    leaves.push({ x, y, radius, color });
  }
};

calculateLeaves();

// Draw the leaves
const drawLeaves = () => {
  leaves.forEach((leaf) => {
    ctx.fillStyle = leaf.color;
    ctx.beginPath();
    ctx.arc(leaf.x, leaf.y, leaf.radius, 0, Math.PI * 2);
    ctx.fill();
  });
};

// Draw the tree
const drawTree = () => {
  drawTrunk();
  drawLeaves();
};

const scoreRef = document.querySelector("#score");
const setupScore = () => {
  if (parseInt(score) !== parseInt(scoreRef.innerHTML)) {
    scoreRef.innerHTML = score;
  }
};

const levelRef = document.querySelector("#level");
const setupLevel = () => {
  if (parseInt(level) !== parseInt(levelRef.innerHTML)) {
    levelRef.innerHTML = level;
  }
};

// Loop
const loop = () => {
  ctx.clearRect(0, 0, screenW, screenH);

  // Background

  ctx.fillStyle = "#99ff99";
  ctx.fillRect(0, 0, screenW, screenH);

  drawTree();
  setupScore();
  setupLevel();

  requestAnimationFrame(loop);
};

loop();
