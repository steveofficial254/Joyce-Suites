import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import SignatureCanvas from 'react-signature-canvas';
import './TenantDashboard.css';
import logo from '../../assets/image1.png';
import config from '../../config';

import apartment1 from '../../assets/image12.jpg';
import apartment2 from '../../assets/image21.jpg';
import apartment3 from '../../assets/image22.jpg';
import apartment4 from '../../assets/image10.jpg';
import apartment5 from '../../assets/image8.jpg';
import apartment6 from '../../assets/image11.jpg';

const TenantDashboard = () => {
  const navigate = useNavigate();
  const signatureRef = useRef(null);
  
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState(null);
  const [profileData, setProfileData] = useState(null);
  const [paymentsData, setPaymentsData] = useState([]);
  const [vacateNotices, setVacateNotices] = useState([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [activeTab, setActiveTab] = useState('dashboard');
  const [paymentDetails, setPaymentDetails] = useState(null);
  const [loadingPaymentDetails, setLoadingPaymentDetails] = useState(false);
  
  // Modal states
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showMaintenanceModal, setShowMaintenanceModal] = useState(false);
  const [showVacateModal, setShowVacateModal] = useState(false);
  const [showLeaseModal, setShowLeaseModal] = useState(false);
  
  // Lease signing states
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [signatureEmpty, setSignatureEmpty] = useState(true);
  const [leaseData, setLeaseData] = useState(null);
  const [fullLeaseDetails, setFullLeaseDetails] = useState(null);
  
  // Room details state
  const [roomDetails, setRoomDetails] = useState(null);
  const [accountDetails, setAccountDetails] = useState(null);
  
  // Form states
  const [mpesaPhone, setMpesaPhone] = useState('');
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

  // ==================== NEW: Lease Gate State ====================
  const [showLeaseGate, setShowLeaseGate] = useState(false);
  const [leaseGateData, setLeaseGateData] = useState(null);

  const apartmentImages = [apartment1, apartment2, apartment3, apartment4, apartment5, apartment6];

  const currentDate = new Date();
  const formattedDate = currentDate.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  useEffect(() => {
    // Check if we need to show lease gate after registration
    const checkLeaseStatus = async () => {
      const token = localStorage.getItem('joyce-suites-token');
      if (!token) {
        navigate('/login');
        return;
      }

      try {
        // First check if user just registered (has token but no dashboard data)
        const justRegistered = localStorage.getItem('justRegistered') === 'true';
        
        if (justRegistered) {
          localStorage.removeItem('justRegistered');
          // Fetch dashboard data first
          await fetchAllData();
          
          // Then check if lease needs signing
          if (dashboardData && !dashboardData.lease_signed && dashboardData.has_lease) {
            setShowLeaseGate(true);
            fetchLeaseGateData();
          }
        } else {
          await fetchAllData();
        }
      } catch (err) {
        console.error('Error checking lease status:', err);
        await fetchAllData();
      }
    };

    checkLeaseStatus();

    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % apartmentImages.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const getAuthHeaders = () => {
    const token = localStorage.getItem('joyce-suites-token');
    
    if (!token) {
      setError('Authentication token not found. Please login again.');
      setTimeout(() => navigate('/login'), 2000);
      return null;
    }
    
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
  };

  // Determine account details based on room number
  const getAccountDetails = (roomNumber) => {
    const roomNum = parseInt(roomNumber);
    
    // Rooms that pay to Joyce Muthoni
    const joyceRooms = [1, 2, 3, 4, 5, 6, 8, 9, 10];
    // Rooms that pay to Lawrence Mathea
    const lawrenceRooms = [11, 12, 13, 14, 15, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26];
    
    // Room pricing and deposit rules
    let rentAmount = 5000;
    let depositAmount = 5400;
    let roomType = 'bedsitter';
    
    if ([8, 9, 10, 17, 19, 20].includes(roomNum)) {
      // 1-bedroom standard
      rentAmount = 7500;
      depositAmount = 7900;
      roomType = 'one_bedroom';
    } else if (roomNum === 18) {
      // Special room 18
      rentAmount = 7000;
      depositAmount = 7400;
      roomType = 'one_bedroom';
    } else if ([12, 22].includes(roomNum)) {
      // Bigger bedsitters
      rentAmount = 5500;
      depositAmount = 5900;
      roomType = 'bedsitter';
    } else if ([11, 13, 14, 15, 21, 23, 24, 25, 26].includes(roomNum)) {
      // Standard bedsitters for Lawrence
      rentAmount = 5000;
      depositAmount = 5400;
      roomType = 'bedsitter';
    }
    
    // Determine landlord
    let landlordName = '';
    let paybill = '';
    let accountNumber = '';
    
    if (joyceRooms.includes(roomNum)) {
      landlordName = 'Joyce Muthoni Mathea';
      paybill = '222111';
      accountNumber = `JOYCE${roomNum.toString().padStart(3, '0')}`;
    } else if (lawrenceRooms.includes(roomNum)) {
      landlordName = 'Lawrence Mathea';
      paybill = '222222';
      accountNumber = `LAWRENCE${roomNum.toString().padStart(3, '0')}`;
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

  // ==================== NEW: Fetch Lease Gate Data ====================
  const fetchLeaseGateData = async () => {
    try {
      const headers = getAuthHeaders();
      if (!headers) return null;

      console.log('Fetching lease gate data from:', `${config.apiBaseUrl}${config.endpoints.tenant.lease}`);
      
      const response = await fetch(
        `${config.apiBaseUrl}${config.endpoints.tenant.lease}`,
        { 
          headers,
          credentials: 'include'
        }
      );

      if (response.ok) {
        const data = await response.json();
        console.log('Lease gate data response:', data);
        
        if (data.success) {
          setLeaseGateData(data.lease);
          return data.lease;
        } else {
          setError('Failed to load lease information for signing');
          return null;
        }
      } else {
        const errorText = await response.text();
        console.error('Lease gate error response:', errorText);
        setError('Failed to load lease information');
        return null;
      }
    } catch (err) {
      console.error('Error fetching lease gate data:', err);
      setError('Network error loading lease information');
      return null;
    }
  };

  const fetchRoomDetails = async (unitNumber) => {
    try {
      const headers = getAuthHeaders();
      if (!headers) {
        // Use fallback if no token
        const fallbackData = getAccountDetails(unitNumber);
        setRoomDetails(fallbackData);
        return fallbackData;
      }

      const endpoint = config.endpoints.tenant.roomDetails.replace(':unit_number', unitNumber);
      console.log('Fetching room details from:', `${config.apiBaseUrl}${endpoint}`);
      
      const response = await fetch(
        `${config.apiBaseUrl}${endpoint}`,
        { 
          method: 'GET',
          headers,
          credentials: 'include'
        }
      );

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.room) {
          setRoomDetails(data.room);
          return data.room;
        } else {
          // If API returns success but no room data, use fallback
          const fallbackData = getAccountDetails(unitNumber);
          setRoomDetails(fallbackData);
          return fallbackData;
        }
      } else if (response.status === 404) {
        console.warn(`Room ${unitNumber} not found via API, using fallback data`);
        const fallbackData = getAccountDetails(unitNumber);
        setRoomDetails(fallbackData);
        return fallbackData;
      } else {
        console.error(`Error fetching room details: ${response.status}`);
        const fallbackData = getAccountDetails(unitNumber);
        setRoomDetails(fallbackData);
        return fallbackData;
      }
    } catch (err) {
      console.error('Network error fetching room details:', err);
      // Use fallback data on network errors
      const fallbackData = getAccountDetails(unitNumber);
      setRoomDetails(fallbackData);
      return fallbackData;
    }
  };

  const fetchLeaseData = async () => {
    try {
      const headers = getAuthHeaders();
      if (!headers) return null;

      console.log('Fetching lease data from:', `${config.apiBaseUrl}${config.endpoints.tenant.lease}`);
      
      const response = await fetch(
        `${config.apiBaseUrl}${config.endpoints.tenant.lease}`,
        { 
          headers,
          credentials: 'include'
        }
      );

      if (response.ok) {
        const data = await response.json();
        console.log('Lease data response:', data);
        
        if (data.success) {
          setFullLeaseDetails(data.lease);
          return data.lease;
        }
        return null;
      } else {
        console.error('Error fetching lease:', response.status);
        return null;
      }
    } catch (err) {
      console.error('Error fetching lease:', err);
      return null;
    }
  };

  const fetchPaymentDetails = async () => {
    setLoadingPaymentDetails(true);
    try {
      const headers = getAuthHeaders();
      if (!headers) return;

      console.log('Fetching payment details from:', `${config.apiBaseUrl}${config.endpoints.tenant.paymentDetails}`);
      
      const response = await fetch(
        `${config.apiBaseUrl}${config.endpoints.tenant.paymentDetails}`,
        { 
          headers,
          credentials: 'include'
        }
      );

      if (response.ok) {
        const data = await response.json();
        console.log('Payment details response:', data);
        
        if (data.success) {
          setPaymentDetails(data.payment_details);
          setError('');
        } else {
          setError(data.error || 'Failed to load payment details');
        }
      } else {
        try {
          const errorData = await response.json();
          if (errorData.error === 'No active lease found' || errorData.error?.includes('lease')) {
            setError('Please sign your lease agreement before making payments.');
          } else {
            setError(errorData.error || 'Failed to load payment details');
          }
        } catch (parseError) {
          setError('Failed to load payment details');
        }
      }
    } catch (err) {
      console.error('Error fetching payment details:', err);
      setError('Failed to load payment details. Check your connection.');
    } finally {
      setLoadingPaymentDetails(false);
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

      const headers = getAuthHeaders();
      if (!headers) return;

      // 1. Fetch dashboard data
      console.log('1. Fetching dashboard from:', `${config.apiBaseUrl}${config.endpoints.tenant.dashboard}`);
      const dashRes = await fetch(
        `${config.apiBaseUrl}${config.endpoints.tenant.dashboard}`,
        { 
          headers,
          credentials: 'include'
        }
      );

      console.log('Dashboard response status:', dashRes.status);
      
      if (dashRes.ok) {
        const dashData = await dashRes.json();
        console.log('Dashboard data:', dashData);
        
        if (dashData.success) {
          setDashboardData(dashData.dashboard);
          
          // Set account details based on room number
          if (dashData.dashboard?.unit_number) {
            const accountInfo = getAccountDetails(dashData.dashboard.unit_number);
            setAccountDetails(accountInfo);
            // Use fallback if room details fetch fails
            const roomDetails = await fetchRoomDetails(dashData.dashboard.unit_number).catch(err => {
              console.error('Room details error, using fallback:', err);
              return getAccountDetails(dashData.dashboard.unit_number);
            });
            setRoomDetails(roomDetails);
          }
        } else {
          setError(dashData.error || 'Failed to load dashboard data');
        }
      } else if (dashRes.status === 401) {
        // Token expired or invalid
        localStorage.clear();
        navigate('/login');
        return;
      } else {
        const errorText = await dashRes.text();
        console.error('Dashboard error response:', errorText);
        throw new Error(`Dashboard load failed: ${dashRes.status}`);
      }

      // 2. Fetch profile data - Use tenant profile endpoint instead of auth profile
      try {
        console.log('2. Fetching profile from:', `${config.apiBaseUrl}${config.endpoints.tenant.profile}`);
        const profileRes = await fetch(
          `${config.apiBaseUrl}${config.endpoints.tenant.profile}`,
          { 
            headers,
            credentials: 'include'
          }
        );
        
        if (profileRes.ok) {
          const profData = await profileRes.json();
          console.log('Profile data:', profData);
          
          if (profData.success) {
            setProfileData(profData.user);
          }
        }
      } catch (profileErr) {
        console.error('Error fetching profile:', profileErr);
      }

      // 3. Fetch payments
      try {
        console.log('3. Fetching payments from:', `${config.apiBaseUrl}${config.endpoints.tenant.payments}`);
        const paymentsRes = await fetch(
          `${config.apiBaseUrl}${config.endpoints.tenant.payments}`,
          { 
            headers,
            credentials: 'include'
          }
        );
        
        if (paymentsRes.ok) {
          const paysData = await paymentsRes.json();
          console.log('Payments data:', paysData);
          
          if (paysData.success) {
            setPaymentsData(paysData.payments || []);
          }
        }
      } catch (paymentsErr) {
        console.error('Error fetching payments:', paymentsErr);
      }

      // 4. Fetch vacate notices
      try {
        console.log('4. Fetching vacate notices from:', `${config.apiBaseUrl}${config.endpoints.tenant.vacateNotices}`);
        const vacateRes = await fetch(
          `${config.apiBaseUrl}${config.endpoints.tenant.vacateNotices}`,
          { 
            headers,
            credentials: 'include'
          }
        );
        
        if (vacateRes.ok) {
          const vacateData = await vacateRes.json();
          console.log('Vacate notices data:', vacateData);
          
          if (vacateData.success) {
            setVacateNotices(vacateData.notices || []);
          }
        }
      } catch (vacateErr) {
        console.error('Error fetching vacate notices:', vacateErr);
      }

      // 5. Fetch full lease details
      try {
        await fetchLeaseData();
      } catch (leaseErr) {
        console.error('Error fetching lease:', leaseErr);
      }

      console.log('✅ All data fetched successfully');
    } catch (err) {
      console.error('❌ Fetch all data error:', err);
      setError(err.message || 'Failed to load dashboard. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      const headers = getAuthHeaders();
      if (headers) {
        await fetch(`${config.apiBaseUrl}${config.endpoints.auth.logout}`, {
          method: 'POST',
          headers,
          credentials: 'include'
        });
      }
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      localStorage.clear();
      navigate('/login');
    }
  };

  // ==================== NEW: Handle Lease Gate Actions ====================
  const handleLeaseGateSignLease = () => {
    setShowLeaseGate(false);
    handleOpenLeaseModal();
  };

  const handleLeaseGateSkip = () => {
    setShowLeaseGate(false);
    setActiveTab('dashboard');
  };

  const handleLeaseGateLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  const handleOpenPaymentModal = () => {
    setShowPaymentModal(true);
    setError('');
    setMpesaPhone('');
    fetchPaymentDetails();
  };

  const handleOpenLeaseModal = async () => {
    setError('');
    setSuccess('');
    setTermsAccepted(false);
    setSignatureEmpty(true);
    setLoading(true);
    
    const leaseResponse = await fetchLeaseData();
    
    if (leaseResponse) {
      const roomNum = leaseResponse.unit_number || dashboardData?.unit_number || 'N/A';
      const accountInfo = getAccountDetails(roomNum);
      
      setLeaseData({
        tenant: {
          fullName: profileData?.full_name || 'N/A',
          idNumber: profileData?.id_number || profileData?.national_id || 'N/A',
          phone: profileData?.phone_number || profileData?.phone || 'N/A',
          email: profileData?.email || 'N/A',
          roomNumber: roomNum
        },
        unit: {
          rent_amount: accountInfo?.rentAmount || dashboardData?.rent_amount || 0,
          deposit_amount: accountInfo?.depositAmount || 0,
          property_name: dashboardData?.property_name || `Room ${roomNum}`,
          room_type: accountInfo?.roomType || 'N/A'
        },
        landlord: {
          name: accountInfo?.landlordName || 'N/A',
          phone: '0758 999322',
          email: 'joycesuites@gmail.com',
          paybill: accountInfo?.paybill || 'N/A',
          account: accountInfo?.accountNumber || 'N/A'
        },
        lease: leaseResponse
      });
    } else {
      const roomNum = dashboardData?.unit_number || profileData?.room_number || 'N/A';
      const accountInfo = getAccountDetails(roomNum);
      
      setLeaseData({
        tenant: {
          fullName: profileData?.full_name || 'N/A',
          idNumber: profileData?.id_number || profileData?.national_id || 'N/A',
          phone: profileData?.phone_number || profileData?.phone || 'N/A',
          email: profileData?.email || 'N/A',
          roomNumber: roomNum
        },
        unit: {
          rent_amount: accountInfo?.rentAmount || dashboardData?.rent_amount || 0,
          deposit_amount: accountInfo?.depositAmount || 0,
          property_name: dashboardData?.property_name || `Room ${roomNum}`,
          room_type: accountInfo?.roomType || 'N/A'
        },
        landlord: {
          name: accountInfo?.landlordName || 'N/A',
          phone: '0758 999322',
          email: 'joycesuites@gmail.com',
          paybill: accountInfo?.paybill || 'N/A',
          account: accountInfo?.accountNumber || 'N/A'
        }
      });
    }
    
    setLoading(false);
    setShowLeaseModal(true);
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
      const headers = getAuthHeaders();
      if (!headers) return;

      // Get signature as data URL with proper format
      const signatureDataUrl = signatureRef.current?.toDataURL('image/png');
      
      if (!signatureDataUrl) {
        setError('Failed to capture signature');
        setLoading(false);
        return;
      }

      const leaseSubmission = {
        signature: signatureDataUrl,
        terms_accepted: true
      };

      console.log('Submitting lease to:', `${config.apiBaseUrl}${config.endpoints.tenant.leaseSign}`);
      console.log('Lease submission data:', {
        hasSignature: !!leaseSubmission.signature,
        signatureLength: leaseSubmission.signature?.length,
        terms_accepted: leaseSubmission.terms_accepted
      });

      const response = await fetch(
        `${config.apiBaseUrl}${config.endpoints.tenant.leaseSign}`,
        {
          method: 'POST',
          headers,
          body: JSON.stringify(leaseSubmission),
          credentials: 'include'
        }
      );

      console.log('Lease sign response status:', response.status);
      
      let data;
      try {
        data = await response.json();
      } catch (parseError) {
        console.error('Failed to parse JSON:', parseError);
        const text = await response.text();
        console.error('Raw response:', text);
        throw new Error('Invalid response from server');
      }

      if (!response.ok) {
        console.error('Lease signing error response:', data);
        
        if (response.status === 404) {
          throw new Error(`Lease signing endpoint not found (404). Please check backend routes.`);
        } else if (response.status === 401) {
          throw new Error('Session expired. Please login again.');
        } else {
          throw new Error(data.error || data.message || `Failed to submit lease (${response.status})`);
        }
      }

      console.log('Lease signing success:', data);
      
      setSuccess('✅ Lease signed successfully!');
      
      // Close modal and reload
      setTimeout(() => {
        setShowLeaseModal(false);
        fetchAllData();
        setSuccess('You can now access all features!');
      }, 2000);

    } catch (err) {
      console.error('Lease submission error:', err);
      setError(err.message || 'Failed to sign lease. Please try again.');
      
      // Provide troubleshooting steps
      if (err.message.includes('404')) {
        setError(`${err.message}\n\nTroubleshooting:\n1. Make sure backend is running\n2. Check if route is registered\n3. Restart Flask server`);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleInitiateMpesa = async (e) => {
    e.preventDefault();
    
    if (!mpesaPhone) {
      setError('Please enter phone number');
      return;
    }

    if (!paymentDetails) {
      setError('Payment details not loaded');
      return;
    }

    try {
      setLoading(true);
      setError('');
      
      const headers = getAuthHeaders();
      if (!headers) return;

      const response = await fetch(`${config.apiBaseUrl}${config.endpoints.payments.initiate}`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          phone_number: mpesaPhone,
          amount: paymentDetails.rent_amount,
          room_number: paymentDetails.room_number,
          lease_id: paymentDetails.lease_id,
          paybill_number: accountDetails?.paybill,
          account_number: accountDetails?.accountNumber
        }),
        credentials: 'include'
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess('STK Push sent! Check your M-Pesa prompt.');
        setShowPaymentModal(false);
        setMpesaPhone('');
        setPaymentDetails(null);
        setTimeout(() => fetchAllData(), 5000);
      } else {
        setError(data.error || 'Payment initiation failed');
      }
    } catch (err) {
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
      
      const headers = getAuthHeaders();
      if (!headers) return;

      const requestData = {
        title: maintenanceForm.title,
        description: maintenanceForm.description,
        priority: maintenanceForm.priority
      };

      console.log('Submitting maintenance to:', `${config.apiBaseUrl}${config.endpoints.tenant.requests}`);
      
      const response = await fetch(`${config.apiBaseUrl}${config.endpoints.tenant.requests}`, {
        method: 'POST',
        headers,
        body: JSON.stringify(requestData),
        credentials: 'include'
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
      setError('Error submitting request: ' + err.message);
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
      
      const headers = getAuthHeaders();
      if (!headers) return;

      console.log('Submitting vacate notice to:', `${config.apiBaseUrl}${config.endpoints.tenant.submitVacateNotice}`);
      
      const response = await fetch(`${config.apiBaseUrl}${config.endpoints.tenant.submitVacateNotice}`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          intended_move_date: vacateForm.vacate_date,
          reason: vacateForm.reason
        }),
        credentials: 'include'
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
      
      const headers = getAuthHeaders();
      if (!headers) return;

      const endpoint = config.endpoints.tenant.cancelVacateNotice.replace(':notice_id', noticeId);
      console.log('Cancelling vacate notice at:', `${config.apiBaseUrl}${endpoint}`);
      
      const response = await fetch(`${config.apiBaseUrl}${endpoint}`, {
        method: 'POST',
        headers,
        credentials: 'include'
      });

      if (response.ok) {
        setSuccess('Vacate notice cancelled successfully');
        fetchAllData();
      } else {
        setError('Failed to cancel vacate notice');
      }
    } catch (err) {
      setError('Error cancelling notice: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // ==================== Add Debug Console Logs ====================
  useEffect(() => {
    console.log('Dashboard State:', {
      loading,
      dashboardData,
      profileData,
      paymentsData: paymentsData.length,
      vacateNotices: vacateNotices.length,
      showLeaseGate,
      leaseGateData,
      paymentDetails,
      fullLeaseDetails
    });
  }, [loading, dashboardData, profileData, paymentsData, vacateNotices, showLeaseGate, leaseGateData, paymentDetails, fullLeaseDetails]);

  // ==================== NEW: Render Lease Gate ====================
  if (showLeaseGate) {
    return (
      <div className="lease-gate-container">
        <div className="lease-gate-card">
          <div className="gate-header">
            <h1 className="gate-title">
              📋 Lease Agreement Required
            </h1>
            <p className="gate-subtitle">
              Before accessing your dashboard, please review and sign your lease agreement.
            </p>
          </div>

          {error && (
            <div className="alert alert-error">
              {error}
            </div>
          )}

          {leaseGateData ? (
            <div className="lease-summary">
              <h3 className="summary-title">Lease Summary</h3>
              <div className="summary-details">
                <div className="detail-row">
                  <span className="detail-label">Monthly Rent:</span>
                  <span className="detail-value">
                    KSh {leaseGateData.rent_amount?.toLocaleString() || '0'}
                  </span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Security Deposit:</span>
                  <span className="detail-value">
                    KSh {leaseGateData.deposit_amount?.toLocaleString() || '0'}
                  </span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Room Number:</span>
                  <span className="detail-value">
                    {leaseGateData.unit_number || 'N/A'}
                  </span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Property:</span>
                  <span className="detail-value">
                    {leaseGateData.property?.name || 'Joyce Suites Apartments'}
                  </span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Lease Status:</span>
                  <span className="detail-value">
                    {leaseGateData.signed_by_tenant ? '✅ Signed' : '❌ Not Signed'}
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <div className="no-lease-message">
              <h3>No Lease Found</h3>
              <p>Your registration was successful, but no lease was created.</p>
              <p>Please contact the caretaker to complete your lease setup.</p>
            </div>
          )}

          <div className="gate-actions">
            {leaseGateData && !leaseGateData.signed_by_tenant && (
              <button
                onClick={handleLeaseGateSignLease}
                className="btn btn-primary btn-sign"
              >
                Review & Sign Lease Agreement
              </button>
            )}

            <button
              onClick={handleLeaseGateSkip}
              className="btn btn-outline"
            >
              Skip for Now (Limited Access)
            </button>

            <button
              onClick={handleLeaseGateLogout}
              className="btn btn-secondary"
            >
              Logout
            </button>
          </div>

          <div className="gate-footer">
            <p className="footer-note">
              <strong>Important:</strong> Full access to payment features and maintenance requests 
              requires a signed lease agreement.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // ==================== Original Dashboard Render ====================
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

  // Get current room number and account details
  const roomNumber = dashboardData?.unit_number || profileData?.room_number || 'Not Assigned';
  const currentAccountDetails = accountDetails || getAccountDetails(roomNumber);
  
  const roomTypeDisplay = currentAccountDetails?.roomType === 'one_bedroom' ? '1-Bedroom' : 'Bedsitter';

  return (
    <div className="tenant-dashboard">
      <div className="dashboard-wrapper">
        <aside className="sidebar">
          <div className="sidebar-header">
            <img src={logo} alt="Logo" className="sidebar-logo" />
            <h2>Joyce Suites</h2>
          </div>

          <nav className="sidebar-nav">
            <button 
              className={`nav-item ${activeTab === 'dashboard' ? 'active' : ''}`}
              onClick={() => setActiveTab('dashboard')}
            >
              <span className="nav-icon">D</span>
              Dashboard
            </button>
            <button 
              className={`nav-item ${activeTab === 'payments' ? 'active' : ''}`}
              onClick={() => setActiveTab('payments')}
            >
              <span className="nav-icon">P</span>
              Payments
            </button>
            <button 
              className={`nav-item ${activeTab === 'profile' ? 'active' : ''}`}
              onClick={() => setActiveTab('profile')}
            >
              <span className="nav-icon">U</span>
              Profile
            </button>
            <button 
              className={`nav-item ${activeTab === 'lease' ? 'active' : ''}`}
              onClick={() => setActiveTab('lease')}
            >
              <span className="nav-icon">L</span>
              Lease
            </button>
            <button 
              className={`nav-item ${activeTab === 'vacate' ? 'active' : ''}`}
              onClick={() => setActiveTab('vacate')}
            >
              <span className="nav-icon">V</span>
              Vacate
            </button>
          </nav>

          <div className="sidebar-footer">
            <button onClick={handleLogout} className="logout-btn">
              <span className="nav-icon">X</span>
              Logout
            </button>
          </div>
        </aside>

        <main className="main-content">
          <header className="topbar">
            <div className="topbar-left">
              <h1>Joyce Suites Apartments</h1>
              <p className="breadcrumb">Welcome, {dashboardData.tenant_name || 'Tenant'}!</p>
            </div>

            <div className="topbar-right">
              <div className="user-avatar">
                <div className="avatar-placeholder">
                  {(dashboardData.tenant_name?.charAt(0) || 'T').toUpperCase()}
                </div>
              </div>
            </div>
          </header>

          {error && <div className="alert alert-error">{error}</div>}
          {success && <div className="alert alert-success">{success}</div>}

          {activeTab === 'dashboard' && (
            <div className="content">
              <div className="stats-grid">
                <div className="stat-card primary">
                  <div className="stat-icon">R</div>
                  <div className="stat-content">
                    <h3>Room Details</h3>
                    <p className="stat-value">Room {roomNumber}</p>
                    <p className="stat-label">{roomTypeDisplay} | Monthly: KSh {currentAccountDetails?.rentAmount.toLocaleString()}</p>
                  </div>
                </div>

                <div className="stat-card warning">
                  <div className="stat-icon">B</div>
                  <div className="stat-content">
                    <h3>Outstanding Balance</h3>
                    <p className="stat-value">KSh {(dashboardData.outstanding_balance || 0).toLocaleString()}</p>
                    <p className="stat-label">Balance due</p>
                  </div>
                </div>

                <div className="stat-card success">
                  <div className="stat-icon">L</div>
                  <div className="stat-content">
                    <h3>Account Details</h3>
                    <p className="stat-value">{currentAccountDetails?.accountNumber || 'N/A'}</p>
                    <p className="stat-label">Paybill: {currentAccountDetails?.paybill || 'N/A'}</p>
                  </div>
                </div>

                <div className="stat-card info">
                  <div className="stat-icon">M</div>
                  <div className="stat-content">
                    <h3>Deposit</h3>
                    <p className="stat-value">KSh {currentAccountDetails?.depositAmount.toLocaleString()}</p>
                    <p className="stat-label">Refundable deposit</p>
                  </div>
                </div>
              </div>

              <div className="quick-actions">
                <h3>Quick Actions</h3>
                <div className="action-buttons">
                  <button 
                    className="action-btn" 
                    onClick={handleOpenPaymentModal}
                    disabled={!dashboardData.lease_signed}
                  >
                    <span className="action-icon">Pay</span>
                    <span>Make Payment</span>
                    {!dashboardData.lease_signed && (
                      <span className="action-tooltip">Sign lease first</span>
                    )}
                  </button>
                  <button className="action-btn" onClick={() => setShowMaintenanceModal(true)}>
                    <span className="action-icon">Fix</span>
                    <span>Request Maintenance</span>
                  </button>
                  <button className="action-btn" onClick={handleOpenLeaseModal}>
                    <span className="action-icon">Doc</span>
                    <span>{dashboardData.lease_signed ? 'View Lease' : 'Sign Lease'}</span>
                  </button>
                  <button className="action-btn" onClick={() => setActiveTab('profile')}>
                    <span className="action-icon">Acc</span>
                    <span>Update Profile</span>
                  </button>
                </div>
              </div>

              <div className="gallery-section">
                <h3>Apartment Gallery</h3>
                <div className="gallery-container">
                  <div className="gallery-main">
                    <img 
                      src={apartmentImages[currentImageIndex]} 
                      alt="Apartment" 
                      className="gallery-image"
                    />
                    <div className="gallery-controls">
                      <button 
                        className="gallery-btn prev"
                        onClick={() => setCurrentImageIndex((prev) => 
                          prev === 0 ? apartmentImages.length - 1 : prev - 1
                        )}
                      >
                        Previous
                      </button>
                      <button 
                        className="gallery-btn next"
                        onClick={() => setCurrentImageIndex((prev) => 
                          (prev + 1) % apartmentImages.length
                        )}
                      >
                        Next
                      </button>
                    </div>
                    <div className="gallery-indicators">
                      {apartmentImages.map((_, index) => (
                        <span 
                          key={index}
                          className={`indicator ${index === currentImageIndex ? 'active' : ''}`}
                          onClick={() => setCurrentImageIndex(index)}
                        ></span>
                      ))}
                    </div>
                  </div>
                  <div className="gallery-thumbnails">
                    {apartmentImages.map((img, index) => (
                      <img 
                        key={index}
                        src={img} 
                        alt={`Apartment ${index + 1}`}
                        className={`thumbnail ${index === currentImageIndex ? 'active' : ''}`}
                        onClick={() => setCurrentImageIndex(index)}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'payments' && (
            <div className="content">
              <div className="card">
                <h3>Payment Details</h3>
                <div className="payment-account-info">
                  <div className="account-details">
                    <h4>Your Payment Account</h4>
                    <div className="detail-row">
                      <span className="detail-label">Room Number:</span>
                      <span className="detail-value">Room {roomNumber}</span>
                    </div>
                    <div className="detail-row">
                      <span className="detail-label">Account Number:</span>
                      <span className="detail-value">{currentAccountDetails?.accountNumber || 'N/A'}</span>
                    </div>
                    <div className="detail-row">
                      <span className="detail-label">Paybill Number:</span>
                      <span className="detail-value">{currentAccountDetails?.paybill || 'N/A'}</span>
                    </div>
                    <div className="detail-row">
                      <span className="detail-label">Landlord:</span>
                      <span className="detail-value">{currentAccountDetails?.landlordName || 'N/A'}</span>
                    </div>
                    <div className="detail-row">
                      <span className="detail-label">Monthly Rent:</span>
                      <span className="detail-value">KSh {currentAccountDetails?.rentAmount.toLocaleString()}</span>
                    </div>
                    <div className="detail-row">
                      <span className="detail-label">Deposit Paid:</span>
                      <span className="detail-value">KSh {currentAccountDetails?.depositAmount.toLocaleString()}</span>
                    </div>
                    <div className="detail-row">
                      <span className="detail-label">Lease Status:</span>
                      <span className="detail-value">
                        <span className={dashboardData.lease_signed ? 'status-success' : 'status-warning'}>
                          {dashboardData.lease_signed ? '✅ Signed' : '❌ Not Signed'}
                        </span>
                      </span>
                    </div>
                  </div>
                  <button 
                    onClick={handleOpenPaymentModal}
                    className="btn btn-primary"
                    style={{ marginTop: '20px' }}
                    disabled={!dashboardData.lease_signed}
                  >
                    {dashboardData.lease_signed ? 'Make Payment Now' : 'Sign Lease First'}
                  </button>
                  {!dashboardData.lease_signed && (
                    <p className="lease-required-note">
                      <small>You need to sign your lease agreement before making payments.</small>
                    </p>
                  )}
                </div>
              </div>

              <div className="card" style={{ marginTop: '24px' }}>
                <h3>Payment History</h3>
                <div className="table-container">
                  <table className="payments-table">
                    <thead>
                      <tr>
                        <th>Date</th>
                        <th>Amount</th>
                        <th>Status</th>
                        <th>Transaction ID</th>
                        <th>Method</th>
                      </tr>
                    </thead>
                    <tbody>
                      {paymentsData.length > 0 ? (
                        paymentsData.map((payment) => (
                          <tr key={payment.id}>
                            <td>{payment.created_at ? new Date(payment.created_at).toLocaleDateString() : 'N/A'}</td>
                            <td>KSh {payment.amount ? payment.amount.toLocaleString() : '0'}</td>
                            <td>
                              <span className={`status-badge status-${payment.status?.toLowerCase() || 'pending'}`}>
                                {payment.status || 'Pending'}
                              </span>
                            </td>
                            <td>{payment.transaction_id || 'N/A'}</td>
                            <td>{payment.payment_method || 'M-Pesa'}</td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="5" style={{ textAlign: 'center', padding: '20px' }}>
                            No payment history found
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'profile' && profileData && (
            <div className="content">
              <div className="card">
                <h3>My Profile</h3>
                <div className="profile-info">
                  <div className="profile-detail">
                    <label>Full Name:</label>
                    <p>{profileData.full_name || 'N/A'}</p>
                  </div>
                  <div className="profile-detail">
                    <label>Email:</label>
                    <p>{profileData.email || 'N/A'}</p>
                  </div>
                  <div className="profile-detail">
                    <label>Phone Number:</label>
                    <p>{profileData.phone_number || profileData.phone || 'N/A'}</p>
                  </div>
                  <div className="profile-detail">
                    <label>National ID:</label>
                    <p>{profileData.id_number || profileData.national_id || 'N/A'}</p>
                  </div>
                  <div className="profile-detail">
                    <label>Room Number:</label>
                    <p>Room {roomNumber}</p>
                  </div>
                  <div className="profile-detail">
                    <label>Account Number:</label>
                    <p>{currentAccountDetails?.accountNumber || 'N/A'}</p>
                  </div>
                  <div className="profile-detail">
                    <label>Paybill Number:</label>
                    <p>{currentAccountDetails?.paybill || 'N/A'}</p>
                  </div>
                  <div className="profile-detail">
                    <label>Landlord:</label>
                    <p>{currentAccountDetails?.landlordName || 'N/A'}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'lease' && (
            <div className="content">
              <div className="card">
                <h3>Lease Information</h3>
                <div className="lease-info">
                  <div className="lease-detail-row">
                    <span className="lease-label">Room Number:</span>
                    <span className="lease-value">Room {roomNumber}</span>
                  </div>
                  <div className="lease-detail-row">
                    <span className="lease-label">Room Type:</span>
                    <span className="lease-value">{roomTypeDisplay}</span>
                  </div>
                  <div className="lease-detail-row">
                    <span className="lease-label">Lease Status:</span>
                    <span className="lease-value">
                      {dashboardData.lease_signed ? '✅ Signed' : '❌ Not Signed'}
                    </span>
                  </div>
                  <div className="lease-detail-row">
                    <span className="lease-label">Property:</span>
                    <span className="lease-value">{dashboardData.property_name || 'Joyce Suites Apartments'}</span>
                  </div>
                  <div className="lease-detail-row">
                    <span className="lease-label">Monthly Rent:</span>
                    <span className="lease-value">KSh {currentAccountDetails?.rentAmount.toLocaleString()}</span>
                  </div>
                  <div className="lease-detail-row">
                    <span className="lease-label">Deposit Amount:</span>
                    <span className="lease-value">KSh {currentAccountDetails?.depositAmount.toLocaleString()}</span>
                  </div>
                  <div className="lease-detail-row">
                    <span className="lease-label">Landlord:</span>
                    <span className="lease-value">{currentAccountDetails?.landlordName || 'N/A'}</span>
                  </div>
                  {fullLeaseDetails && (
                    <>
                      <div className="lease-detail-row">
                        <span className="lease-label">Lease Start:</span>
                        <span className="lease-value">
                          {fullLeaseDetails.start_date ? new Date(fullLeaseDetails.start_date).toLocaleDateString() : 'N/A'}
                        </span>
                      </div>
                      <div className="lease-detail-row">
                        <span className="lease-label">Lease End:</span>
                        <span className="lease-value">
                          {fullLeaseDetails.end_date ? new Date(fullLeaseDetails.end_date).toLocaleDateString() : 'N/A'}
                        </span>
                      </div>
                    </>
                  )}
                </div>
                <button 
                  onClick={handleOpenLeaseModal} 
                  className="btn btn-primary" 
                  style={{ marginTop: '16px' }}
                  type="button"
                >
                  {dashboardData.lease_signed ? 'View Lease Agreement' : 'Sign Lease Agreement'}
                </button>
              </div>
            </div>
          )}

          {activeTab === 'vacate' && (
            <div className="content">
              <div className="card">
                <h3>Vacate Notices</h3>
                <button 
                  onClick={() => setShowVacateModal(true)}
                  className="btn btn-primary"
                  style={{ marginBottom: '16px' }}
                >
                  Submit New Vacate Notice
                </button>
                
                {vacateNotices.length > 0 ? (
                  <div className="table-container">
                    <table className="vacate-table">
                      <thead>
                        <tr>
                          <th>Notice Date</th>
                          <th>Intended Move Date</th>
                          <th>Reason</th>
                          <th>Status</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {vacateNotices.map((notice) => (
                          <tr key={notice.id}>
                            <td>{notice.notice_date ? new Date(notice.notice_date).toLocaleDateString() : 'N/A'}</td>
                            <td>{notice.intended_move_date ? new Date(notice.intended_move_date).toLocaleDateString() : 'N/A'}</td>
                            <td>{notice.reason || 'No reason provided'}</td>
                            <td>
                              <span className={`status-badge status-${notice.status?.toLowerCase() || 'pending'}`}>
                                {notice.status || 'Pending'}
                              </span>
                            </td>
                            <td>
                              {notice.status === 'pending' && (
                                <button 
                                  onClick={() => handleCancelVacateNotice(notice.id)}
                                  className="btn btn-danger btn-sm"
                                >
                                  Cancel
                                </button>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p style={{ textAlign: 'center', padding: '20px' }}>
                    No vacate notices submitted
                  </p>
                )}
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Footer - Now outside the wrapper */}
      <footer className="dashboard-footer">
        <div className="footer-content">
          <div className="footer-section">
            <h4>Joyce Suites Apartments</h4>
            <p>Quality student accommodation in a secure environment</p>
            <p><strong>Office Hours:</strong> Mon-Fri 8:00 AM - 5:00 PM</p>
            <p><strong>Emergency Contact:</strong> 0758 999322</p>
          </div>
          
          <div className="footer-section">
            <h4>Payment Information</h4>
            <div className="payment-info">
              <p><strong>Joyce Muthoni Mathea:</strong></p>
              <p>Paybill: 222111</p>
              <p>Account: Your room number</p>
              <p style={{ marginTop: '10px' }}><strong>Lawrence Mathea:</strong></p>
              <p>Paybill: 222222</p>
              <p>Account: Your room number</p>
            </div>
          </div>
          
          <div className="footer-section">
            <h4>Quick Links</h4>
            <ul className="footer-links">
              <li><button onClick={() => setActiveTab('dashboard')}>Dashboard</button></li>
              <li><button onClick={() => setActiveTab('payments')}>Make Payment</button></li>
              <li><button onClick={() => setShowMaintenanceModal(true)}>Maintenance Request</button></li>
              <li><button onClick={() => setActiveTab('lease')}>Lease Agreement</button></li>
            </ul>
          </div>
          
          <div className="footer-section">
            <h4>Contact Information</h4>
            <p><strong>Email:</strong> joycesuites@gmail.com</p>
            <p><strong>Phone:</strong> 0758 999322</p>
            <p><strong>Address:</strong> Joyce Suites Apartments, Thika Road</p>
            <p><strong>Website:</strong> www.joycesuites.com</p>
          </div>
        </div>
        
        <div className="footer-bottom">
          <div className="footer-bottom-content">
            <p>&copy; {new Date().getFullYear()} Joyce Suites Apartments. All rights reserved.</p>
            <div className="footer-legal">
              <span>Terms of Service</span>
              <span className="separator">|</span>
              <span>Privacy Policy</span>
              <span className="separator">|</span>
              <span>Version 1.0.0</span>
            </div>
          </div>
        </div>
      </footer>

      {/* Payment Modal */}
      {showPaymentModal && (
        <div className="modal-overlay" onClick={() => setShowPaymentModal(false)}>
          <div className="modal modal-payment" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setShowPaymentModal(false)}>×</button>
            <h2>Make Payment via M-Pesa</h2>
            
            {loadingPaymentDetails ? (
              <div className="loading-payment">
                <div className="spinner"></div>
                <p>Loading payment details...</p>
              </div>
            ) : paymentDetails ? (
              <div className="payment-modal-content">
                <div className="payment-summary">
                  <h3>Payment Summary</h3>
                  <div className="payment-detail">
                    <span className="detail-label">Room Number:</span>
                    <span className="detail-value">Room {roomNumber}</span>
                  </div>
                  <div className="payment-detail">
                    <span className="detail-label">Account Number:</span>
                    <span className="detail-value">{currentAccountDetails?.accountNumber}</span>
                  </div>
                  <div className="payment-detail">
                    <span className="detail-label">Paybill Number:</span>
                    <span className="detail-value">{currentAccountDetails?.paybill}</span>
                  </div>
                  <div className="payment-detail">
                    <span className="detail-label">Amount to Pay:</span>
                    <span className="detail-value amount">KSh {paymentDetails.rent_amount?.toLocaleString() || currentAccountDetails?.rentAmount.toLocaleString()}</span>
                  </div>
                  <div className="payment-note">
                    <p><strong>Note:</strong> Use the Paybill number and your room number as the account number when making manual payments.</p>
                  </div>
                </div>

                <div className="mpesa-form">
                  <h3>Quick M-Pesa Payment</h3>
                  <div className="form-group">
                    <label>Your M-Pesa Phone Number *</label>
                    <input 
                      type="tel"
                      placeholder="254712345678 or 0712345678"
                      value={mpesaPhone}
                      onChange={(e) => setMpesaPhone(e.target.value)}
                      required
                    />
                    <small className="form-help">Enter the phone number registered with M-Pesa</small>
                  </div>
                  
                  <div className="payment-instructions">
                    <h4>How to pay manually:</h4>
                    <ol>
                      <li>Go to M-Pesa on your phone</li>
                      <li>Select <strong>Lipa na M-Pesa</strong></li>
                      <li>Select <strong>Pay Bill</strong></li>
                      <li>Enter Paybill: <strong>{currentAccountDetails?.paybill}</strong></li>
                      <li>Enter Account: <strong>{currentAccountDetails?.accountNumber}</strong></li>
                      <li>Enter Amount: <strong>KSh {paymentDetails.rent_amount?.toLocaleString() || currentAccountDetails?.rentAmount.toLocaleString()}</strong></li>
                      <li>Enter your M-Pesa PIN</li>
                      <li>Confirm payment</li>
                    </ol>
                  </div>
                  
                  <button 
                    onClick={handleInitiateMpesa} 
                    className="btn btn-primary btn-block"
                    disabled={loading || !mpesaPhone}
                  >
                    {loading ? 'Processing...' : 'Send STK Push to Pay Now'}
                  </button>
                </div>
              </div>
            ) : (
              <div className="no-lease-payment">
                <h3>Payment Unavailable</h3>
                <p>You need to sign your lease agreement before making payments.</p>
                <button onClick={handleOpenLeaseModal} className="btn btn-primary">
                  Go to Lease Signing
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Maintenance Modal */}
      {showMaintenanceModal && (
        <div className="modal-overlay" onClick={() => setShowMaintenanceModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setShowMaintenanceModal(false)}>×</button>
            <h2>Request Maintenance</h2>
            <form onSubmit={handleSubmitMaintenance}>
              <div className="form-group">
                <label>Title *</label>
                <input 
                  type="text"
                  placeholder="e.g., Leaking faucet in bathroom"
                  value={maintenanceForm.title}
                  onChange={(e) => setMaintenanceForm({...maintenanceForm, title: e.target.value})}
                  required
                />
              </div>
              <div className="form-group">
                <label>Description *</label>
                <textarea 
                  placeholder="Describe the issue in detail..."
                  value={maintenanceForm.description}
                  onChange={(e) => setMaintenanceForm({...maintenanceForm, description: e.target.value})}
                  rows="4"
                  required
                />
              </div>
              <div className="form-group">
                <label>Priority</label>
                <select 
                  value={maintenanceForm.priority}
                  onChange={(e) => setMaintenanceForm({...maintenanceForm, priority: e.target.value})}
                >
                  <option value="low">Low</option>
                  <option value="normal">Normal</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>
              <div className="form-group">
                <label>Attach Photo (Optional, max 5MB)</label>
                <input 
                  type="file"
                  accept="image/*"
                  onChange={handleMaintenanceFileChange}
                />
              </div>
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? 'Submitting...' : 'Submit Request'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Vacate Notice Modal */}
      {showVacateModal && (
        <div className="modal-overlay" onClick={() => setShowVacateModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setShowVacateModal(false)}>×</button>
            <h2>Submit Vacate Notice</h2>
            <form onSubmit={handleSubmitVacateNotice}>
              <div className="form-group">
                <label>Intended Vacate Date *</label>
                <input 
                  type="date"
                  value={vacateForm.vacate_date}
                  onChange={(e) => setVacateForm({...vacateForm, vacate_date: e.target.value})}
                  min={minVacateDateString}
                  required
                />
                <small style={{ color: '#6B7280', marginTop: '4px', display: 'block' }}>
                  Must be at least 30 days from today
                </small>
              </div>
              <div className="form-group">
                <label>Reason (Optional)</label>
                <textarea 
                  placeholder="Why are you vacating?"
                  value={vacateForm.reason}
                  onChange={(e) => setVacateForm({...vacateForm, reason: e.target.value})}
                  rows="3"
                />
              </div>
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? 'Submitting...' : 'Submit Vacate Notice'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Lease Signing Modal */}
      {showLeaseModal && leaseData && (
        <div className="modal-overlay" onClick={() => setShowLeaseModal(false)}>
          <div className="modal modal-lease" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setShowLeaseModal(false)}>×</button>
            <div className="lease-modal-content">
              <div className="lease-document">
                <div className="lease-header">
                  <h1>Joyce Suites Apartments</h1>
                  <h2>House Lease Agreement</h2>
                </div>

                <div className="lease-section">
                  <p>This Lease Agreement is made and entered into on this <strong>{formattedDate}</strong></p>
                </div>

                <div className="lease-section">
                  <h3>LANDLORD:</h3>
                  <div className="lease-party-details">
                    <p><strong>{leaseData.landlord.name}</strong></p>
                    <p>Phone: {leaseData.landlord.phone}</p>
                    <p>Email: {leaseData.landlord.email}</p>
                    <p>Paybill: {leaseData.landlord.paybill}</p>
                    <p>Account: {leaseData.landlord.account}</p>
                  </div>
                </div>

                <div className="lease-section">
                  <h3>TENANT:</h3>
                  <div className="lease-party-details">
                    <p><strong>Name:</strong> {leaseData.tenant.fullName}</p>
                    <p><strong>ID No.:</strong> {leaseData.tenant.idNumber}</p>
                    <p><strong>Phone:</strong> {leaseData.tenant.phone}</p>
                    <p><strong>Email:</strong> {leaseData.tenant.email}</p>
                    <p><strong>Room Number:</strong> {leaseData.tenant.roomNumber}</p>
                  </div>
                </div>

                <div className="lease-section">
                  <h3>KEY TERMS:</h3>
                  <div className="lease-terms">
                    <p><strong>Monthly Rent:</strong> KSh {(leaseData.unit.rent_amount || 0).toLocaleString()}/=</p>
                    <p><strong>Deposit:</strong> KSh {(leaseData.unit.deposit_amount || 0).toLocaleString()}/= (Refundable)</p>
                    <p><strong>Room Type:</strong> {leaseData.unit.room_type?.replace('_', ' ').toUpperCase() || 'N/A'}</p>
                    <p><strong>Payment Due:</strong> 5th day of each month</p>
                    <p><strong>Lease Term:</strong> Month-to-month (30-day notice to terminate)</p>
                    <p><strong>Property:</strong> {leaseData.unit.property_name}</p>
                  </div>
                </div>

                <div className="lease-section">
                  <h3>PAYMENT INFORMATION:</h3>
                  <div className="payment-instructions">
                    <p><strong>Paybill Number:</strong> {leaseData.landlord.paybill}</p>
                    <p><strong>Account Number:</strong> {leaseData.landlord.account}</p>
                    <p><strong>Manual Payment:</strong> Use the Paybill and Account number above to pay via M-Pesa</p>
                    <p><strong>Auto-Payment:</strong> Available through tenant dashboard</p>
                  </div>
                </div>

                <div className="lease-section">
                  <h3>TERMS & CONDITIONS:</h3>
                  <ul className="terms-list">
                    <li>Tenant shall maintain premises in clean and habitable condition</li>
                    <li>Any damage beyond normal wear and tear is Tenant's responsibility</li>
                    <li>Noise restrictions: 10 PM - 8 AM (quiet hours)</li>
                    <li>Tenant must provide 30 days' notice to vacate</li>
                    <li>Unpaid rent and damages will be deducted from security deposit</li>
                    <li>Rent is due by the 5th of each month</li>
                    <li>Late payments attract a penalty of KSh 500 after 5th day</li>
                    <li>Governed by the laws of Kenya</li>
                  </ul>
                </div>
              </div>

              <div className="lease-signing-section">
                {error && <div className="alert alert-error">{error}</div>}
                {success && <div className="alert alert-success">{success}</div>}

                <div className="terms-acceptance">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={termsAccepted}
                      onChange={(e) => setTermsAccepted(e.target.checked)}
                    />
                    <span>I have read, understood, and agree to all the terms and conditions stated above.</span>
                  </label>
                </div>

                <div className="signature-section">
                  <label>Tenant's Digital Signature *</label>
                  <div className="signature-canvas-container">
                    <SignatureCanvas
                      ref={signatureRef}
                      onEnd={handleSignatureEnd}
                      canvasProps={{
                        width: 500,
                        height: 150,
                        className: 'signature-canvas'
                      }}
                    />
                  </div>
                  <button type="button" onClick={handleClearSignature} className="btn btn-secondary">
                    Clear Signature
                  </button>
                </div>

                <button
                  type="button"
                  onClick={handleSubmitLease}
                  className="btn btn-primary btn-sign-lease"
                  disabled={loading || !termsAccepted || signatureEmpty}
                >
                  {loading ? 'Submitting...' : 'Sign & Submit Lease Agreement'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TenantDashboard;