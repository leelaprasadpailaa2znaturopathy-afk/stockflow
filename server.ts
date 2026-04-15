import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import bcryptjs from 'bcryptjs';
import path from 'path';
import { fileURLToPath } from 'url';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const isProduction = process.env.NODE_ENV === 'production';
const MONGODB_URI = process.env.MONGODB_URI || (!isProduction ? 'mongodb://127.0.0.1:27017/stockflow' : '');
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const distPath = path.join(__dirname, 'dist');

if (isProduction && !process.env.MONGODB_URI) {
  console.error('❌ MONGODB_URI environment variable is required in production.');
  process.exit(1);
}

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@stockflow.com';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';

// Middleware
app.use(cors());
app.use(express.json());

// ============================================================
// MongoDB Connection
// ============================================================
const connectToMongo = async (uri: string): Promise<boolean> => {
  try {
    await mongoose.connect(uri);
    console.log(`✅ MongoDB connected (${uri.startsWith('mongodb+srv') ? 'Atlas' : 'local'})`);
    return true;
  } catch (err) {
    console.error(`❌ MongoDB connection error (${uri}):`, err);
    return false;
  }
};

const startServer = async () => {
  const connected = await connectToMongo(MONGODB_URI);

  if (!connected) {
    console.error('❌ Could not connect to MongoDB. Make sure MONGODB_URI is set and valid.');
    process.exit(1);
  }

  // Initialize logo on server startup if it doesn't exist
  const initializeLogo = async () => {
    try {
      const existingLogo = await Config.findOne({ key: 'logo' });
      if (!existingLogo) {
        const logoUrl = 'https://image2url.com/r2/default/images/1767348824117-e969a13d-b2e1-4859-91bc-084f78862194.png';
        console.log('📷 Fetching logo from URL...');
        const base64Logo = await fetchImageAsBase64(logoUrl);
        await Config.create({
          key: 'logo',
          value: base64Logo,
          type: 'base64'
        });
        console.log('✅ Logo initialized and stored in MongoDB');
      }
    } catch (error) {
      console.error('⚠️  Failed to initialize logo:', error);
    }
  };

  await initializeLogo();

  app.listen(PORT, () => {
    console.log(`\n🚀 Stockflow API running on port ${PORT}`);
    console.log(`📊 Admin Login: ${ADMIN_EMAIL} / ${ADMIN_PASSWORD}`);
    console.log('⚠️  Change ADMIN_PASSWORD in .env for production\n');
  });
};

// ============================================================
// MongoDB Schemas & Models
// ============================================================

// Product Model
const productSchema = new mongoose.Schema({
  name: { type: String, required: true, maxlength: 100 },
  category: { type: String, required: true, maxlength: 50 },
  quantity: { type: Number, default: 0, min: 0 },
  status: { 
    type: String, 
    enum: ['In Stock', 'Out of Stock', 'Newly Added', 'Back in Stock'],
    required: true 
  },
  size: { type: String, maxlength: 100, default: '' },
  price: { type: Number, default: 0, min: 0 },
  imageUrl: { type: String, maxlength: 1000, default: '' },
  websiteUrl: { type: String, maxlength: 1000, default: '' },
  launchDate: { type: String, default: null },
  tags: [String],
  ribbon: { type: String, maxlength: 50, default: null },
  releasedBatch: { type: String, maxlength: 50, default: null },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  updatedBy: { type: String, required: true }
});

const Product = mongoose.model('Product', productSchema);

// Activity Log Model
const activityLogSchema = new mongoose.Schema({
  action: { 
    type: String, 
    enum: ['create', 'update', 'delete'],
    required: true 
  },
  productId: { type: String, required: true },
  productName: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
  userEmail: { type: String, required: true },
  details: String
});

const ActivityLog = mongoose.model('ActivityLog', activityLogSchema);

// Config Model (for storing logo and other app config)
const configSchema = new mongoose.Schema({
  key: { type: String, required: true, unique: true },
  value: { type: String, required: true },
  type: { type: String, default: 'string' },
  updatedAt: { type: Date, default: Date.now }
});

const Config = mongoose.model('Config', configSchema);

startServer();

interface AuthRequest extends Request {
  admin?: { email: string };
}

const verifyToken = (req: AuthRequest, res: Response, next: NextFunction) => {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    req.admin = decoded;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
};

// ============================================================
// Routes
// ============================================================

// LOGIN
app.post('/api/auth/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' });
    }

    if (email !== ADMIN_EMAIL || password !== ADMIN_PASSWORD) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { email: ADMIN_EMAIL },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({ token, email: ADMIN_EMAIL });
  } catch (error) {
    res.status(500).json({ error: 'Login failed' });
  }
});

// VERIFY TOKEN
app.post('/api/auth/verify', verifyToken, (req: AuthRequest, res: Response) => {
  res.json({ valid: true, email: req.admin?.email });
});

// ============================================================
// PRODUCT ROUTES
// ============================================================

