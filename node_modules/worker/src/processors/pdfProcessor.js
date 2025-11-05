const pdf = require('pdf-poppler');
const path = require('path');
const fs = require('fs');

class PDFProcessor {
  static async convertToImages(pdfPath, outputDir) {
    try {
      // Create output directory if it doesn't exist
      if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
      }

      const options = {
        format: 'png',
        out_dir: outputDir,
        out_prefix: path.basename(pdfPath, '.pdf'),
        page: null // Convert all pages
      };

      const pages = await pdf.convert(pdfPath, options);
      
      // Return array of image paths
      const imagePaths = [];
      for (let i = 1; i <= pages; i++) {
        const imagePath = path.join(outputDir, `${options.out_prefix}-${i}.png`);
        if (fs.existsSync(imagePath)) {
          imagePaths.push(imagePath);
        }
      }

      return imagePaths;

    } catch (error) {
      console.error('PDF conversion error:', error);
      throw error;
    }
  }

  static async getPageCount(pdfPath) {
    try {
      // Use pdf-poppler to get page count
      const info = await pdf.info(pdfPath);
      return info.pages;
    } catch (error) {
      console.error('PDF info error:', error);
      return 0;
    }
  }
}

module.exports = PDFProcessor;