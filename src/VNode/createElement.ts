
import { hasOwn } from '../KVue/share/utils/index';
import { addClass, setStyle } from '../KVue/share/utils/dom';
import { Component } from './MyComponent';
// enum VnodeType {
//   TEXT = 0,
//   HTML = 1,
//   COMPONENT = 2,
//   FUNCTIONAL_COMPONENT = 3
// }

enum VnodeType {
  ELEMENT_HTML = 1, // html 标签
  ELEMENT_SVG = 1 << 1, // SVG 标签
  COMPONENT_STATEFUL_NORMAL = 1 << 2, // 普通有状态组件
  COMPONENT_STATEFUL_SHOULD_KEEP_ALIVE = 1 << 3, // 需要被keepAlive的有状态组件
  COMPONENT_STATEFUL_KEPT_ALIVE = 1 << 4, // 已经被keepAlive的有状态组件
  COMPONENT_FUNCTIONAL = 1 << 5, // 函数式组件
  TEXT = 1 << 6, // 纯文本
  FRAGMENT = 1 << 7, // Fragment
  PORTAL = 1 << 8, // Portal
  COMPONENT_STATEFUL = VnodeType.COMPONENT_STATEFUL_NORMAL | VnodeType.COMPONENT_STATEFUL_SHOULD_KEEP_ALIVE | VnodeType.COMPONENT_STATEFUL_KEPT_ALIVE,
  COMPONENT = VnodeType.COMPONENT_STATEFUL | VnodeType.COMPONENT_FUNCTIONAL,
  ELEMENT = VnodeType.ELEMENT_HTML | VnodeType.ELEMENT_SVG
}

enum ChildType {
  SINGLE = 1,
  EMPTY = 0,
  MUTIPLE = 3
}


// 定义DATA的类型
enum NodeData {
  STYLE = 'style',
  CLASS = 'class',
  ON = 'on',
  PROPS = 'props',
  ATTRS = 'attrs'
}

// 定义VNode
export interface VNode {
  tag: any;
  flag: VnodeType;
  children: any,
  childrenFlag: ChildType;
  data: VNodeData | null;
  key?: string | number,
  el?: Element
}

// Node data 的接口
interface VNodeData {
  props?: object,
  style?: object,
  class?: any,
  attrs?: any,
  key?: string | number
  id?: string
}

export function createElement(tag: any, data: VNodeData, children: any = null): VNode {
  let flag: VnodeType = VnodeType.TEXT;
  let childrenFlag: ChildType = ChildType.EMPTY;
  let key: string | number = '';
  let el: Element;
  // 这是一个HTML标签
  if (typeof tag === 'string') {
    flag =  tag === 'svg' ? VnodeType.ELEMENT_SVG : VnodeType.ELEMENT_HTML;
  } else if ( typeof tag === null) {
    // 文本节点
    flag = VnodeType.TEXT;
  } else if (typeof tag === 'function') {
    // 组件
    flag = tag.prototype && tag.prototype.render ? VnodeType.COMPONENT_STATEFUL_NORMAL : VnodeType.COMPONENT_FUNCTIONAL;
  }

  if (children === null) {
    childrenFlag = ChildType.EMPTY;
  } else if (Array.isArray(children)) {
    let length: number = children.length;

    if (length === 0) {
      // 没有子节点
      childrenFlag = ChildType.EMPTY;
    } else if (length === 1) {
      // 存在一个子节点
      childrenFlag = ChildType.SINGLE
      children = children[0];
    } else if (length > 1) {
      // 存在多个子节点
      childrenFlag = ChildType.MUTIPLE;
    }
  } else {
    // 文本节点
    childrenFlag = ChildType.SINGLE;
    children = createTextVnode(children);
  }

  if (!hasOwn(data, 'key')) {
    // console.log('需要给list添加一个唯一的key');
    key = Math.random().toString().slice(2);
  } else {
    key = data.key;
  }

  return {
    tag,
    key,
    flag,
    children,
    childrenFlag,
    data,
    el
  }
}


