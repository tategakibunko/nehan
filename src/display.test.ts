import * as Nehan from './public-api';

test("block", () => {
  let display = new Nehan.Display("block" as Nehan.DisplayValue);
  expect(display.isBlockLevel()).toBe(true);
  expect(display.isInlineLevel()).toBe(false);
  expect(display.isFlow()).toBe(true);
});

test("inline", () => {
  let display = new Nehan.Display("inline" as Nehan.DisplayValue);
  expect(display.isBlockLevel()).toBe(false);
  expect(display.isInlineLevel()).toBe(true);
  expect(display.isFlow()).toBe(true);
});

test("inline-block", () => {
  let display = new Nehan.Display("inline-block" as Nehan.DisplayValue);
  expect(display.isBlockLevel()).toBe(false);
  expect(display.isInlineLevel()).toBe(true);
  expect(display.isFlow()).toBe(true);
  expect(display.isFlowRoot()).toBe(true);
});

test("ruby", () => {
  let display = new Nehan.Display("ruby" as Nehan.DisplayValue);
  expect(display.isBlockLevel()).toBe(false);
  expect(display.isInlineLevel()).toBe(true);
  expect(display.isFlow()).toBe(false);
  expect(display.isFlowRuby()).toBe(true);
});

test("none", () => {
  let display = new Nehan.Display("none" as Nehan.DisplayValue);
  expect(display.isBlockLevel()).toBe(false);
  expect(display.isInlineLevel()).toBe(false);
  expect(display.isFlow()).toBe(false);
  expect(display.isNone()).toBe(true);
});

test("list-item", () => {
  let display = new Nehan.Display("list-item" as Nehan.DisplayValue);
  expect(display.isBlockLevel()).toBe(true);
  expect(display.isInlineLevel()).toBe(false);
  expect(display.isFlow()).toBe(true);
  expect(display.isListItem()).toBe(true);
});

test("flow-root", () => {
  let display = new Nehan.Display("flow-root" as Nehan.DisplayValue);
  expect(display.isBlockLevel()).toBe(true);
  expect(display.isInlineLevel()).toBe(false);
  expect(display.isFlow()).toBe(true);
  expect(display.isFlowRoot()).toBe(true);
});
