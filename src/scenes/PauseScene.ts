
import { MenuItem, SharedConfig } from '..';
import { BaseScene } from './BaseScene';

export class PauseScene extends BaseScene {
  menu: MenuItem[];
  constructor(config: SharedConfig) {
    super('PauseScene', config);

    this.menu = [
      {scene: 'PlayScene', text: 'Continue'},
      {scene: 'MenuScene', text: 'Exit'},
    ];
  }

  create() {
    super.create();
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
      if (menuItems.scene && menuItems.text === 'Continue') {
        this.scene.stop();
        this.scene.resume(menuItems.scene);
      } else {
        this.scene.stop('PlayScene');
        this.scene.start(menuItems.scene);
      }
    });
  }
}