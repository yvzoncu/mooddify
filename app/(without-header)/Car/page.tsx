'use client';

import React, { useState } from 'react';

const SimpleCarousel = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const totalSlides = 3;

  // Go to next slide with wrapping
  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % totalSlides);
  };

  // Go to previous slide with wrapping
  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + totalSlides) % totalSlides);
  };

  return (
    <div className="relative w-full max-w-4xl mx-auto">
      {/* Carousel container */}
      <div className="overflow-hidden relative h-64 rounded-lg">
        {/* Slide container */}
        <div
          className="flex transition-transform duration-500 ease-in-out h-full"
          style={{ transform: `translateX(-${currentSlide * 100}%)` }}
        >
          {/* Individual slides */}
          <div className="min-w-full bg-red-100 flex items-center justify-center">
            <h2 className="text-3xl font-bold">Page 1</h2>
          </div>
          <div className="min-w-full bg-green-100 flex items-center justify-center">
            <h2 className="text-3xl font-bold">Page 2</h2>
          </div>
          <div className="min-w-full bg-blue-100 flex items-center justify-center">
            <h2 className="text-3xl font-bold">Page 3</h2>
          </div>
        </div>
      </div>

      {/* Navigation controls */}
      <div className="flex justify-between mt-4">
        <button
          onClick={prevSlide}
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
        >
          Previous
        </button>

        <button
          onClick={nextSlide}
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default SimpleCarousel;
