"use strict";

let tiles = [],
    score = 0,
    maxScore = 0,
    savedMoves = [],
    savingMovesAmount = 25,
    hasMoved = false,
    initX = null,
    initY = null,
    won = false,
    boardWidth = 4,
    undoAnimation,
    newGameAnimation,
    arrowAnimationInterval,
    bestScoreLabel = document.querySelector(".best-score"),
    actualScoreLabel = document.querySelector(".actual-score"),
    gameBoard = document.querySelector(".game");

const generateBoard = function () {
    for (let i = 0; i < boardWidth ** 2; i++) {
        let tile = document.createElement("div");
        tile.classList.add(`game-cell`);
        tiles.push(tile);
        gameBoard.appendChild(tile);
    }
};

const newGame = function (e) {
    e.preventDefault();
    removeGameOver();

    if (score > maxScore) {
        maxScore = score;
        bestScoreLabel.textContent = score;
    }

    score = 0;
    tiles = [];
    actualScoreLabel.textContent = 0;
    gameBoard.innerHTML = "";
    generateBoard();
    generateTile();
    generateTile();
};

const updateCell = function (number, value) {
    let actualValue = tiles[number].textContent;
    actualValue ? tiles[number].classList.remove(`tile-${actualValue}`) : "";
    if (value > 1) {
        tiles[number].textContent = value;
        tiles[number].classList.add(`tile-${value}`);
    }

    if (value < 1) {
        tiles[number].textContent = "";
    }
};

const clearCell = function (number) {
    tiles[number].classList.remove(`tile-${tiles[number].textContent}`);
    tiles[number].textContent = "";
};

const generateTile = function () {
    let unusedTiles = [];
    for (const [i, value] of tiles.entries()) {
        value.textContent < 1 ? unusedTiles.push(i) : "";
    }

    if (unusedTiles.length !== 0) {
        let cord = unusedTiles[Math.floor(Math.random() * unusedTiles.length)];

        tiles[cord].textContent = Math.random() < 0.9 ? 2 : 4;
        tiles[cord].classList.add(`tile-${tiles[cord].textContent}`);

        const popupAnimation = [
            { transform: "scale(0.6)", opacity: "0.4" },
            { transform: "scale(1)", opacity: "1" },
        ];
        const popupAnimationTiming = {
            duration: 200,
            iterations: 1,
        };

        tiles[cord].animate(popupAnimation, popupAnimationTiming);
    }
};

const animationSlideDown = function (that) {
    const slideDownAnimation = [
        { transform: "translateY(0)", opacity: "1" },
        { transform: "translateY(100%)", opacity: "0" },
    ];
    const slideDownTiming = {
        duration: 2000,
        iterations: 1,
    };

    that.animate(slideDownAnimation, slideDownTiming);
};

const slideTiles = function (direction) {
    const tileHasMoved = function (newRow, rowArray) {
        for (let y = 0; y < boardWidth; y++) {
            hasMoved = newRow[y] !== rowArray[y] ? true : hasMoved;
        }
    };

    const dir = {
        ArrowDown: 0,
        ArrowUp: 1,
        ArrowRight: 2,
        ArrowLeft: 3,

        iterationStart: [0, 0, 0, 0],
        iterationEnd: [4, 4, 16, 16],
        column1: [0, 12, 0, 3],
        column2: [4, 8, 1, 2],
        column3: [8, 4, 2, 1],
        column4: [12, 0, 3, 0],
        divisor: [1, 1, 4, 4],
    };

    const num = dir[direction];

    for (let i = dir.iterationStart[num]; i < dir.iterationEnd[num]; i++) {
        if (i % dir.divisor[num] === 0) {
            let columnArray = [
                +tiles[i + dir.column1[num]].textContent,
                +tiles[i + dir.column2[num]].textContent,
                +tiles[i + dir.column3[num]].textContent,
                +tiles[i + dir.column4[num]].textContent,
            ];
            let filteredColumn = columnArray.filter(value => value);
            let newColumn = new Array(4 - filteredColumn.length).fill(0);
            newColumn = [...newColumn, ...filteredColumn];

            updateCell(i + dir.column1[num], newColumn[0]);
            updateCell(i + dir.column2[num], newColumn[1]);
            updateCell(i + dir.column3[num], newColumn[2]);
            updateCell(i + dir.column4[num], newColumn[3]);
            tileHasMoved(newColumn, columnArray);
        }
    }
};

