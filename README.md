# vstate
Decentralized state management tool for vue3, which has perfect type hints and type verification.

# 特点
- 面向Vue3
- 相比手写有更好的类型提示
- 提供reducer功能，整合状态变化
- 提供全局管理功能

# Usage
```js
// user-profile.ts
import { createState } from 'vtate'
export const userProfileState = createState({
  name: 'userinfo',
  initialState: {
    username: 'futengda',
  },
  reducers: {
    updateName: (state, payload) => {
      state.username = payload
    },
  },
})

// a.ts
import { userProfileState } from 'vtate'
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
- [ ] support global api

# License
MIT