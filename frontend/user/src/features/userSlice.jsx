import {createSlice} from '@reduxjs/toolkit'


const userSlice=createSlice({
    name:"user",
    initialState:{
        username:"",
       
    },
    reducers:{
        loginuser:(state,action)=>{
            state.username=action.payload
            

            // console.log("user slice token", state.token)
        },
       
        logoutuser:(state)=>{
            state.username=""
          
        }
    }
})

export const{loginuser,logoutuser}=userSlice.actions
export default userSlice.reducer