const combineTiles = function (direction) {
    const dir = {
        ArrowUp: 0,
        ArrowDown: 1,
        ArrowLeft: 2,
        ArrowRight: 3,
        iterationStart: [0, 0, 0, 0],
        iterationEnd: [4, 4, 16, 16],
        column1: [0, 12, 0, 3],
        column2: [4, 8, 1, 2],
        column3: [8, 4, 2, 1],
        column4: [12, 0, 3, 0],
        divisor: [1, 1, 4, 4],
        clear1: [4, 12, 1, 3],
        clear2: [8, 8, 2, 2],
        clear3: [12, 4, 3, 1],
        update1: [0, 8, 0, 2],
        update2: [4, 4, 1, 1],
        update3: [8, 0, 2, 0],
    };

    const num = dir[direction];

    for (let i = dir.iterationStart[num]; i < dir.iterationEnd[num]; i++) {
        if (i % dir.divisor[num] === 0) {
            if (+tiles[i + dir.column1[num]].textContent === +tiles[i + dir.column2[num]].textContent) {
                let value = +tiles[i + dir.column1[num]].textContent + +tiles[i + dir.column2[num]].textContent;
                if (value !== 0) {
                    clearCell(i + dir.clear1[num]);
                    updateCell(i + dir.update1[num], value);
                    score += value;
                    hasMoved = true;
                }
            }
            if (+tiles[i + dir.column2[num]].textContent === +tiles[i + dir.column3[num]].textContent) {
                let value = +tiles[i + dir.column2[num]].textContent + +tiles[i + dir.column3[num]].textContent;
                if (value !== 0) {
                    clearCell(i + dir.clear2[num]);
                    updateCell(i + dir.update2[num], value);
                    score += value;
                    hasMoved = true;
                }
            }
            if (+tiles[i + dir.column3[num]].textContent === +tiles[i + dir.column4[num]].textContent) {
                let value = +tiles[i + dir.column3[num]].textContent + +tiles[i + dir.column4[num]].textContent;
                if (value !== 0) {
                    clearCell(i + dir.clear3[num]);
                    updateCell(i + dir.update3[num], value);
                    score += value;
                    hasMoved = true;
                }
            }
        }
    }
};

const updateScore = function () {
    actualScoreLabel.textContent = score;
};

const updateTiles = function (event) {
    if (document.querySelector(".winner")) {
        gameBoard.removeChild(document.querySelector(".winner"));
    }

    if (event === "ArrowUp" || event === "ArrowDown" || event === "ArrowLeft" || event === "ArrowRight") {
        saveActualState();
        slideTiles(event);
        combineTiles(event);
        slideTiles(event);
        highlightKey(event);
        if (hasMoved === false && !document.querySelector(".game-over")) {
            savedMoves.pop();
        }
        if (hasMoved) {
            generateTile();
            hasMoved = false;
        }

        updateScore();
        checkGameWon();
        checkGameOver();
    }
};

const saveActualState = function () {
    if (savedMoves.length === savingMovesAmount) {
        savedMoves.splice(0, 1);
    }

    if (!document.querySelector(".game-over")) {
        let lastState = [];
        for (let key of tiles) {
            lastState.push(+key.textContent);
        }

        lastState.push(score);
        savedMoves.push(lastState);
        saveSessionStorage(lastState);
    }
};

const loadSavedGame = function () {
    let savedStateStored = window.localStorage.getItem("savedState").split(",");
    let maxScoreStored = window.localStorage.getItem("savedBest");
    let val = 0;

    savedStateStored.forEach(el => (el >= 2 ? val++ : val));

    if (val > 4) {
        score = +savedStateStored[16];
        actualScoreLabel.textContent = score;
        maxScore = maxScoreStored;
        bestScoreLabel.textContent = +maxScoreStored;
        for (let i = 0; i < boardWidth ** 2; i++) {
            if (savedStateStored[savedStateStored.length - 1]) {
                updateCell(i, savedStateStored[i]);
            } else {
                clearCell(i);
            }
        }
    }
};
const removeGameOver = function () {
    if (document.querySelector(".game-over")) {
        undoAnimation?.cancel();
        newGameAnimation?.cancel();
        document.querySelector(".header").removeChild(document.querySelector(".game-over"));
    }
};

const undoMove = function (e) {
    e.preventDefault();
    removeGameOver();
    if (savedMoves.length > 0) {
        for (let i = 0; i < boardWidth ** 2; i++) {
            if (savedMoves[savedMoves.length - 1][i]) {
                updateCell(i, savedMoves[savedMoves.length - 1][i]);
                score = savedMoves[savedMoves.length - 1][16];
                actualScoreLabel.textContent = score;
            } else {
                clearCell(i);
            }
        }

        savedMoves.splice(savedMoves.length - 1, 1);
    }
};