function createTextVnode(text: string): VNode {
  let el: Element;
  return {
    tag: null,
    flag: VnodeType.TEXT,
    data: null,
    children: text,
    childrenFlag: ChildType.EMPTY,
    el
  }
}


// 渲染虚拟DOM
export function render(vnode: VNode, container: Element) {
  let preNode = container['vnode'] || null;
  // 初次渲染
  if (preNode === null) {
    mount(vnode, container);
    container['vnode'] = vnode;
  } else {
    // 存在节点就更新
    if (vnode) {
      patch(preNode, vnode, container);
    } else {
      container.removeChild(preNode.el);
      container['vnode'] = null;
      // 存在旧的节点，但新的没有就删除
    }
  }
  // container['vnode'] = vnode;
}



export function patch(preVnode: VNode, nextVnode: VNode, container: Element) {
  let preFlag: VnodeType = preVnode.flag;
  let nextFlag: VnodeType = nextVnode.flag;
  // diff只做同级比较
  // 如果结点 类型不一样就直接替换，没有可以比较性。
  if (nextFlag !== preFlag) {
    replaceNode(preVnode, nextVnode, container);
  } else if (nextFlag & VnodeType.ELEMENT) {
    patchElement(preVnode, nextVnode, container);
  } else if (nextFlag & VnodeType.TEXT) {
    // if (preVnode.children !== nextVnode.children) {
    patchText(preVnode, nextVnode);
    // }
  } else if (nextFlag & VnodeType.COMPONENT) {
    patchComponent(preVnode, nextVnode, container);
  }
}


/**
 * 更新子组件 
 * @param preVnode
 * @param nextVnode 
 * @param container 
 */


function patchComponent(preVNode: VNode, nextVnode: VNode, container: Element) {
  // 如果组件类型不一样，就替换
  if (preVNode.tag !== nextVnode.tag) {
    replaceNode(preVNode, nextVnode, container);
  } else if (nextVnode.flag & VnodeType.COMPONENT_STATEFUL_NORMAL) {
    let instance: any = (nextVnode.children = preVNode.children);
    instance.$props = nextVnode.data.props;
    console.log('新的props', instance.$props);
    instance._update(container);
  }
}

/**
 * 元素
 * @param preNode
 * @param nextNode 
 * @param container 
 */
function replaceNode(preVnode: VNode, nextVnode: VNode, container: Element) {
  container.removeChild(preVnode.el);
  mount(nextVnode, container);
}


function patchText(preVnode: VNode, nextVnode: VNode) {
  let el: Element = nextVnode.el = preVnode.el;
  if (preVnode.children !== nextVnode.children) {
    el.nodeValue = nextVnode.children;
  }
}


function patchElement(preVnode: VNode, nextVnode: VNode, container: Element) {
  // let pre: VnodeType = preVnode.tag;
  // let nextFlag: VnodeType = nextVnode.tag;
  // 当标签不一样就直接替换
  if (preVnode.tag !== nextVnode.tag) {
    replaceNode(preVnode, nextVnode, container);
    return false;
  }
  let el: Element = (nextVnode.el = preVnode.el);
  let preData: VNodeData = preVnode.data;
  let nextData: VNodeData = nextVnode.data;
  // 数据更新
  for (let type of Object.keys(nextData)) {
    // 存在这个数据
    if (hasOwn(nextData, type)) {
      // 更新数据
      patchData(el, type, preData[type], nextData[type])
    }
  }
  // 如果不存在于新数据中就要删除
  for (let type of Object.keys(preData)) {
    // 存在这个数据
    if (preData[type] && !hasOwn(nextData, type)) {
      // 删除数据
      patchData(el, type, preData[type], null)
    }
  }
  // 更新子元素
  patchChildren(preVnode.childrenFlag, nextVnode.childrenFlag, preVnode.children, nextVnode.children, preVnode.el);
}


