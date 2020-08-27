import * as Nehan from './public-api';

let sample_list = function () {
  let list = new Nehan.DomTokenList();
  list.add("hoge");
  list.add("hige");
  list.add("hage");
  return list;
};

test("item", () => {
  let list = sample_list();
  expect(list.item(0)).toBe("hoge");
  expect(list.item(1)).toBe("hige");
  expect(list.item(2)).toBe("hage");
});

test("contains", () => {
  let list = sample_list();
  expect(list.contains("hoge")).toBe(true);
  expect(list.contains("hige")).toBe(true);
  expect(list.contains("hage")).toBe(true);
  expect(list.contains("foo")).toBe(false);
});

test("remove", () => {
  let list = sample_list();
  list.add("hoge");
  expect(list.contains("hoge")).toBe(true);
  list.remove("hoge");
  expect(list.contains("hoge")).toBe(false);
});

test("replace", () => {
  let list = sample_list();
  expect(list.contains("hoge")).toBe(true);
  list.replace("hoge", "foo");
  expect(list.contains("hoge")).toBe(false);
  expect(list.contains("foo")).toBe(true);
});

test("toggle", () => {
  let list = sample_list();
  expect(list.contains("hoge")).toBe(true);
  expect(list.toggle("hoge")).toBe(false);
  expect(list.contains("hoge")).toBe(false);
  expect(list.toggle("hoge", true)).toBe(true); // always true
  expect(list.contains("hoge")).toBe(true);
  expect(list.toggle("hoge", true)).toBe(true); // always true
  expect(list.contains("hoge")).toBe(true); // not removed!!
  expect(list.toggle("hige", false)).toBe(false); // always false
  expect(list.contains("hige")).toBe(false);
  expect(list.toggle("hige", false)).toBe(false); // always false
  expect(list.contains("hige")).toBe(false); // not added!!
});
