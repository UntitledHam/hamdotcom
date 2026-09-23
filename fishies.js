const FISH = "><>"
const fishes = [];

class Fish {
    constructor(coordinates) {
        this.x = coordinates[0];
        this.y = coordinates[1];
        this.sprite = FISH;
    }

    getCoords() {
        return [this.x, this.y];
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
  
    return {
      columns: Math.ceil(container.clientWidth / width),
      rows: Math.ceil(container.clientHeight / height),
    };
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

document.addEventListener("DOMContentLoaded", async () => {
    const background_text = document.querySelector(".bg-text");
    let board;
    try {
        board = await loadBoardFromFile("board.txt");
    } catch (error) {
        console.error("Error loading board from file:", error);
        background_text.textContent = "";
        return;
    }

    function render() {
        const { columns, rows } = getAsciiGridSize(background_text);
        console.log(`Grid: (${columns},${rows})`);
        const board = Array.from({length: rows}, () => Array(columns).fill(" "));

        fishes.length = 0; // Clear the fishes array
        fishes.push(new Fish([0, 0]));
        fishes.push(new Fish([10, 10]));

        drawFishes(board);

        background_text.textContent = board.map(row => row.join("")).join('\n');
    }

    new ResizeObserver(render).observe(background_text);
    document.fonts.ready.then(render);
});
