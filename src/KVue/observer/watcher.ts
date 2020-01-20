
import KVue from '../core/index';
import Dep, { pushTarget, popTarget } from './dep';
import { traverse } from './traverse';
import { queueWatcher } from './scheduler';
import { isObject } from '../share/utils';
let uid: number = 0;
export default class Watcher {
  value: any;
  vm: KVue;
  id: number;
  sync: boolean = false; // 是否同步更新
  getter: Function;
  deep: boolean;
  cb: Function;
  lazy: boolean;
  user: boolean;

  /** 记录当前周期内的所有依赖 */
  newDepIds: Set<number>;
  newDeps: Array<Dep>;
  deps: Array<Dep>;
  depIds: Set<number>;
  /**
   * 
   * @param vm KVue实例
   * @param expOrFn 要重新求值的公式
   * @param cb 回调
   * @param isRenderWatcher 
   */
  constructor(vm: KVue, expOrFn: string | Function, cb: Function, options?: object, isRenderWatcher?: boolean) {
    this.vm = vm;
    this.cb = cb;
    this.id = uid++;
    // this.newDepIds = [];
    this.newDeps = [];
    this.newDepIds = new Set();
    this.depIds = new Set();
    this.deps = [];
    this.lazy = false; // 只有computed是懒更新的， 也就是初次不求值。
    if (typeof expOrFn === 'function') {
      this.getter = expOrFn;
    } else {
      // 当不是函数就要去
      this.getter = parsePath(expOrFn);

      if (!this.getter) {
        this.getter = () => {};
      }
    }
    // 求值
    this.value = this.lazy ? undefined : this.get();
  }

  // 用于收集当值变化的时候要执行的观察者
  addDep(dep: Dep) {
    let id: number = dep.id;

    if (!this.newDepIds.has(id)) {
      this.newDepIds.add(id);
      this.newDeps.push(dep);
      // 如果 还没有收集些依赖
      if (!this.depIds.has(id)) {
        dep.addSub(this);
      }
    }
  }
  // 重新求值
  // 创建的时候调用，和每次update的时候执行
  get() {
    // 1. 记录当前的watcher实例， 
    // 2. 执行getter重新求值
    // 要被收集的watcher实例
    pushTarget(this);
    let vm: KVue = this.vm;
    let value: any;
    // 执行getter，去重新求值
    try {
      value = this.getter.call(vm, vm);
    } catch(e) {
      console.log(e)
    } finally {
      // 清空新收集的Dep,
      // 深度观察
      if (this.deep) {
        traverse(value)
      }
      popTarget();
      this.cleanupDeps();
    }
    return value;
  }

  // 供外部通知执行重新求值
  update() {
    if (this.sync) {
      this.run()
    } else {
      queueWatcher(this);
    }
    // this.get();
  }


  // 执行更新操作
  run() {
    // 执行get 重新计算值
    let value: any = this.get();

    if (
      value !== this.value ||
      isObject(value) ||
      this.deep
    ) {
      let oldValue: any = this.value;

      this.value = value;
      // 如果 是用户的watcher
      if (this.user) {
        try {
          this.cb.call(this.vm, oldValue, value);
        } catch(e) {
          console.log(e);
        }
        // this.cb.call(this.vm, oldValue, value);
      } else {
        this.cb.call(this.vm, oldValue, value);
      }
    }
  }

  // 清空当前收集的依赖
  cleanupDeps(){

  }
}



function parsePath(path: string) {
  let segments: string[] = path.split('.');
  return function (obj: any): any {
    if (!obj) {
      return;
    }
    for (let i:number = 0, l:number = segments.length; i < l; i++) {
      obj = obj[segments[i]]
    }
    return obj;
  }
}