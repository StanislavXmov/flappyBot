import "phaser";
import { MenuScene } from "./scenes/MenuScene";
import { PreloadScene } from "./scenes/PreloadScene";
import { ScoreScene } from "./scenes/ScoreScene";
import { PlayScene } from "./scenes/PlayScene";
import { PauseScene } from "./scenes/PauseScene";

const WIDTH: number = 800;
const HEIGHT: number = 600;
const BIRD_POSITION = {x: WIDTH / 10, y: HEIGHT / 2};

export interface SharedConfig {
  width: number;
  height: number;
  startPosition: {x: number, y: number};
  canGoBack?: boolean;
}

export interface MenuItem {
  scene: string | null;
  text: string;
  textGO?: Phaser.GameObjects.Text
}

const SHARED_CONFIG: SharedConfig = {
  width: WIDTH,
  height: HEIGHT,
  startPosition: BIRD_POSITION
}

type GameScenes = typeof PreloadScene | typeof MenuScene | typeof ScoreScene;

const Scenes = [PreloadScene, MenuScene, PlayScene, ScoreScene, PauseScene];
const createScene = (Scene: GameScenes) => new Scene(SHARED_CONFIG);
const initScenes = () => Scenes.map(createScene);

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  ...SHARED_CONFIG,
  physics: {
    default: 'arcade',
    arcade: {
      // gravity: { y: 200 }
      // debug: true
    }
  },
  scene: initScenes()
};

new Phaser.Game(config);
