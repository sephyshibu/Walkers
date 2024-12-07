import {createSlice} from '@reduxjs/toolkit'


const userSlice=createSlice({
    name:"user",
    initialState:{
        username:"",
        token:""
    },
    reducers:{
        loginuser:(state,action)=>{
            state.username=action.payload.username
            state.token=action.payload.token

            console.log("user slice token", state.token)
        },
        logoutuser:(state)=>{
            state.username=""
            state.token=""
        }
    }
})

export const{loginuser,logoutuser}=userSlice.actions
export default userSlice.reducer