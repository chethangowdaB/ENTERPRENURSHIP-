import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useParams, useLocation } from 'react-router-dom';
import '../styles/pd.css';

const ProductDetail = () => {
  const [product, setProduct] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [rating, setRating] = useState('');
  const [comment, setComment] = useState('');
  const [averageRating, setAverageRating] = useState(0);
  const [reviews, setReviews] = useState([]);
  const carouselRef = useRef(null);
  const { id: productId } = useParams();
  console.log(productId)
  const location = useLocation();
  const userEmail = location.state?.id1; 

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await axios.get(`http://localhost:8000/products/${productId}`);
        setProduct(response.data);
        setAverageRating(response.data.averageRating || 0);
        setReviews(response.data.ratings || []);
      } catch (error) {
        console.error('Error fetching product details:', error);
      }
    };

    fetchProduct();
  }, [productId]);

  useEffect(() => {
    if (!product) return;

    const handleScroll = () => {
      const container = carouselRef.current;
      const containerWidth = container.clientWidth;
      const scrollLeft = container.scrollLeft;
      const newIndex = Math.round(scrollLeft / containerWidth);
      setCurrentImageIndex(newIndex);
    };

    const container = carouselRef.current;
    container.addEventListener('scroll', handleScroll);

    return () => container.removeEventListener('scroll', handleScroll);
  }, [product]);

  useEffect(() => {
    if (!product) return;

    const interval = setInterval(() => {
      setCurrentImageIndex(prevIndex => (prevIndex + 1) % (product.productImageLinks.length || 1));
    }, 5000);

    return () => clearInterval(interval);
  }, [product]);

  const handleDotClick = (index) => {
    const container = carouselRef.current;
    container.scrollTo({
      left: index * container.clientWidth,
      behavior: 'smooth'
    });
    setCurrentImageIndex(index);
  };

  const handleRatingSubmit = async () => {
    if (rating < 1 || rating > 5) {
      alert('Rating must be between 1 and 5');
      return;
    }

    try {
      const response = await axios.post('http://localhost:8000/rate', {
        userId: userEmail,
        productId: product.productId,
        rating: parseInt(rating),
        comment
      });

      setAverageRating(response.data.averageRating || averageRating);
      setReviews([...reviews, { userId: userEmail, rating: parseInt(rating), comment }]);
      setRating('');
      setComment('');
    } catch (error) {
      console.error('Error submitting rating:', error);
    }
  };

  const handleLikeDislike = async (reviewIndex, type) => {
    try {
      const response = await axios.post('http://localhost:8000/like-dislike', {
        userId: userEmail,
        productId: product.productId,
        reviewIndex,
        type
      });

      const updatedReview = response.data.review;
      const updatedReviews = [...reviews];
      updatedReviews[reviewIndex] = updatedReview;
      setReviews(updatedReviews);
    } catch (error) {
      console.error(`Error ${type} review:`, error);
    }
  };

  const renderStars = (rating) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <span
          key={i}
          className={`star ${i <= rating ? 'star-gold' : 'star-gray'}`}
        >
          &#9733;
        </span>
      );
    }
    return stars;
  };

  if (!product) return <p className="loading">Loading...</p>;

  return (
    <div className="product-detail">
      <h1>{product.productName}</h1>
      <div className="carousel" ref={carouselRef}>
        {product.productImageLinks.map((imageLink, index) => (
          <img
            key={index}
            src={`http://localhost:8000/uploads/${imageLink}`}
            alt={product.productName}
          />
        ))}
      </div>
      <div className="dots-container">
        {product.productImageLinks.map((_, index) => (
          <span
            key={index}
            className={`dot ${currentImageIndex === index ? 'active' : ''}`}
            onClick={() => handleDotClick(index)}
          />
        ))}
      </div>
      
      <p className="product-description">{product.productDescription}</p>
      <p className="price">₹{product.rate}/SQF</p>
      <div className="star-rating">
        <p>Average Rating: {renderStars(averageRating)}</p>
      </div>

      <div className='rating-container'>
        <h3>Rate this Product</h3>
        <div>
          <input
            type='number'
            value={rating}
            min='1'
            max='5'
            onChange={(e) => setRating(e.target.value)}
            placeholder='Rating (1-5)'
          />
        </div>
        <div>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder='Leave a comment'
          />
        </div>
        <button onClick={handleRatingSubmit}>Submit Rating</button>
      </div>

      <div className="reviews">
        <h3>Reviews</h3>
        {reviews.length > 0 ? (
          reviews.map((review, index) => (
            <div key={index} className="review">
              <p>User: {review.userId}</p>
              <p>Rating: {renderStars(review.rating)}</p>
              <p>{review.comment}</p>
             
            </div>
          ))
        ) : (
          <p>No reviews yet.</p>
        )}
      </div>
      </div>
  );
};

export default ProductDetail;
