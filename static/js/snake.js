const canvas = document.getElementById("board");
const ctx = canvas.getContext("2d");
const scoreEl = document.getElementById("score");
const bestEl = document.getElementById("best");
const restartBtn = document.getElementById("restart");
const touchButtons = document.querySelectorAll("[data-dir]");

const gridSize = 20;
const tileCount = canvas.width / gridSize;
const tickMs = 300;

let snake;
let food;
let direction;
let nextDirection;
let score;
let bestScore = Number(localStorage.getItem("snakeBestScore") || 0);
let gameTimer;
let isGameOver;

bestEl.textContent = bestScore;

function startGame() {
  snake = [
    { x: 10, y: 10 },
    { x: 9, y: 10 },
    { x: 8, y: 10 },
  ];
  direction = { x: 1, y: 0 };
  nextDirection = { x: 1, y: 0 };
  score = 0;
  isGameOver = false;
  scoreEl.textContent = score;
  placeFood();
  clearInterval(gameTimer);
  gameTimer = setInterval(gameLoop, tickMs);
  draw();
}

function gameLoop() {
  direction = nextDirection;

  const head = {
    x: snake[0].x + direction.x,
    y: snake[0].y + direction.y,
  };

  if (hitWall(head) || hitSnake(head)) {
    endGame();
    return;
  }

  snake.unshift(head);

  if (head.x === food.x && head.y === food.y) {
    score += 10;
    scoreEl.textContent = score;
    if (score > bestScore) {
      bestScore = score;
      bestEl.textContent = bestScore;
      localStorage.setItem("snakeBestScore", bestScore);
    }
    placeFood();
  } else {
    snake.pop();
  }

  draw();
}

function draw() {
  ctx.fillStyle = "#0b1020";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  drawGrid();

  ctx.fillStyle = "#ef4444";
  roundedTile(food.x, food.y, 7);

  snake.forEach((part, index) => {
    ctx.fillStyle = index === 0 ? "#22c55e" : "#84cc16";
    roundedTile(part.x, part.y, index === 0 ? 6 : 5);
  });

  if (isGameOver) {
    ctx.fillStyle = "rgb(0 0 0 / 62%)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#ffffff";
    ctx.font = "700 38px Arial";
    ctx.textAlign = "center";
    ctx.fillText("Game Over", canvas.width / 2, canvas.height / 2 - 14);
    ctx.font = "18px Arial";
    ctx.fillText("Press Restart or Space", canvas.width / 2, canvas.height / 2 + 24);
  }
}

function drawGrid() {
  ctx.strokeStyle = "rgb(255 255 255 / 5%)";
  ctx.lineWidth = 1;

  for (let i = gridSize; i < canvas.width; i += gridSize) {
    ctx.beginPath();
    ctx.moveTo(i, 0);
    ctx.lineTo(i, canvas.height);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(0, i);
    ctx.lineTo(canvas.width, i);
    ctx.stroke();
  }
}

function roundedTile(x, y, radius) {
  const padding = 2;
  const left = x * gridSize + padding;
  const top = y * gridSize + padding;
  const size = gridSize - padding * 2;

  ctx.beginPath();
  ctx.roundRect(left, top, size, size, radius);
  ctx.fill();
}

function placeFood() {
  do {
    food = {
      x: Math.floor(Math.random() * tileCount),
      y: Math.floor(Math.random() * tileCount),
    };
  } while (snake.some((part) => part.x === food.x && part.y === food.y));
}

function setDirection(newDirection) {
  const directions = {
    up: { x: 0, y: -1 },
    down: { x: 0, y: 1 },
    left: { x: -1, y: 0 },
    right: { x: 1, y: 0 },
  };

  const wanted = directions[newDirection];
  if (!wanted) return;

  const isReverse = wanted.x + direction.x === 0 && wanted.y + direction.y === 0;
  if (!isReverse) {
    nextDirection = wanted;
  }
}

function hitWall(position) {
  return (
    position.x < 0 ||
    position.x >= tileCount ||
    position.y < 0 ||
    position.y >= tileCount
  );
}

function hitSnake(position) {
  return snake.some((part) => part.x === position.x && part.y === position.y);
}

function endGame() {
  clearInterval(gameTimer);
  isGameOver = true;
  draw();
}

document.addEventListener("keydown", (event) => {
  const keys = {
    ArrowUp: "up",
    w: "up",
    W: "up",
    ArrowDown: "down",
    s: "down",
    S: "down",
    ArrowLeft: "left",
    a: "left",
    A: "left",
    ArrowRight: "right",
    d: "right",
    D: "right",
  };

  if (event.code === "Space" && isGameOver) {
    startGame();
    return;
  }

  if (keys[event.key]) {
    event.preventDefault();
    setDirection(keys[event.key]);
  }
});

restartBtn.addEventListener("click", startGame);

touchButtons.forEach((button) => {
  button.addEventListener("click", () => setDirection(button.dataset.dir));
});

startGame();
