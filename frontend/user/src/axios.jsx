import axios from 'axios';
import {store} from '../../user/src/app/store'
// import { loginuser } from './features/userSlice';
import { addtoken } from './features/tokenSlice';


// Axios instance
const axiosInstanceuser = axios.create({
  baseURL: 'http://localhost:3000/',
  withCredentials: true,
});

axiosInstanceuser.interceptors.request.use(
  (config)=>{
    const state=store.getState()
    const token=state.token?.token
  console.log("axiios",token)
  console.log("state",state)
  if (typeof token !== 'string') {
    console.error("Token is not a string:", token);
}
  if(token)
  {
    console.log("if(token)",token)
      config.headers['Authorization']=`Bearer ${token}`
      
      // config.headers['Authorization']=`Bearer ${token}`
      // console.log("Authorization Header:", config.headers['Authorization']);

   
  }
  console.log("axios config",config)
  return config
 
 
},
  (error)=>{
    return Promise.reject(error)
  }

)

axiosInstanceuser.interceptors.response.use(
  
  (response) => response, // Forward successful responses
  
  async (error) => {
    const originalRequest = error.config;
    
    if (error.response?.status === 401 && !originalRequest._retry) {
        console.log('401 error detected:', error.response);
      // Token expired, refresh it
      originalRequest._retry = true;

      try {
        const response = await axiosInstanceuser.post(
          '/refresh', {},
         
          { withCredentials: true }
        );
        
        const {token } = response.data;
        
        console.log("response axios ", token)
        store.dispatch(addtoken({ token })); // Updateeeeeeeee Redux with new token

        
        axiosInstanceuser.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        originalRequest.headers['Authorization'] = `Bearer ${token}`;
        return axiosInstanceuser(originalRequest);

      } 
      
      catch (refreshError) {
        console.error("Token refresh failed:", refreshError);
        // store.dispatch(logoutuser()); 
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);

export default axiosInstanceuser