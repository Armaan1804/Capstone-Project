const mongoose = require('mongoose');

const boundingBoxSchema = new mongoose.Schema({
  x0: Number,
  y0: Number,
  x1: Number,
  y1: Number,
  confidence: Number
}, { _id: false });

const textBlockSchema = new mongoose.Schema({
  text: String,
  confidence: Number,
  bbox: boundingBoxSchema
}, { _id: false });

const pageSchema = new mongoose.Schema({
  documentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Document', required: true },
  pageNumber: { type: Number, required: true },
  text: { type: String, default: '' },
  textBlocks: [textBlockSchema],
  confidence: { type: Number, default: 0 },
  status: { 
    type: String, 
    enum: ['pending', 'processing', 'completed', 'failed'], 
    default: 'pending' 
  },
  processedAt: { type: Date },
  error: { type: String },
  imagePath: { type: String }
});

pageSchema.index({ documentId: 1, pageNumber: 1 });
pageSchema.index({ text: 'text' });
pageSchema.index({ status: 1 });

module.exports = mongoose.model('Page', pageSchema);