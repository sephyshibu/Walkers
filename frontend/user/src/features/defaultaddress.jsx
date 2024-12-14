import {createSlice} from '@reduxjs/toolkit'


const defaultaddress=createSlice({
    name:"defaultaddress",
    initialState:{
        
        address:{}
    },
    reducers:{
        // proceed:(state,action)=>{
        //     state.order=action.payload
            

        //     // console.log("user slice token", state.token)
        // },
        defaultaddr:(state,action)=>{
            state.address=action.payload;
        }
       
        // logoutuser:(state)=>{
        //     state.user={}
           
          
        // }
    }
})

export const{defaultaddr}=defaultaddr.actions
export default defaultaddr.reducer