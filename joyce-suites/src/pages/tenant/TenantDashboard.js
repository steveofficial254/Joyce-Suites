import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, Menu, X } from 'lucide-react';
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

  const currentDate = new Date();
  const formattedDate = currentDate.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });


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

    if (validateToken()) {
      fetchAllData();
    }

    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % apartmentImages.length);
    }, 5000);
    return () => clearInterval(interval);
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
    } else if ([11, 13, 14, 15, 21, 23, 24, 25, 26].includes(roomNum)) {

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
    // Get current tenant's payment data from caretaker dashboard logic
    const currentTenantPayments = allTenantsPaymentStatus.find(t => t.tenant_id === user?.user_id);
    const currentTenantPending = allPayments.find(t => t.tenant_id === user?.user_id);
    
    return {
      rentStatus: currentTenantPayments?.current_month_paid ? 'paid' : 'unpaid',
      rentAmount: dashboardData?.rent_amount || 0,
      depositStatus: currentDeposit?.status || 'pending',
      depositAmount: currentAccountDetails?.depositAmount || 0,
      depositBalance: currentDeposit?.balance || currentAccountDetails?.depositAmount || 0,
      outstandingBalance: currentTenantPending?.outstanding_balance || calculateOutstandingBalance(),
      waterBillStatus: currentMonthWaterBill?.status || 'pending',
      waterBillAmount: currentMonthWaterBill?.amount_due || 0,
      totalPaid: paymentsData.filter(p => p.status === 'completed').reduce((sum, p) => sum + (p.amount || 0), 0),
      pendingCount: allPayments.filter(t => t.tenant_id === user?.user_id).length,
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

    const leaseResponse = await fetchLeaseData();
    const currentAccountDetails = getAccountDetails(dashboardData?.unit_number);

    if (leaseResponse) {
      setLeaseData({
        tenant: {
          fullName: profileData?.full_name || 'N/A',
          idNumber: profileData?.id_number || profileData?.national_id || 'N/A',
          phone: profileData?.phone_number || profileData?.phone || 'N/A',
          email: profileData?.email || 'N/A',
          roomNumber: dashboardData?.unit_number || 'N/A'
        },
        unit: {
          rent_amount: currentAccountDetails?.rentAmount || dashboardData?.rent_amount || 0,
          deposit_amount: currentAccountDetails?.depositAmount || 0,
          property_name: dashboardData?.property_name || `Room ${dashboardData?.unit_number}`,
          room_type: currentAccountDetails?.roomType || 'N/A'
        },
        landlord: {
          name: currentAccountDetails?.landlordName || 'N/A',
          phone: '0722870077',
          email: 'joycesuites@gmail.com',
          paybill: currentAccountDetails?.paybill || 'N/A',
          account: currentAccountDetails?.accountNumber || 'N/A'
        },
        lease: leaseResponse
      });
    } else {
      setLeaseData({
        tenant: {
          fullName: profileData?.full_name || 'N/A',
          idNumber: profileData?.id_number || profileData?.national_id || 'N/A',
          phone: profileData?.phone_number || profileData?.phone || 'N/A',
          email: profileData?.email || 'N/A',
          roomNumber: dashboardData?.unit_number || 'N/A'
        },
        unit: {
          rent_amount: currentAccountDetails?.rentAmount || dashboardData?.rent_amount || 0,
          deposit_amount: currentAccountDetails?.depositAmount || 0,
          property_name: dashboardData?.property_name || `Room ${dashboardData?.unit_number}`,
          room_type: currentAccountDetails?.roomType || 'N/A'
        },
        landlord: {
          name: currentAccountDetails?.landlordName || 'N/A',
          phone: '0722870077',
          email: 'joycesuites@gmail.com',
          paybill: currentAccountDetails?.paybill || 'N/A',
          account: currentAccountDetails?.accountNumber || 'N/A'
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
    <div className="tenant-dashboard">
      {/* Mobile Overlay */}
      <div
        className={`mobile-overlay ${mobileMenuOpen ? 'active' : ''}`}
        onClick={() => setMobileMenuOpen(false)}
      />

      <div className="dashboard-wrapper">
        <main className="main-content full-width">
          <header className="topbar">
            <div className="topbar-left">
              <h1>Joyce Suites Apartments</h1>
              <p className="breadcrumb">Welcome, {dashboardData.tenant_name || 'Tenant'}!</p>
            </div>

            <div className="topbar-right">
              {/* Desktop Navigation */}
              <nav className="topbar-nav desktop-only">
                <button
                  className={`topbar-nav-item ${activeTab === 'dashboard' ? 'active' : ''}`}
                  onClick={() => setActiveTab('dashboard')}
                >
                  Dashboard
                </button>
                <button
                  className={`topbar-nav-item ${activeTab === 'payments' ? 'active' : ''}`}
                  onClick={() => setActiveTab('payments')}
                >
                  Payments
                </button>
                <button
                  className={`topbar-nav-item ${activeTab === 'lease' ? 'active' : ''}`}
                  onClick={() => setActiveTab('lease')}
                >
                  Lease
                </button>
                <button
                  className={`topbar-nav-item ${activeTab === 'profile' ? 'active' : ''}`}
                  onClick={() => setActiveTab('profile')}
                >
                  Profile
                </button>
                <button
                  className={`topbar-nav-item ${activeTab === 'vacate' ? 'active' : ''}`}
                  onClick={() => setActiveTab('vacate')}
                >
                  Vacate
                </button>
              </nav>

              <div className="user-avatar desktop-only">
                {profilePhotoUrl ? (
                  <img
                    src={profilePhotoUrl}
                    alt="Profile"
                    loading="lazy"
                    className="avatar-image"
                    onError={(e) => {
                      console.error('❌ Avatar photo failed to load:', profilePhotoUrl);

                      if (profileData?.photo_path && !profileData.photo_path.startsWith('http')) {
                        e.target.src = `${config.apiBaseUrl}/${profileData.photo_path}`;
                      }
                    }}
                  />
                ) : (
                  <div className="avatar-placeholder">
                    {(profileData?.full_name?.charAt(0) || 'T').toUpperCase()}
                  </div>
                )}
              </div>

              <button
                className="icon-btn desktop-only"
                onClick={handleLogout}
                title="Logout"
              >
                <LogOut size={20} />
              </button>

              {/* Mobile Menu Toggle */}
              <button
                className="icon-btn mobile-menu-toggle"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </header>

          {/* Mobile Menu Dropdown */}
          {mobileMenuOpen && (
            <div className="mobile-menu-dropdown">
              <div className="mobile-user-info">
                <div className="user-avatar">
                  {profilePhotoUrl ? (
                    <img
                      src={profilePhotoUrl}
                      alt="Profile"
                      loading="lazy"
                      className="avatar-image"
                      onError={(e) => {
                        if (profileData?.photo_path && !profileData.photo_path.startsWith('http')) {
                          e.target.src = `${config.apiBaseUrl}/${profileData.photo_path}`;
                        }
                      }}
                    />
                  ) : (
                    <div className="avatar-placeholder">
                      {(profileData?.full_name?.charAt(0) || 'T').toUpperCase()}
                    </div>
                  )}
                </div>
                <span>{dashboardData.tenant_name || 'Tenant'}</span>
              </div>

              <button
                className={`mobile-nav-item ${activeTab === 'dashboard' ? 'active' : ''}`}
                onClick={() => { setActiveTab('dashboard'); setMobileMenuOpen(false); }}
              >
                Dashboard
              </button>
              <button
                className={`mobile-nav-item ${activeTab === 'payments' ? 'active' : ''}`}
                onClick={() => { setActiveTab('payments'); setMobileMenuOpen(false); }}
              >
                Payments
              </button>
              <button
                className={`mobile-nav-item ${activeTab === 'lease' ? 'active' : ''}`}
                onClick={() => { setActiveTab('lease'); setMobileMenuOpen(false); }}
              >
                Lease
              </button>
              <button
                className={`mobile-nav-item ${activeTab === 'profile' ? 'active' : ''}`}
                onClick={() => { setActiveTab('profile'); setMobileMenuOpen(false); }}
              >
                Profile
              </button>
              <button
                className={`mobile-nav-item ${activeTab === 'vacate' ? 'active' : ''}`}
                onClick={() => { setActiveTab('vacate'); setMobileMenuOpen(false); }}
              >
                Vacate
              </button>

              <div className="mobile-menu-divider"></div>

              <button className="mobile-nav-item logout" onClick={handleLogout}>
                <LogOut size={18} /> Logout
              </button>
            </div>
          )}

          {error && <div className="alert alert-error">{error}</div>}
          {success && <div className="alert alert-success">{success}</div>}

          {activeTab === 'dashboard' && (
            <div className="content">
              <div className="stats-grid">
                <div className="stat-card primary">
                  <div className="stat-content">
                    <h3>Room Details</h3>
                    <p className="stat-value">Room {roomNumber}</p>
                    <p className="stat-label">{roomTypeDisplay} | Monthly: KSh {currentAccountDetails?.rentAmount.toLocaleString()}</p>
                  </div>
                </div>

                <div className="stat-card warning">
                  <div className="stat-content">
                    <h3>Total Outstanding Balance</h3>
                    <p className="stat-value">
                      {(() => {
                        const rentBalance = currentMonthRent?.balance !== undefined ? parseFloat(currentMonthRent.balance) : 0;
                        const waterBalance = currentMonthWaterBill?.balance !== undefined ? parseFloat(currentMonthWaterBill.balance) : 0;
                        const totalBalance = rentBalance + waterBalance;


                        const outstanding = dashboardData?.outstanding_balance || 0;


                        const finalBalance = Math.max(totalBalance, outstanding);

                        if (finalBalance <= 0) {
                          return 'PAID';
                        } else {
                          return `KSh ${finalBalance.toLocaleString()}`;
                        }
                      })()}
                    </p>
                    <p className="stat-label">
                      {(() => {
                        const rentBalance = currentMonthRent?.balance !== undefined ? parseFloat(currentMonthRent.balance) : 0;
                        const waterBalance = currentMonthWaterBill?.balance !== undefined ? parseFloat(currentMonthWaterBill.balance) : 0;

                        if (rentBalance <= 0 && waterBalance <= 0) {
                          return 'All payments cleared';
                        } else {
                          return `Rent: ${rentBalance.toLocaleString()} + Water: ${waterBalance.toLocaleString()}`;
                        }
                      })()}
                    </p>
                  </div>
                </div>

                <div className="stat-card success">
                  <div className="stat-content">
                    <h3>Account Details</h3>
                    <p className="stat-value">{currentAccountDetails?.accountNumber || 'N/A'}</p>
                    <p className="stat-label">Paybill: {currentAccountDetails?.paybill || 'N/A'}</p>
                  </div>
                </div>

                <div className="stat-card info">
                  <div className="stat-content">
                    <h3>Deposit Status</h3>
                    <p className="stat-value">
                      {currentDeposit?.status === 'paid'
                        ? 'PAID'
                        : `KSh ${currentDeposit?.balance?.toLocaleString() || currentAccountDetails?.depositAmount?.toLocaleString() || 0}`
                      }
                    </p>
                    <p className="stat-label">
                      {currentDeposit?.status === 'paid'
                        ? `Paid on ${currentDeposit?.payment_date ? new Date(currentDeposit.payment_date).toLocaleDateString() : 'N/A'}`
                        : 'Refundable deposit'
                      }
                    </p>
                  </div>
                </div>
              </div>

              <div className="quick-actions">
                <h3 style={{ borderBottom: '1px solid #e5e7eb', paddingBottom: '12px', marginBottom: '20px' }}>Quick Actions</h3>
                <div className="action-buttons">
                  <button
                    className="action-btn"
                    onClick={handleOpenPaymentModal}
                    disabled={!fullLeaseDetails || !fullLeaseDetails.signed_by_tenant}
                    style={{
                      backgroundImage: `linear-gradient(rgba(0,0,0,0.6), rgba(0,0,0,0.6)), url(${logo})`,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      padding: '16px',
                      margin: '8px',
                      minWidth: '200px',
                      minHeight: '120px',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      transition: 'all 0.3s ease',
                      position: 'relative',
                      overflow: 'hidden',
                      cursor: 'pointer',
                      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.transform = 'scale(1.05)';
                      e.target.style.boxShadow = '0 8px 16px rgba(0, 0, 0, 0.2)';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.transform = 'scale(1)';
                      e.target.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.1)';
                    }}
                  >
                    <span className="action-icon"></span>
                    <span style={{ fontSize: '14px', fontWeight: '600', textAlign: 'center' }}>
                      {!fullLeaseDetails
                        ? 'Sign Lease First'
                        : !fullLeaseDetails.signed_by_tenant
                          ? 'Sign Lease to Pay'
                          : 'Make Payment'}
                    </span>
                  </button>
                  <button
                    className="action-btn"
                    onClick={() => setShowMaintenanceModal(true)}
                    style={{
                      backgroundImage: `linear-gradient(rgba(0,0,0,0.6), rgba(0,0,0,0.6)), url(${logo})`,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      padding: '16px',
                      margin: '8px',
                      minWidth: '200px',
                      minHeight: '120px',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      transition: 'all 0.3s ease',
                      position: 'relative',
                      overflow: 'hidden',
                      cursor: 'pointer',
                      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.transform = 'scale(1.05)';
                      e.target.style.boxShadow = '0 8px 16px rgba(0, 0, 0, 0.2)';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.transform = 'scale(1)';
                      e.target.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.1)';
                    }}
                  >
                    <span className="action-icon"></span>
                    <span style={{ fontSize: '14px', fontWeight: '600', textAlign: 'center' }}>Request Maintenance</span>
                  </button>
                  <button
                    className="action-btn"
                    onClick={handleOpenLeaseModal}
                    style={{
                      backgroundImage: `linear-gradient(rgba(0,0,0,0.6), rgba(0,0,0,0.6)), url(${logo})`,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      padding: '16px',
                      margin: '8px',
                      minWidth: '200px',
                      minHeight: '120px',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      transition: 'all 0.3s ease',
                      position: 'relative',
                      overflow: 'hidden',
                      cursor: 'pointer',
                      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.transform = 'scale(1.05)';
                      e.target.style.boxShadow = '0 8px 16px rgba(0, 0, 0, 0.2)';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.transform = 'scale(1)';
                      e.target.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.1)';
                    }}
                  >
                    <span className="action-icon"></span>
                    <span style={{ fontSize: '14px', fontWeight: '600', textAlign: 'center' }}>
                      {!fullLeaseDetails
                        ? 'Sign Lease'
                        : fullLeaseDetails.signed_by_tenant
                          ? 'View Lease'
                          : 'Complete Signing'}
                    </span>
                  </button>
                  <button
                    className="action-btn"
                    onClick={() => setActiveTab('profile')}
                    style={{
                      backgroundImage: `linear-gradient(rgba(0,0,0,0.6), rgba(0,0,0,0.6)), url(${logo})`,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      padding: '16px',
                      margin: '8px',
                      minWidth: '200px',
                      minHeight: '120px',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      transition: 'all 0.3s ease',
                      position: 'relative',
                      overflow: 'hidden',
                      cursor: 'pointer',
                      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.transform = 'scale(1.05)';
                      e.target.style.boxShadow = '0 8px 16px rgba(0, 0, 0, 0.2)';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.transform = 'scale(1)';
                      e.target.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.1)';
                    }}
                  >
                    <span className="action-icon"></span>
                    <span style={{ fontSize: '14px', fontWeight: '600', textAlign: 'center' }}>Update Profile</span>
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
                      loading="lazy"
                      className="gallery-image"
                    />
                    <div className="gallery-controls">
                      <button
                        className="gallery-btn prev"
                        onClick={() => setCurrentImageIndex((prev) =>
                          prev === 0 ? apartmentImages.length - 1 : prev - 1
                        )}
                      >
                        ← Previous
                      </button>
                      <button
                        className="gallery-btn next"
                        onClick={() => setCurrentImageIndex((prev) =>
                          (prev + 1) % apartmentImages.length
                        )}
                      >
                        Next →
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
                        loading="lazy"
                        className={`thumbnail ${index === currentImageIndex ? 'active' : ''}`}
                        onClick={() => setCurrentImageIndex(index)}
                      />
                    ))}
                  </div>
                </div>
              </div>

              { }
              <div className="card" style={{ marginTop: '24px' }}>
                <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <h3>Recent Notifications</h3>
                  <span className="badge" style={{ backgroundColor: '#EF4444', color: 'white', padding: '2px 8px', borderRadius: '12px', fontSize: '12px' }}>
                    {notifications.filter(n => !n.is_read).length} New
                  </span>
                </div>
                {notifications.length > 0 ? (
                  <div className="notification-list">
                    {notifications.slice(0, 5).map((notif) => (
                      <div key={notif.id} className={`notification-item ${notif.is_read ? 'read' : 'unread'}`} style={{
                        padding: '12px',
                        borderBottom: '1px solid #eee',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '4px',
                        opacity: notif.is_read ? 0.7 : 1,
                        backgroundColor: notif.is_read ? 'transparent' : '#F9FAFB'
                      }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <strong style={{ fontSize: '14px' }}>{notif.subject || 'System Notification'}</strong>
                          <small style={{ color: '#6B7280' }}>{new Date(notif.created_at).toLocaleDateString()}</small>
                        </div>
                        <p style={{ fontSize: '13px', margin: 0, color: '#374151' }}>{notif.message.length > 100 ? notif.message.substring(0, 100) + '...' : notif.message}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p style={{ textAlign: 'center', padding: '20px', color: '#6B7280' }}>No new notifications</p>
                )}
              </div>
            </div>
          )}

          {activeTab === 'payments' && (
            <div className="content">
              <div className="card">
                <h3>Payment Summary</h3>
                {(() => {
                  const summary = getPaymentSummary();
                  return (
                    <div className="payment-summary-grid">
                      <div className="payment-summary-card">
                        <h4>Monthly Rent</h4>
                        <div className="payment-amount">KSh {summary.rentAmount.toLocaleString()}</div>
                        <div className={`payment-status ${summary.rentStatus}`}>
                          {summary.rentStatus === 'paid' ? '✅ Paid' : '⏳ Unpaid'}
                        </div>
                      </div>
                      
                      <div className="payment-summary-card">
                        <h4>Deposit</h4>
                        <div className="payment-amount">KSh {summary.depositAmount.toLocaleString()}</div>
                        <div className={`payment-status ${summary.depositStatus}`}>
                          {summary.depositStatus === 'paid' ? '✅ Paid' : summary.depositStatus === 'refunded' ? '💰 Refunded' : '⏳ Pending'}
                        </div>
                        <div className="payment-balance">Balance: KSh {summary.depositBalance.toLocaleString()}</div>
                      </div>
                      
                      <div className="payment-summary-card">
                        <h4>Water Bill</h4>
                        <div className="payment-amount">KSh {summary.waterBillAmount.toLocaleString()}</div>
                        <div className={`payment-status ${summary.waterBillStatus}`}>
                          {summary.waterBillStatus === 'paid' ? '✅ Paid' : summary.waterBillStatus === 'overdue' ? '🚨 Overdue' : '⏳ Pending'}
                        </div>
                      </div>
                      
                      <div className="payment-summary-card">
                        <h4>Outstanding Balance</h4>
                        <div className="payment-amount overdue">KSh {summary.outstandingBalance.toLocaleString()}</div>
                        <div className="payment-status overdue">
                          {summary.outstandingBalance > 0 ? '💳 Due' : '✅ Clear'}
                        </div>
                      </div>
                      
                      <div className="payment-summary-card">
                        <h4>Total Paid This Month</h4>
                        <div className="payment-amount paid">KSh {summary.totalPaid.toLocaleString()}</div>
                        <div className="payment-status paid">
                          📊 {summary.pendingCount} pending payments
                        </div>
                      </div>
                      
                      {summary.lastPayment && (
                        <div className="payment-summary-card">
                          <h4>Last Payment</h4>
                          <div className="payment-amount">KSh {summary.lastPayment.amount?.toLocaleString() || 0}</div>
                          <div className="payment-status">
                            📅 {new Date(summary.lastPayment.created_at).toLocaleDateString()}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })()}
                
                <div className="payment-account-info">
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
                    <span className="detail-value">KSh {currentAccountDetails?.rentAmount?.toLocaleString() || 0}</span>
                  </div>
                </div>
                
                <div className="payment-actions">
                  <button className="btn btn-primary" onClick={handleOpenPaymentModal}>
                    Make Payment
                  </button>
                  <button className="btn btn-secondary" onClick={handleOpenLeaseModal}>
                    View Lease Agreement
                  </button>
                </div>
                
                <h3>Payment History</h3>
                <div className="table-container">
                  <table className="payments-table">
                    <thead>
                      <tr>
                        <th>Date</th>
                        <th>Amount</th>
                        <th>Status</th>
                        <th>Transaction ID</th>
                        <th>Action</th>
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
                            <td>
                              {payment.status === 'pending' && payment.checkout_request_id && (
                                <button
                                  className="btn btn-secondary btn-sm"
                                  onClick={() => handleCheckPaymentStatus(payment.checkout_request_id)}
                                  disabled={loading}
                                >
                                  Check Status
                                </button>
                              )}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="4" style={{ textAlign: 'center', padding: '20px' }}>
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
              <div className="card" style={{ marginBottom: '20px', backgroundColor: '#f8f9fa', border: '1px solid #dee2e6' }}>
                <h4>Profile Information</h4>
                <div className="debug-info" style={{ fontSize: '12px', fontFamily: 'monospace' }}>
                  <p><strong>Photo Path:</strong> {profileData.photo_path || 'Not set'}</p>
                  <p><strong>ID Document Path:</strong> {profileData.id_document_path || 'Not set'}</p>
                  <p><strong>Full Name:</strong> {profileData.full_name || 'N/A'}</p>
                  <p><strong>Email:</strong> {profileData.email || 'N/A'}</p>
                </div>
              </div>

              <div className="card">
                <h3>My Profile</h3>
                <div className="profile-section">
                  <div className="profile-header">
                    <div className="profile-photo-container">
                      {profileData?.photo_path ? (
                        <div className="photo-display">
                          <img
                            src={`${config.apiBaseUrl}/${profileData.photo_path}`}
                            alt="Profile"
                            loading="lazy"
                            className="profile-photo"
                            onError={(e) => {
                              console.error('❌ Failed to load profile photo from:', e.target.src);
                              if (profileData.photo_path && !profileData.photo_path.startsWith('http')) {
                                e.target.src = `${config.apiBaseUrl}/${profileData.photo_path}`;
                              }
                            }}
                            onLoad={() => { }}
                          />
                          <div className="photo-label">Profile Photo</div>
                        </div>
                      ) : profileData?.id_document_path ? (
                        <div className="photo-display">
                          <img
                            src={`${config.apiBaseUrl}/${profileData.id_document_path}`}
                            alt="ID Document"
                            loading="lazy"
                            className="profile-photo"
                            onError={(e) => {
                              console.error('❌ Failed to load ID document from:', e.target.src);
                              if (profileData.id_document_path && !profileData.id_document_path.startsWith('http')) {
                                e.target.src = `${config.apiBaseUrl}/${profileData.id_document_path}`;
                              }
                            }}
                            onLoad={() => { }}
                          />
                          <div className="photo-label">ID Document (Fallback)</div>
                        </div>
                      ) : (
                        <div className="profile-photo-placeholder">
                          {(profileData.full_name?.charAt(0) || 'T').toUpperCase()}
                          <div className="photo-label">No Photo Uploaded</div>
                        </div>
                      )}
                    </div>
                    <div className="profile-name">
                      <h4>{profileData.full_name || 'N/A'}</h4>
                      <p>Tenant | Room {roomNumber}</p>
                      <div className="profile-actions">
                        <button className="btn btn-secondary btn-sm" style={{ marginTop: '10px' }}>
                          Upload New Photo
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="profile-info-grid">
                    <div className="profile-detail">
                      <label>Email Address:</label>
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

                  {profileData.id_document_path && (
                    <div className="id-document-section">
                      <h4>ID Document</h4>
                      <a
                        href={`${config.apiBaseUrl}/${profileData.id_document_path}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn btn-secondary"
                      >
                        View ID Document
                      </a>
                    </div>
                  )}
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
                    <span className="lease-label">Status:</span>
                    <span className="lease-value">{fullLeaseDetails?.status || 'Not Signed'}</span>
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
                  <div className="lease-detail-row">
                    <span className="lease-label">Paybill:</span>
                    <span className="lease-value">{currentAccountDetails?.paybill || 'N/A'}</span>
                  </div>
                  <div className="lease-detail-row">
                    <span className="lease-label">Account Number:</span>
                    <span className="lease-value">{currentAccountDetails?.accountNumber || 'N/A'}</span>
                  </div>
                </div>
                <button
                  onClick={handleOpenLeaseModal}
                  className="btn btn-primary"
                  style={{ marginTop: '16px' }}
                  type="button"
                >
                  {!fullLeaseDetails
                    ? 'Sign Lease Agreement'
                    : fullLeaseDetails.signed_by_tenant
                      ? 'View Lease Agreement'
                      : 'Complete Lease Signing'}
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
                            <td>{notice.created_at ? new Date(notice.created_at).toLocaleDateString() : 'N/A'}</td>
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

      <footer className="dashboard-footer">
        <div className="footer-content">
          <div className="footer-section">
            <h4>Joyce Suites Apartments</h4>
            <p>Quality accommodation in a secure environment</p>
            <p><strong>Office Hours:</strong> Mon-Fri 8:00 AM - 5:00 PM</p>
            <p><strong>Emergency Contact:</strong> 0722870077</p>
          </div>

          <div className="footer-section">
            <h4>Your Payment Information</h4>
            <div className="payment-info">
              <p><strong>Paybill:</strong> {currentAccountDetails?.paybill || 'N/A'}</p>
              <p><strong>Account:</strong> {currentAccountDetails?.accountNumber || 'N/A'}</p>
              <p><strong>Landlord:</strong> {currentAccountDetails?.landlordName || 'N/A'}</p>
              <p><strong>Monthly Rent:</strong> KSh {currentAccountDetails?.rentAmount.toLocaleString()}</p>
            </div>
          </div>

          <div className="footer-section">
            <h4>Quick Links</h4>
            <ul className="footer-links">
              <li><button onClick={() => setActiveTab('dashboard')}>Dashboard</button></li>
              <li><button onClick={handleOpenPaymentModal} disabled={!fullLeaseDetails || !fullLeaseDetails.signed_by_tenant}>Make Payment</button></li>
              <li><button onClick={() => setShowMaintenanceModal(true)}>Maintenance Request</button></li>
              <li><button onClick={handleOpenLeaseModal}>Lease Agreement</button></li>
            </ul>
          </div>

          <div className="footer-section">
            <h4>Contact Information</h4>
            <p><strong>Email:</strong> joycesuites@gmail.com</p>
            <p><strong>Phone:</strong> 0722870077</p>
            <p><strong>Address:</strong> Joyce Suites Apartments, Nyandarua, Olkalou</p>
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
                      <span className="detail-value amount">KSh {paymentDetails.outstanding_balance?.toLocaleString() || paymentDetails.rent_amount?.toLocaleString() || currentAccountDetails?.rentAmount.toLocaleString()}</span>
                    </div>
                    <div className="payment-note">
                      <p><strong>Note:</strong> Use the Paybill number and account number when making manual payments.</p>
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
                        <li>Enter Amount: <strong>KSh {paymentDetails.outstanding_balance?.toLocaleString() || paymentDetails.rent_amount?.toLocaleString() || currentAccountDetails?.rentAmount.toLocaleString()}</strong></li>
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
        )
      }

      { }
      {
        showMaintenanceModal && (
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
                    onChange={(e) => setMaintenanceForm({ ...maintenanceForm, title: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Description *</label>
                  <textarea
                    placeholder="Describe the issue in detail..."
                    value={maintenanceForm.description}
                    onChange={(e) => setMaintenanceForm({ ...maintenanceForm, description: e.target.value })}
                    rows="4"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Priority</label>
                  <select
                    value={maintenanceForm.priority}
                    onChange={(e) => setMaintenanceForm({ ...maintenanceForm, priority: e.target.value })}
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
                    onChange={(e) => setMaintenanceForm({ ...maintenanceForm, file: e.target.files[0] })}
                  />
                </div>
                <div className="form-actions">
                  <button type="submit" className="btn btn-primary" disabled={loading}>
                    {loading ? 'Submitting...' : 'Submit Request'}
                  </button>
                  <button type="button" className="btn btn-secondary" onClick={() => setShowMaintenanceModal(false)}>
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )
      }

      {
        showVacateModal && (
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
                    onChange={(e) => setVacateForm({ ...vacateForm, vacate_date: e.target.value })}
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
                    onChange={(e) => setVacateForm({ ...vacateForm, reason: e.target.value })}
                    rows="3"
                  />
                </div>
                <div className="form-actions">
                  <button type="submit" className="btn btn-primary" disabled={loading}>
                    {loading ? 'Submitting...' : 'Submit Vacate Notice'}
                  </button>
                  <button type="button" className="btn btn-secondary" onClick={() => setShowVacateModal(false)}>
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )
      }

      { }
      {
        showLeaseModal && leaseData && (
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
                      <li>Governed by the laws of Kenya</li>
                    </ul>
                  </div>
                </div>

                { }
                {(!fullLeaseDetails || (fullLeaseDetails && !fullLeaseDetails.signed_by_tenant)) ? (
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
                ) : (
                  <div className="lease-already-signed">
                    <div className="alert alert-success">
                      <h3>✓ Lease Agreement Signed</h3>
                      <p>You have already signed the lease agreement on {fullLeaseDetails.signed_at ? new Date(fullLeaseDetails.signed_at).toLocaleDateString() : 'N/A'}.</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )
      }
    </div >
  );
};

export default TenantDashboard;