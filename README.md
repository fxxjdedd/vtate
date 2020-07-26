# Vtate
A type-safe decentralized state management tool for vue3.

# Motivation

With the use of Composition API, business logic and state are gradually decentralized. The centralized state management tool (vuex) will become a burden. On the other hand, many people are now using Vue3's `reactive-api` to build stores, which reduced a lot of boilerplate code. But too flexible code can easily bring disasters in code maintainability and readability.

Therefore, I think there should be a tool to constrain the process of creating stores. It should combine the advantages of `vue3` and `vuex`, be flexible, and have rules to follow.

# Features
- Create store easily
- Modify data by dispatching an action

# Usage

```jsx
// userProfile.js
import { createState } from 'vtate'

export const userProfile = createState({
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

// main.js
import { useDispatch } from 'vtate'
import { userProfile } from './userProfile'

export default {
  setup() {
    const [dispatch, actions] = useDispatch(userProfile)

    function changeUserName() {
      // directly use string as action-name
      dispatch('updateName', 'fxxjdedd')

      // or, use actions.x to get action-name
      dispatch(actions.updateName, 'fxxjdedd')

      // or,directly modify reactive state
      userProfile.username = 'fxxjdedd'
    }

    return () => {
      return (
        <div>
          username: {userProfile.username} <br/>
          <button onClick={changeUserName}>click</button>
        </div>
      )
    }
  }
}

```

# License
MIT