import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import { Tabs, message, Button, Modal, Tooltip } from "antd";
import { Typography } from "antd";

import { LockOutlined, UserOutlined, GoogleOutlined } from "@ant-design/icons";
import {
  LoginForm,
  ProFormCheckbox,
  ProFormText,
} from "@ant-design/pro-components";

import SocketService from "../../utils/SocketService";
import FingerprintService from '../../utils/FingerprintService';

import XlangLogo from "../../icons/logo_color.svg";
import AWSLogo from "../../assets/aws-bedrock.svg";
import { GoogleLogin } from "@react-oauth/google";
import { GoogleOAuthProvider } from "@react-oauth/google";

const { Text } = Typography;

type LoginType = "login" | "register";

interface LoginProps {
  socketService: SocketService;
  isLogin: boolean;
  setIsLogin: (value: boolean) => void;
  user_id: string | null;
  setUser_id: (value: string) => void;
  user_name: string | null;
  setUserName: (value: string) => void;
  isFirstUser: boolean;
  setIsFirstUser: (value: boolean) => void;
  avatar_url: string | null;
  setAvatarUrl: (value: string | null) => void;
  alias: string | null;
  setAlias: (value: string | null) => void;
  quota: number | null;
  setQuota: (value: number | null) => void;
}

const Login: React.FC<LoginProps> = ({
  socketService,
  isLogin,
  setIsLogin,
  user_id,
  setUser_id,
  user_name,
  setUserName,
  isFirstUser,
  setIsFirstUser,
  avatar_url,
  setAvatarUrl,
  alias,
  setAlias,
  quota,
  setQuota,
}) => {
  const navigate = useNavigate();
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleGoogleLogin = () => {
    if (!agreeToTerms) {
      message.warning('Please agree to the terms of use first');
      return;
    }

    // 构建 Google OAuth 2.0 授权 URL
    const googleOAuthURL = new URL('https://accounts.google.com/o/oauth2/v2/auth');
    googleOAuthURL.searchParams.append('client_id', '874254663415-qll0spill5sdarhjbitb9ql04s4qrk1i.apps.googleusercontent.com');
    googleOAuthURL.searchParams.append('response_type', 'id_token');
    //googleOAuthURL.searchParams.append('redirect_uri', "https://arena.xlang.ai/login"); //window.location.origin
    googleOAuthURL.searchParams.append('redirect_uri', process.env.REACT_APP_DOMAIN + '/login');
    googleOAuthURL.searchParams.append('scope', 'openid email profile');
    googleOAuthURL.searchParams.append('nonce', crypto.randomUUID()); // 防止重放攻击
    googleOAuthURL.searchParams.append('prompt', 'select_account');

    // 重定向到 Google 登录页面
    window.location.href = googleOAuthURL.toString();
  };

  // 处理 Google 重定向回来的响应
  useEffect(() => {
    const handleGoogleRedirect = async () => {
      const fragment = new URLSearchParams(window.location.hash.slice(1));
      const idToken = fragment.get('id_token');

      if (idToken) {
        try {
          // 获取浏览器指纹
          const fingerprintService = FingerprintService.getInstance();
          const fingerprint = await fingerprintService.getFingerprint();
          
          const response = await socketService.Post("google_login", {
            credential: idToken,
            fingerprint: fingerprint, // 添加指纹信息
          });

          if (response.status === "success") {
            localStorage.setItem("token", response.token);
            message.success("Login success!");
            setIsLogin(true);
            setUser_id(response.user_id);
            setUserName(response.user_name);
            setAvatarUrl(response.avatar_url);
            setAlias(response.alias);
            setIsFirstUser(response.first_user);
            setQuota(response.quota);
            navigate("/");
          } else {
            message.error(response.message);
          }
        } catch (error) {
          console.error("Google login error:", error);
          message.error("Login failed. Please try again.");
        }

        // 清除 URL 中的 token
        window.history.replaceState(null, '', window.location.pathname);
      }
    };

    handleGoogleRedirect();
  }, []);

  const showTermsModal = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsModalOpen(true);
  };

  return (
    <div className="relative flex flex-col w-full overflow-hidden">
      <div className="absolute top-0 left-0 z-[1] flex items-center justify-center w-full">
        <img alt="wave" src="/background/wave.svg" className="w-full" />
      </div>
      <div className="h-[50vh] w-full z-10 flex flex-col items-center justify-center rounded-lg p-8">
        <img src={XlangLogo} className="h-8 sm:h-8 md:h-16 lg:h-20 mb-2 sm:mt-20" alt="XLANG Logo" />
        <a
          href="https://www.xlang.ai/"
          target="_blank"
          className="text-lg text-[#08377F] hover:text-blue-700 text-sm sm:text-medium md:text-base lg:text-lg"
        >
          XLANG Lab
        </a>

        <h1 className="text-xl sm:text-xl md:text-2xl lg:text-3xl font-[500] text-text-primary mb-8">
          Welcome to Computer Agent Arena!
        </h1>

        <div className="flex h-auto flex-col items-center bg-transparent rounded-lg pb-8 py-8">
          <div className="w-full max-w-[1/2] space-y-8 flex flex-col items-center justify-center">
            <Button
              type="primary"
              className="w-full h-12 flex items-center justify-center gap-2 bg-[#08377F] max-w-[320px]"
              onClick={handleGoogleLogin}
            >
              <img
                src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
                alt="Google"
                className="w-5 h-5"
              />
              Continue with Google
            </Button>
            <div className="flex items-center justify-center">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={agreeToTerms}
                  onChange={(e) => {
                    if (!agreeToTerms) {
                      setIsModalOpen(true);
                    }
                    setAgreeToTerms(e.target.checked);
                  }}
                  className="w-4 h-4 rounded border-gray-300 text-[#08377F] focus:ring-[#08377F]"
                />
                <span className="text-xs text-gray-700">
                  I agree to the terms of use of Computer Agent Arena
                </span>
              </label>
            </div>
          </div>
        </div>
      </div>
      <div className="flex flex-col items-center justify-center py-8 px-4">
        <p className="text-gray-700 mb-4 text-sm sm:text-base md:text-base lg:text-base">
          We thank Amazon AWS Bedrock for their gift supports.
        </p>
        <img
          src={AWSLogo}
          alt="AWS Bedrock Logo"
          className="h-8 sm:h-8 md:h-12 lg:h-12 object-contain"
        />
      </div>
      <Modal
        title=""
        open={isModalOpen}
        onOk={() => {
          setIsModalOpen(false);
          setAgreeToTerms(true);
        }}
        onCancel={() => {
          setIsModalOpen(false);
          setAgreeToTerms(false);
        }}
        okText="Agree"
        cancelText="Disagree"
        okButtonProps={{
          onClick: () => {
            setIsModalOpen(false);
            setAgreeToTerms(true);
          }
        }}
        width={800}
      >
        <h1 className="text-2xl font-bold text-left mb-6">
          Computer Agent Arena User Consent Form
        </h1>
        <div 
          className="max-h-[60vh] bg-gray-200 rounded-lg overflow-y-auto px-6 py-4 font-['Times_New_Roman'] dark:bg-gray-800 dark:text-white"
        >
          <h2 className="text-xl font-bold mb-4">Terms of Service</h2>
          <p className="text-base mb-4">By using this service, you agree to:</p>
          
          <ul className="list-disc pl-8 space-y-4">
            <li className="text-base leading-relaxed">
              <strong>Access:</strong> You will receive two OSWorld virtual machines, each paired with an anonymized agent.
            </li>
            
            <li className="text-base leading-relaxed">
              <strong>Data Collection:</strong> We collect and may share your task instructions, computer control actions, screenshots, and accessibility data. We reserve the right to distribute them under a Creative Commons Attribution (CC-BY) or a similar license. Do not include personal information you wish to keep private.
            </li>
            
            <li className="text-base leading-relaxed">
              <strong>Usage Rights:</strong> VMs are for research purposes only. Users have limited usage rights, not ownership. Any illegal, personal, or commercial use is prohibited and may result in account termination and legal action.
            </li>
            
            <li className="text-base leading-relaxed">
              <strong>Safety & Content:</strong> The service provides basic safety measures only and may generate offensive content. Use for illegal, harmful, violent, racist, or sexual purposes is strictly forbidden. Users are advised to use discretion and judgment when interacting with the agent model. Arena is not responsible for any content or results generated by the AI agent or submitted by users.

            </li>
            
            <li className="text-base leading-relaxed">
              <strong>Evaluation:</strong> Users must provide fair, unbiased agent evaluations for research. Unreasonable evaluations may lead to restricted access.
            </li>
            <li className="text-base leading-relaxed">
              <strong>Changes to terms:</strong> We reserve the right to modify or replace these terms at any time. It is your responsibility to check the Terms periodically for changes.
            </li>
          </ul>
        </div>
      </Modal>
    </div>
  );
};

export default Login;
