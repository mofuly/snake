const CSS_SCENE = ".main .scene";
const CSS_TITLE = ".main .title";
const CSS_FOOTER = ".main .footer";
const CSS_PAUSE = ".main .pause";
const CSS_GAME_OVER = ".main .game-over";
const CSS_GAME_OVER_BUTTON = ".main .game-over button";

const CSS_LEVEL = ".main .information .level";
const CSS_SCORE = ".main .information .score";
const CSS_APPEAR = "appear";
const CSS_DISAPPEAR = "disappear";
const CSS_APPEAR_INLINE = "appear-inline";
const CSS_SCENE_CELL = ".main .scene div";
const CSS_SNAKE_HEAD = "snake-head";
const CSS_SNAKE_BODY = "snake-body";
const CSS_FOOD = "food";

const SPACE = 32;
const LEFT = 37;
const UP = 38;
const RIGHT = 39;
const DOWN = 40;
const INTERVAL = 1000;
const UPGRADE_INTERVAL = 80;
const MIN_INTERVAL = 130;

const FOOD = "🐁";
const UPGRADE_SCORE = 20;
const FOOD_SCORE = 1;

MSG_SCORE = "捕获";
MSG_LEVEL = "食量";

class Scene {
    constructor(rows = 25, cols = 20) {
        this.rows = rows;
        this.cols = cols;

        this.elScene = document.querySelector(CSS_SCENE);
        this.elTitle = document.querySelector(CSS_TITLE);
        this.elFooter = document.querySelector(CSS_FOOTER);
        this.elPause = document.querySelector(CSS_PAUSE);
        this.elGameOver = document.querySelector(CSS_GAME_OVER);
        this.elGameOverButton = document.querySelector(CSS_GAME_OVER_BUTTON);
        this.elLevel = document.querySelector(CSS_LEVEL);
        this.elScore = document.querySelector(CSS_SCORE);

        this.toggleLayer(this.elPause);
        this.toggleLayer(this.elGameOver);
        window.addEventListener("keydown", this.keyDown.bind(this));
        this.elGameOverButton.addEventListener("click", (e) => {
            this.toggleLayer(this.elGameOver);
            this.play();
        });
    }

    showInformation() {
        this.elScore.innerHTML = MSG_SCORE + this.score;
        if (this.level > 0) {
            this.elLevel.innerHTML = MSG_LEVEL + FOOD.repeat(this.level);
        } else {
            this.elLevel.innerHTML = MSG_LEVEL + this.level;
        }
    }
    toggleLayer(layer = this.elPause) {
        if (layer.classList.contains(CSS_DISAPPEAR)) {
            layer.classList.remove(CSS_DISAPPEAR);
            layer.classList.add(CSS_APPEAR);
        } else {
            layer.classList.remove(CSS_APPEAR);
            layer.classList.add(CSS_DISAPPEAR);
        }
    }

    generateFood() {
        let notFound = true,
            row, col;

        if (this.snake.length === this.rows * this.cols) return false;

        while (notFound) {
            row = Math.floor(Math.random() * this.rows);
            col = Math.floor(Math.random() * this.cols);
            notFound = false;
            for (let i = 0; i < this.snake.length; i++) {
                if (row === this.snake[i][0] && col === this.snake[i][1]) {
                    notFound = true;
                    break;
                }
            }
        }

        this.food = [];
        this.food.push(row);
        this.food.push(col);
        return true;
    }

    play() {
        // 初始化地图和数据
        this.elScene.innerHTML = "<div></div>".repeat(this.rows * this.cols);

        //初始化蛇数据 snake[0]蛇头坐标
        this.currentRow = 1;
        this.currentCol = 1;
        this.ahead = LEFT; // 蛇头当前运动方向
        this.snake = [
            [this.currentRow, this.currentCol],
            [this.currentRow, this.currentCol + 1],
            [this.currentRow, this.currentCol + 2]
        ];

        this.renderSnake();
        this.generateFood();
        this.renderFood();

        this.isPaused = false;
        this.keyPressed = false;
        this.isGameOver = false;
        this.score = 0;
        this.level = 0;

        this.showInformation();
        this.intervalListener = setInterval(this.timer.bind(this), Math.max(MIN_INTERVAL, INTERVAL - this.level * UPGRADE_INTERVAL));
    }

