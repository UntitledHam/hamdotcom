const FISH = "><>"
const BACKWARDS_FISH = "<><"

const fishes = [];
let background_text;
let gridSize = [0, 0];

let lastTimeStamp = 0;

class Fish {
    constructor(coordinates) {
        this.x = coordinates[0];
        this.y = coordinates[1];
        this.sprite = FISH;
        this.forwards = true;
    }

    getCoords() {
        return [this.x, this.y];
    }

    updatePosition(newX, newY) {
        this.x = newX;
        this.y = newY;
    }

    changeDirection(forwards) {
        this.sprite = forwards ? FISH : BACKWARDS_FISH;
        this.forwards = forwards;
    }

    move(dx, dy) {
        this.updatePosition(this.x + dx, this.y + dy);
        if (dx > 0) {
            this.changeDirection(true);
        } else if (dx < 0) {
            this.changeDirection(false);
        }
    }
}

function getAsciiGridSize(container) {
    const probe = document.createElement("span");
    const style = getComputedStyle(container);
  
    Object.assign(probe.style, {
      position: "absolute",
      visibility: "hidden",
      font: style.font,
      letterSpacing: style.letterSpacing,
      whiteSpace: "pre",
    });
  
    probe.textContent = "M";
    container.appendChild(probe);
  
    const { width, height } = probe.getBoundingClientRect();
    probe.remove();
  
    const lineHeight = parseFloat(style.lineHeight) || height;
    return [Math.ceil(container.clientWidth / width), Math.ceil(container.clientHeight / lineHeight)];
  }

function generateBoardFromString(str) {
    return str.split(/\r?\n/).map(row => [...row]);
}


async function loadBoardFromFile(filename) {
    const response = await fetch(filename);
    if (!response.ok) {
        throw new Error(`Could not load ${filename}: HTTP ${response.status}`);
    }
    return generateBoardFromString(await response.text());
}


function drawFish(board, fish) {
    const coords = fish.getCoords();
    const fish_width = fish.sprite.length;
    for (let charIndex = 0; charIndex < fish_width; charIndex++) {
        if (coords[1] < 0 || coords[0] + charIndex < 0 || coords[1] >= board.length || coords[0] + charIndex >= board[0].length) {
            continue;
        }
        board[coords[1]][coords[0] + charIndex] = fish.sprite[charIndex];
    }
}

function drawFishes(board) {
    for (const fish of fishes) {
        drawFish(board, fish);
    }
}

function calculateMove(fish) {
    const amount_to_move = 1;
    if (fish.x >= gridSize[0] + 20) {
        return [-amount_to_move, 0];
    }
    else if (fish.x <= -20) {
        return [amount_to_move, 0];
    }
    
    if (fish.forwards) {
        return [amount_to_move, 0];
    } else {
        return [-amount_to_move, 0];
    }
}

function moveFishies() {
    for (const fish of fishes) {
        const [dx, dy] = calculateMove(fish);
        fish.move(dx, dy);
    }
}

function render(resolution) {
    const board = Array.from({length: resolution[1]}, () => Array(resolution[0]).fill(" "));
    drawFishes(board);

    background_text.textContent = board.map(row => row.join("")).join('\n');
    
    return board;
}

function resizeGrid() {
    gridSize = getAsciiGridSize(background_text);
}

function renderLoop(currentTime) {
    if (lastTimeStamp === 0) {
        lastTimeStamp = currentTime;
    }

    const deltaTime = currentTime - lastTimeStamp;

    if (deltaTime > 20) {
        lastTimeStamp = currentTime;
        moveFishies();
    }

    render(gridSize);
    requestAnimationFrame(renderLoop);
}

document.addEventListener("DOMContentLoaded", () => {
    background_text = document.querySelector(".bg-text");
    fishes.push(new Fish([0, 0]));
    fishes.push(new Fish([10, 10]));
    fishes.push(new Fish([-10, 20]));

    resizeGrid();

    new ResizeObserver(resizeGrid).observe(background_text);
    document.fonts.ready.then(resizeGrid);

    requestAnimationFrame(renderLoop);
});
