export namespace Utils {
  export const atoi = (x: string, failOver = 0): number => {
    const n = parseInt(x, 10);
    if (isNaN(n)) {
      console.error(`${x} is not a number, so use ${failOver}`);
      // throw new Error(`${x} is not a number`);
      return failOver;
    }
    return n;
  }

  export const isNumber = (x: any): boolean => {
    return isNaN(Number(x)) === false;
  }

  export const mergeDefault = (obj: any, defaults: any): any => {
    return Object.assign(Object.assign({}, defaults), obj);
  };

  interface EnumItem<E> { id: E; name: keyof E }

  export class Enum {
    // https://basarat.gitbooks.io/typescript/docs/types/literal-types.html
    static fromArray<T extends string>(o: Array<T>): { [K in T]: K } {
      return o.reduce((res, key) => {
        res[key] = key;
        return res;
      }, Object.create(null));
    }

    // https://github.com/Microsoft/TypeScript/issues/12877
    static toObjArray<E>(enum_obj: any): EnumItem<E>[] {
      return Object.keys(enum_obj).map(key => {
        return {
          id: enum_obj[key],
          name: key
        } as EnumItem<E>;
      })
    }

    static toValueArray<E>(enum_obj: any): E[] {
      return Object.keys(enum_obj).map(key => {
        return enum_obj[key] as E
      });
    }

    static member<T>(enum_obj: any, value: T): boolean {
      let array: T[] = Enum.toValueArray(enum_obj);
      return array.indexOf(value) >= 0;
    }
  }

  interface ChoiceArgs<T> {
    name: string,
    value: T,
    values: T[],
    initial: T
  }

  export class Choice {
    static select<T>(args: ChoiceArgs<T>): T {
      if (args.values.indexOf(args.value) >= 0) {
        return args.value;
      }
      return args.initial;
    }
  }

  export class String {
    static getUnicodeProp(str: string): string {
      let code = str.charCodeAt(0);
      let hex = code.toString(16).toUpperCase();
      switch (hex.length) {
        case 0: return "U+0000";
        case 1: return "U+000" + hex;
        case 2: return "U+00" + hex;
        case 3: return "U+0" + hex;
      }
      return "U+" + hex;
    }

    // note that \s is different by browser(some browser include \u3000).
    static multiSpaceToSingle(str: string) {
      return str.replace(/\s+/g, " ");
    }

    // compress spaces to single space except \u3000 
    static multiSpaceToSingle2(str: string) {
      return str.replace(
        /[\u0020\f\n\r\t\v\u00A0\u1680\u180e\u2000-\u200A\u2028\u2029\u202F\u205F\uFEFF]+/gm, " "
      );
    }

    static capitalize(str: string): string {
      if (str === "") {
        return "";
      }
      return str.charAt(0).toUpperCase() + str.slice(1);
    }

    static camelToChain(name: string): string {
      return name.replace(/[A-Z]/g, (s: string) => {
        return "-" + s.toLowerCase();
      });
    }

    static chainToCamel(name: string): string {
      return (name.indexOf("-") < 0) ? name : name.split("-").map((part: string, i: number) => {
        return (i === 0) ? part : this.capitalize(part);
      }).join("");
    }
  }
}
