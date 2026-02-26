import React from "react";

import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";

import { Alert, Button, ConfigProvider, Dropdown, message } from "antd";
import { LogoutOutlined } from "@ant-design/icons";
import { ProConfigProvider, ProLayout } from "@ant-design/pro-components";

import { useAuth } from "../context/AuthContext";

import { theme, themeConfig } from "../styles/theme";
import XlangLogo from "../icons/logo_color.svg";
import { InfoCircleOutlined } from "@ant-design/icons";
import "./CSS/layout.css";
import { useArena } from "../context/ArenaContext";
import { LoginOutlined } from "@ant-design/icons";
interface LayoutProps {
  children: React.ReactNode;
}

const MenuTitle = () => (
  <a
    className="flex gap-2 cursor items-center max-md:hidden"
    href="https://xlang.ai"
    target="_blank"
    rel="noreferrer"
  >
    <span className="flex items-center justify-center">
      <img width={30} height={18} src={XlangLogo} alt="Logo" />
    </span>
    <span className="text-[16px] text-header-text font-medium">XLANG Lab</span>
  </a>
);

const MenuFooter = () => (
  <div className="mt-auto h-full text-center text-header-text text-sm flex flex-col gap-2">
    <div className="flex flex-col gap-8 my-10 mx-6 items-start">
      <NavContent />
    </div>
    <span>Powered by</span>
    <a
      className="flex gap-2 cursor items-center justify-center md:hidden"
      href="https://xlang.ai"
      target="_blank"
      rel="noreferrer"
    >
      <span className="flex items-center justify-center">
        <img width={30} height={18} src={XlangLogo} alt="Logo" />
      </span>
      <span className="text-[16px] text-header-text font-medium">
        XLANG Lab
      </span>
    </a>
  </div>
);

const NavContent = () => (
  <>
    <Link
      to="/arena"
      className="text-header-text font-[600] text-md hover:underline hover:text-header-text"
    >
      Computer Agent Arena
    </Link>
    <Link
      to="/leaderboard"
      className="text-header-text font-[600] text-md hover:underline hover:text-header-text"
    >
      🏆 Leaderboard
    </Link>
    <Link
      to="/blog"
      className="text-header-text font-[600] text-md hover:underline hover:text-header-text"
    >
      Blog
    </Link>
    <Link
      to="/about"
      className="text-header-text font-[600] text-md hover:underline hover:text-header-text"
    >
      About Us
    </Link>
  </>
);

const HeaderContent = () => (
  <div className="ml-10 items-center text-md flex gap-8 max-md:hidden">
    <NavContent />
  </div>
);

const MyAvatar: React.FC = () => {
  const { alias, avatar_url } = useAuth();

  return avatar_url ? (
    <img src={avatar_url} alt="avatar" crossOrigin="anonymous" />
  ) : (
    <p className="icon">{alias && alias.charAt(0).toUpperCase()}</p>
  );
};

