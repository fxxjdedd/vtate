# vstate
Decentralized state management tool for vue3, which has perfect type hints and type verification.

# Usage
```js
// user-profile.ts
import { createState } from 'vstate'
const initialState = {
  username: 'futengda',
}
export const userProfileState = createState({
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

// a.ts
import { userProfileState } from 'vstate'
import { userProfile } from './user-profile'

export default {
  setup() {
    const [userProfile] = useState(userProfileState)
    return () => <div>{userProfile.username}</div>
  }
}

// b.ts
import { userProfileState } from 'vstate'
import { userProfile } from './user-profile'

export default {
  setup() {
    const [_, dispatch, actions] = useState(userProfileState)
    function onClick() {
      dispatch(actions.updateName, 'fxxjdedd')
    }
    return () => {
      return <button onClick={onClick}>change username</button>
    }
  }
}

```

# Todo

- [ ] support dispatch a promise


# License
MIT