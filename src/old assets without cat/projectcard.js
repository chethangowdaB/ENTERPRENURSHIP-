import React, { useState, useEffect } from 'react';
import Items from './Items';
import axios from 'axios';
import '../styles/pro.css';

const ProjectCard = ({ email }) => {
  const [items, setItems] = useState([]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await axios.get('http://localhost:8000/products');
        setItems(response.data);
        console.log(response.data);
      } catch (error) {
        console.error('Error fetching products:', error);
      }
    };

    fetchProducts();
  }, []);

  return (
    <div className="project-card-container">
      <center>
        <h2 className='pro' style={{ marginTop: "100px" }}>Services</h2>
      </center>
      <div className="items-container">
        <Items projects={items} email={email} />
      </div>
    </div>
  );
};

export default ProjectCard;
