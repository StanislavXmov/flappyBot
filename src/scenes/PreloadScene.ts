
export class PreloadScene extends Phaser.Scene {
  constructor() {
    super('PreloadScene');
  }

  preload() {
    this.load.image('bg', 'assets/bg.png');
    this.load.image('screenBot', 'assets/screenBot.png');
    this.load.spritesheet('bot', 'assets/botSprite.png', {
      frameWidth: 71, frameHeight: 79
    });
    this.load.spritesheet('botUp', 'assets/up.png', {
      frameWidth: 71, frameHeight: 79
    });
    this.load.spritesheet('botOhno', 'assets/ohno.png', {
      frameWidth: 71, frameHeight: 79
    });
    this.load.image('pipe', 'assets/pipe.png');

    this.load.image('pause', 'assets/pause.png');
    this.load.image('back', 'assets/back.png');
  }

  create() {
    this.scene.start('MenuScene');
  }
}