const MyLogin: React.FC = () => {
  return (
    <div className="flex items-center justify-center w-full">
      <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center text-black">
        <LoginOutlined />
      </div>
    </div>
  );
};
const Layout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation();
  const { user_name, alias, isLogin, logout } = useAuth();
  const {
    isTutorialOpen,
    setIsTutorialOpen,
    isBannerOpen,
    setIsBannerOpen,
    responsive,
    chat_id,
  } = useArena();
  const navigate = useNavigate();
  const { socketService, user_id, quota } = useAuth();
  return (
    <div
      id="test-pro-layout"
      style={{
        height: "100vh",
        overflow: "auto",
        display: "flex", 
        flexDirection: "column"
      }}
    >
      <ProConfigProvider hashed={false}>
        <ConfigProvider
          getTargetContainer={() => {
            return document.getElementById("test-pro-layout") || document.body;
          }}
          theme={themeConfig}
        >
          <ProLayout
            token={{
              bgLayout: theme.background.main,
              header: {
                colorBgHeader: theme.background.popup,
                heightLayoutHeader: isBannerOpen ? 108 : 56,
              },
            }}
            location={location}
            menuHeaderRender={MenuTitle}
            menuFooterRender={MenuFooter}
            headerRender={(props, defaultDom) => (
              <>
                {isBannerOpen && (
                  <Alert
                    message={
                      <div
                        style={{
                          color: "white",
                          display: "flex",
                          justifyContent: "center",
                          fontSize: responsive ? "12px" : "14px",
                        }}
                      >
                        {responsive
                          ? "Check out"
                          : "New to Agent Arena? Please check out our"}
                        <Button
                          size="small"
                          type="dashed"
                          style={{
                            marginLeft: responsive ? "4pt" : "6pt",
                            marginRight: responsive ? "4pt" : "6pt",
                            fontSize: responsive ? "12px" : "14px",
                            height: responsive ? "14pt" : "18pt",
                          }}
                          onClick={() => setIsTutorialOpen(true)}
                        >
                          User Guide
                        </Button>{" "}
                        first!
                      </div>
                    }
                    banner
                    style={{
                      backgroundColor: "#4D367D",
                    }}
                    action={
                      <Button
                        type="text"
                        style={{
                          color: "white",
                          fontSize: responsive ? "12px" : "14px",
                        }}
                        onClick={() => setIsBannerOpen(false)}
                      >
                        Close
                      </Button>
                    }
                  />
                )}
                {React.cloneElement(defaultDom as any, {
                  style: {
                    height: "56px",
                    lineHeight: "56px",
                  },
                })}
              </>
            )}
            headerContentRender={HeaderContent}
            menuItemRender={(item: any, defaultDom: any) => (
              <Link to={item.path}> {defaultDom} </Link>
            )}
            fixedHeader={true}
            layout="top"
            avatarProps={
              isLogin
                ? {
                    src: <MyAvatar />,
                    size: "small",
                    title: alias,
                    render: (props, dom) => {
                      return (
                        <Dropdown
                          menu={{
                            items: [
                              {
                                key: "quota",
                                icon: <InfoCircleOutlined />,
                                label: `Quota: ${quota}`,
                              },
                              {
                                key: "logout",
                                icon: <LogoutOutlined />,
                                label: "logout",
                                onClick: () => {
                                  logout();
                                  socketService.Send("logout", {
                                    user_id: user_id,
                                    chat_id: chat_id,
                                  });
                                  message.success("Successfully logged out");
                                },
                              },
                            ],
                          }}
                        >
                          {dom}
                        </Dropdown>
                      );
                    },
                  }
                : {
                    src: <MyLogin />,
                    size: "large",
                    title: (
                      <span className="text-header-text text-base hover:underline hover:text-header-text">
                        Login
                      </span>
                    ),
                    onClick: () => {
                      navigate("/login");
                    },
                    render: (props, dom) => {
                      return (
                        <span
                          className="text-header-text text-base p-2 mx-2 rounded-md hover:cursor-pointer hover:bg-gray-100 "
                          onClick={() => {
                            navigate("/login");
                          }}
                        >
                          {dom}
                        </span>
                      );
                    },
                  }
            }
            style={{ flex: "1 0 auto" }}
            footerRender={() => (
              <footer className="py-2 text-center border-t border-gray-200 mt-auto">
                <div className="mx-auto max-w-4xl flex justify-center items-center space-x-6 text-sm text-gray-600">
                  <a href="https://github.com/xlang-ai/computer-agent-arena" target="_blank" rel="noopener noreferrer" className="hover:text-gray-900 flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                      <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.012 8.012 0 0 0 16 8c0-4.42-3.58-8-8-8z"/>
                    </svg>
                    Github
                  </a>
                  <a href="https://discord.gg/4Gnw7eTEZR" target="_blank" rel="noopener noreferrer" className="hover:text-gray-900 flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                      <path d="M13.545 2.907a13.227 13.227 0 0 0-3.257-1.011.05.05 0 0 0-.052.025c-.141.25-.297.577-.406.833a12.19 12.19 0 0 0-3.658 0 8.258 8.258 0 0 0-.412-.833.051.051 0 0 0-.052-.025c-1.125.194-2.22.534-3.257 1.011a.041.041 0 0 0-.021.018C.356 6.024-.213 9.047.066 12.032c.001.014.01.028.021.037a13.276 13.276 0 0 0 3.995 2.02.05.05 0 0 0 .056-.019c.308-.42.582-.863.818-1.329a.05.05 0 0 0-.01-.059.051.051 0 0 0-.018-.011 8.875 8.875 0 0 1-1.248-.595.05.05 0 0 1-.02-.066.051.051 0 0 1 .015-.019c.084-.063.168-.129.248-.195a.05.05 0 0 1 .051-.007c2.619 1.196 5.454 1.196 8.041 0a.052.052 0 0 1 .053.007c.08.066.164.132.248.195a.051.051 0 0 1-.004.085 8.254 8.254 0 0 1-1.249.594.05.05 0 0 0-.03.03.052.052 0 0 0 .003.041c.24.465.515.909.817 1.329a.05.05 0 0 0 .056.019 13.235 13.235 0 0 0 4.001-2.02.049.049 0 0 0 .021-.037c.334-3.451-.559-6.449-2.366-9.106a.034.034 0 0 0-.02-.019Zm-8.198 7.307c-.789 0-1.438-.724-1.438-1.612 0-.889.637-1.613 1.438-1.613.807 0 1.45.73 1.438 1.613 0 .888-.637 1.612-1.438 1.612Zm5.316 0c-.788 0-1.438-.724-1.438-1.612 0-.889.637-1.613 1.438-1.613.807 0 1.451.73 1.438 1.613 0 .888-.631 1.612-1.438 1.612Z"/>
                    </svg>
                    Discord
                  </a>
                  <a href="#" className="hover:text-gray-900 flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                      <path d="M12.6.75h2.454l-5.36 6.142L16 15.25h-4.937l-3.867-5.07-4.425 5.07H.316l5.733-6.57L0 .75h5.063l3.495 4.633L12.601.75Zm-.86 13.028h1.36L4.323 2.145H2.865l8.875 11.633Z"/>
                    </svg>
                    X
                  </a>
                  <a href="https://xlang.ai" target="_blank" rel="noopener noreferrer" className="hover:text-gray-900 flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                      <path d="M5 0a.5.5 0 0 1 .5.5V2h1V.5a.5.5 0 0 1 1 0V2h1V.5a.5.5 0 0 1 1 0V2h1V.5a.5.5 0 0 1 1 0V2A2.5 2.5 0 0 1 14 4.5h1.5a.5.5 0 0 1 0 1H14v1h1.5a.5.5 0 0 1 0 1H14v1h1.5a.5.5 0 0 1 0 1H14v1h1.5a.5.5 0 0 1 0 1H14a2.5 2.5 0 0 1-2.5 2.5v1.5a.5.5 0 0 1-1 0V14h-1v1.5a.5.5 0 0 1-1 0V14h-1v1.5a.5.5 0 0 1-1 0V14h-1v1.5a.5.5 0 0 1-1 0V14A2.5 2.5 0 0 1 2 11.5H.5a.5.5 0 0 1 0-1H2v-1H.5a.5.5 0 0 1 0-1H2v-1H.5a.5.5 0 0 1 0-1H2v-1H.5a.5.5 0 0 1 0-1H2A2.5 2.5 0 0 1 4.5 2V.5A.5.5 0 0 1 5 0zm-.5 3A1.5 1.5 0 0 0 3 4.5v7A1.5 1.5 0 0 0 4.5 13h7a1.5 1.5 0 0 0 1.5-1.5v-7A1.5 1.5 0 0 0 11.5 3h-7zM5 6.5A1.5 1.5 0 0 1 6.5 5h3A1.5 1.5 0 0 1 11 6.5v3A1.5 1.5 0 0 1 9.5 11h-3A1.5 1.5 0 0 1 5 9.5v-3zM6.5 6a.5.5 0 0 0-.5.5v3a.5.5 0 0 0 .5.5h3a.5.5 0 0 0 .5-.5v-3a.5.5 0 0 0-.5-.5h-3z"/>
                    </svg>
                    XLANG Lab
                  </a>
                  <a href="mailto:xlang.agentarena@gmail.com" target="_blank" rel="noopener noreferrer" className="hover:text-gray-900 flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                      <path d="M0 4a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V4Zm2-1a1 1 0 0 0-1 1v.217l7 4.2 7-4.2V4a1 1 0 0 0-1-1H2Zm13 2.383-4.708 2.825L15 11.105V5.383Zm-.034 6.876-5.64-3.471L8 9.583l-1.326-.795-5.64 3.47A1 1 0 0 0 2 13h12a1 1 0 0 0 .966-.741ZM1 11.105l4.708-2.897L1 5.383v5.722Z"/>
                    </svg>
                    Contact Us
                  </a>
                </div>
                <div className="mt-3 text-xs text-gray-500">
                  © {new Date().getFullYear()} Computer Agent Arena. All rights reserved.
                </div>
              </footer>
            )}
          >
            {children}
          </ProLayout>
        </ConfigProvider>
      </ProConfigProvider>
    </div>
  );
};

export default Layout;
