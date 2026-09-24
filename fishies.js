const FISH = "><>"
const BACKWARDS_FISH = "<><"
const DRIFT = 0.6; // Lower means more drift, higher means quicker turns
const BOTTOMSPEED = 7;
const TOPSPEED = 10;
const WANDERMIN = 1; 
const WANDERMAX = 3;

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

        this.speed = BOTTOMSPEED + Math.random() * (TOPSPEED - BOTTOMSPEED); // Blue dog from majora's mask will win trust
        this.vx = this.speed; 
        this.vy = 0;

        this.targetVx = this.vx;
        this.targetVy = 0
        this.wanderTimer = 0;
    }

    getCoords() {
        // Round movement to ascii display
        return [Math.round(this.x), Math.round(this.y)];
    }

    update(dt) {
        this.wanderTimer -= dt; 

        if (this.wanderTimer <= 0) {
            const direction = this.forwards ? 1 : -1; // Get direction as a scaler
            
            // Calculate target velocities
            this.targetVx = direction * this.speed * (0.7 + Math.random() * 0.6);
            this.targetVy = (Math.random() - 0.5) * 1.5;

            // Reset the wander timer
            this.wanderTimer = WANDERMIN + Math.random() * (WANDERMAX - WANDERMIN);
        }

        // Steer back onto the screen when off the edge 
        if (this.x > gridSize[0] + 5) {
            this.targetVx = -this.speed;
        } else if (this.x < -5) {
            this.targetVx = this.speed;
        }

        // Encourage fish to stay within the available rows.
        if (this.y < 2) {
            this.targetVy = 1;
        } else if (this.y > gridSize[1] - 3) {
            this.targetVy = -1;
        }

        // Easing the fish
        const blend = 1 - Math.exp(-DRIFT * dt);
        this.vx += (this.targetVx - this.vx) * blend; 
        this.vy += (this.targetVy - this.vy) * blend;

        // Update the fish's position
        this.x += this.vx * dt;
        this.y += this.vy * dt;

        if (Math.abs(this.vx) > 0.2) {
            this.forwards = this.vx > 0; 
        }

        this.sprite = this.forwards ? FISH : BACKWARDS_FISH;
 
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


function moveFishies(dt) {
    for (const fish of fishes) {
        fish.update(dt);
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

    const deltaTime = Math.min(currentTime - lastTimeStamp / 1000, 0.05);
    lastTimeStamp = currentTime;
    
    moveFishies(deltaTime);
    render(gridSize);
    requestAnimationFrame(renderLoop);
}

document.addEventListener("DOMContentLoaded", () => {
    background_text = document.querySelector(".bg-text");
    fishes.push(new Fish([0, 0]));
    fishes.push(new Fish([10, 10]));
    fishes.push(new Fish([-10, 20]));
    fishes.push(new Fish([-5, 30]));
    fishes.push(new Fish([5, 40]));

    resizeGrid();

    new ResizeObserver(resizeGrid).observe(background_text);
    document.fonts.ready.then(resizeGrid);

    requestAnimationFrame(renderLoop);
});
