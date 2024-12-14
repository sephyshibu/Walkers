import {createSlice} from '@reduxjs/toolkit'


const defaultAddressSlice=createSlice({
    name:"defaultAddress",
    initialState:{
        
        address:[]
    },
    reducers:{
        // proceed:(state,action)=>{ss
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

export const{defaultaddr}=defaultAddressSlice.actions
export default defaultAddressSlice.reducer