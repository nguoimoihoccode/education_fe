import { describe,it,expect } from 'vitest';
import { pointsToUnits,unitsToPoints } from './assessmentScores';
describe('teacher-facing points',()=>{
 it('stores fractional points precisely without exposing internal units',()=>{
  expect(pointsToUnits(10)).toBe(10000);expect(pointsToUnits(0.125)).toBe(125);expect(pointsToUnits(7.25)).toBe(7250);expect(unitsToPoints(7250)).toBe(7.25);
 });
});
