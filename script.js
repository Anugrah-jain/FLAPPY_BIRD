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
let gravity = 0.3;
let gameover = false;

// Scoring
let score = 0;
let highscore = 0;

window.onload = function () {
    board = document.getElementById("board");
    board.height = b_height;
    board.width = b_width;
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
};

function update() {
    if (gameover) {
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
                <p>Score: ${Math.floor(score)}</p>
                <p>Highscore: ${highscore}</p>
                <button onclick="restartGame()" style="padding: 10px 20px; font-size: 18px;">Restart</button>
            </div>
        `;
        document.getElementById("container").appendChild(overlay);
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

    // Draw the bird with rotation
    Context.save();
    Context.translate(bird.x + bird.width / 2, bird.y + bird.height / 2);
    let angle = Math.min(Math.max(velocityY / 10, -0.5), 0.5);
    Context.rotate(angle);
    Context.drawImage(bird_img, -bird.width / 2, -bird.height / 2, bird.width, bird.height);
    Context.restore();

    // Update and draw pipes
    for (let i = 0; i < pipeArray.length; i++) {
        let pipe = pipeArray[i];
        pipe.x += velocityX;
        Context.drawImage(pipe.img, pipe.x, pipe.y, pipe.width, pipe.height);

        // Check for collision
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

    // Increase difficulty every 20 points, up to 100
    if (score >= 20 && score < 40) {
        velocityX = -3; // Increase pipe speed
        gravity = 0.35;  // Increase gravity
    } else if (score >= 40 && score < 60) {
        velocityX = -4; // Further increase speed
        gravity = 0.4;   // Further increase gravity
    } else if (score >= 60 && score < 80) {
        velocityX = -5; // Further increase speed
        gravity = 0.45;  // Further increase gravity
    } else if (score >= 80 && score < 100) {
        velocityX = -6; // Further increase speed
        gravity = 0.5;  // Further increase gravity
    }

    // Display the score
    Context.fillStyle = "black";
    Context.font = "20px Arial";
    Context.fillText(`Score: ${Math.floor(score)}`, 10, 25);
    Context.fillText(`Highscore: ${highscore}`, 10, 50);

    // Remove off-screen pipes
    pipeArray = pipeArray.filter(pipe => pipe.x + pipe.width > 0);
}

function placePipe() {
    if (gameover) return;

    let randomPipeY = pipeY - pipe_height / 4 - Math.random() * (pipe_height / 2);
    let opening_space = b_height / 4;

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
        highscore = Math.floor(score);
    }
}

function restartGame() {
    gameover = false;
    bird.y = b_height / 2;
    velocityY = 0;
    pipeArray = [];
    score = 0;
    velocityX = -2; // Reset speed
    gravity = 0.3;  // Reset gravity

    // Remove the game-over overlay if it exists
    const overlay = document.getElementById("game-over-overlay");
    if (overlay) {
        overlay.remove();
    }

    requestAnimationFrame(update);
}
