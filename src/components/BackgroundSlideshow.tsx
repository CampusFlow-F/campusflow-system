import img2 from '../assets/imgs/login/img2.jpg';
import img3 from '../assets/imgs/login/img3.jpg';
import img4 from '../assets/imgs/login/img4.jpg';
import profile from '../assets/imgs/login/profile.jpeg';
import { useState, useEffect } from 'react';

const backgroundImages = [
 
  img2,
  img4,
  
  
];



const BackgroundSlideshow = () => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) => 
        (prevIndex + 1) % backgroundImages.length
      );
    }, 5000); // Change image every 5 seconds

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed inset-0 -z-10">
      {backgroundImages.map((image, index) => (
        <div
          key={image}
          className={`absolute inset-0 bg-cover bg-center bg-no-repeat transition-opacity duration-1000 ${
            index === currentImageIndex ? 'opacity-100' : 'opacity-0'
          }`}
          style={{
            backgroundImage: `url(${image})`,
          }}
        />
      ))}
      {/* Dark overlay for better text readability */}
      <div className="absolute inset-0 bg-black/50" />
    </div>
  );
};

export default BackgroundSlideshow;
