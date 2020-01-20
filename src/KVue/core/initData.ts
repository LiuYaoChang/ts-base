import { isPlantObject, noop, hasOwn } from "../share/utils";

import { popTarget, pushTarget } from '../observer/dep'
import { observe } from '../observer/observer';
import KVue from "./index";
export function initData(options: KVueOptions, vm: KVue) {
  let $options: KVueOptions = vm.$options = mergetOptions(options);
  let data: any = $options.data;
  data = vm._data = typeof data === 'function' ? getData($options.data, vm): data;
  for (let key of Object.keys(data)) {
    // if (!hasOwn(vm, key)) {
    proxy(vm, '_data', key)
    // }
  }
  // 开始处理响应式数据
  observe(data, true);
}


/**
 * 定义传入vue中的参数
 */
export interface KVueOptions {
  data: Function | object;
  el: Element | string;
  template?: string;
  render?: Function;
}



const sharePropertyDefinition = {
  enumerabel: true,
  configurable: true,
  get: noop,
  set: (val: any) => {}
}


export function proxy(target: object, sourceKey: string, key: string) {
  sharePropertyDefinition.get = function proxyGetter() {
    return this[sourceKey][key];
  }

  sharePropertyDefinition.set = function proxySetter(val: any) {
    this[sourceKey][key] = val;
  }
  Object.defineProperty(target, key, sharePropertyDefinition);
}

/**
 * 参数和格式化处理
 * @param options 
 */
export function mergetOptions(options: KVueOptions): KVueOptions {
  return options;
}

// 获取 data 配置数据
function getData(data: any, vm: KVue) {
  pushTarget();
  try {
    return data.call(vm, vm)
  } catch (e) {
    // handleError(e, vm, `data()`)
    return {}
  } finally {
    popTarget()
  }
}
