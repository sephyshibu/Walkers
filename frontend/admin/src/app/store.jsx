import {configureStore} from '@reduxjs/toolkit'
import adminReducer from '../Slices/adminSlice'

const store=configureStore({
    reducer:{
        admin:adminReducer
    }
})
export default store
