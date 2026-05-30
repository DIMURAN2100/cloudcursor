const GRID = 20;
const CELL = 24;
const CANVAS_SIZE = GRID * CELL;
const GAME_SECONDS = 60;
const TARGET_FRUITS = 30;
const INITIAL_INTERVAL = 110;
const MIN_INTERVAL = 55;
const SPEEDUP = 2;

const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");
const timerEl = document.getElementById("timer");
const scoreEl = document.getElementById("score");
const targetEl = document.getElementById("target");
const statusEl = document.getElementById("status");
const overlayEl = document.getElementById("overlay");
const overlayTitleEl = document.getElementById("overlay-title");
const overlayMessageEl = document.getElementById("overlay-message");
const btnStart = document.getElementById("btn-start");
const btnPause = document.getElementById("btn-pause");
const btnReset = document.getElementById("btn-reset");
const btnOverlay = document.getElementById("btn-overlay");

targetEl.textContent = String(TARGET_FRUITS);

const DIRS = {
  ArrowUp: { x: 0, y: -1 },
  ArrowDown: { x: 0, y: 1 },
  ArrowLeft: { x: -1, y: 0 },
  ArrowRight: { x: 1, y: 0 },
  w: { x: 0, y: -1 },
  s: { x: 0, y: 1 },
  a: { x: -1, y: 0 },
  d: { x: 1, y: 0 },
};

let snake;
let direction;
let nextDirection;
let fruit;
let score;
let timeLeft;
let tickInterval;
let timerId;
let running;
let paused;
let gameOver;
let lastTick = 0;
let touchStart = null;

function resetState() {
  const mid = Math.floor(GRID / 2);
  snake = [
    { x: mid, y: mid },
    { x: mid - 1, y: mid },
    { x: mid - 2, y: mid },
  ];
  direction = { x: 1, y: 0 };
  nextDirection = { ...direction };
  score = 0;
  timeLeft = GAME_SECONDS;
  tickInterval = INITIAL_INTERVAL;
  running = false;
  paused = false;
  gameOver = false;
  fruit = spawnFruit();
  updateHud();
  setStatus("按「开始游戏」或空格键启动", "");
  hideOverlay();
  btnPause.disabled = true;
  btnPause.textContent = "暂停";
  draw();
}

function spawnFruit() {
  const occupied = new Set(snake.map((s) => `${s.x},${s.y}`));
  const free = [];
  for (let y = 0; y < GRID; y++) {
    for (let x = 0; x < GRID; x++) {
      if (!occupied.has(`${x},${y}`)) free.push({ x, y });
    }
  }
  if (free.length === 0) return null;
  return free[Math.floor(Math.random() * free.length)];
}

function formatTime(seconds) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

function updateHud() {
  scoreEl.textContent = String(score);
  timerEl.textContent = formatTime(timeLeft);
  timerEl.classList.toggle("urgent", timeLeft <= 10 && running && !gameOver);
}

function setStatus(text, kind = "") {
  statusEl.textContent = text;
  statusEl.className = "status-bar";
  if (kind) statusEl.classList.add(kind);
}

function showOverlay(title, message) {
  overlayTitleEl.textContent = title;
  overlayMessageEl.textContent = message;
  overlayEl.classList.remove("hidden");
}

function hideOverlay() {
  overlayEl.classList.add("hidden");
}

function drawCell(x, y, color, radius = 4) {
  const px = x * CELL;
  const py = y * CELL;
  const pad = 1;
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.roundRect(px + pad, py + pad, CELL - pad * 2, CELL - pad * 2, radius);
  ctx.fill();
}

function drawGrid() {
  ctx.strokeStyle = "rgba(255,255,255,0.03)";
  ctx.lineWidth = 1;
  for (let i = 0; i <= GRID; i++) {
    ctx.beginPath();
    ctx.moveTo(i * CELL, 0);
    ctx.lineTo(i * CELL, CANVAS_SIZE);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(0, i * CELL);
    ctx.lineTo(CANVAS_SIZE, i * CELL);
    ctx.stroke();
  }
}

function drawFruit() {
  if (!fruit) return;
  const cx = fruit.x * CELL + CELL / 2;
  const cy = fruit.y * CELL + CELL / 2;
  const r = CELL * 0.32;
  ctx.fillStyle = "#ff7043";
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#558b2f";
  ctx.beginPath();
  ctx.ellipse(cx + 2, cy - r - 1, 3, 6, 0.4, 0, Math.PI * 2);
  ctx.fill();
}

function drawSnake() {
  snake.forEach((seg, i) => {
    const isHead = i === 0;
    drawCell(seg.x, seg.y, isHead ? "#a5d6a7" : "#43a047", isHead ? 7 : 5);
    if (isHead) {
      const eyeOffset = 4;
      const ex = seg.x * CELL + CELL / 2;
      const ey = seg.y * CELL + CELL / 2;
      const dx = direction.x;
      const dy = direction.y;
      ctx.fillStyle = "#1b5e20";
      const e1x = ex + (dy !== 0 ? -eyeOffset : dx * eyeOffset);
      const e1y = ey + (dx !== 0 ? -eyeOffset : dy * eyeOffset);
      const e2x = ex + (dy !== 0 ? eyeOffset : dx * eyeOffset);
      const e2y = ey + (dx !== 0 ? eyeOffset : dy * eyeOffset);
      ctx.beginPath();
      ctx.arc(e1x, e1y, 2.2, 0, Math.PI * 2);
      ctx.arc(e2x, e2y, 2.2, 0, Math.PI * 2);
      ctx.fill();
    }
  });
}

