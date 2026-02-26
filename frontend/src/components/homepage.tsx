import React, { useEffect } from "react";
import Ranking from "./Ranking/index";
import About from "./About/index";
import Login from "./Login/login";
import Layout from "./layouts";
import Blog from "./Blog/index";
import ArenaBlog from "./Blog/ArenaBlog";
import SharePage from "./Share/SharePage";
import TermsOfUse from "./TermsOfUse/index";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation,
  useNavigate,
} from "react-router-dom";
import { useAuth } from "../context/AuthContext";

import DoubleColumn from "./Arena/DoubleColumn";
import { useArena } from "../context/ArenaContext";
import { ProlificIntro, ProlificLoginHandler } from "./Prolific";

const Homepage: React.FC = () => {
  const {
    
    socketService,
    isLogin,
    user_id,
    setIsLogin,
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
  } = useAuth();
  const { responsive, setResponsive } = useArena();
  return (
    <Router>
      <Routes>
        <Route
          path="/"
          element={
            <Layout>
              <DoubleColumn />
            </Layout>
          }
        />
        <Route path="/arena" element={<Navigate to="/" replace />} />
        {/* Routes for handling Prolific flow */}
        <Route path="/prolific" element={<ProlificIntro />} />
        <Route path="/prolific-login" element={<ProlificLoginHandler />} />
        <Route
          path="/login"
          element={
            isLogin ? (
              <Navigate to="/" replace />
            ) : (
              <Layout>
                <Login
                  socketService={socketService}
                  isLogin={isLogin}
                  setIsLogin={setIsLogin}
                  user_id={user_id}
                  setUser_id={setUser_id}
                  user_name={user_name}
                  setUserName={setUserName}
                  isFirstUser={isFirstUser}
                  setIsFirstUser={setIsFirstUser}
                  avatar_url={avatar_url}
                  setAvatarUrl={setAvatarUrl}
                  alias={alias}
                  setAlias={setAlias}
                  quota={quota}
                  setQuota={setQuota}
                />
              </Layout>
            )
          }
        />
        <Route
          path="/share_preview/:shareId"
          element={<SharePage />}
        />
        <Route
          path="/leaderboard"
          element={
            <Layout>
              <Ranking socketService={socketService} />
            </Layout>
          }
        />
        <Route
          path="/blog"
          element={
            <Layout>
              <Blog />
            </Layout>
          }
        />
        <Route
          path="/blog/computer-agent-arena"
          element={
            <Layout>
              <ArenaBlog />
            </Layout>
          }
        />
        <Route
          path="/about"
          element={
            <Layout>
              <About />
            </Layout>
          }
        />
        <Route
          path="/terms-of-use"
          element={
            <Layout>
              <TermsOfUse />
            </Layout>
          }
        />
      </Routes>
    </Router>
  );
};

export default Homepage;
