let config = {
    type: Phaser.AUTO,
    width: 480,
    height: 320,
    physics: {
        default: 'arcade'
    },
    scene: {
        init: init,
        preload: preload,
        create: create,
        update: update
    },
    audio: {
        disableWebAudio: true
    },
    autoCenter: true
};


let game = new Phaser.Game(config);

let titleScreen, playButton;
let frog, mumFrog;
let nbrTileMumFrog = Phaser.Math.Between(0, 29);
let car = [];
let down, up, left, right;
let tweenHeart;
let onWelcomeScreen = true;
let counter;
let timerText;
let scoreText, scoreTextFinal;
let savedFrog = 0;
let jumpSound, trafficSound, smashedSound;

function init() {
   
}

function preload() {
    this.load.image("background", "./assets/images/FroggerBackground.png");
    this.load.image("frog", "./assets/images/Frog.png");
    this.load.image("mumfrog", "./assets/images/MumFrog.png");
    this.load.image("heart", "./assets/images/heart.png");
    this.load.image("car0", "./assets/images/car.png");
    this.load.image("car1", "./assets/images/F1-1.png");
    this.load.image("car2", "./assets/images/snowCar.png");
    this.load.image("deadfrog", "./assets/images/deadFrog.png");
    this.load.image("titlescreen", "./assets/images/TitleScreen.png");
    this.load.image("playbutton", "./assets/images/playButton.webp");

    this.load.audio("jump", "./assets/audio/coaac.wav");
    this.load.audio("smashed", "./assets/audio/smashed.wav");
    this.load.audio("traffic", "./assets/audio/trafic.wav");
}

function create() {

    down = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.DOWN);
    up = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.UP);
    left = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.LEFT);
    right = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.RIGHT); 


    backgroundImage = this.add.image(0, 0, "background");
    backgroundImage.setOrigin(0, 0);

    frog = this.add.image(241, 296, "frog");
    nbrTileMumFrog = Phaser.Math.Between(0, 29);
    mumFrog = this.add.image(nbrTileMumFrog * 16, 0, "mumfrog");
    mumFrog.setOrigin(0, 0)
    deadfrog = this.add.image(-100, -100, "deadfrog");


    for (let j = 0; j < 3; j++){
        for (let i = 0; i < 10; i++){
            let index = i+j*10;
            let randomCarSpace = Phaser.Math.Between(-15, 15);
            let randomCar = Phaser.Math.Between(0, 2);
            car[index] = this.physics.add.image(-50 + i*55 + randomCarSpace, 192 + j*32, "car"+randomCar);
            car[index].setOrigin(0, 0);
            car[index].setVelocity(100, 0); 
        }
    }

    for (let j = 0; j < 3; j++){
        for (let i = 0; i < 10; i++){
            let index = i+j*10 + 30;
            let randomCarSpace = Phaser.Math.Between(-15, 15);
            let randomCar = Phaser.Math.Between(0, 2);
            car[index] = this.physics.add.image(480 + i*55 + randomCarSpace, 64 + j*32, "car"+randomCar);
            car[index].setOrigin(0, 0);
            car[index].setAngle(180);
            car[index].setVelocity(-100, 0); 
        }
    }

    let heart = this.add.image(240, 160, "heart");
    heart.setScale(0.0);
    tweenHeart = this.tweens.add({
        targets: heart,
        scale: 4.0,
        alpha: 1.0,
        duration: 5000,
        ease: 'Linear',
        yoyo: false,
        loop: 0,
        paused: true
        });

    timerText = this.add.text(448, 288, "", {
        fontFamily: "PixelFont",
        fontSize: 16,
        color: "#fff200"
        });
        
    countdownTimer = this.time.addEvent({
        delay: 1000,
        callback: countdown, 
        callbackScope: this, 
        repeat: -1,
        paused: false
        });

    scoreText = this.add.text(8, 290, "Frogs saved: " + savedFrog, {
        fontFamily: "PixelFont",
        fontSize: 13,
        color: "#fff200"
        });

    titleScreen = this.add.image(0, 0, "titlescreen").setInteractive();
    titleScreen.setOrigin(0, 0);
    titleScreen.setScale(0.7);
    playButton = this.add.image(240, 280, "playbutton").setInteractive();
    playButton.on('pointerdown', startGame);
    playButton.setScale(0.05);

    scoreTextFinal = this.add.text(80, 10, "", {
        fontFamily: "PixelFont",
        fontSize: 16,
        color: "#fff200"
        });

    jumpSound = this.sound.add("jump");
    smashedSound = this.sound.add("smashed"); 
    trafficSound = this.sound.add("traffic"); 

}

function update() {
    // frog movement
    if (!onWelcomeScreen){
        if (Phaser.Input.Keyboard.JustDown(down) && frog.y < 304){
            frog.y += 16;
            frog.setAngle(180);
            jumpSound.play();
        }
        if (Phaser.Input.Keyboard.JustDown(up) && frog.y > 16){
            frog.y -= 16;
            frog.setAngle(0);
            jumpSound.play();
        }
        if (Phaser.Input.Keyboard.JustDown(left) && frog.x > 16){
            frog.x -= 16;
            frog.setAngle(-90);
            jumpSound.play();
        }
        if (Phaser.Input.Keyboard.JustDown(right) && frog.x < 464){
            frog.x += 16;
            frog.setAngle(90);
            jumpSound.play();
        }
    }

    // collision with mumFrog
    if(Phaser.Geom.Intersects.RectangleToRectangle(frog.getBounds(),mumFrog.getBounds())) {
        savedFrog += 1;
        scoreText.text = "Frogs saved: " + savedFrog;
        frog.x = -100;
        tweenHeart.play();
        setTimeout(newFrog, 1000);
    }

    // car movement + collision with cars
    for (let i = 0; i < 60; i++){
        if (i < 30 && car[i].x > 500){
            car[i].x = -50;
        }
        if (i >= 30 && car[i].x < -50){
            car[i].x = 500;
        }

        if(Phaser.Geom.Intersects.RectangleToRectangle(frog.getBounds(),car[i].getBounds())) {
            savedFrog -= 1;
            scoreText.text = "Frogs saved: " + savedFrog;
            deadfrog.setPosition(frog.x, frog.y);
            frog.x = -100;
            setTimeout(newFrog, 3000);
            smashedSound.play();
        }
    }

}

function startGame() {
    titleScreen.setVisible(false);
    playButton.setVisible(false);
    onWelcomeScreen = false;
    countdownTimer.paused = false;
    savedFrog = 0;
    counter = 90;
    trafficSound.play({
        loop: true
        });
   } 

function countdown(){
    counter -= 1;
    timerText.text = counter;
    if (counter == 0){
        gameOver();
    }
}

function newFrog(){
    nbrTileMumFrog = Phaser.Math.Between(0, 29);
    mumFrog.setPosition(nbrTileMumFrog * 16, 0);
    deadfrog.setPosition(-100, -100);
    frog.setPosition(241, 296);
    frog.setAngle(0);
}

function gameOver(){
    countdownTimer.paused = true;
    titleScreen.setVisible(true);
    playButton.setVisible(true);
    if (savedFrog >= 0){
        scoreTextFinal.text = "You have saved " + savedFrog +  " frog(s)";
    }
    else{
        scoreTextFinal.text = "You have murdered " + -savedFrog +  " frog(s)";
    }
}
