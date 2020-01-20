

import KVue from './index';
import Watcher from '../observer/watcher';



export function mountComponent(vm: KVue, el?: Element) {
  vm.$el = el;

  // 如果不存在render, 不执行
  if (!vm.$options.render) {
    vm.$options.render = () => {}
  }


  let updateComponent = () => {
    // 执行更新, 实现更新DOM
    vm._update(vm._render())
  }
  // 生成渲染函数的 watcher
  new Watcher(this, updateComponent, () => {
    console.log('这是回调')
  })
}