import type { LandmarkKind } from '@game/systems/mapProgress';

export type TrailMapLabelInput = {
  id: string;
  kind: LandmarkKind;
  markerX: number;
  markerY: number;
  name: string;
};

export type TrailMapLabelAnchorDirection = 'above' | 'below';

export type TrailMapLabelPosition = {
  anchorDirection: TrailMapLabelAnchorDirection;
  fullText: string;
  id: string;
  labelX: number;
  labelY: number;
  markerX: number;
  markerY: number;
  text: string;
  visible: boolean;
  width: number;
  x: number;
  y: number;
};

type LabelBox = TrailMapLabelPosition & {
  height: number;
  width: number;
};

const labelHeight = 24;
const labelPadding = 12;
const minimumTrailOffset = 46;
const minLabelGap = 10;

export function calculateMapLabelPositions(
  labels: TrailMapLabelInput[],
  mapWidth: number,
  mapHeight: number,
): TrailMapLabelPosition[] {
  const placedLabels: LabelBox[] = [];

  return labels.map((label, index) => {
    const text = getShortMapLabel(label);
    const width = estimateMapLabelTextWidth(text, label.kind);
    const preferredDirection: TrailMapLabelAnchorDirection =
      index % 2 === 0 ? 'above' : 'below';
    const yOffsets = getCandidateOffsets(preferredDirection, label.kind);

    for (const yOffset of yOffsets) {
      const candidate = createLabelBox({
        anchorDirection: yOffset < 0 ? 'above' : 'below',
        fullText: label.name,
        id: label.id,
        mapHeight,
        mapWidth,
        markerX: label.markerX,
        markerY: label.markerY,
        text,
        visible: true,
        width,
        x: getCandidateX(label.markerX, index, yOffset),
        y: label.markerY + yOffset,
      });

      if (!collidesWithPlacedLabels(candidate, placedLabels)) {
        placedLabels.push(candidate);
        return toLabelPosition(candidate);
      }
    }

    if (label.kind === 'destination') {
      const candidate = findDestinationLabelPosition({
        fullText: label.name,
        id: label.id,
        mapHeight,
        mapWidth,
        markerX: label.markerX,
        markerY: label.markerY,
        placedLabels,
        text,
        width,
      });

      placedLabels.push(candidate);
      return toLabelPosition(candidate);
    }

    return toLabelPosition(
      createLabelBox({
        anchorDirection: preferredDirection,
        fullText: label.name,
        id: label.id,
        mapHeight,
        mapWidth,
        markerX: label.markerX,
        markerY: label.markerY,
        text,
        visible: false,
        width,
        x: label.markerX,
        y: label.markerY + getPrimaryOffset(preferredDirection, label.kind),
      }),
    );
  });
}

function findDestinationLabelPosition({
  fullText,
  id,
  mapHeight,
  mapWidth,
  markerX,
  markerY,
  placedLabels,
  text,
  width,
}: {
  fullText: string;
  id: string;
  mapHeight: number;
  mapWidth: number;
  markerX: number;
  markerY: number;
  placedLabels: LabelBox[];
  text: string;
  width: number;
}) {
  for (const direction of ['above', 'below'] as const) {
    for (let shift = 0; shift <= 180; shift += 18) {
      for (const shiftDirection of [-1, 1]) {
        const candidate = createLabelBox({
          anchorDirection: direction,
          fullText,
          id,
          mapHeight,
          mapWidth,
          markerX,
          markerY,
          text,
          visible: true,
          width,
          x: markerX + shift * shiftDirection,
          y: markerY + getPrimaryOffset(direction, 'destination'),
        });

        if (!collidesWithPlacedLabels(candidate, placedLabels)) {
          return candidate;
        }
      }
    }
  }

  return createLabelBox({
    anchorDirection: 'above',
    fullText,
    id,
    mapHeight,
    mapWidth,
    markerX,
    markerY,
    text,
    visible: true,
    width,
    x: markerX,
    y: markerY + getPrimaryOffset('above', 'destination'),
  });
}

function createLabelBox({
  anchorDirection,
  fullText,
  id,
  mapHeight,
  mapWidth,
  markerX,
  markerY,
  text,
  visible,
  width,
  x,
  y,
}: {
  anchorDirection: TrailMapLabelAnchorDirection;
  fullText: string;
  id: string;
  mapHeight: number;
  mapWidth: number;
  markerX: number;
  markerY: number;
  text: string;
  visible: boolean;
  width: number;
  x: number;
  y: number;
}): LabelBox {
  const resolvedAnchorDirection = getResolvedAnchorDirection({
    anchorDirection,
    mapHeight,
    markerY,
  });
  const clampedX = Math.min(
    Math.max(x, labelPadding + width / 2),
    mapWidth - labelPadding - width / 2,
  );
  const clampedY = clampLabelY({
    anchorDirection: resolvedAnchorDirection,
    labelY: y,
    mapHeight,
    markerY,
  });

  return {
    anchorDirection: resolvedAnchorDirection,
    fullText,
    height: labelHeight,
    id,
    labelX: clampedX,
    labelY: clampedY,
    markerX,
    markerY,
    text,
    visible,
    width,
    x: clampedX,
    y: clampedY,
  };
}

