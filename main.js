const UP = 38;
const DOWN = 40;
const LEFT = 37;
const RIGHT = 39;
const PAUSE = 32;
const ESC = 27;

const box = document.getElementById('snake-window');
const scale = 16;
const boxWidth = box.getBoundingClientRect().width;
const boxHeight = box.getBoundingClientRect().height;

let direction = RIGHT;

const xStart = scale * 4;
const yStart = scale * 8;
const snakeLength = 4;
let snake = [];

let turnQueue = snake.map(() => direction)

const segmentHeadHTML = '<div class="segment" id="head"></div>';
const segmentHTML = '<div class="segment"></div>';
let paused = false;

let infoBoxes = [{
  id: 'social',
  title: 'Socials',
  x: scale * 12,
  y: scale * 4,
  size: 1
}, {
  id: 'email',
  title: 'Email',
  x: scale * 4,
  y: scale * 12,
  size: 1
}, {
  id: 'work',
  title: 'Work',
  x: scale * 16,
  y: scale * 16,
  size: 1
}];
let selectedInfoBox = null;
let ignoreInfoBox = false;

function setup() {
  document.onkeydown = () => onKeyDown();

  for (let i = 0; i < snakeLength; i++) {
    let xPos = xStart;
    if (i > 0) xPos = xStart - (scale * i)
    snake.push({
      x: xPos,
      y: yStart,
    })
  }

  infoBoxes.forEach(drawInfoBox);

  turnQueue = snake.map(() => direction)
}

function drawInfoBox(infoBox) {
  let infoBoxDiv = document.createElement('div');
  const size = (infoBox.size * scale) + 'px';
  infoBoxDiv.classList.add('info-box');
  infoBoxDiv.id = infoBox.id
  infoBoxDiv.style.width = size;
  infoBoxDiv.style.height = size;
  infoBoxDiv.style.left = infoBox.x + 'px';
  infoBoxDiv.style.top = infoBox.y + 'px';
  infoBoxDiv.addEventListener('click', function() {openInfoBox(infoBox) })
  box.appendChild(infoBoxDiv)
}

function onKeyDown(e) {
  e = e || window.event;
  switch (e.keyCode) {
      case UP:
      case LEFT:
      case RIGHT:
      case DOWN:
        changeDirection(e.keyCode)
      case PAUSE:
        togglePause(e)
      case ESC:
        escInfoBox();
      default:
        break;
  }
}

function changeDirection(dir) {
  if (paused) return;
  if (dir !== oppositeDir(turnQueue[0])) {
    // turnQueue.push(dir);
    // turnQueue.pop();
    direction = dir;
  }
}

function oppositeDir(dir) {
  switch (dir) {
    case UP:
      return DOWN;
    case DOWN:
      return UP;
    case LEFT:
      return RIGHT;
    case RIGHT:
      return LEFT;
    default:
      break;
  }
}

function togglePause(e) {
  if (e && e.keyCode !== PAUSE || selectedInfoBox) return;
  paused = !paused;
  if (paused) {
    document.getElementById('modal-dim').style.opacity = 1;
    document.getElementById('modal-dim').style.zIndex = 1;
  }
  if (!paused) {
    document.getElementById('modal-dim').style.opacity = 0;
    document.getElementById('modal-dim').style.zIndex = -1;
    moveSnake();
  } 
}

function drawSnake() {
  snake.forEach(drawSegment);
  if (!paused) setTimeout(moveSnake, 125);
}

function drawSegment(segment) {
  let segmentDiv = document.createElement('div');
  segmentDiv.classList.add('segment');
  segmentDiv.style.width = scale + 'px';
  segmentDiv.style.height = scale + 'px';
  segmentDiv.style.left = segment.x + 'px';
  segmentDiv.style.top = segment.y + 'px';
  box.appendChild(segmentDiv)
}

function clearSnake() {
  const segments = document.querySelectorAll('.segment');
  segments.forEach(segment => segment.remove())
}

function moveSnake() {
  snake.forEach(moveSegment);
  turnQueue.unshift(direction);
  turnQueue.pop();

  let head = snake[0];
  let overlap = false

  infoBoxes.forEach((infoBox, index) => {
    const headX = head.x + scale;
    const headY = head.y + scale;
    const xOverlap = infoBox.x < headX && head.x < (infoBox.x + (infoBox.size * scale));
    const yOverlap = infoBox.y < headY && head.y < (infoBox.y + (infoBox.size * scale));
    overlap = xOverlap && yOverlap;

    if (overlap && !ignoreInfoBox) openInfoBox(infoBox)
    if (ignoreInfoBox) ignoreInfoBox = false
  })

  clearSnake();
  drawSnake();
}

function openInfoBox(infoBox) {
  togglePause()
  selectedInfoBox = infoBox;
  const infoBoxDivId = 'info-modal-' + infoBox.id
  document.getElementById(infoBoxDivId).style.display = 'block';
}

function escInfoBox(e) {
  if (e && e.keyCode !== ESC) return;
  return closeInfoBox();
}

function closeInfoBox() {
  const infoBoxDivId = 'info-modal-' + selectedInfoBox.id
  document.getElementById(infoBoxDivId).style.display = 'none';
  selectedInfoBox = null;
  ignoreInfoBox = true
  togglePause()
}

function moveSegment(segment, index) {
  let axis = 'x';
  let amount = scale;
  let boxSize = boxWidth;
  let dir = turnQueue[index]

  if (dir === UP || dir === DOWN) {
    axis = 'y';
    boxSize = boxHeight;
  }
  if (dir === LEFT || dir === UP) amount = amount * -1;
  let newPosition = segment[axis] + amount;

  if (amount > 0 && newPosition > (boxSize - scale)) newPosition = 0;
  if (amount < 0 && newPosition < 0) newPosition = (boxSize - scale);

  segment[axis] = newPosition;
}