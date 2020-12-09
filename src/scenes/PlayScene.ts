import 'phaser';
import { SharedConfig } from '..';
import { BaseScene } from './BaseScene';

const PIPES_TO_RENDER = 4;

interface Difficulty {
  easy: { pipeHorizDistRange: number[]; pipeVertDistRange: number[];}
  normal: { pipeHorizDistRange: number[]; pipeVertDistRange: number[];}
  hard: { pipeHorizDistRange: number[]; pipeVertDistRange: number[];}
};

// interface Pipe extends Phaser.GameObjects.GameObject {
//   getBounds?: () => {right: number};
//   x: number;
//   y: number
// }

export class PlayScene extends BaseScene {
  bot: Phaser.Physics.Arcade.Sprite;
  pipes: Phaser.Physics.Arcade.Group;
  isPaused: boolean;
  pipeHorizontalDist: number;
  pipeVertDistRange: number[];
  pipeHorizDistRange: number[];
  flapVelocity: number;
  score: number;
  scoreText: Phaser.GameObjects.Text;
  currentDifficulty: keyof Difficulty;
  difficulty: Difficulty;
  pauseEvent: Phaser.Events.EventEmitter;
  initialTime: number;
  countDownText: Phaser.GameObjects.Text;
  timeEvent: Phaser.Time.TimerEvent;
  constructor(config: SharedConfig) {
    super('PlayScene', config);

    this.bot = null;
    this.pipes = null;
    this.isPaused = false;

    this.pipeHorizontalDist = 0;
    this.pipeVertDistRange = [150, 250];
    this.pipeHorizDistRange = [300, 500];
    this.flapVelocity = 300;

    this.score = 0;
    this.scoreText = null;

    this.currentDifficulty = 'easy';
    this.difficulty = {
      'easy': {
        pipeHorizDistRange: [300, 450],
        pipeVertDistRange: [150, 200],
      },
      'normal': {
        pipeHorizDistRange: [280, 350],
        pipeVertDistRange: [140, 190],
      },
      'hard': {
        pipeHorizDistRange: [250, 310],
        pipeVertDistRange: [120, 170],
      },
    }
  }

  create() {
    this.currentDifficulty = 'easy';
    super.create();
    this.createbot();
    this.createPipes();
    this.createColliders();
    this.createScore();
    this.createPause();
    this.handleInputs();
    this.listenToEvents();

    this.anims.create({
      key: 'fly',
      frames: this.anims.generateFrameNumbers('bot', {start: 0, end: 7}),
      frameRate: 8,
      repeat: -1
    });
    this.anims.create({
      key: 'up',
      frames: this.anims.generateFrameNumbers('botUp', {start: 0, end: 4}),
      frameRate: 16,
      repeat: 0,
    });
    this.anims.create({
      key: 'ohno',
      frames: this.anims.generateFrameNumbers('botOhno', {start: 0, end: 2}),
      frameRate: 8,
      repeat: 0
    });

    this.bot.play('fly');

    this.bot.on('animationcomplete', (animation: Phaser.Animations.Animation) => {
      if (animation.key === 'up') {
        this.bot.play('fly');
      }
    });
  }

  update() {
    this.checkGameStatus();
    this.recyclePipes();
  }

  listenToEvents() {
    if (this.pauseEvent) return;
    this.pauseEvent = this.events.on('resume', () => {
      this.initialTime = 3;
      this.countDownText = this.add.text(this.screenCenter[0], this.screenCenter[1], `Fly in ${this.initialTime}`, this.fontOptions).setOrigin(0.5);
      this.timeEvent = this.time.addEvent({
        delay: 1000,
        callback: this.countDown,
        callbackScope: this,
        loop: true
      });
    });
  }

  countDown() {
    this.initialTime--;
    this.countDownText.setText(`Fly in ${this.initialTime}`);
    if (this.initialTime <= 0) {
      this.isPaused = false;
      this.countDownText.setText('');
      this.physics.resume();
      this.timeEvent.remove();
    }
  }

  createbot() {
    this.bot = this.physics.add.sprite(this.config.startPosition.x, this.config.startPosition.y, 'bot')
      .setOrigin(0);
    this.bot.setBodySize(35, 35).setOffset(2, 29);
    
    this.bot.body.gravity.y = 480;
    this.bot.setCollideWorldBounds(true);

  }

