// TODO: when moving tiles, add to them animation
// Sliding and merging tiles should be made on a temorarly created array that is substitution for a tiles array.
// To calculate where the tile moved in specific direction, there will be a function that calculates that from datasets prev and curr, and creates array for each tile with x and y moves. Then run a function that makes animations based on taht array for each tile
// Then run a function with delay(the same as animations duration), that will print these tiles on their places.
// Calculate how much % or pixels tile has to move to reach its destination point.
"use strict";

let tiles = [];
let score = 0;
let maxScore = 0;
let savedMoves = [];
let savingMovesAmount = 25;
let undoAnimation, newGameAnimation;

const generateBoard = function () {
    for (let i = 0; i < 16; i++) {
        let tile = document.createElement("div");
        tile.classList.add(`game-cell`);
        tile.dataset.curr = "";
        tile.dataset.prev = "";
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

    tiles[number].textContent = value;
    tiles[number].classList.add(`tile-${value}`);
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

    if (unusedTiles.length === 0) {
        checkGameOver();
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
    if (direction === "ArrowDown") {
        for (let i = 0; i < 4; i++) {
            let columnArray = [+tiles[i].textContent, +tiles[i + 4].textContent, +tiles[i + 8].textContent, +tiles[i + 12].textContent];
            let filteredColumn = columnArray.filter(value => value);
            let newColumn = new Array(4 - filteredColumn.length).fill("");
            newColumn = [...newColumn, ...filteredColumn];

            updateCell(i, newColumn[0]);
            updateCell(i + 4, newColumn[1]);
            updateCell(i + 8, newColumn[2]);
            updateCell(i + 12, newColumn[3]);
        }
    }

    if (direction === "ArrowUp") {
        for (let i = 0; i < 4; i++) {
            let columnArray = [+tiles[i + 12].textContent, +tiles[i + 8].textContent, +tiles[i + 4].textContent, +tiles[i].textContent];
            let filteredColumn = columnArray.filter(value => value);
            let newColumn = new Array(4 - filteredColumn.length).fill("");
            newColumn = [...newColumn, ...filteredColumn];

            updateCell(i + 12, newColumn[0]);
            updateCell(i + 8, newColumn[1]);
            updateCell(i + 4, newColumn[2]);
            updateCell(i, newColumn[3]);
        }
    }

    if (direction === "ArrowRight") {
        for (let i = 0; i < 16; i++) {
            if (i % 4 === 0) {
                let rowArray = [+tiles[i].textContent, +tiles[i + 1].textContent, +tiles[i + 2].textContent, +tiles[i + 3].textContent];
                let filteredRow = rowArray.filter(value => value);
                let newRow = new Array(4 - filteredRow.length).fill("");
                newRow = [...newRow, ...filteredRow];

                updateCell(i, newRow[0]);
                updateCell(i + 1, newRow[1]);
                updateCell(i + 2, newRow[2]);
                updateCell(i + 3, newRow[3]);
            }
        }
    }
    if (direction === "ArrowLeft") {
        for (let i = 0; i < 16; i++) {
            if (i % 4 === 0) {
                let rowArray = [+tiles[i + 3].textContent, +tiles[i + 2].textContent, +tiles[i + 1].textContent, +tiles[i].textContent];
                let filteredRow = rowArray.filter(value => value);
                let newRow = new Array(4 - filteredRow.length).fill("");
                newRow = [...newRow, ...filteredRow];

                updateCell(i + 3, newRow[0]);
                updateCell(i + 2, newRow[1]);
                updateCell(i + 1, newRow[2]);
                updateCell(i, newRow[3]);
            }
        }
    }
};

const combineTiles = function (direction) {
    if (direction === "ArrowLeft") {
        for (let i = 0; i < 16; i++) {
            if (i % 4 === 0) {
                let firstTile = tiles[i];
                let secondTile = tiles[i + 1];
                let thirdTile = tiles[i + 2];
                let fourthTile = tiles[i + 3];

                if (+firstTile.textContent === +secondTile.textContent) {
                    let value = +firstTile.textContent + +secondTile.textContent;
                    if (value !== 0) {
                        clearCell(i + 1);
                        updateCell(i, value);
                        score += value;
                    }
                }

                if (+secondTile.textContent === +thirdTile.textContent) {
                    let value = +secondTile.textContent + +thirdTile.textContent;
                    if (value !== 0) {
                        clearCell(i + 2);
                        updateCell(i + 1, value);
                        score += value;
                    }
                }

                if (+thirdTile.textContent === +fourthTile.textContent) {
                    let value = +thirdTile.textContent + +fourthTile.textContent;
                    if (value !== 0) {
                        clearCell(i + 3);
                        updateCell(i + 2, value);
                        score += value;
                    }
                }
            }
        }
    }
    if (direction === "ArrowRight") {
        for (let i = 0; i < 16; i++) {
            if (i % 4 === 0) {
                let firstTile = tiles[i + 3];
                let secondTile = tiles[i + 2];
                let thirdTile = tiles[i + 1];
                let fourthTile = tiles[i];

                if (+firstTile.textContent === +secondTile.textContent) {
                    let value = +firstTile.textContent + +secondTile.textContent;
                    if (value !== 0) {
                        clearCell(i + 3);
                        updateCell(i + 2, value);
                        score += value;
                    }
                }

                if (+secondTile.textContent === +thirdTile.textContent) {
                    let value = +secondTile.textContent + +thirdTile.textContent;
                    if (value !== 0) {
                        clearCell(i + 2);
                        updateCell(i + 1, value);
                        score += value;
                    }
                }

                if (+thirdTile.textContent === +fourthTile.textContent) {
                    let value = +thirdTile.textContent + +fourthTile.textContent;
                    if (value !== 0) {
                        clearCell(i + 1);
                        updateCell(i, value);
                        score += value;
                    }
                }
            }
        }
    }

    if (direction === "ArrowUp") {
        for (let i = 0; i < 4; i++) {
            let firstTile = tiles[i];
            let secondTile = tiles[i + 4];
            let thirdTile = tiles[i + 8];
            let fourthTile = tiles[i + 12];

            if (+firstTile.textContent === +secondTile.textContent) {
                let value = +firstTile.textContent + +secondTile.textContent;
                if (value !== 0) {
                    clearCell(i + 4);
                    updateCell(i, value);
                    score += value;
                }
            }

            if (+secondTile.textContent === +thirdTile.textContent) {
                let value = +secondTile.textContent + +thirdTile.textContent;
                if (value !== 0) {
                    clearCell(i + 8);
                    updateCell(i + 4, value);
                    score += value;
                }
            }

            if (+thirdTile.textContent === +fourthTile.textContent) {
                let value = +thirdTile.textContent + +fourthTile.textContent;
                if (value !== 0) {
                    clearCell(i + 12);
                    updateCell(i + 8, value);
                    score += value;
                }
            }
        }
    }
    if (direction === "ArrowDown") {
        for (let i = 0; i < 4; i++) {
            let firstTile = tiles[i + 12];
            let secondTile = tiles[i + 8];
            let thirdTile = tiles[i + 4];
            let fourthTile = tiles[i];

            if (+firstTile.textContent === +secondTile.textContent) {
                let value = +firstTile.textContent + +secondTile.textContent;
                if (value !== 0) {
                    clearCell(i + 12);
                    updateCell(i + 8, value);
                    score += value;
                }
            }

            if (+secondTile.textContent === +thirdTile.textContent) {
                let value = +secondTile.textContent + +thirdTile.textContent;
                if (value !== 0) {
                    clearCell(i + 8);
                    updateCell(i + 4, value);
                    score += value;
                }
            }

            if (+thirdTile.textContent === +fourthTile.textContent) {
                let value = +thirdTile.textContent + +fourthTile.textContent;
                if (value !== 0) {
                    clearCell(i + 4);
                    updateCell(i, value);
                    score += value;
                }
            }
        }
    }
};

const updateScore = function () {
    document.querySelector(".actual-score").textContent = score;
};

const updateTiles = function (event) {
    saveActualState();
    slideTiles(event);
    combineTiles(event);
    slideTiles(event);
    generateTile();
    updateScore();
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
        // UP
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
        // DOWN
        for (let i = 0; i < 4; i++) {
            if (
                +tiles[i + 12].textContent === +tiles[i + 8].textContent ||
                +tiles[i + 8].textContent === +tiles[i + 4].textContent ||
                +tiles[i + 4].textContent === +tiles[i].textContent
            ) {
                return;
            } else {
                end++;
            }
        }

        //left
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

        //right
        for (let i = 0; i < 16; i++) {
            if (i % 4 === 0) {
                if (
                    +tiles[i + 3].textContent === +tiles[i + 2].textContent ||
                    +tiles[i + 2].textContent === +tiles[i + 1].textContent ||
                    +tiles[i + 1].textContent === +tiles[i].textContent
                ) {
                    return;
                } else {
                    end++;
                }
            }
        }
    }

    if (end === 16) {
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

document.addEventListener("DOMContentLoaded", function (e) {
    generateBoard();
    generateTile();
    generateTile();
});

document.addEventListener("keydown", function (event) {
    if (event.repeat) {
        console.log("repeated");
        return;
    }
    updateTiles(event.key);
});

document.querySelector(".header__btn--undo").addEventListener("mouseup", undoMove);
document.querySelector(".header__btn--new-game").addEventListener("mouseup", newGame);
