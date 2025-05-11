import { expect, it } from "vitest";

import { calculateMathExpression } from "./simple-math.js";

it("should calculate simple addition", () => {
  expect(calculateMathExpression("2+3")).toBe(5);
  expect(calculateMathExpression("10 + 5")).toBe(15);
});

it("should calculate simple subtraction", () => {
  expect(calculateMathExpression("10-5")).toBe(5);
  expect(calculateMathExpression("8 - 10")).toBe(-2);
});

it("should calculate simple multiplication", () => {
  expect(calculateMathExpression("3*4")).toBe(12);
  expect(calculateMathExpression("2.5 * 4")).toBe(10);
});

it("should calculate simple division", () => {
  expect(calculateMathExpression("10/2")).toBe(5);
  expect(calculateMathExpression("10 / 4")).toBe(2.5);
});

it("should handle expressions with parentheses", () => {
  expect(calculateMathExpression("(2+3)*4")).toBe(20);
  expect(calculateMathExpression("2*(3+4)")).toBe(14);
  expect(calculateMathExpression("(10-5)*(6/2)")).toBe(15);
});

it("should extract expressions from natural language", () => {
  expect(calculateMathExpression("計算して 2+3")).toBe(5);
  expect(calculateMathExpression("What is 10*5?")).toBe(50);
  expect(calculateMathExpression("Please calculate (7-2)*3 for me")).toBe(15);
});

it("should handle complex expressions", () => {
  expect(calculateMathExpression("(2+3*4)/2")).toBe(7);
  expect(calculateMathExpression("2+3*4/2")).toBe(8);
  expect(calculateMathExpression("(2+3)*(4/2)")).toBe(10);
  expect(calculateMathExpression("2*(3+4/2)")).toBe(10);
});
