import { Ref, UnwrapRef } from '@vue/reactivity'
import { reactive } from '@vue/runtime-dom'

const injectKey = '__vstate__'

type UnwrapNestedRefs<T> = T extends Ref ? T : UnwrapRef<T>

type AtomState<T extends Object> = UnwrapNestedRefs<T>

type c = keyof string[]

type KeyOfReducers<T> = T extends Reducers<object, infer K> ? K : never

let vstate: VState

export type Reducers<T, K = any> = {
  [key in keyof K]: (atomState: AtomState<T>, payload?: any) => AtomState<T>
}

export function createState<T extends object, K extends object>(
  reducers: Reducers<T, K>,
  initialState: T,
) {
  if (!vstate) {
    throw new Error()
  }
  const atom = vstate.createAtom<T>(reducers, initialState)

  function dispatch(action: KeyOfReducers<typeof reducers>, payload?: any) {
    atom.doReducer(action, payload)
  }

  return [atom.state, dispatch] as const
}

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
  install(app) {
    vstate = new VState()
    app.provide(injectKey, vstate)
  }
  createAtom<T extends object>(reducers: Reducers<T>, initialState: T) {
    const atom = new Atom<T>(reducers, initialState)
    return atom
  }
  getAtom() {}
}

const initialState = {
  name: 'futengda',
}

const reducers = {
  updateName: (state, payload) => {
    return {
      ...state,
      name: payload,
    }
  },
} as Reducers<typeof initialState>

const [state, dispatch] = createState(reducers, { name: 'ftd' })
dispatch('d')
