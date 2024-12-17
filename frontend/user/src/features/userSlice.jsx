import {createSlice} from '@reduxjs/toolkit'


const userSlice=createSlice({
    name:"user",
    initialState:{
        user:{}       
    },
    reducers:{
        loginuser:(state,action)=>{
            state.user=action.payload
            

            // console.log("user slice token", state.token)
        },
        updateuser:(state,action)=>{
            state.user=action.payload
        },
       
        logoutuser:(state)=>{
            state.user={}
           
          
        }
    }
})

export const{loginuser,logoutuser,updateuser}=userSlice.actions
export default userSlice.reducer