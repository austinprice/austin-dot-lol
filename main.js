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
const speed = 60;

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
  size: 1,
  hidden: true,
}, {
  id: 'email',
  title: 'Email',
  x: getRandomPlacement(boxWidth),
  y: getRandomPlacement(boxHeight),
  color: 'hsl(140, 100%, 36%)',
  size: 1,
  hidden: true
}, {
  id: 'work',
  title: 'Work',
  x: getRandomPlacement(boxWidth),
  y: getRandomPlacement(boxHeight),
  color: 'hsl(140, 100%, 36%)',
  size: 1,
  hidden: true
}];
let selectedInfoBox = null;
let ignoreInfoBox = false;

function getRandomPlacement(axis) {
  const dotCount = Math.floor(axis / scale);
  return Math.floor(Math.random() * dotCount);
}

function setup() {
  document.onkeydown = () => onKeyDown();

  for (let i = 0; i < snakeLength; i++) {
    let xPos = xStart;
    if (i > 0) xPos = xStart - i;
    snake.push({
      x: xPos,
      y: yStart,
    })
  }

  
  drawGridY();
  drawInfoBox(infoBoxes[0]);

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
  infoBox.hidden = false;
  let gridRow = document.getElementsByClassName('dot-row')[infoBox.y];
  let infoBoxDiv = gridRow.getElementsByClassName('grid-dot')[infoBox.x];

  infoBoxDiv.classList.add('info-box');
  infoBoxDiv.id = infoBox.id
  infoBoxDiv.style.backgroundColor = infoBox.color;
  infoBoxDiv.addEventListener('click', function() {openInfoBox(infoBox) })
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
  let gridRow = document.getElementsByClassName('dot-row')[segment.y];
  let segmentDiv = gridRow.getElementsByClassName('grid-dot')[segment.x];

  if (segmentDiv) {
    segmentDiv.classList.add('segment');
    if(segment.color) segmentDiv.style.backgroundColor = segment.color;
  } else {
    console.log(segment)
    console.log(gridRow)
  }
}

function clearSnake() {
  const segments = document.querySelectorAll('.segment');
  segments.forEach(segment => {
    segment.style.backgroundColor = null;
    segment.classList.remove('segment')
  })
}

function checkOverlap(item) {
  const head = snake[0];
  const xOverlap = item.x == head.x;
  const yOverlap = item.y == head.y;
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
    overlap = checkOverlap(infoBox)

    if (overlap && !ignoreInfoBox && !infoBox.hidden) {
      // openInfoBox(infoBox)
      addSegment(infoBox.color);

      let newSegmentDir = turnQueue[(snakeLength - 1)];
      snakeLength ++;
      turnQueue.push(newSegmentDir);

      document.getElementById(infoBox.id).classList.remove('info-box');
      infoBox.hidden = true;

      let nextInfoBoxIndex = index + 1;
      if (infoBoxes.length > nextInfoBoxIndex) {
        infoBoxes[nextInfoBoxIndex].hidden = false;
        drawInfoBox(infoBoxes[nextInfoBoxIndex]);
      }
    }
    if (ignoreInfoBox) ignoreInfoBox = false
  })

  clearSnake();
  drawSnake();
}

function moveSegment(segment, index) {
  let axis = 'x';
  let amount = 1;
  let boxSize = boxWidth;
  let dir = turnQueue[index];
  let gridDotsLength = document.getElementsByClassName('dot-row')[0].getElementsByClassName('grid-dot').length;

  if (dir === UP || dir === DOWN) {
    axis = 'y';
    gridDotsLength = document.getElementsByClassName('dot-row').length;
  }
  if (dir === LEFT || dir === UP) amount = -1;
  let newPosition = segment[axis] + amount;

  // if the snake goes outside of the playing area, move it to the other side
  if (amount > 0 && newPosition > (gridDotsLength - 1)) newPosition = 0;
  if (amount < 0 && newPosition < 0) newPosition = gridDotsLength - 1;

  segment[axis] = newPosition;
}

function addSegment(color) {
  let lastSegment = snake[snake.length - 1];
  let dir = turnQueue[(snakeLength - 1)];
  let amount = -1;
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

window.onresize = function(){ location.reload(); }

box.addEventListener('touchmove', function(e) {
  e.preventDefault();
})

box.addEventListener('touchstart', function (event) {
  touchstartX = event.changedTouches[0].screenX;
  touchstartY = event.changedTouches[0].screenY;
}, false);

box.addEventListener('touchend', function (event) {
  touchendX = event.changedTouches[0].screenX;
  touchendY = event.changedTouches[0].screenY;
  handleGesture();
}, false);


function handleGesture() {
  let dir = direction;
  let axis = 'x';
  const touchDifX = touchendX - touchstartX;
  const touchDifY = touchendY - touchstartY;
  let newDir = dir;


  if (Math.abs(touchDifY) > Math.abs(touchDifX)) axis = 'y';

  if (axis == 'x') {
    newDir = RIGHT;
    if (touchDifX < 0) newDir = LEFT;
  }
  if (axis == 'y') {
    newDir = DOWN;
    if (touchDifY < 0) newDir = UP;
  }

  changeDirection(newDir);
}


// TODO:
// [x] add protection for snake running into itself
// [ ] open/show infobox details when one is hit
// [x] remove infobox from overlap logic once it's been removed from dom
// [x] update pause screen
// [ ] add intro animation and explainer on pause screen
// [ ] show top bar with corresponding infobox items, will be enabled when the dot is eaten
// [ ] update UI design
// [ ] mobile gestures