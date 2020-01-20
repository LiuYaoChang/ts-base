import KVue from "../../core";
import { isNative } from ".";
// import { ExecOptions } from "child_process";


let callbacks: any[] = [];
// 是否已经在执行
let pending: boolean = false;
let timerFunc: Function = () => {};

function flushCallback() {
  pending = false;
  let copies: any[] = callbacks.slice(0);
  callbacks.length = 0;
  for (let i: number = 0; i < copies.length; i++) {
    copies[i]();
  }
}
// 迷你版 微任务管理
if (typeof Promise !== 'undefined' && isNative(Promise)) {
  const p = Promise.resolve();

  timerFunc = () => {
    p.then(flushCallback)
  }
}


export function nextTick(cb: Function, ctx?: KVue) {
  let _resolve: any;

  callbacks.push(() => {
    if (cb) {
      try {
        cb.call(ctx);
      } catch(e) {
        console.log(e);
      }
    } else if (_resolve) {
      _resolve(ctx);
    }
  })

  if (!pending) {
    pending = true;
    timerFunc();
  }

  if (!cb && typeof Promise !== 'undefined') {
    return new Promise(resolve => {
      _resolve = resolve;
    })
    // _resolve = Promise.resolve();
  }
}