const checkGameOver = function () {
    let usedTiles = 0;
    let end = 0;

    tiles.map(el => {
        el.textContent.length >= 1 ? usedTiles++ : usedTiles;
    });

    if (usedTiles === 16) {
        // Column
        for (let i = 0; i < 4; i++) {
            if (
                +tiles[i].textContent === +tiles[i + 4].textContent ||
                +tiles[i + 4].textContent === +tiles[i + 8].textContent ||
                +tiles[i + 8].textContent === +tiles[i + 12].textContent
            ) {
                return;
            } else {
                end++;
            }
        }

        // Row
        for (let i = 0; i < boardWidth ** 2; i++) {
            if (i % 4 === 0) {
                if (
                    +tiles[i].textContent === +tiles[i + 1].textContent ||
                    +tiles[i + 1].textContent === +tiles[i + 2].textContent ||
                    +tiles[i + 2].textContent === +tiles[i + 3].textContent
                ) {
                    return;
                } else {
                    end++;
                }
            }
        }
    }

    if (end === 8) {
        gameOver();
    }
};

const gameOver = function () {
    if (!document.querySelector(".game-over")) {
        const buttonPulsate = [
            { transform: "scale(1)", backgroundColor: "#7d6b59" },
            { transform: "scale(1.05)", backgroundColor: "#a3917f" },
            { transform: "scale(1)", backgroundColor: "#7d6b59" },
        ];

        const buttonPulsateTiming = {
            duration: 1000,
            iterations: Infinity,
        };

        undoAnimation = document.querySelector(".header__btn--undo").animate(buttonPulsate, buttonPulsateTiming);
        newGameAnimation = document.querySelector(".header__btn--new-game").animate(buttonPulsate, buttonPulsateTiming);

        let child = document.createElement("span");
        child.classList.add("game-over");
        child.textContent = "Game over!";

        document.querySelector(".header").appendChild(child);
    }
};

const checkGameWon = function () {
    if (won === false) {
        tiles.forEach(el => (+el.textContent === 2048 ? gameWon() : ""));
    }
};

const gameWon = function () {
    won = true;
    let winner = document.createElement("div");
    winner.classList.add("winner");
    winner.innerHTML = `<span class="winner__title">You won!</span> 
                            <p class="winner__message">Swipe or use arrow keys to improve your score!</p>`;

    gameBoard.appendChild(winner);
};

const saveSessionStorage = function (lastState) {
    window.localStorage.setItem("savedState", lastState);
    window.localStorage.setItem("savedBest", +bestScoreLabel.textContent);
};

const startTouch = function (e) {
    initX = e.touches[0].clientX;
    initY = e.touches[0].clientY;
};

const moveTouch = function (e) {
    e.preventDefault();

    if (initX === null || initY === null) return;
    let currentX = e.touches[0].clientX;
    let currentY = e.touches[0].clientY;

    let moveX = initX - currentX;
    let moveY = initY - currentY;

    if (Math.abs(moveX) > Math.abs(moveY)) {
        if (moveX > 0) {
            updateTiles("ArrowLeft");
        } else {
            updateTiles("ArrowRight");
        }
    } else {
        if (moveY > 0) {
            updateTiles("ArrowUp");
        } else {
            updateTiles("ArrowDown");
        }
    }

    initX = initY = null;
};

const animateArrows = function () {
    const arrowKeys = document.querySelectorAll(".instruction__arrow");
    const arrowContainer = document.querySelector(".instruction__arrows");

    arrowKeys.forEach(el => el.classList.toggle("js-animation"));
    arrowContainer.classList.toggle(".js-animation");

    setTimeout(function () {
        arrowKeys.forEach(el => el.classList.toggle("js-animation"));
        arrowContainer.classList.toggle(".js-animation");
    }, 1500);
};

const highlightKey = function (event) {
    const eventObj = {
        ArrowUp: ".instruction__arrow--up",
        ArrowDown: ".instruction__arrow--down",
        ArrowLeft: ".instruction__arrow--left",
        ArrowRight: ".instruction__arrow--right",
    };
    const arrowKey = document.querySelector(eventObj[event]);
    arrowKey.classList.toggle("js-animation-fast");
    setTimeout(() => arrowKey.classList.toggle("js-animation-fast"), 100);
};

// EVENT LISTENERS

gameBoard.addEventListener("touchstart", startTouch, false);
gameBoard.addEventListener("touchmove", moveTouch, false);

document.addEventListener("DOMContentLoaded", function (e) {
    generateBoard();
    generateTile();
    generateTile();
    setTimeout(animateArrows, 1000);
    arrowAnimationInterval = setInterval(animateArrows, 4000);
    if (window.localStorage.getItem("savedState")) {
        loadSavedGame();
    }
});

document.addEventListener("keydown", function (event) {
    if (event.repeat) {
        return;
    }
    if (arrowAnimationInterval) {
        clearInterval(arrowAnimationInterval);
    }
    updateTiles(event.key);
});

document.querySelector(".header__btn--undo").addEventListener("mouseup", undoMove);
document.querySelector(".header__btn--new-game").addEventListener("mouseup", newGame);

window.addEventListener(
    "keydown",
    function (e) {
        if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].indexOf(e.code) > -1) {
            e.preventDefault();
        }
    },
    false
);
