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
       
        logoutuser:(state)=>{
            state.user={}
           
          
        }
    }
})

export const{loginuser,logoutuser}=userSlice.actions
export default userSlice.reducer