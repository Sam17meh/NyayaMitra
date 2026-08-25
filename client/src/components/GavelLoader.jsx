import React, { useEffect, useRef, useState } from 'react';
import './GavelLoader.css';

// Global memory cache for 208 preloaded JPEG frame Image objects
let cachedFrames = null;
let preloaderPromise = null;

const preloadJPEGSequence = (frameCount = 208, basePath = '/loading/', onFirstFrameReady) => {
  if (cachedFrames && cachedFrames.length === frameCount) {
    if (onFirstFrameReady) onFirstFrameReady(cachedFrames[0]);
    return Promise.resolve(cachedFrames);
  }

  if (preloaderPromise) {
    if (cachedFrames && cachedFrames[0] && onFirstFrameReady) {
      onFirstFrameReady(cachedFrames[0]);
    }
    return preloaderPromise;
  }

  preloaderPromise = new Promise((resolve) => {
    const images = [];
    let count = 0;
    const padNumber = (n) => String(n).padStart(4, '0');

    for (let i = 0; i < frameCount; i++) {
      const img = new Image();
      const filename = `${padNumber(i)}.jpg`;
      img.src = `${basePath}${filename}`;

      const handleDone = () => {
        if (i === 0 && onFirstFrameReady) {
          onFirstFrameReady(img);
        }
        count++;
        if (count >= frameCount) {
          cachedFrames = images;
          resolve(images);
        }
      };

      img.onload = handleDone;
      img.onerror = handleDone;
      images.push(img);
    }
  });

  return preloaderPromise;
};

/**
 * GavelLoader - Production-Ready Photorealistic JPEG Canvas Gavel Animation
 */
const GavelLoader = ({
  isLoading = true,
  frameCount = 208,
  fps = 20,
  basePath = '/loading/',
  minDisplayTime = 3800, // 3.8s minimum presentation of ACTIVE gavel animation
  onFadeOutEnd
}) => {
  const canvasRef = useRef(null);
  const animationFrameIdRef = useRef(null);
  const currentFrameIndexRef = useRef(0);
  const lastFrameTimeRef = useRef(0);
  const animationStartTimeRef = useRef(null);

  const [firstFrameObj, setFirstFrameObj] = useState(null);
  const [isPreloaded, setIsPreloaded] = useState(false);
  const [isFadingOut, setIsFadingOut] = useState(false);
  const [shouldRender, setShouldRender] = useState(true);

  // Preload frames with instant first-frame callback
  useEffect(() => {
    let isMounted = true;
    preloadJPEGSequence(frameCount, basePath, (img0) => {
      if (isMounted && img0) {
        setFirstFrameObj(img0);
      }
    }).then(() => {
      if (isMounted) {
        setIsPreloaded(true);
      }
    });

    return () => {
      isMounted = false;
    };
  }, [frameCount, basePath]);

  // Start 3.8s presentation timer ONLY AFTER frames are fully preloaded and active
  useEffect(() => {
    if (!isPreloaded) return;

    animationStartTimeRef.current = Date.now();

    let timerId;

    if (!isLoading) {
      const elapsed = Date.now() - animationStartTimeRef.current;
      const delay = Math.max(0, minDisplayTime - elapsed);

      timerId = setTimeout(() => {
        setIsFadingOut(true);
        const fadeTimer = setTimeout(() => {
          setShouldRender(false);
          if (onFadeOutEnd) onFadeOutEnd();
        }, 400); // 400ms CSS fade transition
        return () => clearTimeout(fadeTimer);
      }, delay);
    }

    return () => {
      if (timerId) clearTimeout(timerId);
    };
  }, [isPreloaded, isLoading, minDisplayTime, onFadeOutEnd]);

  // Canvas render loop with multiply blending for 100% borderless, seamless white background
  useEffect(() => {
    if (!shouldRender) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const frameInterval = 1000 / fps;

    const resizeCanvas = () => {
      const container = canvas.parentElement;
      if (!container) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const rect = container.getBoundingClientRect();

      canvas.width = Math.floor(rect.width * dpr);
      canvas.height = Math.floor(rect.height * dpr);
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    const renderLoop = (timestamp) => {
      if (!lastFrameTimeRef.current) {
        lastFrameTimeRef.current = timestamp;
      }

      const delta = timestamp - lastFrameTimeRef.current;

      // Advance frames ONLY when images are fully preloaded
      if (isPreloaded && cachedFrames && delta >= frameInterval) {
        currentFrameIndexRef.current = (currentFrameIndexRef.current + 1) % frameCount;
        lastFrameTimeRef.current = timestamp - (delta % frameInterval);
      }

      const img = (isPreloaded && cachedFrames) ? cachedFrames[currentFrameIndexRef.current] : firstFrameObj;

      if (img && img.complete && img.naturalWidth > 0) {
        const cWidth = canvas.width;
        const cHeight = canvas.height;
        const imgWidth = img.naturalWidth;
        const imgHeight = img.naturalHeight;

        // Crop 3.5% from left & right edges to eliminate source ezgif dark edge lines
        const cropX = imgWidth * 0.035;
        const cropW = imgWidth * 0.93;
        const cropY = 0;
        const cropH = imgHeight;

        // Aspect ratio contain calculation based on cropped source
        const srcAspect = cropW / cropH;
        const canvasAspect = cWidth / cHeight;

        let drawWidth, drawHeight;
        if (canvasAspect > srcAspect) {
          drawHeight = cHeight;
          drawWidth = cHeight * srcAspect;
        } else {
          drawWidth = cWidth;
          drawHeight = cWidth / srcAspect;
        }

        const offsetX = (cWidth - drawWidth) / 2;
        const offsetY = (cHeight - drawHeight) / 2;

        // Step 1: Fill background with 100% pure white
        ctx.globalCompositeOperation = 'source-over';
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, cWidth, cHeight);

        // Step 2: Multiply composite mode to dissolve photo background into pure white
        ctx.globalCompositeOperation = 'multiply';
        ctx.drawImage(
          img,
          cropX, cropY, cropW, cropH,
          offsetX, offsetY, drawWidth, drawHeight
        );

        ctx.globalCompositeOperation = 'source-over';
      }

      animationFrameIdRef.current = requestAnimationFrame(renderLoop);
    };

    animationFrameIdRef.current = requestAnimationFrame(renderLoop);

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      if (animationFrameIdRef.current) {
        cancelAnimationFrame(animationFrameIdRef.current);
      }
    };
  }, [shouldRender, isPreloaded, firstFrameObj, frameCount, fps]);

  if (!shouldRender) return null;

  return (
    <div
      className={`gavel-loader-overlay ${isFadingOut ? 'fade-out' : ''}`}
      aria-label="Nyaya Mitra Loading Screen"
      role="status"
    >
      <div className="gavel-loader-container">
        <div className="gavel-canvas-wrapper">
          <canvas ref={canvasRef} className="gavel-canvas" />
        </div>

        <div className="gavel-loader-branding">
          <h1 className="gavel-brand-title">Nyaya Mitra</h1>
          <p className="gavel-brand-tagline">Your Justice. Our Mission.</p>
          <div className="gavel-progress-track">
            <div className="gavel-progress-bar-indeterminate" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default GavelLoader;
