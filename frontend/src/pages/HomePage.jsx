import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  FiSearch,
  FiShield,
  FiUsers,
  FiThumbsUp,
  FiArrowRight,
  FiDollarSign,
  FiTrendingDown,
  FiClock,
  FiHeart,
  FiMapPin,
  FiCalendar,
} from "react-icons/fi";

import Button from "../components/Button.jsx";
import "./HomePage.css";

import heroVideo from "../assets/hero-background.mp4";

function HomePage() {
  const navigate = useNavigate();
  const [activeTestimonial, setActiveTestimonial] = useState(0);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const videoRef = useRef(null); // Ref for manual looping

  const heroImages = [
    "https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?q=80&w=2070&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1531403009284-440f080d1e12?q=80&w=2070&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1464219789935-c2d9d9aba644?q=80&w=2070&auto=format&fit=crop",
  ];

  // Smooth manual video looping effect
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleVideoEnd = () => {
      video.currentTime = 0;
      video.play();
    };

    video.addEventListener("ended", handleVideoEnd);
    return () => video.removeEventListener("ended", handleVideoEnd);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) => (prevIndex + 1) % heroImages.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [heroImages.length]);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 6000);
    return () => clearInterval(interval);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    const origin = e.target.elements.origin.value;
    const destination = e.target.elements.destination.value;
    const date = e.target.elements.date.value;
    navigate(
      `search?origin=${encodeURIComponent(
        origin
      )}&destination=${encodeURIComponent(destination)}&travelDateTime=${date}`
    );
  };

  const testimonials = [
    {
      name: "Priya S.",
      role: "Marketing Department",
      text: "Using HomeRide has been a game-changer. I've met so many people from other teams that I'd never have interacted with otherwise. Plus, I'm saving a fortune on petrol!",
      rating: 5,
      avatar:
        "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop",
    },
    {
      name: "Rohan M.",
      role: "Software Engineer",
      text: "As a new joiner, finding a ride was daunting. HomeRide made it so simple and safe. My driver, a senior developer, even gave me tips for my first week!",
      rating: 5,
      avatar:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop",
    },
    {
      name: "Sarah Johnson",
      role: "Marketing Manager",
      text: "HomeRide has completely transformed my daily commute. I've saved over $200 monthly and made amazing friends along the way!",
      rating: 5,
      avatar:
        "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop",
    },
    {
      name: "Michael Chen",
      role: "Software Engineer",
      text: "The convenience of carpooling with colleagues is unmatched. No more stress about parking, and I actually look forward to my commute now.",
      rating: 5,
      avatar:
        "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop",
    },
  ];

  return (
    <div className="homepage-container">
      {/* Hero Section with manually looped video */}
      <section className="hero-section">
        <video
          ref={videoRef}
          autoPlay
          muted
          playsInline
          className="hero-video"
        >
          <source src={heroVideo} type="video/mp4" />
          Your browser does not support the video tag.
        </video>
        <div className="hero-overlay"></div>
        <div className="hero-content">
          <h1 className="hero-title">Your Daily Commute, Reimagined</h1>
          <p className="hero-subtitle">
            Turn every journey into savings, connections, and a greener tomorrow
            with trusted colleagues.
          </p>
          <form className="hero-search-form" onSubmit={handleSearch}>
            <div className="search-input-wrapper">
              <FiMapPin className="input-icon" />
              <input
                type="text"
                name="origin"
                placeholder="Leaving from"
                className="hero-search-input"
                required
              />
            </div>
            <div className="search-input-wrapper">
              <FiMapPin className="input-icon" />
              <input
                type="text"
                name="destination"
                placeholder="Going to"
                className="hero-search-input"
                required
              />
            </div>
            <div className="search-input-wrapper">
              <FiCalendar className="input-icon" />
              <input type="date" name="date" className="hero-search-input date" />
            </div>
            <Button type="submit" className="search-button">
              <FiSearch /> Search Rides
            </Button>
          </form>
        </div>
        <div className="hero-scroll-indicator">
          <div className="scroll-arrow"></div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <div className="feature-card" data-aos="fade-up">
          <div className="feature-icon-wrapper">
            <FiShield size={40} className="feature-icon" />
          </div>
          <h3>Trust Who You Travel With</h3>
          <p>
            Connect exclusively with verified employees from our company. Profiles
            and ride history provide complete peace of mind.
          </p>
        </div>
        <div className="feature-card" data-aos="fade-up" data-aos-delay="100">
          <div className="feature-icon-wrapper">
            <FiUsers size={40} className="feature-icon" />
          </div>
          <h3>Powered by Community</h3>
          <p>
            Join a network of colleagues helping each other get to work and
            back home, reducing costs and environmental impact together.
          </p>
        </div>
        <div className="feature-card" data-aos="fade-up" data-aos-delay="200">
          <div className="feature-icon-wrapper">
            <FiThumbsUp size={40} className="feature-icon" />
          </div>
          <h3>Simple & Seamless</h3>
          <p>
            Our easy-to-use platform makes finding or offering a ride a breeze.
            Book your seat or fill your car in just a few clicks.
          </p>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="benefits-section">
        <h2>Why Choose HomeRide?</h2>
        <div className="benefits-grid">
          <div className="benefit-card">
            <div className="benefit-icon-wrapper green">
              <FiDollarSign size={32} />
            </div>
            <h3>Save Money</h3>
            <p>
              Cut your commuting costs by up to 75%. Share fuel expenses and reduce
              parking fees significantly.
            </p>
          </div>
          <div className="benefit-card">
            <div className="benefit-icon-wrapper blue">
              <FiTrendingDown
                size={32}
                style={{
                  transform: "rotate(180deg)",
                }}
              />
            </div>
            <h3>Reduce Carbon Footprint</h3>
            <p>
              Make a positive environmental impact. Each shared ride reduces CO2
              emissions by an average of 2.5kg per trip.
            </p>
          </div>
          <div className="benefit-card">
            <div className="benefit-icon-wrapper purple">
              <FiClock size={32} />
            </div>
            <h3>Save Time</h3>
            <p>
              Use HOV lanes in many cities and reduce your commute time. Plus, make
              productive use of travel time as a passenger.
            </p>
          </div>
          <div className="benefit-card">
            <div className="benefit-icon-wrapper orange">
              <FiHeart size={32} />
            </div>
            <h3>Build Connections</h3>
            <p>
              Transform boring commutes into networking opportunities. Strengthen
              workplace relationships on the road.
            </p>
          </div>
        </div>

        {/* Redesigned CTA Section with image */}
        <section className="inline-cta-box enhanced-cta">
          <div className="cta-img-wrapper">
            <img
              src="https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?w=800&h=600&fit=crop"
              alt="Commute inspiration"
              className="cta-img"
            />
            <div className="cta-img-gradient"></div>
          </div>
          <div className="cta-message-section">
            <h2>
                Driving in your own car ? <span className="emphasize"></span> 
            </h2>
            <p>
              Make your commute more affordable and enjoyable.
              <br />
              <span className="emphasize">Offer your empty seats</span> to
              colleagues and start saving on travel costs today! 
            </p>
            <Button
              onClick={() => navigate("dashboard")}
              className="cta-inline-button"
            >
              Offer a Ride <FiArrowRight />
            </Button>
          </div>
        </section>
      </section>

      {/* How It Works Section */}
      <section className="how-it-works-section">
        <h2>How HomeRide Works</h2>
        <div className="steps-container">
          <div className="step">
            <div className="step-image">
              <img
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuCfc69qzWMfcUDAwhMRwAOfHGlOdYLJ53mnnIeYoXb7Z-_Rsc5N9yPIlljr6cAL-Qj8ULlNaLcJ036QAp3zXPfjaBz0i-7XSc61M6cyusB9OlfbPS-JgGU13WouzaWCezHwZGwNwp7e3CsIrjMS0v0dI88WOvXgUSYJzNjYz9zmkimn9PmtQWbhhxmWMLmcujdMlsvByUYlSOQwZB87HJNovA49GYUctQyTpu7y5wzmA9Shgpi1uZqW0-C_kAyi12VcFj0j3CwpaY6C"
                alt="Search for rides"
              />
              <div className="step-image-overlay"></div>
            </div>
            <div className="step-number">1</div>
            <div className="step-content">
              <h3>Find or Offer a Ride</h3>
              <p>
                Log in with your company credentials and either search for a ride to
                your destination or post your own trip if you're driving.
              </p>
            </div>
          </div>
          <div className="step">
            <div className="step-image">
              <img
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuCdaytJ6qw6v0TblzjYMBVGXImt5g3cMdgDfWP9-HY3A8m3_VybksBMgrG0PwmyGwHTCVZEm6enoFOy8_4hSaUjRdNDVshCbQRVCdsBqTENa2idaqw2zyHQwll8eVOAHVzVgPDugMkJHiauhExpWponpL5hypnEooaS6opdkRgeA3V8npiCStW51oMuf1_ZgzxTpUMHR-wssokndwJRgTvvG3v0nRNmozrDAWKsgU3kXkFf8OQ4Y_7fLj3058SzP-Bs6YLmkHODqYhe"
                alt="Connect with colleagues"
              />
              <div className="step-image-overlay"></div>
            </div>
            <div className="step-number">2</div>
            <div className="step-content">
              <h3>Connect with Colleagues</h3>
              <p>
                Browse available rides, view profiles of your colleagues, and book a
                seat. Drivers can accept requests from trusted coworkers.
              </p>
            </div>
          </div>
          <div className="step">
            <div className="step-image">
              <img
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuDwBG1RpQ-lKYpgdo8117Q78nvFPJc563Ec1gutSG2ATdGDDkA3cJGKcVzEii2WqV1CPt6O_94c25pe707-Nx8-8MlZm18xUZ84MpaR6EpLYD1WAI4sEnhoRE_LKSP3CdIDaHngTl3P9ak4Ko9YAl8c8aGSAl6UMFWekqnxRTuW-yqJEuNIhLQPx2spdlC9S0jFKindOqdDsqHLNtFle2L_lyVNRx9MDStMdkL7f36bONxlyv9KqtYfYC-SIhtVpflTwZp8CrXZp_je
"
                alt="Travel together"
              />
              <div className="step-image-overlay"></div>
            </div>
            <div className="step-number">3</div>
            <div className="step-content">
              <h3>Travel & Save</h3>
              <p>
                Meet up and enjoy a comfortable and safe journey together. Split
                costs, reduce your carbon footprint, and build connections.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Statistics Section */}
      <section className="stats-section">
        <div className="stat-item">
          <div className="stat-number">2,500</div>
          <div className="stat-label">Active Users</div>
        </div>
        <div className="stat-item">
          <div className="stat-number">10,000</div>
          <div className="stat-label">Rides Completed</div>
        </div>
        <div className="stat-item">
          <div className="stat-number">450K</div>
          <div className="stat-label">Saved by Employees</div>
        </div>
        <div className="stat-item">
          <div className="stat-number">25 Tons</div>
          <div className="stat-label">CO2 Reduced</div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="testimonials-section">
        <h2>Community Voices</h2>
        <div className="testimonials-grid">
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              className={`testimonial-card-modern ${
                index === activeTestimonial ? "active" : ""
              }`}
            >
              <div className="testimonial-quote-icon"></div>
              <p className="testimonial-text-modern">{testimonial.text}</p>
              <div className="testimonial-author-modern">
                <img
                  src={testimonial.avatar}
                  alt={testimonial.name}
                  className="author-avatar-modern"
                />
                <div className="author-info-modern">
                  <div className="author-name-modern">{testimonial.name}</div>
                  <div className="author-role-modern">{testimonial.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="homepage-footer">
        <div className="footer-content">
          <div className="footer-section">
            <h3>HomeRide</h3>
            <p className="footer-tagline">Making commutes better, one ride at a time</p>
          </div>
          <div className="footer-section">
            <h4>Company</h4>
            <ul className="footer-links">
              <li>
                <a href="/about">About us</a>
              </li>
              <li>
                <a href="/contact">Contact</a>
              </li>
            </ul>
          </div>
          <div className="footer-section">
            <h4>Support</h4>
            <ul className="footer-links">
              <li>
                <a href="help">Help center</a>
              </li>
              <li>
                <a href="faq">FAQ</a>
              </li>
            </ul>
          </div>
        </div>
        <div className="footer-bottom">
          <p>© {new Date().getFullYear()} HomeRide - Exclusively for Sopra Steria</p>
        </div>
      </footer>
    </div>
  );
}

export default HomePage;