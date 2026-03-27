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
const apartmentImages = [
  require('../../assets/image1.png'),
  require('../../assets/image12.jpg'),
  require('../../assets/image22.jpg'),
  require('../../assets/image10.jpg'),
  require('../../assets/image8.jpg'),
  require('../../assets/image11.jpg')
];
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



  // getAccountDetails removed in favor of dynamic backend data


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
            await fetchRoomDetails(data.user.room_number);
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

        // Map backend room data to the accountDetails format used in UI
        setAccountDetails({
          roomNumber: data.room.room_number,
          roomType: data.room.property_type,
          rentAmount: data.room.rent_amount,
          depositAmount: data.room.deposit_amount,
          landlordName: data.room.landlord?.name || 'Not Assigned',
          paybill: data.room.paybill_number,
          accountNumber: data.room.account_number,
          fullAccountName: `${data.room.account_number} - ${data.room.landlord?.name || 'Not Assigned'}`
        });

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
      if (response.status === 400 || response.status === 404) {
        const data = await response.json();
        setError(data.error || 'Please sign your lease agreement first.');
        setShowPaymentModal(false);
        return null;
      }
    } catch (err) {
      console.error('Error fetching payment details:', err);
      setError('Communication error with server. Please try again.');
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

    // Check if lease is already signed
    if (fullLeaseDetails?.signed_by_tenant) {
      setError('Lease agreement is already signed. You cannot sign it again.');
      return;
    }

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

  const handleProfilePhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('Photo size must be less than 5MB');
      return;
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file');
      return;
    }

    try {
      setLoading(true);
      setError('');
      
      const formData = new FormData();
      formData.append('photo', file);

      const response = await fetchWithAuth(`${config.apiBaseUrl}/api/tenant/upload-photo`, {
        method: 'POST',
        body: formData,
        headers: {
          // Don't set Content-Type when using FormData
        }
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess('Profile photo uploaded successfully!');
        await fetchUserProfile(); // Refresh profile data
      } else {
        setError(data.error || 'Failed to upload photo');
      }
    } catch (err) {
      console.error('Photo upload error:', err);
      setError('Error uploading photo: ' + err.message);
    } finally {
      setLoading(false);
    }
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
  const currentAccountDetails = accountDetails;


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
      {/* Sidebar */}
      <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <h2 className="sidebar-title">Joyce Suites</h2>
          {isMobile && <button onClick={() => setSidebarOpen(false)} className="menu-toggle"><X size={20} /></button>}
        </div>
        <nav className="sidebar-nav">
          <button className={`nav-item ${activeTab === 'dashboard' ? 'active' : ''}`} onClick={() => { setActiveTab('dashboard'); if (isMobile) setSidebarOpen(false); }}><Home size={18} /> Dashboard</button>
          <button className={`nav-item ${activeTab === 'payments' ? 'active' : ''}`} onClick={() => { setActiveTab('payments'); if (isMobile) setSidebarOpen(false); }}><CreditCard size={18} /> Payments</button>
          <button className={`nav-item ${activeTab === 'lease' ? 'active' : ''}`} onClick={() => { setActiveTab('lease'); if (isMobile) setSidebarOpen(false); }}><FileText size={18} /> Lease Agreement</button>
          <button className={`nav-item ${activeTab === 'profile' ? 'active' : ''}`} onClick={() => { setActiveTab('profile'); if (isMobile) setSidebarOpen(false); }}><UserIcon size={18} /> Profile</button>
          <button className={`nav-item ${activeTab === 'vacate' ? 'active' : ''}`} onClick={() => { setActiveTab('vacate'); if (isMobile) setSidebarOpen(false); }}><DoorOpen size={18} /> Vacate Notice</button>
        </nav>
        <div style={{ padding: '24px', borderTop: '1px solid #374151', marginTop: 'auto' }}>
          <button onClick={handleLogout} className="nav-item" style={{ color: '#ef4444' }}><LogOut size={18} /> Logout</button>
        </div>
      </aside>

      {/* Main Content */}
      <main className={`main-content ${!sidebarOpen ? 'full-width' : ''}`}>
        <header className="header">
          <div className="header-left">
            <button onClick={() => setSidebarOpen(!sidebarOpen)} className="menu-toggle"><Menu size={24} /></button>
            <h1 style={{ fontSize: '18px', fontWeight: '600', margin: 0 }}>Joyce Suites Apartments</h1>
          </div>
          <div className="header-right">
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '14px', fontWeight: '600' }}>Welcome, {profileData?.full_name || 'Tenant'}!</div>
            </div>
          </div>
        </header>

        {/* Navigation Bar */}
        <nav className="nav-bar">
          <div className="nav-tabs">
            {['dashboard', 'payments', 'lease', 'profile', 'vacate'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`nav-tab ${activeTab === tab ? 'active' : ''}`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>
        </nav>

        <section className="content">
          {error && <div className="alert alert-error">{error}</div>}
          {success && <div className="alert alert-success">{success}</div>}

          {activeTab === 'dashboard' && (
            <div>
              <div className="stat-grid">
                <div className="stat-card" style={{ backgroundColor: '#3b82f6' }}>
                  <span style={{ fontSize: '14px', opacity: 0.9 }}>Room Details</span>
                  <span style={{ fontSize: '24px', fontWeight: '700' }}>Room {roomNumber}</span>
                  <span style={{ fontSize: '12px', opacity: 0.8 }}>{roomTypeDisplay}</span>
                </div>
                <div className="stat-card" style={{ backgroundColor: '#f59e0b' }}>
                  <span style={{ fontSize: '14px', opacity: 0.9 }}>Outstanding Balance</span>
                  <span style={{ fontSize: '24px', fontWeight: '700' }}>
                    {outstandingBalance <= 0 ? 'CLEARED' : `KSh ${outstandingBalance.toLocaleString()}`}
                  </span>
                  <span style={{ fontSize: '12px', opacity: 0.8 }}>Rent & Water</span>
                </div>
                <div className="stat-card" style={{ backgroundColor: '#10b981' }}>
                  <span style={{ fontSize: '14px', opacity: 0.9 }}>Lease Status</span>
                  <span style={{ fontSize: '24px', fontWeight: '700' }}>{fullLeaseDetails?.status || 'Active'}</span>
                  <span style={{ fontSize: '12px', opacity: 0.8 }}>{fullLeaseDetails?.signed_at ? 'Signed' : 'Pending Signature'}</span>
                </div>
              </div>

              <div className="card">
                <h3 className="card-title">Common Actions</h3>
                <div className="action-buttons">
                  <button onClick={handleOpenPaymentModal} className="btn btn-primary">
                    <CreditCard size={18} /> Make Payment
                  </button>
                  <button onClick={() => setShowMaintenanceModal(true)} className="btn btn-secondary">
                    <Wrench size={18} /> Request Maintenance
                  </button>
                  <button onClick={handleOpenLeaseModal} className="btn btn-secondary">
                    <FileText size={18} /> Lease Information
                  </button>
                </div>
              </div>

              <div className="card">
                <h3 className="card-title">Recent Notifications</h3>
                {notifications.length > 0 ? (
                  <div className="notification-list">
                    {notifications.slice(0, 3).map(n => (
                      <div key={n.id} className={`notification-item ${!n.is_read ? 'unread' : ''}`}>
                        <div className="notification-title">{n.title || 'Notification'}</div>
                        <div className="notification-message">{n.message}</div>
                        <div className="notification-date">{new Date(n.created_at).toLocaleDateString()}</div>
                      </div>
                    ))}
                  </div>
                ) : <p style={{ color: '#64748b' }}>No recent notifications</p>}
              </div>

              {/* Apartment Gallery */}
              <div className="card">
                <h3 className="card-title">Apartment Gallery</h3>
                <div className="apartment-gallery">
                  {apartmentImages.map((image, index) => (
                    <img 
                      key={index}
                      src={image} 
                      alt={`Apartment ${index + 1}`}
                      className="apartment-image"
                    />
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'payments' && (
            <div className="card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <h3 className="card-title" style={{ margin: 0 }}>Payment History</h3>
                <button onClick={handleOpenPaymentModal} className="btn btn-primary">New Payment</button>
              </div>
              <div className="table-container">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Reference</th>
                      <th>Amount</th>
                      <th>Type</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paymentsData.length > 0 ? paymentsData.map(p => (
                      <tr key={p.id}>
                        <td>{new Date(p.created_at).toLocaleDateString()}</td>
                        <td>{p.transaction_id || p.merchant_request_id}</td>
                        <td style={{ fontWeight: '600' }}>KSh {p.amount.toLocaleString()}</td>
                        <td>{p.payment_type}</td>
                        <td>
                          <span className={`status-badge status-${p.status === 'completed' ? 'paid' : p.status === 'pending' ? 'pending' : 'overdue'}`}>
                            {p.status}
                          </span>
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
                  <button onClick={handleOpenLeaseModal} style={{ padding: '8px 16px', backgroundColor: '#3b82f6', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>{fullLeaseDetails?.signed_by_tenant ? 'View Signed Lease' : 'Sign Lease Now'}</button>
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
            <div>
              {/* Profile Information Section */}
              <div className="card">
                <h3 className="card-title">Profile Information</h3>
                <div className="profile-info">
                  <div className="info-row">
                    <span className="info-label">Photo Path:</span>
                    <span className="info-value">
                      {profileData?.photo_path || 'Not set'}
                    </span>
                  </div>
                  <div className="info-row">
                    <span className="info-label">ID Document Path:</span>
                    <span className="info-value">
                      {profileData?.id_document_path || 'Not set'}
                    </span>
                  </div>
                  <div className="info-row">
                    <span className="info-label">Full Name:</span>
                    <span className="info-value">
                      {profileData?.full_name || 'N/A'}
                    </span>
                  </div>
                  <div className="info-row">
                    <span className="info-label">Email:</span>
                    <span className="info-value">
                      {profileData?.email || 'N/A'}
                    </span>
                  </div>
                </div>
              </div>

              {/* My Profile Section */}
              <div className="card">
                <h3 className="card-title">My Profile</h3>
                <div className="profile-section">
                  {/* Profile Photo Section */}
                  <div className="profile-photo-section">
                    <div className="profile-photo-container">
                      {profilePhotoUrl ? (
                        <img 
                          src={profilePhotoUrl} 
                          alt="Profile" 
                          className="profile-photo"
                        />
                      ) : (
                        <div className="profile-photo-placeholder">
                          <UserIcon size={40} />
                          <div style={{ fontSize: '12px', marginTop: '4px' }}>Profile Photo</div>
                        </div>
                      )}
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <input
                        type="file"
                        id="photo-upload"
                        accept="image/*"
                        style={{ display: 'none' }}
                        onChange={handleProfilePhotoUpload}
                      />
                      <label
                        htmlFor="photo-upload"
                        className="upload-button"
                      >
                        Upload New Photo
                      </label>
                    </div>
                  </div>

                  {/* Profile Details Section */}
                  <div className="profile-details">
                    <div>
                      <h2 className="user-name">
                        {profileData?.full_name || 'Loading...'}
                      </h2>
                      <div className="user-meta">
                        <span>Tenant</span>
                        <span>|</span>
                        <span>Room {roomNumber}</span>
                      </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                      <div className="form-group">
                        <label className="form-label">
                          Email Address:
                        </label>
                        <input
                          type="email"
                          value={profileData?.email || ''}
                          readOnly
                          className="form-input"
                        />
                      </div>

                      <div className="form-group">
                        <label className="form-label">
                          Phone Number:
                        </label>
                        <input
                          type="tel"
                          value={profileData?.phone_number || ''}
                          readOnly
                          className="form-input"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'vacate' && (
            <div className="card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <h3 className="card-title" style={{ margin: 0 }}>Vacate Notices</h3>
                <button onClick={() => setShowVacateModal(true)} className="btn btn-primary">Submit New Notice</button>
              </div>
              {vacateNotices.length > 0 ? (
                <div className="table-container">
                  <table className="table">
                    <thead>
                      <tr>
                        <th>Submission Date</th>
                        <th>Vacate Date</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {vacateNotices.map(v => (
                        <tr key={v.id}>
                          <td>{new Date(v.created_at).toLocaleDateString()}</td>
                          <td>{new Date(v.vacate_date).toLocaleDateString()}</td>
                          <td>
                            <span className={`status-badge status-${v.status === 'pending' ? 'pending' : v.status === 'approved' ? 'paid' : 'overdue'}`}>
                              {v.status}
                            </span>
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

        {/* Footer */}
        <footer className="footer">
          <div className="footer-content">
            {/* More Actions Section */}
            <div className="footer-actions">
              <h3 className="footer-actions-title">More Actions</h3>
              <div className="footer-actions-buttons">
                <button onClick={handleOpenPaymentModal} className="footer-action-btn">
                  <CreditCard size={18} /> Make Payment
                </button>
                <button onClick={() => setShowMaintenanceModal(true)} className="footer-action-btn">
                  <Wrench size={18} /> Maintenance
                </button>
                <button onClick={handleOpenLeaseModal} className="footer-action-btn">
                  <FileText size={18} /> {fullLeaseDetails?.signed_by_tenant ? 'View Lease' : 'Sign Lease'}
                </button>
                <button onClick={() => setActiveTab('profile')} className="footer-action-btn">
                  <UserIcon size={18} /> Update Profile
                </button>
              </div>
            </div>

            {/* Footer Bottom - Horizontal Alignment */}
            <div className="footer-bottom">
              <div className="footer-bottom-content">
                <div className="footer-section">
                  <h4 className="footer-title">Joyce Suites</h4>
                  <p>Providing quality apartments for comfortable living</p>
                </div>
                
                <div className="footer-section">
                  <h4 className="footer-title">Quick Links</h4>
                  <div className="footer-links-horizontal">
                    <a href="#dashboard">Dashboard</a>
                    <a href="#payments">Payments</a>
                    <a href="#maintenance">Maintenance</a>
                    <a href="#profile">Profile</a>
                  </div>
                </div>
                
                <div className="footer-section">
                  <h4 className="footer-title">Contact</h4>
                  <div className="footer-links-horizontal">
                    <a href="mailto:info@joycesuites.com">info@joycesuites.com</a>
                    <a href="tel:+254729175330">+254 729 175 330</a>
                    <a href="#location">Nairobi, Kenya</a>
                  </div>
                </div>
              </div>
              
              <div className="footer-copyright">
                <p>&copy; 2024 Joyce Suites Apartments. All rights reserved.</p>
                <p>Designed with ❤️ for comfortable living</p>
              </div>
            </div>
          </div>
        </footer>
      </main>

      {/* Modals */}
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
            <button onClick={handleInitiateMpesa} disabled={loading} style={{ width: '100%', padding: '12px', backgroundColor: '#3b82f6', color: 'white', border: 'none', borderRadius: '8px', fontWeight: '600' }}>
              {loading ? 'Processing...' : 'Pay with M-Pesa'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default TenantDashboard;
