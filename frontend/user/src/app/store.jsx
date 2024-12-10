import {configureStore} from '@reduxjs/toolkit'
import userReducer from '../features/userSlice'
import tokenReducer from '../features/tokenSlice'

const store=configureStore({
    reducer:{
        user:userReducer,
        token:tokenReducer
    }
})
export default store
