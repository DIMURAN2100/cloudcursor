/**
 * 中国象棋本地双人对弈
 * 坐标：file 0–8（左→右），rank 0–9（上→下）；rank 0 为黑方底线，rank 9 为红方底线。
 */

const FILES = 9;
const RANKS = 10;

const LABELS = {
  red: {
    king: "帅",
    advisor: "仕",
    elephant: "相",
    rook: "俥",
    knight: "傌",
    cannon: "炮",
    pawn: "兵",
  },
  black: {
    king: "将",
    advisor: "士",
    elephant: "象",
    rook: "車",
    knight: "馬",
    cannon: "砲",
    pawn: "卒",
  },
};

function cloneBoard(board) {
  return board.map((row) => row.map((c) => (c ? { ...c } : null)));
}

function initialBoard() {
  const b = Array.from({ length: RANKS }, () => Array(FILES).fill(null));
  const line = [
    "rook",
    "knight",
    "elephant",
    "advisor",
    "king",
    "advisor",
    "elephant",
    "knight",
    "rook",
  ];
  for (let f = 0; f < FILES; f++) {
    b[0][f] = { side: "black", kind: line[f] };
    b[9][f] = { side: "red", kind: line[f] };
  }
  b[2][1] = { side: "black", kind: "cannon" };
  b[2][7] = { side: "black", kind: "cannon" };
  b[7][1] = { side: "red", kind: "cannon" };
  b[7][7] = { side: "red", kind: "cannon" };
  for (const f of [0, 2, 4, 6, 8]) {
    b[3][f] = { side: "black", kind: "pawn" };
    b[6][f] = { side: "red", kind: "pawn" };
  }
  return b;
}

function inPalace(side, r, f) {
  if (f < 3 || f > 5) return false;
  if (side === "black") return r >= 0 && r <= 2;
  return r >= 7 && r <= 9;
}

function onBlackSide(r) {
  return r <= 4;
}

function onRedSide(r) {
  return r >= 5;
}

function findKing(board, side) {
  for (let r = 0; r < RANKS; r++) {
    for (let f = 0; f < FILES; f++) {
      const p = board[r][f];
      if (p && p.side === side && p.kind === "king") return { r, f };
    }
  }
  return null;
}

/** 两将是否在同列且无子阻隔（飞将） */
function kingsFace(board) {
  const redK = findKing(board, "red");
  const blackK = findKing(board, "black");
  if (!redK || !blackK) return false;
  if (redK.f !== blackK.f) return false;
  const lo = Math.min(redK.r, blackK.r);
  const hi = Math.max(redK.r, blackK.r);
  for (let r = lo + 1; r < hi; r++) {
    if (board[r][redK.f]) return false;
  }
  return true;
}

