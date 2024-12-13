// Canvas and Game Setup
let board;
let b_height = 580;
let b_width = 360;
let Context;

// Bird
let bird_width = 36;
let bird_height = 26;
let bird_x = b_width / 8;
let bird_y = b_height / 2;
let bird_img;

let bird = {
    x: bird_x,
    y: bird_y,
    height: bird_height,
    width: bird_width
};

// Pipes
let pipeArray = [];
let pipe_width = 65;
let pipe_height = 480;
let pipeX = b_width;
let pipeY = 0;

let toppipe_img;
let bottompipe_img;

// Physics
let velocityX = -2;
let velocityY = 0;
let gravity = 0.22;
let gameover = false;

// Scoring
let score = 0;
let highscore = 0;

window.onload = function () {
    board = document.getElementById("board");
    resizeCanvas();

    Context = board.getContext("2d");

    // Load Images
    bird_img = new Image();
    bird_img.src = "./flappybird.png";
    bird_img.onload = function () {
        Context.drawImage(bird_img, bird.x, bird.y, bird.width, bird.height);
    };

    toppipe_img = new Image();
    toppipe_img.src = "./toppipe.png";

    bottompipe_img = new Image();
    bottompipe_img.src = "./bottompipe.png";

    // Start the game
    requestAnimationFrame(update);
    setInterval(placePipe, 1500);

    // Event listeners for bird movement
    document.addEventListener("keydown", movebird);
    board.addEventListener("click", jump);

    // Adjust canvas on window resize
    window.addEventListener("resize", resizeCanvas);
};

function resizeCanvas() {
    const container = document.getElementById("container");
    board.width = container.offsetWidth;
    board.height = container.offsetHeight;
    b_width = board.width;
    b_height = board.height;

    // Update bird's position based on new dimensions
    bird.x = b_width / 8;
    bird.y = b_height / 2;

    // Adjust pipes
    pipeArray = [];
}

function update() {
    if (gameover) {
        return;
    }

    requestAnimationFrame(update);
    Context.clearRect(0, 0, b_width, b_height);

    // Update bird position
    velocityY += gravity;
    bird.y += velocityY;

    // Prevent bird from going off-screen
    if (bird.y + bird.height > b_height) {
        bird.y = b_height - bird.height;
        velocityY = 0;
        endGame();
    }
    if (bird.y < 0) {
        bird.y = 0;
        velocityY = 0;
    }

    // Draw the bird
    Context.drawImage(bird_img, bird.x, bird.y, bird.width, bird.height);

    // Update and draw pipes
    for (let i = 0; i < pipeArray.length; i++) {
        let pipe = pipeArray[i];
        pipe.x += velocityX;
        Context.drawImage(pipe.img, pipe.x, pipe.y, pipe.width, pipe.height);

        // Check for collision with the current pipe
        if (detect_collision(bird, pipe)) {
            endGame();
            return;
        }

        // Increment score if the bird passes a pipe
        if (!pipe.passed && pipe.x + pipe.width < bird.x) {
            pipe.passed = true;
            score += 0.5;
        }
    }

    // Display the score
    Context.fillStyle = "black";
    Context.font = "20px Arial";
    Context.fillText(`Score: ${score}`, 10, 25);
    Context.fillText(`Highscore: ${highscore}`, 10, 50);

    // Remove off-screen pipes
    pipeArray = pipeArray.filter(pipe => pipe.x + pipe.width > 0);
}

function placePipe() {
    if (gameover) {
        return;
    }

    let randomPipeY = pipeY - pipe_height / 4 - Math.random() * (pipe_height / 2);
    let opening_space = board.height / 2.3; // Space between top and bottom pipes

    let topPipe = {
        img: toppipe_img,
        x: pipeX,
        y: randomPipeY,
        width: pipe_width,
        height: pipe_height,
        passed: false
    };
    pipeArray.push(topPipe);

    let bottomPipe = {
        img: bottompipe_img,
        x: pipeX,
        y: randomPipeY + pipe_height + opening_space,
        width: pipe_width,
        height: pipe_height,
        passed: false
    };
    pipeArray.push(bottomPipe);
}

function movebird(event) {
    if (event.code === "Space" || event.code === "ArrowUp" || event.code === "KeyX") {
        if (gameover) {
            restartGame();
        } else {
            jump();
        }
    }
}

function jump() {
    if (!gameover) {
        velocityY = -6;
    }
}

function detect_collision(a, b) {
    return a.x < b.x + b.width &&
           a.x + a.width > b.x &&
           a.y < b.y + b.height &&
           a.y + a.height > b.y;
}

function endGame() {
    gameover = true;
    if (score > highscore) {
        highscore = score;
    }

    // Show game-over screen with restart button
    const overlay = document.createElement("div");
    overlay.id = "game-over-overlay";
    overlay.style.position = "absolute";
    overlay.style.top = "0";
    overlay.style.left = "0";
    overlay.style.width = "100%";
    overlay.style.height = "100%";
    overlay.style.background = "rgba(0, 0, 0, 0.7)";
    overlay.style.color = "white";
    overlay.style.display = "flex";
    overlay.style.alignItems = "center";
    overlay.style.justifyContent = "center";
    overlay.innerHTML = `
        <div style="text-align: center;">
            <h1>Game Over</h1>
            <p>Score: ${score}</p>
            <p>Highscore: ${highscore}</p>
            <button onclick="restartGame()" style="padding: 10px 20px; font-size: 18px;">Restart</button>
        </div>
    `;
    document.getElementById("container").appendChild(overlay);
}

function restartGame() {
    // Remove the overlay
    const overlay = document.getElementById("game-over-overlay");
    if (overlay) {
        overlay.remove();
    }

    // Reset game variables
    gameover = false;
    bird.y = b_height / 2;
    velocityY = 0;
    pipeArray = [];
    score = 0;

    // Start the game loop
    requestAnimationFrame(update);
}
