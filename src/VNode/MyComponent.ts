
import { createElement, VNode, mount, patch } from './createElement';
// import { patch } from '../VDom';

// interface Component {
//   isComponent: boolean;
//   render(): VNode;
// }
export class Component  {
  $vnode: VNode;
  $el: Element;
  $props: object;
  _mounted: boolean = false;
  $parentNode: Element;
  // mounted: Function;
  _update(container: Element) {
    // 更新组件
    if (this._mounted) {
      debugger
      const preVnode: VNode = this.$vnode;
      const nextVnode: VNode = (this.$vnode = this.render());
      patch(preVnode, nextVnode, container);
      this.$el = this.$vnode.el = nextVnode.el;
    } else {
      // 初次渲染
      let vnode: VNode = this.$vnode = this.render();
      mount(vnode, container);
      this._mounted = true;
      this.$parentNode = container;
      this.$el = this.$vnode.el = vnode.el;
    }
    console.log('*****Component update***')
  }
  render():VNode {
    return null;
  }
}

// import { VNode } from '';
export default class MyComponent extends Component {
  text: string = 'will update';
  render() {
    let node: VNode = createElement('div', { id: 'my-component' }, [
      // createElement('p', { key: 'd', style: { color: 'blue' }}, '组件 内的节点' + this.text),
      createElement(ChildComponent, { props: { text: this.text }}),
    ])
    return node;
  }
  mounted() {
    setTimeout(() => {
      this.text = 'updated';
      // let container = this.$el['parentNode'];
      this._update(this.$parentNode);
    }, 1000)
  }
}


class ChildComponent extends Component {
  render() {
    let node: VNode = createElement('div', { id: 'child-component' }, [
      createElement('p', { key: 'd', style: { color: 'blue' }}, '子组件会被动更新' + this.$props['text']),
      // createElement(ChildComponent, { props: { text: this.text }}),
    ])
    return node;
  }
}
