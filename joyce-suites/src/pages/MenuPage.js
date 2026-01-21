import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Wifi, Shield, Droplets, Car, Calendar, MapPin,
    Phone, Mail, ArrowRight, Star, Menu, X, CheckCircle,
    Instagram, Facebook, Twitter, MessageSquare, Camera
} from 'lucide-react';


import heroBg from '../assets/image13.jpg';
import logo from '../assets/image1.png';
import gallery1 from '../assets/image11.jpg';
import gallery2 from '../assets/image12.jpg';
import gallery3 from '../assets/image15.jpg';
import gallery4 from '../assets/image16.jpg';
import gallery5 from '../assets/image17.jpg';
import gallery6 from '../assets/image20.jpg';
import gallery7 from '../assets/image21.jpg';
import gallery8 from '../assets/image22.jpg';
import gallery9 from '../assets/image10.jpg';
import gallery10 from '../assets/image9.jpg';
import gallery11 from '../assets/image18.jpg';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'https://joyce-suites-xdkp.onrender.com';

const MenuPage = () => {
    const navigate = useNavigate();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [availableRooms, setAvailableRooms] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isVisible, setIsVisible] = useState(false);
    const [activeTab, setActiveTab] = useState('all');
    const [nextAvailableDate, setNextAvailableDate] = useState(null);
    const [adClipIndex, setAdClipIndex] = useState(0);
    const scrollRef = useRef(null);


    const [inquiryForm, setInquiryForm] = useState({
        name: '',
        email: '',
        phone: '',
        message: ''
    });
    const [sendingInquiry, setSendingInquiry] = useState(false);
    const [inquiryStatus, setInquiryStatus] = useState(null);
    const [fetchError, setFetchError] = useState(null);


    const [showAuthSelection, setShowAuthSelection] = useState(false);

    const [showBookingModal, setShowBookingModal] = useState(false);
    const [bookingForm, setBookingForm] = useState({
        name: '',
        email: '',
        phone: '',
        houseType: 'one_bedroom',
        occupancy: 'Single',
        moveInDate: '',
        message: ''
    });



    const isAuthenticated = () => {
        const token = localStorage.getItem('joyce-suites-token');
        return !!token;
    };


    const handleAuthNavigation = () => {
        setShowAuthSelection(true);
    };


    const handleBookingAction = () => {
        if (isAuthenticated()) {
            navigate('/tenant-dashboard');
        } else {
            setShowBookingModal(true);
        }
    };

    const handleBookingSubmit = async (e) => {
        e.preventDefault();
        setSendingInquiry(true);
        setInquiryStatus(null);

        const messageBody = `BOOKING QUESTIONNAIRE:
        Type: ${bookingForm.houseType}
        Occupancy: ${bookingForm.occupancy || 'Single'}
        Date: ${bookingForm.moveInDate}
        Name: ${bookingForm.name}
        Phone: ${bookingForm.phone}
        Email: ${bookingForm.email}
        
        Additional Notes: ${bookingForm.message}`;

        try {
            const response = await fetch(`${API_BASE_URL}/api/auth/inquiry`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: bookingForm.name,
                    email: bookingForm.email,
                    phone: bookingForm.phone,
                    message: messageBody,
                    subject: 'BOOKING REQUEST'
                })
            });

            const data = await response.json();
            if (response.ok) {
                setInquiryStatus({
                    type: 'success',
                    message: 'Booking request sent! Once processed, you will be directed to register.'
                });
                setBookingForm({
                    name: '', email: '', phone: '', houseType: 'one_bedroom',
                    occupancy: 'Single', moveInDate: '', message: ''
                });

                setTimeout(() => {
                    setShowBookingModal(false);
                    navigate('/register-tenant');
                }, 3000);
            } else {
                throw new Error(data.error || 'Failed to send booking request');
            }
        } catch (error) {
            setInquiryStatus({ type: 'error', message: error.message });
        } finally {
            setSendingInquiry(false);
        }
    };


    useEffect(() => {
        const fetchRooms = async () => {
            try {

                const response = await fetch(`${API_BASE_URL}/api/caretaker/rooms/public`);

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status} `);
                }

                const data = await response.json();
                if (data.success) {
                    setAvailableRooms(data.rooms || []);
                    if (data.next_available_date) {
                        setNextAvailableDate(data.next_available_date);
                    }
                } else {
                    console.error('Room fetch returned unsuccessful:', data);
                    setFetchError('Failed to load available rooms.');
                }
            } catch (error) {
                console.error('Error fetching rooms:', error);
                setFetchError('Connection error. Please check your internet or try again.');
            } finally {
                setLoading(false);
            }
        };

        fetchRooms();


        const toggleVisibility = () => {
            if (window.pageYOffset > 300) {
                setIsVisible(true);
            } else {
                setIsVisible(false);
            }
        };

        window.addEventListener('scroll', toggleVisibility);
        return () => window.removeEventListener('scroll', toggleVisibility);
    }, []);

    const handleScroll = (direction) => {
        const { current } = scrollRef;
        if (current) {
            const scrollAmount = direction === 'left' ? -300 : 300;
            current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
        }
    };

    const handleJoinWaitlist = () => {
        setInquiryForm(prev => ({
            ...prev,
            message: "I am interested in joining the waiting list for the next available unit. Please notify me when a vacancy arises."
        }));
        document.getElementById('contact').scrollIntoView({ behavior: 'smooth' });
    };

    const handleInquirySubmit = async (e) => {
        e.preventDefault();
        setSendingInquiry(true);
        setInquiryStatus(null);
        try {
            const response = await fetch(`${API_BASE_URL}/api/auth/inquiry`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(inquiryForm),
            });
            const data = await response.json();
            if (data.success) {
                setInquiryStatus({ type: 'success', message: 'Message sent! We will contact you shortly.' });
                setInquiryForm({ name: '', email: '', phone: '', message: '' });
            } else {
                throw new Error(data.error || 'Failed to send message');
            }
        } catch (error) {
            setInquiryStatus({ type: 'error', message: error.message });
        } finally {
            setSendingInquiry(false);
        }
    };

    const galleryImages = [
        { src: gallery1, tag: 'interiors', alt: 'Living Room' },
        { src: gallery2, tag: 'interiors', alt: 'Bedroom' },
        { src: gallery3, tag: 'others', alt: 'Kitchen' },
        { src: gallery4, tag: 'interiors', alt: 'Bathroom' },
        { src: gallery5, tag: 'interiors', alt: 'Living Area' },
        { src: gallery6, tag: 'exteriors', alt: 'Exterior View' },
        { src: gallery7, tag: 'exteriors', alt: 'Balcony' },
        { src: gallery8, tag: 'others', alt: 'Amenities' },
        { src: gallery9, tag: 'exteriors', alt: 'Building Front' },
    ];


    useEffect(() => {
        const interval = setInterval(() => {
            setAdClipIndex((prev) => (prev + 1) % galleryImages.length);
        }, 4000);
        return () => clearInterval(interval);
    }, [galleryImages.length]);

    const styles = {
        container: {
            fontFamily: "'Inter', sans-serif",
            color: '#1f2937',
            overflowX: 'hidden',
        },

        nav: {
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(10px)',
            zIndex: 50,
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
            padding: '1rem 2rem',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
        },
        logoContainer: {
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            fontSize: '1.25rem',
            fontWeight: '700',
            color: '#111827',
            textDecoration: 'none',
        },
        logoImg: {
            height: '40px',
            width: 'auto',
        },
        navLinks: {
            display: 'none',
            gap: '2rem',
            alignItems: 'center',
            '@media (min-width: 768px)': {
                display: 'flex',
            },
        },
        link: {
            color: '#4b5563',
            textDecoration: 'none',
            fontWeight: '500',
            transition: 'color 0.2s',
            cursor: 'pointer',
        },
        primaryBtn: {
            backgroundColor: '#f59e0b',
            color: '#ffffff',
            padding: '0.75rem 1.5rem',
            borderRadius: '9999px',
            border: 'none',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'all 0.3s',
            boxShadow: '0 4px 14px 0 rgba(245, 158, 11, 0.39)',
        },

        hero: {
            position: 'relative',
            height: '100vh',
            minHeight: '600px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.5)), url(${heroBg})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            color: 'white',
            textAlign: 'center',
            padding: '0 1rem',
            animation: 'fadeIn 1.5s ease-out'
        },
        heroContent: {
            maxWidth: '800px',
            zIndex: 10,
        },
        heroTitle: {
            fontSize: '3.5rem',
            fontWeight: '800',
            marginBottom: '1.5rem',
            lineHeight: '1.1',
            textShadow: '0 2px 4px rgba(0,0,0,0.3)',
            animation: 'slideUp 1s ease-out'
        },
        heroSubtitle: {
            fontSize: '1.25rem',
            maxWidth: '600px',
            margin: '0 auto 2.5rem',
            color: '#f3f4f6',
            animation: 'slideUp 1s ease-out 0.3s backwards'
        },

        adBanner: {
            position: 'absolute',
            top: '100px',
            right: '-10px',
            backgroundColor: '#d97706',
            color: 'white',
            padding: '0.5rem 1.5rem',
            transform: 'rotate(3deg)',
            boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
            fontWeight: 'bold',
            zIndex: 20,
            animation: 'float 3s ease-in-out infinite'
        },

        sliderContainer: {
            display: 'flex',
            gap: '2rem',
            overflowX: 'auto',
            padding: '2rem 1rem',
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
            scrollBehavior: 'smooth',
            alignItems: 'stretch'
        },
        sliderCard: {
            minWidth: '300px',
            maxWidth: '350px',
            flex: '0 0 auto',
            backgroundColor: 'white',
            borderRadius: '1rem',
            overflow: 'hidden',
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
            transition: 'transform 0.3s',
            cursor: 'pointer',
            position: 'relative'
        },
        section: {
            padding: '5rem 2rem',
            maxWidth: '1200px',
            margin: '0 auto',
        },
        sectionTitle: {
            fontSize: '2.5rem',
            fontWeight: '700',
            textAlign: 'center',
            marginBottom: '1rem',
            color: '#111827',
        },
        sectionSubtitle: {
            textAlign: 'center',
            color: '#6b7280',
            marginBottom: '3rem',
            maxWidth: '600px',
            marginLeft: 'auto',
            marginRight: 'auto',
        },
        amenitiesGrid: {
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '2rem',
            marginTop: '3rem',
        },
        amenityCard: {
            textAlign: 'center',
            padding: '2rem',
            backgroundColor: '#f9fafb',
            borderRadius: '1rem',
            transition: 'all 0.3s',
        },
        iconCircle: {
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            backgroundColor: '#fef3c7',
            color: '#d97706',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1.5rem',
        },

        adClipContainer: {
            position: 'relative',
            height: '500px',
            overflow: 'hidden',
            borderRadius: '2rem',
            margin: '4rem 0',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
        },
        adClipSlide: {
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            transition: 'opacity 1s ease-in-out, transform 8s ease-out',
        },
        adOverlay: {
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            background: 'linear-gradient(to top, rgba(0,0,0,0.8), transparent)',
            padding: '4rem 2rem 2rem',
            color: 'white',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center'
        },
        adTitle: {
            fontSize: '2.5rem',
            fontWeight: '800',
            marginBottom: '0.5rem',
            textShadow: '0 2px 4px rgba(0,0,0,0.5)',
            animation: 'slideUp 0.8s ease-out'
        },
        adSubtitle: {
            fontSize: '1.25rem',
            marginBottom: '1.5rem',
            opacity: 0.9,
            animation: 'slideUp 0.8s ease-out 0.2s backwards'
        },
        progressBar: {
            position: 'absolute',
            bottom: '0',
            left: '0',
            height: '4px',
            backgroundColor: '#f59e0b',
            transition: 'width 4s linear'
        },

        contactSection: {
            backgroundColor: '#f9fafb',
            borderRadius: '2rem',
            padding: '4rem 2rem',
            marginTop: '4rem',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '4rem'
        },
        formGroup: {
            marginBottom: '1.5rem'
        },
        input: {
            width: '100%',
            padding: '0.75rem',
            borderRadius: '0.5rem',
            border: '1px solid #d1d5db',
            marginTop: '0.5rem'
        },
        textarea: {
            width: '100%',
            padding: '0.75rem',
            borderRadius: '0.5rem',
            border: '1px solid #d1d5db',
            marginTop: '0.5rem',
            minHeight: '120px'
        },

        footer: {
            backgroundColor: '#111827',
            color: 'white',
            padding: '4rem 2rem',
            marginTop: 'auto',
        },
        footerContent: {
            maxWidth: '1200px',
            margin: '0 auto',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '3rem',
        },
        footerTitle: {
            fontSize: '1.25rem',
            fontWeight: '700',
            marginBottom: '1.5rem',
            color: '#f59e0b',
        },
        footerLink: {
            display: 'block',
            color: '#9ca3af',
            textDecoration: 'none',
            marginBottom: '0.75rem',
            transition: 'color 0.2s',
        },
        stickyCta: {
            position: 'fixed',
            bottom: '2rem',
            right: '2rem',
            backgroundColor: '#f59e0b',
            color: 'white',
            padding: '1rem 2rem',
            borderRadius: '9999px',
            fontWeight: '700',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
            border: 'none',
            cursor: 'pointer',
            zIndex: 100,
            transform: isVisible ? 'translateY(0)' : 'translateY(200%)',
            transition: 'transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
        },

        modalOverlay: {
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 1000,
            backdropFilter: 'blur(5px)'
        },
        modalContent: {
            backgroundColor: 'white',
            padding: '2rem',
            borderRadius: '1.5rem',
            width: '90%',
            maxWidth: '500px',
            maxHeight: '90vh',
            overflowY: 'auto',
            position: 'relative',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
        },
        formLabel: {
            display: 'block',
            marginBottom: '0.5rem',
            fontWeight: '600',
            color: '#374151',
            fontSize: '0.9rem'
        }
    };

    return (
        <div style={styles.container}>
            <style>
                {`
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slideUp { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
        @keyframes float { 0 % { transform: rotate(3deg) translateY(0px); } 50 % { transform: rotate(3deg) translateY(- 10px); } 100 % { transform: rotate(3deg) translateY(0px); }
    }
          .hide - scrollbar:: -webkit - scrollbar { display: none; }
          .gallery - img:hover { transform: scale(1.03); }
          .slider - card { transition: all 0.3s ease; }
          .slider - card:hover { transform: translateY(-10px) scale(1.02); box - shadow: 0 20px 25px - 5px rgba(0, 0, 0, 0.1), 0 10px 10px - 5px rgba(0, 0, 0, 0.04); }
          .nav - link:hover { color: #f59e0b!important; text - decoration: underline; }


@media(max - width: 768px) {
            .hero - title { font - size: 2.5rem!important; }
            .hero - subtitle { font - size: 1rem!important; }
            .section - padding { padding: 3rem 1rem!important; }
            .contact - grid { grid - template - columns: 1fr!important; gap: 2rem!important; }
            .ad - clip - container { height: 300px!important; margin: 2rem 0!important; }
            .footer - content { grid - template - columns: 1fr!important; gap: 2rem!important; }
            .nav - padding { padding: 1rem!important; }
}
`}
            </style>

            { }
            <nav style={styles.nav} className="nav-padding">
                <a href="#" style={styles.logoContainer}>
                    <img src={logo} alt="Joyce Suites" style={styles.logoImg} />
                    <span>JOYCE SUITES</span>
                </a>

                { }
                <div className="desktop-nav" style={{
                    display: window.innerWidth > 768 ? 'flex' : 'none',
                    gap: '2rem',
                    alignItems: 'center'
                }}>
                    <a href="#rooms" style={styles.link} className="nav-link">Rooms</a>
                    <a href="#amenities" style={styles.link} className="nav-link">Amenities</a>
                    <a href="#gallery" style={styles.link} className="nav-link">Gallery</a>
                    <a href="#contact" style={styles.link} className="nav-link">Contact</a>
                    <button style={styles.primaryBtn} onClick={handleAuthNavigation}>
                        Signup
                    </button>
                </div>

                { }
                <button
                    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                    style={{
                        display: window.innerWidth > 768 ? 'none' : 'block',
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        padding: '0.5rem'
                    }}
                >
                    {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
            </nav>

            { }
            {mobileMenuOpen && (
                <div style={{
                    position: 'fixed',
                    top: '80px',
                    left: 0,
                    right: 0,
                    backgroundColor: 'white',
                    padding: '2rem',
                    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                    zIndex: 49,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '1.5rem',
                    textAlign: 'center'
                }}>
                    <a href="#rooms" onClick={() => setMobileMenuOpen(false)} style={styles.link}>Rooms</a>
                    <a href="#amenities" onClick={() => setMobileMenuOpen(false)} style={styles.link}>Amenities</a>
                    <a href="#gallery" onClick={() => setMobileMenuOpen(false)} style={styles.link}>Gallery</a>
                    <a href="#contact" onClick={() => setMobileMenuOpen(false)} style={styles.link}>Contact</a>
                    <button style={styles.primaryBtn} onClick={() => {
                        handleAuthNavigation();
                        setMobileMenuOpen(false);
                    }}>
                        Signup
                    </button>
                </div>
            )}


            { }
            <header style={styles.hero}>
                <div style={styles.adBanner}>Now Leasing!</div>
                <div style={styles.heroContent}>
                    <h1 style={styles.heroTitle} className="hero-title">
                        Premium Living at <br />
                        <span style={{ color: '#f59e0b' }}>Joyce Suites</span>
                    </h1>
                    <p style={styles.heroSubtitle} className="hero-subtitle">
                        Experience comfort, security, and modern community living.
                    </p>
                    <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                        <button style={styles.primaryBtn} onClick={handleBookingAction}>
                            Check Availability / Book Now
                        </button>
                        <button
                            style={{ ...styles.primaryBtn, backgroundColor: 'transparent', border: '2px solid white' }}
                            onClick={() => document.getElementById('gallery').scrollIntoView()}
                        >
                            View Gallery
                        </button>
                    </div>
                </div>
            </header>

            { }
            <section id="rooms" style={styles.section} className="section-padding">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'end', marginBottom: '2rem' }}>
                    <div>
                        <h2 style={{ fontSize: '2.5rem', fontWeight: '700', marginBottom: '0.5rem' }}>Available Rooms</h2>
                        <p style={{ color: '#6b7280' }}>Live availability refreshed in real-time.</p>
                    </div>
                    <div style={{ display: 'flex', gap: '1rem' }}>
                        <button onClick={() => handleScroll('left')} style={{ padding: '0.5rem', borderRadius: '50%', border: '1px solid #e5e7eb', cursor: 'pointer' }}><ArrowRight size={20} style={{ transform: 'rotate(180deg)' }} /></button>
                        <button onClick={() => handleScroll('right')} style={{ padding: '0.5rem', borderRadius: '50%', border: '1px solid #e5e7eb', cursor: 'pointer' }}><ArrowRight size={20} /></button>
                    </div>
                </div>

                {loading ? (
                    <div style={{ textAlign: 'center', padding: '2rem' }}>Loading available rooms...</div>
                ) : fetchError ? (
                    <div style={{ textAlign: 'center', padding: '2rem', color: '#ef4444' }}>
                        <p style={{ fontWeight: 'bold' }}>{fetchError}</p>
                        <p style={{ fontSize: '0.875rem' }}>If the problem persists, please contact us directly.</p>
                    </div>
                ) : availableRooms.length > 0 ? (
                    <div ref={scrollRef} style={styles.sliderContainer} className="hide-scrollbar">
                        {availableRooms.map(room => (
                            <div key={room.id} style={styles.sliderCard} className="slider-card" onClick={() => {
                                if (isAuthenticated()) {
                                    navigate('/tenant-dashboard');
                                } else {
                                    setBookingForm(prev => ({ ...prev, houseType: room.type || 'one_bedroom' }));
                                    setShowBookingModal(true);
                                }
                            }}>
                                <div style={{ height: '200px', overflow: 'hidden' }}>
                                    <img
                                        src={gallery2}
                                        alt={room.name}
                                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                        loading="lazy"
                                    />
                                    <span style={{ position: 'absolute', top: '10px', right: '10px', backgroundColor: '#dcfce7', color: '#166534', padding: '0.25rem 0.5rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 'bold' }}>
                                        Vacant
                                    </span>
                                </div>
                                <div style={{ padding: '1.5rem' }}>
                                    <h3 style={{ fontSize: '1.25rem', fontWeight: '700', margin: 0 }}>{room.name}</h3>
                                    <p style={{ color: '#6b7280', fontSize: '0.875rem', margin: '0.5rem 0 1rem' }}>
                                        {room.description || 'Modern suite with all amenities included.'}
                                    </p>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <div style={{ color: '#f59e0b', fontWeight: '700', fontSize: '1.25rem' }}>
                                            KSh {room.rent_amount.toLocaleString()}
                                        </div>
                                        <button
                                            style={{ ...styles.primaryBtn, fontSize: '0.875rem', padding: '0.5rem 1rem' }}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                if (isAuthenticated()) {
                                                    navigate('/tenant-dashboard');
                                                } else {
                                                    setBookingForm(prev => ({ ...prev, houseType: room.type || 'one_bedroom' }));
                                                    setShowBookingModal(true);
                                                }
                                            }}
                                        >
                                            Book
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div style={{ textAlign: 'center', backgroundColor: '#f3f4f6', padding: '3rem', borderRadius: '1rem' }}>
                        <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '1rem' }}>Fully Booked</h3>
                        <p style={{ marginBottom: '0.5rem' }}>All rooms are currently occupied.</p>
                        {nextAvailableDate && (
                            <p style={{ marginBottom: '1.5rem', color: '#059669', fontWeight: '600' }}>
                                Next estimated availability: {nextAvailableDate}
                            </p>
                        )}
                        <button style={{ ...styles.primaryBtn, backgroundColor: 'white', color: '#f59e0b', border: '1px solid #f59e0b' }} onClick={handleJoinWaitlist}>
                            Join Waiting List
                        </button>
                    </div>
                )}
            </section>

            { }
            <section id="amenities" style={{ backgroundColor: '#f9fafb', padding: '5rem 2rem' }} className="section-padding">
                <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
                    <h2 style={styles.sectionTitle}>Why Choose Joyce Suites</h2>
                    <p style={styles.sectionSubtitle}>
                        Designed for your comfort and peace of mind.
                    </p>

                    <div style={styles.amenitiesGrid}>
                        {[
                            { icon: Wifi, title: "High-Speed WiFi", desc: "Reliable internet connection included." },
                            { icon: Shield, title: "24/7 Security", desc: "CCTV surveillance and secure gated access." },
                            { icon: Droplets, title: "Continuous Water", desc: "Constant water supply with backup storage." },
                            { icon: Car, title: "Secure Parking", desc: "Ample parking space for residents." },
                        ].map((item, idx) => (
                            <div key={idx} style={{ ...styles.amenityCard, backgroundColor: 'white' }}>
                                <div style={styles.iconCircle}>
                                    <item.icon size={32} />
                                </div>
                                <h3 style={{ fontWeight: '700', marginBottom: '0.5rem' }}>{item.title}</h3>
                                <p style={{ color: '#6b7280', fontSize: '0.875rem' }}>{item.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            { }
            <section id="gallery" style={styles.section} className="section-padding">
                <h2 style={styles.sectionTitle}>Experience Joyce Suites</h2>
                <p style={styles.sectionSubtitle}>Take a virtual tour of our premium amenities and living spaces.</p>

                <div style={styles.adClipContainer} className="ad-clip-container">
                    {galleryImages.map((img, index) => (
                        <div
                            key={index}
                            style={{
                                ...styles.adClipSlide,
                                backgroundImage: `url(${img.src})`,
                                opacity: index === adClipIndex ? 1 : 0,
                                transform: index === adClipIndex ? 'scale(1.1)' : 'scale(1)',
                                zIndex: index === adClipIndex ? 2 : 1
                            }}
                        />
                    ))}

                    <div style={{ ...styles.adOverlay, zIndex: 10 }}>
                        <h3 style={styles.adTitle}>
                            {adClipIndex % 3 === 0 ? "Luxury Interiors" :
                                adClipIndex % 3 === 1 ? "Secure Environment" : "Modern Amenities"}
                        </h3>
                        <p style={styles.adSubtitle}>
                            {adClipIndex % 3 === 0 ? "Designed for your ultimate comfort" :
                                adClipIndex % 3 === 1 ? "24/7 Surveillance and Gated Access" : "Everything you need, right at home"}
                        </p>
                        <button style={styles.primaryBtn} onClick={handleAuthNavigation}>
                            Book Your Stay Now
                        </button>
                    </div>

                    <div style={{
                        ...styles.progressBar,
                        width: `${((adClipIndex + 1) / galleryImages.length) * 100}% `,
                        zIndex: 20
                    }} />
                </div>
            </section>

            { }
            <section id="contact" style={styles.section} className="section-padding">
                <div style={styles.contactSection} className="contact-grid">
                    <div>
                        <h2 style={{ fontSize: '2rem', fontWeight: '800', marginBottom: '1rem' }}>Get in Touch</h2>
                        <p style={{ color: '#6b7280', marginBottom: '2rem' }}>
                            Have questions? Send us a message and our team will get back to you shortly.
                        </p>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                <div style={styles.contactBox}>
                                    <div style={{ ...styles.iconCircle, backgroundColor: '#e0f2fe' }}>
                                        <Phone size={24} style={{ color: '#0369a1' }} />
                                    </div>
                                    <div>
                                        <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>Phone</div>
                                        <div style={{ fontSize: '1.125rem', fontWeight: '600', color: '#111827' }}>0722870077</div>
                                    </div>
                                </div>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                <div style={{ backgroundColor: '#e0f2fe', padding: '0.75rem', borderRadius: '50%', color: '#0284c7' }}>
                                    <Mail size={20} />
                                </div>
                                <div>
                                    <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>Email</div>
                                    <div style={{ fontWeight: '600' }}>joycesuites@gmail.com</div>
                                </div>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                <div style={{ backgroundColor: '#e0f2fe', padding: '0.75rem', borderRadius: '50%', color: '#0284c7' }}>
                                    <MapPin size={20} />
                                </div>
                                <div>
                                    <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>Location</div>
                                    <div style={{ fontWeight: '600' }}>Nyandarua County, Olkalou</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div style={{ backgroundColor: 'white', padding: '2rem', borderRadius: '1rem', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)' }}>
                        <h3 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '1.5rem' }}>Send Message</h3>
                        <form onSubmit={handleInquirySubmit}>
                            <div style={styles.formGroup}>
                                <label style={{ fontSize: '0.875rem', fontWeight: '500' }}>Name</label>
                                <input
                                    type="text"
                                    style={styles.input}
                                    required
                                    value={inquiryForm.name}
                                    onChange={(e) => setInquiryForm({ ...inquiryForm, name: e.target.value })}
                                />
                            </div>
                            <div style={styles.formGroup}>
                                <label style={{ fontSize: '0.875rem', fontWeight: '500' }}>Email</label>
                                <input
                                    type="email"
                                    style={styles.input}
                                    required
                                    value={inquiryForm.email}
                                    onChange={(e) => setInquiryForm({ ...inquiryForm, email: e.target.value })}
                                />
                            </div>
                            <div style={styles.formGroup}>
                                <label style={{ fontSize: '0.875rem', fontWeight: '500' }}>Phone</label>
                                <input
                                    type="tel"
                                    style={styles.input}
                                    value={inquiryForm.phone}
                                    onChange={(e) => setInquiryForm({ ...inquiryForm, phone: e.target.value })}
                                />
                            </div>
                            <div style={styles.formGroup}>
                                <label style={{ fontSize: '0.875rem', fontWeight: '500' }}>Message</label>
                                <textarea
                                    style={styles.textarea}
                                    required
                                    value={inquiryForm.message}
                                    onChange={(e) => setInquiryForm({ ...inquiryForm, message: e.target.value })}
                                ></textarea>
                            </div>

                            {inquiryStatus && (
                                <div style={{
                                    padding: '1rem',
                                    marginBottom: '1rem',
                                    borderRadius: '0.5rem',
                                    backgroundColor: inquiryStatus.type === 'success' ? '#dcfce7' : '#fee2e2',
                                    color: inquiryStatus.type === 'success' ? '#166534' : '#991b1b'
                                }}>
                                    {inquiryStatus.message}
                                </div>
                            )}

                            <button type="submit" style={{ ...styles.primaryBtn, width: '100%' }} disabled={sendingInquiry}>
                                {sendingInquiry ? 'Sending...' : 'Send Message'}
                            </button>
                        </form>
                    </div>
                </div>
            </section>

            { }
            {showBookingModal && (
                <div style={styles.modalOverlay} onClick={() => setShowBookingModal(false)}>
                    <div style={styles.modalContent} onClick={e => e.stopPropagation()}>
                        <div style={{ display: 'flex', justifyItems: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                            <h2 style={{ fontSize: '1.5rem', fontWeight: '700', flex: 1 }}>Booking Questionnaire</h2>
                            <button onClick={() => setShowBookingModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                                <X size={24} />
                            </button>
                        </div>

                        <p style={{ marginBottom: '1.5rem', color: '#6b7280', fontSize: '0.9rem' }}>
                            Please complete this brief questionnaire to help us find the perfect unit for you.
                        </p>

                        <form onSubmit={handleBookingSubmit}>
                            <h4 style={{ fontSize: '1rem', fontWeight: '600', color: '#f59e0b', margin: '1rem 0 0.5rem', borderBottom: '1px solid #eee', paddingBottom: '0.5rem' }}>Personal Information</h4>
                            <div style={styles.formGroup}>
                                <label style={styles.formLabel}>Full Name</label>
                                <input
                                    type="text"
                                    style={styles.input}
                                    required
                                    value={bookingForm.name}
                                    onChange={e => setBookingForm({ ...bookingForm, name: e.target.value })}
                                />
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                <div style={styles.formGroup}>
                                    <label style={styles.formLabel}>Phone</label>
                                    <input
                                        type="tel"
                                        style={styles.input}
                                        required
                                        value={bookingForm.phone}
                                        onChange={e => setBookingForm({ ...bookingForm, phone: e.target.value })}
                                        placeholder="0722870077"
                                    />
                                </div>
                                <div style={styles.formGroup}>
                                    <label style={styles.formLabel}>Email</label>
                                    <input
                                        type="email"
                                        style={styles.input}
                                        required
                                        value={bookingForm.email}
                                        onChange={e => setBookingForm({ ...bookingForm, email: e.target.value })}
                                        placeholder="john@example.com"
                                    />
                                </div>
                            </div>

                            <h4 style={{ fontSize: '1rem', fontWeight: '600', color: '#f59e0b', margin: '1rem 0 0.5rem', borderBottom: '1px solid #eee', paddingBottom: '0.5rem' }}>Accommodation Preferences</h4>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                <div style={styles.formGroup}>
                                    <label style={styles.formLabel}>Unit Type</label>
                                    <select
                                        style={styles.input}
                                        value={bookingForm.houseType}
                                        onChange={e => setBookingForm({ ...bookingForm, houseType: e.target.value })}
                                    >
                                        <option value="bedsitter">Bedsitter</option>
                                        <option value="one_bedroom">One Bedroom</option>
                                    </select>
                                </div>
                                <div style={styles.formGroup}>
                                    <label style={styles.formLabel}>Occupancy</label>
                                    <select
                                        style={styles.input}
                                        value={bookingForm.occupancy || 'single'}
                                        onChange={e => setBookingForm({ ...bookingForm, occupancy: e.target.value })}
                                    >
                                        <option value="single">Single</option>
                                        <option value="couple">Couple</option>
                                        <option value="family">Family</option>
                                    </select>
                                </div>
                            </div>

                            <div style={styles.formGroup}>
                                <label style={styles.formLabel}>Desired Move-in Date</label>
                                <input
                                    type="date"
                                    style={styles.input}
                                    required
                                    value={bookingForm.moveInDate}
                                    onChange={e => setBookingForm({ ...bookingForm, moveInDate: e.target.value })}
                                />
                            </div>

                            <div style={styles.formGroup}>
                                <label style={styles.formLabel}>Additional Requests / Notes</label>
                                <textarea
                                    style={styles.textarea}
                                    value={bookingForm.message}
                                    onChange={e => setBookingForm({ ...bookingForm, message: e.target.value })}
                                    placeholder="Ground floor preferred? Quiet side? Any other details?"
                                ></textarea>
                            </div>

                            {inquiryStatus && (
                                <div style={{
                                    padding: '1rem',
                                    marginBottom: '1rem',
                                    borderRadius: '0.5rem',
                                    backgroundColor: inquiryStatus.type === 'success' ? '#dcfce7' : '#fee2e2',
                                    color: inquiryStatus.type === 'success' ? '#166534' : '#991b1b'
                                }}>
                                    {inquiryStatus.message}
                                </div>
                            )}

                            <button
                                type="submit"
                                style={{ ...styles.primaryBtn, width: '100%' }}
                                disabled={sendingInquiry}
                            >
                                {sendingInquiry ? 'Sending...' : 'Send Booking Request'}
                            </button>
                        </form>
                    </div>
                </div>
            )}

            { }
            <footer style={styles.footer}>
                <div style={styles.footerContent} className="footer-content">
                    <div>
                        <h4 style={styles.footerTitle}>Joyce Suites</h4>
                        <p style={{ color: '#9ca3af', lineHeight: '1.6' }}>
                            Providing comfortable, secure, and modern living spaces in Olkalou.
                            Your home away from home.
                        </p>
                    </div>
                    <div>
                        <h4 style={styles.footerTitle}>Quick Links</h4>
                        <a href="#rooms" style={styles.footerLink}>Available Rooms</a>
                        <a href="#amenities" style={styles.footerLink}>Amenities</a>
                        <a href="#contact" style={styles.footerLink}>Contact Us</a>
                        <a href="/login" style={styles.footerLink}>Tenant Portal</a>
                        <a href="/caretaker-login" style={styles.footerLink}>Caretaker Portal</a>
                        <a href="/admin-login" style={styles.footerLink}>Admin Portal</a>
                    </div>
                    <div>
                        <h4 style={styles.footerTitle}>Contact Info</h4>
                        <p style={{ color: '#9ca3af', marginBottom: '0.5rem' }}>Nyandarua County, Olkalou</p>
                        <p style={{ color: '#9ca3af', marginBottom: '0.5rem' }}>0722870077</p>
                        <p style={{ color: '#9ca3af' }}>joycesuites@gmail.com</p>
                    </div>
                    <div>
                        <h4 style={styles.footerTitle}>Follow Us</h4>
                        <div style={{ display: 'flex', gap: '1rem' }}>
                            <a href="#" style={{ color: 'white', opacity: 0.8, transition: 'opacity 0.2s' }}><Facebook size={20} /></a>
                            <a href="#" style={{ color: 'white', opacity: 0.8, transition: 'opacity 0.2s' }}><Instagram size={20} /></a>
                            <a href="#" style={{ color: 'white', opacity: 0.8, transition: 'opacity 0.2s' }}><Twitter size={20} /></a>
                        </div>
                    </div>
                </div>
                <div style={{ textAlign: 'center', marginTop: '4rem', paddingTop: '2rem', borderTop: '1px solid #374151', color: '#6b7280', fontSize: '0.875rem' }}>
                    &copy; {new Date().getFullYear()} Joyce Suites. All rights reserved.
                </div>
            </footer>

            { }
            <button
                style={styles.stickyCta}
                onClick={handleBookingAction}
            >
                <Calendar size={20} />
                <span>Book now</span>
            </button>

            {showAuthSelection && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(0,0,0,0.5)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 2000,
                    padding: '1rem'
                }}>
                    <div style={{
                        backgroundColor: 'white',
                        padding: '2.5rem',
                        borderRadius: '1rem',
                        maxWidth: '450px',
                        width: '100%',
                        boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)',
                        textAlign: 'center'
                    }}>
                        <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem', color: '#111827' }}>Welcome to Joyce Suites</h3>
                        <p style={{ color: '#4b5563', marginBottom: '2rem' }}>Do you already have an account with us?</p>

                        <div style={{ display: 'grid', gap: '1rem' }}>
                            <button
                                style={{
                                    ...styles.primaryBtn,
                                    width: '100%',
                                    margin: '0',
                                    padding: '1rem',
                                    fontSize: '1rem'
                                }}
                                onClick={() => navigate('/login')}
                            >
                                Yes, Log me in
                            </button>
                            <button
                                style={{
                                    ...styles.secondaryBtn,
                                    width: '100%',
                                    margin: '0',
                                    padding: '1rem',
                                    fontSize: '1rem',
                                    backgroundColor: '#f3f4f6',
                                    color: '#374151',
                                    border: 'none',
                                    borderRadius: '0.5rem',
                                    cursor: 'pointer'
                                }}
                                onClick={() => navigate('/register-tenant')}
                            >
                                No, I'm new here
                            </button>
                            <button
                                style={{
                                    background: 'none',
                                    border: 'none',
                                    color: '#6b7280',
                                    marginTop: '1rem',
                                    cursor: 'pointer',
                                    fontSize: '0.875rem'
                                }}
                                onClick={() => setShowAuthSelection(false)}
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MenuPage;