  createPipes() {
    this.pipes = this.physics.add.group();
    for (let i = 0; i < PIPES_TO_RENDER; i++) {
      const upperPipe: Phaser.Physics.Arcade.Sprite = this.pipes
        .create(0, 0, 'pipe')
        .setImmovable(true)
        .setOrigin(0, 1);
      const lowerPipe: Phaser.Physics.Arcade.Sprite = this.pipes
        .create(0, 0, 'pipe')
        .setImmovable(true)
        .setOrigin(0, 0);
      this.placePipe(upperPipe, lowerPipe);
    }
    this.pipes.setVelocityX(-200);
  }

  createColliders() {
    this.physics.add.collider(this.bot, this.pipes, () => this.gameover());
  }

  createScore() {
    this.score = 0;
    const bestScore = localStorage.getItem('bestScore');
    this.scoreText = this.add.text(16, 16, `Score: ${this.score}`, {fontSize: '32px', fill: '#000'});
    this.add.text(16, 52, `Best core: ${bestScore || 0}`, {fontSize: '18px', fill: '#000'});
  }

  createPause() {
    this.isPaused = false;
    const pauseButton = this.add.image(this.config.width - 10, this.config.height - 10, 'pause')
      .setInteractive()
      .setScale(1)
      .setOrigin(1);
      
      pauseButton.on('pointerdown', () => {
        this.isPaused = true;
        this.physics.pause();
        this.scene.pause();
        this.scene.launch('PauseScene');
      });
  }

  handleInputs() {
    this.input.on('pointerdown', () => this.flap());
    this.input.keyboard.on('keydown_SPACE', () => this.flap());
  }

  checkGameStatus() {
    if (this.bot.getBounds().bottom >= this.config.height || this.bot.y <= 0) {
      this.gameover();
    }
  }

  placePipe(uPipe: Phaser.Physics.Arcade.Sprite, lPipe: Phaser.Physics.Arcade.Sprite) {
    const difficulty = this.difficulty[this.currentDifficulty];
    const rightMostX = this.getRightMostPipe();
    const pipeVertDist = Phaser.Math.Between(difficulty.pipeVertDistRange[0], difficulty.pipeVertDistRange[1]);
    const pipeVertPos = Phaser.Math.Between(this.bot.height, this.config.height - this.bot.height - pipeVertDist);
    const pipeHorizDist = Phaser.Math.Between(difficulty.pipeHorizDistRange[0], difficulty.pipeHorizDistRange[1]);
  
    uPipe.x = rightMostX + pipeHorizDist;
    uPipe.y = pipeVertPos;
  
    lPipe.x = uPipe.x;
    lPipe.y = uPipe.y + pipeVertDist;
  }

  flap() {
    if (this.isPaused) return;
    this.bot.play('up');
    this.bot.body.velocity.y = -this.flapVelocity;
  }

  increaseScore() {
    this.score++;
    this.scoreText.setText(`Score: ${this.score}`);
  }

  recyclePipes() {
    let tempPipe: Phaser.Physics.Arcade.Sprite[] = [];
    this.pipes.getChildren().forEach((p: Phaser.Physics.Arcade.Sprite)=> {
      if (p.getBounds().right <= 0) {
        tempPipe.push(p);
        if (tempPipe.length === 2) {
          this.placePipe(tempPipe[0], tempPipe[1]);
          this.increaseScore();
          this.saveBestScore();
          this.increaseDifficulty();
        }
      }
    });
  }

  increaseDifficulty() {
    if (this.score === 10) {
      this.currentDifficulty = 'normal';
    }
    if (this.score === 20) {
      this.currentDifficulty = 'hard';
    }
  }

  getRightMostPipe() {
    let rightmostX = 0;
    this.pipes.getChildren().forEach((p: Phaser.Physics.Arcade.Sprite) => {
      rightmostX = Math.max(p.x, rightmostX);
    });
    return rightmostX;
  };

  saveBestScore() {
    const bestScoreText = localStorage.getItem('bestScore');
    const bestScore = bestScoreText && parseInt(bestScoreText, 10);

    if (!bestScore || this.score > bestScore) {
      localStorage.setItem('bestScore', this.score.toString());
    }
  }

  gameover() {
    // this.bot.x = this.config.startPosition.x;
    // this.bot.y = this.config.startPosition.y;
    // this.bot.body.velocity.y = 0;
    this.physics.pause();
    this.bot.setTint(0xEE4024);

    this.bot.play('ohno');
    // this.bot.anims.stop();

    this.saveBestScore();

    this.time.addEvent({
      delay: 1000,
      callback: () => {
        this.scene.restart();
      },
      loop: false
    })
  }
}    