import {createSlice} from '@reduxjs/toolkit'


const cartSlice=createSlice({
    name:"cart",
    initialState:{
        
        cart:{}    
    },
    reducers:{
        // proceed:(state,action)=>{ss
        //     state.order=action.payload
            

        //     // console.log("user slice token", state.token)
        // },
        cartitems:(state,action)=>{
            state.cart=action.payload;
        }
       
        // logoutuser:(state)=>{
        //     state.user={}
           
          
        // }
    }
})

export const{cartitems}=cartSlice.actions
export default cartSlice.reducer