// src/contexts/AuthContext.tsx
import { jwtDecode } from 'jwt-decode';
import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import SocketService from '../utils/SocketService';
import FingerprintService from '../utils/FingerprintService';

interface AuthContextType {
    socketService: SocketService;
    isLogin: boolean;
    setIsLogin: (value: boolean) => void;
    user_id: string | null;
    setUser_id: (value: string | null) => void;
    user_name: string | null;
    setUserName: (value: string | null) => void;
    logout: () => void;
    isFirstUser: boolean;
    setIsFirstUser: (value: boolean) => void;
    avatar_url: string | null;
    setAvatarUrl: (value: string | null) => void;
    alias: string | null;
    setAlias: (value: string | null) => void;
    quota: number | null;
    setQuota: (value: number | null) => void;
    fetchQuota: () => Promise<void>;
    isAnonymousAllowed: boolean;
    setIsAnonymousAllowed: (value: boolean) => void;
    checkAnonymousAccess: () => Promise<boolean>;
    fingerprintService: FingerprintService;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);
interface JwtPayload {
    exp: number;
    user_id: string;
    user_name: string;
    first_user: boolean;
    avatar_url: string | null;
    alias: string | null;
}

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [isLogin, setIsLogin] = useState<boolean>(false);
    const [user_id, setUser_id] = useState<string | null>(null);
    const [user_name, setUserName] = useState<string | null>(null);
    const [isFirstUser, setIsFirstUser] = useState<boolean>(false);
    const [avatar_url, setAvatarUrl] = useState<string | null>(null);
    const [alias, setAlias] = useState<string | null>(null);
    const [quota, setQuota] = useState<number | null>(null);
    const [isAnonymousAllowed, setIsAnonymousAllowed] = useState<boolean>(false);
    const socketService = new SocketService(localStorage.getItem('token'));
    const fingerprintService = FingerprintService.getInstance();

    const fetchQuota = async () => {
        if (!user_id || !isLogin) return;
        
        try {
            const response = await socketService.Post("get_user_quota", { user_id });
            if (response && response.quota !== undefined) {
                setQuota(response.quota);
            }
        } catch (error) {
            console.error("Error fetching user quota:", error);
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        setIsLogin(false);
        setUser_id(null);
        setUserName(null);
        setIsFirstUser(false);
        setAvatarUrl(null);
        setAlias(null);
        setQuota(null);
        // console.log('Logout success!');
    }

    const checkAnonymousAccess = async () => {
        if (isLogin) return;
        
        try {
            const fingerprint = await fingerprintService.getFingerprint();
            console.log("fingerprint", fingerprint);
            const response = await socketService.Post("check_anonymous_access", { fingerprint: fingerprint });
            console.log("response", response);
            
            if (response && !response.requireLogin) {
                setIsAnonymousAllowed(true);
                return true;
            } else {
                setIsAnonymousAllowed(false);
                return false;
            }
        } catch (error) {
            console.error("Error checking anonymous access:", error);
            setIsAnonymousAllowed(false);
            return false;
        }
    };

    const handleLoginWithFingerprint = async (token: string, userData: any) => {
        localStorage.setItem("token", token);
        setIsLogin(true);
        setUser_id(userData.user_id);
        setUserName(userData.user_name);
        setAvatarUrl(userData.avatar_url);
        setAlias(userData.alias);
        setIsFirstUser(userData.first_user);
        
        try {
            const fingerprint = await fingerprintService.getFingerprint();
            await socketService.Post("mark_logged_in", { fingerprint });
        } catch (error) {
            console.error("Error marking fingerprint as logged in:", error);
        }
    };

    useEffect(() => {
        const token = localStorage.getItem("token");
        // console.log("Token:", token);
        if (token) {
            try {
                const decoded = jwtDecode<JwtPayload>(token); // 指定解码类型为JwtPayload
                const now = Date.now() / 1000; // 获取当前时间戳（秒）
                // console.log("Decoded exp:", decoded.exp);
                // console.log("decoded user_id:", decoded.user_id)
                if (decoded.exp < now || decoded.user_id.startsWith("anonymous_")) {
                    // console.log("Token expired.");
                    setIsLogin(false);
                    setUser_id(null); // 清除userId
                    setUserName(null); // 清除userName
                    setIsFirstUser(false);
                    setAvatarUrl(null);
                    setAlias(null);
                    setQuota(null);
                    localStorage.removeItem('token');
                } else {
                    setIsLogin(true);
                    setUser_id(decoded.user_id); // 从令牌中获取user_id并设置
                    setUserName(decoded.user_name); // 从令牌中获取user_name并设置
                    setIsFirstUser(decoded.first_user);
                    setAvatarUrl(decoded.avatar_url);
                    setAlias(decoded.alias);
                }
            } catch (error) {
                console.error("Invalid token:", error);
                setIsLogin(false);
                setUser_id(null); // 清除userId
                setUserName(null); // 清除userName
                setIsFirstUser(false);
                setAvatarUrl(null);
                setAlias(null);
                setQuota(null);
            }
        } else {
            setIsLogin(false);
            setUser_id(null); // 清除userId
            setUserName(null); // 清除userName
            setIsFirstUser(false);
            setAvatarUrl(null);
            setAlias(null);
            setQuota(null);
            // console.log("No token found.");
        }
        return () => {
            socketService.disconnect();
        }
    }, []);

    // Fetch quota whenever user_id changes or when user logs in
    useEffect(() => {
        if (user_id && isLogin) {
            fetchQuota();
        }
    }, [user_id, isLogin]);

    // useEffect(() => {
    //     checkAnonymousAccess();
    // }, []);
    return (
        <AuthContext.Provider value={{ socketService, isLogin, setIsLogin, user_id, setUser_id, user_name, setUserName, logout, isFirstUser, setIsFirstUser, avatar_url, setAvatarUrl, alias, setAlias, quota, setQuota, fetchQuota, isAnonymousAllowed, setIsAnonymousAllowed, checkAnonymousAccess: checkAnonymousAccess as () => Promise<boolean>, fingerprintService}}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
