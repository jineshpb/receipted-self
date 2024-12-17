import React from 'react';
import Sketch from 'react-p5';

const ImageGenerator = () => {
  let input;
  let img;
  let processed = false;
  let cols = 150;
  let rows = 30;

  const blocks = ["\u2588", "\u2589", "\u258A", "\u258B", "\u258C", "\u258D", "\u258E", "\u258F", " "];

  const setup = (p5, canvasParentRef) => {
    // New canvas sizing logic
    let canvasSize;
    if (p5.windowWidth < 1024) {
      canvasSize = p5.windowWidth;
    } else {
      canvasSize = p5.windowHeight;
    }
    
    const canvas = p5.createCanvas(canvasSize, canvasSize);
    canvas.parent(canvasParentRef);
    p5.textFont("monospace", 12);
    p5.textAlign(p5.LEFT, p5.TOP);

    // load image
    img = p5.loadImage("jinesh.jpg", (data) => {
      processed = true;
      p5.redraw();
    });

    p5.background(224);
    p5.fill(0);
    p5.text("select an image file to process", 10, 40);
  };

  const draw = (p5) => {
    if (!processed || !img) return;

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
  };

  const keyTyped = (p5) => {
    if (p5.key === "s") {
      p5.saveCanvas("image", "png");
    }
  };

  const windowResized = (p5) => {
    let canvasSize;
    if (p5.windowWidth < 1024) {
      canvasSize = p5.windowWidth;
    } else {
      canvasSize = p5.windowHeight;
    }
    p5.resizeCanvas(canvasSize, canvasSize);
  };

  return (
    <div className="min-h-screen w-screen lg:justify-between flex flex-col lg:flex-row bg-[#B9BFC8] font-victor-mono-medium">
      {/* Canvas container - now first on mobile, second on desktop */}
      <div className="w-full order-1 lg:order-2 lg:h-screen">
        <Sketch setup={setup} draw={draw} keyTyped={keyTyped} windowResized={windowResized} />
      </div>

      {/* Content container - now second on mobile, first on desktop */}
      <div className="w-full lg:w-full order-2 lg:order-1 lg:h-screen flex flex-col pl-8 py-8">
        <div className='flex flex-col flex-1'>
          <div className='border-b-[1px] w-full border-gray-400'>
            <h1 className="text-2xl font-semibold text-gray-800 font-victor-mono-bold">Jinesh P Bhaskaran</h1>
            <p className='text-gray-500 mb-1'>UI/UX designer</p>
          </div>
          <div className='flex flex-row mt-4'>
            <div className='flex flex-col'>
              <p>Staff Designer: Walmart</p>
              <p className='text-gray-500'>2024 - 2025</p>
            </div>
          </div>
        </div>

        <div className='flex flex-col gap-4 mb-4 mt-12'>
          <div className='flex flex-col'>
            <p className='text-gray-500 mb-1'>Email</p>
            <p className='text-gray-500 mb-1'>jinesh.p.bhaskaran@gmail.com</p>
          </div>
          <div className='flex flex-col'>
            <p className='text-gray-500 mb-1'>Socials</p>
            <div className='flex flex-row gap-4'>
              <a target='_blank' href='https://www.linkedin.com/in/jineshpb/' className='text-gray-500 mb-1 hover:text-gray-800'>LinkedIn</a>
              <a target='_blank' href='https://www.instagram.com/arcdesignz99/' className='text-gray-500 mb-1 hover:text-gray-800'>Instagram</a>
              <a target='_blank' href='https://www.behance.net/jineshpb' className='text-gray-500 mb-1 hover:text-gray-800'>Behance</a>
              <a target='_blank' href='https://jineshpb.me' className='text-gray-500 mb-1 hover:text-gray-800'>Personal website</a>
            </div>
          </div>  
          <div className='flex flex-row gap-2'>
            <p className='text-gray-500 mb-1'>Credits</p>
            <a href="https://x.com/samdape" className='text-gray-500 mb-1 hover:text-gray-800'>Sam Dape</a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImageGenerator;
