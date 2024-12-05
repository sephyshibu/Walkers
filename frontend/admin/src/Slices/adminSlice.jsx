import {createSlice} from '@reduxjs/toolkit'

const initialState={
    token:""
}

const adminSlice=createSlice({
    name:"admin",
    initialState,
    reducers:{
        loginAdmin:(state,action)=>{
            state.token=action.payload.token

            console.log("admin slice token", state.token)
        },
        logoutAdmin:(state,action)=>{
            state.token=''
        }
    }
})

export const{loginAdmin,logoutAdmin}=adminSlice.actions
export default adminSlice.reducer