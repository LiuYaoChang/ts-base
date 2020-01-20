import { h, init } from 'snabbdom';


export const patch = init([])


export const MyComponent = (props: any) => {
  return h('h1', props.title)
}
