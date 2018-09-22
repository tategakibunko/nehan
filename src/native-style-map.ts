export class NativeStyleMap extends Map<string, string> {
  public mergeTo(dst: NativeStyleMap): NativeStyleMap {
    this.forEach((value, key) => {
      dst.set(key, value);
    });
    return dst;
  }

  public apply(dom: HTMLElement): NativeStyleMap {
    let style: any = dom.style;
    this.forEach((value, key) => {
      style[key] = value;
    });
    return this;
  }
}
