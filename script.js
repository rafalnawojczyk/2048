"use strict";

let tiles = [];
let score = 0;
let maxScore = 0;
let savedMoves = [];
let savingMovesAmount = 25;
let undoAnimation, newGameAnimation;
let movement = 0;
let initX = null;
let initY = null;

const generateBoard = function () {
    for (let i = 0; i < 16; i++) {
        let tile = document.createElement("div");
        tile.classList.add(`game-cell`);
        tiles.push(tile);
        document.querySelector(".game").appendChild(tile);
    }
};

const newGame = function (e) {
    if (document.querySelector(".game-over")) {
        undoAnimation?.cancel();
        newGameAnimation?.cancel();
        document.querySelector(".header").removeChild(document.querySelector(".game-over"));
    }

    if (score > maxScore) {
        maxScore = score;
        document.querySelector(".best-score").textContent = score;
    }

    score = 0;
    document.querySelector(".actual-score").textContent = 0;
    e.preventDefault();
    tiles = [];
    document.querySelector(".game").innerHTML = "";
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
    const checkForChanges = function (newRow, rowArray) {
        let changes = 0;
        for (let y = 0; y < 4; y++) {
            if (newRow[y] !== rowArray[y]) {
                changes++;
            }
        }
        if (changes) {
            movement++;
        }
    };

    if (direction === "ArrowDown") {
        for (let i = 0; i < 4; i++) {
            let columnArray = [+tiles[i].textContent, +tiles[i + 4].textContent, +tiles[i + 8].textContent, +tiles[i + 12].textContent];
            let filteredColumn = columnArray.filter(value => value);
            let newColumn = new Array(4 - filteredColumn.length).fill(0);
            newColumn = [...newColumn, ...filteredColumn];

            updateCell(i, newColumn[0]);
            updateCell(i + 4, newColumn[1]);
            updateCell(i + 8, newColumn[2]);
            updateCell(i + 12, newColumn[3]);
            checkForChanges(newColumn, columnArray);
        }
    }

    if (direction === "ArrowUp") {
        for (let i = 0; i < 4; i++) {
            let columnArray = [+tiles[i + 12].textContent, +tiles[i + 8].textContent, +tiles[i + 4].textContent, +tiles[i].textContent];
            let filteredColumn = columnArray.filter(value => value);
            let newColumn = new Array(4 - filteredColumn.length).fill(0);
            newColumn = [...newColumn, ...filteredColumn];

            updateCell(i + 12, newColumn[0]);
            updateCell(i + 8, newColumn[1]);
            updateCell(i + 4, newColumn[2]);
            updateCell(i, newColumn[3]);
            checkForChanges(newColumn, columnArray);
        }
    }

    if (direction === "ArrowRight") {
        for (let i = 0; i < 16; i++) {
            if (i % 4 === 0) {
                let rowArray = [+tiles[i].textContent, +tiles[i + 1].textContent, +tiles[i + 2].textContent, +tiles[i + 3].textContent];
                let filteredRow = rowArray.filter(value => value);
                let newRow = new Array(4 - filteredRow.length).fill(0);
                newRow = [...newRow, ...filteredRow];

                updateCell(i, newRow[0]);
                updateCell(i + 1, newRow[1]);
                updateCell(i + 2, newRow[2]);
                updateCell(i + 3, newRow[3]);
                checkForChanges(newRow, rowArray);
            }
        }
    }

    if (direction === "ArrowLeft") {
        for (let i = 0; i < 16; i++) {
            if (i % 4 === 0) {
                let rowArray = [+tiles[i + 3].textContent, +tiles[i + 2].textContent, +tiles[i + 1].textContent, +tiles[i].textContent];
                let filteredRow = rowArray.filter(value => value);
                let newRow = new Array(4 - filteredRow.length).fill(0);
                newRow = [...newRow, ...filteredRow];

                updateCell(i + 3, newRow[0]);
                updateCell(i + 2, newRow[1]);
                updateCell(i + 1, newRow[2]);
                updateCell(i, newRow[3]);

                checkForChanges(newRow, rowArray);
            }
        }
    }
};

