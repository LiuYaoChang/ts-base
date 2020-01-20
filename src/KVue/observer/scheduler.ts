import Watcher from "./watcher";
import { nextTick } from "../share/utils/next-tick";



// 存储Watcher 队列
let queue: Array<Watcher> = [];

// 是否已经在更新
let flushing: boolean = false;

interface Has {
  [id: number]: boolean;
}

let index: number = 0;

let has: Has = {};

function resetSchedulerState(): void {
  index = queue.length = 0;
  has = {};

  waiting = flushing = false;
}

// 前一次队列中的watcher已经全部更新完
let waiting: boolean = false;
// 负责管理watcher 队列
// 加入微任务队列中，执行所有watcher
function flushSchedulerQueue() {
  flushing = true;

  // 1. 保证父组件在子组件更新之前 
  // 2. 组件内的watcher， 在其渲染函数的watcher的之前执行
  // 组件的注销发生在父组件 watcher 运行时，些组件 内的watcher 可以跳过
  queue.sort((a, b) => (a.id - b.id))


  for (index = 0; index < queue.length; index++) {
    let watcher: Watcher = queue[index];

    // 在这可以执行before钩子
    let id: number = watcher.id;
    has[id] = null;

    // 执行run 方法重新求值。
    watcher.run();
    // 执行完一次更新后，重置所有状态
    resetSchedulerState();
  }
}




export function queueWatcher(watcher: Watcher): void {
  const id: number = watcher.id;
  // 如果还不在当前队列中，
  if (has[id] == null) {
    has[id] = true;
    // 目前不处理更新队列状态
    if (!flushing) {
      queue.push(watcher);
    } else {
      let i: number = queue.length - 1;
      while(i > index && queue[i].id > watcher.id) {
        i--;
      }
      // 插入watcher到合适的位置
      queue.splice(index + 1, 0, watcher);
    }

    if (!waiting) {
      waiting = true;
      nextTick(flushSchedulerQueue);
    }
  }
}