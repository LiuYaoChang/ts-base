/**
 * KVue 入口
 */
import { KVueOptions, initData } from './initData';
import { mountComponent } from './lifecycle';
interface KVueAble {
   _init(options: KVueOptions): void;
}

let uid: number = 0;

 export default class KVue implements KVueAble {
    $options: KVueOptions;
    _data: object;
    _uid: number;
    _isVue: boolean;
    [data: string]: any;
    constructor(options: KVueOptions) {
      this.$options = options;
      this._init(options);
    }

    // 初始化入口
    _init(options: KVueOptions): void {


      this._isVue = true;
      this._uid = uid++;
      initData(options, this);
      
      /**
       * 中间处理过程
       */
      this.$mount();
      
    }

    // 挂载入口
    $mount() {
      let el: Element;
      mountComponent(this, el);
    }

    _update(vnode: any) {
      // console.log('这是挂载DOM')
      console.log('挂载VNODE', this.a)
      console.log('挂载VNODE', this.b)
      // 执行更新
    }

    // 生成虚拟DOM
    _render() {
      console.log('生成虚拟DOM')
    }
 }