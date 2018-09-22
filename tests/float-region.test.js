var Nehan = require("../dist");

test("float-region", () => {
  let region = new Nehan.FloatRegion({measure:100, extent:100});

  let push_start = (size) => {
    let pos = region.pushStart(0, size);
    console.log("push_start:%o, float-pos:%o", size, pos);
  };

  let push_end = (size) => {
    let pos = region.pushEnd(0, size);
    console.log("push_end:%o, float-pos:%o", size, pos);
  };

  let test_space = (before_pos) => {
    let rest_measure = region.getSpaceMeasureAt(before_pos);
    let measure_range = region.getSpacePos(before_pos);
    console.log(
      "before:%d, space_measure:%d, space_pos:%o",
      before_pos, rest_measure, measure_range
    );
  };

  push_start({measure:10, extent:20});
  push_start({measure:20, extent:30});
  push_start({measure:30, extent:10});
  push_end({measure:20, extent:40});
  push_end({measure:10, extent:10});

  test_space(0);
  test_space(16);
  test_space(32);
  test_space(48);
  test_space(60);
});
