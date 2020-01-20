import { isObject, def } from '../share/utils/index';
import Dep from './dep';
let arrayProto: object = Array.prototype;
import { Observer } from './observer';
export const arrayMethods: object = Object.create(arrayProto);

let methodToPatch: string[] = [
  'splice',
  'push',
  'pop',
  'shift',
  'unshift',
  'sort',
  'reverse'
]

// 数组原型方法拦截， 由于我们在通过索引 去访问数组项不能触发数据的访问器
methodToPatch.forEach((method: string) => {
  // 获取原始数组方法绑在
  const originMethod: Function = arrayProto[method];
  console.log('数组响应式处理')
  def(arrayMethods, method, function mutator() {
    const args = Array.prototype.slice.call(arguments, 0);
    // 获取原始数组方法的执行结果
    let result: any = originMethod.apply(this, args);
    let ob: Observer = this.__ob__;
    let inserted: any[];
    switch(method) {
      case 'push':
      case 'unshift':
        inserted = args;
        break;
      case 'splice':
        inserted = args.slice(2);
        break;
    }

    console.log('修改了数组的数据', inserted);
    if (inserted) ob.observeArray(inserted);
    // notify change
    ob.dep.notify();
    return result;
  })


})
