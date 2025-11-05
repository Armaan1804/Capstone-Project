const mongoose = require('mongoose');

const documentSchema = new mongoose.Schema({
  filename: { type: String, required: true },
  originalName: { type: String, required: true },
  fileHash: { type: String, required: true, unique: true },
  mimeType: { type: String, required: true },
  size: { type: Number, required: true },
  totalPages: { type: Number, default: 0 },
  processedPages: { type: Number, default: 0 },
  status: { 
    type: String, 
    enum: ['pending', 'processing', 'completed', 'failed'], 
    default: 'pending' 
  },
  jobId: { type: String, required: true },
  uploadedAt: { type: Date, default: Date.now },
  processedAt: { type: Date },
  error: { type: String }
});

documentSchema.index({ fileHash: 1 });
documentSchema.index({ status: 1 });
documentSchema.index({ uploadedAt: -1 });

module.exports = mongoose.model('Document', documentSchema);