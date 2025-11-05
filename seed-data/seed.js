const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

// Import models
const Document = require('../backend/src/models/Document');
const Page = require('../backend/src/models/Page');
const Job = require('../backend/src/models/Job');

// Sample documents data
const sampleDocuments = [
  {
    filename: 'ai-research-paper.pdf',
    originalName: 'Artificial Intelligence Research Paper.pdf',
    mimeType: 'application/pdf',
    size: 2048576,
    totalPages: 15,
    processedPages: 15,
    status: 'completed',
    uploadedAt: new Date('2024-01-10T10:00:00Z'),
    processedAt: new Date('2024-01-10T10:05:30Z')
  },
  {
    filename: 'ml-algorithms-guide.pdf',
    originalName: 'Machine Learning Algorithms Guide.pdf',
    mimeType: 'application/pdf',
    size: 1536000,
    totalPages: 8,
    processedPages: 8,
    status: 'completed',
    uploadedAt: new Date('2024-01-11T14:30:00Z'),
    processedAt: new Date('2024-01-11T14:33:45Z')
  },
  {
    filename: 'data-processing-manual.pdf',
    originalName: 'Data Processing Manual.pdf',
    mimeType: 'application/pdf',
    size: 3072000,
    totalPages: 25,
    processedPages: 25,
    status: 'completed',
    uploadedAt: new Date('2024-01-12T09:15:00Z'),
    processedAt: new Date('2024-01-12T09:22:10Z')
  },
  {
    filename: 'ocr-technology-overview.pdf',
    originalName: 'OCR Technology Overview.pdf',
    mimeType: 'application/pdf',
    size: 1024000,
    totalPages: 5,
    processedPages: 5,
    status: 'completed',
    uploadedAt: new Date('2024-01-13T16:45:00Z'),
    processedAt: new Date('2024-01-13T16:47:20Z')
  }
];

