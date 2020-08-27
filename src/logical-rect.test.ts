import { LogicalRect, LogicalCursorPos, LogicalSize } from './public-api';

test("logical-rect.end/after", () => {
  const r1 = new LogicalRect(new LogicalCursorPos({ start: 0, before: 0 }), new LogicalSize({ measure: 100, extent: 100 }));

  expect(r1.end).toBe(100);
  expect(r1.after).toBe(100);
});

test("logical-rect.collide", () => {
  const r1 = new LogicalRect(new LogicalCursorPos({ start: 0, before: 0 }), new LogicalSize({ measure: 100, extent: 100 }));
  const r2 = new LogicalRect(new LogicalCursorPos({ start: 10, before: 10 }), new LogicalSize({ measure: 100, extent: 100 }));
  const r3 = new LogicalRect(new LogicalCursorPos({ start: 50, before: 50 }), new LogicalSize({ measure: 100, extent: 100 }));
  const r4 = new LogicalRect(new LogicalCursorPos({ start: 100, before: 100 }), new LogicalSize({ measure: 100, extent: 100 }));

  expect(r1.collideWith(r1)).toBe(true);
  expect(r1.collideWith(r2)).toBe(true);
  expect(r1.collideWith(r3)).toBe(true);
  expect(r1.collideWith(r4)).toBe(false);
});
