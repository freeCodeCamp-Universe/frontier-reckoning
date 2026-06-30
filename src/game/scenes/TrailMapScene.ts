import Phaser from 'phaser';
import { getTrailMapLandmarks, type MapLandmark } from '@game/data/mapLandmarks';
import {
  calculateCurvedTrailPosition,
  getLandmarkState,
  type LandmarkKind,
  type LandmarkState,
  type TrailPoint,
  shouldAnimateWagon,
} from '@game/systems/mapProgress';
import { getEffectiveReducedMotion } from '@game/systems/settingsSystem';
import {
  calculateMapLabelPositions,
  estimateMapLabelTextWidth,
  type TrailMapLabelPosition,
} from '@game/systems/trailMapLabels';

export type TrailMapState = {
  distanceTraveled: number;
  totalDistance: number;
  currentDay: number;
  visitedTownIds: string[];
  crossedRiverIds: string[];
};

const TRAIL_START_X = 78;
const TRAIL_END_X = 888;
const WAGON_Y_OFFSET = -28;
const WAGON_MOVE_DURATION_MS = 450;
const LANDMARK_MARKER_RADIUS = 12;
const TRAIL_PATH_POINTS: TrailPoint[] = [
  { x: TRAIL_START_X, y: 366 },
  { x: 172, y: 310 },
  { x: 274, y: 336 },
  { x: 382, y: 252 },
  { x: 514, y: 284 },
  { x: 642, y: 214 },
  { x: 760, y: 250 },
  { x: TRAIL_END_X, y: 184 },
];

type MarkerView = {
  landmark: MapLandmark;
  connector: Phaser.GameObjects.Line;
  marker: Phaser.GameObjects.Arc;
  labelBackground: Phaser.GameObjects.Graphics;
  label: Phaser.GameObjects.Text;
  status: Phaser.GameObjects.Text;
  pulseTween?: Phaser.Tweens.Tween;
};

export class TrailMapScene extends Phaser.Scene {
  private wagon?: Phaser.GameObjects.Container;
  private trailProgressGraphics?: Phaser.GameObjects.Graphics;
  private tooltip?: Phaser.GameObjects.Container;
  private tooltipTitle?: Phaser.GameObjects.Text;
  private tooltipBody?: Phaser.GameObjects.Text;
  private tooltipBackground?: Phaser.GameObjects.Graphics;
  private dayNightTint?: Phaser.GameObjects.Rectangle;
  private markerViews: MarkerView[] = [];
  private wagonMoveTween?: Phaser.Tweens.Tween;
  private wagonIdleTween?: Phaser.Tweens.Tween;
  private wagonBounceTween?: Phaser.Tweens.Tween;
  private reducedMotion = false;
  private mapState: TrailMapState = {
    distanceTraveled: 0,
    totalDistance: 2000,
    currentDay: 0,
    visitedTownIds: [],
    crossedRiverIds: [],
  };

  constructor() {
    super('TrailMapScene');
  }

  create() {
    this.reducedMotion = getPrefersReducedMotion();
    this.mapState = this.readInitialState();
    this.cameras.main.setBackgroundColor('#0a0a23');

    this.drawParchmentBackground();
    this.drawTrail();
    this.drawMilestoneMarkers();
    this.tooltip = this.createTooltip();
    this.wagon = this.createWagon();
    this.startIdleAnimation();
    this.dayNightTint = this.add.rectangle(480, 270, 960, 540, 0x0a0a23, 0).setDepth(15);
    this.updateMapProgress(this.mapState);
    this.game.events.emit('trail-map-ready');
  }

  setReducedMotion(reducedMotion: boolean) {
    this.reducedMotion = reducedMotion;

    if (reducedMotion) {
      this.wagonIdleTween?.stop();
      this.wagonMoveTween?.stop();
      this.wagonBounceTween?.stop();
      this.stopMarkerPulses();
    } else {
      this.startIdleAnimation();
      this.updateMarkerStates();
    }
  }