// GET all products
app.get('/api/products', async (req: Request, res: Response) => {
  try {
    const products = await Product.find().sort({ updatedAt: -1 });
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

// GET single product
app.get('/api/products/:id', async (req: Request, res: Response) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.json(product);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch product' });
  }
});

// CREATE product (admin only)
app.post('/api/products', verifyToken, async (req: AuthRequest, res: Response) => {
  try {
    const productData = {
      ...req.body,
      updatedBy: req.admin?.email,
      updatedAt: new Date()
    };

    const product = new Product(productData);
    await product.save();

    // Log activity
    await ActivityLog.create({
      action: 'create',
      productId: product._id.toString(),
      productName: product.name,
      userEmail: req.admin?.email,
      details: `Created product: ${product.name}`
    });

    res.status(201).json(product);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// UPDATE product (admin only)
app.patch('/api/products/:id', verifyToken, async (req: AuthRequest, res: Response) => {
  try {
    const updateData = {
      ...req.body,
      updatedBy: req.admin?.email,
      updatedAt: new Date()
    };

    const product = await Product.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    // Log activity
    await ActivityLog.create({
      action: 'update',
      productId: product._id.toString(),
      productName: product.name,
      userEmail: req.admin?.email,
      details: `Updated product: ${product.name}`
    });

    res.json(product);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// DELETE product (admin only)
app.delete('/api/products/:id', verifyToken, async (req: AuthRequest, res: Response) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    // Log activity
    await ActivityLog.create({
      action: 'delete',
      productId: product._id.toString(),
      productName: product.name,
      userEmail: req.admin?.email,
      details: `Deleted product: ${product.name}`
    });

    res.json({ message: 'Product deleted', product });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete product' });
  }
});

// ============================================================
// ACTIVITY LOG ROUTES
// ============================================================

// GET all logs (admin only)
app.get('/api/logs', verifyToken, async (req: Request, res: Response) => {
  try {
    const logs = await ActivityLog.find().sort({ timestamp: -1 }).limit(100);
    res.json(logs);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch logs' });
  }
});

// DELETE all logs (admin only)
app.delete('/api/logs', verifyToken, async (req: Request, res: Response) => {
  try {
    await ActivityLog.deleteMany({});
    res.json({ message: 'All activity logs cleared' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to clear activity logs' });
  }
});

// ============================================================
// UTILITY FUNCTIONS
// ============================================================

// Fetch image from URL and convert to base64
const fetchImageAsBase64 = async (imageUrl: string): Promise<string> => {
  try {
    const response = await fetch(imageUrl);
    const buffer = await response.arrayBuffer();
    return Buffer.from(buffer).toString('base64');
  } catch (error) {
    throw new Error('Failed to fetch image from URL');
  }
};

// ============================================================
// HEALTH CHECK
// ============================================================

app.get('/api/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', message: 'Stockflow API running' });
});

// ============================================================
// LOGO ROUTES
// ============================================================

// GET logo
app.get('/api/logo', async (req: Request, res: Response) => {
  try {
    const logoConfig = await Config.findOne({ key: 'logo' });
    
    if (!logoConfig) {
      return res.status(404).json({ error: 'Logo not found' });
    }

    // Return as data URI
    res.json({ 
      logo: logoConfig.value,
      mimeType: 'image/png'
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch logo' });
  }
});

// SET logo from URL (admin only)
app.post('/api/logo', verifyToken, async (req: AuthRequest, res: Response) => {
  try {
    const { imageUrl } = req.body;

    if (!imageUrl) {
      return res.status(400).json({ error: 'Image URL required' });
    }

    // Fetch image and convert to base64
    const base64Image = await fetchImageAsBase64(imageUrl);

    // Store or update logo in MongoDB
    const logoConfig = await Config.findOneAndUpdate(
      { key: 'logo' },
      { 
        key: 'logo',
        value: base64Image,
        type: 'base64',
        updatedAt: new Date()
      },
      { upsert: true, new: true }
    );

    res.json({ 
      message: 'Logo updated successfully',
      logo: logoConfig
    });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// SETUP endpoint - initialize logo from URL (one-time)
app.post('/api/setup/logo', async (req: Request, res: Response) => {
  try {
    const { imageUrl } = req.body;
    const logoUrl = imageUrl || 'https://image2url.com/r2/default/images/1767348824117-e969a13d-b2e1-4859-91bc-084f78862194.png';

    // Check if logo already exists
    const existingLogo = await Config.findOne({ key: 'logo' });
    if (existingLogo) {
      return res.json({ message: 'Logo already exists', logo: existingLogo });
    }

    // Fetch image and convert to base64
    const base64Image = await fetchImageAsBase64(logoUrl);

    // Store logo in MongoDB
    const logoConfig = new Config({
      key: 'logo',
      value: base64Image,
      type: 'base64'
    });
    await logoConfig.save();

    res.json({ 
      message: 'Logo initialized successfully',
      logo: logoConfig
    });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// ============================================================
// PRODUCTION STATIC FILES
// ============================================================

if (isProduction) {
  app.use(express.static(distPath));

  app.get('*', (req: Request, res: Response, next: NextFunction) => {
    if (req.path.startsWith('/api/')) {
      return next();
    }

    res.sendFile(path.join(distPath, 'index.html'));
  });
}

