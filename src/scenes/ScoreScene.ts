import { SharedConfig } from '..';
import { BaseScene } from './BaseScene';

export class ScoreScene extends BaseScene {
  constructor(config: SharedConfig) {
    super('ScoreScene', {...config, canGoBack: true});

  }

  create() {
    super.create();
    this.add.image(this.screenCenter[0] - 12, this.screenCenter[1], 'screenBot').setOrigin(0.5);
    const bestScore = localStorage.getItem('bestScore');
    this.add.text(this.screenCenter[0], this.screenCenter[1], `Score: ${bestScore || 0}`, {fontSize: '32px', fill: '#000'})
      .setOrigin(0.5, 1);
    
  }
}