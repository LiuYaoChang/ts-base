// let array: <>
// primial data type

let bool: boolean = true;
let num: number = 21;
let str: string = '1';

// Array

let arr1: number[] = [1,2,3,4];

let arr2: Array<number> = [1,2,3,4];
// 联合类型数组
let arr3: Array<number | string> = [1,2,3, '4'];


// 元组
let tuple: [number, number, number, number] = [1,2,3,4]


// 函数 
let add = (x: number, y: number) => x + y;

let computed: (x: number, y: number) => number;

let log = (str: string): string => str

computed = (a, b) => a + b;

// Symbol

let s1: Symbol = Symbol();
let s2 = Symbol();

console.log(s1 = s2)


// 对象
let obj: { x: number, y: string } = { x: 1, y: 's' }

enum Role {
  Reporter = 1,
  DEVELOPER = 2,
  MAINTAINER = 3
}

console.log(Role.DEVELOPER)

const enum MONTH {
  JAN,
  FEB,
  MAR
}



interface StringArray {
  [index: number]: string
}


let myArray: StringArray;

myArray = ['Bob', 'Fred']

let myStr: string = myArray[0];



console.log(myStr);

interface NumberDict {
  [index: string]: number | string,
  length: number,
  name: string
}


interface ClockInterface {
  setTime(d: Date): void;

  getTime(): Date;
}

class Clock implements ClockInterface {
  private time: Date = new Date();
  constructor() {
    this.time = new Date();
  }
  setTime(d: Date) {
    this.time = d;
  }

  getTime() {
    return this.time;
  }
}

const clock: Clock = new Clock();

 console.log(clock.getTime());

 setTimeout(() => {
  clock.setTime(new Date())
  console.log(clock.getTime())
 }, 1000)


//  class OtherClock extends Clock {
//    constructor() {
//      super();
//    }

//    getTime() {
//      return this.time;
//    }
//  }