  updateMapProgress(nextState: TrailMapState) {
    const previousDistance = this.mapState.distanceTraveled;
    this.mapState = nextState;
    const trailPosition = calculateCurvedTrailPosition({
      distanceTraveled: this.mapState.distanceTraveled,
      totalDistance: this.mapState.totalDistance,
      pathPoints: TRAIL_PATH_POINTS,
    });
    const wagonPosition = {
      x: trailPosition.x,
      y: trailPosition.y + WAGON_Y_OFFSET,
    };

    this.moveWagon(wagonPosition, previousDistance !== nextState.distanceTraveled);
    this.drawProgressTrail();
    this.updateMarkerStates();
    this.updateDayNightTint();
  }

  private readInitialState(): TrailMapState {
    return {
      distanceTraveled:
        this.registry.get('distanceTraveled') ?? this.mapState.distanceTraveled,
      totalDistance: this.registry.get('totalDistance') ?? this.mapState.totalDistance,
      currentDay: this.registry.get('currentDay') ?? this.mapState.currentDay,
      visitedTownIds: this.registry.get('visitedTownIds') ?? this.mapState.visitedTownIds,
      crossedRiverIds:
        this.registry.get('crossedRiverIds') ?? this.mapState.crossedRiverIds,
    };
  }

  private drawParchmentBackground() {
    const graphics = this.add.graphics();

    graphics.fillStyle(0xead8ad, 1);
    graphics.fillRect(18, 18, 924, 504);
    graphics.fillStyle(0xd4b978, 0.48);
    graphics.fillRoundedRect(34, 42, 892, 450, 18);
    graphics.lineStyle(6, 0x6b4f2a, 0.86);
    graphics.strokeRoundedRect(24, 26, 912, 486, 20);
    graphics.lineStyle(2, 0x8b6f3e, 0.48);
    graphics.strokeRoundedRect(42, 50, 876, 434, 14);

    for (let index = 0; index < 90; index += 1) {
      const x = 48 + ((index * 73) % 856);
      const y = 62 + ((index * 41) % 404);
      const alpha = 0.08 + (index % 4) * 0.035;

      graphics.fillStyle(index % 3 === 0 ? 0x6b4f2a : 0xffffff, alpha);
      graphics.fillCircle(x, y, 1 + (index % 3));
    }

    graphics.lineStyle(1, 0x6b4f2a, 0.16);
    for (let index = 0; index < 10; index += 1) {
      const y = 86 + index * 38;
      graphics.lineBetween(58, y, 900, y + Math.sin(index) * 8);
    }
  }

  private drawTrail() {
    const trailShadow = this.add.graphics();
    trailShadow.lineStyle(16, 0x5c4325, 0.25);
    this.drawPathLines(trailShadow);

    const trailBase = this.add.graphics();
    trailBase.lineStyle(10, 0x8b5a2b, 0.88);
    this.drawPathLines(trailBase);
    trailBase.lineStyle(3, 0xf1be32, 0.5);
    this.drawPathLines(trailBase);

    this.trailProgressGraphics = this.add.graphics();

    this.add
      .text(TRAIL_PATH_POINTS[0].x, TRAIL_PATH_POINTS[0].y + 38, 'Start', {
        color: '#00471b',
        fontFamily: 'Fira Mono, Menlo, Consolas, monospace',
        fontSize: '16px',
      })
      .setOrigin(0.5, 0);

    this.add.circle(TRAIL_PATH_POINTS[0].x, TRAIL_PATH_POINTS[0].y, 10, 0x00471b);
  }

  private drawMilestoneMarkers() {
    const landmarks = getTrailMapLandmarks(this.mapState.totalDistance);
    const labelPositions = calculateMapLabelPositions(
      landmarks.map((landmark) => {
        const pathPosition = calculateCurvedTrailPosition({
          distanceTraveled: landmark.distance,
          totalDistance: this.mapState.totalDistance,
          pathPoints: TRAIL_PATH_POINTS,
        });

        return {
          id: landmark.id,
          kind: landmark.kind,
          markerX: pathPosition.x,
          markerY: pathPosition.y,
          name: landmark.name,
        };
      }),
      960,
      540,
    );
    const labelPositionById = new Map(
      labelPositions.map((labelPosition) => [labelPosition.id, labelPosition]),
    );

    for (const landmark of landmarks) {
      this.markerViews.push(
        this.drawMarker(landmark, labelPositionById.get(landmark.id)),
      );
    }
  }