    renderFood(show = true) {
        let food = show ? FOOD : "";
        let index = this.food[0] * this.cols + this.food[1] + 1;
        document.querySelector(`${CSS_SCENE_CELL}:nth-child(${index})`).innerHTML = food;
    }

    renderSnake(show = true) {
        let className, index;
        for (let i = 0; i < this.snake.length; i++) {
            className = show ? (i === 0 ? CSS_SNAKE_HEAD : CSS_SNAKE_BODY) : "";
            index = this.snake[i][0] * this.cols + this.snake[i][1] + 1;
            document.querySelector(`${CSS_SCENE_CELL}:nth-child(${index})`).className = className;
        }
    }

    dies() {
        clearInterval(this.intervalListener);
        this.isGameOver = true;
        this.toggleLayer(this.elGameOver);
        this.elGameOverButton.focus();
    }

    timer() {
        if (this.isPaused || this.isGameOver) return;
        if (this.keyPressed) {
            this.keyPressed = false;
            return;
        }
        switch (this.ahead) {
            case LEFT:
                this.left();
                break;
            case RIGHT:
                this.right();
                break;
            case UP:
                this.up();
                break;
            case DOWN:
                this.down();
                break;
        }
    }

    keyDown() {
        if (this.isGameOver) return;
        if (event.keyCode === SPACE) { // space
            this.isPaused = !this.isPaused;
            this.toggleLayer(this.elPause);
            return;
        }
        if (this.isPaused) return;

        switch (event.keyCode) {
            case LEFT:
                this.keyPressed = this.left();
                break;
            case RIGHT:
                this.keyPressed = this.right();
                break;
            case UP:
                this.keyPressed = this.up();
                break;
            case DOWN:
                this.keyPressed = this.down();
                break;
        }
    }

    move() {
        this.snake.unshift([this.currentRow, this.currentCol]);
        if (this.currentRow === this.food[0] && this.currentCol === this.food[1]) { // eats the food
            this.renderFood(false);
            this.generateFood();
            this.renderFood();
            this.score += FOOD_SCORE;
            this.level = Math.floor(this.score / UPGRADE_SCORE);
            this.showInformation();
            clearInterval(this.intervalListener);
            this.intervalListener = setInterval(this.timer.bind(this), Math.min(MIN_INTERVAL, INTERVAL - this.level * UPGRADE_INTERVAL));
        } else {
            this.snake.pop();
        }
        let headRow = this.snake[0][0],
            headCol = this.snake[0][1];
        for (let i = 1; i < this.snake.length; i++) {
            if (headRow === this.snake[i][0] && headCol === this.snake[i][1]) {
                this.dies();
            }
        }
    }

    left() {
        if (this.ahead === RIGHT) return false;
        this.renderSnake(false);
        this.ahead = LEFT;
        this.currentCol--;
        if (this.currentCol < 0) this.currentCol = this.cols - 1;
        this.move();
        this.renderSnake();
        return true;
    }
    right() {
        if (this.ahead === LEFT) return false;
        this.renderSnake(false);
        this.ahead = RIGHT;
        this.currentCol++;
        if (this.currentCol === this.cols) this.currentCol = 0;
        this.move();
        this.renderSnake();
        return true;
    }
    down() {
        if (this.ahead === UP) return false;
        this.renderSnake(false);
        this.ahead = DOWN;
        this.currentRow++;
        if (this.currentRow === this.rows) this.currentRow = 0;
        this.move();
        this.renderSnake();
        return true;
    }
    up() {
        if (this.ahead === DOWN) return false;
        this.renderSnake(false);
        this.ahead = UP;
        this.currentRow--;
        if (this.currentRow < 0) this.currentRow = this.rows - 1;
        this.move();
        this.renderSnake();
        return true;
    }
}

let scene = new Scene();
scene.play();