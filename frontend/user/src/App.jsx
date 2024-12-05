
import './App.css'
import { BrowserRouter as Router, Routes, Route } from 'react-router'
import Signup from './components/Signup'
import Otp from './components/otp'
import Login from './components/Login'
import Home from './components/Home'
import Productpage from './components/Productpage'
import ProductDisplay from './components/ProductDisplay'
function App() {
  
 return(
    <Router>
      <Routes>
        <Route path='/' element={<Login/>}/>
        <Route path='/signup' element={<Signup/>}/>
        <Route path='/otp' element={<Otp/>}/>
        <Route path='/home' element={<Home/>}/>
        <Route path='/product' element={<Productpage/>}/>
        <Route path='/product/display:id' element={<ProductDisplay/>}/>
      </Routes>
    </Router>
 )
}

export default App