function rawMovesForPiece(board, r, f, p, opts = {}) {
  const { ignoreCheck = false } = opts;
  const out = [];
  const push = (tr, tf) => {
    if (tr < 0 || tr >= RANKS || tf < 0 || tf >= FILES) return;
    const tgt = board[tr][tf];
    if (tgt && tgt.side === p.side) return;
    out.push({ tr, tf, capture: tgt });
  };

  switch (p.kind) {
    case "king": {
      for (const [dr, df] of [
        [-1, 0],
        [1, 0],
        [0, -1],
        [0, 1],
      ]) {
        const tr = r + dr;
        const tf = f + df;
        if (!inPalace(p.side, tr, tf)) continue;
        push(tr, tf);
      }
      break;
    }
    case "advisor": {
      for (const [dr, df] of [
        [-1, -1],
        [-1, 1],
        [1, -1],
        [1, 1],
      ]) {
        const tr = r + dr;
        const tf = f + df;
        if (!inPalace(p.side, tr, tf)) continue;
        push(tr, tf);
      }
      break;
    }
    case "elephant": {
      for (const [dr, df] of [
        [-2, -2],
        [-2, 2],
        [2, -2],
        [2, 2],
      ]) {
        const tr = r + dr;
        const tf = f + df;
        if (p.side === "black" && !onBlackSide(tr)) continue;
        if (p.side === "red" && !onRedSide(tr)) continue;
        const eyeR = r + dr / 2;
        const eyeF = f + df / 2;
        if (board[eyeR][eyeF]) continue;
        push(tr, tf);
      }
      break;
    }
    case "rook": {
      const dirs = [
        [-1, 0],
        [1, 0],
        [0, -1],
        [0, 1],
      ];
      for (const [dr, df] of dirs) {
        for (let s = 1; s < 10; s++) {
          const tr = r + dr * s;
          const tf = f + df * s;
          if (tr < 0 || tr >= RANKS || tf < 0 || tf >= FILES) break;
          const tgt = board[tr][tf];
          if (!tgt) {
            push(tr, tf);
            continue;
          }
          if (tgt.side !== p.side) push(tr, tf);
          break;
        }
      }
      break;
    }
    case "knight": {
      const jumps = [
        [-2, -1],
        [-2, 1],
        [2, -1],
        [2, 1],
        [-1, -2],
        [-1, 2],
        [1, -2],
        [1, 2],
      ];
      for (const [dr, df] of jumps) {
        let blocked = false;
        if (Math.abs(dr) === 2) {
          const legR = r + Math.sign(dr);
          if (board[legR][f]) blocked = true;
        } else {
          const legF = f + Math.sign(df);
          if (board[r][legF]) blocked = true;
        }
        if (blocked) continue;
        const tr = r + dr;
        const tf = f + df;
        if (tr < 0 || tr >= RANKS || tf < 0 || tf >= FILES) continue;
        push(tr, tf);
      }
      break;
    }
    case "cannon": {
      const dirs = [
        [-1, 0],
        [1, 0],
        [0, -1],
        [0, 1],
      ];
      for (const [dr, df] of dirs) {
        let platform = 0;
        for (let s = 1; s < 10; s++) {
          const tr = r + dr * s;
          const tf = f + df * s;
          if (tr < 0 || tr >= RANKS || tf < 0 || tf >= FILES) break;
          const tgt = board[tr][tf];
          if (platform === 0) {
            if (!tgt) push(tr, tf);
            else platform = 1;
          } else if (platform === 1) {
            if (tgt) {
              if (tgt.side !== p.side) push(tr, tf);
              break;
            }
          }
        }
      }
      break;
    }
    case "pawn": {
      const forward = p.side === "red" ? -1 : 1;
      const trF = r + forward;
      if (trF >= 0 && trF < RANKS) {
        const t = board[trF][f];
        if (!t || t.side !== p.side) push(trF, f);
      }
      if (p.side === "red" && r <= 4) {
        for (const df of [-1, 1]) {
          const tf = f + df;
          if (tf >= 0 && tf < FILES) {
            const t = board[r][tf];
            if (!t || t.side !== p.side) push(r, tf);
          }
        }
      }
      if (p.side === "black" && r >= 5) {
        for (const df of [-1, 1]) {
          const tf = f + df;
          if (tf >= 0 && tf < FILES) {
            const t = board[r][tf];
            if (!t || t.side !== p.side) push(r, tf);
          }
        }
      }
      break;
    }
    default:
      break;
  }

  if (ignoreCheck) return out;

  const legal = [];
  for (const m of out) {
    const nb = cloneBoard(board);
    nb[m.tr][m.tf] = nb[r][f];
    nb[r][f] = null;
    if (kingsFace(nb)) continue;
    if (inCheck(nb, p.side)) continue;
    legal.push(m);
  }
  return legal;
}

/** 几何意义上的“能否打到该格”（不含飞将、己方将军过滤），供将军判定使用，避免与 legalMoves 互相递归 */
function canPieceAttackSquare(board, sr, sf, p, targetR, targetF) {
  const moves = rawMovesForPiece(board, sr, sf, p, { ignoreCheck: true });
  return moves.some((m) => m.tr === targetR && m.tf === targetF);
}

function squareAttackedBy(board, targetR, targetF, bySide) {
  for (let r = 0; r < RANKS; r++) {
    for (let f = 0; f < FILES; f++) {
      const p = board[r][f];
      if (!p || p.side !== bySide) continue;
      if (canPieceAttackSquare(board, r, f, p, targetR, targetF)) return true;
    }
  }
  return false;
}

