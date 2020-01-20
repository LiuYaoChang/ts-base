/**
 * Check whether an object has the property.
 */

 const proto = Object.prototype;
const hasOwnProperty = Object.prototype.hasOwnProperty
export function hasOwn (obj: Object | Array<any>, key: string): boolean {
  return hasOwnProperty.call(obj, key)
}


// empty function
export function noop() {};
// 是一个引用类型
export function isObject(obj: any): boolean {
  return obj !== null && typeof obj === 'object';
}

export function def(target: object, key: string, value: any, enumerable: boolean = false): void {
  Object.defineProperty(target, key, {
    configurable: true,
    enumerable: enumerable,
    value: value,
    writable: true
  });
}

export function isPlantObject(obj: any): boolean {
  return proto.toString.call(obj) === '[object Object]';
}


export function isNative(fn: any): boolean {
  return typeof fn === 'function' && /native code/.test(fn.toString());
}


export function remove(arr: Array<any>, item: any) {
  let index: number = arr.indexOf(item);
  if (index > -1) {
    arr.splice(index, 1);
  }
}

// can we use __proto__?
export const hasProto = '__proto__' in {}
