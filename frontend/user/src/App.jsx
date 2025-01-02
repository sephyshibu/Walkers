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
import Address from './components/Address'
import AddressPage from './components/AddressPage'
import EditAddress from './components/EditAddress'
import Account from './components/Account'
import CheckOut from './components/CheckOut'
import PaymentMethod from './components/PaymentMethod'
import Forgetpassword from './components/Forgetpassword'
import Forgetpasswordotp from './components/forgetpasswordotp'
import ForgetChangepassword from './components/ForgetChangepassword'
import ThankYou from './components/ThankYou'
import WishList from './components/WishList'
import Wallet from './components/Wallet'
function App() {
  
 return(
    <Router>
      <ScrollToTop/>
      
      <Routes>
        <Route path='/login' element={<Login/>}/>
        <Route path='/signup' element={<Signup/>}/>
        <Route path='/otp' element={<Otp/>}/>
        <Route path='/' element={<Home/>}/>
        <Route path='/forgetpassword' element={<Forgetpassword/>}/>
        <Route path='/forgetpasswordotp' element={<Forgetpasswordotp/>}/>
        <Route path='/changepassword' element={<ForgetChangepassword/>}/>
        <Route path='/wallet' element={<ProtectedRouter><Wallet/></ProtectedRouter>}/>
        <Route path='/product' element={<Productpage/>}/>
        <Route path='/products/display/:id' element={<ProductDisplay/>}/>
        <Route path='/wishlist' element={<ProtectedRouter><WishList/></ProtectedRouter>}/>
        <Route path='/cart' element={<ProtectedRouter><CartPage/></ProtectedRouter>}/>
        <Route path='/account/address/add' element={<ProtectedRouter><Address/></ProtectedRouter>}/>
        <Route path='/account/addresspage' element={<ProtectedRouter><AddressPage/></ProtectedRouter>}/>
        <Route path='/edit/:id' element={<ProtectedRouter><EditAddress/></ProtectedRouter>}/>
        <Route path='/account'element={<ProtectedRouter><Account/></ProtectedRouter>}/>
        <Route path='/checkout' element={<ProtectedRouter><CheckOut/></ProtectedRouter>}/>
        <Route path='/checkout/payment' element={<ProtectedRouter><PaymentMethod/></ProtectedRouter>}/>
        <Route path='/thankyoupage' element={<ProtectedRouter><ThankYou/></ProtectedRouter>}/>
      </Routes>
    </Router>
 )
}

export default App
