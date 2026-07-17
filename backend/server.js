require('dotenv').config();
const dns = require('dns');
dns.setServers(['8.8.8.8', '8.8.4.4']);
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const multer = require('multer');
const User = require('./models/User');
const Document = require('./models/Document');

const app = express();
app.use(cors());
app.use(express.json());

// Mock Auth Middleware: Extracts the active user ID from headers
const requireAuth = async (req, res, next) => {
  const userId = req.headers['x-mock-user-id'];
  if (!userId) return res.status(401).json({ error: 'Unauthorized' });
  req.user = await User.findById(userId);
  next();
};

// --- ROUTES ---

// 1. Get all users (for our mock login dropdown)
app.get('/api/users', async (req, res) => {
  const users = await User.find();
  res.json(users);
});

// 2. Get user's documents (Owned + Shared)
app.get('/api/docs', requireAuth, async (req, res) => {
  const docs = await Document.find({
    $or: [{ ownerId: req.user._id }, { sharedWith: req.user._id }]
  }).sort({ updatedAt: -1 });
  res.json(docs);
});

// 3. Create a new document
app.post('/api/docs', requireAuth, async (req, res) => {
  const doc = new Document({ ownerId: req.user._id });
  await doc.save();
  res.json(doc);
});

// 4. Get a single document
app.get('/api/docs/:id', requireAuth, async (req, res) => {
  const doc = await Document.findById(req.params.id).populate('sharedWith', 'name email');
  // Simple access control
  if (doc.ownerId.toString() !== req.user._id.toString() && !doc.sharedWith.some(u => u._id.toString() === req.user._id.toString())) {
    return res.status(403).json({ error: 'Forbidden' });
  }
  res.json(doc);
});

// 5. Update a document (Auto-save content or rename title)
app.put('/api/docs/:id', requireAuth, async (req, res) => {
  const { title, content } = req.body;
  const doc = await Document.findByIdAndUpdate(req.params.id, { title, content }, { new: true });
  res.json(doc);
});

// 6. Share a document
app.put('/api/docs/:id/share', requireAuth, async (req, res) => {
  const { targetUserId } = req.body;
  const doc = await Document.findById(req.params.id);
  
  if (doc.ownerId.toString() !== req.user._id.toString()) {
    return res.status(403).json({ error: 'Only the owner can share this document' });
  }
  
  if (!doc.sharedWith.includes(targetUserId)) {
    doc.sharedWith.push(targetUserId);
    await doc.save();
  }
  res.json(doc);
});

// 7. File Upload (Converts .txt to a new document)
const upload = multer({ storage: multer.memoryStorage() });
app.post('/api/docs/upload', requireAuth, upload.single('file'), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
  
  const textContent = req.file.buffer.toString('utf-8');
  const htmlContent = textContent.split('\n').map(line => `${line}`).join('');
  
  const doc = new Document({
    title: req.file.originalname.replace('.txt', ''),
    content: htmlContent,
    ownerId: req.user._id
  });
  
  await doc.save();
  res.json(doc);
});

// --- INIT & START ---
mongoose.connect(process.env.MONGODB_URI).then(async () => {
  console.log('Connected to MongoDB');
  
  // Seed Mock Users if none exist
  const count = await User.countDocuments();
  if (count === 0) {
    await User.insertMany([
      { name: 'Alice Developer', email: 'alice@example.com' },
      { name: 'Bob Product', email: 'bob@example.com' },
      { name: 'Charlie Design', email: 'charlie@example.com' }
    ]);
    console.log('Seeded mock users');
  }

  app.listen(process.env.PORT || 5000, () => console.log('Server running on port 5000'));
});