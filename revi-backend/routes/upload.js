import express from 'express';
import multer from 'multer';
import { parseUploadedFile } from '../services/fileParser.js';
import { generateFlashcardsFromText } from '../services/aiService.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

const upload = multer({
  dest: 'uploads/',
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only PDF and DOCX files are supported'));
    }
  }
});

router.post('/upload-file', requireAuth, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }
    
    const numCards = parseInt(req.body.numCards) || 10;
    
    const text = await parseUploadedFile(req.file);
    
    if (!text || text.trim().length < 50) {
      return res.status(400).json({ error: 'Could not extract sufficient text from file' });
    }
    
    const flashcards = await generateFlashcardsFromText(text, numCards);
    
    res.json({
      success: true,
      flashcards,
      metadata: {
        filename: req.file.originalname,
        totalCards: flashcards.length
      }
    });
    
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: error.message || 'Failed to process file' });
  }
});

router.post('/generate-flashcards', requireAuth, async (req, res) => {
  try {
    const { text, numCards = 10 } = req.body;
    
    if (!text || text.trim().length < 50) {
      return res.status(400).json({ error: 'Text is too short' });
    }
    
    const flashcards = await generateFlashcardsFromText(text, numCards);
    
    res.json({ success: true, flashcards });
  } catch (error) {
    console.error('Generate error:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
