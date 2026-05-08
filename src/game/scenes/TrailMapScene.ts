import Phaser from 'phaser';
import { riverCrossings } from '@game/data/riverCrossings';
import { towns } from '@game/data/towns';
import { calculateTrailMapX } from '@game/systems/mapProgress';

export type TrailMapState = {
  distanceTraveled: number;
  totalDistance: number;
};

const TRAIL_START_X = 80;
const TRAIL_END_X = 880;
const TRAIL_Y = 280;

export class TrailMapScene extends Phaser.Scene {
  private wagon?: Phaser.GameObjects.Container;
  private progressLine?: Phaser.GameObjects.Rectangle;
  private distanceLabel?: Phaser.GameObjects.Text;
  private mapState: TrailMapState = {
    distanceTraveled: 0,
    totalDistance: 2000,
  };

  constructor() {
    super('TrailMapScene');
  }

  create() {
    this.cameras.main.setBackgroundColor('#1b1b32');

    this.add
      .text(32, 28, 'Frontier Reckoning', {
        color: '#ffffff',
        fontFamily: 'Fira Mono, Menlo, Consolas, monospace',
        fontSize: '28px',
        fontStyle: '700',
      })
      .setOrigin(0, 0.5);

    this.drawTrail();
    this.drawMilestoneMarkers();
    this.wagon = this.createWagon();
    this.distanceLabel = this.add.text(32, 492, '', {
      color: '#d0d0d5',
      fontFamily: 'Fira Mono, Menlo, Consolas, monospace',
      fontSize: '18px',
    });
    this.updateMapProgress(this.readInitialState());
    this.game.events.emit('trail-map-ready');
  }

  updateMapProgress(nextState: TrailMapState) {
    this.mapState = nextState;
    const wagonX = calculateTrailMapX({
      distanceTraveled: this.mapState.distanceTraveled,
      totalDistance: this.mapState.totalDistance,
      startX: TRAIL_START_X,
      endX: TRAIL_END_X,
    });
    const progressWidth = Math.max(0, wagonX - TRAIL_START_X);

    this.wagon?.setPosition(wagonX, TRAIL_Y - 34);
    this.progressLine?.setSize(progressWidth, 8);
    this.distanceLabel?.setText(
      `${Math.round(this.mapState.distanceTraveled)} / ${this.mapState.totalDistance} miles`,
    );
  }

  private readInitialState(): TrailMapState {
    return {
      distanceTraveled:
        this.registry.get('distanceTraveled') ?? this.mapState.distanceTraveled,
      totalDistance: this.registry.get('totalDistance') ?? this.mapState.totalDistance,
    };
  }

  private drawTrail() {
    this.add.rectangle(TRAIL_START_X, TRAIL_Y, TRAIL_END_X - TRAIL_START_X, 8, 0x3b3b4f).setOrigin(0, 0.5);
    this.progressLine = this.add
      .rectangle(TRAIL_START_X, TRAIL_Y, 0, 8, 0xf1be32)
      .setOrigin(0, 0.5);

    this.add.text(TRAIL_START_X, TRAIL_Y + 42, 'Start', {
      color: '#acd157',
      fontFamily: 'Fira Mono, Menlo, Consolas, monospace',
      fontSize: '16px',
    }).setOrigin(0.5, 0);

    this.add.text(TRAIL_END_X, TRAIL_Y + 42, 'Destination', {
      color: '#ffadad',
      fontFamily: 'Fira Mono, Menlo, Consolas, monospace',
      fontSize: '16px',
    }).setOrigin(0.5, 0);

    this.add.circle(TRAIL_START_X, TRAIL_Y, 10, 0xacd157);
    this.add.circle(TRAIL_END_X, TRAIL_Y, 10, 0xffadad);
  }

  private drawMilestoneMarkers() {
    for (const town of towns) {
      this.drawMarker(town.distance, town.name, 0x99c9ff, TRAIL_Y - 82, 'town');
    }

    for (const river of riverCrossings) {
      this.drawMarker(river.distance, river.name, 0xdbb8ff, TRAIL_Y + 74, 'river');
    }
  }

  private drawMarker(
    distance: number,
    label: string,
    color: number,
    labelY: number,
    kind: 'town' | 'river',
  ) {
    const x = calculateTrailMapX({
      distanceTraveled: distance,
      totalDistance: this.mapState.totalDistance,
      startX: TRAIL_START_X,
      endX: TRAIL_END_X,
    });
    const markerY = kind === 'town' ? TRAIL_Y - 28 : TRAIL_Y + 28;

    this.add.line(x, TRAIL_Y, 0, 0, 0, markerY - TRAIL_Y, color, 0.75).setOrigin(0.5, 0);
    this.add.circle(x, markerY, 7, color);
    this.add
      .text(x, labelY, label, {
        color: '#f5f6f7',
        fontFamily: 'Fira Mono, Menlo, Consolas, monospace',
        fontSize: '13px',
        align: 'center',
        wordWrap: { width: 118 },
      })
      .setOrigin(0.5, 0.5);
  }

  private createWagon() {
    const wagon = this.add.container(TRAIL_START_X, TRAIL_Y - 34);
    const body = this.add.rectangle(0, 0, 46, 24, 0xf1be32);
    const cover = this.add.arc(0, -8, 20, 180, 360, false, 0xffffff);
    const leftWheel = this.add.circle(-16, 14, 6, 0x0a0a23);
    const rightWheel = this.add.circle(16, 14, 6, 0x0a0a23);
    const label = this.add.text(0, -38, 'Wagon', {
      color: '#ffffff',
      fontFamily: 'Fira Mono, Menlo, Consolas, monospace',
      fontSize: '14px',
    }).setOrigin(0.5);

    wagon.add([body, cover, leftWheel, rightWheel, label]);

    return wagon;
  }
}
