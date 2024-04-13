const UP = 38;
const DOWN = 40;
const LEFT = 37;
const RIGHT = 39;
const PAUSE = 32;
const ESC = 27;

const box = document.getElementById('snake-window');
const scale = 12;
const boxWidth = box.getBoundingClientRect().width;
const boxHeight = box.getBoundingClientRect().height;
const speed = 80;

let direction = RIGHT;

let snakeLength = 10;
const xStart = getRandomPlacement(boxWidth);
const yStart = getRandomPlacement(boxHeight);

let snake = [];

let turnQueue = snake.map(() => direction)

const segmentHeadHTML = '<div class="segment" id="head"></div>';
const segmentHTML = '<div class="segment"></div>';
let paused = false;

let infoBoxes = [{
  id: 'social',
  title: 'Socials',
  x: getRandomPlacement(boxWidth),
  y: getRandomPlacement(boxHeight),
  color: 'hsl(140, 100%, 36%)',
  size: 1
}, {
  id: 'email',
  title: 'Email',
  x: getRandomPlacement(boxWidth),
  y: getRandomPlacement(boxHeight),
  color: 'hsl(140, 100%, 36%)',
  size: 1
}, {
  id: 'work',
  title: 'Work',
  x: getRandomPlacement(boxWidth),
  y: getRandomPlacement(boxHeight),
  color: 'hsl(140, 100%, 36%)',
  size: 1
}];
let selectedInfoBox = null;
let ignoreInfoBox = false;

function getRandomPlacement(axis) {
  const dotCount = (axis / scale);
  return Math.floor(Math.random() * dotCount) * scale;
}

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
  drawGridY();

  turnQueue = snake.map(() => direction)
  getRandomPlacement()
}

function drawGridX(yValue) {
  let dotGrid = document.getElementById('dot-grid');
  let dotCount = boxWidth / scale;
  let dotRow = document.createElement('div');
  let top = yValue || 0;
  dotRow.classList.add('dot-row');
  dotRow.style.top = top + 'px';
  dotGrid.appendChild(dotRow);

  for(let i = 1; i < dotCount; i++) {
    let gridDot = document.createElement('div');
    gridDot.classList.add('grid-dot');
    gridDot.style.width = scale + 'px';
    gridDot.style.height = scale + 'px';
    gridDot.style.left = ((i * scale) - scale) + 'px';
    dotRow.appendChild(gridDot)
  }
}
function drawGridY() {
  let dotCount = boxHeight / scale;
  for(let i = 1; i <= dotCount; i++) drawGridX((i * scale) - scale);
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
  infoBoxDiv.style.backgroundColor = infoBox.color;
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
    turnQueue.push(dir);
    turnQueue.pop();
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
  if (!paused) setTimeout(moveSnake, speed);
}

function drawSegment(segment) {
  let segmentDiv = document.createElement('div');
  segmentDiv.classList.add('segment');
  segmentDiv.style.width = scale + 'px';
  segmentDiv.style.height = scale + 'px';
  segmentDiv.style.left = segment.x + 'px';
  segmentDiv.style.top = segment.y + 'px';
  if(segment.color) segmentDiv.style.backgroundColor = segment.color;
  box.appendChild(segmentDiv)
}

function clearSnake() {
  const segments = document.querySelectorAll('.segment');
  segments.forEach(segment => segment.remove())
}

function checkOverlap(item) {
  const head = snake[0];
  const headX = head.x + scale;
  const headY = head.y + scale;
  const xOverlap = item.x < headX && head.x < (item.x + scale);
  const yOverlap = item.y < headY && head.y < (item.y + scale);
  return xOverlap && yOverlap;
}

function moveSnake() {
  snake.forEach(moveSegment);
  turnQueue.unshift(direction);
  turnQueue.pop();

  let head = snake[0];
  let overlap = false;

  snake.forEach((snakeSegment, index) => {
    if (index < 1) return false;
    if (checkOverlap(snakeSegment)) {
      window.alert("The snake ate itself! You must start over :(");
      return window.location.reload();
    }
  }) 

  infoBoxes.forEach((infoBox, index) => {
    // const headX = head.x + scale;
    // const headY = head.y + scale;
    // const xOverlap = infoBox.x < headX && head.x < (infoBox.x + (infoBox.size * scale));
    // const yOverlap = infoBox.y < headY && head.y < (infoBox.y + (infoBox.size * scale));
    overlap = checkOverlap(infoBox)

    if (overlap && !ignoreInfoBox) {
      // openInfoBox(infoBox)
      addSegment(infoBox.color);

      let newSegmentDir = turnQueue[(snakeLength - 1)];
      snakeLength ++;
      turnQueue.push(newSegmentDir);

      document.getElementById(infoBox.id).remove();
    }
    if (ignoreInfoBox) ignoreInfoBox = false
  })

  clearSnake();
  drawSnake();
}

function addSegment(color) {
  let lastSegment = snake[snake.length - 1];
  let dir = turnQueue[(snakeLength - 1)];
  let amount = scale * -1;
  let axis = 'x';
  
  let newSegment = {
    x: lastSegment.x,
    y: lastSegment.y,
  }

  if (color) newSegment.color = color;

  if (dir === UP || dir === DOWN) axis = 'y';
  if (dir === LEFT || dir === UP) amount = amount * -1;
  
  newSegment[axis] += amount;
  snake.push(newSegment);
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
  if (selectedInfoBox) {
    const infoBoxDivId = 'info-modal-' + selectedInfoBox.id
    document.getElementById(infoBoxDivId).style.display = 'none';
    selectedInfoBox = null;
    ignoreInfoBox = true
    togglePause()
  }
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

  // if the snake goes outside of the playing area, move it to the other side
  if (amount > 0 && newPosition > (boxSize - scale)) newPosition = 0;
  if (amount < 0 && newPosition < 0) newPosition = (boxSize - scale);

  segment[axis] = newPosition;
}


// TODO:
// [x] add protection for snake running into itself
// [ ] open/show infobox details when one is hit
// [ ] remove infobox from overlap logic once it's been removed from dom
// [ ] update pause screen
// [ ] add intro animation and explainer on pause screen
// [ ] update UI design