  private drawMarker(
    landmark: MapLandmark,
    labelPosition?: TrailMapLabelPosition,
  ): MarkerView {
    const pathPosition = calculateCurvedTrailPosition({
      distanceTraveled: landmark.distance,
      totalDistance: this.mapState.totalDistance,
      pathPoints: TRAIL_PATH_POINTS,
    });
    const markerY = pathPosition.y;
    const color = getMarkerColor(landmark.kind, 'unknown');
    const resolvedLabelPosition =
      labelPosition ??
      ({
        anchorDirection: 'above',
        fullText: landmark.name,
        id: landmark.id,
        labelX: pathPosition.x,
        labelY: markerY - 52,
        markerX: pathPosition.x,
        markerY,
        text: landmark.name,
        visible: true,
        width: 104,
        x: pathPosition.x,
        y: markerY - 52,
      } satisfies TrailMapLabelPosition);

    const labelMetrics = getMapLabelMetrics(landmark.kind, resolvedLabelPosition.text);
    const labelX = Math.min(
      Math.max(
        resolvedLabelPosition.labelX,
        labelMetrics.chipWidth / 2 + labelMetrics.mapPadding,
      ),
      960 - labelMetrics.chipWidth / 2 - labelMetrics.mapPadding,
    );
    const labelY = resolvedLabelPosition.labelY;
    const connector = this.add
      .line(
        pathPosition.x,
        markerY,
        0,
        0,
        labelX - pathPosition.x,
        labelY - markerY,
        color,
        0.46,
      )
      .setOrigin(0, 0)
      .setVisible(resolvedLabelPosition.visible);
    const marker = this.add.circle(
      pathPosition.x,
      markerY,
      LANDMARK_MARKER_RADIUS,
      color,
    );
    const labelBackground = this.add.graphics().setVisible(resolvedLabelPosition.visible);
    const label = this.add
      .text(labelX, labelY, resolvedLabelPosition.text, {
        color: '#2a2a40',
        fontFamily: 'Fira Mono, Menlo, Consolas, monospace',
        fontSize: landmark.kind === 'destination' ? '13px' : '12px',
        fontStyle: landmark.kind === 'destination' ? '700' : undefined,
        align: 'center',
        wordWrap: { width: labelMetrics.textWidth },
      })
      .setOrigin(0.5, 0.5)
      .setVisible(resolvedLabelPosition.visible);
    const measuredLabelWidth = getMeasuredLabelWidth(label, labelMetrics.textWidth);
    const chipWidth = Math.min(
      Math.max(
        measuredLabelWidth + labelMetrics.horizontalPadding * 2,
        labelMetrics.chipWidth,
      ),
      labelMetrics.maxChipWidth,
    );

    labelBackground.fillStyle(0xf6e6bc, 0.92);
    labelBackground.fillRoundedRect(
      labelX - chipWidth / 2,
      labelY - labelMetrics.chipHeight / 2,
      chipWidth,
      labelMetrics.chipHeight,
      6,
    );
    labelBackground.lineStyle(
      landmark.kind === 'destination' ? 2 : 1,
      landmark.kind === 'destination' ? 0x5a01a7 : 0x6b4f2a,
      landmark.kind === 'destination' ? 0.86 : 0.48,
    );
    labelBackground.strokeRoundedRect(
      labelX - chipWidth / 2,
      labelY - labelMetrics.chipHeight / 2,
      chipWidth,
      labelMetrics.chipHeight,
      6,
    );
    const status = this.add
      .text(pathPosition.x, markerY - 1, '?', {
        color: '#ffffff',
        fontFamily: 'Fira Mono, Menlo, Consolas, monospace',
        fontSize: '12px',
        fontStyle: '700',
      })
      .setOrigin(0.5);

    marker
      .setInteractive({ useHandCursor: true })
      .on('pointerover', () => this.showTooltip(landmark, pathPosition.x, markerY))
      .on('pointerout', () => this.hideTooltip())
      .on('pointerdown', () => this.showTooltip(landmark, pathPosition.x, markerY));

    return { landmark, connector, marker, labelBackground, label, status };
  }

