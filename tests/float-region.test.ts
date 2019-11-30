import * as Nehan from '../dist';

test("float-region", () => {
  let region = new Nehan.FloatRegion(new Nehan.LogicalSize({ measure: 100, extent: 100 }), 0);

  let push_start = (size: Nehan.LogicalSize) => {
    let pos = region.pushStart(0, size);
    console.log("push_start:%o, float-pos:%o", size, pos);
  };

  let push_end = (size: Nehan.LogicalSize) => {
    let pos = region.pushEnd(0, size);
    console.log("push_end:%o, float-pos:%o", size, pos);
  };

  let test_space = (before_pos: number) => {
    let rest_measure = region.getSpaceMeasureAt(before_pos);
    let start_pos = region.getSpaceStartAt(before_pos);
    console.log(
      "before:%d, space_measure:%d, space_pos:(start:%d, before:%d)",
      before_pos, rest_measure, start_pos, before_pos
    );
  };

  push_start(new Nehan.LogicalSize({ measure: 10, extent: 20 }));
  push_start(new Nehan.LogicalSize({ measure: 20, extent: 30 }));
  push_start(new Nehan.LogicalSize({ measure: 30, extent: 10 }));
  push_end(new Nehan.LogicalSize({ measure: 20, extent: 40 }));
  push_end(new Nehan.LogicalSize({ measure: 10, extent: 10 }));

  test_space(0);
  test_space(16);
  test_space(32);
  test_space(48);
  test_space(60);
});
