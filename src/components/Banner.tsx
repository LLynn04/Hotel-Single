import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, Play, Pause } from "lucide-react";

const Banner = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);

  const slides = [
    {
      id: 1,
      title: "Revolutionary Experience",
      subtitle: "Next-Gen Technology",
      description:
        "Discover the future of digital innovation with cutting-edge solutions that transform the way you work and play.",
      bg: "from-purple-900 via-blue-900 to-indigo-900",
      accent: "from-pink-500 to-violet-500",
      image:
        "https://www.hoteldel.com/wp-content/uploads/2021/01/hotel-del-coronado-views-suite-K1TOS1-K1TOJ1-1600x900-1.jpg",
    },
    {
      id: 2,
      title: "Unleash Your Potential",
      subtitle: "Limitless Possibilities",
      description:
        "Break boundaries and explore new horizons with our premium platform designed for creators and innovators.",
      bg: "from-emerald-900 via-teal-900 to-cyan-900",
      accent: "from-emerald-400 to-cyan-400",
      image:
        "https://media.istockphoto.com/id/503016934/photo/entrance-of-luxury-hotel.jpg?s=612x612&w=0&k=20&c=DXFzucB2xWGf3PI6_yjhLKDvrFcGlOpOjXh6KDI8rqU=",
    },
    {
      id: 3,
      title: "Design Beyond Limits",
      subtitle: "Creative Excellence",
      description:
        "Where artistry meets technology - crafting experiences that inspire, engage, and captivate your audience.",
      bg: "from-rose-900 via-pink-900 to-purple-900",
      accent: "from-rose-400 to-pink-400",
      image:
        "https://digital.ihg.com/is/image/ihg/ihgor-member-rate-web-offers-1440x720?fit=crop,1&wid=1440&hei=720",
    },
  ];

  useEffect(() => {
    if (!isPlaying) return;

    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [isPlaying, slides.length]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
  };

  return (
    <div className="relative w-full h-[500px] overflow-hidden bg-black">
      {/* Background Slides */}
      <div className="absolute inset-0">
        {slides.map((slide, index) => (
          <div
            key={slide.id}
            className={`absolute inset-0 transition-all duration-1000 ease-in-out ${
              index === currentSlide
                ? "opacity-100 scale-100"
                : "opacity-0 scale-105"
            }`}
          >
            <div
              className={`w-full h-[500px] bg-gradient-to-br ${slide.bg} relative`}
            >
              {/* Background Image */}
              <img
                src={slide.image}
                alt={slide.title}
                className="absolute inset-0 w-full h-full object-fill"
              />

              {/* Gradient Overlay */}
              <div
                className={`absolute inset-0 bg-gradient-to-br ${slide.bg} opacity-40`}
              />

              {/* Animated Background Pattern */}
              <div className="absolute inset-0 opacity-10">
                <div className="absolute top-0 left-0 w-96 h-96 bg-white rounded-full mix-blend-overlay filter blur-xl animate-pulse"></div>
                <div
                  className="absolute top-1/2 right-0 w-80 h-80 bg-white rounded-full mix-blend-overlay filter blur-xl animate-pulse"
                  style={{ animationDelay: "1s" }}
                ></div>
                <div
                  className="absolute bottom-0 left-1/3 w-72 h-72 bg-white rounded-full mix-blend-overlay filter blur-xl animate-pulse"
                  style={{ animationDelay: "2s" }}
                ></div>
              </div>

              {/* Glassmorphism Overlay */}
              <div className="absolute inset-0 bg-black/10"></div>
            </div>
          </div>
        ))}
      </div>

      {/* Content */}
      <div className="relative z-10 flex items-center justify-center h-[500px] px-8">
        <div className="text-center max-w-4xl mx-auto">
          {slides.map((slide, index) => (
            <div
              key={slide.id}
              className={`transition-all duration-700 ease-out ${
                index === currentSlide
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-8"
              }`}
              style={{ display: index === currentSlide ? "block" : "none" }}
            >
              {/* Subtitle */}
              <div
                className={`inline-block px-6 py-2 rounded-full bg-gradient-to-r ${slide.accent} text-white text-sm font-semibold mb-6 shadow-lg backdrop-blur-sm bg-opacity-20`}
              >
                {slide.subtitle}
              </div>

              {/* Main Title */}
              <h1 className="text-4xl md:text-6xl font-black text-white mb-4 leading-tight">
                <span
                  className={`bg-gradient-to-r ${slide.accent} bg-clip-text text-transparent`}
                >
                  {slide.title.split(" ")[0]}
                </span>
                {slide.title
                  .split(" ")
                  .slice(1)
                  .map((word, i) => (
                    <span key={i} className="text-white">
                      {" "}
                      {word}
                    </span>
                  ))}
              </h1>

              {/* Description */}
              <p className="text-lg md:text-xl text-gray-200 mb-6 max-w-2xl mx-auto leading-relaxed font-light">
                {slide.description}
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
                <button
                  className={`px-8 py-4 bg-gradient-to-r ${slide.accent} text-white font-semibold rounded-full shadow-2xl transform hover:scale-105 transition-all duration-300 hover:shadow-lg backdrop-blur-sm`}
                >
                  Get Started
                </button>
                <button className="px-8 py-4 border-2 border-white/30 text-white font-semibold rounded-full backdrop-blur-sm bg-white/10 hover:bg-white/20 transition-all duration-300 transform hover:scale-105">
                  Learn More
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Navigation Controls */}
      <div className="absolute inset-y-0 left-4 flex items-center z-20">
        <button
          onClick={prevSlide}
          className="p-3 rounded-full bg-white/10 backdrop-blur-sm text-white hover:bg-white/20 transition-all duration-300 transform hover:scale-110"
        >
          <ChevronLeft size={24} />
        </button>
      </div>

      <div className="absolute inset-y-0 right-4 flex items-center z-20">
        <button
          onClick={nextSlide}
          className="p-3 rounded-full bg-white/10 backdrop-blur-sm text-white hover:bg-white/20 transition-all duration-300 transform hover:scale-110"
        >
          <ChevronRight size={24} />
        </button>
      </div>

      {/* Bottom Controls */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-20">
        <div className="flex items-center space-x-6">
          {/* Slide Indicators */}
          <div className="flex space-x-3">
            {slides.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`w-3 h-3 rounded-full transition-all duration-300 ${
                  index === currentSlide
                    ? "bg-white scale-125"
                    : "bg-white/40 hover:bg-white/70"
                }`}
              />
            ))}
          </div>

          {/* Play/Pause Button */}
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="p-2 rounded-full bg-white/10 backdrop-blur-sm text-white hover:bg-white/20 transition-all duration-300"
          >
            {isPlaying ? <Pause size={16} /> : <Play size={16} />}
          </button>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="absolute bottom-0 left-0 w-full h-1 bg-white/20 z-20">
        <div
          className="h-full bg-gradient-to-r from-pink-500 to-violet-500 transition-all duration-300"
          style={{
            width: `${((currentSlide + 1) / slides.length) * 100}%`,
          }}
        />
      </div>
    </div>
  );
};

export default Banner;
