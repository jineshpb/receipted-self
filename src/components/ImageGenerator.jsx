import React, { Suspense } from 'react';
import Sketch from 'react-p5';

const ImageGenerator = () => {
  const [selectedFile, setSelectedFile] = React.useState(null);
  const [shouldRender, setShouldRender] = React.useState(false);

  let input;
  let img;
  let processed = false;
  let cols = 150;
  let rows = 30;

  const blocks = ["\u2588", "\u2589", "\u258A", "\u258B", "\u258C", "\u258D", "\u258E", "\u258F", " "];

  const setup = (p5, canvasParentRef) => {
    window._p5Instance = p5;
    
    if (selectedFile && !processed) {
      handleRender();
    }

    const canvas = p5.createCanvas(1024, 1024);
    canvas.parent(canvasParentRef);
    p5.textFont("monospace", 12);
    p5.textAlign(p5.LEFT, p5.TOP);

    p5.background(224);
    p5.fill(0);
    p5.text("Upload an image and click render", 10, 40);
  };

  const draw = (p5) => {
    if (!processed || !img) return;
    if (shouldRender) {
      let buffer = p5.createGraphics(1024, 1024);
      buffer.image(img, 0, 0);
      
      let size = Math.min(img.width, img.height);
      let x = (img.width - size) / 2;
      let y = (img.height - size) / 2;
      
      img = buffer.get(x, y, size, size);
      img.resize(1024, 1024);

      p5.background("#B9BFC8");
      let bright = 1.2;
      cols = 150;
      rows = p5.int((cols * img.height) / img.width / 2);
      let w = p5.width / cols;
      let h = p5.height / rows;

      img.loadPixels();

      for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
          let imgX = p5.int(p5.map(x, 0, cols, 0, img.width));
          let imgY = p5.int(p5.map(y, 0, rows, 0, img.height));
          let index = (imgY * img.width + imgX) * 4;

          let r = img.pixels[index];
          let g = img.pixels[index + 1];
          let b = img.pixels[index + 2];
          let brightness = ((r + g + b) / (3 * 255)) * bright;

          let blockIndex = p5.floor(p5.map(brightness, 0, 1, 0, blocks.length - 1));
          let char = blocks[blockIndex];

          p5.textSize(w * 2.1);
          p5.text(char, x * w, y * h);
        }
      }
      setShouldRender(false);
    }
  };

  const keyTyped = (p5) => {
    if (p5.key === "s") {
      p5.saveCanvas("image", "png");
    }
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    setSelectedFile(file);
    processed = false;
  };

  const handleRender = () => {
    const p5 = window._p5Instance;
    
    if (!p5) {
      setShouldRender(true);
      return;
    }
    
    if (!selectedFile) return;
    
    const reader = new FileReader();
    reader.onload = (e) => {
      img = p5.loadImage(e.target.result, () => {
        processed = true;
        setShouldRender(true);
      });
    };
    reader.readAsDataURL(selectedFile);
  };

  return (
    <div className="min-h-screen w-screen lg:justify-between flex flex-col lg:flex-row bg-[#B9BFC8] font-victor-mono-medium">
      <div className="w-full order-1 lg:order-2 lg:h-screen">
        <Suspense fallback={<div>Loading...</div>}>
          <Sketch setup={setup} draw={draw} keyTyped={keyTyped} />
        </Suspense>
      </div>

      <div className="w-full lg:w-full order-2 lg:order-1 lg:h-screen flex flex-col pl-8 py-8">
        <div className='flex flex-col flex-1'>
          <h1 className=' text-4xl font-bold'>Receipted</h1>
          <p className='mt-4 text-gray-500'>Upload a picture of square aspect ratio to get a receipt style image, Black and white images preferred</p>


          
          <div className="mt-4">
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="mb-4"
            />
            <button
              onClick={handleRender}
              className="px-4 py-2 bg-gray-800 text-white rounded hover:bg-gray-700"
              disabled={!selectedFile}
            >
              Render Image
            </button>
          </div>
        </div>

        <div className='border-gray-400 mt-12 border-t-[1px] pt-4'>
   
          <div className=' flex flex-col gap-1 items-start w-full  text-gray-500 '>
              <h1 className=" font-semibold font-victor-mono-bold">Jinesh P Bhaskaran</h1>
              <p className=' mb-1'>UI/UX designer</p>
          </div>

      
          <div className='flex flex-col'>
              <p className='text-gray-500 mb-1 mt-2'>Socials</p>
              <div className='flex flex-row gap-1 flex-wrap'>
                <a target='_blank' href='https://www.linkedin.com/in/jineshpb/' className='text-gray-500 mb-1 hover:text-gray-800'>LinkedIn</a>
                <a target='_blank' href='https://www.instagram.com/arcdesignz99/' className='text-gray-500 mb-1 hover:text-gray-800'>Instagram</a>
                <a target='_blank' href='https://www.behance.net/jineshpb' className='text-gray-500 mb-1 hover:text-gray-800'>Behance</a>
                <a target='_blank' href='https://jineshpb.me' className='text-gray-500 mb-1 hover:text-gray-800'>Personal website</a>
              </div>
            </div>  
            <div className='flex flex-row gap-2 mt-2'>
              <p className='text-gray-500 mb-1 '>Credits</p>
              <a href="https://x.com/samdape" className='text-gray-500 mb-1 hover:text-gray-800'>Sam Dape</a>
            </div>
            </div>
        </div>
      </div>
  
  );
};

export default ImageGenerator;
