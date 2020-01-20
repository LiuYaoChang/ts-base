import './class/datatype.ts'
import './class/decorator.ts'
import MyComponent from './VNode/MyComponent';

import KVue from './KVue/core/index';
// import './tpl/index.css'
// import './server/index';
import { createElement, render, VNode } from './VNode/createElement';
// let hello: string = 'Hello Typescript'
// import { patch } from './VDom/index';
let el: Element = document.getElementById('app');
let vnode = createElement('div', { id: 'text' }, [
  createElement('p', { key: 'a', style: { color: 'red' }}, 'Text Nnode 1'),
  createElement('p', { key: 'b', style: { color: 'red', fontSize: '24px' }}, 'Text Nnode 2'),
  createElement('p', { key: 'c', class: 'item-text' }, 'Text Nnode 3'),
  createElement('p', { key: 'd', style: { color: 'red' }}, 'Text Nnode 4'),
  createElement(MyComponent, { key: 'my-component' }, null)
])

// 执行DIF
let newVNode = createElement('div', { id: 'text' }, [
  createElement('p', { key: 'd', style: { color: 'blue' }}, 'Text Nnode 4'),
  createElement('p', { key: 'a', style: { color: 'red', fontSize: '24px' }}, 'Text Nnode 1'),
  createElement('p', { key: 'b', class: 'item-text' }, 'Text Nnode 2'),
  createElement('p', { key: 'e' }, 'Text Nnode 5'),
  createElement('div', { key: 'f', style: { color: '#eeeeee' }}, 'Text Nnode 6')
])

//多个到1个
let newVNode1 = createElement('div', { id: 'text' }, [
  createElement('p', { key: 'd', style: { color: 'blue' }}, 'Text Nnode 4'),
])

/***********用于测试diff */

let vnode11: VNode = createElement('ul', { class: 'list' }, [
  createElement('li', { key: 'a', style: { fontWeight: '700', color: 'blue' }}, 'li node a'),
  createElement('li', { key: 'b', style: { color: 'red', fontSize: '24px' }}, 'li node b'),
  createElement('li', { key: 'c', class: 'item-text' }, 'li node c')
])

let vnode12: VNode = createElement('ul', { class: 'list' }, [
  createElement('li', { key: 'c', style: { color: 'blue' }}, 'li node c'),
  createElement('li', { key: 'a', style: { color: 'red', fontSize: '24px' }}, 'li node a'),
  createElement('li', { key: 'd', style: { color: 'green' }}, 'li node d'),
  createElement('li', { key: 'b', class: 'item-text' }, 'li node b')
])



// console.log(vnode)
render(vnode11, el)

// document.querySelectorAll('.app')[0].innerHTML = hello



// setTimeout(() => {
//   render(vnode12, el)
// }, 1000);


const vm = new KVue({
  el: '#test',
  data: {
    a: 1,
    b: 2,
    c: [{id: 1, name: 'Hello KVue'}]
  }
})


vm.a = 5;
vm.b = 10;
debugger
// vm.c.push(2)
vm['c'].push(11)
console.log(vm['a'])
/*
// 组件的产出是 VNode
const prevVnode = MyComponent({ title: 'prev' })
// 将 VNode 渲染成真实 DOM
patch(document.getElementById('app') as Element, prevVnode)

setTimeout(() => {
  // 数据变更，产出新的 VNode
  const nextVnode = MyComponent({ title: 'next' })
  // 通过对比新旧 VNode，高效地渲染真实 DOM
  patch(prevVnode, nextVnode)
}, 2000)


*/