  private createTooltip() {
    const container = this.add.container(0, 0).setDepth(20).setVisible(false);
    this.tooltipBackground = this.add.graphics();
    this.tooltipTitle = this.add.text(0, 0, '', {
      color: '#ffffff',
      fontFamily: 'Fira Mono, Menlo, Consolas, monospace',
      fontSize: '15px',
      fontStyle: '700',
    });
    this.tooltipBody = this.add.text(0, 24, '', {
      color: '#dfdfe2',
      fontFamily: 'Lato, sans-serif',
      fontSize: '15px',
      wordWrap: { width: 236 },
    });

    container.add([this.tooltipBackground, this.tooltipTitle, this.tooltipBody]);

    return container;
  }

  private showTooltip(landmark: MapLandmark, x: number, y: number) {
    if (
      !this.tooltip ||
      !this.tooltipBackground ||
      !this.tooltipTitle ||
      !this.tooltipBody
    ) {
      return;
    }

    const state = getLandmarkState({
      ...landmark,
      distanceTraveled: this.mapState.distanceTraveled,
      visitedTownIds: this.mapState.visitedTownIds,
      crossedRiverIds: this.mapState.crossedRiverIds,
    });
    const tooltipX = Math.min(Math.max(x + 20, 32), 676);
    const tooltipY = Math.min(Math.max(y - 68, 72), 390);

    this.tooltipTitle.setText(`${landmark.name} / ${state}`);
    this.tooltipBody.setText(`${landmark.kind} - ${landmark.description}`);
    this.tooltipTitle.setPosition(14, 10);
    this.tooltipBody.setPosition(14, 34);
    this.tooltipBackground.clear();
    this.tooltipBackground.fillStyle(0x1b1b32, 0.96);
    this.tooltipBackground.fillRoundedRect(0, 0, 252, 110, 8);
    this.tooltipBackground.lineStyle(2, 0xf1be32, 0.85);
    this.tooltipBackground.strokeRoundedRect(0, 0, 252, 110, 8);
    this.tooltip.setPosition(tooltipX, tooltipY);
    this.tooltip.setVisible(true);
  }

  private hideTooltip() {
    this.tooltip?.setVisible(false);
  }

  private createWagon() {
    const wagon = this.add.container(
      TRAIL_PATH_POINTS[0].x,
      TRAIL_PATH_POINTS[0].y + WAGON_Y_OFFSET,
    );
    const shadow = this.add.ellipse(0, 24, 60, 12, 0x5c4325, 0.28);
    const bed = this.add.rectangle(0, 6, 48, 18, 0x8b5a2b);
    const body = this.add.rectangle(0, 0, 50, 22, 0xf1be32);
    const cover = this.add.arc(0, -9, 21, 180, 360, false, 0xffffff);
    const coverLine = this.add.arc(0, -9, 15, 180, 360, false, 0xd0d0d5);
    const leftWheel = this.add.circle(-17, 15, 7, 0x0a0a23);
    const rightWheel = this.add.circle(17, 15, 7, 0x0a0a23);
    const leftHub = this.add.circle(-17, 15, 3, 0xd0d0d5);
    const rightHub = this.add.circle(17, 15, 3, 0xd0d0d5);
    const label = this.add
      .text(0, -38, 'Wagon', {
        color: '#2a2a40',
        fontFamily: 'Fira Mono, Menlo, Consolas, monospace',
        fontSize: '14px',
        fontStyle: '700',
      })
      .setOrigin(0.5);

    wagon.add([
      shadow,
      bed,
      body,
      cover,
      coverLine,
      leftWheel,
      rightWheel,
      leftHub,
      rightHub,
      label,
    ]);
    wagon.setDepth(10);

    return wagon;
  }

