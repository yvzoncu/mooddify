'use client';

import React, { useState, useRef } from 'react';
import { Camera, Upload, X } from 'lucide-react';
import { useEmotion } from '@/contexts/EmotionContext';
import Image from 'next/image';

export default function PictureUploadCard() {
  const { selectedEmotion } = useEmotion();
  const [image, setImage] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();

    if (e.target.files && e.target.files[0]) {
      handleFiles(e.target.files[0]);
    }
  };

  const handleFiles = (file: File) => {
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target && typeof e.target.result === 'string') {
          setImage(e.target.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  const removeImage = () => {
    setImage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const getBorderColor = () => {
    return selectedEmotion ? selectedEmotion.color : '#F3F4F6';
  };

  return (
    <div>
      <div
        className={`relative w-full h-64 rounded-lg border-2 border-dashed flex flex-col items-center justify-center transition-all duration-300 overflow-hidden
            ${
              dragActive ? 'border-indigo-500 bg-indigo-50' : 'border-gray-300'
            }`}
        style={
          image ? { borderColor: getBorderColor(), borderStyle: 'solid' } : {}
        }
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        {!image ? (
          <>
            <Camera size={48} className="text-gray-400 mb-4" />
            <p className="text-sm text-gray-500 text-center mb-2">Optional*</p>
            <p className="text-sm text-gray-500 text-center mb-6">
              Drag & drop an image here or click to upload
            </p>
            <button
              onClick={handleButtonClick}
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-600 transition flex items-center gap-2"
            >
              <Upload size={16} />
              Browse Files
            </button>
            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              accept="image/*"
              onChange={handleChange}
            />
          </>
        ) : (
          <>
            <div className="relative w-full h-full">
              <Image
                src={image}
                alt="Uploaded mood image"
                fill
                sizes="(max-width: 768px) 100vw, 500px"
                priority
                className="object-cover"
              />
            </div>
            <button
              onClick={removeImage}
              className="absolute top-2 right-2 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-md hover:bg-gray-100 z-10"
              aria-label="Remove image"
            >
              <X size={16} />
            </button>
          </>
        )}
      </div>

      {image && (
        <div className="p-3 rounded-md bg-white shadow-sm text-center">
          <p className="text-sm font-medium">Your moment captured!</p>
        </div>
      )}
    </div>
  );
}
