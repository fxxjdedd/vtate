# vstate
Decentralized state management tool

# Usage
```js
// user-profile.ts
import { createState } from 'vstate'
const reducers = {
  'action-name': () => {}
}
const reducer = (action, payload) => {
  return reducers[action](payload)
}

export const UserProfile = createState<typeof reducers>(reducer, initialState)


// main.ts
import { useState } from 'vstate'
const {userProfile, dispatch} = useState(UserProfile) // 内部是inject
dispatch('action-name', {}) // 参数都有类型校验

```
