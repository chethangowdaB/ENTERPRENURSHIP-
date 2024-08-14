import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import axios from 'axios';
import '../styles/upload.css';

const Upload = () => {
  const [productId, setProductId] = useState(0);
  const [productName, setProductName] = useState('');
  const [productDescription, setProductDescription] = useState('');
  const [productImageFiles, setProductImageFiles] = useState([]);
  const [rate, setRate] = useState('');
  const [category, setCategory] = useState('white');
  const [mcategory, setmatCategory] = useState('UPVC Windows');

  const [imagePreviews, setImagePreviews] = useState([]);
  const [message, setMessage] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  const location = useLocation();
  const { data } = location.state || {};
  const userdata = data;

  useEffect(() => {
    const fetchLastProductId = async () => {
      try {
        const response = await axios.get('http://localhost:8000/getLastProductId');
        const lastProductId = response.data.product;
        setProductId(lastProductId + 1); // Set the next product ID
      } catch (error) {
        console.error('Error fetching last product ID:', error);
      }
    };

    fetchLastProductId();
  }, []);

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    setProductImageFiles(files);
    setImagePreviews(files.map(file => URL.createObjectURL(file)));
  };

  const handleUpload = async () => {
    if (!productId || !productName || !productDescription || !rate || productImageFiles.length === 0 || !category || !mcategory) {
      alert('Please fill in all fields and upload at least one image.');
      return;
    }

    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append('userdata', JSON.stringify(userdata));
      formData.append('productId', productId);
      formData.append('productName', productName);
      formData.append('productDescription', productDescription);
      formData.append('rate', rate);
      formData.append('category', category);
      formData.append('mcategory', mcategory);
      productImageFiles.forEach((file, index) => {
        formData.append('productImages', file);
      });

      const response = await axios.post('http://localhost:8000/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      if (response.status === 201) {
        setMessage('Product uploaded successfully!');
        setProductId(productId + 1); // Increment productId for the next product
        setProductName('');
        setProductDescription('');
        setRate('');
        setCategory('white');
        setmatCategory('UPVC Windows');
        setProductImageFiles([]);
        setImagePreviews([]);
      }
    } catch (error) {
      console.error('Error uploading product:', error);
      setMessage('Error uploading product.');
    } finally {
      setIsUploading(false);
    }
  };

  if (data.userId === 'admin@gmail.com') {
    return <div>Access Denied</div>;
  }

  return (
    <div className="upload-container">
      <h2>Upload Product</h2>
      <div className="upload-form">
        <label>
          Product ID:
          <input
            type="text"
            value={productId}
            onChange={(e) => setProductId(e.target.value)}
            readOnly // Make the input read-only
          />
        </label>
        <label>
          Product Name:
          <input
            type="text"
            value={productName}
            onChange={(e) => setProductName(e.target.value)}
            required
          />
        </label>
        <label className="file-upload">
          Product Images:<br />
          <input type="file" multiple onChange={handleFileChange} required />
          {imagePreviews.map((preview, index) => (
            <img key={index} src={preview} alt="Image Preview" style={{ marginTop: '0px', maxWidth: '75%', height: 'auto' }} />
          ))}
        </label>
        <label>
          Product Description:
          <textarea
            value={productDescription}
            onChange={(e) => setProductDescription(e.target.value)}
            required
          />
        </label>
        <label>
          Color Category:
          <select value={category} onChange={(e) => setCategory(e.target.value)} required>
            <option value="White">White</option>
            <option value="Black Wood">Black</option>
            <option value="Brown">Brown</option>
            <option value="Teak Wood">TeakWood</option>
            <option value="Golden Wood">Golden Wood</option>
            <option value="Grey">Grey</option>
          </select>
        </label>
        <label>
          Material Category:
          <select value={mcategory} onChange={(e) => setmatCategory(e.target.value)} required>
            <option value="UPVC Windows">UPVC Windows</option>
            <option value="UPVC Partition">UPVC Partition</option>
            <option value="Alumninium Window">Aluminium Window</option>
            <option value="Aluminium Partition">Aluminium Partition</option>
            <option value="Mesh Window">Mesh Window</option>
          </select>
        </label>
        <label>
          Product Rate:
          <input
            type="number"
            value={rate}
            onChange={(e) => setRate(e.target.value)}
            required
          />
        </label>
        <button onClick={handleUpload} disabled={isUploading}>
          {isUploading ? 'Uploading...' : 'Upload Product'}
        </button>
        {message && <p className="message">{message}</p>}
      </div>
    </div>
  );
};

export default Upload;
