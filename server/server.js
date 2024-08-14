const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { User, Products,Gst } = require('./database/mongodb');
const axios = require('axios');
const app = express(); 
const PORT = process.env.PORT || 8000;
const sec_key = process.env.JWT_SECRET || 'xxxxxxxxxxxxxxxxxxaaaaaaaaaaaaaaaaaaaaaaxxxxxxxxxxxxxxxxxxx';
const nodemailer = require('nodemailer');

app.use(bodyParser.json());
app.use(cors());

mongoose.connect('mongodb://127.0.0.1:27017/myangular')
  .then(() => {
    console.log('Connected to MongoDB');
  })
  .catch(err => {
    console.error('Error connecting to MongoDB', err);
  });

  const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      const uploadDir = './uploads';
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir);
      }
      cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
      const ext = path.extname(file.originalname);
      const filename = `${Date.now()}${ext}`;
      cb(null, filename);
    }
  });
  app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
  const upload = multer({ storage });
  
app.post('/upload', upload.array('productImages'), async (req, res) => {

    try {
      const { productId, productName, productDescription, rate, category,mcategory } = req.body;
      console.log('====================================');
      console.log(req.body);
      console.log('====================================');
      const productImageLinks = req.files.map(file => file.filename);
      if (!productId || !productName || !productDescription || !rate || !category|| !mcategory) {
        return res.status(400).json({ message: 'All fields are required' });
      }
  
      let products = await Products.findOne({ name: 'uni' });
  
      if (!products) {
        products = new Products({ name: 'uni', items: [] });
      }

      const productIndex = products.items.findIndex(item => item.productId === productId);
  
      if (productIndex !== -1) {
        products.items[productIndex] = {
          productId,
          productName,
          productImageLinks, 
          productDescription,
          rate,
          category,mcategory
        };
      } else {
        products.items.push({
          productId,
          productName,
          productImageLinks,
          productDescription,
          rate,
          category,mcategory
        });
      }
  
      await products.save();
  
      res.status(201).json({ message: 'Product uploaded successfully!' });
    } catch (error) {
      console.error('Error uploading product:', error.message);
      res.status(500).json({ message: error.message || 'Error uploading product' });
    }
  });
app.get('/products', async (req, res) => {
  try {
    const products = await Products.findOne({ name: 'uni' });
    if (!products) {
      throw new Error('No products found');
    }

    res.json(products.items);
  } catch (error) {
    console.error('Error fetching products:', error.message);
    res.status(500).json({ message: 'Error fetching products' });
  }
});

app.post('/signup', async (req, res) => {
  const { email, password } = req.body;

  try {
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ email, password: hashedPassword });
    await newUser.save();

    res.status(201).json({ message: 'User created successfully' });
  } catch (error) {
    console.error('Error signing up user:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

app.get('/cart/:email', async (req, res) => {
  try {
    const { email } = req.params;
    const user = await User.findOne({ email });

    if (!user) {
      throw new Error('User not found');
    }

    res.json(user.usercart);
  } catch (error) {
    console.error('Error fetching user cart items:', error);
    res.status(500).json({ message: 'Error fetching user cart items' });
  }
});

app.post('/cart', async (req, res) => {
  try {
    const { email, productId, productName, image, productDescription,rate } = req.body;
    
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
   
  
    const productData = {
      productId,
      productName,
      image, 
      productDescription,
      rate
    };

    const productExists = user.usercart.some(item => item.productId === productId);
    if (productExists) {
      return res.status(409).json({ message: 'Item already exists in cart' });
    }
    await User.updateOne(
      { email },
      { $push: { usercart: productData } }
    );

    
    res.json({ message: 'Product added to cart successfully!' });
  } catch (error) {
    console.error('Error adding product to cart:', error.message);
    res.status(500).json({ message: 'Error adding product to cart' });
  }
});

app.post('/cart/:email/:pid', async (req, res) => {
  const { email, pid } = req.params;

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const productIndex = user.usercart.findIndex(item => item.productId === pid);

    if (productIndex === -1) {
      return res.status(404).json({ message: 'Product not found in user cart' });
    }

    user.usercart.splice(productIndex, 1);
    await user.save();

    res.json({ message: 'Product removed from user cart' });
  } catch (error) {
    console.error('Error removing product from cart:', error);
    res.status(500).json({ message: 'Error removing product from cart' });
  }
});

app.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid password' });
    }

    const token = jwt.sign({ userId: user.email, role: user.role }, sec_key, { expiresIn: '1h' });

    res.status(200).json({ token });
  } catch (error) {
    console.error('Error logging in user:', error);
    res.status(500).json({ message: 'Error logging in user' });
  }
});
app.post('/validate-gst', async (req, res) => {
  const { gstNumber } = req.body;

  let gstInfo = await Gst.findOne({ gstNumber });

  if (gstInfo) {
    return res.json(gstInfo);
  }

  try {
    const response = await axios.get(`http://sheet.gstincheck.co.in/check/e8b427471d63aeb82f9c236ba298cb66/${gstNumber}`);
    if (response.data.data && response.data.flag) {
      const profile = {
        gstNumber: response.data.data.gstin,
        name: response.data.data.lgnm,
        address: response.data.data.pradr.adr
      };

      const newGstInfo = new Gst(profile);
      await newGstInfo.save();

      return res.json(newGstInfo);
    } else {
      return res.status(400).json({ message: 'Invalid GST number', errorCode: response.data.errorCode });
    }
  } catch (error) {
    console.error('Error validating GST number:', error.message);
    return res.status(500).json({ message: 'Error validating GST number. Please try again.' });
  }
});

