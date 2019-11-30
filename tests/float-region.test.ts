import {
  FloatRegion,
  LogicalSize,
} from '../dist';

test("float-region", () => {
  let region = new FloatRegion(new LogicalSize({ measure: 100, extent: 100 }), 0);

  let push_start = (size: LogicalSize) => {
    let pos = region.pushStart(0, size);
    console.log("push_start:%o, float-pos:%o", size, pos);
  };

  let push_end = (size: LogicalSize) => {
    let pos = region.pushEnd(0, size);
    console.log("push_end:%o, float-pos:%o", size, pos);
  };

  push_start(new LogicalSize({ measure: 10, extent: 20 }));
  push_start(new LogicalSize({ measure: 20, extent: 30 }));
  push_start(new LogicalSize({ measure: 30, extent: 10 }));
  push_end(new LogicalSize({ measure: 20, extent: 40 }));
  push_end(new LogicalSize({ measure: 10, extent: 10 }));

  const spCur1 = region.findSpaceCursorForSize(0, new LogicalSize({ measure: 10, extent: 10 }));
  console.log('spCur1: %o', spCur1);

  const spCur2 = region.findSpaceCursorForSize(0, new LogicalSize({ measure: 20, extent: 20 }));
  console.log('spCur2: %o', spCur2);

  let check: boolean;
  check = region.hasSpaceForSize(0, new LogicalSize({ measure: 10, extent: 10 }));
  console.log('has space? :', check);
  check = region.hasSpaceForSize(0, new LogicalSize({ measure: 20, extent: 10 }));
  console.log('has space? :', check);
  check = region.hasSpaceForSize(10, new LogicalSize({ measure: 20, extent: 10 }));
  console.log('has space? :', check);
});
