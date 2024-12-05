import axios from 'axios';


// Axios instance
const axiosInstanceuser = axios.create({
  baseURL: 'http://localhost:3000/',
  withCredentials: true,
});

// axiosInstanceuser.interceptors.request.use(
//   (config)=>{
//     const state=store.getState()
//     const token=state.user?.token
//   console.log("axiios",token)
//   console.log("state",state)
//   if (typeof token !== 'string') {
//     console.error("Token is not a string:", token);
// }
//   if(token)
//   {
//     console.log("if(token)",token)
//       config.headers['Authorization']=`Bearer ${token}`
      
//       // config.headers['Authorization']=`Bearer ${token}`
//       // console.log("Authorization Header:", config.headers['Authorization']);

   
//   }
//   console.log("axios config",config)
//   return config
 
 
// },
//   (error)=>{
//     return Promise.reject(error)
//   }

// )

export default axiosInstanceuser