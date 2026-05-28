import { describe, expect, it } from 'vitest';
import {
  calculateMapLabelPositions,
  estimateMapLabelTextWidth,
  type TrailMapLabelPosition,
} from '@game/systems/trailMapLabels';

describe('calculateMapLabelPositions', () => {
  it('prevents visible labels from overlapping in clustered trail locations', () => {
    const positions = calculateMapLabelPositions(
      [
        {
          id: 'town-a',
          kind: 'town',
          markerX: 420,
          markerY: 220,
          name: 'Ash Hollow',
        },
        {
          id: 'river-a',
          kind: 'river',
          markerX: 428,
          markerY: 224,
          name: 'Blackwater Crossing',
        },
        {
          id: 'danger-a',
          kind: 'danger',
          markerX: 436,
          markerY: 218,
          name: 'Bleached Flats',
        },
        {
          id: 'town-b',
          kind: 'town',
          markerX: 444,
          markerY: 222,
          name: 'Gravesend',
        },
      ],
      960,
      540,
    );

    expectVisibleLabelsToAvoidOverlap(positions);
    expectVisibleLabelsToStayOffTrail(positions);
    expectLabelsToRemainWithinBounds(positions, 960, 540);
  });

  it('keeps the final destination visible and away from nearby labels', () => {
    const positions = calculateMapLabelPositions(
      [
        {
          id: 'danger-b',
          kind: 'danger',
          markerX: 850,
          markerY: 182,
          name: 'Deadfall Pass',
        },
        {
          id: 'river-b',
          kind: 'river',
          markerX: 864,
          markerY: 186,
          name: 'Last River',
        },
        {
          id: 'destination',
          kind: 'destination',
          markerX: 876,
          markerY: 180,
          name: 'Last Lantern',
        },
      ],
      960,
      540,
    );
    const destination = positions.find((position) => position.id === 'destination');

    expect(destination).toMatchObject({
      fullText: 'Last Lantern',
      text: 'Last Lantern',
      visible: true,
    });
    expect(destination?.width).toBeGreaterThanOrEqual(
      estimateMapLabelTextWidth('Last Lantern', 'destination'),
    );
    expect(
      Math.abs((destination?.labelY ?? 0) - (destination?.markerY ?? 0)),
    ).toBeGreaterThanOrEqual(46);
    expectVisibleLabelsToAvoidOverlap(positions);
    expectVisibleLabelsToStayOffTrail(positions);
    expectLabelsToRemainWithinBounds(positions, 960, 540);
  });

  it('gives destination labels enough width for their full text', () => {
    const positions = calculateMapLabelPositions(
      [
        {
          id: 'destination',
          kind: 'destination',
          markerX: 930,
          markerY: 180,
          name: 'Last Lantern',
        },
      ],
      960,
      540,
    );
    const destination = positions[0];

    expect(destination.text).toBe('Last Lantern');
    expect(destination.width).toBeGreaterThanOrEqual(
      estimateMapLabelTextWidth(destination.text, 'destination'),
    );
    expect(destination.labelX - destination.width / 2).toBeGreaterThanOrEqual(0);
    expect(destination.labelX + destination.width / 2).toBeLessThanOrEqual(960);
  });

  it('alternates labels above and below the trail by default', () => {
    const positions = calculateMapLabelPositions(
      [
        { id: 'town-a', kind: 'town', markerX: 160, markerY: 240, name: 'Ash Hollow' },
        { id: 'town-b', kind: 'town', markerX: 320, markerY: 240, name: 'Gravesend' },
        { id: 'town-c', kind: 'town', markerX: 480, markerY: 240, name: 'Red Mesa' },
      ],
      960,
      540,
    );

    expect(positions.map((position) => position.anchorDirection)).toEqual([
      'above',
      'below',
      'above',
    ]);
  });
});

function expectVisibleLabelsToAvoidOverlap(positions: TrailMapLabelPosition[]) {
  const visiblePositions = positions.filter((position) => position.visible);

  for (let index = 0; index < visiblePositions.length; index += 1) {
    for (let nextIndex = index + 1; nextIndex < visiblePositions.length; nextIndex += 1) {
      expect(labelsOverlap(visiblePositions[index], visiblePositions[nextIndex])).toBe(
        false,
      );
    }
  }
}

function labelsOverlap(
  firstLabel: TrailMapLabelPosition,
  secondLabel: TrailMapLabelPosition,
) {
  const minLabelGap = 10;
  const firstWidth = firstLabel.width;
  const secondWidth = secondLabel.width;
  const horizontalOverlap =
    Math.abs(firstLabel.x - secondLabel.x) <
    firstWidth / 2 + secondWidth / 2 + minLabelGap;
  const verticalOverlap = Math.abs(firstLabel.y - secondLabel.y) < 24 + minLabelGap;

  return horizontalOverlap && verticalOverlap;
}

function expectVisibleLabelsToStayOffTrail(positions: TrailMapLabelPosition[]) {
  for (const position of positions.filter((labelPosition) => labelPosition.visible)) {
    expect(Math.abs(position.labelY - position.markerY)).toBeGreaterThanOrEqual(46);
    expect(position.labelY).not.toBe(position.markerY);
  }
}

function expectLabelsToRemainWithinBounds(
  positions: TrailMapLabelPosition[],
  mapWidth: number,
  mapHeight: number,
) {
  for (const position of positions) {
    expect(position.labelX).toBeGreaterThanOrEqual(0);
    expect(position.labelX).toBeLessThanOrEqual(mapWidth);
    expect(position.labelY).toBeGreaterThanOrEqual(0);
    expect(position.labelY).toBeLessThanOrEqual(mapHeight);
  }
}
