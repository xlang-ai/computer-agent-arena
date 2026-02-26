import React, { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const ProlificLoginHandler: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { 
    socketService,
    setIsLogin,
    setUser_id,
    setUserName,
    setIsFirstUser,
    setAvatarUrl,
    setAlias,
    setQuota
  } = useAuth();

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const prolific_pid = searchParams.get('PROLIFIC_PID');
    const study_id = searchParams.get('STUDY_ID');
    const session_id = searchParams.get('SESSION_ID');

    const handleProlificLogin = async (prolific_pid: string, study_id: string, session_id: string) => {
      if (prolific_pid && study_id && session_id) {
        // Send these parameters to backend for validation and auto-login
        const response = await socketService.Post('prolific_login', {
          prolific_pid,
          study_id,
          session_id
        });

        if (response.status === 'success') {
          // Store the token in localStorage
          localStorage.setItem('token', response.token);
          
          setIsLogin(true);
          setUser_id(response.user_id);
          setUserName(response.user_name || 'Prolific User');
          setIsFirstUser(response.first_user || false);
          setAvatarUrl(response.avatar_url || '');
          setAlias(response.alias || 'Prolific User');
          setQuota(response.quota || 10);
          navigate('/'); // Redirect to the main arena
        } else {
          console.error('Prolific login failed:', response.message);
          navigate('/login'); // Redirect to regular login if there's an issue
        }
      } else {
        // If not all Prolific parameters are present, redirect to main page
        navigate('/');
      }
    }
    
    if (prolific_pid && study_id && session_id) {
      handleProlificLogin(prolific_pid, study_id, session_id);
    } else {
      navigate('/');
    }
  }, [location, navigate, socketService, setIsLogin, setUser_id, setUserName, setIsFirstUser, setAvatarUrl, setAlias, setQuota]);

  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-600"></div>
      <h2 className="text-xl font-semibold mt-6">
        Processing Prolific login...
      </h2>
    </div>
  );
};

export default ProlificLoginHandler; 