import React, { Suspense } from "react";
import Sketch from "react-p5";

const ImageGenerator = () => {
  const [selectedFile, setSelectedFile] = React.useState(null);
  const [shouldRender, setShouldRender] = React.useState(false);
  const [img, setImg] = React.useState(null);

  let cols = 150;
  let rows = 30;

  const blocks = [
    "\u2588",
    "\u2589",
    "\u258A",
    "\u258B",
    "\u258C",
    "\u258D",
    "\u258E",
    "\u258F",
    " ",
  ];

  // Memoize the resize handler to maintain reference
  const handleResize = React.useCallback((p5) => {
    const parentElement = p5.canvas.parentElement;
    if (parentElement) {
      p5.resizeCanvas(parentElement.offsetWidth, parentElement.offsetHeight);
      setShouldRender(true);
    }
  }, []);

  const setup = (p5, canvasParentRef) => {
    window._p5Instance = p5;

    const parentWidth = canvasParentRef.offsetWidth;
    const parentHeight = canvasParentRef.offsetHeight;

    const canvas = p5.createCanvas(parentWidth, parentHeight);
    canvas.parent(canvasParentRef);

    // Store the bound resize handler
    window._resizeHandler = () => handleResize(p5);
    window.addEventListener("resize", window._resizeHandler);

    p5.textFont("monospace", 12);
    p5.textAlign(p5.LEFT, p5.TOP);
    p5.background(224);
    p5.fill(0);
    p5.text("Upload an image and click render", 10, 40);
  };

  // Clean up with the correct reference
  React.useEffect(() => {
    return () => {
      if (window._resizeHandler) {
        window.removeEventListener("resize", window._resizeHandler);
        delete window._resizeHandler;
      }
    };
  }, []);

  const draw = (p5) => {
    if (!img) return;

    if (shouldRender) {
      // Clear canvas
      p5.background("#B9BFC8");

      // Get parent container dimensions
      const parentWidth = p5.width;
      const parentHeight = p5.height;

      // Calculate dimensions maintaining aspect ratio
      let targetWidth, targetHeight;
      if (img.width > img.height) {
        // Landscape image - fit to container width
        targetWidth = parentWidth;
        targetHeight = (targetWidth * img.height) / img.width;

        // If calculated height exceeds container, scale down
        if (targetHeight > parentHeight) {
          targetHeight = parentHeight;
          targetWidth = (targetHeight * img.width) / img.height;
        }
      } else {
        // Portrait or square image - fit to container height
        targetHeight = parentHeight;
        targetWidth = (targetHeight * img.width) / img.height;

        // If calculated width exceeds container, scale down
        if (targetWidth > parentWidth) {
          targetWidth = parentWidth;
          targetHeight = (targetWidth * img.height) / img.width;
        }
      }

      // Create buffer with correct aspect ratio
      let buffer = p5.createGraphics(targetWidth, targetHeight);
      buffer.image(img, 0, 0, targetWidth, targetHeight);

      // Center the output
      const xOffset = (p5.width - targetWidth) / 2;
      const yOffset = (p5.height - targetHeight) / 2;
      p5.translate(xOffset, yOffset);

      // Process the image
      let bright = 1.2;
      cols = 150;
      rows = p5.int((cols * targetHeight) / targetWidth / 2);
      let w = targetWidth / cols;
      let h = targetHeight / rows;

      img.loadPixels(); // Make sure we load the pixels from the original image

      for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
          let imgX = p5.int(p5.map(x, 0, cols, 0, img.width));
          let imgY = p5.int(p5.map(y, 0, rows, 0, img.height));
          let index = (imgY * img.width + imgX) * 4;

          let r = img.pixels[index];
          let g = img.pixels[index + 1];
          let b = img.pixels[index + 2];
          let brightness = ((r + g + b) / (3 * 255)) * bright;

          let blockIndex = p5.floor(
            p5.map(brightness, 0, 1, 0, blocks.length - 1)
          );
          let char = blocks[blockIndex];

          p5.textSize(w * 2.1);
          p5.text(char, x * w, y * h);
        }
      }

      // Only set shouldRender to false if the image was successfully processed
      if (img.pixels) {
        setShouldRender(false);
      }
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
  };

  const handleRender = () => {
    const p5 = window._p5Instance;

    if (!selectedFile || !p5) return;

    console.log("Rendering image:", selectedFile.name);

    const reader = new FileReader();
    reader.onload = (e) => {
      console.log("Image loaded:", e.target.result);
      setImg(
        p5.loadImage(e.target.result, () => {
          setShouldRender(true);
        })
      );
    };
    reader.readAsDataURL(selectedFile);
  };

  const handleDownload = () => {
    console.log(img, "Downloading image");

    const p5 = window._p5Instance;
    if (p5 && img) {
      p5.saveCanvas("receipted-image", "png");
    }
  };

  const handleSampleImageClick = (sampleNumber) => {
    const p5 = window._p5Instance;
    if (!p5) return;

    console.log(`Loading sample image ${sampleNumber}`);
    setImg(
      p5.loadImage(`sample-${sampleNumber}.jpg`, () => {
        setShouldRender(true);
      })
    );
  };

  return (
    <div className="min-h-screen w-full lg:justify-between flex flex-col lg:flex-row bg-[#B9BFC8] font-victor-mono-medium ">
      <div className="w-full order-1 lg:order-2 lg:h-screen">
        <button
          onClick={handleDownload}
          className={`px-4 py-2 bg-gray-800 text-white rounded absolute bottom-4 right-4 ${
            img
              ? "hover:bg-gray-700 cursor-pointer"
              : "opacity-50 cursor-not-allowed"
          }`}
          disabled={!img}
        >
          Download image
        </button>
        <Suspense fallback={<div>Loading...</div>}>
          <Sketch
            setup={setup}
            draw={draw}
            keyTyped={keyTyped}
            className="w-full h-full"
          />
        </Suspense>
      </div>

      <div className="w-full lg:w-full order-2 lg:order-1 lg:h-screen flex flex-col pl-8 py-8">
        <div className="flex flex-col flex-1 pr-4">
          <h1 className=" text-4xl font-bold">Receipted</h1>
          <p className="mt-4 text-gray-500">
            Upload a picture of square aspect ratio to get a receipt style
            image, Black and white images preferred
          </p>

          <p className="mt-4 text-gray-500"> Image styles that works well 👇</p>

          <div className="grid grid-cols-3 p-4 gap-4 w-full">
            <img
              src="sample-1.jpg"
              alt="Sample 1"
              className="w-full rounded-lg h-auto object-cover aspect-square cursor-pointer hover:opacity-80 transition-opacity"
              onClick={() => handleSampleImageClick(1)}
            />
            <img
              src="sample-2.jpg"
              alt="Sample 2"
              className="w-full rounded-lg h-auto object-cover aspect-square cursor-pointer hover:opacity-80 transition-opacity"
              onClick={() => handleSampleImageClick(2)}
            />
            <img
              src="sample-3.jpg"
              alt="Sample 3"
              className="w-full rounded-lg h-auto object-cover aspect-square cursor-pointer hover:opacity-80 transition-opacity"
              onClick={() => handleSampleImageClick(3)}
            />
          </div>

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

        <div className="border-gray-400 mt-12 border-t-[1px] pt-4">
          <div className=" flex flex-col gap-1 items-start w-full  text-gray-500 ">
            <h1 className=" font-semibold font-victor-mono-bold">
              Jinesh P Bhaskaran
            </h1>
            <p className=" mb-1">UI/UX designer</p>
          </div>

          <div className="flex flex-col">
            <p className="text-gray-500 mb-1 mt-2">Socials</p>
            <div className="flex flex-row gap-1 flex-wrap">
              <a
                target="_blank"
                href="https://www.linkedin.com/in/jineshpb/"
                className="text-gray-500 mb-1 hover:text-gray-800"
              >
                LinkedIn
              </a>
              <a
                target="_blank"
                href="https://www.instagram.com/arcdesignz99/"
                className="text-gray-500 mb-1 hover:text-gray-800"
              >
                Instagram
              </a>
              <a
                target="_blank"
                href="https://www.behance.net/jineshpb"
                className="text-gray-500 mb-1 hover:text-gray-800"
              >
                Behance
              </a>
              <a
                target="_blank"
                href="https://jineshpb.me"
                className="text-gray-500 mb-1 hover:text-gray-800"
              >
                Personal website
              </a>
            </div>
          </div>
          <div className="flex flex-row gap-2 mt-2">
            <p className="text-gray-500 mb-1 ">Credits</p>
            <a
              href="https://x.com/samdape"
              className="text-gray-500 mb-1 hover:text-gray-800"
            >
              Sam Dape
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImageGenerator;
