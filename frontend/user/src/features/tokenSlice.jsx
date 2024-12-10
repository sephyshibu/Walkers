import {createSlice} from '@reduxjs/toolkit'


const tokenSlice=createSlice({
    name:"token",
    initialState:{
       
        token:""
    },
    reducers:{
        addtoken:(state,action)=>{
    state.token=action.payload.token
        }
    }
})
export const{addtoken}=tokenSlice.actions
export default tokenSlice.reducer