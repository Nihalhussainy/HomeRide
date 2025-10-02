import React, { useState } from 'react';
import '../StaticPages.css';
import Input from '../components/Input.jsx';
import Button from '../components/Button.jsx';
import { FiMail, FiPhone, FiMapPin, FiSend } from 'react-icons/fi';
import { useNotification } from '../context/NotificationContext.jsx';


function ContactPage() {
    const { showNotification } = useNotification();
    const [formData, setFormData] = useState({ name: '', email: '', message: '' });

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        // NOTE: This is a front-end simulation. A real form would
        // need a backend API to send an email.
        console.log("Form submitted:", formData);
        showNotification("Thank you for your message! We'll get back to you soon.");
        setFormData({ name: '', email: '', message: '' }); // Reset form
    };


  return (
    <div className="main-container">
      <header className="page-header">
        <h1>Get In Touch</h1>
        <p className="page-description">We're here to help. Reach out to us with any questions or feedback.</p>
      </header>

      <div className="contact-grid">
        <div className="contact-info">
          <h3>Contact Information</h3>
          <p>Fill out the form and our team will get back to you within 24 hours.</p>
          
          <ul className="contact-details-list">
            <li>
                <FiMail className="contact-icon" />
                {/* REPLACE THIS WITH YOUR EMAIL */}
                <a href="mailto:support@homeride.com">support@homeride.com</a>
            </li>
            <li>
                <FiPhone className="contact-icon" />
                {/* REPLACE THIS WITH YOUR PHONE NUMBER */}
                <span>+91 123 456 7890</span>
            </li>
            <li>
                <FiMapPin className="contact-icon" />
                {/* REPLACE THIS WITH YOUR ADDRESS */}
                <span>India</span>
            </li>
          </ul>
        </div>

        <div className="contact-form-container">
            <form onSubmit={handleSubmit} className="contact-form">
                <Input
                    type="text"
                    name="name"
                    placeholder="Your Name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                />
                <Input
                    type="email"
                    name="email"
                    placeholder="Your Email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                />
                <textarea
                    name="message"
                    className="custom-input"
                    placeholder="Your Message"
                    rows="6"
                    value={formData.message}
                    onChange={handleInputChange}
                    required
                ></textarea>
                <Button type="submit">
                    <FiSend /> Send Message
                </Button>
            </form>
        </div>
      </div>
    </div>
  );
}

export default ContactPage;