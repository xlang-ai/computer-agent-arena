import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowPointer,
  faArrowRightToBracket,
  faBorderAll,
  faChevronDown,
  faFile,
  faGear,
  faKeyboard,
  faScroll,
  faUser,
} from "@fortawesome/free-solid-svg-icons";
import {
  faApple,
  faAppStore,
  faUbuntu,
  faWindows,
} from "@fortawesome/free-brands-svg-icons";
import { useEffect, useState } from "react";
import { useArena } from "../../context/ArenaContext";
import CommandPalette from "./CommandPalette";
import LoginPalette from './LoginPalette';
import { useAuth } from "../../context/AuthContext";
// 添加props类型定义
interface SetupProps {
  handleConnect: (myOs: string, category: string, app_name: string, parameters: any) => void; // 假设这是一个处理提交逻辑的函数
}

const Setup: React.FC<SetupProps> = ({ handleConnect }) => {
  const { os, setOs, chat_id,agent, vlm, SetupOptions, isVncConnected, isInConversation, isConversationEnded, isEvaluationEnded, responsive } =
    useArena();
  const { user_id, socketService } = useAuth();
  const [isSettingInfoOpen, setIsSettingInfoOpen] = useState(false);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [commandOptions, setCommandOptions] = useState("");
  const [isLoginPaletteOpen, setIsLoginPaletteOpen] = useState(false);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const isMac = navigator.platform.toUpperCase().indexOf("MAC") >= 0;
      const modifierKey = isMac ? event.metaKey : event.ctrlKey;

      if (modifierKey && event.shiftKey && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setIsCommandPaletteOpen((isCommandPaletteOpen) => {
          
          if (isCommandPaletteOpen) {
            return false;
          }
          return true;
        });
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  const handleSelectApp = (category: string, app_name: string, parameters: any) => {
    console.log("Selected app action:", category, app_name, parameters);
    if (Object.keys(parameters).length > 0 && parameters.action === "open_url") {
      app_name = "Chrome";
    }
    const user_data = {
      user_id: user_id,
      chat_id: chat_id,
      category: category,
      app_name: app_name,
      parameters: parameters,
      os: os,
    };
    socketService.Send("setup_env", user_data);
  };

  return (
    <>
      <CommandPalette
        isOpen={isCommandPaletteOpen}
        setIsOpen={setIsCommandPaletteOpen}
        onSelectApp={handleSelectApp}
        inUse={true}
      />
      <div className="mt-0 w-full max-w-full bg-[#E8DFF4] rounded-lg px-4 py-2 max-md:hidden">
        <div className="w-full">
          <div className="border-b border-gray-200">
            <div
              className="w-full flex justify-between items-center px-4 py-1"
              onClick={() => setIsSettingInfoOpen(!isSettingInfoOpen)}
            >
              <span className="text-lg font-bold">
                <FontAwesomeIcon icon={faGear} className="mr-2" />
                Settings
              </span>
              <div className="flex flex-row items-center gap-4">
                <div className="text-lg">
                  <FontAwesomeIcon
                    icon={faChevronDown}
                    className={`transform transition-transform ${
                      isSettingInfoOpen ? "rotate-180" : ""
                    }`}
                  />
                </div>
              </div>
            </div>
          </div>

          {isSettingInfoOpen && (
            <div
              className={`grid ${
                responsive ? "grid-cols-1" : "grid-cols-2"
              } gap-4 px-4 py-0`}
            >
              <div className="flex flex-col gap-0">
                <h3 className="text-sm font-semibold">
                  Make your personalized computer
                </h3>
                <div className="space-y-1">
                  <div className="flex items-center flex-wrap gap-1 text-xs">
                    <span>1, You can explore the computer by</span>
                    <span className="inline-flex items-center px-2 py-0.5 border border-dashed rounded">
                      <FontAwesomeIcon icon={faArrowPointer} className="mr-1" />
                      Click
                    </span>
                    <span>or</span>
                    <span className="inline-flex items-center px-2 py-0.5 border border-dashed rounded">
                      <FontAwesomeIcon icon={faKeyboard} className="mr-1" />
                      Type
                    </span>
                    <span className="whitespace-nowrap">
                      or do any other operations just like
                    </span>
                    <span> your own PC;</span>
                  </div>
                  <div className="flex items-center space-x-2 text-xs">
                    <span>2, You can</span>
                    <span className="inline-flex items-center px-2 py-0.5 border border-dashed rounded">
                      <FontAwesomeIcon icon={faScroll} className="mr-1" />
                      Drag
                    </span>
                    <span>your local file</span>
                    <FontAwesomeIcon icon={faFile} />
                    <span>over the computers to upload it.</span>
                  </div>
                </div>
              </div>

              {isVncConnected && !isInConversation && !isConversationEnded && !isEvaluationEnded && (
                <div className="space-y-1">
                  <h3 className="text-sm font-semibold">Environment Setup</h3>
                  <div className="flex flex-row gap-4 mb-4">
                    <span
                      onClick={() => setIsCommandPaletteOpen(true)}
                      className="flex flex-row items-center gap-2 text-xs text-center justify-center  px-4 py-2 bg-transparent border border-solid border-[#381F71] text-[#381F71] rounded-md hover:bg-[#381F71]/10 focus:outline-none focus:ring-2 focus:ring-[#381F71]"
                    >
                      <FontAwesomeIcon icon={faBorderAll} className="w-6 h-6" />
                      Setup Computers Here
                    </span>
                    
                    {/* <span
                      onClick={() => {
                        setIsLoginPaletteOpen(true);
                        setCommandOptions("login");
                      }}
                      className="flex flex-row items-center gap-2 text-xs text-center justify-center  px-4 py-2 bg-transparent border border-solid border-[#381F71] text-[#381F71] rounded-md hover:bg-[#381F71]/10 focus:outline-none focus:ring-2 focus:ring-[#381F71]"
                    >
                      <FontAwesomeIcon
                        icon={faArrowRightToBracket}
                        className="w-6 h-6"
                      />
                      Quick Login
                    </span>
                    <span
                      onClick={() => {
                        setIsCommandPaletteOpen(true);
                        setCommandOptions("install");
                      }}
                      className="flex flex-row items-center gap-2 text-xs text-center justify-center  px-4 py-2 bg-transparent border border-solid border-[#381F71] text-[#381F71] rounded-md hover:bg-[#381F71]/10 focus:outline-none focus:ring-2 focus:ring-[#381F71]"
                    >
                      <FontAwesomeIcon icon={faAppStore} className="w-6 h-6" />
                      Quick Install
                    </span> */}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      {commandOptions === "login" && (
        <LoginPalette
          isOpen={isLoginPaletteOpen}
          setIsOpen={setIsLoginPaletteOpen}
          onSelectLogin={(option: { action: string, username: string, password: string }) => {
            const user_data = {
              user_id: user_id,
              chat_id: chat_id,
              app_name: "Chrome",
              parameters: {
                "action": option.action,
                "username": option.username,
                "password": option.password,
              }
            }
            socketService.Send("quick_setup", user_data);
            console.log('Selected login option:', option);
          }}
        />
      )}
    </>
  );
};

export default Setup;
