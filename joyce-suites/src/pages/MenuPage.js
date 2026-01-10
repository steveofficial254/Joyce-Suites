import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Wifi, Shield, Droplets, Car, Calendar, MapPin,
    Phone, Mail, ArrowRight, Star, Menu, X, CheckCircle,
    Instagram, Facebook, Twitter
} from 'lucide-react';

// Import assets
import heroBg from '../assets/image13.jpg'; // High quality hero
import logo from '../assets/image1.png';
import gallery1 from '../assets/image11.jpg';
import gallery2 from '../assets/image12.jpg';
import gallery3 from '../assets/image15.jpg';
import gallery4 from '../assets/image16.jpg';
import gallery5 from '../assets/image17.jpg';
import gallery6 from '../assets/image20.jpg';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'https://joyce-suites-xdkp.onrender.com';

const MenuPage = () => {
    const navigate = useNavigate();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [availableRooms, setAvailableRooms] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isVisible, setIsVisible] = useState(false); // For sticky CTA

    // Fetch live availability
    useEffect(() => {
        const fetchRooms = async () => {
            try {
                const response = await fetch(`${API_BASE_URL}/api/caretaker/rooms/public`);
                const data = await response.json();
                if (data.success) {
                    setAvailableRooms(data.rooms || []);
                }
            } catch (error) {
                console.error('Error fetching rooms:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchRooms();

        // Scroll listener for sticky CTA
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

    const styles = {
        container: {
            fontFamily: "'Inter', sans-serif",
            color: '#1f2937',
            overflowX: 'hidden',
        },
        // Navbar
        nav: {
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(10px)',
            zIndex: 50,
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
            display: 'none', // Hidden on mobile by default
            gap: '2rem',
            alignItems: 'center',
            '@media (min-width: 768px)': {
                display: 'flex',
            },
        },
        desktopNavLinks: {
            display: 'none',
            gap: '2rem',
            alignItems: 'center',
        },
        link: {
            color: '#4b5563',
            textDecoration: 'none',
            fontWeight: '500',
            transition: 'color 0.2s',
            cursor: 'pointer',
        },
        primaryBtn: {
            backgroundColor: '#f59e0b', // Amber-500
            color: '#ffffff',
            padding: '0.75rem 1.5rem',
            borderRadius: '9999px',
            border: 'none',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'all 0.3s',
            boxShadow: '0 4px 14px 0 rgba(245, 158, 11, 0.39)',
        },
        // Hero Section
        hero: {
            position: 'relative',
            height: '100vh',
            minHeight: '600px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundImage: `linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.6)), url(${heroBg})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            color: 'white',
            textAlign: 'center',
            padding: '0 1rem',
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
        },
        heroSubtitle: {
            fontSize: '1.25rem',
            maxWidth: '600px',
            margin: '0 auto 2.5rem',
            color: '#f3f4f6',
        },
        heroBtns: {
            display: 'flex',
            gap: '1rem',
            justifyContent: 'center',
            flexWrap: 'wrap',
        },
        secondaryBtn: {
            backgroundColor: 'transparent',
            border: '2px solid white',
            color: 'white',
            padding: '0.75rem 1.5rem',
            borderRadius: '9999px',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'all 0.3s',
        },
        // Room Preview
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
        grid: {
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '2rem',
        },
        roomCard: {
            backgroundColor: 'white',
            borderRadius: '1rem',
            overflow: 'hidden',
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
            transition: 'transform 0.3s',
            cursor: 'pointer',
        },
        roomCardContent: {
            padding: '1.5rem',
        },
        priceTag: {
            color: '#f59e0b',
            fontWeight: '700',
            fontSize: '1.5rem',
        },
        featureList: {
            marginTop: '1rem',
            borderTop: '1px solid #e5e7eb',
            paddingTop: '1rem',
        },
        featureItem: {
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            color: '#4b5563',
            marginBottom: '0.5rem',
        },
        // Amenities
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
            backgroundColor: '#fef3c7', // Amber-100
            color: '#d97706', // Amber-600
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1.5rem',
        },
        // Gallery
        galleryGrid: {
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
            gap: '1rem',
            padding: '1rem',
        },
        galleryImg: {
            width: '100%',
            height: '300px',
            objectFit: 'cover',
            borderRadius: '0.5rem',
            transition: 'transform 0.3s',
        },
        // Footer
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
        // Sticky CTA
        stickyCta: {
            position: 'fixed',
            bottom: '2rem',
            right: '2rem',
            backgroundColor: '#f59e0b',
            color: 'white',
            padding: '1rem 2rem',
            borderRadius: '9999px',
            fontWeight: '700',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
            border: 'none',
            cursor: 'pointer',
            zIndex: 100,
            transform: isVisible ? 'translateY(0)' : 'translateY(200%)',
            transition: 'transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
        }
    };

    return (
        <div style={styles.container}>
            {/* Navigation */}
            <nav style={styles.nav}>
                <a href="#" style={styles.logoContainer}>
                    <img src={logo} alt="Joyce Suites" style={styles.logoImg} />
                    <span>JOYCE SUITES</span>
                </a>

                {/* Desktop Nav */}
                <div className="desktop-nav" style={{
                    display: window.innerWidth > 768 ? 'flex' : 'none',
                    gap: '2rem',
                    alignItems: 'center'
                }}>
                    <a href="#rooms" style={styles.link}>Rooms</a>
                    <a href="#amenities" style={styles.link}>Amenities</a>
                    <a href="#gallery" style={styles.link}>Gallery</a>
                    <a href="#contact" style={styles.link}>Contact</a>
                    <button style={styles.primaryBtn} onClick={() => navigate('/login')}>
                        Tenant Login
                    </button>
                </div>

                {/* Mobile Menu Button */}
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

            {/* Mobile Menu Overlay */}
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
                        navigate('/login');
                        setMobileMenuOpen(false);
                    }}>
                        Tenant Login
                    </button>
                </div>
            )}

            {/* Hero Section */}
            <header style={styles.hero}>
                <div style={styles.heroContent}>
                    <h1 style={styles.heroTitle}>
                        Premium Living at <br />
                        <span style={{ color: '#f59e0b' }}>Joyce Suites</span>
                    </h1>
                    <p style={styles.heroSubtitle}>
                        Experience comfort, security, and community in our modern residential suites.
                        The perfect place to call home.
                    </p>
                    <div style={styles.heroBtns}>
                        <button style={styles.primaryBtn} onClick={() => navigate('/register-tenant')}>
                            Check Availability
                        </button>
                        <button style={styles.secondaryBtn} onClick={() => document.getElementById('gallery').scrollIntoView()}>
                            View Gallery
                        </button>
                    </div>
                </div>
            </header>

            {/* Live Availability Section */}
            <section id="rooms" style={styles.section}>
                <h2 style={styles.sectionTitle}>Available Rooms</h2>
                <p style={styles.sectionSubtitle}>
                    Live availability refreshed in real-time. Secure your spot today.
                </p>

                {loading ? (
                    <div style={{ textAlign: 'center', padding: '2rem' }}>Loading available rooms...</div>
                ) : availableRooms.length > 0 ? (
                    <div style={styles.grid}>
                        {availableRooms.map(room => (
                            <div key={room.id} style={styles.roomCard} onClick={() => navigate('/register-tenant')}>
                                <div style={{ height: '200px', overflow: 'hidden' }}>
                                    <img src={gallery2} alt={room.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                </div>
                                <div style={styles.roomCardContent}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                                        <h3 style={{ fontSize: '1.25rem', fontWeight: '700', margin: 0 }}>{room.name}</h3>
                                        <span style={{ backgroundColor: '#dcfce7', color: '#166534', padding: '0.25rem 0.5rem', borderRadius: '4px', fontSize: '0.875rem', fontWeight: 'bold' }}>
                                            Available
                                        </span>
                                    </div>
                                    <p style={{ color: '#6b7280', fontSize: '0.875rem', marginBottom: '1rem' }}>
                                        {room.description || 'Modern suite with all amenities included.'}
                                    </p>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                                        <div>
                                            <span style={{ fontSize: '0.875rem', color: '#6b7280' }}>Starting at</span>
                                            <div style={styles.priceTag}>KSh {room.rent_amount.toLocaleString()}</div>
                                            <span style={{ fontSize: '0.875rem', color: '#6b7280' }}>/month</span>
                                        </div>
                                        <button style={{ ...styles.primaryBtn, fontSize: '0.875rem', padding: '0.5rem 1rem' }}>
                                            Book Now
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div style={{ textAlign: 'center', backgroundColor: '#f3f4f6', padding: '3rem', borderRadius: '1rem' }}>
                        <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '1rem' }}>No Rooms Currently Available</h3>
                        <p style={{ marginBottom: '1.5rem' }}>We are currently fully booked. Please contact us to join the waiting list.</p>
                        <button style={{ ...styles.secondaryBtn, color: '#f59e0b', borderColor: '#f59e0b' }}>
                            Join Waitlist
                        </button>
                    </div>
                )}
            </section>

            {/* Amenities Section */}
            <section id="amenities" style={{ ...styles.section, backgroundColor: 'white' }}>
                <h2 style={styles.sectionTitle}>Why Choose Joyce Suites</h2>
                <p style={styles.sectionSubtitle}>
                    Designed for your comfort and peace of mind.
                </p>

                <div style={styles.amenitiesGrid}>
                    {[
                        { icon: Wifi, title: "High-Speed WiFi", desc: "Reliable internet connection for work and entertainment." },
                        { icon: Shield, title: "24/7 Security", desc: "CCTV surveillance and secure gated access." },
                        { icon: Droplets, title: "Continuous Water", desc: "Constant water supply with backup storage." },
                        { icon: Car, title: "Secure Parking", desc: "Ample parking space for residents and guests." },
                    ].map((item, idx) => (
                        <div key={idx} style={styles.amenityCard}>
                            <div style={styles.iconCircle}>
                                <item.icon size={32} />
                            </div>
                            <h3 style={{ fontWeight: '700', marginBottom: '0.5rem' }}>{item.title}</h3>
                            <p style={{ color: '#6b7280', fontSize: '0.875rem' }}>{item.desc}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* Gallery Section */}
            <section id="gallery" style={styles.section}>
                <h2 style={styles.sectionTitle}>Photo Gallery</h2>
                <div style={styles.galleryGrid}>
                    <img src={gallery1} alt="Interior" style={styles.galleryImg} />
                    <img src={gallery2} alt="Bedroom" style={styles.galleryImg} />
                    <img src={gallery3} alt="Kitchen" style={styles.galleryImg} />
                    <img src={gallery4} alt="Bathroom" style={styles.galleryImg} />
                    <img src={gallery5} alt="Living Area" style={styles.galleryImg} />
                    <img src={gallery6} alt="Exterior" style={styles.galleryImg} />
                </div>
            </section>

            {/* Trust Indicators / CTA */}
            <section style={{ backgroundColor: '#f59e0b', color: 'white', padding: '5rem 2rem', textAlign: 'center' }}>
                <div style={{ maxWidth: '800px', margin: '0 auto' }}>
                    <h2 style={{ fontSize: '2.5rem', fontWeight: '800', marginBottom: '1.5rem' }}>
                        Ready to Move In?
                    </h2>
                    <p style={{ fontSize: '1.25rem', marginBottom: '2.5rem', opacity: 0.9 }}>
                        Join our community of happy residents today. Simple application process, instant approval.
                    </p>
                    <button
                        style={{
                            backgroundColor: 'white',
                            color: '#f59e0b',
                            padding: '1rem 2.5rem',
                            fontSize: '1.125rem',
                            fontWeight: '700',
                            borderRadius: '9999px',
                            border: 'none',
                            cursor: 'pointer',
                            boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                        }}
                        onClick={() => navigate('/register-tenant')}
                    >
                        Apply Now
                    </button>
                </div>
            </section>

            {/* Footer */}
            <footer id="contact" style={styles.footer}>
                <div style={styles.footerContent}>
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
                            <img src={logo} alt="JS" style={{ height: '32px' }} />
                            <span style={{ fontSize: '1.25rem', fontWeight: '700' }}>Joyce Suites</span>
                        </div>
                        <p style={{ color: '#9ca3af', lineHeight: '1.6' }}>
                            Premium residential suites offering comfort, security, and modern amenities in a serene environment.
                        </p>
                    </div>

                    <div>
                        <h4 style={styles.footerTitle}>Quick Links</h4>
                        <a href="#rooms" style={styles.footerLink}>Available Rooms</a>
                        <a href="#amenities" style={styles.footerLink}>Amenities</a>
                        <a href="/login" style={styles.footerLink}>Tenant Portal</a>
                        <a href="/caretaker-login" style={styles.footerLink}>Staff Admin</a>
                    </div>

                    <div>
                        <h4 style={styles.footerTitle}>Contact Us</h4>
                        <a href="tel:+254700000000" style={{ ...styles.footerLink, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <Phone size={18} /> +254 700 000 000
                        </a>
                        <a href="mailto:info@joycesuites.com" style={{ ...styles.footerLink, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <Mail size={18} /> info@joycesuites.com
                        </a>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#9ca3af', marginTop: '1rem' }}>
                            <MapPin size={18} /> Nairobi, Kenya
                        </div>
                    </div>
                </div>
                <div style={{ borderTop: '1px solid #374151', marginTop: '4rem', paddingTop: '2rem', textAlign: 'center', color: '#6b7280' }}>
                    &copy; {new Date().getFullYear()} Joyce Suites. All rights reserved.
                </div>
            </footer>

            {/* Sticky CTA */}
            <button
                style={styles.stickyCta}
                onClick={() => navigate('/register-tenant')}
            >
                <Calendar size={20} />
                <span>Book Viewing</span>
            </button>
        </div>
    );
};

export default MenuPage;
