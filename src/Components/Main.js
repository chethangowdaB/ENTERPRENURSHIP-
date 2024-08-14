import React from 'react';
import {BrowserRouter as Router, Routes, Route} from 'react-router-dom'
import Home from './Home';
import Login from './login';
import SignupForm from './signup';
import Cart from './Cart';
import Upload from './upload'
import ProductDetail from './ProductDetail.js';
function Main() {
  return (
        <Router>
       <Routes>
       <Route path="/" element={<Login/>}/>
       <Route path="/home" element={<Home />} /> 
       <Route path="/home/cart" element={<Cart />} /> 
       <Route path="/signup" element={<SignupForm />} />
       <Route path='/home/upload' element={<Upload />} />
       <Route path="/products/:id" element={<ProductDetail/>} />
       </Routes>
       </Router>
  
  );
}

export default Main;