function draw() {
  ctx.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);
  drawGrid();
  drawFruit();
  drawSnake();
}

function opposite(a, b) {
  return a.x === -b.x && a.y === -b.y;
}

function setDirection(dir) {
  if (!dir || gameOver) return;
  if (opposite(dir, direction)) return;
  nextDirection = dir;
}

function step() {
  if (!running || paused || gameOver) return;

  direction = nextDirection;
  const head = snake[0];
  const newHead = { x: head.x + direction.x, y: head.y + direction.y };

  if (newHead.x < 0 || newHead.x >= GRID || newHead.y < 0 || newHead.y >= GRID) {
    endGame(false, "撞墙了！");
    return;
  }

  if (snake.some((s) => s.x === newHead.x && s.y === newHead.y)) {
    endGame(false, "咬到自己了！");
    return;
  }

  snake.unshift(newHead);

  if (fruit && newHead.x === fruit.x && newHead.y === fruit.y) {
    score += 1;
    tickInterval = Math.max(MIN_INTERVAL, tickInterval - SPEEDUP);
    updateHud();

    if (score >= TARGET_FRUITS) {
      endGame(true, `太棒了！你在 ${formatTime(GAME_SECONDS - timeLeft)} 内吃掉了 ${score} 个果子！`);
      return;
    }

    fruit = spawnFruit();
    if (!fruit) {
      endGame(true, "棋盘已满，你吃光了所有果子！");
      return;
    }
    setStatus(`已吃 ${score} 个，还差 ${TARGET_FRUITS - score} 个！`, "");
  } else {
    snake.pop();
  }

  draw();
}

function tick(now) {
  if (!running || paused || gameOver) return;
  if (now - lastTick >= tickInterval) {
    lastTick = now;
    step();
  }
  requestAnimationFrame(tick);
}

function startTimer() {
  clearInterval(timerId);
  timerId = setInterval(() => {
    if (!running || paused || gameOver) return;
    timeLeft -= 1;
    updateHud();
    if (timeLeft <= 0) {
      if (score >= TARGET_FRUITS) {
        endGame(true, `时间到！你成功吃掉了 ${score} 个果子！`);
      } else {
        endGame(false, `时间到！你吃了 ${score} 个果子，目标是 ${TARGET_FRUITS} 个。`);
      }
    }
  }, 1000);
}

function startGame() {
  if (gameOver) resetState();
  if (running && !paused) return;

  if (paused) {
    paused = false;
    btnPause.textContent = "暂停";
    setStatus("加油！继续吃果子！", "");
    lastTick = performance.now();
    requestAnimationFrame(tick);
    return;
  }

  running = true;
  paused = false;
  btnPause.disabled = false;
  btnStart.disabled = true;
  setStatus("游戏进行中 — 快吃果子！", "");
  lastTick = performance.now();
  startTimer();
  requestAnimationFrame(tick);
}

function pauseGame() {
  if (!running || gameOver) return;
  paused = !paused;
  btnPause.textContent = paused ? "继续" : "暂停";
  setStatus(paused ? "已暂停" : "加油！继续吃果子！", paused ? "" : "");
  if (!paused) {
    lastTick = performance.now();
    requestAnimationFrame(tick);
  }
}

function endGame(won, message) {
  gameOver = true;
  running = false;
  paused = false;
  clearInterval(timerId);
  btnStart.disabled = false;
  btnPause.disabled = true;
  btnPause.textContent = "暂停";
  updateHud();
  setStatus(message, won ? "win" : "danger");
  showOverlay(won ? "胜利！" : "挑战失败", message);
}

document.addEventListener("keydown", (e) => {
  const key = e.key.length === 1 ? e.key.toLowerCase() : e.key;
  if (key === " " || key === "Spacebar") {
    e.preventDefault();
    if (!running || paused) startGame();
    return;
  }
  if (DIRS[key]) {
    e.preventDefault();
    setDirection(DIRS[key]);
    if (!running && !gameOver) startGame();
  }
});

canvas.addEventListener(
  "touchstart",
  (e) => {
    const t = e.changedTouches[0];
    touchStart = { x: t.clientX, y: t.clientY };
  },
  { passive: true }
);

canvas.addEventListener(
  "touchend",
  (e) => {
    if (!touchStart) return;
    const t = e.changedTouches[0];
    const dx = t.clientX - touchStart.x;
    const dy = t.clientY - touchStart.y;
    touchStart = null;
    if (Math.abs(dx) < 12 && Math.abs(dy) < 12) return;
    if (Math.abs(dx) > Math.abs(dy)) {
      setDirection(dx > 0 ? DIRS.ArrowRight : DIRS.ArrowLeft);
    } else {
      setDirection(dy > 0 ? DIRS.ArrowDown : DIRS.ArrowUp);
    }
    if (!running && !gameOver) startGame();
  },
  { passive: true }
);

btnStart.addEventListener("click", startGame);
btnPause.addEventListener("click", pauseGame);
btnReset.addEventListener("click", resetState);
btnOverlay.addEventListener("click", () => {
  resetState();
  startGame();
});

resetState();
