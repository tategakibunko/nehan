var Nehan = require("../dist");

test("LogicalBorder(new)", () => {
  let edge = new Nehan.LogicalBorderWidth({
    before:2,
    end:0,
    after:2,
    start:0
  });

  expect(edge.before).toBe(2);
  expect(edge.end).toBe(0);
  expect(edge.after).toBe(2);
  expect(edge.start).toBe(0);
});
