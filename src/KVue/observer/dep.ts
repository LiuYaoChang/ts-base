// 收集依赖的框

import Watcher from './watcher';
import { remove } from '../share/utils/index';


let uid: number = 0;
export default class Dep {
  static target: Watcher;
  id: number;
  subs: Array<Watcher>


  constructor() {
    this.id = uid++;
    this.subs = [];
  }


  addSub(sub: Watcher) {
    this.subs.push(sub);
  }

  removeSub(sub: Watcher) {
    remove(this.subs, sub);
  }

  depend() {
    if (Dep.target) {
      Dep.target.addDep(this);
    }
  }
  // 通知更新
  notify() {
    let subs: Watcher[] = this.subs;
    for (let i: number = 0, l: number = subs.length; i < l; i++) {
      subs[i].update();
    }

  }
}

Dep.target = null;
let targetQueue: Watcher[] = [];


// 新增一个依赖
export function pushTarget(target?: Watcher) {
  targetQueue.push(target);
  Dep.target = target;
}

// 删除一个依赖
export function popTarget() {
  targetQueue.pop();
  Dep.target = targetQueue[targetQueue.length - 1];
}
