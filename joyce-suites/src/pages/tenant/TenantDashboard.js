import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  LogOut, Menu, X, Home, CreditCard, FileText, User as UserIcon,
  Bell, Wrench, Settings, ChevronRight, PieChart, Info,
  ExternalLink, Droplet, Calendar, LogOut as DoorOpen
} from 'lucide-react';
import SignatureCanvas from 'react-signature-canvas';
import { useAuth } from '../../context/AuthContext';
import './TenantDashboard.css';
import logo from '../../assets/image1.png';
import quickActionsBg from '../../assets/image1.png';
import config from '../../config';

import apartment1 from '../../assets/image12.jpg';
import apartment2 from '../../assets/image21.jpg';
import apartment3 from '../../assets/image22.jpg';
import apartment4 from '../../assets/image10.jpg';
import apartment5 from '../../assets/image8.jpg';
import apartment6 from '../../assets/image11.jpg';

const TenantDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const signatureRef = useRef(null);

  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState(null);
  const [profileData, setProfileData] = useState(null);
  const [paymentsData, setPaymentsData] = useState([]);
  const [vacateNotices, setVacateNotices] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [activeTab, setActiveTab] = useState('dashboard');
  const [paymentDetails, setPaymentDetails] = useState(null);
  const [loadingPaymentDetails, setLoadingPaymentDetails] = useState(false);


  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showMaintenanceModal, setShowMaintenanceModal] = useState(false);
  const [showVacateModal, setShowVacateModal] = useState(false);
  const [showLeaseModal, setShowLeaseModal] = useState(false);


  const [termsAccepted, setTermsAccepted] = useState(false);
  const [signatureEmpty, setSignatureEmpty] = useState(true);
  const [leaseData, setLeaseData] = useState(null);
  const [fullLeaseDetails, setFullLeaseDetails] = useState(null);


  const [roomDetails, setRoomDetails] = useState(null);
  const [accountDetails, setAccountDetails] = useState(null);
  const [userProfile, setUserProfile] = useState(null);


  const [mpesaPhone, setMpesaPhone] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [sidebarOpen, setSidebarOpen] = useState(!isMobile);
  const [rentRecords, setRentRecords] = useState([]);
  const [depositRecords, setDepositRecords] = useState([]);
  const [waterBillRecords, setWaterBillRecords] = useState([]);
  const [currentMonthRent, setCurrentMonthRent] = useState(null);
  const [currentDeposit, setCurrentDeposit] = useState(null);
  const [currentMonthWaterBill, setCurrentMonthWaterBill] = useState(null);
  const [maintenanceForm, setMaintenanceForm] = useState({
    title: '',
    description: '',
    priority: 'normal',
    file: null
  });
  const [vacateForm, setVacateForm] = useState({
    vacate_date: '',
    reason: ''
  });

  const apartmentImages = [apartment1, apartment2, apartment3, apartment4, apartment5, apartment6];

  const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth >= 1024);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);

  const styles = {
    container: { display: 'flex', minHeight: '100vh', backgroundColor: '#f8fafc' },
    sidebar: {
      width: '260px',
      backgroundColor: '#1f2937',
      color: 'white',
      position: 'fixed',
      height: '100vh',
      overflowY: 'auto',
      transition: 'all 0.3s ease',
      zIndex: 1000,
      display: isMobile && !sidebarOpen ? 'none' : 'block'
    },
    sidebarHeader: { padding: '24px', borderBottom: '1px solid #374151', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
    sidebarTitle: { fontSize: '20px', fontWeight: '700', margin: 0, color: '#fbbf24' },
    nav: { padding: '24px 0' },
    navItem: {
      display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 24px', color: '#d1d5db',
      textDecoration: 'none', cursor: 'pointer', border: 'none', background: 'none', width: '100%',
      textAlign: 'left', transition: 'all 0.2s', fontSize: '14px', fontWeight: '500'
    },
    navItemActive: { backgroundColor: '#374151', color: 'white', borderLeft: '4px solid #3b82f6' },
    main: {
      flex: 1, marginLeft: !isMobile && sidebarOpen ? '260px' : '0',
      transition: 'all 0.3s ease', minHeight: '100vh', display: 'flex', flexDirection: 'column'
    },
    header: {
      backgroundColor: 'white', height: '64px', padding: '0 24px', borderBottom: '1px solid #e5e7eb',
      display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, zIndex: 10
    },
    content: { padding: '32px', flex: 1 },
    card: { backgroundColor: 'white', padding: '24px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', marginBottom: '24px' },
    statGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '24px', marginBottom: '32px' },
    statCard: {
      padding: '24px', borderRadius: '12px', color: 'white', display: 'flex', flexDirection: 'column', gap: '8px',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
    }
  };


  useEffect(() => {
    const validateToken = () => {
      const token = localStorage.getItem('joyce-suites-token');
      if (!token) {
        navigate('/login');
        return false;
      }

      try {
        const tokenParts = token.split('.');
        if (tokenParts.length !== 3) {

          localStorage.removeItem('joyce-suites-token');
          navigate('/login');
          return false;
        }
      } catch (err) {
        console.error('Token validation error:', err);
        localStorage.removeItem('joyce-suites-token');
        navigate('/login');
        return false;
      }

      return true;
    };

    const handleResize = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      if (!mobile) setSidebarOpen(true);
    };

    window.addEventListener('resize', handleResize);

    if (validateToken()) {
      fetchAllData();
    }

    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % apartmentImages.length);
    }, 5000);
    return () => {
      clearInterval(interval);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const getAuthHeaders = () => {
    const token = localStorage.getItem('joyce-suites-token');

    if (!token) {
      console.error('No token found in localStorage');
      return null;
    }

    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
  };


  const fetchWithAuth = useCallback(async (url, options = {}) => {
    let token = localStorage.getItem('joyce-suites-token');

    if (!token) {
      throw new Error('No authentication token');
    }

    const headers = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      ...options.headers
    };

    try {
      const response = await fetch(url, {
        ...options,
        headers,
        credentials: 'include'
      });


      if (response.status === 401) {



        const refreshToken = localStorage.getItem('joyce-suites-refresh-token');
        if (refreshToken) {
          try {
            const refreshResponse = await fetch(`${config.apiBaseUrl}/api/auth/refresh`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${refreshToken}`
              },
              credentials: 'include'
            });

            if (refreshResponse.ok) {
              const refreshData = await refreshResponse.json();
              localStorage.setItem('joyce-suites-token', refreshData.access_token);
              if (refreshData.refresh_token) {
                localStorage.setItem('joyce-suites-refresh-token', refreshData.refresh_token);
              }


              headers.Authorization = `Bearer ${refreshData.access_token}`;
              const retryResponse = await fetch(url, {
                ...options,
                headers,
                credentials: 'include'
              });
              return retryResponse;
            }
          } catch (refreshError) {
            console.error('Token refresh failed:', refreshError);
          }
        }


        localStorage.removeItem('joyce-suites-token');
        localStorage.removeItem('joyce-suites-refresh-token');
        throw new Error('Session expired. Please login again.');
      }

      return response;
    } catch (error) {
      if (error.message === 'Session expired. Please login again.') {
        setError('Your session has expired. Please login again.');
        setTimeout(() => navigate('/login'), 2000);
      }
      throw error;
    }
  }, [navigate]);


  const calculateOutstandingBalance = () => {
    if (!dashboardData?.rent_amount || !paymentsData.length) {
      return dashboardData?.rent_amount || 0;
    }

    const totalPaid = paymentsData
      .filter(payment => payment.status === 'completed')
      .reduce((sum, payment) => sum + (payment.amount || 0), 0);

    const monthsDue = Math.max(1, Math.floor(
      (new Date() - new Date(dashboardData.lease_start_date || new Date())) /
      (30 * 24 * 60 * 60 * 1000)
    ));

    const totalDue = monthsDue * dashboardData.rent_amount;
    return Math.max(0, totalDue - totalPaid);
  };


  const getAccountDetails = (roomNumber) => {
    const roomNum = parseInt(roomNumber);

    const joyceRooms = [1, 2, 3, 4, 5, 6, 8, 9, 10];
    const lawrenceRooms = [11, 12, 13, 14, 15, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26];

    let rentAmount = 5000;
    let depositAmount = 5400;
    let roomType = 'bedsitter';

    if (!roomNum) return { rentAmount: 0, depositAmount: 0, roomType: 'N/A', landlordName: 'N/A', paybill: 'N/A', accountNumber: 'N/A' };

    if ([8, 9, 10, 17, 19, 20].includes(roomNum)) {
      rentAmount = 7500;
      depositAmount = 7900;
      roomType = 'one_bedroom';
    } else if (roomNum === 18) {
      rentAmount = 7000;
      depositAmount = 7400;
      roomType = 'one_bedroom';
    } else if ([12, 22].includes(roomNum)) {
      rentAmount = 5500;
      depositAmount = 5900;
      roomType = 'bedsitter';
    } else {
      rentAmount = 5000;
      depositAmount = 5400;
      roomType = 'bedsitter';
    }

    let landlordName = '';
    let paybill = '';
    let accountNumber = '';

    if (joyceRooms.includes(roomNum)) {
      landlordName = 'Joyce Muthoni Mathea';
      paybill = '222111';
      accountNumber = '2536316';
    } else if (lawrenceRooms.includes(roomNum)) {
      landlordName = 'Lawrence Mathea';
      paybill = '222222';
      accountNumber = '54544';
    } else {
      landlordName = 'Not Assigned';
      paybill = 'N/A';
      accountNumber = 'N/A';
    }

    return {
      roomNumber: roomNum,
      roomType,
      rentAmount,
      depositAmount,
      landlordName,
      paybill,
      accountNumber,
      fullAccountName: `${accountNumber} - ${landlordName}`
    };
  };

  const fetchUserProfile = async () => {
    try {
      const token = localStorage.getItem('joyce-suites-token');
      const response = await fetch(`${config.apiBaseUrl}/api/auth/profile`, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setUserProfile(data.user);
          setProfileData(data.user); // Also update profileData for existing UI

          // Update account details with user's actual room information
          if (data.user?.room_number) {
            const roomAccountDetails = getAccountDetails(data.user.room_number);
            setAccountDetails(roomAccountDetails);
          }
        }
      }
    } catch (err) {
      // Error fetching user profile
    }
  };

  const fetchRoomDetails = async (unitNumber) => {
    try {
      const response = await fetchWithAuth(
        `${config.apiBaseUrl}/api/tenant/room-details/${unitNumber}`
      );

      if (response.ok) {
        const data = await response.json();
        setRoomDetails(data.room);
        return data.room;
      } else {
        console.error(`Room details response not OK: ${response.status}`);
        return null;
      }
    } catch (err) {
      console.error('Error fetching room details:', err);
      return null;
    }
  };

  const fetchLeaseData = async () => {
    try {
      const response = await fetchWithAuth(`${config.apiBaseUrl}/api/tenant/lease`);

      if (response.ok) {
        const data = await response.json();
        setFullLeaseDetails(data.lease);
        return data.lease;
      } else {
        console.error(`Lease response not OK: ${response.status}`);
        return null;
      }
    } catch (err) {
      console.error('Error fetching lease details:', err);
      return null;
    } finally {
      setLoadingPaymentDetails(false);
    }
  };

  const fetchPaymentDetails = async () => {
    try {
      setLoadingPaymentDetails(true);
      const response = await fetchWithAuth(`${config.apiBaseUrl}/api/tenant/payment-details`);
      if (response.ok) {
        const data = await response.json();
        setPaymentDetails(data.payment_details);
        return data.payment_details;
      }
    } catch (err) {
      console.error('Error fetching payment details:', err);
    } finally {
      setLoadingPaymentDetails(false);
    }
    return null;
  };

  const fetchRentAndDepositRecords = async () => {
    try {
      // Get user ID from authenticated user context
      const userId = user ? user.user_id : null;

      if (!userId) {
        console.error('User not authenticated or user ID not found');
        setError('User not authenticated');
        return;
      }

      const currentDate = new Date();
      const currentMonth = currentDate.getMonth() + 1;
      const currentYear = currentDate.getFullYear();

      const rentResponse = await fetchWithAuth(`${config.apiBaseUrl}/api/rent-deposit/rent/tenant/${userId}?month=${currentMonth}&year=${currentYear}`);

      if (rentResponse.ok) {
        const rentData = await rentResponse.json();
        setRentRecords(rentData.records);
        if (rentData.records.length > 0) {
          setCurrentMonthRent(rentData.records[0]);
        }
      }


      const depositResponse = await fetchWithAuth(`${config.apiBaseUrl}/api/rent-deposit/deposit/tenant/${userId}`);

      if (depositResponse.ok) {
        const depositData = await depositResponse.json();
        setDepositRecords(depositData.records);
        if (depositData.records.length > 0) {
          setCurrentDeposit(depositData.records[0]);
        }
      }


      const waterBillResponse = await fetchWithAuth(`${config.apiBaseUrl}/api/rent-deposit/water-bill/tenant/${userId}?month=${currentMonth}&year=${currentYear}`);

      if (waterBillResponse.ok) {
        const waterBillData = await waterBillResponse.json();
        setWaterBillRecords(waterBillData.records);
        if (waterBillData.records.length > 0) {
          setCurrentMonthWaterBill(waterBillData.records[0]);
        }
      }
    } catch (err) {
      console.error('Error fetching rent and deposit records:', err);
    }
  };

  const fetchAllData = async () => {
    try {
      setLoading(true);
      setError('');

      const token = localStorage.getItem('joyce-suites-token');
      if (!token) {
        navigate('/login');
        return;
      }



      const [dashRes, profileRes, paymentsRes, vacateRes, notificationsRes] = await Promise.all([
        fetchWithAuth(`${config.apiBaseUrl}/api/tenant/dashboard`),
        fetchWithAuth(`${config.apiBaseUrl}/api/auth/profile`),
        fetchWithAuth(`${config.apiBaseUrl}/api/tenant/payments`),
        fetchWithAuth(`${config.apiBaseUrl}/api/tenant/vacate-notices`),
        fetchWithAuth(`${config.apiBaseUrl}/api/auth/notifications`)
      ]);


      if (dashRes && dashRes.ok) {
        const dashData = await dashRes.json();
        setDashboardData(dashData.dashboard);


        if (dashData.dashboard?.unit_number) {
          const accountInfo = getAccountDetails(dashData.dashboard.unit_number);
          setAccountDetails(accountInfo);
          await fetchRoomDetails(dashData.dashboard.unit_number);
        }
      } else {
        console.error(`Dashboard response error: ${dashRes ? dashRes.status : 'No response'}`);
      }

      // Fetch user profile for account details
      await fetchUserProfile();



      if (profileRes && profileRes.ok) {
        const profData = await profileRes.json();



        setProfileData(profData.user);
      } else {
        console.error(`Profile response error: ${profileRes ? profileRes.status : 'No response'}`);
      }



      if (paymentsRes && paymentsRes.ok) {
        const paysData = await paymentsRes.json();
        setPaymentsData(paysData.payments || []);
      } else {
        console.error(`Payments response error: ${paymentsRes ? paymentsRes.status : 'No response'}`);
      }


      await fetchRentAndDepositRecords();



      if (vacateRes && vacateRes.ok) {
        const vacData = await vacateRes.json();
        setVacateNotices(vacData.notices || []);
      } else {
        console.error(`Vacate notices response error: ${vacateRes ? vacateRes.status : 'No response'}`);
      }



      if (notificationsRes && notificationsRes.ok) {
        const notifData = await notificationsRes.json();
        setNotifications(notifData.notifications || []);
      } else {
        console.error(`Notifications response error: ${notificationsRes ? notificationsRes.status : 'No response'}`);
      }


      await fetchLeaseData();



    } catch (err) {
      console.error('Fetch all data error:', err);
      if (err.message !== 'Session expired. Please login again.') {
        setError(err.message || 'Failed to load dashboard');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      const token = localStorage.getItem('joyce-suites-token');
      if (token) {
        await fetchWithAuth(`${config.apiBaseUrl}/api/auth/logout`, {
          method: 'POST'
        });
      }
    } catch (err) {
      console.error('Logout error:', err);
    } finally {

      localStorage.removeItem('joyce-suites-token');
      localStorage.removeItem('joyce-suites-refresh-token');
      localStorage.removeItem('user-data');
      navigate('/login');
    }
  };

  const handleOpenPaymentModal = () => {
    setShowPaymentModal(true);
    setError('');
    setMpesaPhone('');
    fetchPaymentDetails();
  };

  const getPaymentSummary = () => {
    // Get current tenant's payment data from available state
    const currentTenantPending = rentRecords.find(t => t.tenant_id === user?.user_id);

    return {
      rentStatus: currentMonthRent?.status === 'paid' ? 'paid' : 'unpaid',
      rentAmount: dashboardData?.rent_amount || 0,
      depositStatus: currentDeposit?.status || 'pending',
      depositAmount: currentAccountDetails?.depositAmount || 0,
      depositBalance: currentDeposit?.balance || currentAccountDetails?.depositAmount || 0,
      outstandingBalance: currentTenantPending?.outstanding_balance || calculateOutstandingBalance(),
      waterBillStatus: currentMonthWaterBill?.status || 'pending',
      waterBillAmount: currentMonthWaterBill?.amount_due || 0,
      totalPaid: paymentsData.filter(p => p.status === 'completed').reduce((sum, p) => sum + (p.amount || 0), 0),
      pendingCount: rentRecords.filter(t => t.tenant_id === user?.user_id && t.status === 'pending').length,
      lastPayment: paymentsData.length > 0 ? paymentsData[paymentsData.length - 1] : null
    };
  };

  const handleOpenLeaseModal = async () => {
    setError('');
    setSuccess('');
    setTermsAccepted(false);
    setSignatureEmpty(true);

    if (signatureRef.current) {
      signatureRef.current.clear();
    }

    setLoading(true);

    try {
      const leaseResponse = await fetchLeaseData();
      const lease = leaseResponse || fullLeaseDetails;
      const currentAccountDetails = getAccountDetails(dashboardData?.unit_number || lease?.room_number);

      if (lease) {
        setLeaseData({
          tenant: {
            fullName: lease.tenant_name || profileData?.full_name || 'N/A',
            idNumber: lease.id_number || profileData?.id_number || 'N/A',
            phone: lease.phone_number || profileData?.phone_number || 'N/A',
            email: lease.email || profileData?.email || 'N/A',
            roomNumber: lease.room_number || dashboardData?.unit_number || 'N/A'
          },
          unit: {
            rent_amount: lease.rent_amount || currentAccountDetails?.rentAmount || 0,
            deposit_amount: lease.deposit_amount || currentAccountDetails?.depositAmount || 0,
            property_name: lease.property_name || `Room ${lease.room_number}`,
            room_type: lease.room_type || currentAccountDetails?.roomType || 'N/A'
          },
          landlord: {
            name: lease.landlord_name || currentAccountDetails?.landlordName || 'Joyce Suites',
            phone: lease.landlord_phone || '0722870077',
            email: lease.landlord_email || 'joycesuites@gmail.com',
            address: lease.landlord_address || 'P.O. Box 123, Nairobi'
          }
        });
      }
      setLoading(false);
      setShowLeaseModal(true);
    } catch (err) {
      setError('Failed to load lease information');
      setLoading(false);
    }
  };

  const handleClearSignature = () => {
    if (signatureRef.current) {
      signatureRef.current.clear();
      setSignatureEmpty(true);
    }
  };

  const handleSignatureEnd = () => {
    if (signatureRef.current) {
      setSignatureEmpty(signatureRef.current.isEmpty());
    }
  };

  const handleSubmitLease = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!termsAccepted) {
      setError('Please accept the terms and conditions');
      return;
    }

    if (signatureEmpty) {
      setError('Please provide your signature');
      return;
    }

    setLoading(true);

    try {
      const signatureDataUrl = signatureRef.current?.toDataURL();

      const leaseSubmission = {
        signature: signatureDataUrl,
        signed_at: new Date().toISOString(),
        terms_accepted: true
      };


      const response = await fetchWithAuth(`${config.apiBaseUrl}/api/tenant/lease/sign`, {
        method: 'POST',
        body: JSON.stringify(leaseSubmission)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || data.message || 'Failed to submit lease agreement');
      }

      setSuccess('Lease agreement signed successfully!');
      setTermsAccepted(false);
      handleClearSignature();

      await new Promise(resolve => setTimeout(resolve, 1500));

      await fetchAllData();

      setSuccess('');
      setShowLeaseModal(false);

      setSuccess('Lease signed successfully! You can now make payments.');
      setTimeout(() => setSuccess(''), 3000);

    } catch (err) {
      console.error('Lease signing error:', err);
      setError(err.message || 'Failed to sign lease. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleInitiateMpesa = async (e) => {
    e.preventDefault();

    if (!mpesaPhone) {
      setError('Please enter your M-Pesa phone number');
      return;
    }


    if (!/^(07|01|254)\d{8}$/.test(mpesaPhone)) {
      setError('Please enter a valid M-Pesa phone number');
      return;
    }

    try {
      setLoading(true);
      setError('');
      setSuccess('');

      const response = await fetchWithAuth(`${config.apiBaseUrl}/api/tenant/stk-push`, {
        method: 'POST',
        body: JSON.stringify({
          phone_number: mpesaPhone,
          amount: outstandingBalance || paymentDetails?.rent_amount || 0
        })
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(data.message || 'STK Push initiated! Please check your phone.');
        setMpesaPhone('');


        setTimeout(() => {
          fetchAllData();
          setSuccess('');
        }, 10000);
      } else {
        setError(data.error || 'Failed to initiate M-Pesa payment');
      }
    } catch (err) {
      console.error('M-Pesa payment error:', err);
      setError('Error initiating payment: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitMaintenance = async (e) => {
    e.preventDefault();

    if (!maintenanceForm.title || !maintenanceForm.description) {
      setError('Please fill in all required fields');
      return;
    }

    try {
      setLoading(true);

      const requestData = {
        title: maintenanceForm.title,
        description: maintenanceForm.description,
        priority: maintenanceForm.priority
      };


      const response = await fetchWithAuth(`${config.apiBaseUrl}/api/tenant/maintenance-requests`, {
        method: 'POST',
        body: JSON.stringify(requestData)
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess('Maintenance request submitted successfully');
        setShowMaintenanceModal(false);
        setMaintenanceForm({ title: '', description: '', priority: 'normal', file: null });
        setError('');
        fetchAllData();
      } else {
        setError(data.error || 'Failed to submit request');
      }
    } catch (err) {
      console.error('Maintenance submission error:', err);
      setError('Error submitting request: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCheckPaymentStatus = async (checkoutId) => {
    try {
      setLoading(true);
      const response = await fetchWithAuth(`${config.apiBaseUrl}/api/tenant/payment-status/${checkoutId}`);
      const data = await response.json();

      if (response.ok) {
        if (data.status === 'paid') {
          setSuccess('Payment confirmed successfully!');
        } else {
          setSuccess(data.message || 'Payment status updated');
        }
        fetchAllData();
      } else {
        setError(data.error || 'Failed to check status');
      }
    } catch (err) {
      console.error('Check status error:', err);
      setError('Error checking status: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitVacateNotice = async (e) => {
    e.preventDefault();

    if (!vacateForm.vacate_date) {
      setError('Please select a vacate date');
      return;
    }

    const vacateDate = new Date(vacateForm.vacate_date);
    const today = new Date();
    const thirtyDaysFromNow = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000);

    if (vacateDate < thirtyDaysFromNow) {
      setError('Vacate date must be at least 30 days from today');
      return;
    }

    try {
      setLoading(true);


      const response = await fetchWithAuth(`${config.apiBaseUrl}/api/tenant/vacate-notice`, {
        method: 'POST',
        body: JSON.stringify({
          intended_move_date: vacateForm.vacate_date,
          reason: vacateForm.reason
        })
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess('Vacate notice submitted successfully');
        setShowVacateModal(false);
        setVacateForm({ vacate_date: '', reason: '' });
        setError('');
        fetchAllData();
      } else {
        setError(data.error || 'Failed to submit vacate notice');
      }
    } catch (err) {
      console.error('Vacate notice error:', err);
      setError('Error submitting vacate notice: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleMaintenanceFileChange = (e) => {
    const file = e.target.files[0];
    if (file && file.size > 5242880) {
      setError('File size must be less than 5MB');
      return;
    }
    setMaintenanceForm({ ...maintenanceForm, file });
  };

  const handleCancelVacateNotice = async (noticeId) => {
    if (!window.confirm('Are you sure you want to cancel this vacate notice?')) {
      return;
    }

    try {
      setLoading(true);

      const response = await fetchWithAuth(
        `${config.apiBaseUrl}/api/tenant/vacate-notice/${noticeId}/cancel`,
        {
          method: 'POST'
        }
      );

      if (response.ok) {
        setSuccess('Vacate notice cancelled successfully');
        fetchAllData();
      } else {
        setError('Failed to cancel vacate notice');
      }
    } catch (err) {
      console.error('Cancel vacate error:', err);
      setError('Error cancelling notice: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading && !dashboardData) {
    return (
      <div className="loading-screen">
        <div className="spinner"></div>
        <p>Loading Dashboard...</p>
      </div>
    );
  }

  if (error && !dashboardData) {
    return (
      <div className="error-screen">
        <div className="error-message">
          <h2>Error</h2>
          <p>{error}</p>
          <button onClick={() => navigate('/login')} className="btn btn-primary">
            Return to Login
          </button>
        </div>
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div className="error-screen">
        <div className="error-message">
          <h2>No Dashboard Data</h2>
          <p>Unable to load your dashboard. Please try again.</p>
          <button onClick={fetchAllData} className="btn btn-primary">
            Retry
          </button>
        </div>
      </div>
    );
  }

  const minVacateDate = new Date();
  minVacateDate.setDate(minVacateDate.getDate() + 30);
  const minVacateDateString = minVacateDate.toISOString().split('T')[0];


  const roomNumber = dashboardData?.unit_number || profileData?.room_number || 'Not Assigned';
  const currentAccountDetails = accountDetails || getAccountDetails(roomNumber);


  const outstandingBalance = dashboardData?.outstanding_balance !== undefined
    ? dashboardData.outstanding_balance
    : calculateOutstandingBalance();

  const roomTypeDisplay = currentAccountDetails?.roomType === 'one_bedroom' ? '1-Bedroom' : 'Bedsitter';


  const getProfilePhotoUrl = () => {
    if (profileData?.photo_path) {

      return `${config.apiBaseUrl}/${profileData.photo_path}`;
    }
    return null;
  };

  const profilePhotoUrl = getProfilePhotoUrl();

  return (
    <div style={styles.container}>
      {/* Sidebar */}
      <aside style={{
        ...styles.sidebar,
        transform: sidebarOpen ? 'translateX(0)' : 'translateX(-100%)',
        display: isMobile && !sidebarOpen ? 'none' : 'block'
      }}>
        <div style={styles.sidebarHeader}>
          <h2 style={styles.sidebarTitle}>Joyce Suites</h2>
          {isMobile && <button onClick={() => setSidebarOpen(false)} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer' }}><X size={20} /></button>}
        </div>
        <nav style={styles.nav}>
          <button style={{ ...styles.navItem, ...(activeTab === 'dashboard' ? styles.navItemActive : {}) }} onClick={() => { setActiveTab('dashboard'); if (isMobile) setSidebarOpen(false); }}><Home size={18} /> Dashboard</button>
          <button style={{ ...styles.navItem, ...(activeTab === 'payments' ? styles.navItemActive : {}) }} onClick={() => { setActiveTab('payments'); if (isMobile) setSidebarOpen(false); }}><CreditCard size={18} /> Payments</button>
          <button style={{ ...styles.navItem, ...(activeTab === 'lease' ? styles.navItemActive : {}) }} onClick={() => { setActiveTab('lease'); if (isMobile) setSidebarOpen(false); }}><FileText size={18} /> Lease Agreement</button>
          <button style={{ ...styles.navItem, ...(activeTab === 'profile' ? styles.navItemActive : {}) }} onClick={() => { setActiveTab('profile'); if (isMobile) setSidebarOpen(false); }}><UserIcon size={18} /> Profile</button>
          <button style={{ ...styles.navItem, ...(activeTab === 'vacate' ? styles.navItemActive : {}) }} onClick={() => { setActiveTab('vacate'); if (isMobile) setSidebarOpen(false); }}><DoorOpen size={18} /> Vacate Notice</button>
        </nav>
        <div style={{ padding: '24px', borderTop: '1px solid #374151', marginTop: 'auto' }}>
          <button onClick={handleLogout} style={{ ...styles.navItem, color: '#ef4444' }}><LogOut size={18} /> Logout</button>
        </div>
      </aside>

      {/* Main Content */}
      <main style={styles.main}>
        <header style={styles.header}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <button onClick={() => setSidebarOpen(!sidebarOpen)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><Menu size={24} /></button>
            <h1 style={{ fontSize: '18px', fontWeight: '600', margin: 0 }}>{activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}</h1>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ textAlign: 'right', display: isMobile ? 'none' : 'block' }}>
              <div style={{ fontSize: '14px', fontWeight: '600' }}>{profileData?.full_name || 'Tenant'}</div>
              <div style={{ fontSize: '11px', color: '#64748b' }}>Room {roomNumber}</div>
            </div>
            <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: '#3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: '600' }}>
              {(profileData?.full_name?.charAt(0) || 'T').toUpperCase()}
            </div>
          </div>
        </header>

        <section style={styles.content}>
          {error && <div style={{ backgroundColor: '#fee2e2', color: '#b91c1c', padding: '12px 16px', borderRadius: '8px', marginBottom: '24px' }}>{error}</div>}
          {success && <div style={{ backgroundColor: '#dcfce7', color: '#15803d', padding: '12px 16px', borderRadius: '8px', marginBottom: '24px' }}>{success}</div>}

          {activeTab === 'dashboard' && (
            <div>
              <div style={styles.statGrid}>
                <div style={{ ...styles.statCard, backgroundColor: '#3b82f6' }}>
                  <span style={{ fontSize: '14px', opacity: 0.9 }}>Room Details</span>
                  <span style={{ fontSize: '24px', fontWeight: '700' }}>Room {roomNumber}</span>
                  <span style={{ fontSize: '12px', opacity: 0.8 }}>{roomTypeDisplay}</span>
                </div>
                <div style={{ ...styles.statCard, backgroundColor: '#f59e0b' }}>
                  <span style={{ fontSize: '14px', opacity: 0.9 }}>Outstanding Balance</span>
                  <span style={{ fontSize: '24px', fontWeight: '700' }}>
                    {outstandingBalance <= 0 ? 'CLEARED' : `KSh ${outstandingBalance.toLocaleString()}`}
                  </span>
                  <span style={{ fontSize: '12px', opacity: 0.8 }}>Rent & Water</span>
                </div>
                <div style={{ ...styles.statCard, backgroundColor: '#10b981' }}>
                  <span style={{ fontSize: '14px', opacity: 0.9 }}>Lease Status</span>
                  <span style={{ fontSize: '24px', fontWeight: '700' }}>{fullLeaseDetails?.status || 'Active'}</span>
                  <span style={{ fontSize: '12px', opacity: 0.8 }}>{fullLeaseDetails?.signed_at ? 'Signed' : 'Pending Signature'}</span>
                </div>
              </div>

              <div style={styles.card}>
                <h3 style={{ marginTop: 0, marginBottom: '20px', fontSize: '18px' }}>Common Actions</h3>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px' }}>
                  <button onClick={handleOpenPaymentModal} style={{ padding: '12px 24px', backgroundColor: '#3b82f6', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <CreditCard size={18} /> Make Payment
                  </button>
                  <button onClick={() => setShowMaintenanceModal(true)} style={{ padding: '12px 24px', backgroundColor: 'white', color: '#374151', border: '1px solid #d1d5db', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Wrench size={18} /> Request Maintenance
                  </button>
                  <button onClick={handleOpenLeaseModal} style={{ padding: '12px 24px', backgroundColor: 'white', color: '#374151', border: '1px solid #d1d5db', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <FileText size={18} /> Lease Information
                  </button>
                </div>
              </div>

              <div style={styles.card}>
                <h3 style={{ marginTop: 0, marginBottom: '20px', fontSize: '18px' }}>Recent Notifications</h3>
                {notifications.length > 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {notifications.slice(0, 3).map(n => (
                      <div key={n.id} style={{ padding: '12px', borderRadius: '8px', backgroundColor: n.is_read ? 'transparent' : '#f0f9ff', border: '1px solid #e5e7eb' }}>
                        <div style={{ fontWeight: '600', fontSize: '14px' }}>{n.title || 'Notification'}</div>
                        <div style={{ fontSize: '13px', color: '#4b5563', marginTop: '4px' }}>{n.message}</div>
                        <div style={{ fontSize: '11px', color: '#9ca3af', marginTop: '8px' }}>{new Date(n.created_at).toLocaleDateString()}</div>
                      </div>
                    ))}
                  </div>
                ) : <p style={{ color: '#64748b' }}>No recent notifications</p>}
              </div>
            </div>
          )}

          {activeTab === 'payments' && (
            <div style={styles.card}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <h3 style={{ margin: 0 }}>Payment History</h3>
                <button onClick={handleOpenPaymentModal} style={{ padding: '8px 16px', backgroundColor: '#3b82f6', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>New Payment</button>
              </div>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid #e5e7eb', textAlign: 'left' }}>
                      <th style={{ padding: '12px', fontSize: '14px', color: '#64748b' }}>Date</th>
                      <th style={{ padding: '12px', fontSize: '14px', color: '#64748b' }}>Reference</th>
                      <th style={{ padding: '12px', fontSize: '14px', color: '#64748b' }}>Amount</th>
                      <th style={{ padding: '12px', fontSize: '14px', color: '#64748b' }}>Type</th>
                      <th style={{ padding: '12px', fontSize: '14px', color: '#64748b' }}>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paymentsData.length > 0 ? paymentsData.map(p => (
                      <tr key={p.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                        <td style={{ padding: '12px', fontSize: '14px' }}>{new Date(p.created_at).toLocaleDateString()}</td>
                        <td style={{ padding: '12px', fontSize: '14px' }}>{p.transaction_id || p.merchant_request_id}</td>
                        <td style={{ padding: '12px', fontSize: '14px', fontWeight: '600' }}>KSh {p.amount.toLocaleString()}</td>
                        <td style={{ padding: '12px', fontSize: '14px' }}>{p.payment_type}</td>
                        <td style={{ padding: '12px' }}>
                          <span style={{ fontSize: '12px', padding: '2px 8px', borderRadius: '12px', backgroundColor: p.status === 'completed' ? '#dcfce7' : '#fee2e2', color: p.status === 'completed' ? '#166534' : '#991b1b' }}>{p.status}</span>
                        </td>
                      </tr>
                    )) : <tr><td colSpan="5" style={{ padding: '24px', textAlign: 'center', color: '#64748b' }}>No payment records found</td></tr>}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'lease' && (
            <div style={styles.card}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <h3 style={{ margin: 0 }}>Lease Agreement</h3>
                {fullLeaseDetails?.signed_by_tenant ? (
                  <span style={{ color: '#10b981', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '4px' }}>Signed <FileText size={18} /></span>
                ) : (
                  <button onClick={handleOpenLeaseModal} style={{ padding: '8px 16px', backgroundColor: '#3b82f6', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>Sign Lease Now</button>
                )}
              </div>
              <div style={{ lineHeight: '1.6', color: '#374151' }}>
                <p><strong>Property:</strong> {fullLeaseDetails?.property_name || 'Joyce Suites'}</p>
                <p><strong>Room:</strong> {roomNumber}</p>
                <p><strong>Start Date:</strong> {fullLeaseDetails?.start_date || 'N/A'}</p>
                <p><strong>End Date:</strong> {fullLeaseDetails?.end_date || 'N/A'}</p>
                <p><strong>Monthly Rent:</strong> KSh {fullLeaseDetails?.rent_amount?.toLocaleString() || 'N/A'}</p>
              </div>
            </div>
          )}

          {activeTab === 'profile' && (
            <div style={styles.card}>
              <h3>Profile Settings</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '400px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: '#64748b' }}>Full Name</label>
                  <div style={{ padding: '10px', backgroundColor: '#f1f5f9', borderRadius: '6px' }}>{profileData?.full_name}</div>
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: '#64748b' }}>Email Address</label>
                  <div style={{ padding: '10px', backgroundColor: '#f1f5f9', borderRadius: '6px' }}>{profileData?.email}</div>
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: '#64748b' }}>Phone Number</label>
                  <div style={{ padding: '10px', backgroundColor: '#f1f5f9', borderRadius: '6px' }}>{profileData?.phone_number}</div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'vacate' && (
            <div style={styles.card}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <h3 style={{ margin: 0 }}>Vacate Notices</h3>
                <button onClick={() => setShowVacateModal(true)} style={{ padding: '8px 16px', backgroundColor: '#3b82f6', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>Submit New Notice</button>
              </div>
              {vacateNotices.length > 0 ? (
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid #e5e7eb', textAlign: 'left' }}>
                        <th style={{ padding: '12px', fontSize: '14px', color: '#64748b' }}>Submission Date</th>
                        <th style={{ padding: '12px', fontSize: '14px', color: '#64748b' }}>Vacate Date</th>
                        <th style={{ padding: '12px', fontSize: '14px', color: '#64748b' }}>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {vacateNotices.map(v => (
                        <tr key={v.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                          <td style={{ padding: '12px' }}>{new Date(v.created_at).toLocaleDateString()}</td>
                          <td style={{ padding: '12px' }}>{new Date(v.vacate_date).toLocaleDateString()}</td>
                          <td style={{ padding: '12px' }}>
                            <span style={{ fontSize: '12px', padding: '2px 8px', borderRadius: '12px', backgroundColor: v.status === 'pending' ? '#fef3c7' : '#dcfce7', color: v.status === 'pending' ? '#92400e' : '#166534' }}>{v.status}</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : <p style={{ color: '#64748b' }}>No vacate notices found</p>}
            </div>
          )}
        </section>
      </main>

      {/* Modals go here... (Simplified for now, focusing on layout) */}
      {showLeaseModal && leaseData && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1100 }}>
          <div style={{ backgroundColor: 'white', padding: '32px', borderRadius: '12px', width: '90%', maxWidth: '800px', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px' }}>
              <h2 style={{ margin: 0 }}>Lease Agreement</h2>
              <button onClick={() => setShowLeaseModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={24} /></button>
            </div>
            {/* Lease content follows existing pattern but cleaner */}
            <div style={{ fontSize: '14px', lineHeight: '1.6' }}>
              <p>This agreement is between <strong>Joyce Suites</strong> and <strong>{leaseData.tenant.fullName}</strong>.</p>
              <p>Room: {leaseData.tenant.roomNumber} | Rent: KSh {leaseData.unit.rent_amount.toLocaleString()}</p>
              <div style={{ backgroundColor: '#f8fafc', padding: '16px', borderRadius: '8px', marginTop: '24px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                  <input type="checkbox" checked={termsAccepted} onChange={e => setTermsAccepted(e.target.checked)} />
                  I accept the terms and conditions of this lease.
                </label>
                <div style={{ marginTop: '24px' }}>
                  <label>Signature:</label>
                  <div style={{ border: '1px solid #d1d5db', borderRadius: '8px', marginTop: '8px', backgroundColor: 'white' }}>
                    <SignatureCanvas ref={signatureRef} canvasProps={{ width: 500, height: 200, className: 'sigCanvas' }} onEnd={handleSignatureEnd} />
                  </div>
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '16px', marginTop: '32px' }}>
                <button onClick={() => setShowLeaseModal(false)} style={{ padding: '10px 20px', backgroundColor: 'white', border: '1px solid #d1d5db', borderRadius: '8px' }}>Cancel</button>
                <button onClick={handleSubmitLease} style={{ padding: '10px 20px', backgroundColor: '#3b82f6', color: 'white', border: 'none', borderRadius: '8px' }}>Submit Signed Lease</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showPaymentModal && paymentDetails && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1100 }}>
          <div style={{ backgroundColor: 'white', padding: '32px', borderRadius: '12px', width: '90%', maxWidth: '400px' }}>
            <h3 style={{ marginTop: 0 }}>Make a Payment</h3>
            <div style={{ backgroundColor: '#f0f9ff', padding: '16px', borderRadius: '8px', marginBottom: '24px' }}>
              <div style={{ fontSize: '12px', color: '#0369a1' }}>Paybill: <strong>{paymentDetails.paybill}</strong></div>
              <div style={{ fontSize: '12px', color: '#0369a1' }}>Account: <strong>{paymentDetails.account}</strong></div>
            </div>
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '14px', marginBottom: '8px' }}>M-Pesa Phone Number</label>
              <input type="text" value={mpesaPhone} onChange={e => setMpesaPhone(e.target.value)} placeholder="0712345678" style={{ width: '100%', padding: '10px', border: '1px solid #d1d5db', borderRadius: '6px' }} />
            </div>
            <button onClick={handleInitiatePayment} disabled={loading} style={{ width: '100%', padding: '12px', backgroundColor: '#3b82f6', color: 'white', border: 'none', borderRadius: '8px', fontWeight: '600' }}>
              {loading ? 'Processing...' : 'Pay with M-Pesa'}
            </button>
            <button onClick={() => setShowPaymentModal(false)} style={{ width: '100%', padding: '12px', background: 'none', border: 'none', color: '#64748b', marginTop: '8px' }}>Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default TenantDashboard;
