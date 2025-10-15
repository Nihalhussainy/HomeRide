// src/pages/OfferRidePage.jsx
import React, { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../components/Button.jsx';
import AutocompleteInput from '../components/AutocompleteInput.jsx';
import Input from '../components/Input.jsx';
import { useNotification } from '../context/NotificationContext.jsx';
import axios from 'axios';
import { FiPlus, FiMinus, FiArrowRight, FiSend, FiShield, FiMessageSquare, FiMinusCircle, FiX } from 'react-icons/fi';
import './OfferRidePage.css';

const TOTAL_STEPS = 8;

const getNowString = () => {
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    return now.toISOString().slice(0, 16);
};

// Reusable LocationStep component
const LocationStep = ({ title, placeholder, value, onChange, onContinue, onBack, searchContext }) => (
    <div className="step-content">
        <h2>{title}</h2>
        <div className="form-field">
            <AutocompleteInput
                value={value}
                onInputChange={onChange}
                onSuggestionSelect={onChange}
                placeholder={placeholder}
                searchContext={searchContext}
            />
        </div>
        <div className="form-actions">
            {onBack && <Button onClick={onBack} className="secondary">Back</Button>}
            <Button onClick={onContinue}>Continue <FiArrowRight /></Button>
        </div>
    </div>
);

function OfferRidePage() {
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
        originCity: '',
        originPoint: '',
        destinationCity: '',
        destinationPoint: '',
        stops: [], // Start with an empty array
        travelDateTime: '',
        vehicleModel: '',
        vehicleCapacity: 2,
        price: 100,
        genderPreference: 'ALL',
        driverNote: '',
        distance: 0,
        duration: 0,
        polyline: '',
    });
    const [isLoading, setIsLoading] = useState(false);
    const [stopoverPrices, setStopoverPrices] = useState([]);
    const [showStopoverModal, setShowStopoverModal] = useState(false);
    const { showNotification } = useNotification();
    const navigate = useNavigate();

    useEffect(() => {
        setStopoverPrices(prev => {
            const newArr = [...prev];
            const requiredLength = (formData.stops.filter(s => s.point).length) + 1;
            while (newArr.length < requiredLength) {
                newArr.push(50);
            }
            newArr.length = requiredLength;
            return newArr;
        });
    }, [formData.stops]);

    const handleNext = () => setStep(prev => Math.min(TOTAL_STEPS, prev + 1));
    const handleBack = () => setStep(prev => Math.max(1, prev - 1));

    const handleInputChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const fetchRouteInfo = useCallback(async () => {
        if (!formData.originPoint || !formData.destinationPoint) {
            showNotification('Please select both pickup and drop-off locations.', 'error');
            return;
        }
        
        setIsLoading(true);
        try {
            const params = new URLSearchParams({
                origin: formData.originPoint,
                destination: formData.destinationPoint,
            });
            
            if (formData.stops && formData.stops.length > 0) {
                formData.stops.forEach(stop => {
                    if (stop.point && stop.point.trim()) {
                        params.append('stops', stop.point);
                    }
                });
            }

            const response = await axios.get(`http://localhost:8080/api/rides/travel-info?${params.toString()}`);
            const { distanceInKm, durationInMinutes, polyline } = response.data;
            
            setFormData(prev => ({ 
                ...prev, 
                distance: distanceInKm, 
                duration: durationInMinutes, 
                polyline: polyline 
            }));
            
            handleNext();
        } catch (error) {
            console.error('Route info error:', error);
            showNotification("Could not calculate route. Please verify your locations.", "error");
        } finally {
            setIsLoading(false);
        }
    }, [formData.originPoint, formData.destinationPoint, formData.stops, showNotification]);
    
    // THIS FUNCTION MUST BE DEFINED HERE
    const handleSubmit = async () => {
        if (!formData.originPoint || !formData.destinationPoint || !formData.originCity || !formData.destinationCity) {
            showNotification('Please complete all location fields.', 'error');
            return;
        }

        const validStops = formData.stops.filter(stop => stop.city.trim() !== '' && stop.point.trim() !== '');
        
        const finalData = {
            originCity: formData.originCity,
            origin: formData.originPoint,
            destinationCity: formData.destinationCity,
            destination: formData.destinationPoint,
            travelDateTime: formData.travelDateTime,
            vehicleModel: formData.vehicleModel.trim(),
            vehicleCapacity: parseInt(formData.vehicleCapacity),
            price: parseFloat(formData.price),
            genderPreference: formData.genderPreference,
            driverNote: formData.driverNote.trim(),
            stops: validStops, // Send the array of objects
            stopoverPrices: stopoverPrices.filter((_, idx) => idx < validStops.length + 1),
        };

        setIsLoading(true);
        const token = localStorage.getItem('token');
        
        try {
            await axios.post('http://localhost:8080/api/rides/offer', finalData, { 
                headers: { 'Authorization': `Bearer ${token}` } 
            });
            
            showNotification('Your ride has been published successfully!', 'success');
            navigate('/dashboard');
        } catch (error) {
            console.error('Submit error:', error);
            const errorMessage = error.response?.data?.message || 
                                error.response?.data || 
                                'Failed to publish ride. Please try again.';
            showNotification(errorMessage, 'error');
        } finally {
            setIsLoading(false);
        }
    };

    const changeStopPrice = (index, delta) => {
        setStopoverPrices(prev => {
            const copy = [...prev];
            copy[index] = Math.max(0, (copy[index] || 0) + delta);
            return copy;
        });
    };
    
    const handleStopPriceChange = (index, value) => {
        const newPrice = Math.max(0, Number(value));
        setStopoverPrices(prev => {
            const copy = [...prev];
            copy[index] = newPrice;
            return copy;
        });
    };

    const renderCurrentStep = () => {
        switch (step) {
            case 1:
            case 2:
            case 3:
            case 4:
                const isOrigin = step <= 2;
                const isCityStep = step % 2 !== 0;

                const title = isCityStep 
                    ? (isOrigin ? "Which city are you leaving from?" : "Which city are you going to?")
                    : (isOrigin ? "Where is the exact pickup point?" : "Where is the exact drop-off point?");
                
                const placeholder = isCityStep 
                    ? (isOrigin ? "e.g., Nellore" : "e.g., Chennai")
                    : "Enter a specific address or landmark";

                const stateKey = isCityStep
                    ? (isOrigin ? "originCity" : "destinationCity")
                    : (isOrigin ? "originPoint" : "destinationPoint");
                
                const searchContext = !isCityStep ? (isOrigin ? formData.originCity : formData.destinationCity) : null;
                
                return (
                    <LocationStep 
                        title={title}
                        placeholder={placeholder}
                        value={formData[stateKey]} 
                        onChange={(val) => handleInputChange(stateKey, val)} 
                        searchContext={searchContext}
                        onBack={step > 1 ? handleBack : null}
                        onContinue={() => {
                            if (!formData[stateKey]) {
                                showNotification('Please enter a location.', 'error');
                                return;
                            }
                            handleNext();
                        }} 
                    />
                );

            case 5:
                const handleStopChange = (index, field, value) => {
                    const newStops = [...formData.stops];
                    newStops[index][field] = value;
                    handleInputChange('stops', newStops);
                };
                
                const handleAddStop = () => handleInputChange('stops', [...formData.stops, { city: '', point: '' }]);
                const handleRemoveStop = (index) => handleInputChange('stops', formData.stops.filter((_, i) => i !== index));
                
                return (
                    <div className="step-content">
                        <h2>Add stopovers (Optional)</h2>
                        {formData.stops.map((stop, index) => (
                            <div key={index} className="stop-input-group" style={{ flexDirection: 'column', alignItems: 'stretch', gap: '8px', border: '1px solid var(--surface-color-light)', padding: '16px', borderRadius: '12px' }}>
                                <div style={{display: 'flex', alignItems: 'center', gap: '12px'}}>
                                    <div style={{flex: 1}}>
                                        <AutocompleteInput 
                                            placeholder={`Stop ${index + 1} City`} 
                                            value={stop.city} 
                                            onInputChange={(value) => handleStopChange(index, 'city', value)}
                                            onSuggestionSelect={(value) => handleStopChange(index, 'city', value)}
                                        />
                                        <AutocompleteInput 
                                            placeholder={`Specific point in ${stop.city || 'city'}`}
                                            value={stop.point} 
                                            onInputChange={(value) => handleStopChange(index, 'point', value)}
                                            onSuggestionSelect={(value) => handleStopChange(index, 'point', value)}
                                            searchContext={stop.city}
                                            disabled={!stop.city}
                                        />
                                    </div>
                                    <button type="button" onClick={() => handleRemoveStop(index)} className="remove-stop-btn">
                                        <FiMinusCircle size={20} />
                                    </button>
                                </div>
                            </div>
                        ))}
                        <button type="button" onClick={handleAddStop} className="add-stopover-btn">
                            <FiPlus size={16} /> Add another stop
                        </button>
                        <div className="form-actions">
                            <Button onClick={handleBack} className="secondary">Back</Button>
                            <Button onClick={fetchRouteInfo} disabled={isLoading}>
                                {isLoading ? 'Calculating...' : <>Continue <FiArrowRight /></>}
                            </Button>
                        </div>
                    </div>
                );

            case 6:
                return (
                    <div className="step-content">
                        <h2>When are you going?</h2>
                        <div className="form-field">
                            <label>Date & Time</label>
                            <Input 
                                type="datetime-local" 
                                value={formData.travelDateTime} 
                                onChange={(e) => handleInputChange('travelDateTime', e.target.value)} 
                                required 
                                min={getNowString()} 
                            />
                        </div>
                        <div className="form-actions">
                            <Button onClick={handleBack} className="secondary">Back</Button>
                            <Button onClick={() => {
                                if (!formData.travelDateTime) {
                                    showNotification('Please select a date and time.', 'error');
                                    return;
                                }
                                if (new Date(formData.travelDateTime) < new Date()) {
                                    showNotification('Please select a future date and time.', 'error');
                                    return;
                                }
                                handleNext();
                            }}>
                                Continue <FiArrowRight />
                            </Button>
                        </div>
                    </div>
                );
                
            case 7:
                return (
                    <div className="step-content">
                        <h2>How many passengers can you take?</h2>
                        <div className="passenger-counter-container">
                            <button 
                                className="count-btn" 
                                onClick={() => handleInputChange('vehicleCapacity', Math.max(1, formData.vehicleCapacity - 1))} 
                                disabled={formData.vehicleCapacity <= 1}
                                type="button"
                            >
                                <FiMinus />
                            </button>
                            <div className="count-display">{formData.vehicleCapacity}</div>
                            <button 
                                className="count-btn" 
                                onClick={() => handleInputChange('vehicleCapacity', Math.min(8, formData.vehicleCapacity + 1))} 
                                disabled={formData.vehicleCapacity >= 8}
                                type="button"
                            >
                                <FiPlus />
                            </button>
                        </div>
                        <div className="form-actions">
                            <Button onClick={handleBack} className="secondary">Back</Button>
                            <Button onClick={handleNext}>Continue <FiArrowRight /></Button>
                        </div>
                    </div>
                );
                
          // Update only the case 8 section in OfferRidePage.jsx
// Replace the existing case 8 with this:

case 8:
    // Build arrays of cities only for the modal
    const routeCities = [
        formData.originCity, 
        ...formData.stops.map(s => s.city).filter(c => c), 
        formData.destinationCity
    ];
    
    return (
        <div className="step-content">
            <h2>Set your price per seat</h2>
            <div className="price-picker">
                <button 
                    className="price-adjust left" 
                    onClick={() => handleInputChange('price', Math.max(0, Number(formData.price || 0) - 10))}
                    type="button"
                >
                    <FiMinus />
                </button>
                <div className="price-display">₹{Math.round(Number(formData.price || 0))}</div>
                <button 
                    className="price-adjust right" 
                    onClick={() => handleInputChange('price', Math.round(Number(formData.price || 0) + 10))}
                    type="button"
                >
                    <FiPlus />
                </button>
            </div>

            {formData.stops.length > 0 && (
                <div className="stopover-pricing-row">
                    <button type="button" className="link-button" onClick={() => setShowStopoverModal(true)}>
                        Set stopover prices
                    </button>
                </div>
            )}

            <div className="form-field">
                <label>Vehicle Model</label>
                <Input 
                    type="text" 
                    placeholder="e.g., Toyota Camry" 
                    value={formData.vehicleModel} 
                    onChange={(e) => handleInputChange('vehicleModel', e.target.value)} 
                    required 
                />
            </div>
            
            <div className="form-field">
                <label><FiShield /> Passenger Preference</label>
                <select 
                    className="custom-input" 
                    value={formData.genderPreference} 
                    onChange={(e) => handleInputChange('genderPreference', e.target.value)} 
                    style={{ width: '100%', padding: '12px', borderRadius: '10px' }}
                >
                    <option value="ALL">All Genders Welcome</option>
                    <option value="FEMALE_ONLY">Female Passengers Only</option>
                </select>
            </div>
            
            <div className="form-field">
                <label><FiMessageSquare /> Driver's Note (Optional)</label>
                <textarea 
                    className="custom-textarea" 
                    placeholder="e.g., I prefer no smoking in the car." 
                    value={formData.driverNote} 
                    onChange={(e) => handleInputChange('driverNote', e.target.value)} 
                    rows="3"
                />
            </div>
            
            <div className="form-actions">
                <Button onClick={handleBack} className="secondary">Back</Button>
                <Button onClick={handleSubmit} disabled={isLoading}>
                    {isLoading ? 'Publishing...' : 'Publish Ride'} <FiSend />
                </Button>
            </div>
            
            {showStopoverModal && (
                <div className="modal-overlay">
                    <div className="modal-card">
                        <button className="modal-close" onClick={() => setShowStopoverModal(false)}>
                            <FiX />
                        </button>
                        <h2>Set stopover prices</h2>
                        <div className="modal-body">
                            {routeCities.slice(0, -1).map((city, idx) => (
                                <div key={idx} className="stop-row">
                                    <div className="stop-info">
                                        <div className="stop-dot-line" />
                                        <div className="stop-names">
                                            <span>{city}</span>
                                            <span>{routeCities[idx + 1]}</span>
                                        </div>
                                    </div>
                                    <div className="stop-price-controls">
                                        <button className="circle-btn" onClick={() => changeStopPrice(idx, -10)} type="button">
                                            <FiMinus />
                                        </button>
                                        <div className="stop-price-input-wrapper">
                                            <span>₹</span>
                                            <input
                                                type="number"
                                                className="stop-price-input"
                                                value={stopoverPrices[idx] || ''}
                                                onChange={(e) => handleStopPriceChange(idx, e.target.value)}
                                                min="0"
                                            />
                                        </div>
                                        <button className="circle-btn" onClick={() => changeStopPrice(idx, 10)} type="button">
                                            <FiPlus />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="modal-actions">
                            <Button onClick={() => setShowStopoverModal(false)}>Done</Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
                
            default:
                return null;
        }
    };

    return (
        <div className="offer-ride-page-container">
            <div className="form-card-container">
                <div className="progress-bar">
                    {[...Array(TOTAL_STEPS)].map((_, i) => (
                        <div key={i} className={`progress-step ${step >= i + 1 ? 'active' : ''}`}></div>
                    ))}
                </div>
                <div className="form-card">
                    {renderCurrentStep()}
                </div>
            </div>
        </div>
    );
}

export default OfferRidePage;