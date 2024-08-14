import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const ItemPic = ({ itempi, email }) => {
  const [message, setMessage] = useState('');
  const [addedToCart, setAddedToCart] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [averageRating, setAverageRating] = useState(itempi.averageRating || 0);
  const carouselRef = useRef(null);
  const navigate = useNavigate();

  const images = itempi.productImageLinks || [];

  const scrollToImage = (index) => {
    const container = carouselRef.current;
    if (container) {
      container.scrollTo({
        left: index * container.clientWidth,
        behavior: 'smooth',
      });
    }
  };

  useEffect(() => {
    if (images.length === 0) return;

    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) => {
        const nextIndex = (prevIndex + 1) % images.length;
        scrollToImage(nextIndex);
        return nextIndex;
      });
    }, 5000);

    return () => clearInterval(interval);
  }, [images.length]);

  useEffect(() => {
    if (images.length === 0) return;

    const handleScroll = () => {
      const container = carouselRef.current;
      if (container) {
        const scrollLeft = container.scrollLeft;
        const containerWidth = container.clientWidth;
        const newIndex = Math.round(scrollLeft / containerWidth);
        setCurrentImageIndex(newIndex);
      }
    };

    const container = carouselRef.current;
    if (container) {
      container.addEventListener('scroll', handleScroll);
    }

    return () => {
      if (container) {
        container.removeEventListener('scroll', handleScroll);
      }
    };
  }, [images.length]);

  const handleDotClick = (index) => {
    scrollToImage(index);
    setCurrentImageIndex(index);
  };

  const addToCart = async () => {
    try {
      const checkResponse = await axios.get(`http://localhost:8000/cart/${email}`);
      const userCart = checkResponse.data;

      const productExists = userCart.some((item) => item.productId === itempi.productId);

      if (productExists) {
        setMessage('Product already added to Quotation.');
        setAddedToCart(true);
        return;
      }

      const productData = {
        email,
        productId: itempi.productId,
        productName: itempi.productName,
        image: images[0],
        productDescription: itempi.productDescription,
        rate: itempi.rate,
      };

      const response = await axios.post('http://localhost:8000/cart', productData);

      setMessage('Thank you for adding');
      setAddedToCart(true);
      console.log('Product added to cart:', response.data);
    } catch (error) {
      console.error('Error adding product to cart:', error);
      setMessage('Error adding product to cart.');
    }
  };

  const handleProductClick = () => {
    navigate(`/products/${itempi.productId}`, { state: { id1: email } });
  };

  if (images.length === 0) return <p>Loading...</p>;

  const renderStars = () => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      if (i <= averageRating) {
        stars.push(<span key={i} className='star'>&#9733;</span>); // filled star
      } else {
        stars.push(<span key={i} className='star'>&#9734;</span>); // empty star
      }
    }
    return stars;
  };

  return (
    <figure className='figure'>
      <div className='carousel' ref={carouselRef}>
        {images.map((imageLink, index) => (
          <img
            key={index}
            className='img'
            src={`http://localhost:8000/uploads/${imageLink}`}
            alt={itempi.productName}
            onClick={handleProductClick}
          />
        ))}
      </div>
      <div className='dots-container'>
        {images.map((_, index) => (
          <span
            key={index}
            id='dor'
            className={`dot ${currentImageIndex === index ? 'active' : ''}`}
            onClick={() => handleDotClick(index)}
          />
        ))}
      </div>
      <figcaption className='figcaption'>
        <p className='pa'>{itempi.productName}</p>
        <p className='pa'>₹{itempi.rate}/SQF</p>
        <p className='stars'>Rating :{renderStars()}</p>
        
      </figcaption>
      <button
        className={`button ${addedToCart ? 'button-added' : ''}`}
        onClick={addToCart}
        disabled={addedToCart}
      >
        {addedToCart ? 'Done!' : 'ADD FOR QUOTATION'}
      </button>
      {message && <p className='message'>{message}</p>}
    </figure>
  );
};

export default ItemPic;
