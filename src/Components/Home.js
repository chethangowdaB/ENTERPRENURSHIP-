import React, { useEffect } from 'react';
import '../styles/home.css';
import Projects from './itm';
import Footer from './foot';
import { useLocation, useNavigate } from 'react-router-dom';
import logo from '../assets/logo.png'; // Import your logo image

const Title = (props) => {
  const navigate = useNavigate();
  const location = useLocation();
  const userId = location.state?.id;

  useEffect(() => {
    if (!userId) {
      navigate('/login');
    }
  }, [userId, navigate]);

  const handleCartClick = () => {
    navigate('./cart', { state: { data: userId } });
  };

  const handleUploadClick = () => {
    if (userId === 'admin@gmail.com') {
      navigate('./upload', { state: { data: userId } });
    } else {
      alert('Only admins can upload products.');
    }
  };

  return (
    <div >
      <nav>
        <img src={logo} alt="Company Logo" className="logo" /> 
        <h1>Nirav Aluminium & UPVC Fabrication</h1>
        <h1 id="user">Welcome {userId}</h1>
        <button onClick={handleCartClick}>Generate Quotation</button>
        {userId === 'admin@gmail.com' && <button onClick={handleUploadClick}>Upload Item</button>}
      </nav>
      
        <Projects email={userId} />
      
      <Footer />
    </div>
  );
};

export default Title;