function inCheck(board, side) {
  const k = findKing(board, side);
  if (!k) return true;
  const opp = side === "red" ? "black" : "red";
  return squareAttackedBy(board, k.r, k.f, opp);
}

function legalMovesFrom(board, r, f, sideToMove) {
  const p = board[r][f];
  if (!p || p.side !== sideToMove) return [];
  return rawMovesForPiece(board, r, f, p);
}

function hasLegalMove(board, side) {
  for (let r = 0; r < RANKS; r++) {
    for (let f = 0; f < FILES; f++) {
      const p = board[r][f];
      if (!p || p.side !== side) continue;
      if (legalMovesFrom(board, r, f, side).length) return true;
    }
  }
  return false;
}

function applyMove(board, r, f, tr, tf) {
  const nb = cloneBoard(board);
  const piece = nb[r][f];
  nb[tr][tf] = piece;
  nb[r][f] = null;
  return nb;
}

/* ---------- UI ---------- */

const boardEl = document.getElementById("board");
const statusEl = document.getElementById("status");
const btnUndo = document.getElementById("btn-undo");
const btnReset = document.getElementById("btn-reset");

let board = initialBoard();
let sideToMove = "red";
let selected = null;
let legalTargets = new Map();
let lastMove = null;
const history = [];

function posKey(r, f) {
  return `${r},${f}`;
}

function buildBoardSVG() {
  const ns = "http://www.w3.org/2000/svg";
  const svg = document.createElementNS(ns, "svg");
  svg.setAttribute("viewBox", "0 0 9 10");
  svg.setAttribute("preserveAspectRatio", "xMidYMid meet");
  const line = (x1, y1, x2, y2) => {
    const el = document.createElementNS(ns, "line");
    el.setAttribute("x1", String(x1));
    el.setAttribute("y1", String(y1));
    el.setAttribute("x2", String(x2));
    el.setAttribute("y2", String(y2));
    el.setAttribute("stroke", "#5c4033");
    el.setAttribute("stroke-width", "0.04");
    el.setAttribute("stroke-linecap", "square");
    svg.appendChild(el);
  };

  for (let c = 0; c < 9; c++) {
    line(c, 0, c, 4);
    line(c, 5, c, 9);
  }
  for (let r = 0; r < 10; r++) {
    line(0, r, 8, r);
  }
  line(0, 4, 0, 5);
  line(8, 4, 8, 5);
  line(3, 0, 5, 2);
  line(5, 0, 3, 2);
  line(3, 7, 5, 9);
  line(5, 7, 3, 9);

  const river = document.createElementNS(ns, "text");
  river.setAttribute("x", "4.5");
  river.setAttribute("y", "4.85");
  river.setAttribute("text-anchor", "middle");
  river.setAttribute("font-size", "0.35");
  river.setAttribute("fill", "#6d8faf");
  river.textContent = "楚 河          漢 界";
  svg.appendChild(river);

  return svg;
}

let pieceLayer = null;
const intersections = [];

function syncPieces() {
  if (!pieceLayer) return;
  pieceLayer.innerHTML = "";
  for (let r = 0; r < RANKS; r++) {
    for (let f = 0; f < FILES; f++) {
      const p = board[r][f];
      if (!p) continue;
      const div = document.createElement("div");
      div.className = `piece ${p.side}`;
      div.textContent = LABELS[p.side][p.kind];
      div.style.left = `${((f + 0.5) / FILES) * 100}%`;
      div.style.top = `${((r + 0.5) / RANKS) * 100}%`;
      pieceLayer.appendChild(div);
    }
  }
}

function clearHighlights() {
  for (const btn of intersections) {
    btn.classList.remove("selected", "last-from", "last-to", "legal-target");
  }
}