// Sample page content for each document
const samplePageContent = {
  'ai-research-paper.pdf': [
    {
      pageNumber: 1,
      text: `Artificial Intelligence: Current Trends and Future Directions
      
      Abstract
      This paper presents a comprehensive overview of current artificial intelligence research trends and explores potential future directions. We examine machine learning algorithms, deep neural networks, and their applications in various domains including natural language processing, computer vision, and robotics.
      
      Keywords: artificial intelligence, machine learning, deep learning, neural networks, automation`,
      confidence: 96.8
    },
    {
      pageNumber: 2,
      text: `Introduction
      
      Artificial Intelligence (AI) has emerged as one of the most transformative technologies of the 21st century. From autonomous vehicles to intelligent personal assistants, AI systems are increasingly integrated into our daily lives. This research examines the current state of AI technology and identifies key areas for future development.
      
      The field of machine learning, a subset of AI, has seen remarkable progress in recent years. Deep learning algorithms have achieved breakthrough performance in image recognition, speech processing, and game playing.`,
      confidence: 94.2
    },
    {
      pageNumber: 3,
      text: `Machine Learning Fundamentals
      
      Machine learning algorithms can be broadly categorized into three types: supervised learning, unsupervised learning, and reinforcement learning. Supervised learning uses labeled training data to learn patterns and make predictions. Common algorithms include linear regression, decision trees, and support vector machines.
      
      Deep learning, based on artificial neural networks, has revolutionized many AI applications. Convolutional neural networks (CNNs) excel at image processing tasks, while recurrent neural networks (RNNs) are effective for sequential data analysis.`,
      confidence: 95.5
    }
  ],
  'ml-algorithms-guide.pdf': [
    {
      pageNumber: 1,
      text: `Machine Learning Algorithms: A Practical Guide
      
      Table of Contents
      1. Linear Regression
      2. Logistic Regression  
      3. Decision Trees
      4. Random Forest
      5. Support Vector Machines
      6. K-Means Clustering
      7. Neural Networks
      8. Evaluation Metrics
      
      This guide provides practical implementations and use cases for common machine learning algorithms used in data science and predictive analytics.`,
      confidence: 97.1
    },
    {
      pageNumber: 2,
      text: `Linear Regression
      
      Linear regression is a fundamental algorithm for predicting continuous numerical values. It models the relationship between a dependent variable and independent variables by fitting a linear equation to observed data.
      
      The algorithm minimizes the sum of squared residuals to find the best-fitting line. Applications include price prediction, sales forecasting, and risk assessment in financial markets.
      
      Key advantages: Simple to understand and implement, computationally efficient, provides interpretable results.`,
      confidence: 93.7
    },
    {
      pageNumber: 3,
      text: `Decision Trees and Random Forest
      
      Decision trees create a model that predicts target values by learning simple decision rules inferred from data features. The tree structure makes decisions easy to understand and visualize.
      
      Random Forest combines multiple decision trees to improve prediction accuracy and reduce overfitting. It uses bootstrap aggregating (bagging) and random feature selection to create diverse trees.
      
      Applications: Classification problems, feature importance analysis, medical diagnosis systems.`,
      confidence: 92.4
    }
  ],
  'data-processing-manual.pdf': [
    {
      pageNumber: 1,
      text: `Data Processing and Analysis Manual
      
      Chapter 1: Introduction to Data Processing
      
      Data processing involves collecting, transforming, and analyzing raw data to extract meaningful insights. Modern data processing systems handle large volumes of structured and unstructured data from various sources.
      
      Key components include data ingestion, cleaning, transformation, storage, and analysis. ETL (Extract, Transform, Load) pipelines are commonly used to process data efficiently.`,
      confidence: 95.9
    },
    {
      pageNumber: 2,
      text: `Data Collection and Ingestion
      
      Data collection methods vary depending on the source and type of data. Common sources include databases, APIs, web scraping, sensors, and user interactions. Real-time data streams require specialized processing frameworks.
      
      Apache Kafka and Apache Spark are popular tools for handling high-volume data streams. Data quality assessment is crucial during the ingestion phase to identify and handle missing, duplicate, or inconsistent data.`,
      confidence: 94.3
    },
    {
      pageNumber: 3,
      text: `Text Processing and Natural Language Processing
      
      Text data requires specialized processing techniques including tokenization, stemming, lemmatization, and named entity recognition. Natural Language Processing (NLP) algorithms extract meaning from unstructured text.
      
      Document analysis systems use OCR technology to convert scanned documents into searchable text. Text mining techniques identify patterns, sentiments, and topics within large text corpora.
      
      Applications include document classification, sentiment analysis, and automated content generation.`,
      confidence: 96.1
    }
  ],
  'ocr-technology-overview.pdf': [
    {
      pageNumber: 1,
      text: `Optical Character Recognition (OCR) Technology Overview
      
      OCR technology converts images of text into machine-readable text format. Modern OCR systems use advanced image processing and machine learning techniques to achieve high accuracy rates.
      
      The OCR process involves image preprocessing, character segmentation, feature extraction, and character recognition. Deep learning models have significantly improved OCR accuracy for complex documents.`,
      confidence: 98.2
    },
    {
      pageNumber: 2,
      text: `OCR Applications and Use Cases
      
      Document digitization: Converting paper documents to digital format for archival and search purposes.
      Automated data entry: Extracting information from forms, invoices, and receipts.
      License plate recognition: Identifying vehicle license plates for traffic monitoring.
      Text extraction from images: Processing screenshots, photos, and scanned documents.
      
      OCR technology enables full-text search capabilities in document management systems.`,
      confidence: 96.7
    }
  ]
};

