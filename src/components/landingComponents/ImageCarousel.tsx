import { ChevronLeft, ChevronRight, Grid3x3 } from 'lucide-react';
import React, { useEffect, useState } from 'react'
import Image from 'next/image';

const projectImages = [
    // { src: "/images/slide_2.jpeg", alt: "Infrastructure Development", width: 1920, height: 1080},
    // { src: "/images/slide_1.jpeg", alt: "Project Planning" , width: 1920, height: 1080},
    // { src: "/images/DSC03824.JPG", alt: "Site Visit" , width: 1920, height: 1080},
    // { src: "/images/DSC03823.JPG", alt: "Field Inspection", width: 1920, height: 1080 },
    { src: "/images/dam2.jpg", alt: "Dam Construction" , width: 1920, height: 1080},
    { src: "/images/riversMap.jpg", alt: "River Mapping" , width: 1920, height: 1080},
    { src: "/images/Canal.jpg", alt: "Canal System" , width: 1920, height: 1080},
    { src: "/images/Flood.jpg", alt: "Flood Management" , width: 1920, height: 1080},
    { src: "/images/Kako_Prakhand1.jpg", alt: "Community Engagement", width: 1920, height: 1080 },
    { src: "/images/Kako_Prakhand2.jpg", alt: "Project Site 1", width: 1920, height: 1080 },
    { src: "/images/Kako_Prakhand4.jpg", alt: "Project Site 2" , width: 1920, height: 1080},
    { src: "/images/Pine4 (1).jpg", alt: "Water Control Structure" , width: 1920, height: 1080},
];

