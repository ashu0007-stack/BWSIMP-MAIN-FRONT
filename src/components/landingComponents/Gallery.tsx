import React, { FC, useState } from "react";
import Image from 'next/image';

const projectImages = [
     { 
        src: "/images/doa2.jpg", 
        width: 1200,
        height: 800
    },
    { 
        src: "/images/doa.jpg", 
        width: 1200,
        height: 800
    },
    { 
        src: "/images/kois.jpg", 
        width: 1200,
        height: 800
    },
    { 
        src: "/images/kosi2.jpg", 
        width: 1200,
        height: 800
    },
    { 
        src: "/images/Kako_Prakhand1.jpg", 
        width: 1200,
        height: 800
    },
    { 
        src: "/images/Kako_Prakhand2.jpg", 
        width: 1200,
        height: 800
    },
    { 
        src: "/images/Kako_Prakhand4.jpg", 
        width: 1200,
        height: 800
    },
    { 
        src: "/images/Pine4 (1).jpg", 
        width: 1200,
        height: 800
    },
    
];

export const Gallery: FC = () => {
    const [selectedImage, setSelectedImage] = useState(projectImages[0]);

    const selectedImagess = (image: typeof projectImages[0]) => {
        setSelectedImage(image);
    };

    return (
        <section id="gallery-media" className="w-full py-16 px-4 bg-gradient-to-b from-white to-gray-50">
            <div className="container mx-auto">
                <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
                    {/* Gallery Header */}
                    <div className="bg-gradient-to-r from-blue-900 to-blue-800 p-6">
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                            <div>
                                <h3 className="text-2xl font-bold text-white">Media Repository</h3>
                                <p className="text-blue-100">Government of Bihar - Water Resources Department</p>
                            </div>
                         
                        </div>
                    </div>

                    <div className="grid lg:grid-cols-3 gap-8 p-6">
                        {/* Selected Image Display */}
                        <div className="lg:col-span-2">
                            <div className="bg-gray-50 rounded-xl overflow-hidden border border-gray-200">
                                <div className="relative h-[400px]">
                                    <Image
                                        src={selectedImage.src}
                                        alt="Gallery image"
                                        width={selectedImage.width}
                                        height={selectedImage.height}
                                        className="w-full h-full object-cover"
                                    />
                                   
                                </div>
                            </div>
                        </div>

                        {/* Thumbnail Grid */}
                        <div>
                            <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                                <h4 className="font-bold text-gray-900 mb-4">Gallery Images ({projectImages.length})</h4>
                                <div className="grid grid-cols-2 gap-3 max-h-[400px] overflow-y-auto pr-2 thin-scrollbar">
                                    {projectImages.map((img, index) => (
                                        <div
                                            key={index}
                                            onClick={() => selectedImagess(img)}
                                            className={`bg-white rounded-lg overflow-hidden border-2 cursor-pointer transition-all hover:scale-[1.02] ${
                                                selectedImage.src === img.src
                                                ? "border-blue-500 shadow-lg"
                                                : "border-gray-200 hover:border-blue-300"
                                            }`}
                                        >
                                            <div className="relative h-32">
                                                <Image
                                                    src={img.src}
                                                    alt="Gallery thumbnail"
                                                    width={img.width}
                                                    height={img.height}
                                                    className="w-full h-full object-cover"
                                                />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}; 