const pngToIco = require('png-to-ico');
const fs = require('fs');
const path = require('path');
const Jimp = require('jimp');

async function createIcon() {
  try {
    // Source and temp paths
    const sourcePath = path.join(__dirname, 'src', 'assets', 'fauree_logo.png');
    const tempPath = path.join(__dirname, 'assets', 'temp-square.png');
    const icoPath = path.join(__dirname, 'assets', 'icon.ico');
    
    // Ensure the assets directory exists
    if (!fs.existsSync(path.join(__dirname, 'assets'))) {
      fs.mkdirSync(path.join(__dirname, 'assets'), { recursive: true });
    }
    
    // Read the image with Jimp
    const image = await Jimp.read(sourcePath);
    
    // Determine size for square (use the larger dimension)
    const size = Math.max(image.getWidth(), image.getHeight());
    
    // Resize to square and save
    image.contain(size, size, Jimp.HORIZONTAL_ALIGN_CENTER | Jimp.VERTICAL_ALIGN_MIDDLE);
    await image.writeAsync(tempPath);
    
    console.log('Created square image at:', tempPath);
    
    // Convert to ICO
    const buffer = await pngToIco(tempPath);
    fs.writeFileSync(icoPath, buffer);
    console.log('Icon created successfully at:', icoPath);
    
    // Clean up temp file
    fs.unlinkSync(tempPath);
  } catch (error) {
    console.error('Error creating icon:', error);
  }
}

createIcon(); 