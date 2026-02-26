import { ProCard } from "@ant-design/pro-components";
import { Button, Input, Tooltip, Space } from "antd";
import { SendOutlined } from "@ant-design/icons";
import { useArena } from "../../context/ArenaContext";
import { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowRight,
  faCalendar,
  faKeyboard,
  faMagic,
  faSearch,
  faWandMagicSparkles,
} from "@fortawesome/free-solid-svg-icons";
import "../../components/CSS/message.css";
// 添加props类型定义
interface MessageProps {
  onSend: () => void;
  isSettingUp: boolean;
}

// 添加独立Agent消息输入框的props类型定义
interface AgentMessageInputProps {
  onSend: (agentIdx: number) => void;
  isSettingUp: boolean;
  position: "left" | "right";
}

const prefilterMessage = (text: string): { valid: boolean; error?: string } => {
  if (text.trim().length === 0) {
    return { valid: false, error: "Message cannot be empty" };
  }
  // 限制消息长度
  if (text.length > 500 || text.length < 10) {
    return {
      valid: false,
      error: "Message length must be between 10 and 500 characters",
    };
  }

  return { valid: true };
};

// 格式化示例文本，将方括号中的内容高亮显示
const formatExampleText = (text: string) => {
  const parts = text.split(/(\[.*?\])/g);
  return parts.map((part, index) => {
    if (part.match(/^\[.*\]$/)) {
      return (
        <span key={index} className="text-gray-500/50 rounded-md bg-gray-100 px-1">
          {part}
        </span>
      );
    }
    return part;
  });
};

