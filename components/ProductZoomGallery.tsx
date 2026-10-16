"use client";

import { useEffect, useState } from "react";

type ProductZoomGalleryProps = {
  images: string[];
  productName: string;
};

export function ProductZoomGallery({ images, productName }: ProductZoomGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isZoomOpen, setIsZoomOpen] = useState(false);

  const activeImage = images[activeIndex] ?? images[0];

  useEffect(() => {
    if (!isZoomOpen) return;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setIsZoomOpen(false);
      if (event.key === "ArrowLeft") {
        setActiveIndex((current) => (current === 0 ? images.length - 1 : current - 1));
      }
      if (event.key === "ArrowRight") {
        setActiveIndex((current) => (current + 1) % images.length);
      }
    }

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [images.length, isZoomOpen]);

  function goToPrevious() {
    setActiveIndex((current) => (current === 0 ? images.length - 1 : current - 1));
  }

  function goToNext() {
    setActiveIndex((current) => (current + 1) % images.length);
  }

  return (
    <>
      <button className="zoomImageButton" onClick={() => setIsZoomOpen(true)} type="button">
        <img className="mainProductImage" alt={productName} src={activeImage} fetchPriority="high" decoding="async" />
        <span>Click to zoom</span>
      </button>
      <div className="thumbnailGrid" aria-label={`${productName} product views`}>
        {images.map((image, index) => (
          <button
            aria-label={`Show ${productName} view ${index + 1}`}
            className={activeIndex === index ? "active" : ""}
            key={image}
            onClick={() => setActiveIndex(index)}
            type="button"
          >
            <img alt={`${productName} view ${index + 1}`} src={image} loading="lazy" decoding="async" />
          </button>
        ))}
      </div>

      {isZoomOpen ? (
        <div className="zoomOverlay" role="dialog" aria-modal="true" aria-label={`${productName} image zoom`}>
          <button className="zoomClose" onClick={() => setIsZoomOpen(false)} type="button">
            Close
          </button>
          <button className="zoomNav previous" onClick={goToPrevious} type="button" aria-label="Previous image">
            Prev
          </button>
          <img alt={`${productName} zoomed view`} src={activeImage} decoding="async" />
          <button className="zoomNav next" onClick={goToNext} type="button" aria-label="Next image">
            Next
          </button>
          <div className="zoomCaption">
            <strong>{productName}</strong>
            <span>
              {activeIndex + 1} / {images.length}
            </span>
          </div>
        </div>
      ) : null}
    </>
  );
}