app.get('/products/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const products = await Products.findOne({ name: 'uni' });

    if (!products) {
      return res.status(404).json({ message: 'No products found' });
    }
   
    const product = products.items.find(item => item.productId == id);
    

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.json(product);
  } catch (error) {
    console.error('Error fetching product details:', error);
    res.status(500).json({ message: 'Error fetching product details' });
  }
});
app.post('/rate', async (req, res) => {
  try {
    const { userId, productId, rating, comment } = req.body;

    if (rating < 1 || rating > 5) {
      return res.status(400).json({ message: 'Rating must be between 1 and 5.' });
    }

    const user = await User.findOne({ email: userId });
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    const product = await Products.findOne({ 'items.productId': productId });
    if (!product) {
      return res.status(404).json({ message: 'Product not found.' });
    }

    const item = product.items.find(item => item.productId === productId);
    if (!item) {
      return res.status(404).json({ message: 'Product not found.' });
    }

    if (!item.ratings) {
      item.ratings = [];
    }

    const existingRatingIndex = item.ratings.findIndex(r => r.userId === userId);
    if (existingRatingIndex !== -1) {
      item.ratings[existingRatingIndex] = { userId, rating, comment, likes: 0, dislikes: 0 };
    } else {
      item.ratings.push({ userId, rating, comment, likes: 0, dislikes: 0 });
    }

    const totalRatings = item.ratings.length;
    const averageRating = item.ratings.reduce((acc, r) => acc + r.rating, 0) / totalRatings;
    item.averageRating = averageRating;

    await product.save();

    res.json({ message: 'Rating added successfully!', averageRating });
  } catch (error) {
    console.error('Error rating product:', error.message);
    res.status(500).json({ message: 'Error rating product' });
  } 
});

const transporter = nodemailer.createTransport({
  service: 'outlook',
  auth: {
    user: 'quatationsender@outlook.com',
    pass: '1CR21is041@',
  },
});


const pdfStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const pdfDir = './pdf';
    if (!fs.existsSync(pdfDir)) {
      fs.mkdirSync(pdfDir, { recursive: true }); // Ensure directory creation
    }
    cb(null, pdfDir);
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname); 
  }
});

const uploadPDFs = multer({ storage: pdfStorage }); 
app.post('/send', uploadPDFs.single('pdf'), (req, res) => {
  const { userEmail, adminEmail } = req.body;
  
  if (!req.file) {
    return res.status(400).send('No file uploaded.');
  }

  const pdfPath = req.file.path;

  const mailOptions = {
    from: 'quatationsender@outlook.com',
    to: [userEmail, adminEmail],
    subject: 'Your Quotation',
    text: 'Please find attached your quotation.',
    attachments: [
      {
        filename: path.basename(pdfPath), 
        path: pdfPath,
        contentType: 'application/pdf',
      },
    ],
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error('Error sending email:', error.message);
      return res.status(500).send(error.toString());
    }
    console.log('Email sent:', info.response);
    fs.unlink(pdfPath, (err) => {
      if (err) {
        console.error('Error deleting file:', err.message);
      }
    }); // Clean up the uploaded file
    res.status(200).send('Quotation sent successfully');
  });
});

// Example for Express.js
app.get('/getLastProductId', async (req, res) => {
  try {
    const productIds = await Products.aggregate([
      { $unwind: '$items' }, // Deconstruct the items array
      { $project: { _id: 0, productId: '$items.productId' } }, // Project the productId field
      { $group: { _id: null, productIds: { $addToSet: '$productId' } } } // Group and collect unique productId values
    ]);
    
    //console.log(productIds[0].productIds.length)
    if (productIds.length > 0) {
      res.status(200).json({ product: productIds[0].productIds.length });
    } else {
      res.status(200).json({ productIds: [] });
    }
  } catch (error) {
    res.status(500).json({ message: 'Error fetching product IDs' });
  }
});


app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
