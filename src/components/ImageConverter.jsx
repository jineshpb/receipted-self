import { useState, useRef, useEffect } from 'react';
import '../index.css';

const ImageConverter = () => {
  const [uploadedImage, setUploadedImage] = useState(null);
  const [processedArt, setProcessedArt] = useState('');
  const canvasRef = useRef(null);

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setUploadedImage(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const processImage = () => {
    if (!uploadedImage) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = () => {
      // Set canvas size
      const scale = Math.min(800 / img.width, 800 / img.height);
      canvas.width = img.width * scale;
      canvas.height = img.height * scale;

      // Draw and process image
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;

      // Add contrast adjustment
      const contrast = 1.5; // Adjust this value to increase/decrease contrast
      const factor = (259 * (contrast + 255)) / (255 * (259 - contrast));

      // Adjust contrast for each pixel
      for (let i = 0; i < data.length; i += 4) {
        data[i] = factor * (data[i] - 128) + 128;     // red
        data[i + 1] = factor * (data[i + 1] - 128) + 128; // green
        data[i + 2] = factor * (data[i + 2] - 128) + 128; // blue
      }

      ctx.putImageData(imageData, 0, 0);

      let ascii = '';
      const blockChar = '█';
      const pixelSkip = 4; // Adjust this value to change resolution

      for (let y = 0; y < canvas.height; y += pixelSkip) {
        for (let x = 0; x < canvas.width; x += pixelSkip) {
          const index = (y * canvas.width + x) * 4;
          const brightness = (data[index] + data[index + 1] + data[index + 2]) / 3;
          
          if (brightness < 128) {
            ascii += blockChar;
          } else {
            ascii += ' ';
          }
        }
        ascii += '\n';
      }

      setProcessedArt(ascii);
    };

    img.src = uploadedImage;
  };

  useEffect(() => {
    if (uploadedImage) {
      processImage();
    }
  }, [uploadedImage]);

  return (
    <div className="converter-container">
      <h1>Image to Block Art Converter</h1>
      
      <div className="upload-section">
        <input
          type="file"
          accept="image/*"
          onChange={handleImageUpload}
          className="file-input"
        />
      </div>

      <div className="preview-section">
        {uploadedImage && (
          <div className="original-image">
            <h3>Original Image</h3>
            <img src={uploadedImage} alt="Original" />
          </div>
        )}
        
        {processedArt && (
          <div className="processed-art">
            <h3>Processed Art</h3>
            <pre>{processedArt}</pre>
          </div>
        )}
      </div>

      <canvas ref={canvasRef} style={{ display: 'none' }} />
    </div>
  );
};

export default ImageConverter; 