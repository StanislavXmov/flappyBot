
import { MenuItem, SharedConfig } from '..';
import { BaseScene } from './BaseScene';

export class MenuScene extends BaseScene {
  menu: MenuItem[];
  constructor(config: SharedConfig) {
    super('MenuScene', config);

    this.menu = [
      {scene: 'PlayScene', text: 'Play'},
      {scene: 'ScoreScene', text: 'Score'},
      {scene: null, text: 'Exit'},
    ];
  }

  create() {
    super.create();
    this.add.image(this.screenCenter[0] - 12, this.screenCenter[1], 'screenBot').setOrigin(0.5);
    this.createMenu(this.menu, this.setupMenuEvents.bind(this));
  }

  setupMenuEvents(menuItems: MenuItem) {
    const {textGO} = menuItems;
    textGO.setInteractive();

    textGO.on('pointerover', () => {
      textGO.setStyle({fill: '#fff'});
    });
    textGO.on('pointerout', () => {
      textGO.setStyle({fill: '#3d3d3d'});
    });
    textGO.on('pointerup', () => {
      menuItems.scene && this.scene.start(menuItems.scene);
      if (menuItems.text === 'Exit') {
        this.game.destroy(true);
      }
    });
  }

}