async function seedDatabase() {
  try {
    // Connect to MongoDB
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/document-search';
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB');

    // Clear existing data
    console.log('Clearing existing data...');
    await Document.deleteMany({});
    await Page.deleteMany({});
    await Job.deleteMany({});

    console.log('Creating seed data...');

    // Create documents with jobs and pages
    for (let i = 0; i < sampleDocuments.length; i++) {
      const docData = sampleDocuments[i];
      
      // Generate file hash
      const fileHash = crypto.createHash('sha256')
        .update(docData.filename + docData.size)
        .digest('hex');
      
      // Generate job ID
      const jobId = crypto.randomUUID();
      
      // Create document
      const document = new Document({
        ...docData,
        fileHash,
        jobId
      });
      
      await document.save();
      console.log(`Created document: ${document.originalName}`);

      // Create job
      const job = new Job({
        jobId,
        documentId: document._id,
        status: 'completed',
        progress: 100,
        totalPages: docData.totalPages,
        processedPages: docData.processedPages,
        createdAt: docData.uploadedAt,
        completedAt: docData.processedAt
      });
      
      await job.save();
      console.log(`Created job: ${jobId}`);

      // Create pages
      const pageContent = samplePageContent[docData.filename] || [];
      
      for (let pageNum = 1; pageNum <= docData.totalPages; pageNum++) {
        const pageData = pageContent.find(p => p.pageNumber === pageNum) || {
          pageNumber: pageNum,
          text: `Sample text content for page ${pageNum} of ${docData.originalName}. This page contains searchable text that can be used for testing the full-text search functionality.`,
          confidence: 90 + Math.random() * 8 // Random confidence between 90-98
        };

        const page = new Page({
          documentId: document._id,
          pageNumber: pageNum,
          text: pageData.text,
          confidence: pageData.confidence,
          status: 'completed',
          processedAt: docData.processedAt,
          textBlocks: [
            {
              text: pageData.text,
              confidence: pageData.confidence,
              bbox: {
                x0: 50,
                y0: 50,
                x1: 550,
                y1: 750,
                confidence: pageData.confidence
              }
            }
          ]
        });
        
        await page.save();
      }
      
      console.log(`Created ${docData.totalPages} pages for ${document.originalName}`);
    }

    console.log('\n=== Seed Data Summary ===');
    const docCount = await Document.countDocuments();
    const pageCount = await Page.countDocuments();
    const jobCount = await Job.countDocuments();
    
    console.log(`Documents created: ${docCount}`);
    console.log(`Pages created: ${pageCount}`);
    console.log(`Jobs created: ${jobCount}`);

    console.log('\n=== Sample Search Queries ===');
    console.log('Try these search queries after seeding:');
    console.log('- "artificial intelligence"');
    console.log('- "machine learning"');
    console.log('- "data processing"');
    console.log('- "OCR technology"');
    console.log('- "neural networks"');
    console.log('- "document analysis"');

    console.log('\nSeed data created successfully!');
    
  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

// Create sample files for testing
function createSampleFiles() {
  const sampleDir = path.join(__dirname);
  
  // Create sample text files
  const sampleFiles = [
    {
      name: 'sample-ai-document.txt',
      content: `Artificial Intelligence and Machine Learning Research

This document explores the latest developments in artificial intelligence and machine learning technologies. Deep learning algorithms have revolutionized computer vision and natural language processing applications.

Key topics covered:
- Neural network architectures
- Supervised and unsupervised learning
- Reinforcement learning algorithms
- Computer vision applications
- Natural language processing techniques

The integration of AI systems in various industries has led to significant improvements in automation, decision-making, and predictive analytics.`
    },
    {
      name: 'sample-data-processing.txt',
      content: `Data Processing and Analytics Guide

Modern data processing systems handle massive volumes of structured and unstructured data. ETL pipelines extract, transform, and load data from various sources into analytical systems.

Processing techniques include:
- Data cleaning and validation
- Feature engineering and selection
- Statistical analysis and modeling
- Real-time stream processing
- Batch processing workflows

Document analysis and OCR technology enable the extraction of valuable information from scanned documents and images.`
    },
    {
      name: 'sample-ocr-document.txt',
      content: `Optical Character Recognition Technology

OCR systems convert images containing text into machine-readable format. Advanced preprocessing techniques improve recognition accuracy:

- Image binarization and noise reduction
- Skew correction and deskewing
- Character segmentation and isolation
- Feature extraction and classification
- Post-processing and spell checking

Applications include document digitization, automated data entry, and text extraction from photographs and scanned materials.`
    }
  ];

  sampleFiles.forEach(file => {
    const filePath = path.join(sampleDir, file.name);
    fs.writeFileSync(filePath, file.content);
    console.log(`Created sample file: ${file.name}`);
  });
}

// Run seeding if called directly
if (require.main === module) {
  console.log('Starting database seeding...');
  createSampleFiles();
  seedDatabase();
}

module.exports = { seedDatabase, createSampleFiles };