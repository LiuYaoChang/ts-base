import { deserialize } from "v8";

function f() {
  console.log("f(): evaluated");
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
      console.log("f(): called");
  }
}

function g() {
  console.log("g(): evaluated");
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
      console.log('is methods', typeof target, target.constructor, target);
      console.log("g(): called");
  }
}

class C {
  @f()
  @g()
  method() {}
}


function sealed(target: Function) {
  Object.seal(target);

  Object.seal(target.prototype);
}

@sealed
class Greeter {
  greeting: string = '';

  constructor(message: string) {
    this.greeting = message;
  }

  greet(): string {
    return 'Hello' + this.greeting;
  }
}


let gretter: Greeter = new Greeter('ts');

console.log(gretter.greet());


/**
 * override the constructor
 */

 function classDecorator<T extends {new(...args: any[]): {}}>(target: T) {
   return class extends target {
     dynamicProp: string = 'dynamic property';

     hello: string = 'override by decorator';

     getDynamicProp():void {
       console.log(this.dynamicProp)
     }

     getHello():void {
       console.log(this.hello);
     }
   }
 }

@classDecorator
 class Member {
   name: string = '';
   hello: string = '';

   constructor(m: string) {
     this.hello = m;
   }
 }

 let m: Member = new Member('ts');

 console.log(m);

// function enumberable(value: boolean) {
//   return function (target: any, propertyKey: string) {
//     let decorator: PropertyDecorator = Object.getOwnPropertyDescriptor(target, propertyKey) || {};

//     if (descriptor.enumerable !== value) {
//       descriptor.enumerable = value;
//     }
//   }
// }

function enumberable(value: boolean) {
  return function (target: any, propertyKey: string, desc: PropertyDescriptor) {
    // let decorator: PropertyDecorator = Object.getOwnPropertyDescriptor(target, propertyKey) || {};

    if (desc.enumerable !== value) {
      desc.enumerable = value;
    }
  }
}


function log (target: any, name: string, desc: PropertyDescriptor) {
  // 原来的函数
  const fn: Function = desc.value;

  desc.value = function () {
    let args = Array.prototype.slice.call(arguments, 0);
    console.log(`calling ${name} with arguments:`, args);
    return fn.apply(target, args);
  }
}

 class People {
   name: string = '';
  
  constructor(name: string) {
    this.name = name;
  }
  @enumberable(false)
  greet() {
    return 'Hello' + this.name;
  }
 }


 class MyMath {
  ratio: number = 2;
  @log
  add(a: number, b: number): number {
    return (a + b) * (this.ratio || 1);
  }
 }

 let math: MyMath = new MyMath();

 math.add(4, 5);
//  m.getDynamicProp();


class Man {
  // language: string;
  @speak('中文')
  show(): void{
    // this.language = language
    console.log('i can spenk:' + this['language']);
  }
}


function speak(language: string) {
  return function (target: any, name: string, desc: PropertyDescriptor) {
    target.language = language;
    // Object.defineProperty(target, 'language', {
    //   writable: true,
    //   value: language,
    //   configurable: true
    // })
    let fn:Function = desc.value
    desc.value = (args: any[]):void => {
      fn.apply(target, [language])
    }
    console.log(JSON.stringify(target, null, '2'))
    return desc;
  }
}


let boy: any = new Man();
boy.show.call(Man)

