import React from 'react';
// import VerifyOtp from './components/Registration/OtpVerification';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Register from './components/user/Registration/Register';
import { LogIn } from 'lucide-react';
import Login from './components/user/login/PasswordLogin';
import ProtectedRoute from './components/user/ProtectedRoute';
import { LogoutPage } from './components/user/Logout';
import OTPLogin from './components/user/login/OTPLogin';
import LoginNavigator from './components/user/login/LoginNavigator';
import TaskDashboard from './components/user/dashboard/dashboard';
import UserProfile from './components/user/UserProfile';
import ProfilePage from './pages/ProfilePage';


function App() {
  return (
    <Router>
      <Routes>


      <Route path="/logout" element={<LogoutPage />} />

        <Route path="/register" element={
                    <Register />
          } />
        <Route path="/" element={<LoginNavigator />} />
        <Route path="/login" element={<Navigate to="/" />} />
        <Route path="/passwordlogin" element={<Login />} />
        <Route path="/dashboard" element={
          <ProtectedRoute>
          <TaskDashboard/>
          </ProtectedRoute>
          } />

<Route path="/profile" element={
          <ProtectedRoute>
          <ProfilePage/>
          </ProtectedRoute>
          } />  


        <Route path="/otplogin" element={<OTPLogin />} />


        {/* <Route path="/verify-otp" element={<VerifyOtp />} /> */}




      </Routes>


    </Router>
  );
}

export default App;