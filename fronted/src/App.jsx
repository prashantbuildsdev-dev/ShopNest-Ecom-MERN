import React, { useContext } from "react";
import { Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/navbar';
import Footer from "./components/footer";
import Home from './pages/Home';
import About from './pages/About';
import Return from './pages/ReturnPolicy';
import Disclaimer from './pages/Disclaimer';
import Login from './pages/Login';
import Register from "./pages/Register";
import ProductDetail from './pages/ProductDetail';
import Cart from './pages/Cart';
import Checkout from './pages/CheckOut';
import Shop from './pages/Shop';
import OrderSuccess from "./pages/OrderSuccess";
import Profile from "./pages/Profile";
import AddProduct from "./admin/AddProduct";
import AdminDashboard from "./admin/AdminDeshboard";
import AdminOrders from "./admin/AdminOrders";
import AdminProducts from "./admin/AdminProducts";
import AdminUsers from "./admin/AdminUsers";
import EditProduct from "./admin/EditProduct";
import { AuthContext } from "./context/AuthContext";

function AdminRoute({ children }) {
  const { user } = useContext(AuthContext);
  return user?.role === 'admin' ? children : <Navigate to="/login" replace />;
}

function App() {
  return (
    <div className="app">
      <Navbar/>
      <main className="min-content">
        <Routes>
          <Route path="/" element={<Home/>}/>
          <Route path="/shop" element={<Shop/>}/>
          <Route path="/about" element={<About/>}/>
          <Route path="/cart" element={<Cart/>}/>
          <Route path="/checkout" element={<Checkout/>}/>
          <Route path="/ordersuccess" element={<OrderSuccess/>}/>
          <Route path="/return-policy" element={<Return/>}/>
          <Route path="/return" element={<Navigate to="/return-policy" replace/>}/>
          <Route path="/disclaimer" element={<Disclaimer/>}/>
          <Route path="*" element={<div className="page-message"><h2>Page not found</h2><p>The page you requested does not exist.</p></div>}/>
          <Route path="/login" element={<Login/>}/>
          <Route path="/register" element={<Register/>}/>
          <Route path="/products/:id" element={<ProductDetail/>}/>
          <Route path="/profile" element={<Profile/>}/>
          <Route path="/admin" element={<AdminRoute><AdminDashboard/></AdminRoute>}/>
          <Route path="/admin/add-product" element={<AdminRoute><AddProduct/></AdminRoute>}/>
          <Route path="/admin/orders" element={<AdminRoute><AdminOrders/></AdminRoute>}/>
          <Route path="/admin/products" element={<AdminRoute><AdminProducts/></AdminRoute>}/>
          <Route path="/admin/users" element={<AdminRoute><AdminUsers/></AdminRoute>}/>
          <Route path="/admin/edit-product/:id" element={<AdminRoute><EditProduct/></AdminRoute>}/>
        </Routes>
      </main>
      <Footer/>
    </div>
  
  )
}

export default App;
