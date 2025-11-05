const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema({
  jobId: { type: String, required: true, unique: true },
  documentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Document', required: true },
  status: { 
    type: String, 
    enum: ['waiting', 'active', 'completed', 'failed'], 
    default: 'waiting' 
  },
  progress: { type: Number, default: 0 },
  totalPages: { type: Number, default: 0 },
  processedPages: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
  completedAt: { type: Date },
  error: { type: String }
});

jobSchema.index({ jobId: 1 });
jobSchema.index({ status: 1 });

module.exports = mongoose.model('Job', jobSchema);