const Message: React.FC<MessageProps> = ({ onSend, isSettingUp }) => {
  const {
    isVncConnected,
    message,
    setMessage,
    isInConversation,
    isConversationEnded,
    isEvaluationEnded,
  } = useArena();

  const [tooltipMessage, setTooltipMessage] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [expandedSuggestion, setExpandedSuggestion] = useState<number | null>(
    null
  );

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isVncConnected) {
      timer = setTimeout(() => {
        setShowSuggestions(true);
      }, 3000);
    } else {
      setShowSuggestions(false);
    }
    return () => clearTimeout(timer);
  }, [isVncConnected]);

  const handleSend = () => {
    const checkResult = prefilterMessage(message);
    if (!checkResult.valid) {
      setTooltipMessage(checkResult.error || "input invalid");
      return;
    }
    setTooltipMessage("");
    onSend();
  };
  const suggestions = [
    {
      icon: (
        <FontAwesomeIcon
          icon={faSearch}
          className="text-[10px] text-gray-500"
        />
      ),
      title: "Information Retrieval",
      description:
        "Tasks requiring the agent to find and extract relevant information, either from the web or local files",
      examples: [
        "Search for information about [topic], focusing on data and facts",
        "Find official and third-party documentation for [software or tool]",
        "Retrieve statistical data on [subject], including relevant figures",
        "Look up scholarly articles on [topic] on [search platform]",
        "Search for customer reviews and expert opinions on [product or service] on [shopping website]",
        "Find step-by-step guides on how to [perform a task] on [platform], download the source code",
        "Locate legal information about [policy or regulation] in [region or country]",
        "Retrieve the latest news articles about [event or trend] on [search platform]",
        "Find technical specifications and user manuals for [device or equipment] and copy the link",
        "Search for historical data on [subject], and locate to the data in [year]",
      ],
    },
    {
      icon: (
        <FontAwesomeIcon
          icon={faArrowRight}
          className="text-[10px] text-green-600"
        />
      ),
      title: "UI Navigation",
      description:
        "Tasks involving navigating software interfaces, adjusting settings, configuring customizations.",
      examples: [
        "Open [application or tool], navigate to [feature], and adjust settings to [option]",
        "Use [key or shortcut] to perform [action] within the software",
        "Access the settings menu in [application] to enable or disable [feature]",
        "Navigate to [menu or section] in [software] and select [option]",
        "Switch between [views or modes] in [application], adjusting the display",
        "Arrange the workspace in [software] by moving panels or windows",
        "Set preferences in [application] for [behavior or functionality]",
        "Use the toolbar in [software] to access [tools or features]",
        "Navigate through tabs or pages in [application] to reach [section]",
        "Adjust the zoom level or display size in [software] for better visibility",
      ],
    },
    {
      icon: (
        <FontAwesomeIcon
          icon={faKeyboard}
          className="text-[10px] text-red-600"
        />
      ),
      title: "OS Operations",
      description:
        "Tasks involving interaction with the operating system, including managing files and directories, controlling system settings, monitoring processes, and performing basic system-level operations.",
      examples: [
        "Create a new folder named [folder name] in [directory or location]",
        "Delete [file or folder] from [location] and confirm its removal",
        "Install [program or application] using [installer or method]",
        "Uninstall [program or application] using [control panel or method]",
        "Copy [file or folder] from [source] to [destination]",
        "Move [file or folder] from [source] to [destination]",
        "Rename [file or folder] to [new name] in [location]",
        "Use [key or shortcut] to open [system tool or application]",
        "Check system settings for [parameter] and adjust if necessary",
        "Monitor running processes using [task manager or system monitor]",
        "Update the operating system to the latest version available",
        "Set up a new user account with [permissions or settings]",
        "Backup files from [location] to [external drive or cloud storage]",
        "Restore files from [backup source] to [location]",
        "Adjust power settings to [mode] for [performance or energy saving]",
        "Configure network settings to connect to [Wi-Fi network or Ethernet]",
        "Modify file permissions for [user or group] on [file or folder]",
        "Check available disk space on [drive or partition]",
        "Run a virus scan on [drive or folder] using [antivirus software]",
        "Defragment the hard drive to improve system performance",
      ],
    },
    {
      icon: (
        <FontAwesomeIcon
          icon={faCalendar}
          className="text-[10px] text-blue-600"
        />
      ),
      title: "Long-term Tasks",
      description:
        "Tasks involving long, complicated action sequences, often involving two or more domains or skills.",
      examples: [
        "Schedule multiple meetings with [participants], coordinating times using calendar software",
        "Set up a workflow in [software or tool] for [task], involving multiple steps",
        "Configure a system to automatically perform [task] at specified times using scheduling tools",
        "Organize files and folders related to [project], ensuring proper structure and naming conventions",
        "Set up synchronization between [devices or accounts] for [data or files]",
        "Coordinate with [team or individuals] to complete [task], using communication tools",
        "Adjust settings across multiple applications to optimize for [performance or accessibility]",
        "Monitor ongoing processes in [software or system] and adjust parameters as needed",
        "Install and set up [software suite or tools] required for [project or task]",
        "Manage permissions and access controls for multiple users on [system or application]",
      ],
    },
  ];

  return (
    <>
      <ProCard colSpan="100%" className="my-1" ghost>
        {isEvaluationEnded || isInConversation ? (
          <></>
        ) : (
          <Tooltip
            title={
              isVncConnected && !isSettingUp
                ? tooltipMessage
                : "Please connect virtual machine first"
            }
          >
            
            <div
              className="w-full bg-transparent"
              style={{ display: "flex", alignItems: "row" }}
            >
              <Space.Compact
                style={{ width: "100%", display: "flex", alignItems: "center" }}
              >
                <Input
                  value={message}
                  onChange={(e) => {
                    
                    setMessage(e.target.value);
                  }}
                  placeholder={
                    isVncConnected
                      ? "Message Computer Agent Arena..."
                      : "Please Connect Virtual Machine First..."
                  }
                  disabled={!isVncConnected || isInConversation || isSettingUp}
                  style={{
                    border: "none",
                    padding: "11px 17px",
                    height: "fit-content",
                    backgroundColor: "white",
                    marginRight: "11px",
                  }}
                  onPressEnter={handleSend}
                />
              </Space.Compact>
              {!isInConversation && (
                <Tooltip
                  title={!prefilterMessage(message).valid ? tooltipMessage : ""}
                >
                  <Button
                    type="primary"
                    icon={<SendOutlined />}
                    block
                    onClick={handleSend}
                    disabled={
                      !isVncConnected || !prefilterMessage(message).valid
                    }
                    style={{
                      background: "#009CD5",
                      border: "1px solid #009CD5",
                      color: "#fff",
                      width: "100px",
                      height: "36px",
                      borderRadius: "12px",
                      margin: "11px 17px",
                    }}
                  >
                    Send
                  </Button>
                </Tooltip>
              )}
            </div>
          </Tooltip>
        )}
      </ProCard>
      {/* {showSuggestions && !isInConversation && !isConversationEnded && !isEvaluationEnded && (
        <div className="flex flex-col items-center gap-2 animate-fade-in">
          <div className="flex flex-row items-center gap-2 justify-center">
            <span className="flex flex-row items-center text-xs text-gray-500 gap-2">
              <FontAwesomeIcon icon={faWandMagicSparkles} />
              💡 Try out topics like:
            </span>
            <div className="flex flex-row items-center gap-2">
              {suggestions.map((suggestion, index) => (
                <div key={index} className="flex flex-col">
                  <div
                    className="flex flex-row items-center gap-2 bg-white rounded-full px-4 py-2 shadow-sm hover:bg-gray-50 cursor-pointer"
                    onClick={() =>
                      setExpandedSuggestion(
                        expandedSuggestion === index ? null : index
                      )
                    }
                  >
                    {suggestion.icon}
                    <div className="text-[10px] font-medium">
                      {suggestion.title}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          {expandedSuggestion !== null && !isInConversation  && !isConversationEnded && !isEvaluationEnded&& (
            <div className="w-[50vw] bg-white rounded-lg shadow-lg px-4 py-2 my-1">
              <div className="text-[12px] font-semibold my-1">
                {suggestions[expandedSuggestion].description}
              </div>
              <ul className="pl-5 space-y-1 my-1">
                {suggestions[expandedSuggestion].examples
                  .sort(() => Math.random() - 0.5)
                  .slice(0, 4)
                  .map((example, i) => (
                    <li
                      key={i}
                      className="text-[10px] text-gray-600 cursor-pointer hover:bg-gray-50"
                    >
                      {formatExampleText(example)}
                    </li>
                  ))}
              </ul>
            </div>
          )}
        </div>
      )} */}
    </>
  );
};

