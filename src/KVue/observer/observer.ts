/**
 * 处理数据响应式的Observer类
 */

 import { isObject, def, hasProto } from '../share/utils/index';
// import Dep from './Dep'
import Dep from './dep';

import { arrayMethods } from './array';
import { getMaxListeners } from 'cluster';
import { uptime } from 'os';

  let $isServer: boolean = false; // 是否服务端渲染
  let shouldObserve: boolean = true;
 export class Observer {
  value: object; // 记录当前响应式数据
  vmCount: number;
  dep: Dep;
  constructor(value: object) {
    this.value = value;
    this.dep = new Dep();
    // 响应式数据引用
    def(value, '__ob__', this, false);

    if (Array.isArray(value)) {
      if (hasProto) {
        protoArgument(value, arrayMethods);
      }
      this.observeArray(value);
    } else {
      this.walk(value);
    }
  }

  // 处理对象
  walk(obj: object) {
    let keys: string[] = Object.keys(obj);
    for (let i: number = 0; i < keys.length; i++) {
      defineReactive(obj, keys[i]);
    }
  }
  // 处理数组
  observeArray(items: Array<any>) {
    for (let i: number = 0, l: number = items.length; i < l; i++) {
      observe(items[i]);
    }
  }
 }

/**
 * Augment a target Object or Array by intercepting
 * the prototype chain using __proto__
 */
// 如果支持__proto__,  将属性的原型直接指向异构后的数组原型
// src ,通过原型继承后的数组原型对象，并经过处理。接下来对数组的操作都会进入新的原型方法中。
function protoArgument(obj: object, src: any) {
  obj['__proto__'] = src;
}


 export function observe(obj: any, asRoot: boolean = false) {
  if (!isObject(obj)) {
    return false;
  }
  // 是一个引用类型，要判断是不是已经是响应数据
  let ob: Observer | void;
  if (obj.__ob__ && (obj.__ob__  instanceof Observer)) {
    ob = obj.__ob__;
  } else {
    if (
      !$isServer &&
      shouldObserve &&
      Object.isExtensible(obj)
    ) {
      // 注册响应式入口
      ob = new Observer(obj);
    }
  }
  return ob;
 }

 // 拦截数据 属性的访问器从而实现数据响应式处理。
 /**
  * 
  * @param obj 观察对象
  * @param key 对应的属性值
  * @param val 传入的值
  * @param shallow 是否进行深度观察
  */
 export function defineReactive(obj: object, key: string, val?: any, shallow?: boolean) {

  // 用来收集当前属性的依赖， 修改属性的时候触发
  let dep: Dep = new Dep();
  // 1. 获取数据访问器，并缓存 在本地
  // 2. 根据getter, seeter, 参数，来确定是否要获取数据
  // 3. 重写数据 getter， setter, 当访问属性的时候收集依赖，当修改属性的时候触发重新求值，并重新渲染

  let descriprot: PropertyDescriptor = Object.getOwnPropertyDescriptor(obj, key);

  // 不可配置就不进行响应式处理
  if (descriprot && descriprot.configurable === false) {
    return;
  }
  let getter: any = descriprot.get;
  let setter: any = descriprot.set;
  console.log('处理属性：', key)

  /**
   * 1. 如果 arguments 长为3，参数 val 存在，就认为是显式地设置了这个键的值，原来的值就不考虑了
   * 2. 如果 getter setter 都存在，就认为这对 getter/setter 是在代理某个真实值，所以需要 val = obj[key]，然后 let childOb = observe(val) 对这个真实值继续进行递归设置
   * 3. 否则 如果 getter 存在，setter 不存在，认为 getter 大概只是返回某个生成的值，不执行 val = obj[key]，也就导致下面 let childOb = observe(undefined)
   * 4. getter 不存在，setter 存在，这类奇葩事情不在考虑范围内（例如 document.cookie）
   */

  if ((!getter || setter) && arguments.length === 2) {
    val = obj[key];
  }

  let childOb: any = !shallow && observe(val);

  Object.defineProperty(obj, key, {
    configurable: true,
    enumerable: true,
    // 重新定义访问器getter
    // 1. 获取旧getter返回的值， 2. 收集依赖
    get () {
      let value = getter ? getter.call(obj) : val;
      console.log('获取属性', key)
      if (Dep.target) {
        dep.depend()
        if (typeof childOb === 'function') {
          childOb.dep.depend();
        }
      }
      return value;
    },
    set(newValue: any) {
      let value: any = getter ? getter.call(obj): val;

      // 如果新旧值没有发生变化不更新
      // 前后都是NAN也不更新
      if (newValue === value || (newValue !== newValue && value !== value)) return;

      // 如果 没有setter就返回
      if (getter && !setter) return;

      if (setter) {
        setter.call(obj, newValue);
      } else {
        val = newValue;
      }
      childOb = !shallow && observe(newValue);
      // 通知更新视图
      dep.notify();
      console.log('设置属性', key)
    }
  })
 }