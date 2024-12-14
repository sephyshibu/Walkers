import {configureStore} from '@reduxjs/toolkit'
import userReducer from '../features/userSlice'
import cartReducer from '../features/CartSlice'
import tokenReducer from '../features/tokenSlice'
import defaultAddressReducer from '../features/DefaultAddressSlice'
import storage from 'redux-persist/lib/storage'
import { combineReducers } from 'redux';
import { persistStore, persistReducer, FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER } from 'redux-persist';

const persistConfig = {
    key: 'root', 
    storage,
    blacklist: ['token'], // Specify slices to persist
  };

const rootReducer = combineReducers({
    user: userReducer,
    token: tokenReducer,
    cart:cartReducer,
    defaultAddress:defaultAddressReducer
   


    });

const persistedReducer = persistReducer(persistConfig, rootReducer);


export const store = configureStore({
    reducer: persistedReducer,
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({
        serializableCheck: {
          ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
        },
      }),
  });

  export const persistor = persistStore(store);

  


// const store=configureStore({
//     reducer:{
//         user:userReducer,
//         token:tokenReducer
//     }
// })
// export default store
