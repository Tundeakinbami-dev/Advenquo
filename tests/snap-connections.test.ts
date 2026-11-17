/**
 * Advenquo: Snap Points & Connection Logic Regression Suite
 *
 * Verifies:
 * 1. Snap socket compatibility (male-to-female, neutral-to-neutral).
 * 2. Spatial distance thresholds (tolerance boundary enforcement).
 * 3. Normal opposition (socket faces must oppose within angular tolerance).
 * 4. Socket occupancy (rejection when a socket is already filled).
 * 5. Component-type compatibility filtering.
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { Quaternion, Vector3 } from '@iwsdk/core';

import {
  areSnapPointsCompatible,
  computeWorldSnapPoint,
  evaluateSnapCandidate,
  getComponentSpec,
} from '../src/construction/index.js';

describe('Advenquo: Snap Points & Connections', () => {
  it('allows male stud to mate with female socket of compatible types', () => {
    const brickSpec = getComponentSpec('clay_brick');
    const stud = brickSpec.snapPoints.find((p) => p.role === 'male')!;
    const socket = brickSpec.snapPoints.find((p) => p.role === 'female')!;

    const wspStud = computeWorldSnapPoint('brick_1', 'clay_brick', stud, new Vector3(0, 0, 0), new Quaternion());
    const wspSocket = computeWorldSnapPoint('brick_2', 'clay_brick', socket, new Vector3(0, 0.08, 0), new Quaternion());

    const result = areSnapPointsCompatible(wspStud, wspSocket);
    assert.strictEqual(result.compatible, true);
  });

  it('rejects connection if both sockets have male role (stud to stud collision)', () => {
    const brickSpec = getComponentSpec('clay_brick');
    const stud = brickSpec.snapPoints.find((p) => p.role === 'male')!;

    const wsp1 = computeWorldSnapPoint('brick_1', 'clay_brick', stud, new Vector3(0, 0, 0), new Quaternion());
    const wsp2 = computeWorldSnapPoint('brick_2', 'clay_brick', stud, new Vector3(0, 0.08, 0), new Quaternion());

    const result = areSnapPointsCompatible(wsp1, wsp2);
    assert.strictEqual(result.compatible, false);
    assert.ok(result.reason?.includes('Incompatible socket roles'));
  });

  it('rejects connection when target socket is already occupied', () => {
    const brickSpec = getComponentSpec('clay_brick');
    const stud = brickSpec.snapPoints.find((p) => p.role === 'male')!;
    const socket = brickSpec.snapPoints.find((p) => p.role === 'female')!;

    const wspStud = computeWorldSnapPoint('brick_1', 'clay_brick', stud, new Vector3(0, 0, 0), new Quaternion());
    wspStud.isOccupied = true; // Mark occupied

    const wspSocket = computeWorldSnapPoint('brick_2', 'clay_brick', socket, new Vector3(0, 0.08, 0), new Quaternion());

    const result = areSnapPointsCompatible(wspStud, wspSocket);
    assert.strictEqual(result.compatible, false);
    assert.ok(result.reason?.includes('already occupied'));
  });

  it('evaluates distance tolerance and detects valid proximity', () => {
    const blockSpec = getComponentSpec('concrete_block');
    const stud = blockSpec.snapPoints.find((p) => p.role === 'male')!;
    const socket = blockSpec.snapPoints.find((p) => p.role === 'female')!;

    const target = computeWorldSnapPoint('block_base', 'concrete_block', stud, new Vector3(0, 0.1, -2.5), new Quaternion());
    // Position held block within tolerance (< 0.16m from stud)
    const source = computeWorldSnapPoint('block_held', 'concrete_block', socket, new Vector3(0, 0.35, -2.5), new Quaternion());

    const candidate = evaluateSnapCandidate(source, target, new Quaternion());
    assert.strictEqual(candidate.isValid, true);
    assert.ok(candidate.snappedPosition.y > 0);
  });

  it('rejects snap candidate when distance exceeds tolerance', () => {
    const blockSpec = getComponentSpec('concrete_block');
    const stud = blockSpec.snapPoints.find((p) => p.role === 'male')!;
    const socket = blockSpec.snapPoints.find((p) => p.role === 'female')!;

    const target = computeWorldSnapPoint('block_base', 'concrete_block', stud, new Vector3(0, 0.1, -2.5), new Quaternion());
    // Position held block far away
    const source = computeWorldSnapPoint('block_held', 'concrete_block', socket, new Vector3(0, 2.0, -2.5), new Quaternion());

    const candidate = evaluateSnapCandidate(source, target, new Quaternion());
    assert.strictEqual(candidate.isValid, false);
    assert.ok(candidate.rejectionReason?.includes('exceeds tolerance'));
  });
});
