import axios from 'axios';
import store from '../../admin/src/app/store'
import { loginAdmin } from './Slices/adminSlice';
// import {useDispatch} from 'react-redux'

const axiosInstanceadmin = axios.create({
  baseURL: 'http://localhost:3000/admin',
  withCredentials: true,
});

axiosInstanceadmin.interceptors.request.use(
  (config)=>{
    const state=store.getState()
    const token=state.admin?.token
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

// Response Interceptor
axiosInstanceadmin.interceptors.response.use(
  
  (response) => response, // Forward successful responses
  
  async (error) => {
    const originalRequest = error.config;
    
    if (error.response?.status === 401 && !originalRequest._retry) {
        console.log('401 error detected:', error.response);
      // Token expired, refresh it
      originalRequest._retry = true;

      try {
        const response = await axiosInstanceadmin.post(
          '/refresh', {},
         
          { withCredentials: true }
        );
        
        const {token } = response.data;
        console.log("response axios ", token)
        store.dispatch(loginAdmin({ token })); // Updateeeeeeeee Redux with new token

        
        axiosInstanceadmin.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        originalRequest.headers['Authorization'] = `Bearer ${token}`;
        return axiosInstanceadmin(originalRequest);

      } 
      
      catch (refreshError) {
        console.error("Token refresh failed:", refreshError);
        // store.dispatch(logout()); 
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);

export default axiosInstanceadmin