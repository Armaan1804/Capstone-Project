const Tesseract = require('tesseract.js');
const ImageProcessor = require('./imageProcessor');

class OCRProcessor {
  static async processImage(imagePath, options = {}) {
    try {
      // Preprocess image if options provided
      let processedPath = imagePath;
      if (options.preprocess) {
        processedPath = await ImageProcessor.preprocess(imagePath, options.preprocess);
      }

      const language = options.language || 'eng';
      const { data } = await Tesseract.recognize(processedPath, language, {
        logger: m => {
          if (m.status === 'recognizing text') {
            console.log(`OCR Progress: ${Math.round(m.progress * 100)}%`);
          }
        }
      });

      // Extract text blocks with bounding boxes
      const textBlocks = data.blocks.map(block => ({
        text: block.text.trim(),
        confidence: block.confidence,
        bbox: {
          x0: block.bbox.x0,
          y0: block.bbox.y0,
          x1: block.bbox.x1,
          y1: block.bbox.y1,
          confidence: block.confidence
        }
      })).filter(block => block.text.length > 0);

      return {
        text: data.text.trim(),
        confidence: data.confidence,
        textBlocks
      };

    } catch (error) {
      console.error('OCR processing error:', error);
      throw error;
    }
  }

  static async processPage(imagePath, pageNumber, options = {}) {
    console.log(`Processing page ${pageNumber}: ${imagePath} (language: ${options.language || 'eng'})`);
    
    const result = await this.processImage(imagePath, options);
    
    return {
      pageNumber,
      text: result.text,
      confidence: result.confidence,
      textBlocks: result.textBlocks,
      imagePath
    };
  }
}

module.exports = OCRProcessor;