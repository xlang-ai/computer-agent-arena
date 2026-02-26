import { useEffect, useRef, useState } from "react";
import { ProCard } from "@ant-design/pro-components";
import Setup from "./settings";
import Message from "./message";
import Description from "./description";
import Eval from "./eval";
import RcResizeObserver from "rc-resize-observer";
import { showNotification } from "./notification";
import Conversation from "./trajectory2";
import { useAuth } from "../../context/AuthContext";
import { useArena } from "../../context/ArenaContext";
import "../CSS/VncViewer.css";
import { RightOutlined } from "@ant-design/icons";
import { Button, FloatButton, Spin, Tooltip, Tour, TourProps, Typography, Modal, Progress, notification } from "antd";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Agent_Display } from "./eval";
import {
  faArrowsRotate,
  faCode,
  faGlobe,
  faStar,
  faQuestion,
  faXmark,
  faFilm,
  faFileWord,
  faPhotoFilm,
  faShuffle,
  faDisplay,
  faGear,
  faCircleQuestion,
  faChevronDown,
} from "@fortawesome/free-solid-svg-icons";
import {
  faApple,
  faUbuntu,
  faWindows,
} from "@fortawesome/free-brands-svg-icons";
import { Tabs } from "antd";

import "../CSS/DoubleColumn.css";
import Tutorial from "./tutorial";
import PromptTutorial from "./PromptTutorial";
import Alt_ubuntu from "../../assets/Alt_ubuntu.png";
import Alt_windows from "../../assets/Alt_windows.png";
import AWSLogo from "../../assets/aws-bedrock.svg";
import MainFigure from "../../assets/main_figure.png";
import CommandPalette from "./CommandPalette";
import { useNavigate } from "react-router-dom";
import mockConversationData from "../../mock_data/ConversationData";
interface Feedback {
  status: boolean | null;
  index: number;
  options?: string[];
  comment?: string;
}
interface SendToIframeOptions {
  host?: string;
  port?: number;
  path?: string;
  password?: string;
  action?: string;
  successMessage?: string;
  errorMessage?: string;
}

// Define a custom interface for conversation data entries
interface ConversationEntry {
  type: string;
  name: string;
  content: {
    title: string;
    time: string;
    image: string;
    description: string;
    agent_time: string;
    env_time: string;
  }[];
  isThinking?: boolean; // Optional property to indicate a "thinking" state
}

interface EnvironmentOption {
  id: string;
  name: string;
  icon: string;
  disabled?: boolean;
}

function sendToIframe(
  options: SendToIframeOptions,
  if_notify: boolean = true,
  iframe: HTMLIFrameElement | null,
  user_id: string | null,
  chat_id: string | undefined
) {
  const {
    host = "",
    port = 0,
    path = "",
    password = "password",
    action = "",
    successMessage = "",
    errorMessage = "",
  } = options;
  if (iframe !== null) {
    if (iframe.contentWindow !== null) {
      const message = {
        action: action,
        host: host,
        port: port,
        path: path,
        password: password,
        user_id: user_id,
        chat_id: chat_id,
      };
      iframe.contentWindow.postMessage(message, window.location.origin);
      if (if_notify) {
        showNotification(
          "bottomLeft",
          "success",
          "Connect Success",
          successMessage
        );
      }
    }
  } else {
    console.error("Cannot find the iframe or its content window.");
    showNotification("bottomLeft", "error", "Error", errorMessage);
  }
}
// 定义状态枚举
enum ConversationState {
  Inactive,
  Initial,
  InConversation,
  ConversationEnded,
  ConversationStopped,
  EvaluationEnded,
}

// Add these interfaces near the top of the file with other interfaces
interface InstructionResponse {
  status: "rejected" | "warning" | "success";
  score: number;
  reason: string;
  delay?: number;
}

interface MessageData {
  user_id: string | null;
  chat_id: string | undefined;
  user_intent: string;
  os_env: string | undefined;
  agent_num: number;
}