export const ImageCarousel = () => {
    const [currentSlide, setCurrentSlide] = useState(0);
    const [isCollageMode, setIsCollageMode] = useState(false);
    const slidesPerView = 3; // Number of images visible in collage mode
    const totalSlides = Math.ceil(projectImages.length / slidesPerView);

    // Get current collage slide images
    const getCollageImages = () => {
        const start = currentSlide * slidesPerView;
        return projectImages.slice(start, start + slidesPerView);
    };

    useEffect(() => {
        if (!isCollageMode) {
            const interval = setInterval(() => {
                setCurrentSlide((prev) => (prev + 1) % projectImages.length);
            }, 4000);
            return () => clearInterval(interval);
        }
    }, [isCollageMode]);

    const goToSlide = (index: number) => setCurrentSlide(index);
    
    const prevSlide = () => {
        if (isCollageMode) {
            setCurrentSlide((prev) => (prev - 1 + totalSlides) % totalSlides);
        } else {
            setCurrentSlide((prev) => (prev - 1 + projectImages.length) % projectImages.length);
        }
    };
    
    const nextSlide = () => {
        if (isCollageMode) {
            setCurrentSlide((prev) => (prev + 1) % totalSlides);
        } else {
            setCurrentSlide((prev) => (prev + 1) % projectImages.length);
        }
    };

    return (
        <section className="w-full relative bg-gradient-to-b from-blue-900 to-blue-800">
            {/* Top Banner with Project Details */}
            {/* Carousel Container */}
            <div className='relative w-full h-[70vh] overflow-hidden'>
                {/* Mode Toggle Button */}
                <div className="absolute top-4 right-4 z-30">
                    <button
                        onClick={() => setIsCollageMode(!isCollageMode)}
                        className="bg-white/10 hover:bg-white/20 backdrop-blur-md text-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-2 transition-all hover:scale-105 border border-white/20"
                    >
                        <Grid3x3 size={20} />
                        <span className="text-sm font-medium">
                            {isCollageMode ? "Single View" : "Collage View"}
                        </span>
                    </button>
                </div>

             

                {/* COLLAGE MODE */}
                {isCollageMode ? (
                    <>
                        {/* Collage Grid */}
                        <div className="absolute inset-0 grid grid-cols-3 gap-4 p-4 z-10 mt-20">
                            {getCollageImages().map((img, index) => (
                                <div
                                    key={index}
                                    className="relative overflow-hidden rounded-xl group"
                                >
                                    <Image
                                        src={img.src}
                                        alt={img.alt}
                                        width={img.width}
                                        height={img.height}
                                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent">
                                        <div className="absolute bottom-4 left-4 right-4">
                                            <p className="text-white text-sm font-medium">{img.alt}</p>
                                            <div className="w-full h-1 bg-gradient-to-r from-blue-500 to-cyan-500 mt-2 rounded-full"></div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Background Pattern */}
                        {/* <div className="absolute inset-0 bg-gradient-to-br from-blue-900/30 via-transparent to-blue-800/20 z-0"></div> */}
                    </>
                ) : (
                    /* SINGLE IMAGE MODE */
                    <>
                        {/* Slides */}
                        {projectImages.map((img, index) => (
                            <div
                                key={index}
                                className={`absolute inset-0 transition-all duration-1000 ease-in-out transform ${
                                    index === currentSlide
                                        ? "opacity-100 scale-100 z-10"
                                        : "opacity-0 scale-105 z-0"
                                }`}
                            >
                                <Image
                                    src={img.src}
                                    alt={img.alt}
                                     width={img.width}
    height={img.height}
                                    className="w-full h-full object-cover"
                                />
                                {/* <div className="absolute inset-0 bg-gradient-to-r from-blue-900/60 to-blue-800/40"></div> */}
                                
                                {/* Image Description Overlay */}
                                <div className="absolute bottom-0 left-0 right-0 z-20 p-6 bg-gradient-to-t from-black/80 via-black/50 to-transparent">
                                    <div className="container mx-auto">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <h3 className="text-white text-xl font-bold mb-2">{img.alt}</h3>
                                                <div className="w-16 h-1 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full"></div>
                                            </div>
                                            <div className="text-blue-200 text-sm">
                                                Image {index + 1} of {projectImages.length}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </>
                )}

                {/* 🔹 Prev/Next Buttons */}
                <button
                    onClick={prevSlide}
                    className="absolute top-1/2 left-6 -translate-y-1/2 bg-white/10 hover:bg-white/20 backdrop-blur-lg text-white p-3 rounded-full shadow-xl transition-all z-30 hover:scale-110 border border-white/30"
                >
                    <ChevronLeft size={26} />
                </button>
                <button
                    onClick={nextSlide}
                    className="absolute top-1/2 right-6 -translate-y-1/2 bg-white/10 hover:bg-white/20 backdrop-blur-lg text-white p-3 rounded-full shadow-xl transition-all z-30 hover:scale-110 border border-white/30"
                >
                    <ChevronRight size={26} />
                </button>

                {/* 🔹 Dots - Different for collage/single mode */}
                <div className="absolute bottom-24 w-full flex justify-center z-30">
                    <div className="bg-black/40 backdrop-blur-lg px-6 py-3 rounded-full border border-white/20">
                        <div className="flex space-x-4">
                            {isCollageMode
                                ? Array.from({ length: totalSlides }).map((_, idx) => (
                                      <button
                                          key={idx}
                                          onClick={() => goToSlide(idx)}
                                          className={`w-3 h-3 rounded-full transition-all duration-300 ${
                                              currentSlide === idx
                                                  ? "bg-white scale-125 shadow-lg w-10"
                                                  : "bg-gray-400/70 hover:bg-gray-300"
                                          }`}
                                      />
                                  ))
                                : projectImages.map((_, idx) => (
                                      <button
                                          key={idx}
                                          onClick={() => goToSlide(idx)}
                                          className={`w-3 h-3 rounded-full transition-all duration-300 ${
                                              currentSlide === idx
                                                  ? "bg-white scale-125 shadow-lg w-10"
                                                  : "bg-gray-400/70 hover:bg-gray-300"
                                          }`}
                                      />
                                  ))}
                        </div>
                    </div>
                </div>

                {/* Current Mode Indicator */}
                <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-30">
                    <div className="bg-black/50 backdrop-blur-lg text-white text-sm px-4 py-2 rounded-full border border-white/20">
                        {isCollageMode 
                            ? `📊 Collage View | Set ${currentSlide + 1} of ${totalSlides}` 
                            : `🖼️ Single View | Image ${currentSlide + 1} of ${projectImages.length}`}
                    </div>
                </div>

                {/* Image Counter */}
                <div className="absolute top-4 left-4 z-30">
                    <div className="bg-black/50 backdrop-blur-lg text-white text-sm px-4 py-2 rounded-full border border-white/20">
                        <span className="font-semibold">{projectImages.length}</span> Project Images
                    </div>
                </div>
            </div>
        </section>
    );
};