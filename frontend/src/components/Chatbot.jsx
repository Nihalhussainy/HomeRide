import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { FiMessageSquare, FiX, FiSend, FiLoader } from 'react-icons/fi';
import './Chatbot.css';

function Chatbot() {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        { sender: 'bot', text: "Hello! 👋 I'm GOGO, your HomeRide assistant. How can I help?" }
    ]);
    const [inputValue, setInputValue] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef(null);
    const navigate = useNavigate();

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        if (isOpen) {
            scrollToBottom();
        }
    }, [messages, isOpen]);

    const toggleChat = () => {
        setIsOpen(!isOpen);
    };

    const handleInputChange = (event) => {
        setInputValue(event.target.value);
    };

    const getEmailFromToken = (token) => {
        try {
            const base64Url = token.split('.')[1];
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            const jsonPayload = decodeURIComponent(atob(base64).split('').map((c) => {
                return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
            }).join(''));
            const decoded = JSON.parse(jsonPayload);
            return decoded.email || decoded.sub || decoded.username || null;
        } catch (e) {
            console.error('Error decoding token:', e);
            return null;
        }
    };

    const handleContactClick = () => {
        navigate('/contact');
        setIsOpen(false);
    };

    const handleSendMessage = async (event) => {
        event.preventDefault();
        const userMessage = inputValue.trim();
        if (!userMessage) return;

        setMessages(prev => [...prev, { sender: 'user', text: userMessage }]);
        setInputValue('');
        setIsLoading(true);

        const token = localStorage.getItem('token');
        let userEmail = localStorage.getItem('userEmail');

        if (!token) {
            setMessages(prev => [...prev, { sender: 'bot', text: "It seems you're not logged in. Please log in to use the chat." }]);
            setIsLoading(false);
            return;
        }

        if (!userEmail) {
            userEmail = getEmailFromToken(token);
        }

        if (!userEmail) {
            setMessages(prev => [...prev, { sender: 'bot', text: "Unable to identify user. Please log in again." }]);
            setIsLoading(false);
            return;
        }

        try {
            const response = await axios.post(
                'http://localhost:8080/api/chatbot/message',
                { 
                    message: userMessage,
                    userEmail: userEmail
                },
                { headers: { 'Authorization': `Bearer ${token}` } }
            );

            const botReply = response.data.reply;
            setMessages(prev => [...prev, { 
                sender: 'bot', 
                text: botReply, 
                isContactMessage: botReply.includes('Contact Page') 
            }]);

        } catch (error) {
            console.error("Error sending message to chatbot API:", error);
            setMessages(prev => [...prev, { sender: 'bot', text: "Sorry, I couldn't connect to my brain right now. Please try again later." }]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="chatbot-container">
            {!isOpen && (
                <button className="chatbot-toggle-button" onClick={toggleChat} aria-label="Open Chat">
                    <FiMessageSquare size={28} />
                </button>
            )}

            {isOpen && (
                <div className="chatbot-window">
                    <div className="chatbot-header">
                        <h2>GOGO Assistant</h2>
                        <button onClick={toggleChat} aria-label="Close Chat">
                            <FiX size={20} />
                        </button>
                    </div>

                    <div className="chatbot-messages">
                        {messages.map((msg, index) => (
                            <React.Fragment key={index}>
                                <div className={`message ${msg.sender}`}>
                                    <p>{msg.text}</p>
                                </div>
                                {msg.isContactMessage && (
                                    <button 
                                        className="contact-page-button"
                                        onClick={handleContactClick}
                                    >
                                        Go to Contact Page
                                    </button>
                                )}
                            </React.Fragment>
                        ))}
                        {isLoading && (
                            <div className="message bot loading">
                                <FiLoader className="spin" />
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    <form className="chatbot-input-form" onSubmit={handleSendMessage}>
                        <input
                            type="text"
                            value={inputValue}
                            onChange={handleInputChange}
                            placeholder="Ask GOGO..."
                            aria-label="Chat input"
                            disabled={isLoading}
                        />
                        <button type="submit" disabled={isLoading || !inputValue.trim()} aria-label="Send Message">
                            <FiSend size={18} />
                        </button>
                    </form>
                </div>
            )}
        </div>
    );
}

export default Chatbot;