// 执行diff 算法的核心
// 更新子元素
/**
 * 1. 旧子节点分为   
 *  1.1 单个
 *  1.2 空的
 *  1.3 多个
 * 2. 新节点分为
 *  2.1 单个
 *  2.2 空的
 *  2.3 多个
 * 
 * 共有 3 * 3 = 9 种可能
 * @param preFlag 
 * @param nextFlag 
 * @param preChildren 
 * @param nextChildren 
 * @param container 
 */
function patchChildren(preChildFlag: ChildType, nextChildFlag: ChildType, preChildren: any, nextChildren: any, container: Element) {
  switch(preChildFlag) {
    case ChildType.SINGLE:
      // 老的是单个
      // 新的也是单个就更新
      if (nextChildFlag === ChildType.SINGLE) {
        patch(preChildren, nextChildren, container);
        break;
      }
      // 新的是空的就删除
      if (nextChildFlag === ChildType.EMPTY) {
        container.removeChild(preChildren.el);
        break;
      }
      // 新的是多个的，先删除旧的，然后再批量创建新的节点
      if (nextChildFlag === ChildType.MUTIPLE) {
        container.removeChild(preChildren.el);
        for (let child of nextChildren) {
          mount(child, container);
        }
        break;
      }
      break;
    case ChildType.EMPTY:
      // 旧的是空的
      // 新的是单个， 就创建
      if (nextChildFlag === ChildType.SINGLE) {
        mount(nextChildren, container);
        // replaceNode(preChildren, nextChildren, container);
        break;
      }
      // 新的是空的就什么也不用做
      if (nextChildFlag === ChildType.EMPTY) {
        // container.removeChild(preChildren.el);
        break;
      }
      // 新的是多个的，直接批量创建节点
      if (nextChildFlag === ChildType.MUTIPLE) {
        // container.removeChild(preChildren.el);
        for (let child of nextChildren) {
          mount(child, container);
        }
        break;
      }
      break;
    case ChildType.MUTIPLE:
      // 老的是多个的
      // 新的是单个， 批量删除旧的节点，然后再创建节点
      if (nextChildFlag === ChildType.SINGLE) {
        for (let child of preChildren) {
          container.removeChild(child.el);
        }
        mount(nextChildren, container);
        break;
      }
      // 批量删除旧的节点
      if (nextChildFlag === ChildType.EMPTY) {
        for (let child of preChildren) {
          container.removeChild(child.el);
        }
        // container.removeChild(preChildren.el);
        break;
      }
      // 新的是多个的，核心的DIFF算法
      // 众多虚拟DOM 就在这里进行区分，每家优化策略不一样
      if (nextChildFlag === ChildType.MUTIPLE) {
        // container.removeChild(preChildren.el);
        // 元素在旧节点中的顺序
        let lastIndex: number = 0;
        console.log('执行diff算法.......')

        for (let i: number = 0; i < nextChildren.length; i++) {
          let nextNode: VNode = nextChildren[i];
          let isExist: boolean = false; // 是否在旧节点中存在
          for (let j:number = 0; j < preChildren.length; j++) {
            let preNode: VNode = preChildren[j];
            // 在新旧节点中都存在
            if (nextNode.key === preNode.key) {
              // nextNode.el = preNode.el;
              // 在旧结点中存在就进行path
              isExist = true;
              patch(preNode, nextNode, container);
              // 当前节点的位置与旧节点中的最大索引比较，如果小于，就要移动
              if (j < lastIndex) {
                let flagNode: Element = nextChildren[i - 1].el.nextSibling;
                container.insertBefore(preNode.el, flagNode);
              } else {
                // 相对索引位置没有变化，不需要移动
                lastIndex = j;
              }
              break;
            }
          }
          // 如果 不存在就要新增
          if (!isExist) {
            let flagNode: Element = i === 0 ? preChildren[0].el : nextChildren[i - 1].el.nextSibling;
            mount(nextNode, container, flagNode);
          }
        }
        // 如果在新的节点中不存在，旧的节点中存在，就要删除
        for (let k: number = 0; k < preChildren.length; k++) {
          let preNode: VNode = preChildren[k];
          let has: boolean = nextChildren.every(next => next.key !== preNode.key);
          if (has) {
            container.removeChild(preNode.el);
          }
        }
        break;
      }
      break;
  }
}
/**
 * 挂载DOM
 * @param vnode 
 * @param container 
 */