// 新增的独立Agent消息输入组件
export const AgentMessageInput: React.FC<AgentMessageInputProps> = ({ 
  onSend, 
  isSettingUp, 
  position 
}) => {
  const {
    isVncConnected,
    messageLeft,
    messageRight,
    setMessageLeft,
    setMessageRight,
    isInConversationL,
    isInConversationR,
    isConversationEndedL,
    isConversationEndedR,
    isEvaluationEnded,
  } = useArena();

  // 根据position选择对应的消息和状态
  const message = position === "left" ? messageLeft : messageRight;
  const setMessage = position === "left" ? setMessageLeft : setMessageRight;
  const isInConversation = position === "left" ? isInConversationL : isInConversationR;
  const isConversationEnded = position === "left" ? isConversationEndedL : isConversationEndedR;
  const agentIdx = position === "left" ? 0 : 1;

  const [tooltipMessage, setTooltipMessage] = useState("");

  const handleSend = () => {
    // const checkResult = prefilterMessage(message);
    // if (!checkResult.valid) {
    //   setTooltipMessage(checkResult.error || "input invalid");
    //   return;
    // }
    setTooltipMessage("");
    onSend(agentIdx);
  };

  // 只在对话结束后且未进入评估阶段时显示输入框
  if (!isConversationEnded || isEvaluationEnded || isInConversation) {
    return null;
  }

  return (
    <ProCard colSpan="100%" className="my-1" ghost>
      <Tooltip
        title={
          isVncConnected && !isSettingUp
            ? tooltipMessage
            : "Please connect virtual machine first"
        }
      >
        <div
          className="w-full bg-transparent"
          style={{ display: "flex", alignItems: "row" }}
        >
          <Space.Compact
            style={{ width: "100%", display: "flex", alignItems: "center" }}
          >
            <Input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder={
                isVncConnected
                  ? `Message Agent ${position === "left" ? "A" : "B"}...`
                  : "Please Connect Virtual Machine First..."
              }
              disabled={!isVncConnected || isSettingUp}
              style={{
                border: "none",
                padding: "11px 17px",
                height: "fit-content",
                backgroundColor: "white",
                marginRight: "11px",
              }}
              onPressEnter={handleSend}
            />
          </Space.Compact>

            <Button
              type="primary"
              icon={<SendOutlined />}
              block
              onClick={handleSend}
              disabled={
                !isVncConnected
              }
              style={{
                background: "#009CD5",
                border: "1px solid #009CD5",
                color: "#fff",
                width: "100px",
                height: "36px",
                borderRadius: "12px",
                margin: "11px 17px",
              }}
            >
              Send
            </Button>
        </div>
      </Tooltip>
    </ProCard>
  );
};

export default Message;
