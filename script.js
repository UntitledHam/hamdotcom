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

document.addEventListener("DOMContentLoaded", () => {
    const background_text = document.querySelector(".bg-text");
    const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890";

    function renderBackground() {
        const { columns, rows } = getAsciiGridSize(background_text);
        console.log(`Grid: (${columns},${rows})`);
        const board = Array.from({length: rows}, () => Array(columns).fill(" "));

        for (let row = 0; row < rows; row++) {
            for (let column = 0; column < columns; column++) {
                board[row][column] = characters[Math.floor(Math.random() * characters.length)];
            }
        }

        background_text.textContent = board.map(row => row.join("")).join('\n');
    }

    new ResizeObserver(renderBackground).observe(background_text);
    document.fonts.ready.then(renderBackground);
});
