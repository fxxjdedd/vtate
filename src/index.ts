import { Ref, UnwrapRef } from '@vue/reactivity'
import { reactive } from '@vue/runtime-dom'
// TODO: dispatch一个promise值
// TODO: 不能直接reactive，因为可能这个reactive对象在非vue的环境中被使用；因此，我们需要一个hooks，来让它变成reactive

const INJECT_KEY = '$vstate'

type UnwrapNestedRefs<T> = T extends Ref ? T : UnwrapRef<T>

type AtomName = string | symbol

type AtomState<T extends object> = UnwrapNestedRefs<T>

type AtomActions = {}

class Atom<T extends object> {
  reducers: Reducers<T>
  state: AtomState<T>
  constructor(reducers: Reducers<T>, initialState: T) {
    this.reducers = reducers
    this.state = reactive(initialState)
  }
  doReducer(action: string, payload?: any) {
    const next = this.reducers[action](this.state, payload)
    // dev tools 时间旅行
    this.state = next
  }
}

export class VState {
  private readonly atoms = new Map<AtomName, Atom<any>>()
  createAtom<T extends object>(stateOptions: StateOptions<T>) {
    const { name, reducers, initialState } = stateOptions
    const atom = new Atom<T>(reducers, initialState)
    this.atoms.set(name, atom)
    // 收集atom到一个中心的store
    return atom
  }
}

let vstate: VState

export type Reducers<T extends object> = {
  readonly [K in string]: (
    atomState: AtomState<T>,
    payload?: any,
  ) => AtomState<T>
}

type StateOptions<S extends object, R extends Reducers<S> = Reducers<S>> = {
  name: AtomName
  initialState: S
  reducers: R
}

export function createState<S extends object, R extends Reducers<S>>(
  stateOptions: StateOptions<S, R>,
) {
  if (!vstate) {
    throw new Error()
  }

  const atom = vstate.createAtom<S>(stateOptions)

  function dispatch(action: keyof R, payload?: any) {
    atom.doReducer(action as any, payload)
  }

  return {
    state: atom.state,
    dispatch,
  }
}

export default {
  install(app: any) {
    vstate = new VState()
    app.provide(INJECT_KEY, vstate)
    // https://github.com/vuejs/vuex/tree/4.0#typings-for-componentcustomproperties
    app.config.globalProperties[INJECT_KEY] = vstate
  },
}

/////////////////使用

const initialState = {
  username: 'futengda',
}

const { state, dispatch, actions } = createState({
  name: 'userinfo',
  initialState,
  reducers: {
    updateName: (state, payload) => {
      return {
        ...state,
        name: payload,
      }
    },
  },
})

dispatch('updateName', 456)
