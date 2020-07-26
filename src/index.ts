import { all as deepmerge } from 'deepmerge'
import { App, reactive } from '@vue/runtime-dom'

const ATOM_KEY = Symbol('__atom')
const INJECT_KEY = '$vtate'

type Payload = any

type AtomName = string | symbol

type AtomState<S extends object, R extends Reducers<S>> = S & {
  readonly [ATOM_KEY]: Atom<S, R>
}

type ReducerHandler<S extends object, P extends Payload = Payload> = (
  atomState: AtomState<S, Reducers<S>>,
  payload?: P,
) => AtomState<S, Reducers<S>> | void

type Reducers<S extends object> = {
  readonly [K in ActionKey]: ReducerHandler<S>
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
  private readonly atoms = new Map<AtomName, Atom<any, Reducers<any>>>()
  // readonly accessor = new Accessor(this.atoms)
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

export function createState<
  S extends object,
  R extends Reducers<S> = Reducers<S>
>(stateOptions: StateOptions<S, R>) {
  const atom = vtate.createAtom<S, R>(stateOptions)

  return reactive(atom.state)
}

export function useDispatch<S extends object, R extends Reducers<S>>(
  state: AtomState<S, R>,
) {
  const { [ATOM_KEY]: atom } = state

  type ReducersType = typeof atom.reducers
  type ActionsType = typeof atom.actions

  function dispatch<A extends ActionValue<ActionsType>>(
    action: A,
    payload?: ReducersType[A] extends ReducerHandler<S, infer P> ? P : unknown,
  ) {
    atom.doReducer(action, payload)
  }

  return [dispatch, atom.actions] as const
}
