import React, { Children } from 'react'
import { useNavigate, Navigate } from 'react-router-dom'
import { useSelector } from 'react-redux'

const ProtectedRouter = ({children}) => {
    const navigate=useNavigate()
    const userId=localStorage.getItem('userId')
    console.log(userId)
  return (
    userId?children:<Navigate to='/login'/>
  )
}

export default ProtectedRouter
