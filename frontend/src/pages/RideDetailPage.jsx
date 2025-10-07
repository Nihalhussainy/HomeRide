import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Stomp } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import Button from '../components/Button.jsx';
import ChatBox from '../components/ChatBox.jsx';
import PublicProfileModal from '../components/PublicProfileModal.jsx';
import { useNotification } from '../context/NotificationContext.jsx';
import { FaUserCircle, FaCar, FaWhatsapp } from 'react-icons/fa'; 
import { FiClock, FiUsers, FiMapPin, FiArrowRight, FiCheckCircle, FiShield, FiMessageSquare, FiInfo, FiNavigation, FiPhone, FiUser, FiX } from 'react-icons/fi';
import './RideDetailPage.css';


function RideDetailPage() {
    // --- STATE AND REFS ---
    const { id } = useParams();
    const navigate = useNavigate();
    const { showNotification } = useNotification();

    const [ride, setRide] = useState(null);
    const [currentUser, setCurrentUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [isActionLoading, setIsActionLoading] = useState(false);
    const [showChatModal, setShowChatModal] = useState(false);
    const [selectedProfileId, setSelectedProfileId] = useState(null);
    const [messages, setMessages] = useState([]);
    const [stompClient, setStompClient] = useState(null);
    const [isConnected, setIsConnected] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);
    const isChatOpenRef = useRef(false);

    // --- DATA FETCHING and WEBSOCKETS ---
    const fetchData = useCallback(async () => {
        const token = localStorage.getItem('token');
        if (!token) {
            navigate('/login');
            return;
        }
        setIsLoading(true);
        try {
            const config = { headers: { Authorization: `Bearer ${token}` } };
            const [rideResponse, userResponse] = await Promise.all([
                axios.get(`http://localhost:8080/api/rides/${id}`, config),
                axios.get(`http://localhost:8080/api/employees/me`, config),
            ]);
            setRide(rideResponse.data);
            setCurrentUser(userResponse.data);
            setError('');
        } catch (err) {
            setError('Failed to load ride details. The ride may no longer exist.');
        } finally {
            setIsLoading(false);
        }
    }, [id, navigate]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    useEffect(() => {
        isChatOpenRef.current = showChatModal;
    }, [showChatModal]);

    // Derived State (calculated from component state)
    const driver = useMemo(() => (ride ? (ride.rideType === 'OFFERED' ? ride.requester : ride.driver) : null), [ride]);
    
    const allParticipants = useMemo(() => {
        if (!ride || !driver) return [];
        const participants = ride.participants.map(p => p.participant);
        participants.unshift(driver); // Driver is always a participant
        return [...new Map(participants.map(item => [item.id, item])).values()];
    }, [ride, driver]);

    const isUserInvolved = useMemo(() => {
        if (!currentUser || !allParticipants) return false;
        return allParticipants.some(p => p.id === currentUser.id);
    }, [currentUser, allParticipants]);

    useEffect(() => {
        if (!id || !currentUser || !isUserInvolved) return;

        const fetchChatHistory = async () => {
            const token = localStorage.getItem('token');
            try {
                const response = await axios.get(`http://localhost:8080/api/chat/history/${id}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                setMessages(response.data || []);
            } catch (error) { console.error('Failed to fetch chat history:', error); }
        };
        fetchChatHistory();

        const token = localStorage.getItem('token');
        const socket = new SockJS('http://localhost:8080/ws');
        const client = Stomp.over(socket);
        const headers = { Authorization: `Bearer ${token}` };

        client.connect(headers, () => {
            setIsConnected(true);
            setStompClient(client);
            client.subscribe(`/topic/ride.${id}`, (message) => {
                const receivedMessage = JSON.parse(message.body);
                setMessages(prev => {
                    if (prev.some(msg => msg.id === receivedMessage.id)) return prev;
                    if (!isChatOpenRef.current && receivedMessage.senderEmail !== currentUser.email) {
                        setUnreadCount(prevUnread => prevUnread + 1);
                    }
                    return [...prev, receivedMessage];
                });
            });
        }, () => { setIsConnected(false); });

        return () => { if (client && client.connected) client.disconnect(); };
    }, [id, currentUser, isUserInvolved]);

    // --- EVENT HANDLERS ---
    const handleContactDriver = () => {
        if (driver && driver.phoneNumber) {
            const phoneNumber = driver.phoneNumber.replace(/\D/g, '');
            const whatsappUrl = `https://wa.me/91${phoneNumber}`; // Assuming Indian numbers
            window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
        } else {
            showNotification("Driver's phone number is not available.", 'error');
        }
    };
    
    const handleBookOrJoin = async () => {
        setIsActionLoading(true);
        const token = localStorage.getItem('token');
        try {
            await axios.post(`http://localhost:8080/api/rides/${ride.id}/join`, {}, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            showNotification('Successfully joined the ride!');
            fetchData(); // Refresh data to show you've joined
        } catch (error) {
            showNotification(error.response?.data?.message || 'Failed to join ride.', 'error');
        } finally {
            setIsActionLoading(false);
        }
    };

    // --- RENDER LOGIC ---
    if (isLoading) return <div className="main-container"><p>Loading ride details...</p></div>;
    if (error) return <div className="main-container"><p className="error-message">{error}</p></div>;
    if (!ride || !currentUser || !driver) return <div className="main-container"><p>Could not load complete ride data.</p></div>;

    const isRideFull = ride.vehicleCapacity != null && ride.participants.length >= ride.vehicleCapacity;
    const formatTime = (dateTime) => new Date(dateTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
    const formatDate = (dateTime) => new Date(dateTime).toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'long' });
    const calculateArrivalTime = () => new Date(new Date(ride.travelDateTime).getTime() + (ride.duration || 0) * 60000);
    const formatDuration = (minutes) => {
        if (!minutes) return 'N/A';
        const h = Math.floor(minutes / 60);
        const m = minutes % 60;
        return h > 0 ? `${h}h ${m}m` : `${m}m`;
    };

    const renderActionButton = () => {
        if (isUserInvolved) return <div className="status-tag joined"><FiCheckCircle/> You are in this ride</div>;
        if (isRideFull) return <div className="status-tag full">Ride is full</div>;
        return <Button onClick={handleBookOrJoin} disabled={isActionLoading}>{isActionLoading ? 'Booking...' : 'Book Seat'}</Button>;
    };

    return (
        <div className="main-container ride-detail-page">
            <div className="detail-grid">
                <div className="detail-main-content">
                    <header className="page-header">
                        <h1>{ride.origin} <FiArrowRight/> {ride.destination}</h1>
                        <p className="page-description">{formatDate(ride.travelDateTime)}</p>
                    </header>

                    <div className="detail-card">
                        <h3><FiInfo /> Trip Overview</h3>
                        <div className="trip-timeline">
                            <div className="timeline-item">
                                <div className="timeline-icon-wrapper"><div className="timeline-icon origin"><FiMapPin /></div></div>
                                <div className="timeline-content"><div className="timeline-location-header"><h4>{ride.origin}</h4><span className="timeline-time">{formatTime(ride.travelDateTime)}</span></div><p className="address">{ride.origin}</p></div>
                            </div>
                            {ride.stops && ride.stops.map((stop, index) => (<div key={index} className="timeline-item"><div className="timeline-icon-wrapper"><div className="timeline-icon stop"></div></div><div className="timeline-content"><p className="address">{stop}</p></div></div>))}
                            <div className="timeline-item">
                                <div className="timeline-icon-wrapper"><div className="timeline-icon destination"><FiNavigation /></div></div>
                                <div className="timeline-content"><div className="timeline-location-header"><h4>{ride.destination}</h4><span className="timeline-time">{formatTime(calculateArrivalTime())}</span></div><p className="address">{ride.destination}</p><span className="estimated-duration"><FiClock /> Estimated duration: {formatDuration(ride.duration)}</span></div>
                            </div>
                        </div>
                        <div className="info-grid">
                            <div className="info-block"><span><FaCar />Vehicle</span><p>{ride.vehicleModel || 'N/A'}</p></div>
                            <div className="info-block"><span><FiUsers />Seats</span><p>{ride.participants.length} / {ride.vehicleCapacity || 'N/A'}</p></div>
                            <div className="info-block"><span><FiShield />Preference</span><p>{ride.genderPreference === 'FEMALE_ONLY' ? 'Female only' : 'All'}</p></div>
                            <div className="info-block"><span><FiMapPin />Distance</span><p>{ride.distance ? `${ride.distance.toFixed(1)} km` : 'N/A'}</p></div>
                        </div>
                        {ride.driverNote && <div className="driver-note-section"><h4><FiMessageSquare /> Driver's Note</h4><p>{ride.driverNote}</p></div>}
                    </div>

                    <div className="detail-card">
                        <h3><FiUsers /> Passengers ({allParticipants.length})</h3>
                        <div className="participants-grid">
                            {allParticipants.map(p => (
                                <div key={p.id} className={`participant-item ${p.id === driver.id ? 'driver-item' : ''}`} onClick={() => setSelectedProfileId(p.id)}>
                                    <div className="participant-avatar-wrapper">{p.profilePictureUrl ? <img src={p.profilePictureUrl} alt={p.name} /> : <FaUserCircle/>}</div>
                                    <div className="participant-info"><span className="name">{p.name}</span>{p.id === driver.id && <span className="badge"><FiUser /> Driver</span>}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="detail-sidebar">
                    <div className="price-card detail-card">
                        <h3>Pricing</h3>
                        <div className="price-display">
                            <span className="price-label">Price per seat</span>
                            <span className="price-value">₹{ride.price.toFixed(0)}</span>
                        </div>
                        <div className="action-button-container">{renderActionButton()}</div>
                    </div>
                    
                    {isUserInvolved && (
                        <div className="detail-card chat-card">
                            <h3><FiMessageSquare /> Ride Chat</h3>
                            <button className="open-chat-btn" onClick={() => { setShowChatModal(true); setUnreadCount(0); }}>
                                <FiMessageSquare /> Open Chat
                                {unreadCount > 0 && <span className="chat-notification-badge">{unreadCount > 9 ? '9+' : unreadCount}</span>}
                            </button>
                        </div>
                    )}

                    {driver && (
                         <div className="detail-card">
                            <h3><FaWhatsapp /> Contact Driver</h3>
                            <Button onClick={handleContactDriver} className="phone-btn" style={{width: '100%'}}>
                                <FaWhatsapp /> Contact {driver.name}
                            </Button>
                        </div>
                    )}
                </div>
            </div>

            {isUserInvolved && showChatModal && (
                <div className="chat-modal-overlay" onClick={() => setShowChatModal(false)}>
                    <div className="chat-modal-container" onClick={(e) => e.stopPropagation()}>
                        <div className="chat-modal-header">
                            <div className="chat-modal-title"><div className="ride-info-compact"><h3>{ride.origin} <FiArrowRight className="arrow-icon" /> {ride.destination}</h3></div></div>
                            <button className="chat-modal-close" onClick={() => setShowChatModal(false)}><FiX /></button>
                        </div>
                        <div className="chat-modal-body">
                            <ChatBox rideId={ride.id} currentUser={currentUser} participants={allParticipants} messages={messages} stompClient={stompClient} isConnected={isConnected} />
                        </div>
                    </div>
                </div>
            )}
            
            {selectedProfileId && <PublicProfileModal userId={selectedProfileId} onClose={() => setSelectedProfileId(null)} />}
        </div>
    );
}

export default RideDetailPage;