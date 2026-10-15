import { test } from "node:test";
import assert from "node:assert/strict";
import { createRequire } from "node:module";

const { kindOf, toNclc, reached } = createRequire(import.meta.url)("../src/content.js");

test("kindOf maps TCF labels to kinds", () => {
  assert.equal(kindOf("Compréhension orale"), "co");
  assert.equal(kindOf("Compréhension écrite"), "ce");
  assert.equal(kindOf("Expression orale"), "exp");
  assert.equal(kindOf("Expression écrite"), "exp");
  assert.equal(kindOf("Autre"), null);
});

test("toNclc listening (co) boundaries", () => {
  assert.equal(toNclc("co", 549), "10+");
  assert.equal(toNclc("co", 548), "9");
  assert.equal(toNclc("co", 523), "9");
  assert.equal(toNclc("co", 522), "8");
  assert.equal(toNclc("co", 331), "4");
  assert.equal(toNclc("co", 330), "<4");
});

test("toNclc reading (ce) boundaries", () => {
  assert.equal(toNclc("ce", 549), "10+");
  assert.equal(toNclc("ce", 548), "9");
  assert.equal(toNclc("ce", 524), "9");
  assert.equal(toNclc("ce", 523), "8");
  assert.equal(toNclc("ce", 342), "4");
  assert.equal(toNclc("ce", 341), "<4");
});

test("toNclc expression (exp) boundaries", () => {
  assert.equal(toNclc("exp", 16), "10+");
  assert.equal(toNclc("exp", 15), "9");
  assert.equal(toNclc("exp", 14), "9");
  assert.equal(toNclc("exp", 13), "8");
  assert.equal(toNclc("exp", 6), "5");
  assert.equal(toNclc("exp", 4), "4");
  assert.equal(toNclc("exp", 3), "<4");
});

test("toNclc returns a dash for unknown kind or non-numeric score", () => {
  assert.equal(toNclc("co", NaN), "—");
  assert.equal(toNclc(null, 500), "—");
});

test("reached requires four levels all at or above target", () => {
  assert.equal(reached(["10+", "9", "8", "7"], 7), true);
  assert.equal(reached(["10+", "9", "8", "7"], 8), false);
  assert.equal(reached(["7", "7", "7", "7"], 7), true);
  assert.equal(reached(["10+", "10+", "10+", "10+"], 10), true);
  assert.equal(reached(["<4", "9", "9", "9"], 4), false);
  assert.equal(reached(["—", "9", "9", "9"], 4), false);
  assert.equal(reached(["9", "9", "9"], 4), false);
  assert.equal(reached(["9", "9", "9", "9", "9"], 4), false);
});
