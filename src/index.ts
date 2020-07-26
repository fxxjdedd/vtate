import { all as deepmerge } from 'deepmerge'
import { App, reactive } from '@vue/runtime-dom'

const ATOM_KEY = Symbol('__atom')
const INJECT_KEY = '$vtate'

type Payload = any

type AtomName = string | symbol

type AtomState<S extends object, R extends Reducers<S>> = S & {
  readonly [ATOM_KEY]: Atom<S, R>
}

type Reducers<S extends object> = {
  readonly [K in ActionKey]: (
    atomState: AtomState<S, Reducers<S>>,
    payload?: Payload,
  ) => AtomState<S, Reducers<S>>
}

type StateOptions<S extends object, R extends Reducers<S>> = {
  name: AtomName
  initialState: S
  reducers: R
}

type ActionKey = string

type ActionValue<T> = keyof T & string

type Actions<R> = {
  [K in keyof R]: ActionValue<R>
}

class Atom<S extends object, R extends Reducers<S>> {
  name: AtomName
  reducers: R
  state: AtomState<S, R> // 写作AtomState<S, R>会导致doRender中的类型错误，暂时没找到办法
  actions: Actions<R> // keyof R 可能是string/number/symbol, 这里需要缩小
  constructor(name: AtomName, reducers: R, initialState: S) {
    this.name = name
    this.reducers = reducers
    this.state = deepmerge<any>([{ [ATOM_KEY]: this }, initialState])
    this.actions = Object.getOwnPropertyNames(reducers).reduce(
      (item, next: ActionValue<R>) => {
        item[next] = next
        return item
      },
      {} as Actions<R>,
    )
  }
  doReducer(action: ActionKey, payload?: Payload) {
    const next = this.reducers[action](this.state, payload)
    // dev tools 时间旅行
    this.state = next as AtomState<S, R>
  }
}

export class Vtate {
  private readonly atoms = new Map<AtomName, Atom<any, any>>()
  createAtom<S extends object, R extends Reducers<S>>(
    stateOptions: StateOptions<S, R>,
  ) {
    const { name, reducers, initialState } = stateOptions
    const atom = new Atom<S, R>(name, reducers, initialState)
    this.atoms.set(name, atom)
    // 收集atom到一个中心的store，以后备用
    return atom
  }
}

const vtate = new Vtate()

export default {
  install(app: App) {
    app.provide(INJECT_KEY, vtate)
    // TODO: d.ts
    // https://github.com/vuejs/vuex/tree/4.0#typings-for-componentcustomproperties
    app.config.globalProperties[INJECT_KEY] = vtate
  },
}

export function createState<S extends object, R extends Reducers<S>>(
  stateOptions: StateOptions<S, R>,
) {
  if (!vtate) {
    throw new Error()
  }

  const atom = vtate.createAtom<S, R>(stateOptions)

  return atom.state
}

export function useState<S extends object, R extends Reducers<S>>(
  state: AtomState<S, R>,
) {
  const { [ATOM_KEY]: atom, ...restState } = state
  const reactiveState = reactive(restState)

  function dispatch(
    action: ActionValue<typeof atom.actions>,
    payload?: Payload,
  ) {
    atom.doReducer(action, payload)
  }

  return [reactiveState, dispatch, atom.actions] as const
}
