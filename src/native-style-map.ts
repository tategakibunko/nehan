/*
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
*/

// [workaround]
// In es5, extends Map<string, string> doen't work!
// Disable this code after googlebot supports es6.
export class NativeStyleMap {
  _map: Map<string, string>;

  constructor() {
    this._map = new Map<string, string>();
  }

  public set(key: string, value: string): NativeStyleMap {
    this._map.set(key, value);
    return this;
  }

  public delete(key: string): NativeStyleMap {
    this._map.delete(key);
    return this;
  }

  public forEach(fn: (value: string, key: string) => void) {
    this._map.forEach(fn);
  }

  public mergeTo(dst: NativeStyleMap): NativeStyleMap {
    this.forEach((value, key) => {
      dst.set(key, value);
    });
    return dst;
  }

  // legacy
  public apply(dom: HTMLElement): NativeStyleMap {
    let style: any = dom.style;
    this.forEach((value, key) => {
      style[key] = value;
    });
    return this;
  }

  public applyTo(style: CSSStyleDeclaration): NativeStyleMap {
    this._map.forEach((value, key) => {
      style.setProperty(key, value);
    });
    return this;
  }
}