function updateHighlights() {
  clearHighlights();
  if (lastMove) {
    const a = intersections[lastMove.fromR * FILES + lastMove.fromF];
    const b = intersections[lastMove.toR * FILES + lastMove.toF];
    if (a) a.classList.add("last-from");
    if (b) b.classList.add("last-to");
  }
  if (selected) {
    const i = selected.r * FILES + selected.f;
    if (intersections[i]) intersections[i].classList.add("selected");
    for (const key of legalTargets.keys()) {
      const [tr, tf] = key.split(",").map(Number);
      const idx = tr * FILES + tf;
      intersections[idx]?.classList.add("legal-target");
    }
  }
}

function setStatus() {
  const check = inCheck(board, sideToMove);
  const canMove = hasLegalMove(board, sideToMove);
  let text = "";
  if (!canMove) {
    if (check) {
      text = sideToMove === "red" ? "黑方胜！红方被将死。" : "红方胜！黑方被将死。";
    } else {
      text = sideToMove === "red" ? "黑方胜！红方困毙。" : "红方胜！黑方困毙。";
    }
  } else if (check) {
    text =
      sideToMove === "red"
        ? "红方行棋 · 将军！"
        : "黑方行棋 · 将军！";
  } else {
    text = sideToMove === "red" ? "红方行棋" : "黑方行棋";
  }

  statusEl.textContent = text;
  statusEl.classList.toggle("red-turn", sideToMove === "red" && canMove);
  statusEl.classList.toggle("black-turn", sideToMove === "black" && canMove);

  btnUndo.disabled = history.length === 0;
}

function tryMove(fromR, fromF, toR, toF) {
  const moves = legalMovesFrom(board, fromR, fromF, sideToMove);
  const ok = moves.some((m) => m.tr === toR && m.tf === toF);
  if (!ok) return false;

  history.push({
    board: cloneBoard(board),
    sideToMove,
    lastMove: lastMove ? { ...lastMove } : null,
  });

  board = applyMove(board, fromR, fromF, toR, toF);
  lastMove = { fromR, fromF, toR, toF };
  sideToMove = sideToMove === "red" ? "black" : "red";
  selected = null;
  legalTargets.clear();
  syncPieces();
  updateHighlights();
  setStatus();
  return true;
}

function onIntersectionClick(r, f) {
  const gameOver = !hasLegalMove(board, sideToMove);
  if (gameOver) return;

  const p = board[r][f];
  const key = posKey(r, f);

  if (selected && legalTargets.has(key)) {
    tryMove(selected.r, selected.f, r, f);
    return;
  }

  if (p && p.side === sideToMove) {
    selected = { r, f };
    legalTargets.clear();
    const moves = legalMovesFrom(board, r, f, sideToMove);
    for (const m of moves) {
      legalTargets.set(posKey(m.tr, m.tf), true);
    }
    updateHighlights();
    setStatus();
    return;
  }

  selected = null;
  legalTargets.clear();
  updateHighlights();
}

function initBoardDOM() {
  boardEl.innerHTML = "";
  boardEl.appendChild(buildBoardSVG());

  pieceLayer = document.createElement("div");
  pieceLayer.className = "piece-layer";
  boardEl.appendChild(pieceLayer);

  intersections.length = 0;
  for (let r = 0; r < RANKS; r++) {
    for (let f = 0; f < FILES; f++) {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "intersection";
      btn.style.left = `${((f + 0.5) / FILES) * 100}%`;
      btn.style.top = `${((r + 0.5) / RANKS) * 100}%`;
      btn.setAttribute("aria-label", `第${f + 1}列第${r + 1}行`);
      btn.addEventListener("click", () => onIntersectionClick(r, f));
      boardEl.appendChild(btn);
      intersections.push(btn);
    }
  }

  syncPieces();
  updateHighlights();
  setStatus();
}

btnUndo.addEventListener("click", () => {
  if (!history.length) return;
  const snap = history.pop();
  board = snap.board;
  sideToMove = snap.sideToMove;
  lastMove = snap.lastMove;
  selected = null;
  legalTargets.clear();
  syncPieces();
  updateHighlights();
  setStatus();
});

btnReset.addEventListener("click", () => {
  board = initialBoard();
  sideToMove = "red";
  selected = null;
  legalTargets.clear();
  lastMove = null;
  history.length = 0;
  syncPieces();
  updateHighlights();
  setStatus();
});

initBoardDOM();