function collidesWithPlacedLabels(candidate: LabelBox, placedLabels: LabelBox[]) {
  return placedLabels.some((placedLabel) => {
    const horizontalOverlap =
      Math.abs(candidate.x - placedLabel.x) <
      candidate.width / 2 + placedLabel.width / 2 + minLabelGap;
    const verticalOverlap =
      Math.abs(candidate.y - placedLabel.y) <
      candidate.height / 2 + placedLabel.height / 2 + minLabelGap;

    return horizontalOverlap && verticalOverlap;
  });
}

export function estimateMapLabelTextWidth(text: string, kind: LandmarkKind) {
  const maxWidth = kind === 'destination' ? 132 : 112;
  const characterWidth = kind === 'destination' ? 9 : 8;

  return Math.min(Math.max(text.length * characterWidth + 18, 48), maxWidth);
}

function getCandidateOffsets(
  preferredDirection: TrailMapLabelAnchorDirection,
  kind: LandmarkKind,
) {
  const oppositeDirection = preferredDirection === 'above' ? 'below' : 'above';
  const preferredOffset = getPrimaryOffset(preferredDirection, kind);
  const oppositeOffset = getPrimaryOffset(oppositeDirection, kind);

  return [
    preferredOffset,
    oppositeOffset,
    preferredOffset + (preferredDirection === 'above' ? -24 : 24),
    oppositeOffset + (oppositeDirection === 'above' ? -24 : 24),
    preferredOffset + (preferredDirection === 'above' ? -48 : 48),
    oppositeOffset + (oppositeDirection === 'above' ? -48 : 48),
  ];
}

function getPrimaryOffset(
  direction: TrailMapLabelAnchorDirection,
  kind: LandmarkKind,
) {
  const directionMultiplier = direction === 'above' ? -1 : 1;
  const extraOffset = kind === 'destination' ? 18 : kind === 'danger' ? 10 : 0;

  return directionMultiplier * (minimumTrailOffset + extraOffset);
}

function getCandidateX(markerX: number, index: number, yOffset: number) {
  const curveOffset = index % 3 === 0 ? 14 : index % 3 === 1 ? -14 : 0;

  return markerX + (yOffset < 0 ? curveOffset : -curveOffset);
}

function clampLabelY({
  anchorDirection,
  labelY,
  mapHeight,
  markerY,
}: {
  anchorDirection: TrailMapLabelAnchorDirection;
  labelY: number;
  mapHeight: number;
  markerY: number;
}) {
  const mapMinY = labelPadding + labelHeight / 2;
  const mapMaxY = mapHeight - labelPadding - labelHeight / 2;

  if (anchorDirection === 'above') {
    return Math.min(Math.max(labelY, mapMinY), markerY - minimumTrailOffset);
  }

  return Math.max(Math.min(labelY, mapMaxY), markerY + minimumTrailOffset);
}

function getResolvedAnchorDirection({
  anchorDirection,
  mapHeight,
  markerY,
}: {
  anchorDirection: TrailMapLabelAnchorDirection;
  mapHeight: number;
  markerY: number;
}) {
  const mapMinY = labelPadding + labelHeight / 2;
  const mapMaxY = mapHeight - labelPadding - labelHeight / 2;

  if (anchorDirection === 'above' && markerY - minimumTrailOffset < mapMinY) {
    return 'below';
  }

  if (anchorDirection === 'below' && markerY + minimumTrailOffset > mapMaxY) {
    return 'above';
  }

  return anchorDirection;
}

function getShortMapLabel(label: TrailMapLabelInput) {
  if (label.kind === 'river') {
    return label.name.replace(/\s+(Crossing|River)$/i, '');
  }

  if (label.kind === 'danger') {
    return label.name.split(' ')[0] ?? label.name;
  }

  return label.name;
}

function toLabelPosition(label: LabelBox): TrailMapLabelPosition {
  return {
    anchorDirection: label.anchorDirection,
    fullText: label.fullText,
    id: label.id,
    labelX: label.labelX,
    labelY: label.labelY,
    markerX: label.markerX,
    markerY: label.markerY,
    text: label.text,
    visible: label.visible,
    width: label.width,
    x: label.x,
    y: label.y,
  };
}
