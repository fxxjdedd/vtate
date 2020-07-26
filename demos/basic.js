import { createState, useDispatch } from '../src'

export const userProfileState = createState({
  name: 'userInfo',
  initialState: {
    username: 'futengda',
  },
  reducers: {
    updateName: (state, payload) => {
      state.username = payload
    },
  },
})

const [dispatch, actions] = useDispatch(userProfileState)

// type safe: directly use string as action-name
dispatch('updateName', 'fxxjdedd')

// type safe: use actions.x to get action-name
dispatch(actions.updateName, 'fxxjdedd')
