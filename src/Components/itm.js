import React, { useState, useEffect } from 'react';
import axios from 'axios';
import ProductListByCategory from './pc';
import '../styles/new.css';

const App1 = ({ email }) => {
  const [products, setProducts] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [categories, setCategories] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await axios.get('http://localhost:8000/products');
        const productsData = response.data;
        console.log('Fetched products:', productsData);
        setProducts(productsData);

        const uniqueCategories = [...new Set(productsData.map(product => product.mcategory))];
        setCategories(uniqueCategories);

        if (!selectedCategory || !uniqueCategories.includes(selectedCategory)) {
          setSelectedCategory(uniqueCategories[0]);
        }
      } catch (error) {
        console.error('Error fetching products:', error);
      }
    };

    fetchProducts();
  }, []);

  useEffect(() => {
    if (products.length > 0) {
      const uniqueCategories = [...new Set(products.map(product => product.mcategory))];
      setCategories(uniqueCategories);

      if (!selectedCategory || !uniqueCategories.includes(selectedCategory)) {
        setSelectedCategory(uniqueCategories[0]);
      }
    }
  }, [products]);

  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
  };

  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
  };

  const filteredCategories = categories.filter(category => 
    category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className='grid'>
      <center><h1>Product List</h1></center>
      <div className="categories">
        {filteredCategories.map(category => (
          <button
            key={category}
            className={category === selectedCategory ? 'active' : ''}
            onClick={() => handleCategoryChange(category)}
          >
            {category}
          </button>
        ))}
      </div>
      <center>
        <input 
          type="text" 
          value={searchQuery} 
          onChange={handleSearchChange} 
          placeholder="Search categories..." 
          className="search-bar"
        />
      </center>
      <ProductListByCategory products={products} category={selectedCategory} email={email} />
    </div>
  );
};

export default App1;
