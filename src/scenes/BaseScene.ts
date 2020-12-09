import 'phaser';
import { MenuItem, SharedConfig } from '..';

export class BaseScene extends Phaser.Scene {
  config: SharedConfig;
  screenCenter: number[];
  fontSize: number;
  lineHight: number;
  fontOptions: { fontSize: string; fill: string; };
  
  constructor(key: string, config: SharedConfig) {
    super(key);
    this.config = config;
    this.screenCenter = [config.width / 2, config.height / 2];
    this.fontSize = 34;
    this.lineHight = 42;
    this.fontOptions = {fontSize: `${this.fontSize}px`, fill: '#3d3d3d'}
  }

  create() {
    this.add.image(0, 0, 'bg').setOrigin(0, 0);
    if (this.config.canGoBack) {
      const backButton = this.add.image(this.config.width - 10, this.config.height - 10, 'back')
        .setOrigin(1)
        .setScale(1)
        .setInteractive()
      backButton.on('pointerup', () => {
        this.scene.start('MenuScene');
      });
    }
  }

  createMenu(menu: MenuItem[], setup: (menuItem: MenuItem) => void) {
    let lastMenuPosY = 0;
    menu.forEach(menuItem => {
      const menuPosition = [this.screenCenter[0], this.screenCenter[1] + lastMenuPosY];
      menuItem.textGO = this.add.text(menuPosition[0], menuPosition[1], menuItem.text, this.fontOptions)
        .setOrigin(0.5, 1);
      lastMenuPosY += this.lineHight;
      setup(menuItem);
    });
  }

}