const DoubleColumn: React.FC = (): JSX.Element => {
  const { socketService, isLogin, setIsLogin, user_id, alias, setUser_id, setUserName, setAvatarUrl, setAlias, isAnonymousAllowed, checkAnonymousAccess, quota, setQuota, isFirstUser, fingerprintService } =
    useAuth();
  const {
    os,
    setOs,
    setAgent,
    setVlm,
    chat_id,
    setChat_id,
    message,
    setMessage,
    messageLeft,
    setMessageLeft,
    messageRight,
    setMessageRight,
    ConversationDataL,
    setConversationDataL,
    ConversationDataR,
    setConversationDataR,
    setResponsive,
    setCurrentState,
    currentStateL,
    setCurrentStateL,
    currentStateR,
    setCurrentStateR,
    isInactive,
    isInConversation,
    isConversationStopped,
    isConversationEnded,
    isConversationEndedL,
    isConversationEndedR,
    isEvaluationEnded,
    isVncConnected,
    setIsVncConnected,
    VncIpL,
    setVncIpL,
    VncIpR,
    setVncIpR,
    VncPortL,
    setVncPortL,
    VncPortR,
    setVncPortR,
    IsWaiting,
    SetIsWaiting,
    WaitingMessage,
    SetWaitingMessage,
    RestartConversation,
    Disconnect,
    responsive,
    setSetupOptions,
    setIsTutorialOpen,
    setCurrentStatusL,
    setCurrentStatusR,
    setStatusHistoryL,
    setStatusHistoryR,
    setIsSpecialEnv,
    setEvaluationResults,
    evaluationResults,
    agent,
    vlm,
  } = useArena();

  const vncViewerRefL = useRef(null);
  const vncViewerRefL_M = useRef(null);
  const vncViewerRefR = useRef(null);
  const vncViewerRefR_M = useRef(null);
  const iframeRefL = useRef<HTMLIFrameElement | null>(null);
  const iframeRefL_M = useRef<HTMLIFrameElement | null>(null);
  const iframeRefR = useRef<HTMLIFrameElement | null>(null);
  const iframeRefR_M = useRef<HTMLIFrameElement | null>(null);
  const [iframeKeyL, setIframeKeyL] = useState(Date.now());
  const [iframeKeyR, setIframeKeyR] = useState(Date.now());
  const [iframeKeyL_M, setIframeKeyL_M] = useState(Date.now());
  const [iframeKeyR_M, setIframeKeyR_M] = useState(Date.now());
  const dividerRefUp = useRef<HTMLDivElement | null>(null);
  const dividerRefDown = useRef<HTMLDivElement | null>(null);
  const [isFixedUp, setIsFixed1] = useState(false);
  const [isFixedDown, setIsFixed2] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [tab, setTab] = useState<"one" | "two">("one");

  // 添加测试模式状态
  const [isTestMode, setIsTestMode] = useState(false);

  // 添加测试模式切换按钮的渲染函数
  const renderTestModeToggle = () => {
    // 只在开发环境中显示测试模式切换按钮
    if (process.env.NODE_ENV !== 'development') {
      return null;
    }

    return (
      <div className="fixed bottom-4 right-4 z-50">
        <button
          onClick={() => setIsTestMode(!isTestMode)}
          className={`px-4 py-2 rounded-md shadow-md text-sm font-medium transition-colors ${isTestMode
              ? 'bg-green-500 text-white hover:bg-green-600'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
        >
          {isTestMode ? 'Test Mode: ON' : 'Test Mode: OFF'}
        </button>
      </div>
    );
  };

  // 使用 useEffect 在测试模式下加载模拟数据
  useEffect(() => {
    if (isTestMode) {
      setConversationDataL(mockConversationData);
      setConversationDataR(mockConversationData);
      setAgent(["base_agent", "base_agent"]);
      setVlm(["gpt-4o-2024-08-06", "gpt-4o-2024-08-06"]);
      setEvaluationResults({
        correctnessL: 0,
        correctnessR: 1,
        safetyL: 0,
        safetyR: 1,
        harmlessL: 0,
        harmlessR: 1,
        quality: 1,
        commentA: "This is a test comment for agent A",
        commentB: "This is a test comment for agent B"
      });
      setCurrentState(ConversationState.EvaluationEnded);
      setCurrentStateL(ConversationState.EvaluationEnded);
      setCurrentStateR(ConversationState.EvaluationEnded);
    }
  }, [isTestMode]);

  const disconnectVnc = (
    myVncIp: string | undefined,
    port: number | undefined,
    Ref: HTMLIFrameElement | null,
    user_id: string | null,
    chat_id: string | undefined
  ) => {
    if (myVncIp) {
      if (Ref) {
        if (Ref.contentWindow) {
          sendToIframe(
            {
              host: myVncIp,
              port: port,
              path: "tightvnc",
              password: "password",
              action: "disconnectVNC",
              successMessage:
                "The connection to VNC server has been disconnected successfully.",
              errorMessage:
                "An error occurred while disconnecting from the VNC server.",
            },
            false,
            Ref,
            user_id,
            chat_id
          );
          console.log("Disconnected");
        }
      }
    }
  };

  const connectVNC = (
    myVncIp: string | undefined,
    port: number | undefined,
    Ref: HTMLIFrameElement | null,
    user_id: string | null,
    chat_id: string | undefined
  ) => {
    if (myVncIp) {
      if (Ref) {
        if (Ref.contentWindow) {
          // console.log("?????????");
          // console.log(port);
          sendToIframe(
            {
              host: myVncIp,
              port: port,
              path: "tightvnc",
              password: "password",
              action: "connectVNC",
              successMessage:
                "The connection to VNC server has been established successfully.",
              errorMessage:
                "An error occurred while connecting to the VNC server.",
            },
            false,
            Ref,
            user_id,
            chat_id
          );
          //// console.log("Connected");
        }
      }
    }
  };
  const Reconnect = (
    myVncIp: string | undefined,
    port: number | undefined,
    Ref: HTMLIFrameElement | null,
    user_id: string | null,
    chat_id: string | undefined
  ) => {
    disconnectVnc(myVncIp, port, Ref, user_id, chat_id);
    connectVNC(myVncIp, port, Ref, user_id, chat_id);
  };

  const [rejectedInstructions, setRejectedInstructions] = useState<Set<string>>(new Set());
  const [warnedInstructions, setWarnedInstructions] = useState<Set<string>>(new Set());
  
  const handleSendMessage = async () => {
    console.log("🚀 handleSendMessage started");
    
    if (!user_id || !chat_id) {
      showNotification("bottomLeft", "error", "Error", "Please login first");
      return;
    }

    const instruction = message.trim();
    
    if (instruction === "") {
      showNotification("bottomLeft", "error", "Error", "Please enter your instruction");
      return;
    }

    // Check if instruction was previously rejected
    if (rejectedInstructions.has(instruction)) {
      showNotification("bottomLeft", "error", "Instruction Previously Rejected", 
        "This instruction was previously rejected due to low quality. Please try a different instruction.");
      return;
    }

    const messageData: MessageData = {
      user_id: user_id,
      chat_id: chat_id,
      user_intent: instruction,
      os_env: os,
      agent_num: 2,
    };

    try {
      console.log("🔍 About to call message_check with:", messageData);
      
      // 第一步：先检查指令质量
      const checkResponse = (await socketService.Post("message_check", messageData)) as unknown as (InstructionResponse | null);
      
      console.log("✅ Received message_check response:", checkResponse);
      
      // 处理检查结果
      if (checkResponse?.status) {
        if (checkResponse.status === "rejected") {
          console.log("❌ Instruction was rejected");
          // Add to rejected instructions set
          setRejectedInstructions(prev => new Set(prev).add(instruction));
          showNotification("bottomLeft", "error", "Instruction Rejected", checkResponse.reason);
          return;
        }

        if (checkResponse.status === "warning") {
          console.log("⚠️ Instruction has warning");
          // If this instruction was previously warned about, proceed directly
          if (warnedInstructions.has(instruction)) {
            console.log("⏭️ Previously warned, proceeding directly");
            // 跳过警告，直接发送消息
          } else {
            console.log("⏸️ First time warning, showing delay");
            // Add to warned instructions set
            setWarnedInstructions(prev => new Set(prev).add(instruction));
            
            let secondsLeft = checkResponse.delay || 5;
            showNotification(
              "bottomLeft", 
              "warning", 
              "Instruction Quality Warning", 
              `${checkResponse.reason}\nPlease wait ${secondsLeft} seconds before trying again.`
            );

            // Start countdown just for display
            const timer = setInterval(() => {
              secondsLeft -= 1;
              if (secondsLeft <= 0) {
                clearInterval(timer);
              } else {
                showNotification(
                  "bottomLeft", 
                  "warning", 
                  "Instruction Quality Warning", 
                  `${checkResponse.reason}\nPlease wait ${secondsLeft} seconds before trying again.`
                );
              }
            }, 1000);
            return;
          }
        }
        
        if (checkResponse.status === "success") {
          console.log("✅ Instruction check passed");
        }
      }

      console.log("📨 About to send message event with:", messageData);
      
      // 第二步：如果检查通过，发送实际的消息
      await socketService.Send("message", messageData);
      
      console.log("📨 Message sent successfully");
      
      // 设置对话状态为进行中
      setCurrentState(ConversationState.InConversation);
      setCurrentStateL(ConversationState.InConversation);
      setCurrentStateR(ConversationState.InConversation);
      
      // 激活VNC只读模式
      if (responsive) {
        if (iframeRefL_M.current) {
          sendToIframe(
            {
              action: "activateVNCViewOnly",
              successMessage: "VNC view-only mode activated.",
              errorMessage: "Failed to activate VNC view-only mode.",
            },
            false,
            iframeRefL_M.current,
            user_id,
            chat_id
          );
        }
        if (iframeRefR_M.current) {
          sendToIframe(
            {
              action: "activateVNCViewOnly",
              successMessage: "VNC view-only mode activated.",
              errorMessage: "Failed to activate VNC view-only mode.",
            },
            false,
            iframeRefR_M.current,
            user_id,
            chat_id
          );
        }
      }
      
    } catch (error) {
      console.error("❌ Error in handleSendMessage:", error);
      showNotification("bottomLeft", "error", "Error", "Failed to send message. Please try again.");
      return;
    }

    setMessage("");
    console.log("🏁 handleSendMessage completed");
  };
  const handleSendEval = (
    CorrectnessValueL: number | undefined,
    CorrectnessValueR: number | undefined,
    SafetyValueL: number | undefined,
    SafetyValueR: number | undefined,
    HarmlessValueL: number | undefined,
    HarmlessValueR: number | undefined,
    QualityValue: number | undefined,
    feedbacksL: Feedback[][],
    feedbacksR: Feedback[][],
    commentA: string | undefined,
    commentB: string | undefined
  ) => {
    // Send evaluation results to the server
    socketService.Send("send_eval_results_2agent", {
      user_id: user_id,
      chat_id: chat_id,
      eval_results: {
        agent0: {
          win: Number(QualityValue),
          correctness: CorrectnessValueL,
          safety: SafetyValueL,
          harmless: HarmlessValueL,
          feedbacks: feedbacksL.flat(),
          comment: commentA,
        },
        agent1: {
          win: 1 - Number(QualityValue),
          correctness: CorrectnessValueR,
          safety: SafetyValueR,
          harmless: HarmlessValueR,
          feedbacks: feedbacksR.flat(),
          comment: commentB,
        },
      },
    });

    // Update the evaluation results in context instead of sending a socket event
    setEvaluationResults({
      correctnessL: CorrectnessValueL,
      correctnessR: CorrectnessValueR,
      safetyL: SafetyValueL,
      safetyR: SafetyValueR,
      harmlessL: HarmlessValueL,
      harmlessR: HarmlessValueR,
      quality: QualityValue,
      commentA: commentA,
      commentB: commentB,
      // Add the new properties
      successL: undefined,
      successR: undefined,
      efficiencyL: undefined,
      efficiencyR: undefined
    });

    setCurrentState(ConversationState.EvaluationEnded);
    setCurrentStateL(ConversationState.EvaluationEnded);
    setCurrentStateR(ConversationState.EvaluationEnded);
    console.log("alias:", alias);
    // Check if the user is from Prolific and show completion code notification
    if (alias && alias.startsWith('Prolific_')) {
      showNotification(
        "bottomLeft",
        "success",
        "Prolific Submission Complete - CRQP0NR2",
        "Thank you for completing the task! Go to https://app.prolific.com/submissions/complete?cc=CRQP0NR2 to return to Prolific and submit your completion code.",
        30000, // Show for 30 seconds
      );
    }
  };

  useEffect(() => {
    const handleTimeout = (data: any) => {
      if (data.user_id === user_id) {
        disconnectVnc(VncIpL, VncPortL, iframeRefL.current, user_id, chat_id);
        disconnectVnc(VncIpR, VncPortR, iframeRefR.current, user_id, chat_id);
        setVncIpL(undefined);
        setVncIpR(undefined);
        setVncPortL(undefined);
        setVncPortR(undefined);
        setIframeKeyL(Date.now());
        setIframeKeyR(Date.now());
        setIframeKeyL_M(Date.now());
        setIframeKeyR_M(Date.now());
        showNotification(
          "bottomLeft",
          "info",
          "Session Timeout",
          "Your session has timed out due to 15mins exceeded. The virtual machines have been disconnected for security issues. Please finish the evaluation or start a new conversation. Thank you!",
          1000
        );
      }
    };
    socketService.Listen("timeout", handleTimeout);

    return () => {
      socketService.Unlisten("timeout");
    };
  }, []);

  const handleConnect = async (myOS: string) => {
    const res = await socketService.Post("init_setup", {
      os: myOS,
      user_id: user_id,
      agent_num: 2,
      quota: quota,
    });
    const res_chat_id = res.chat_id;
    if (!res.error) {
      setChat_id(res_chat_id);
      if (res.agent0 && res.agent1) {
        setAgent([res.agent0.agent_method, res.agent1.agent_method]);
        setVlm([res.agent0.model_name, res.agent1.model_name]);
      }
      setQuota(res.quota ? res.quota : quota ? quota - 1 : 0);
    } else {
      showNotification(
        "bottomLeft",
        "error",
        "Error",
        res.error
      );
      return;
    }
    // if (Object.keys(parameters).length > 0 && parameters.action === "open_url") {
    //   app_name = "Chrome";
    // }
    const UserData = {
      user_id: user_id,
      chat_id: res_chat_id,
      // category: category,
      // app_name: app_name,
      // parameters: parameters,
      agent_num: 2,
    };
    console.log("UserData:", UserData);
    try {
      const envs = await socketService.Post("get_presetup_env_ip", UserData);
      if (envs.status === "FAIL") {
        showNotification(
          "bottomLeft",
          "error",
          "Error",
          envs.message
        );
        return;
      }
      if (envs.status === "waiting") {
        SetIsWaiting(true);
        showNotification(
          "bottomLeft", 
          "info", 
          "Please wait in queue", 
          "Sorry, we have reached the system capacity of virtual machines. We're launching more machines to process your request. Please kindly wait for a moment.",
          300
        );
        SetWaitingMessage(envs.message);
        socketService.Send("wait_in_line", { user_id: user_id });
        return;
      }
      setIsSpecialEnv(envs.is_special_env);
      const envIp1 = envs.allocated_envs[0];
      const envIp2 = envs.allocated_envs[1];
      // console.log("2 env info:", envs);
      setVncIpL(envIp1.env_ip);
      setVncIpR(envIp2.env_ip);
      setVncPortL(envIp1.env_port);
      setVncPortR(envIp2.env_port);
      setIsVncConnected(true);

      connectVNC(
        envIp1.env_ip,
        envIp1.env_port,
        responsive ? iframeRefL_M.current : iframeRefL.current,
        user_id ? user_id : "",
        res_chat_id
      );
      connectVNC(
        envIp2.env_ip,
        envIp2.env_port,
        responsive ? iframeRefR_M.current : iframeRefR.current,
        user_id ? user_id : "",
        res_chat_id
      );
    } catch (error) {
      console.error("Error:", error);
    }
  };
  useEffect(() => {
    const fetchOptionsData = async () => {
      try {
        const SetupOptionsData = await socketService.Get("get_setup_options");
        setSetupOptions(SetupOptionsData);
        // console.log("Received response from backend:", SetupOptionsData);
      } catch (error) {
        console.error("Error fetching options data:", error);
      }
    };
    fetchOptionsData();
    const handleResize = () => {
      if (responsive) {
        if (iframeRefL_M.current) {
          sendToIframe(
            {
              action: "resize",
              successMessage: "VNC resized.",
              errorMessage: "Failed to resize 1.",
            },
            false,
            iframeRefL_M.current,
            user_id,
            chat_id
          );
        }
        if (iframeRefR_M.current) {
          sendToIframe(
            {
              action: "resize",
              successMessage: "VNC resized.",
              errorMessage: "Failed to resize. 2",
            },
            false,
            iframeRefR_M.current,
            user_id,
            chat_id
          );
        }
      } else {
        if (iframeRefL.current) {
          sendToIframe(
            {
              action: "resize",
              successMessage: "VNC resized.",
              errorMessage: "Failed to resize. 3",
            },
            false,
            iframeRefL.current,
            user_id,
            chat_id
          );
        }
        if (iframeRefR.current) {
          sendToIframe(
            {
              action: "resize",
              successMessage: "VNC resized.",
              errorMessage: "Failed to resize. 4",
            },
            false,
            iframeRefR.current,
            user_id,
            chat_id
          );
        }
      }
    };
    window.addEventListener("resize", handleResize);

    const breakobserver1 = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsFixed1(false);
        } else {
          setIsFixed1(true);
        }
      },
      {
        root: null, // 默认监视视窗
        threshold: 0, // 完全不可见时触发
      }
    );
    if (dividerRefUp.current) {
      breakobserver1.observe(dividerRefUp.current);
    }
    const breakobserver2 = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsFixed2(false);
        } else {
          setIsFixed2(true);
        }
      },
      {
        root: null, // 默认监视视
        threshold: 0, // 完全不可见时触发
      }
    );
    if (dividerRefDown.current) {
      breakobserver2.observe(dividerRefDown.current);
    }

    return () => {
      window.removeEventListener("resize", handleResize);
      if (dividerRefUp.current) {
        breakobserver1.unobserve(dividerRefUp.current);
      }
      if (dividerRefDown.current) {
        breakobserver2.unobserve(dividerRefDown.current);
      }
    };
  }, []);
  useEffect(() => {
    // Create separate effects for left and right VNC deactivation
    // Handle Left VNC deactivation
    if (isConversationEndedL || (isConversationStopped && currentStateL !== ConversationState.InConversation)) {
      if (responsive) {
        if (iframeRefL_M.current) {
          sendToIframe(
            {
              action: "deactivateVNCViewOnly",
              successMessage: "VNC view-only mode deactivated for Left side.",
              errorMessage: "Failed to deactivate VNC view-only mode for Left side.",
            },
            false,
            iframeRefL_M.current,
            user_id,
            chat_id
          );
        }
      } else {
        if (iframeRefL.current) {
          sendToIframe(
            {
              action: "deactivateVNCViewOnly",
              successMessage: "VNC view-only mode deactivated for Left side.",
              errorMessage: "Failed to deactivate VNC view-only mode for Left side.",
            },
            false,
            iframeRefL.current,
            user_id,
            chat_id
          );
        }
      }
    }

    // Handle Right VNC deactivation
    if (isConversationEndedR || (isConversationStopped && currentStateR !== ConversationState.InConversation)) {
      if (responsive) {
        if (iframeRefR_M.current) {
          sendToIframe(
            {
              action: "deactivateVNCViewOnly",
              successMessage: "VNC view-only mode deactivated for Right side.",
              errorMessage: "Failed to deactivate VNC view-only mode for Right side.",
            },
            false,
            iframeRefR_M.current,
            user_id,
            chat_id
          );
        }
      } else {
        if (iframeRefR.current) {
          sendToIframe(
            {
              action: "deactivateVNCViewOnly",
              successMessage: "VNC view-only mode deactivated for Right side.",
              errorMessage: "Failed to deactivate VNC view-only mode for Right side.",
            },
            false,
            iframeRefR.current,
            user_id,
            chat_id
          );
        }
      }
    }
  }, [isConversationEndedL, isConversationEndedR, isConversationStopped, currentStateL, currentStateR, responsive, user_id, chat_id]);
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          if (responsive) {
            if (iframeRefL_M.current) {
              // console.log("connectVNC1");
              setTimeout(() => {
                connectVNC(
                  VncIpL,
                  VncPortL,
                  iframeRefL_M.current,
                  user_id,
                  chat_id
                );
              }, 1000);
            }
            if (iframeRefR_M.current) {
              // console.log("connectVNC2");
              setTimeout(() => {
                connectVNC(
                  VncIpR,
                  VncPortR,
                  iframeRefR_M.current,
                  user_id,
                  chat_id
                );
              }, 1000);
            }
          } else {
            if (iframeRefL.current) {
              setTimeout(() => {
                connectVNC(
                  VncIpL,
                  VncPortL,
                  iframeRefL.current,
                  user_id,
                  chat_id
                );
              }, 1500);
            }
            if (iframeRefR.current) {
              setTimeout(() => {
                connectVNC(
                  VncIpR,
                  VncPortR,
                  iframeRefR.current,
                  user_id,
                  chat_id
                );
              }, 1500);
            }
          }
        }
      },
      {
        root: null, // 默认监视视窗
        threshold: 0, // 完全不可见时触发
      }
    );

    if (responsive) {
      if (vncViewerRefL_M.current) {
        observer.observe(vncViewerRefL_M.current);
      }
      if (vncViewerRefR_M.current) {
        observer.observe(vncViewerRefR_M.current);
      }
    } else {
      if (vncViewerRefL.current) {
        observer.observe(vncViewerRefL.current);
      }
    }
    return () => {
      if (vncViewerRefL_M.current) {
        observer.unobserve(vncViewerRefL_M.current);
      }
      if (vncViewerRefR_M.current) {
        observer.unobserve(vncViewerRefR_M.current);
      }
      if (vncViewerRefL.current) {
        observer.unobserve(vncViewerRefL.current);
      }
    };
  }, [
    responsive,
    vncViewerRefL,
    vncViewerRefR,
    vncViewerRefL_M,
    vncViewerRefR_M,
    iframeRefL,
    iframeRefR,
    iframeRefL_M,
    iframeRefR_M,
    VncIpL,
    VncIpR,
    tab,
  ]);
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      // If not connected, just do cleanup without confirmation
      if (chat_id) {
        Disconnect();
        setIframeKeyL(Date.now());
        setIframeKeyR(Date.now());
        setIframeKeyL_M(Date.now());
        setIframeKeyR_M(Date.now());
      } else {
        setIframeKeyL(Date.now());
        setIframeKeyR(Date.now());
        setIframeKeyL_M(Date.now());
        setIframeKeyR_M(Date.now());
      }

      if (chat_id && isVncConnected) {
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [user_id, chat_id, socketService, isVncConnected]);
  const MyRestartConversation = async () => {
    RestartConversation();
    setIframeKeyL(Date.now());
    setIframeKeyR(Date.now());
    setIframeKeyL_M(Date.now());
    setIframeKeyR_M(Date.now());
    // handleConnect("Ubuntu");
  };
  const MyPowerOff = async () => {
    Disconnect();
    setIframeKeyL(Date.now());
    setIframeKeyR(Date.now());
    setIframeKeyL_M(Date.now());
    setIframeKeyR_M(Date.now());
  };
  useEffect(() => {
    const handleSocketMessage = (data: {
      type: string;
      name?: string;
      content: {
        title: string;
        time: string;
        image: string;
        description: string;
        agent_time: string;
        env_time: string;
        isHandoff?: boolean;
        from_agent?: string;
        to_agent?: string;
      };
      user_id: string;
    }) => {
      if (data.user_id === user_id) {
        if (data.type === "end") {
          let newConversationData = [...ConversationDataL];

          // Remove thinking message if it exists at the end
          if (
            newConversationData.length > 0 &&
            newConversationData[newConversationData.length - 1].type === "placeholder"
          ) {
            newConversationData.pop();
            console.log("popping thinking message left:", newConversationData);
          }

          if (
            newConversationData[newConversationData.length - 1].type === "agent" &&
            newConversationData[newConversationData.length - 1].name === "Computer Agent"
          ) {
            newConversationData[newConversationData.length - 1].content =
              newConversationData[
                newConversationData.length - 1
              ].content.concat([data.content]);
          }
          setConversationDataL(newConversationData);
          // if (
          //   newConversationData.length > 0 &&
          //   newConversationData[newConversationData.length - 1].type === "message"
          // ) {
          // } else{
          setCurrentStateL(ConversationState.ConversationEnded);
          // }
          return true;
        } else if (data.type === "user") {
          let newConversationData = [...ConversationDataL];
          newConversationData.push({
            type: "user",
            name: "user",
            content: [data.content],
            isThinking: false,
          });
          if (!isConversationEnded && !isConversationStopped) {
            newConversationData.push({
              type: "placeholder",
              name: "placeholder",
              content: [],
              isThinking: true,
            });
          }
          setConversationDataL(newConversationData);
        } else if (data.type === "agent") {
          let newConversationData = [...ConversationDataL];

          // Remove thinking message if it exists at the end
          if (
            newConversationData.length > 0 &&
            newConversationData[newConversationData.length - 1].type === "placeholder"
          ) {
            newConversationData.pop();
            console.log("popping thinking message left:", newConversationData);
          }

          if (data.name == "Search Agent") {
            console.log("newConversationData left:", newConversationData);
            newConversationData.push({
              type: "agent",
              name: data.name ?? "agent",
              content: [data.content],
              isThinking: false,
            });
            if (!isConversationEnded && !isConversationStopped) {
              newConversationData.push({
                type: "placeholder",
                name: "placeholder",
                content: [],
                isThinking: true,
              });
            }
          } else if (
            newConversationData[newConversationData.length - 1].type === "agent" &&
            newConversationData[newConversationData.length - 1].name === data.name
          ) {

            newConversationData[newConversationData.length - 1].content =
              newConversationData[
                newConversationData.length - 1
              ].content.concat([data.content]);
            console.log("newConversationData left:", newConversationData);
          } else {
            console.log("newConversationData left:", newConversationData);
            newConversationData.push({
              type: "agent",
              name: data.name ?? "agent",
              content: [data.content],
              isThinking: false,
            });
          }
          setConversationDataL(newConversationData);
        } else if (data.type === "handoff") {
          // Create a new agent message for handoff
          console.log("handoff received left:", data);
          let newConversationData = [...ConversationDataL];

          // Remove thinking message if it exists at the end
          if (
            newConversationData.length > 0 &&
            newConversationData[newConversationData.length - 1].type === "placeholder"
          ) {
            newConversationData.pop();
            console.log("popping thinking message left handoff:", newConversationData);
          }

          newConversationData.push({
            type: "agent",
            name: data.content.to_agent ?? "agent",
            content: [data.content],
            isThinking: false,
          });
          setConversationDataL(newConversationData);
        } else if (data.type === "message") {
          let newConversationData = [...ConversationDataL];

          // Remove thinking message if it exists at the end
          if (
            newConversationData.length > 0 &&
            newConversationData[newConversationData.length - 1].type === "placeholder"
          ) {
            newConversationData.pop();
            console.log("popping thinking message left message:", newConversationData);
          }

          newConversationData.push({
            type: "message",
            name: data.name ?? "agent",
            content: [data.content],
            isThinking: false,
          });
          setConversationDataL(newConversationData);
        }

      }
      return false;
    };

    const messageResponseListener = (data: any) => {
      const shouldUnlisten = handleSocketMessage(data);
      if (shouldUnlisten) {
        socketService.Unlisten("message_response_left");
      }
    };

    socketService.Listen("message_response_left", messageResponseListener);

    return () => {
      socketService.Unlisten("message_response_left");
    };
  }, [isInConversation, socketService, ConversationDataL]);

  useEffect(() => {
    const handleSocketMessage = (data: {
      type: string;
      name?: string;
      content: {
        title: string;
        time: string;
        image: string;
        description: string;
        agent_time: string;
        env_time: string;
        isHandoff?: boolean;
        from_agent?: string;
        to_agent?: string;
      };
      user_id: string;
    }) => {
      if (data.user_id === user_id) {
        // console.log("update trajectory right:", data);
        if (data.type === "end") {
          let newConversationData = [...ConversationDataR];

          // Remove thinking message if it exists at the end
          if (
            newConversationData.length > 0 &&
            newConversationData[newConversationData.length - 1].type === "placeholder"
          ) {
            newConversationData.pop();
            console.log("popping thinking message right end:", newConversationData);
          }

          if (
            newConversationData[newConversationData.length - 1].type === "agent" &&
            newConversationData[newConversationData.length - 1].name === "Computer Agent"
          ) {
            newConversationData[newConversationData.length - 1].content =
              newConversationData[
                newConversationData.length - 1
              ].content.concat([data.content]);
          }
          setConversationDataR(newConversationData);

          setCurrentStateR(ConversationState.ConversationEnded);

          socketService.Unlisten("message_response");
        } else if (data.type === "user") {
          let newConversationData = [...ConversationDataR];
          newConversationData.push({
            type: "user",
            name: "user",
            content: [data.content],
          });
          if (!isConversationEnded && !isConversationStopped) {
            newConversationData.push({
              type: "placeholder",
              name: "placeholder",
              content: [],
              isThinking: true,
            });
          }
          setConversationDataR(newConversationData);
        } else if (data.type === "agent") {
          let newConversationData = [...ConversationDataR];

          // Remove thinking message if it exists at the end
          if (
            newConversationData.length > 0 &&
            newConversationData[newConversationData.length - 1].type === "placeholder"
          ) {
            newConversationData.pop();
            console.log("popping thinking message right agent:", newConversationData);
          }

          if (data.name == "Search Agent") {
            console.log("newConversationData right:", newConversationData);
            newConversationData.push({
              type: "agent",
              name: data.name ?? "agent",
              content: [data.content],
              isThinking: false,
            });
            if (!isConversationEnded && !isConversationStopped) {
              newConversationData.push({
                type: "placeholder",
                name: "placeholder",
                content: [],
                isThinking: true,
              });
            }
          } else if (
            newConversationData[newConversationData.length - 1].type === "agent" &&
            newConversationData[newConversationData.length - 1].name === data.name
          ) {
            console.log("newConversationData right:", newConversationData);
            newConversationData[newConversationData.length - 1].content =
              newConversationData[
                newConversationData.length - 1
              ].content.concat([data.content]);
          } else {
            console.log("newConversationData right:", newConversationData);
            newConversationData.push({
              type: "agent",
              name: data.name ?? "agent",
              content: [data.content],
              isThinking: false,
            });
          }
          // console.log("newConversationData", newConversationData);
          setConversationDataR(newConversationData);
        } else if (data.type === "handoff") {
          // Create a new agent message for handoff
          let newConversationData = [...ConversationDataR];

          // Remove thinking message if it exists at the end
          if (
            newConversationData.length > 0 &&
            newConversationData[newConversationData.length - 1].type === "placeholder"
          ) {
            newConversationData.pop();
            console.log("popping thinking message right handoff:", newConversationData);
          }

          newConversationData.push({
            type: "agent",
            name: data.content.to_agent ?? "agent",
            content: [],
            isThinking: false,
          });
          setConversationDataR(newConversationData);
        } else if (data.type === "message") {
          let newConversationData = [...ConversationDataR];

          // Remove thinking message if it exists at the end
          if (
            newConversationData.length > 0 &&
            newConversationData[newConversationData.length - 1].type === "placeholder"
          ) {
            newConversationData.pop();
            console.log("popping thinking message right message line 1238:", newConversationData);
          }

          newConversationData.push({
            type: "message",
            name: data.name ?? "agent",
            content: [data.content],
            isThinking: false,
          });
          setConversationDataR(newConversationData);
        }


      }
      return false;
    };

    const messageResponseListener = handleSocketMessage;
    socketService.Listen("message_response_right", messageResponseListener);
    return () => {
      socketService.Unlisten("message_response_right");
    };
  }, [isInConversation, socketService, ConversationDataR]);

  useEffect(() => {
    const handleSocketMessage = (data: any) => {
      if (data.user_id === user_id) {
        if (data.status === "waiting") {
          SetIsWaiting(true);
          SetWaitingMessage(data.message);
        } else if (data.status === "active") {
          SetIsWaiting(false);
          SetWaitingMessage("");
          showNotification(
            "bottomLeft",
            "success",
            "Ready",
            "Thank you for your patience. The virtual machines are ready for connecting......",
            5
          );
          // 等待两秒后尝试直接连接
          console.log("Congratulations! You are in the active queue and automatically connected.");
          setTimeout(() => {
            if (os) {
              handleConnect(os);
            }
          }, 500);
        }
      }
      return false;
    };

    if (IsWaiting) {
      const messageResponseListener = handleSocketMessage;
      socketService.Listen("wait_in_line", messageResponseListener);
    }
    return () => {
      socketService.Unlisten("wait_in_line");
    };
  }, [IsWaiting, WaitingMessage, socketService]);

  useEffect(() => {
    if (!isFixedUp || !isFixedDown) {
      if (responsive) {
        if (iframeRefL_M.current) {
          sendToIframe(
            {
              action: "resize",
              successMessage: "VNC resized.",
              errorMessage: "Failed to resize.",
            },
            false,
            iframeRefL_M.current,
            user_id,
            chat_id
          );
        }
        if (iframeRefR_M.current) {
          sendToIframe(
            {
              action: "resize",
              successMessage: "VNC resized.",
              errorMessage: "Failed to resize.",
            },
            false,
            iframeRefR_M.current,
            user_id,
            chat_id
          );
        }
      } else {
        if (iframeRefL.current) {
          sendToIframe(
            {
              action: "resize",
              successMessage: "VNC resized.",
              errorMessage: "Failed to resize.",
            },
            false,
            iframeRefL.current,
            user_id,
            chat_id
          );
        }
        if (iframeRefR.current) {
          sendToIframe(
            {
              action: "resize",
              successMessage: "VNC resized.",
              errorMessage: "Failed to resize.",
            },
            false,
            iframeRefR.current,
            user_id,
            chat_id
          );
        }
      }
    }
  }, [isFixedUp, isFixedDown]);

  const VncViewerRef = useRef(null);
  const SetupRef = useRef(null);
  const TacjectoryRef = useRef(null);
  const EvalRef = useRef(null);
  const MessageRef = useRef(null);
  const [tour_open, setTourOpen] = useState(false);
  const tutorial_steps: TourProps["steps"] = [
    {
      title: "Computer",
      description:
        "Agent Arena provides two parallel computers for viewing. You can set up the initial environment by clicking, dragging to upload files and any other operations just like your own computer.",
      placement: "bottom",
      target: () => VncViewerRef.current,
    },
    {
      title: "Setup",
      description:
        "Set up the operating system for the agents. Click the connect button to start",
      target: () => SetupRef.current,
    },
    {
      title: "Message",
      description: "Send your command to the agents.",
      target: () => MessageRef.current,
    },
    {
      title: "Conversation",
      description: "Start the conversation with the agents.",
      target: () => TacjectoryRef.current,
    },
    {
      title: "Evaluation",
      description: "Evaluate the conversation.",
      target: () => EvalRef.current,
    },
  ];
  const documentRef = useRef(document);
  useEffect(() => {
    documentRef.current = document;

    const handleScroll = (event: WheelEvent) => {
      if (tour_open) {
        event.preventDefault();
      }
    };

    if (tour_open) {
      documentRef.current.addEventListener("wheel", handleScroll, {
        passive: false,
      });
    }

    return () => {
      if (documentRef.current) {
        documentRef.current.removeEventListener("wheel", handleScroll);
      }
    };
  }, [tour_open]);

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    if (isVncConnected) {
      event.currentTarget.classList.add("drag-over");
    }
    // 禁用 iframe 的鼠标事件，使其能穿透到底层 div
    const iframe = event.currentTarget.querySelector("iframe");
    if (iframe) {
      iframe.style.pointerEvents = "none";
    }
  };

  const handleDragLeave = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.currentTarget.classList.remove("drag-over");
    // 恢复 iframe 的鼠标事件
    const iframe = event.currentTarget.querySelector("iframe");
    if (iframe) {
      iframe.style.pointerEvents = "auto";
    }
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.currentTarget.classList.remove("drag-over");
    // 恢复 iframe 的鼠标事件
    const iframe = event.currentTarget.querySelector("iframe");
    if (iframe) {
      iframe.style.pointerEvents = "auto";
    }
  };

  // 添加一个全局的拖拽开始事件处理器
  useEffect(() => {
    const handleDragStart = () => {
      // 当开始拖拽时，禁用所有 iframe 的鼠标事件
      const iframes = document.querySelectorAll(".responsive-iframe");
      iframes.forEach((iframe) => {
        (iframe as HTMLElement).style.pointerEvents = "none";
      });
    };

    const handleDragEnd = () => {
      // 当拖拽结束，恢复所有 iframe 的鼠标事件
      const iframes = document.querySelectorAll(".responsive-iframe");
      iframes.forEach((iframe) => {
        (iframe as HTMLElement).style.pointerEvents = "auto";
      });
    };

    document.addEventListener("dragstart", handleDragStart);
    document.addEventListener("dragend", handleDragEnd);

    return () => {
      document.removeEventListener("dragstart", handleDragStart);
      document.removeEventListener("dragend", handleDragEnd);
    };
  }, []);

  const [isLoading, setIsLoading] = useState(true);
  //sleep两秒之后才让isLoading变为false
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);
  const [connectStatus, setConnectStatus] = useState<"idle" | "connecting">(
    "idle"
  );
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [isSecondCommandPaletteOpen, setIsSecondCommandPaletteOpen] = useState(false);
  const handleSecondCommandPaletteSelectApp = (category: string, app_name: string, parameters: any) => {
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
  const handleConnectClick = async () => {
    // 立即设置状态为connecting，防止重复点击
    setConnectStatus("connecting");
    
    try {
      // Check if user is logged in
      if (!isLogin || (isLogin && user_id?.startsWith("anonymous_"))) {
        // Check if anonymous access is allowed
        const result = await checkAnonymousAccess();
        console.log("result", result);
        if (result) {
          // Create proper anonymous login session
          const success = await handleAnonymousLogin();
          if (!success) {
            setConnectStatus("idle");
            return;
          }
          // Open command palette to wait for selection
          setIsCommandPaletteOpen(true);
        } else {
          // Not allowed anonymous access - prompt login
          setIsLogin(false);
          setUser_id(null);
          setUserName(null);
          setAvatarUrl(null);
          setAlias(null);
          setQuota(null);
          showNotification(
            "bottomLeft",
            "warning",
            "Login Required",
            "Please login to use Computer Agent Arena"
          );
          setConnectStatus("idle");
          return;
        }
      }
      else {
        // Open command palette to wait for selection
        // setIsCommandPaletteOpen(true);
        await handleConnect(os as string);
      }
    } catch (error) {
      console.error("Connection error:", error);
      setConnectStatus("idle");
      showNotification(
        "bottomLeft",
        "error",
        "Connection Error",
        "Failed to establish connection. Please try again."
      );
    }
  };

  const handleEnvironmentSelected = async (category: string, app_name: string, parameters: any) => {
    setConnectStatus("connecting");
    try {
      await handleConnect(os as string);
    } finally {
      setConnectStatus("idle");
    }
  };

  // Add click handler function
  const handleOSSelect = (os: string) => {
    setOs(os);
  };
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [selectedApp, setSelectedApp] = useState<string>("");
  const [parameters, setParameters] = useState<any>({});

  const SupportedEnvironments = [
    {
      id: "Web",
      name: "Web",
      icon: <FontAwesomeIcon icon={faGlobe} color="#E95420" />,
    },
    {
      id: "Code",
      name: "Code",
      icon: <FontAwesomeIcon icon={faCode} color="#0E53AC" />,
    },
    {
      id: "Office",
      name: "Office Workflow",
      icon: <FontAwesomeIcon icon={faFileWord} color="#0E53AC" />,
    },
    {
      id: "Media",
      name: "Multi-media",
      icon: <FontAwesomeIcon icon={faPhotoFilm} color="#E95420" />,
    },
  ];
  const [environmentOptions, setEnvironmentOptions] = useState(() => {
    const randomEnvs = SupportedEnvironments.sort(
      () => Math.random() - 0.5
    ).slice(0, 4);
    return [
      {
        id: "random",
        name: "Random",
        icon: <FontAwesomeIcon icon={faShuffle} />,
      },
      ...randomEnvs,
      {
        id: "original",
        name: "Original",
        icon: <FontAwesomeIcon icon={faDisplay} />,
      },
    ];
  });
  // 监听execute_quick_setup事件
  const [setupDescription, setSetupDescription] = useState<string>("");
  const [setupStatus, setSetupStatus] = useState<
    { description: string; status: "start" | "end" | "none" }[]
  >([]);
  const [isSettingUp, setIsSettingUp] = useState(false);
  useEffect(() => {
    const handleExecuteQuickSetup = (data: any) => {
      if (data.user_id === user_id) {
        // setSetupDescription(data.config_desciption);
        setSetupStatus(data.details);

        // Check if all statuses are "end"
        const allComplete = data.details.every((status: any) => status.status === "end");

        if (allComplete) {
          // Add 2 second delay before setting isSettingUp to false
          setTimeout(() => {
            setIsSettingUp(false);
          }, 2000);
        } else {
            setIsSettingUp(true);
        }
      }
    };


    socketService.Listen("execute_quick_setup", handleExecuteQuickSetup);

    // Cleanup function
    return () => {
      socketService.Unlisten("execute_quick_setup");
    };
  }, [isVncConnected, isSettingUp, user_id, isCommandPaletteOpen]);

  // Add state for controlling collapse
  const [isHowItWorksExpanded, setIsHowItWorksExpanded] = useState(false);

  const handleAnonymousLogin = async () => {
    try {
      // Get fingerprint for anonymous identification
      const fingerprint = await fingerprintService.getFingerprint();

      // Request anonymous token from backend
      const response = await socketService.Post("anonymous_login", {
        fingerprint: fingerprint
      });

      if (response.status === "success") {
        // Store token and set user data
        localStorage.setItem("token", response.token);
        setIsLogin(true);
        setUser_id(response.user_id);
        setUserName("anonymous_user");
        setQuota(response.quota || 1); // Limited quota for anonymous users

        showNotification(
          "bottomLeft",
          "info",
          "Trial Mode",
          "In our beta release version, we provide 1 quota for limited anonymous users. Please login for continued access.",
          5
        );

        return true;
      } else {
        showNotification(
          "bottomLeft",
          "error",
          "Anonymous Access Failed",
          response.message || "Could not create anonymous session"
        );
        return false;
      }
    } catch (error) {
      console.error("Anonymous login error:", error);
      showNotification(
        "bottomLeft",
        "error",
        "Anonymous Access Failed",
        "Could not create anonymous session"
      );
      return false;
    }
  };

  // 添加socket监听器
  useEffect(() => {
    // 监听来自后端的message_to_agent_response事件
    socketService.Listen("message_to_agent_response", (data) => {
      if (data.user_id === user_id) {
        // 根据agent_idx确定是左侧还是右侧agent
        if (data.agent_idx === 0) {
          setCurrentStateL(ConversationState.InConversation);
        } else if (data.agent_idx === 1) {
          setCurrentStateR(ConversationState.InConversation);
        }
      }
    });

    return () => {
      socketService.Unlisten("message_to_agent_response");
    };
  }, [socketService, user_id]);

  // FAQ section
  const [isFaqExpanded, setIsFaqExpanded] = useState(false);
  const [expandedFaqItems, setExpandedFaqItems] = useState<boolean[]>([]);
  const faqItems = [
    {
      question: "What is Computer Agent Arena?",
      answer: "Computer Agent Arena is a platform where users can interact with AI agents to perform various tasks. It's designed to simulate a real-world scenario where users can observe and evaluate the performance of AI agents.",
    },
    {
      question: "What happens if I'm in the waiting queue?",
      answer: "If you're in the waiting queue, it means the system is currently at the capacity limit of providing virtual machines to users. This is because every conversation occupies two cloud-hosted virtual machines. Please wait patiently and do not exit the page, as we are launching more virtual machines to proceed with your request.",
    },
    {
      question: "How long does it take to evaluate an agent?",
      answer: "The evaluation process can vary depending on the complexity of the task. Generally, it takes a few minutes to complete an evaluation.",
    },
    {
      question: "Can I see the identity of the agent's model and framework?",
      answer: "During the conversation, the identity of agents are anonymized. However, after submitting the evaluation, the identities of both agents' model and framework will be revealed. Take a look!",
    },
    {
      question: "How do I share the conversation?",
      answer: "After submitting the evaluation, you can share the conversation by clicking the 'Share Conversation' button. This will generate a shareable link that you can send to others.",
    },
    {
      question: "How do I provide more feedbacks?",
      answer: "We'd appreciate any insightful feedbacks or bug reports. Please contact us via email at xlang.agentarena@gmail.com or join our Discord server for further discussions.",
    }
  ];
  const handleFaqItemToggle = (index: number) => {
    setExpandedFaqItems(prev => {
      const newExpanded = [...prev];
      newExpanded[index] = !newExpanded[index];
      return newExpanded;
    });
  };

  // Add cleanup for conversation end
  useEffect(() => {
    const handleConversationEnd = () => {
      setRejectedInstructions(new Set()); // Clear rejected instructions when conversation ends
      setWarnedInstructions(new Set()); // Clear warned instructions when conversation ends
    };

    socketService.Listen("conversation_end", handleConversationEnd);
    return () => {
      socketService.Unlisten("conversation_end");
    };
  }, []);

  return (
    <div className="flex flex-col">
      <Description />

      {/*
      <div className="flex items-center gap-4 mb-4">
        <input
          type="text"
          className="px-4 py-2 border rounded-lg focus:outline-none focus:border-blue-500"
          placeholder="Url Here"
          value={githubRepoUrl}
          onChange={(e) => setGithubRepoUrl(e.target.value)}
        />
        <button
          className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          onClick={() => {
            
            const message = {
              user_id: user_id,
              chat_id: chat_id,
              target: "vscode_open_file",
              parameters: {
                github_repo_url: githubRepoUrl,
              },
            };

            console.log("quick_setup", message);
            socketService.Send("quick_setup", message);
          }}
        >
          Vscode: Github Repo Clone
        </button>
      
      </div>
      
      <div className="flex items-center gap-4 mb-4">
        <input
          type="text"
          className="px-4 py-2 border rounded-lg focus:outline-none focus:border-blue-500"
          placeholder="Url Here"
          value={vscodeDownloadUrl}
          onChange={(e) => setVscodeDownloadUrl(e.target.value)}
        />
        <button
          className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          onClick={() => {
            
            const message = {
              user_id: user_id,
              chat_id: chat_id,
              target: "vscode_open_file",
              parameters: {
                download_url: vscodeDownloadUrl,
              },
            };

            console.log("quick_setup", message);
            socketService.Send("quick_setup", message);
          }}
        >
          Vscode: download python file
        </button>
      </div> */}

      <ProCard ref={VncViewerRef} ghost>
        {/* Desktop view - two columns */}
        <div ref={dividerRefUp}></div>
        <div className="max-md:hidden">
          <div className="flex flex-row gap-8">
            {/* Left Column */}
            <div className="w-1/2">
              <div
                ref={vncViewerRefL}
                className="relative w-full h-full min-h-[25vw]"
              >
                <div className="flex flex-col rounded-t-lg overflow-hidden">
                  <div
                    className="iframe-container"
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                  >
                    <iframe
                      key={iframeKeyL}
                      title="left"
                      ref={iframeRefL}
                      id="noVncIframe"
                      src="noVNC/vnc.html"
                      className="responsive-iframe"
                    />
                    {!isVncConnected && (
                      <div className="absolute inset-0 bg-transparent backdrop-blur-sm">
                        <div className="w-full h-full flex flex-col items-center justify-center p-8">
                          <h1 className="text-medium sm:text-base md:text-lg lg:text-xl font-bold text-white mb-12">
                            Select Computer Operating System
                          </h1>

                          <div className="grid grid-cols-3 gap-8 mb-4 sm:mb-2 md:mb-4 lg:mb-6">

                            {/* Windows */}
                            <div
                              className={`flex flex-col items-center ${IsWaiting
                                ? "cursor-not-allowed opacity-50"
                                : "cursor-pointer transition-transform hover:scale-105"
                                }`}
                              onClick={() =>
                                !IsWaiting && handleOSSelect("Windows")
                              }
                            >
                              <div
                                className={`w-20 h-20 sm:w-8 sm:h-8 md:w-20 md:h-20 lg:w-24 lg:h-24 ${os === "Windows" && !IsWaiting
                                  ? "bg-white/60"
                                  : "bg-white/40"
                                  } rounded-xl p-4 backdrop-blur-sm transition-colors`}
                              >
                                <FontAwesomeIcon
                                  icon={faWindows}
                                  className="w-full h-full object-contain text-[#0E53AC]"
                                />
                              </div>
                              <span
                                className={`mt-2 text-sm sm:text-xs md:text-sm lg:text-base ${os === "Windows" && !IsWaiting
                                  ? "text-white font-bold"
                                  : "text-white"
                                  }`}
                              >
                                Windows
                              </span>
                            </div>

                            {/* Ubuntu */}
                            <div
                              className={`flex flex-col items-center ${IsWaiting
                                ? "cursor-not-allowed opacity-50"
                                : "cursor-pointer transition-transform hover:scale-105"
                                }`}
                              onClick={() =>
                                !IsWaiting && handleOSSelect("Ubuntu")
                              }
                            >
                              <div
                                className={`w-20 h-20 sm:w-8 sm:h-8 md:w-20 md:h-20 lg:w-24 lg:h-24 ${os === "Ubuntu" && !IsWaiting
                                  ? "bg-white/60"
                                  : "bg-white/40"
                                  } rounded-xl p-4 backdrop-blur-sm transition-colors`}
                              >
                                <FontAwesomeIcon
                                  icon={faUbuntu}
                                  className="w-full h-full object-contain text-[#E95420]"
                                />
                              </div>
                              <span
                                className={`mt-2 text-sm sm:text-xs md:text-sm lg:text-base ${os === "Ubuntu" && !IsWaiting
                                  ? "text-white font-bold"
                                  : "text-white"
                                  }`}
                              >
                                Ubuntu
                              </span>
                            </div>



                            {/* MacOS */}
                            <div
                              className="flex flex-col items-center cursor-not-allowed opacity-50"
                              title="MacOS coming soon"
                            >
                              <div className="w-20 h-20 sm:w-8 sm:h-8 md:w-20 md:h-20 lg:w-24 lg:h-24 bg-white/20 rounded-xl p-4 backdrop-blur-sm">
                                <FontAwesomeIcon
                                  icon={faApple}
                                  className="w-full h-full object-contain text-[#1D1D1D]"
                                />
                              </div>
                              <span className="mt-2 text-sm sm:text-xs md:text-sm lg:text-base text-white">
                                MacOS
                                <span className="text-xs ml-1">
                                  (Coming Soon)
                                </span>
                              </span>
                            </div>
                          </div>

                          <div className="text-center">
                            {IsWaiting ? (
                              <div className="flex flex-col items-center justify-center gap-2 text-white text-base sm:text-sm md:text-base lg:text-lg mb-4">
                                {WaitingMessage}
                              </div>
                            ) : (
                              <div className="flex flex-row items-center justify-center gap-2 text-white text-base sm:text-sm md:text-base lg:text-lg mb-4">
                                Click{" "}
                                {!isLoading && (
                                  <span
                                    onClick={() =>
                                      os &&
                                      !isVncConnected &&
                                      handleConnectClick()
                                    }
                                    className={`  
                  px-4 py-0.5 sm:px-2 sm:py-0 md:px-4 md:py-1 lg:px-6 lg:py-1 rounded-full text-sm sm:text-xs md:text-sm lg:text-base
                  flex items-center justify-center
                  transition-all duration-200
                  ${!os || isVncConnected
                                        ? "bg-gray-300 cursor-not-allowed"
                                        : connectStatus === "connecting"
                                          ? "bg-[#E1D6F2] border border-[#7c5db899] text-purple-800"
                                          : "bg-[#E1D6F2] border border-[#7c5db899] text-purple-800 hover:bg-[#9d85c9] cursor-pointer"
                                      }
                `}
                                  >
                                    {connectStatus === "connecting" ? (
                                      <div className="flex items-center gap-2">
                                        <div className="w-3 h-3 border-2 border-[#7c5db8] border-t-transparent rounded-full animate-spin"></div>
                                        <span>Connecting...</span>
                                      </div>
                                    ) : (
                                      "Connect"
                                    )}
                                  </span>
                                )}
                                to start!
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                    {isVncConnected && isSettingUp && (
                      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50">
                        <div className="bg-white/80 rounded-lg px-6 py-4 flex flex-col items-center gap-1">
                          <Spin tip="Loading" size="large">
                          </Spin>
                          <p className="text-black-800 text-md text-center"> Initializing computers...</p>
                          <p className="text-black-600 text-xs text-center">This process may take up to 20 seconds.<br />Please wait patiently.</p>
                        </div>
                      </div>
                    )}
                  </div>
                  {isVncConnected && (
                    <div className="flex justify-between items-center px-6 py-2 text-xs bg-[#F0F0F0]">

                      <span>{os} - A</span>
                      <Tooltip title="You can freely operate on the computer to setup as you want (e.g. click, type, drag file, etc.)">
                        <FontAwesomeIcon icon={faCircleQuestion} className="text-xs text-gray-500 hover:text-gray-700 cursor-pointer" />
                      </Tooltip>
                      {/* <button
                        className="text-xs hover:bg-gray-200 rounded px-2 py-1 transition-colors"
                        onClick={() =>
                          connectVNC(
                            VncIpL,
                            VncPortL,
                            iframeRefL.current,
                            user_id,
                            chat_id
                          )
                        }
                      >
                        <FontAwesomeIcon
                          icon={faArrowsRotate}
                          className="mr-2"
                        />
                        Refresh
                      </button> */}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div className="w-1/2">
              <div
                ref={vncViewerRefR}
                className="relative w-full h-full min-h-[25vw]"
              >
                <div className="flex flex-col rounded-t-lg overflow-hidden">
                  <div
                    className="iframe-container"
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                  >
                    <iframe
                      key={iframeKeyR}
                      title="right"
                      ref={iframeRefR}
                      id="noVncIframe"
                      src="noVNC/vnc.html"
                      className="responsive-iframe"
                    />
                    {!isVncConnected && (
                      <div className="absolute inset-0 bg-transparent backdrop-blur-sm">
                        <div className="w-full h-full flex flex-col items-center justify-center p-8">
                          <h1 className="text-medium sm:text-base md:text-lg lg:text-xl font-bold text-white mb-8">
                            Watch Agent Arena Video Tutorial
                          </h1>
                          <iframe
                            className="w-full max-w-[80%] max-h-[80%] aspect-[16/9] rounded-lg border-none"
                            src="https://www.youtube.com/embed/xbslfovtpLI?si=k_Y5OBPbqceISz65"
                            title="Agent Arena Demo"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                          />
                        </div>
                      </div>
                    )}
                    {isVncConnected && isSettingUp && (
                      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50">
                        <div className="bg-white/80 rounded-lg px-6 py-4 flex flex-col items-center gap-1">
                          <Spin tip="Loading" size="large">
                          </Spin>
                          <p className="text-black-800 text-md text-center">Initializing computers...</p>
                          <p className="text-black-600 text-xs text-center">This process may take up to 20 seconds.<br />Please wait patiently.</p>
                        </div>
                      </div>
                    )}
                    {/* {!isVncConnected && isLogin && (
                      <div className="absolute inset-0 bg-transparent backdrop-blur-sm aspect-[16/9] w-full">
                        <div className="w-full h-full flex flex-col items-center justify-center p-8">
                          <h1 className="text-medium sm:text-base md:text-lg lg:text-xl font-bold text-white mb-12">
                            Select Init Environment
                          </h1>

                          <div className="grid grid-cols-3 gap-4 mb-4">
                            {environmentOptions.map((env) => (
                              <div
                                key={env.id}
                                className={`flex flex-col items-center ${
                                  IsWaiting
                                    ? "cursor-not-allowed opacity-50"
                                    : "cursor-pointer transition-transform hover:scale-105"
                                }`}
                                onClick={() =>
                                  !IsWaiting && setSelectedCategory(env.id)
                                }
                              >
                                <div
                                  className={`w-12 h-12 sm:w-8 sm:h-8 md:w-12 md:h-12 lg:w-16 lg:h-16 
                                              ${
                                                selectedCategory === env.id &&
                                                !IsWaiting
                                                  ? "bg-white/60"
                                                  : "bg-white/40"
                                              }
                                              rounded-xl p-4 backdrop-blur-sm transition-colors flex items-center justify-center text-4xl`}
                                >
                                  {env.icon}
                                </div>
                                <span
                                  className={`mt-2 text-sm sm:text-xs md:text-sm lg:text-base 
                                              ${
                                                selectedCategory === env.id &&
                                                !IsWaiting
                                                  ? "text-white font-bold"
                                                  : "text-white"
                                              }`}
                                >
                                  {env.name}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )} */}
                  </div>

                  {isVncConnected && (
                    <div className="flex justify-between items-center px-6 py-2 text-xs bg-[#F0F0F0]">

                      <span>{os} - B</span>
                      <Tooltip title="You can freely operate on the computer to setup as you want (e.g. click, type, drag file, etc.)">
                        <FontAwesomeIcon icon={faCircleQuestion} className="text-xs text-gray-500 hover:text-gray-700 cursor-pointer" />
                      </Tooltip>
                      {/* <button
                        className="text-xs hover:bg-gray-200 rounded px-2 py-1 transition-colors"
                        onClick={() =>
                          connectVNC(
                            VncIpR,
                            VncPortR,
                            iframeRefR.current,
                            user_id,
                            chat_id
                          )
                        }
                      >
                        <FontAwesomeIcon
                          icon={faArrowsRotate}
                          className="mr-2"
                        />
                        Refresh
                      </button> */}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* <div className="max-md:hidden">
          {isVncConnected &&
            setupDescription !== "" &&
            !isInConversation &&
            !IsWaiting &&
            !isConversationEnded &&
            !isConversationStopped &&
            !isEvaluationEnded && (
              <div className="flex flex-col gap-0 justify-start">
                <span className="inline-flex flex-row text-gray-800 text-sm my-0 ml-2 gap-2">
                  <span className="font-semibold">Initialization:</span>
                  {setupDescription}
                </span>
                {/* <ul className="space-y-0 mt-0 px-4">
                  {setupStatus.map((status, index) => (
                    <li
                      key={index}
                      className={`
            flex items-center gap-2 px-0 py-0 rounded-md text-xs indent-0
            ${status.status === "none" ? "text-gray-400" : ""}
            ${status.status === "start" ? "text-gray-800" : ""}
            ${status.status === "end" ? "text-green-600" : ""}
          `}
                    >
                      {status.status === "none" && (
                        <div className="w-4 h-4 rounded-full border-2 border-gray-300" />
                      )}
                      {status.status === "start" && <Spin size="small" />}
                      {status.status === "end" && (
                        <svg
                          className="w-4 h-4 text-green-600"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                      )}
                      {status.description}
                    </li>
                  ))}
                </ul>
              </div>
            )}
        </div> */}
        <div ref={dividerRefDown}></div>
      </ProCard>
        

      {/* TODO: Fix me */}
      {/* {(agent && vlm) && (
        <div className="grid grid-cols-2 gap-4 bg-neutral-100/50 rounded-lg px-4 py-2 mb-2">
          <div className="flex flex-col">
            <h3 className="font-semibold text-base mb-1">Agent A</h3>
            <p className="text-sm text-gray-600">{Agent_Display(vlm[0], agent[0])}</p>
          </div>
          <div className="flex flex-col">
            <h3 className="font-semibold text-base mb-1">Agent B</h3>
            <p className="text-sm text-gray-600">{Agent_Display(vlm[1], agent[1])}</p>
          </div>
        </div>
      )} */}
      <div ref={TacjectoryRef} className="w-full flex flex-col items-center">
        <div className="w-full flex flex-row gap-2">
          <div className="w-1/2 max-md:hidden">
            <Conversation position="left" />
          </div>
          <div className="w-1/2 max-md:hidden">
            <Conversation position="right" />
          </div>
        </div>
      </div>

      {/* Mobile view - two columns */}
      <ProCard ghost>
        {/* Mobile view - 2 tabs */}
        <div className="w-full md:hidden mb-4">
          <Tabs
            centered
            activeKey={tab}
            onChange={(activeKey) => setTab(activeKey as typeof tab)}
          >
            <Tabs.TabPane key={"one"} tab={"Agent A"} />
            <Tabs.TabPane key={"two"} tab={"Agent B"} />
          </Tabs>
          {tab === "one" && (
            <div>
              <div className="iframe-container" ref={vncViewerRefL_M}>
                <iframe
                  key={iframeKeyL_M}
                  title="left"
                  ref={iframeRefL_M}
                  id="noVncIframe"
                  src="noVNC/vnc.html"
                  className="responsive-iframe"
                />
                {!isVncConnected && (
                  <div className="absolute inset-0 bg-transparent backdrop-blur-sm">
                    <div className="w-full h-full flex flex-col items-center justify-center p-8">
                      <h1 className="text-base sm:text-base md:text-lg lg:text-xl font-bold text-white mb-2 sm:mb-4 md:mb-6 lg:mb-8">
                        Select Computer Operating System
                      </h1>

                      <div className="grid grid-cols-3 gap-1 sm:gap-1 md:gap-2 lg:gap-4 mb-2 sm:mb-2 md:mb-4 lg:mb-6">
                        {/* Ubuntu */}
                        <div
                          className="flex flex-col items-center cursor-pointer transition-transform hover:scale-105"
                          onClick={() => handleOSSelect("Ubuntu")}
                        >
                          <div
                            className={`w-16 h-16 sm:w-16 sm:h-16 md:w-16 md:h-16 lg:w-24 lg:h-24 ${os === "Ubuntu" ? "bg-white/60" : "bg-white/40"
                              } rounded-xl p-4 backdrop-blur-sm transition-colors`}
                          >
                            <FontAwesomeIcon
                              icon={faUbuntu}
                              className="w-full h-full object-contain text-[#E95420]"
                            />
                          </div>
                          <span
                            className={`mt-2 text-xs sm:text-xs md:text-sm lg:text-base ${os === "Ubuntu"
                              ? "text-white font-bold"
                              : "text-white"
                              }`}
                          >
                            Ubuntu
                          </span>
                        </div>

                        {/* Windows */}
                        <div
                          className="flex flex-col items-center cursor-pointer transition-transform hover:scale-105"
                          onClick={() => handleOSSelect("Windows")}
                        >
                          <div
                            className={`w-16 h-16 sm:w-16 sm:h-16 md:w-16 md:h-16 lg:w-24 lg:h-24 ${os === "Windows" ? "bg-white/60" : "bg-white/40"
                              } rounded-xl p-4 backdrop-blur-sm transition-colors`}
                          >
                            <FontAwesomeIcon
                              icon={faWindows}
                              className="w-full h-full object-contain text-[#0E53AC]"
                            />
                          </div>
                          <span
                            className={`mt-2 text-xs sm:text-xs md:text-sm lg:text-base ${os === "Windows"
                              ? "text-white font-bold"
                              : "text-white"
                              }`}
                          >
                            Windows
                          </span>
                        </div>

                        {/* MacOS */}
                        <div
                          className="flex flex-col items-center cursor-not-allowed opacity-50"
                          title="MacOS coming soon"
                        >
                          <div className="w-16 h-16 sm:w-16 sm:h-16 md:w-16 md:h-16 lg:w-24 lg:h-24 bg-white/20 rounded-xl p-4 backdrop-blur-sm">
                            <FontAwesomeIcon
                              icon={faApple}
                              className="w-full h-full object-contain text-[#1D1D1D]"
                            />
                          </div>
                          <span className="mt-2 text-xs sm:text-xs md:text-sm lg:text-base text-white">
                            MacOS
                            <span className="text-xs ml-1">(Coming Soon)</span>
                          </span>
                        </div>
                      </div>

                      <div className="text-center">
                        {IsWaiting ? (
                          <div className="flex flex-col items-center justify-center gap-2 text-white text-base sm:text-sm md:text-base lg:text-lg mb-4">
                            {WaitingMessage}
                          </div>
                        ) : (
                          <div className="flex flex-row items-center justify-center gap-2 text-white text-base sm:text-sm md:text-base lg:text-lg mb-4">
                            Click{" "}
                            {!isLoading && (
                              <span
                                onClick={() =>
                                  os && !isVncConnected && handleConnectClick()
                                }
                                className={`  
                  px-4 py-0.5 sm:px-2 sm:py-0 md:px-4 md:py-1 lg:px-6 lg:py-1 rounded-full text-sm sm:text-xs md:text-sm lg:text-base
                  flex items-center justify-center
                  transition-all duration-200
                  ${!os || isVncConnected
                                    ? "bg-gray-300 cursor-not-allowed"
                                    : connectStatus === "connecting"
                                      ? "bg-[#E1D6F2] border border-[#7c5db899] text-purple-800"
                                      : "bg-[#E1D6F2] border border-[#7c5db899] text-purple-800 hover:bg-[#9d85c9] cursor-pointer"
                                  }
                `}
                              >
                                {connectStatus === "connecting" ? (
                                  <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 border-2 border-[#7c5db8] border-t-transparent rounded-full animate-spin"></div>
                                    <span>Connecting...</span>
                                  </div>
                                ) : (
                                  "Connect"
                                )}
                              </span>
                            )}
                            to start!
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
              {isVncConnected && (
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    fontSize: "12px",
                    margin: "2px",
                    padding: "6px",
                    alignItems: "center",
                  }}
                >
                  {os} - A
                  <Button
                    type="text"
                    size="small"
                    style={{
                      fontSize: "12px",
                      margin: 0,
                    }}
                    onClick={() =>
                      connectVNC(
                        VncIpL,
                        VncPortL,
                        iframeRefL_M.current,
                        user_id,
                        chat_id
                      )
                    }
                  >
                    <FontAwesomeIcon
                      icon={faArrowsRotate}
                      style={{ marginRight: "6pt" }}
                    />
                    Refresh
                  </Button>
                </div>
              )}
              {/* <Setup handleConnect={handleConnect} /> */}
              <Conversation position="left" />
            </div>
          )}
          {tab === "two" && (
            <div>
              <div className="iframe-container" ref={vncViewerRefR_M}>
                <iframe
                  key={iframeKeyR_M}
                  title="right"
                  ref={iframeRefR_M}
                  id="noVncIframe"
                  src="noVNC/vnc.html"
                  className="responsive-iframe"
                />
                {!isVncConnected && (
                  <div className="absolute inset-0 bg-transparent backdrop-blur-sm">
                    <div className="w-full h-full flex flex-col items-center justify-center p-8">
                      <h1 className="text-base sm:text-base md:text-lg lg:text-xl font-bold text-white mb-2 sm:mb-4 md:mb-6 lg:mb-8">
                        Select Computer Operating System
                      </h1>

                      <div className="grid grid-cols-3 gap-1 sm:gap-1 md:gap-2 lg:gap-4 mb-2 sm:mb-2 md:mb-4 lg:mb-6">
                        {/* Ubuntu */}
                        <div
                          className="flex flex-col items-center cursor-pointer transition-transform hover:scale-105"
                          onClick={() => handleOSSelect("Ubuntu")}
                        >
                          <div
                            className={`w-16 h-16 sm:w-16 sm:h-16 md:w-16 md:h-16 lg:w-24 lg:h-24 ${os === "Ubuntu" ? "bg-white/60" : "bg-white/40"
                              } rounded-xl p-4 backdrop-blur-sm transition-colors`}
                          >
                            <FontAwesomeIcon
                              icon={faUbuntu}
                              className="w-full h-full object-contain text-[#E95420]"
                            />
                          </div>
                          <span
                            className={`mt-2 text-xs sm:text-xs md:text-sm lg:text-base ${os === "Ubuntu"
                              ? "text-white font-bold"
                              : "text-white"
                              }`}
                          >
                            Ubuntu
                          </span>
                        </div>

                        {/* Windows */}
                        <div
                          className="flex flex-col items-center cursor-pointer transition-transform hover:scale-105"
                          onClick={() => handleOSSelect("Windows")}
                        >
                          <div
                            className={`w-16 h-16 sm:w-16 sm:h-16 md:w-16 md:h-16 lg:w-24 lg:h-24 ${os === "Windows" ? "bg-white/60" : "bg-white/40"
                              } rounded-xl p-4 backdrop-blur-sm transition-colors`}
                          >
                            <FontAwesomeIcon
                              icon={faWindows}
                              className="w-full h-full object-contain text-[#0E53AC]"
                            />
                          </div>
                          <span
                            className={`mt-2 text-xs sm:text-xs md:text-sm lg:text-base ${os === "Windows"
                              ? "text-white font-bold"
                              : "text-white"
                              }`}
                          >
                            Windows
                          </span>
                        </div>

                        {/* MacOS */}
                        <div
                          className="flex flex-col items-center cursor-not-allowed opacity-50"
                          title="MacOS coming soon"
                        >
                          <div className="w-16 h-16 sm:w-16 sm:h-16 md:w-16 md:h-16 lg:w-24 lg:h-24 bg-white/20 rounded-xl p-4 backdrop-blur-sm">
                            <FontAwesomeIcon
                              icon={faApple}
                              className="w-full h-full object-contain text-[#1D1D1D]"
                            />
                          </div>
                          <span className="mt-2 text-xs sm:text-xs md:text-sm lg:text-base text-white">
                            MacOS
                            <span className="text-xs ml-1">(Coming Soon)</span>
                          </span>
                        </div>
                      </div>

                      <div className="text-center">
                        {IsWaiting ? (
                          <div className="flex flex-col items-center justify-center gap-2 text-white text-base sm:text-sm md:text-base lg:text-lg mb-4">
                            {WaitingMessage}
                          </div>
                        ) : (
                          <div className="flex flex-row items-center justify-center gap-2 text-white text-base sm:text-sm md:text-base lg:text-lg mb-4">
                            Click{" "}
                            {!isLoading && (
                              <span
                                onClick={() =>
                                  os && !isVncConnected && handleConnectClick()
                                }
                                className={`  
                  px-4 py-0.5 sm:px-2 sm:py-0 md:px-4 md:py-1 lg:px-6 lg:py-1 rounded-full text-sm sm:text-xs md:text-sm lg:text-base
                  flex items-center justify-center
                  transition-all duration-200
                  ${!os || isVncConnected
                                    ? "bg-gray-300 cursor-not-allowed"
                                    : connectStatus === "connecting"
                                      ? "bg-[#E1D6F2] border border-[#7c5db899] text-purple-800"
                                      : "bg-[#E1D6F2] border border-[#7c5db899] text-purple-800 hover:bg-[#9d85c9] cursor-pointer"
                                  }
                `}
                              >
                                {connectStatus === "connecting" ? (
                                  <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 border-2 border-[#7c5db8] border-t-transparent rounded-full animate-spin"></div>
                                    <span>Connecting...</span>
                                  </div>
                                ) : (
                                  "Connect"
                                )}
                              </span>
                            )}
                            to start!
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
              {isVncConnected && (
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    fontSize: "12px",
                    margin: "2px",
                    padding: "6px",
                    alignItems: "center",
                  }}
                >
                  {os} - B
                  <Button
                    type="text"
                    size="small"
                    style={{
                      fontSize: "12px",
                      margin: 0,
                    }}
                    onClick={() =>
                      connectVNC(
                        VncIpR,
                        VncPortR,
                        iframeRefR_M.current,
                        user_id,
                        chat_id
                      )
                    }
                  >
                    <FontAwesomeIcon
                      icon={faArrowsRotate}
                      style={{ marginRight: "6pt" }}
                    />
                    Refresh
                  </Button>
                </div>
              )}
              {/* <Setup handleConnect={handleConnect} /> */}
              <Conversation position="right" />
            </div>
          )}
        </div>
        {/* Mobile view - 2 tabs */}
      </ProCard>
      <ProCard ghost ref={EvalRef} layout="center">
        <Eval
          handleSendEval={handleSendEval}
          RestartConversation={MyRestartConversation}
          PowerOff={MyPowerOff}
        />
      </ProCard>

      {!IsWaiting && (
        <>
          {/* TODO: fix me temporarily */}
          {/* {isFirstUser && (
            <div className="max-md:hidden w-full flex justify-center">
              <PromptTutorial />
            </div>
          )} */}


          <ProCard ghost ref={MessageRef}>
            <Message onSend={handleSendMessage} isSettingUp={isSettingUp} />
          </ProCard>
        </>
      )}
      {/* TODO: setup temporarily disabled */}
      {/* <div className="max-md:hidden w-full my-4 flex justify-center">
        <Setup handleConnect={handleConnect} />
      </div> */}
      <CommandPalette
        isOpen={isCommandPaletteOpen}
        setIsOpen={setIsCommandPaletteOpen}
        onSelectApp={(category: string | undefined, app_name: string | undefined, parameters: Record<string, any> | undefined) => {
          setSelectedCategory(category || "");
          setSelectedApp(app_name || "");
          setParameters(parameters || {});
          handleEnvironmentSelected(category || "", app_name || "", parameters || {});
        }}
      />
      <CommandPalette
        isOpen={isSecondCommandPaletteOpen}
        setIsOpen={setIsSecondCommandPaletteOpen}
        onSelectApp={handleSecondCommandPaletteSelectApp}
        inUse={true}
      />
      {/* TODO: temporarily disabled */}

      {/* <Tutorial></Tutorial>

      <Tour
        open={tour_open}
        onClose={() => setTourOpen(false)}
        steps={tutorial_steps}
      /> */}
      <FloatButton.Group>
        <FloatButton.BackTop />
        {/* <FloatButton
          icon={<FontAwesomeIcon icon={faQuestion} />}
          type="primary"
          onClick={() => setIsTutorialOpen(true)}
        /> */}
        {isVncConnected && (
          <FloatButton
            icon={<FontAwesomeIcon icon={faGear} />}
            type="primary"
            onClick={() => setIsSecondCommandPaletteOpen(true)}
          />
        )}
      </FloatButton.Group>
      {/* How it works section */}
      <div className="flex flex-col pt-4 px-0">
        <div
          onClick={() => setIsHowItWorksExpanded(!isHowItWorksExpanded)}
          className="flex flex-row gap-4 items-center w-full text-left hover:bg-gray-200 rounded-lg px-4 py-0"
        >
          <p className="text-lg font-bold">How it works?</p>
          <FontAwesomeIcon icon={faChevronDown}
            className={`transition-transform duration-200 ${isHowItWorksExpanded ? 'rotate-90' : ''
              }`}
          />
        </div>

        <div className={`overflow-hidden transition-all duration-200 w-full ${isHowItWorksExpanded ? 'max-h-[1000px] mt-0' : 'max-h-0'
          }`}>
          <p className="text-base text-gray-700 mb-4 px-4">
            {/* This pipeline demonstrates the workflow in Computer Agent Arena. Users start by choosing the operating system and setting up the initial desktop environment. After writing your task prompt and start the conversation, you can observe anonymized agent execution. Once finished, you can evaluate the agents' performance and mark your preference. After evaluation, you can check out the identity of both agents' model and framework. */}
            Check out the step-by-step guide below to learn about the pipeline.
          </p>
          <div className="flex justify-center items-center w-full">
            <img
              src={MainFigure}
              alt="Computer Agent Arena Pipeline Overview"
              className="w-[50%] h-auto min-w-[300px] min-h-[300px]"
            />
          </div>
        </div>
      </div>

      {/* FAQ section */}
      <div className="flex flex-col py-0 px-0">
        <div
          onClick={() => setIsFaqExpanded(!isFaqExpanded)}
          className="flex flex-row gap-4 items-center w-full text-left hover:bg-gray-200 rounded-lg px-4 py-0"
        >
          <p className="text-lg font-bold">FAQ</p>
          <FontAwesomeIcon icon={faChevronDown}
            className={`transition-transform duration-200 ${isFaqExpanded ? 'rotate-90' : ''
              }`}
          />
        </div>

        <div className={`overflow-hidden transition-all duration-200 w-full ${isFaqExpanded ? 'max-h-[2000px] mt-0' : 'max-h-0'
          }`}>
          
          {faqItems.map((item, index) => (
            <div key={index} className="mb-1 border-b border-gray-100 last:border-b-0 pb-0">
              <div 
                onClick={() => handleFaqItemToggle(index)}
                className="flex justify-between items-center cursor-pointer px-4 py-0 hover:bg-gray-50 rounded-lg"
              >
                <p className="text-base font-medium">{item.question}</p>
                <FontAwesomeIcon 
                  icon={faChevronDown} 
                  className={`transition-transform duration-200 ${expandedFaqItems[index] ? 'rotate-180' : ''}`}
                />
              </div>
              <div className={`overflow-hidden transition-all duration-200 px-4 ${expandedFaqItems[index] ? 'max-h-[500px] py-0' : 'max-h-0'}`}>
                <p className="text-base text-gray-700">{item.answer}</p>
              </div>
            </div>
          ))}

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
      {renderTestModeToggle()}
    </div>
  );
};



export default DoubleColumn;