export function mount(vnode: VNode, container: Element, flgNode?: Element): void {
  // 渲染的是HTML
  if (vnode.flag & VnodeType.ELEMENT) {
    mountElement(vnode, container, flgNode);
  }
  // 渲染文本节点
  if (vnode.flag === VnodeType.TEXT) {
    mountTextNode(vnode, container);
  }
  // 渲染有状态组件
  if (vnode.flag & VnodeType.COMPONENT) {
    mountComponent(vnode, container);
  }
}



function mountElement(vnode: VNode, container: Element, flgNode?: Element) {
  let el: Element = document.createElement(vnode.tag);
  vnode.el = el;
  let { data, childrenFlag, children } = vnode;
  // 存在子节点
  if (childrenFlag !== ChildType.EMPTY) {
    if (childrenFlag === ChildType.SINGLE) {
      mount(children, el);
    }
    if (childrenFlag === ChildType.MUTIPLE) {
      for (let i = 0; i < children.length; i++) {
        // let vnode: any = children[i];
        mount(children[i], el);
      }
    }
  }
  // 如果有数据
  if (data) {
    for (let prop in data) {
      if (hasOwn(data, prop)) {
        // console.log('挂载数据', data);
        patchData(el, prop, null, data[prop]);
      }
    }
  }
  // patchData(el, data);
  // 挂载元素
  // 如果有参考元素就在之前插入
  if (flgNode) {
    container.insertBefore(el, flgNode);
  } else {
    container.appendChild(el);
  }
}


function mountComponent(vnode: VNode, container: Element) {
  if (vnode.flag & VnodeType.COMPONENT_STATEFUL_NORMAL) {
    mountStatefulComponent(vnode, container);
  } else {
    mountFunctionalComponent(vnode, container);
  }
}

function mountStatefulComponent(vnode: VNode, container: Element): void {
  // let type  = vnode.tag.constructor;
  let instance: Component = new vnode.tag();
  // instance.$vnode = instance.render();
  // mount(instance.$vnode, container);
  // el 属性值 和 组件实例的 $el 属性都引用组件的根DOM元素
  instance.$props = vnode.data.props;
  vnode.children = instance;
  instance._update(container);
  instance['mounted'] && instance['mounted']();
  instance.$el = vnode.el = instance.$vnode.el
}

function mountFunctionalComponent(vnode: VNode, container: Element): void {
  // let type  = vnode.tag.constructor;
  // let instance: any = vnode.tag();
  let $vnode: VNode = vnode.tag();
  mount($vnode, container);
  // el 元素引用该组件的根元素
  vnode.el = $vnode.el
}

function mountTextNode(vnode: VNode, container: Element) {
  let textNode: any = document.createTextNode(vnode.children);
  vnode.el = textNode
  container.appendChild(textNode);
}

function patchData(el: Element, type: any, preData: any, nextData: any) {
  switch(type) {
    case NodeData.STYLE:
      // 更新数据
      for (let key in nextData) {
        if (hasOwn(nextData, key)) {
          setStyle(el, key, nextData[key]);
        }
      }
      // 删除不存在的属性
      if (preData !== null) {
        for (let key in preData) {
          debugger
          if (preData[key] && nextData && !hasOwn(nextData, key)) {
            setStyle(el, key, '');
          }
        }
      }
      break;
    case NodeData.CLASS:
      addClass(el, nextData);
      break;
    case NodeData.PROPS:
      // 设置props
      break;
    case NodeData.ATTRS:
      // 设置属性
      break;
    case NodeData.ON:
      // 注册事件
      break;
    default:
      // 绑定key
      el.setAttribute(type, nextData);
  }
}