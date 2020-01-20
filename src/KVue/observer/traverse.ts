

import { isObject } from '../share/utils/index';


// 记录已经观察的ID
const seenObject: Set<number> = new Set();

export function traverse(val: any) {

}

// 深度收集依赖
function _traverse(val: any, seen: Set<number>): void {

  // 是否是数组
  const isArr: boolean = Array.isArray(val);


  if (!isArr || isObject(val) || Object.isFrozen(val)) return;

  // 如果是一个数组
  if (isArr) {
    let i: number = val.length;
    while(i--) {
      _traverse(val[i], seen);
    }
  } else {
    let keys: string[] = Object.keys(val);

    let i: number = keys.length;
    while(i--) {
      _traverse(val[keys[i]], seen);
    }
  }
}