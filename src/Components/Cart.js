import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import axios from 'axios';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import '../styles/cart.css';
import logo from '../assets/logo.png'; 

const Cart = () => {
  const location = useLocation();
  const { data } = location.state || {};
  const [userCart, setUserCart] = useState(null);
  const [totalAmount, setTotalAmount] = useState(0);
  const [squareFootages, setSquareFootages] = useState({});
  const [estimates, setEstimates] = useState({});
  const [gstNumber, setGstNumber] = useState('');
  const [gstInfo, setGstInfo] = useState(null);
  const [isValidGst, setIsValidGst] = useState(false);
  const [buyerName, setBuyerName] = useState('');
  const [buyerAddress, setBuyerAddress] = useState('');
  const [buyerDetailsEntered, setBuyerDetailsEntered] = useState(false);
  const [printingMode, setPrintingMode] = useState(false);

  const sellerInfo = {
    name: "NIRAV ALUMINIUM AND UPVC FABRICATIONS WORKS",
    gstin: "29BIKPM3953M1ZI",
    address: "4 BEGUR VILLAGE, GROUND FLOOR, BYREGOWDA, MUTHSANDRA VILLAGE HOSOKOTE TALUK, BANGALORE RURAL Bengaluru Rural, KARNATAKA, 562122",
    mobile: "9113683300",
    email: "niravfabrications2020@gmail.com"
  };

  const fetchUserCart = async () => {
    try {
      if (data) {
        const response = await axios.get(`http://localhost:8000/cart/${data}`);
        setUserCart(response.data);
      }
    } catch (error) {
      console.error('Error fetching user cart:', error);
    }
  };

  useEffect(() => {
    fetchUserCart();

    return () => {
      setUserCart(null);
    };
  }, [data]);

  useEffect(() => {
    if (userCart) {
      let total = 0;
      userCart.forEach(item => {
        total += Number(item.rate);
      });
      setTotalAmount(total);
    }
  }, [userCart]);

  const handleSquareFootageChange = (productId, value) => {
    const newSquareFootages = { ...squareFootages, [productId]: value };
    setSquareFootages(newSquareFootages);

    const newEstimates = { ...estimates, [productId]: value * userCart.find(item => item.productId === productId).rate };
    setEstimates(newEstimates);

    const total = Object.values(newEstimates).reduce((acc, estimate) => acc + estimate, 0);
    setTotalAmount(total);
  };

  const handleDeleteProduct = async (productId) => {
    try {
      await axios.post(`http://localhost:8000/cart/${data}/${productId}`);
      fetchUserCart();
    } catch (error) {
      console.error('Error deleting product:', error);
    }
  };

  const handlePrint = () => {
    setPrintingMode(true); // Enable printing mode
    window.print();
    setPrintingMode(false); // Disable printing mode after printing
  };

  const validateGstNumber = async () => {
    try {
      const response = await axios.post('http://localhost:8000/validate-gst', { gstNumber });
      if (response.data) {
        setGstInfo(response.data);
        setIsValidGst(true);
        setBuyerDetailsEntered(true);
      } else {
        alert('Invalid GST number');
      }
    } catch (error) {
      console.error('Error validating GST number:', error.message);
      alert('Error validating GST number. Please try again.');
    }
  };

  const handleBuyerDetailsSubmit = () => {
    setBuyerDetailsEntered(true);
  };

  const generatePDF = async () => {
    const input = document.getElementById('printContents');
    const canvas = await html2canvas(input, { useCORS: true }); // Enable CORS for images
    const imgData = canvas.toDataURL('image/png');

    const pdf = new jsPDF('p', 'mm', 'a4');
    const imgWidth = 210; 
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
    return pdf.output('blob');
  };

  const handleSendQuotation = async () => {
    try {
      const pdfBlob = await generatePDF();
      const formData = new FormData();
      formData.append('pdf', pdfBlob, 'quotation.pdf');
      formData.append('userEmail',data);
      formData.append('adminEmail', 'chb21is@cmrit.ac.in'); 

      await axios.post('http://localhost:8000/send', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      alert('Quotation sent successfully!');
    } catch (error) {
      console.error('Error sending quotation:', error);
    }
  };

  return (
    <div className="cart-container" >
      {!buyerDetailsEntered && (
        <div className="gst-section">
          <center><h1>Quotation Generator</h1></center>
          <input
            type="text"
            placeholder="Enter GST Number"
            value={gstNumber}
            onChange={(e) => setGstNumber(e.target.value)}
          />
          <button onClick={validateGstNumber}>Validate GST</button>
          {gstInfo && isValidGst && (
            <div className="gst-info">
              <p>GST Number: {gstInfo.gstNumber}</p>
              <p>Legal Name: {gstInfo.legalName}</p>
              <p>Trade Name: {gstInfo.tradeName}</p>
              <p>Address: {gstInfo.address}</p>
            </div>
          )}
          <h3>Or Enter Buyer Details Manually:</h3>
          <div className="manual-entry">
            <input
              type="text"
              placeholder="Enter Buyer Name"
              value={buyerName}
              onChange={(e) => setBuyerName(e.target.value)}
            />
            <textarea
              placeholder="Enter Buyer Address"
              value={buyerAddress}
              onChange={(e) => setBuyerAddress(e.target.value)}
            />
            <button onClick={handleBuyerDetailsSubmit}>Submit Buyer Details</button>
          </div>
        </div>
      )}
      {buyerDetailsEntered && (
        <div id="printContents">
          <center><h1>Quotation Generator</h1></center>  
          <div className="aligner">
            <div className="seller-info">
            <div className="seller-avatar">
                <img src={logo} alt="Seller Logo" />
              </div>
              <h3>Seller Information</h3><br></br>
              <p><strong>Name:</strong> {sellerInfo.name}</p>
              <p><strong>GSTIN:</strong> {sellerInfo.gstin}</p>
              <p><strong>Address:</strong> {sellerInfo.address}</p>
              <p><strong>Mobile:</strong> {sellerInfo.mobile}</p>
              <p><strong>Email:</strong> {sellerInfo.email}</p>
              
            </div>
            <div className="buyer-info">
              <h3>Buyer Information</h3>
              {isValidGst && gstInfo ? (
                <div>
                  <p><strong>GST Number:</strong> {gstInfo.gstNumber}</p>
                  <p><strong>Legal Name:</strong> {gstInfo.name}</p>
                  <p><strong>Address:</strong> {gstInfo.address}</p>
                </div>
              ) : (
                <div>
                  <p><strong>Name:</strong> {buyerName}</p>
                  <p><strong>Address:</strong> {buyerAddress}</p>
                </div>
              )}
            </div>
          </div>
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Product Image</th>
                  <th>Product Name</th>
                  <th>Product Description</th>
                  <th>Rate</th>
                  <th>Square Footage</th>
                  <th>Estimate</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {userCart && userCart.map(item => (
                  <tr key={item.productId}>
                    <td>
                      <img className="product-image" src={`http://localhost:8000/uploads/${item.image}`} alt={item.productName} />
                    </td>
                    <td>{item.productName}</td>
                    <td className="truncate">{item.productDescription}</td>
                    <td>{item.rate}</td>
                    <td>
                      <input
                        type="number"
                        value={squareFootages[item.productId] || ''}
                        onChange={(e) => handleSquareFootageChange(item.productId, e.target.value)}
                      />
                    </td>
                    <td>{estimates[item.productId] || 0}</td>
                    <td><button className="delete-button" onClick={() => handleDeleteProduct(item.productId)}>Delete</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="total-container">
            <h3>Total Amount: ₹{totalAmount.toFixed(2)}</h3>
          </div>
          <button className="print-button" onClick={handlePrint}>Print</button>
          <button className="send-quotation-button" onClick={handleSendQuotation}>Get Quotation</button>
        </div>
      )}
    </div>
  );
};

export default Cart;
