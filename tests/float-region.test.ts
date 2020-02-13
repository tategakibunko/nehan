import {
  FloatRegion,
  LogicalSize,
  LogicalRect,
  LogicalCursorPos,
} from '../dist';

test("float-region(scenario 1)", () => {
  const region = new FloatRegion(new LogicalSize({ measure: 100, extent: 100 }), 0);
  /*
  ----------------------------------
  |10x20|20x30|30x10|  |10x10|20x40|
  |     |     |------  ------|     |
  ------|     |              |     |
  |     -------              |     |
  |                          -------
  |                                 |
  ----------------------------------
  */
  let rect: LogicalRect;
  rect = region.pushStart(0, new LogicalSize({ measure: 10, extent: 20 }));
  expect(rect.before === 0 && rect.start === 0).toBe(true);
  rect = region.pushStart(rect.before, new LogicalSize({ measure: 20, extent: 30 }));
  expect(rect.before === 0 && rect.start === 10).toBe(true);
  rect = region.pushStart(rect.before, new LogicalSize({ measure: 30, extent: 10 }));
  expect(rect.before === 0 && rect.start === 30).toBe(true);
  rect = region.pushEnd(rect.before, new LogicalSize({ measure: 20, extent: 40 }));
  expect(rect.before === 0 && rect.start === 80).toBe(true);
  rect = region.pushEnd(rect.before, new LogicalSize({ measure: 10, extent: 10 }));
  expect(rect.before === 0 && rect.start === 70).toBe(true);

  let cur: LogicalCursorPos | undefined;
  cur = region.findSpace(0, new LogicalSize({ measure: 10, extent: 10 }));
  if (cur) {
    expect(cur.before === 0 && cur.start === 60).toBe(true);
  }
  cur = region.findSpace(0, new LogicalSize({ measure: 20, extent: 20 }));
  if (cur) {
    expect(cur.before === 10 && cur.start === 30).toBe(true);
  }

  expect(region.hasSpaceForSize(0, new LogicalSize({ measure: 10, extent: 10 }))).toBe(true);
  expect(region.hasSpaceForSize(0, new LogicalSize({ measure: 20, extent: 10 }))).toBe(false);
  expect(region.hasSpaceForSize(10, new LogicalSize({ measure: 20, extent: 10 }))).toBe(true);
});

test("float-region(with context measure)", () => {
  /*
  --------------
  |10x10|       |
  ---------------
  |50x10        |
  ---------------------------------
  |10x10| 80x20                |  |
  ------|                      |  |
  |     ---------------------------
  */
  let rect: LogicalRect;
  const region = new FloatRegion(new LogicalSize({ measure: 100, extent: 100 }), 0);
  const contextMeasure1 = 50;
  rect = region.pushStart(0, new LogicalSize({ measure: 10, extent: 10 }), contextMeasure1)
  expect(rect.before === 0 && rect.start === 0).toBe(true);
  expect(region.getSpaceMeasureAt(0, contextMeasure1)).toBe(40);
  expect(region.getSpaceMeasureAt(0)).toBe(90);
  rect = region.pushStart(0, new LogicalSize({ measure: 50, extent: 10 }), contextMeasure1);
  expect(rect.before === 10 && rect.start === 0).toBe(true);
  expect(region.getSpaceMeasureAt(10, contextMeasure1)).toBe(0);
  expect(region.getSpaceMeasureAt(10)).toBe(50);
  rect = region.pushStart(20, new LogicalSize({ measure: 10, extent: 10 }));
  expect(rect.before === 20 && rect.start === 0).toBe(true);
  rect = region.pushStart(20, new LogicalSize({ measure: 80, extent: 20 }));
  expect(rect.before === 20 && rect.start === 10).toBe(true);
});