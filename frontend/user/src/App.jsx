import './App.css'
import { BrowserRouter as Router, Routes, Route } from 'react-router'
import Signup from './components/Signup'
import Otp from './components/otp'
import Login from './components/Login'
import Home from './components/Home'
import Productpage from './components/Productpage'
import ProductDisplay from './components/ProductDisplay'
import AboutUs from './components/AboutUs'
import ProtectedRouter from './components/ProtectedRouter'
import ScrollToTop from './components/ScrollToTop'
import Breadcrumbs from './components/Breadcrumbs'
import CartPage from './components/CartPage'
function App() {
  
 return(
    <Router>
      <ScrollToTop/>
      
      <Routes>
        <Route path='/login' element={<Login/>}/>
        <Route path='/signup' element={<Signup/>}/>
        <Route path='/otp' element={<Otp/>}/>
        <Route path='/' element={<Home/>}/>
        <Route path='/product' element={<ProtectedRouter><Productpage/></ProtectedRouter>}/>
        <Route path='/products/display/:id' element={<ProtectedRouter><ProductDisplay/></ProtectedRouter>}/>
        <Route path='/cart' element={<ProtectedRouter><CartPage/></ProtectedRouter>}/>
      </Routes>
    </Router>
 )
}

export default App
