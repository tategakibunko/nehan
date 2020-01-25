import {
  LegacyFloatRegion,
  LogicalSize,
  SpaceCursorPos,
  LogicalRect,
} from '../dist';

test("float-region", () => {
  let region = new LegacyFloatRegion(new LogicalSize({ measure: 100, extent: 100 }), 0);
  let rect: LogicalRect;
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
  rect = region.pushStart(0, new LogicalSize({ measure: 10, extent: 20 }));
  expect(rect.before).toBe(0)
  expect(rect.start).toBe(0)
  rect = region.pushStart(rect.before, new LogicalSize({ measure: 20, extent: 30 }));
  expect(rect.before).toBe(0)
  expect(rect.start).toBe(10)
  rect = region.pushStart(rect.before, new LogicalSize({ measure: 30, extent: 10 }));
  expect(rect.before).toBe(0)
  expect(rect.start).toBe(30)
  rect = region.pushEnd(rect.before, new LogicalSize({ measure: 20, extent: 40 }));
  expect(rect.before).toBe(0)
  expect(rect.start).toBe(80)
  rect = region.pushEnd(rect.before, new LogicalSize({ measure: 10, extent: 10 }));
  expect(rect.before).toBe(0)
  expect(rect.start).toBe(70)

  let scur: SpaceCursorPos | undefined;
  scur = region.findSpaceCursorForSize(0, new LogicalSize({ measure: 10, extent: 10 }));
  expect(scur!.measure).toBe(10);
  expect(scur!.cursor.start).toBe(60);
  expect(scur!.cursor.before).toBe(0);

  scur = region.findSpaceCursorForSize(0, new LogicalSize({ measure: 20, extent: 20 }));
  expect(scur!.measure).toBe(50);
  expect(scur!.cursor.start).toBe(30);
  expect(scur!.cursor.before).toBe(10);

  expect(region.hasSpaceForSize(0, new LogicalSize({ measure: 10, extent: 10 }))).toBe(true);
  expect(region.hasSpaceForSize(0, new LogicalSize({ measure: 20, extent: 10 }))).toBe(false);
  expect(region.hasSpaceForSize(10, new LogicalSize({ measure: 20, extent: 10 }))).toBe(true);
});