const combineTiles = function (direction) {
    if (direction === "ArrowLeft") {
        for (let i = 0; i < 16; i++) {
            if (i % 4 === 0) {
                if (+tiles[i].textContent === +tiles[i + 1].textContent) {
                    let value = +tiles[i].textContent + +tiles[i + 1].textContent;
                    if (value !== 0) {
                        clearCell(i + 1);
                        updateCell(i, value);
                        score += value;
                        movement++;
                    }
                }

                if (+tiles[i + 1].textContent === +tiles[i + 2].textContent) {
                    let value = +tiles[i + 1].textContent + +tiles[i + 2].textContent;
                    if (value !== 0) {
                        clearCell(i + 2);
                        updateCell(i + 1, value);
                        score += value;
                        movement++;
                    }
                }

                if (+tiles[i + 2].textContent === +tiles[i + 3].textContent) {
                    let value = +tiles[i + 2].textContent + +tiles[i + 3].textContent;
                    if (value !== 0) {
                        clearCell(i + 3);
                        updateCell(i + 2, value);
                        score += value;
                        movement++;
                    }
                }
            }
        }
    }
    if (direction === "ArrowRight") {
        for (let i = 0; i < 16; i++) {
            if (i % 4 === 0) {
                if (+tiles[i + 3].textContent === +tiles[i + 2].textContent) {
                    let value = +tiles[i + 3].textContent + +tiles[i + 2].textContent;
                    if (value !== 0) {
                        clearCell(i + 3);
                        updateCell(i + 2, value);
                        score += value;
                        movement++;
                    }
                }

                if (+tiles[i + 2].textContent === +tiles[i + 1].textContent) {
                    let value = +tiles[i + 2].textContent + +tiles[i + 1].textContent;
                    if (value !== 0) {
                        clearCell(i + 2);
                        updateCell(i + 1, value);
                        score += value;
                        movement++;
                    }
                }

                if (+tiles[i + 1].textContent === +tiles[i].textContent) {
                    let value = +tiles[i + 1].textContent + +tiles[i].textContent;
                    if (value !== 0) {
                        clearCell(i + 1);
                        updateCell(i, value);
                        score += value;
                        movement++;
                    }
                }
            }
        }
    }

    if (direction === "ArrowUp") {
        for (let i = 0; i < 4; i++) {
            if (+tiles[i].textContent === +tiles[i + 4].textContent) {
                let value = +tiles[i].textContent + +tiles[i + 4].textContent;
                if (value !== 0) {
                    clearCell(i + 4);
                    updateCell(i, value);
                    score += value;
                    movement++;
                }
            }

            if (+tiles[i + 4].textContent === +tiles[i + 8].textContent) {
                let value = +tiles[i + 4].textContent + +tiles[i + 8].textContent;
                if (value !== 0) {
                    clearCell(i + 8);
                    updateCell(i + 4, value);
                    score += value;
                    movement++;
                }
            }

            if (+tiles[i + 8].textContent === +tiles[i + 12].textContent) {
                let value = +tiles[i + 8].textContent + +tiles[i + 12].textContent;
                if (value !== 0) {
                    clearCell(i + 12);
                    updateCell(i + 8, value);
                    score += value;
                    movement++;
                }
            }
        }
    }
    if (direction === "ArrowDown") {
        for (let i = 0; i < 4; i++) {
            if (+tiles[i + 12].textContent === +tiles[i + 8].textContent) {
                let value = +tiles[i + 12].textContent + +tiles[i + 8].textContent;
                if (value !== 0) {
                    clearCell(i + 12);
                    updateCell(i + 8, value);
                    score += value;
                    movement++;
                }
            }

            if (+tiles[i + 8].textContent === +tiles[i + 4].textContent) {
                let value = +tiles[i + 8].textContent + +tiles[i + 4].textContent;
                if (value !== 0) {
                    clearCell(i + 8);
                    updateCell(i + 4, value);
                    score += value;
                    movement++;
                }
            }

            if (+tiles[i + 4].textContent === +tiles[i].textContent) {
                let value = +tiles[i + 4].textContent + +tiles[i].textContent;
                if (value !== 0) {
                    clearCell(i + 4);
                    updateCell(i, value);
                    score += value;
                    movement++;
                }
            }
        }
    }
};

const updateScore = function () {
    document.querySelector(".actual-score").textContent = score;
};

const updateTiles = function (event) {
    if (event === "ArrowUp" || event === "ArrowDown" || event === "ArrowLeft" || event === "ArrowRight") {
        saveActualState();
        slideTiles(event);
        combineTiles(event);
        slideTiles(event);
        if (movement === 0 && !document.querySelector(".game-over")) {
            savedMoves.pop();
        }
        if (movement > 0) {
            generateTile();
            movement = 0;
        }

        updateScore();
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
    }
};

const undoMove = function (e) {
    e.preventDefault();
    if (document.querySelector(".game-over")) {
        undoAnimation?.cancel();
        newGameAnimation?.cancel();
        document.querySelector(".header").removeChild(document.querySelector(".game-over"));
    }

    if (savedMoves.length > 0) {
        for (let i = 0; i < 16; i++) {
            if (savedMoves[savedMoves.length - 1][i]) {
                updateCell(i, savedMoves[savedMoves.length - 1][i]);
                score = savedMoves[savedMoves.length - 1][16];
                document.querySelector(".actual-score").textContent = score;
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
        for (let i = 0; i < 16; i++) {
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

document.querySelector(".game").addEventListener("touchstart", startTouch, false);
document.querySelector(".game").addEventListener("touchmove", moveTouch, false);

document.addEventListener("DOMContentLoaded", function (e) {
    generateBoard();
    generateTile();
    generateTile();
});

document.addEventListener("keydown", function (event) {
    if (event.repeat) {
        return;
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