  private drawProgressTrail() {
    if (!this.trailProgressGraphics) {
      return;
    }

    const progressPoints = getProgressPathPoints({
      distanceTraveled: this.mapState.distanceTraveled,
      totalDistance: this.mapState.totalDistance,
      pathPoints: TRAIL_PATH_POINTS,
    });

    this.trailProgressGraphics.clear();
    this.trailProgressGraphics.lineStyle(5, 0x00471b, 0.88);
    drawLineSegments(this.trailProgressGraphics, progressPoints);
  }

  private updateMarkerStates() {
    for (const view of this.markerViews) {
      const state = getLandmarkState({
        ...view.landmark,
        distanceTraveled: this.mapState.distanceTraveled,
        visitedTownIds: this.mapState.visitedTownIds,
        crossedRiverIds: this.mapState.crossedRiverIds,
      });
      const color = getMarkerColor(view.landmark.kind, state);
      const alpha = state === 'unknown' ? 0.45 : 1;

      view.marker.setFillStyle(color, alpha);
      view.marker.setStrokeStyle(2, state === 'current' ? 0xf1be32 : 0x2a2a40, 0.9);
      view.connector.setStrokeStyle(1, color, Math.min(alpha, 0.5));
      view.labelBackground.setAlpha(state === 'unknown' ? 0.66 : 1);
      view.label.setAlpha(state === 'unknown' ? 0.55 : 1);
      view.status.setText(getMarkerStatusText(view.landmark.kind, state));
      view.status.setAlpha(state === 'unknown' ? 0.65 : 1);

      if (state === 'current' && !this.reducedMotion) {
        this.startMarkerPulse(view);
      } else {
        this.stopMarkerPulse(view);
      }
    }
  }

  private startMarkerPulse(view: MarkerView) {
    if (view.pulseTween) {
      return;
    }

    view.pulseTween = this.tweens.add({
      targets: view.marker,
      scale: 1.18,
      duration: 620,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });
  }

  private stopMarkerPulse(view: MarkerView) {
    view.pulseTween?.stop();
    view.pulseTween = undefined;
    view.marker.setScale(1);
  }

  private stopMarkerPulses() {
    for (const view of this.markerViews) {
      this.stopMarkerPulse(view);
    }
  }

  private updateDayNightTint() {
    const dayPhase = (this.mapState.currentDay % 6) / 6;
    const nightStrength = Math.max(0, Math.cos(dayPhase * Math.PI * 2));
    const alpha = 0.05 + nightStrength * 0.18;

    this.dayNightTint?.setAlpha(alpha);
  }

  private drawPathLines(graphics: Phaser.GameObjects.Graphics) {
    drawLineSegments(graphics, TRAIL_PATH_POINTS);
  }

  private moveWagon(position: { x: number; y: number }, distanceChanged: boolean) {
    if (!this.wagon) {
      return;
    }

    this.wagonMoveTween?.stop();
    this.wagonBounceTween?.stop();

    if (!shouldAnimateWagon(this.reducedMotion)) {
      this.wagon.setPosition(position.x, position.y);
      return;
    }

    if (!distanceChanged) {
      this.wagon.setPosition(position.x, position.y);
      this.startIdleAnimation();
      return;
    }

    this.wagonIdleTween?.stop();
    this.wagonBounceTween = this.tweens.add({
      targets: this.wagon,
      y: position.y - 5,
      duration: 120,
      yoyo: true,
      repeat: Math.max(1, Math.floor(WAGON_MOVE_DURATION_MS / 240)),
      ease: 'Sine.easeInOut',
    });
    this.wagonMoveTween = this.tweens.add({
      targets: this.wagon,
      x: position.x,
      duration: WAGON_MOVE_DURATION_MS,
      ease: 'Sine.easeInOut',
      onComplete: () => {
        this.wagon?.setPosition(position.x, position.y);
        this.startIdleAnimation();
      },
    });
  }

  private startIdleAnimation() {
    if (!this.wagon || !shouldAnimateWagon(this.reducedMotion)) {
      return;
    }

    this.wagonIdleTween?.stop();
    this.wagonIdleTween = this.tweens.add({
      targets: this.wagon,
      y: this.wagon.y - 2,
      duration: 900,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });
  }
}

