import './App.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './components/Login';
import AdminDashboard from './components/AdminDashboard';
import{Cloudinary} from '@cloudinary/url-gen'
import DashboardPage from './components/DashboardPage';
import Customers from './components/Customer';
import Layout from './components/Layout';
import Category from './components/Category';
import EditCategory from './components/EditCategory';
import Products from './components/Products'
import { fill } from '@cloudinary/url-gen/actions/resize'; // Import the fill method
import EditProduct from './components/EditProduct';
import ProtectedRoute from './components/ProtectedRoute';
import Orders from './components/Orders';
import EditOrder from './components/EditOrder';
function App() {

  
  const cld = new Cloudinary({
    cloud: {
      cloudName: 'dwhpwlk5m'
    }
  });

  const myImage = cld.image('docs/models'); 
    
  // Resize to 250 x 250 pixels using the 'fill' crop mode.
  myImage.resize(fill().width(250).height(250));
  return (
    // <Router>
    //   <Routes>
      
    //     <Route path="/" element={<Login />} />

      
    //     <Route path="/admindashboard" element={<AdminDashboard />}>
    //       <Route path="/dashboard" element={<DashboardPage />} />
    //       <Route path="/customers" element={<Customers />} />
        
    //     </Route>
    //   </Routes>
    // </Router>

<Router>
<Routes>
  <Route path="/" element={<Login />}/>
{/* <Route element={<ProtectedRoute />}> */}
  <Route path="/edit/:id" element={<ProtectedRoute><EditCategory /></ProtectedRoute>} />
  <Route path='/updateproduct/:id' element={<ProtectedRoute><EditProduct/></ProtectedRoute>}/>
  <Route path='/editorder/:id' element={<ProtectedRoute><EditOrder/></ProtectedRoute>}/>
  <Route path="/admindashboard" element={<Layout />}>
    <Route index element={<ProtectedRoute> 
      <DashboardPage />
      </ProtectedRoute>} />
    <Route path="dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute> }/>
    <Route path="customers" element={<ProtectedRoute> <Customers /></ProtectedRoute>} />
    <Route path="category" element={<ProtectedRoute><Category /></ProtectedRoute>} />
    <Route path="products" element={<ProtectedRoute><Products /></ProtectedRoute>} />
    <Route path="orders" element={<ProtectedRoute><Orders/></ProtectedRoute>} />
{/* </Route>   */}
  </Route>
</Routes>
</Router>
  );
}

export default App;