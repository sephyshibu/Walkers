import {createSlice} from '@reduxjs/toolkit'


const adminSlice=createSlice({
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

export const{loginuser,logoutuser}=adminSlice.actions
export default adminSlice.reducer