function drawLineSegments(graphics: Phaser.GameObjects.Graphics, points: TrailPoint[]) {
  for (let index = 1; index < points.length; index += 1) {
    graphics.lineBetween(
      points[index - 1].x,
      points[index - 1].y,
      points[index].x,
      points[index].y,
    );
  }
}

function getProgressPathPoints({
  distanceTraveled,
  totalDistance,
  pathPoints,
}: {
  distanceTraveled: number;
  totalDistance: number;
  pathPoints: TrailPoint[];
}) {
  if (pathPoints.length <= 1) {
    return pathPoints;
  }

  const progress = Math.min(Math.max(distanceTraveled / totalDistance, 0), 1);
  const targetDistance = getPathLength(pathPoints) * progress;
  const progressPoints = [pathPoints[0]];
  let traveledDistance = 0;

  for (let index = 1; index < pathPoints.length; index += 1) {
    const previousPoint = pathPoints[index - 1];
    const nextPoint = pathPoints[index];
    const segmentLength = Math.hypot(
      nextPoint.x - previousPoint.x,
      nextPoint.y - previousPoint.y,
    );

    if (traveledDistance + segmentLength >= targetDistance) {
      const segmentProgress =
        segmentLength === 0 ? 0 : (targetDistance - traveledDistance) / segmentLength;

      progressPoints.push({
        x: previousPoint.x + (nextPoint.x - previousPoint.x) * segmentProgress,
        y: previousPoint.y + (nextPoint.y - previousPoint.y) * segmentProgress,
      });

      return progressPoints;
    }

    progressPoints.push(nextPoint);
    traveledDistance += segmentLength;
  }

  return progressPoints;
}

function getPathLength(pathPoints: TrailPoint[]) {
  return pathPoints.reduce((total, point, index) => {
    if (index === 0) {
      return total;
    }

    return (
      total +
      Math.hypot(point.x - pathPoints[index - 1].x, point.y - pathPoints[index - 1].y)
    );
  }, 0);
}

function getMarkerColor(kind: LandmarkKind, state: LandmarkState) {
  if (state === 'completed') {
    return 0x00471b;
  }

  if (state === 'current') {
    return 0xf1be32;
  }

  if (state === 'unknown') {
    return 0x6b4f2a;
  }

  if (kind === 'river') {
    return 0x002ead;
  }

  if (kind === 'danger') {
    return 0x850000;
  }

  if (kind === 'destination') {
    return 0x5a01a7;
  }

  return 0x1b1b32;
}

function getMapLabelMetrics(kind: LandmarkKind, text: string) {
  const textWidth = estimateMapLabelTextWidth(text, kind);
  const horizontalPadding = kind === 'destination' ? 14 : 10;
  const maxChipWidth = kind === 'destination' ? 164 : 136;

  return {
    chipHeight: kind === 'destination' ? 32 : 28,
    chipWidth: Math.min(textWidth + horizontalPadding * 2, maxChipWidth),
    horizontalPadding,
    mapPadding: 12,
    maxChipWidth,
    textWidth,
  };
}

function getMeasuredLabelWidth(label: Phaser.GameObjects.Text, fallbackWidth: number) {
  const displayWidth = Number(label.displayWidth);
  const width = Number(label.width);

  if (Number.isFinite(displayWidth) && displayWidth > 0) {
    return displayWidth;
  }

  if (Number.isFinite(width) && width > 0) {
    return width;
  }

  return fallbackWidth;
}

function getMarkerStatusText(kind: LandmarkKind, state: LandmarkState) {
  if (state === 'completed') {
    return 'OK';
  }

  if (state === 'current') {
    return '!';
  }

  if (state === 'unknown') {
    return '?';
  }

  return kind === 'danger' ? '!' : '*';
}

function getPrefersReducedMotion() {
  if (typeof window === 'undefined') {
    return false;
  }

  const prefersReducedMotion =
    typeof window.matchMedia === 'function' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  return getEffectiveReducedMotion(window.localStorage, prefersReducedMotion);
}
