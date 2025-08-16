import React, { useState, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { LoginScreen } from './auth/LoginScreen';
import { RegisterScreen } from './auth/RegisterScreen';
import { EmailVerificationScreen } from './auth/EmailVerificationScreen';
import { ForgotPasswordScreen } from './auth/ForgotPasswordScreen';
import { AdminDashboard } from './dashboard/AdminDashboard';
import { PastorDashboard } from './dashboard/PastorDashboard';
import { MemberDashboard } from './dashboard/MemberDashboard';
import { CreateDonationScreen } from './donations/CreateDonationScreen';
import { DonationsListScreen } from './donations/DonationsListScreen';
import { useLeadTracking } from '../hooks/useLeadTracking';

interface PendingRegistrationData {
  email: string;
  password: string;
  fullName: string;
  phone: string;
  address?: {
    street: string;
    number: string;
    neighborhood: string;
    city: string;
    state: string;
    zipCode: string;
  };
}

type Screen =
  | 'login'
  | 'register'
  | 'email-verification'
  | 'forgot-password'
  | 'admin-dashboard'
  | 'pastor-dashboard'
  | 'member-dashboard'
  | 'create-donation'
  | 'donations-list';
type UserRole = 'admin' | 'pastor' | 'deacon' | 'leader' | 'member';

export const AppMain: React.FC = () => {
  const [currentScreen, setCurrentScreen] = useState<Screen>('login');
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [pendingRegistrationData, setPendingRegistrationData] =
    useState<PendingRegistrationData | null>(null);

  const { trackLead, detectDeviceInfo, captureUrlTrackingData } =
    useLeadTracking();

  const handleNavigateToEmailVerification = (data: PendingRegistrationData) => {
    setPendingRegistrationData(data);
    setCurrentScreen('email-verification');
  };

  useEffect(() => {
    const trackAppAccess = async () => {
      try {
        // Only track app access for authenticated users
        if (!userId) {
          console.log('Skipping app access tracking for unauthenticated user');
          return;
        }

        const deviceInfo = detectDeviceInfo();
        const currentUrl =
          typeof window !== 'undefined' && window.location
            ? window.location.href
            : 'app://igreja-oliveira';
        const urlData = captureUrlTrackingData(currentUrl);

        await trackLead({
          userId,
          ...urlData,
          ...deviceInfo,
          conversionType: 'lead_capture',
        });
      } catch (error) {
        console.error('Error tracking app access:', error);
      }
    };

    // Only run tracking when userId changes and is not null
    if (userId) {
      trackAppAccess();
    }
  }, [userId]);

  const handleLoginSuccess = (role: UserRole, userId?: string) => {
    setUserRole(role);
    if (userId) {
      setUserId(userId);
    }
    switch (role) {
      case 'admin':
        setCurrentScreen('admin-dashboard');
        break;
      case 'pastor':
        setCurrentScreen('pastor-dashboard');
        break;
      case 'deacon':
      case 'leader':
      case 'member':
        setCurrentScreen('member-dashboard');
        break;
    }
  };

  const handleLogout = () => {
    setUserRole(null);
    setUserId(null);
    setCurrentScreen('login');
  };

  const renderScreen = () => {
    switch (currentScreen) {
      case 'login':
        return (
          <LoginScreen
            onLoginSuccess={handleLoginSuccess}
            onNavigateToRegister={() => setCurrentScreen('register')}
            onNavigateToForgotPassword={() =>
              setCurrentScreen('forgot-password')
            }
          />
        );

      case 'register':
        return (
          <RegisterScreen
            onNavigateToLogin={() => setCurrentScreen('login')}
            onRegisterSuccess={() => setCurrentScreen('login')}
            onNavigateToEmailVerification={handleNavigateToEmailVerification}
          />
        );

      case 'email-verification':
        return (
          <EmailVerificationScreen
            email={pendingRegistrationData?.email || ''}
            pendingData={pendingRegistrationData}
            onVerified={() => {
              setPendingRegistrationData(null);
              setCurrentScreen('login');
            }}
            onNavigateBack={() => {
              setPendingRegistrationData(null);
              setCurrentScreen('register');
            }}
          />
        );

      case 'forgot-password':
        return (
          <ForgotPasswordScreen
            onNavigateBack={() => setCurrentScreen('login')}
            onNavigateToLogin={() => setCurrentScreen('login')}
            onPasswordResetSent={() => setCurrentScreen('login')}
          />
        );

      case 'admin-dashboard':
        return (
          <AdminDashboard
            onNavigateToCreateDonation={() =>
              setCurrentScreen('create-donation')
            }
            onNavigateToDonationsList={() => setCurrentScreen('donations-list')}
            onNavigateToMembers={() => console.log('Navigate to members')}
            onNavigateToDonations={() => setCurrentScreen('donations-list')}
            onNavigateToReports={() => console.log('Navigate to reports')}
            onNavigateToSettings={() => console.log('Navigate to settings')}
            onLogout={handleLogout}
          />
        );

      case 'pastor-dashboard':
        return (
          <PastorDashboard
            onNavigateToCreateDonation={() =>
              setCurrentScreen('create-donation')
            }
            onNavigateToDonationsList={() => setCurrentScreen('donations-list')}
            onNavigateToMembers={() => console.log('Navigate to members')}
            onNavigateToDonations={() => setCurrentScreen('donations-list')}
            onNavigateToMinistries={() => console.log('Navigate to ministries')}
            onNavigateToSettings={() => console.log('Navigate to settings')}
            onLogout={handleLogout}
          />
        );

      case 'member-dashboard':
        return (
          <MemberDashboard
            onNavigateToCreateDonation={() =>
              setCurrentScreen('create-donation')
            }
            onNavigateToDonationsList={() => setCurrentScreen('donations-list')}
            onNavigateToMyDonations={() => setCurrentScreen('donations-list')}
            onNavigateToMyProfile={() => console.log('Navigate to my profile')}
            onNavigateToEvents={() => console.log('Navigate to events')}
            onNavigateToSettings={() => console.log('Navigate to settings')}
            onLogout={handleLogout}
          />
        );

      case 'create-donation':
        return (
          <CreateDonationScreen
            onNavigateBack={() => {
              if (userRole === 'admin') setCurrentScreen('admin-dashboard');
              else if (userRole === 'pastor')
                setCurrentScreen('pastor-dashboard');
              else setCurrentScreen('member-dashboard');
            }}
            onDonationCreated={() => {
              if (userRole === 'admin') setCurrentScreen('admin-dashboard');
              else if (userRole === 'pastor')
                setCurrentScreen('pastor-dashboard');
              else setCurrentScreen('member-dashboard');
            }}
          />
        );

      case 'donations-list':
        return (
          <DonationsListScreen
            onNavigateBack={() => {
              if (userRole === 'admin') setCurrentScreen('admin-dashboard');
              else if (userRole === 'pastor')
                setCurrentScreen('pastor-dashboard');
              else setCurrentScreen('member-dashboard');
            }}
            onNavigateToCreateDonation={() =>
              setCurrentScreen('create-donation')
            }
            onNavigateToDonationDetails={(donationId: string) => {
              // TODO: Implementar tela de detalhes da doação
              console.log('Navigate to donation details:', donationId);
            }}
          />
        );

      default:
        return (
          <LoginScreen
            onLoginSuccess={handleLoginSuccess}
            onNavigateToRegister={() => setCurrentScreen('register')}
            onNavigateToForgotPassword={() =>
              setCurrentScreen('forgot-password')
            }
          />
        );
    }
  };

  return <View style={styles.appContainer}>{renderScreen()}</View>;
};

const styles = StyleSheet.create({
  appContainer: {
    flex: 1,
  },
});
