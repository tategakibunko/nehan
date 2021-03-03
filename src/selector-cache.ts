import {
  NehanElement,
} from "./public-api";

export class SelectorCache {
  private cache: { [key: string]: NehanElement[] };

  constructor() {
    this.cache = {};
  }

  public clear() {
    this.cache = {};
  }

  public hasCache(selector: string): boolean {
    return this.cache[selector] !== undefined;
  }

  public getCache(selector: string): NehanElement[] {
    return this.cache[selector] || [];
  }

  public addCache(selector: string, element: NehanElement): NehanElement {
    if (!this.hasCache(selector)) {
      this.cache[selector] = [element];
    } else {
      this.cache[selector].push(element);
    }
    return element;
  }
}
