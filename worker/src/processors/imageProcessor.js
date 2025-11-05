const sharp = require('sharp');

class ImageProcessor {
  static async rotate(imagePath, angle) {
    const outputPath = imagePath.replace(/\.(jpg|jpeg|png|tiff)$/i, `_rotated_${angle}.$1`);
    await sharp(imagePath)
      .rotate(angle)
      .toFile(outputPath);
    return outputPath;
  }

  static async binarize(imagePath, threshold = 128) {
    const outputPath = imagePath.replace(/\.(jpg|jpeg|png|tiff)$/i, '_binarized.$1');
    await sharp(imagePath)
      .greyscale()
      .threshold(threshold)
      .toFile(outputPath);
    return outputPath;
  }

  static async denoise(imagePath) {
    const outputPath = imagePath.replace(/\.(jpg|jpeg|png|tiff)$/i, '_denoised.$1');
    await sharp(imagePath)
      .blur(0.5)
      .sharpen()
      .toFile(outputPath);
    return outputPath;
  }

  static async deskew(imagePath) {
    // Basic deskew using rotation - in production, use more sophisticated algorithms
    const outputPath = imagePath.replace(/\.(jpg|jpeg|png|tiff)$/i, '_deskewed.$1');
    await sharp(imagePath)
      .rotate(0.5) // Minimal rotation for demo
      .toFile(outputPath);
    return outputPath;
  }

  static async preprocess(imagePath, options = {}) {
    let processedPath = imagePath;
    
    if (options.rotate) {
      processedPath = await this.rotate(processedPath, options.rotate);
    }
    
    if (options.binarize) {
      processedPath = await this.binarize(processedPath, options.threshold);
    }
    
    if (options.denoise) {
      processedPath = await this.denoise(processedPath);
    }
    
    if (options.deskew) {
      processedPath = await this.deskew(processedPath);
    }
    
    return processedPath;
  }
}

module.exports = ImageProcessor;