import React, { useEffect, useState, useRef, useMemo, useCallback } from "react";
import {
  Collapse,
  ConfigProvider,
  Flex,
  Tag,
  Tooltip,
  Typography,
  Button,
  Modal,
} from "antd";
import { ProCard } from "@ant-design/pro-components";
import { Image } from "antd";
import SyntaxHighlighter from "react-syntax-highlighter";
import { github } from "react-syntax-highlighter/dist/esm/styles/hljs";
import { useArena } from "../../context/ArenaContext";
import "../CSS/tacjectory.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCircleStop,
  faRobot,
  faThumbsDown,
  faThumbsUp,
  faXmark,
  faCheck,
  faCircle,
  faCircleExclamation,
} from "@fortawesome/free-solid-svg-icons";
import XlangLogo from "../../icons/logo_color.svg";
import { useAuth } from "../../context/AuthContext";
import { default as _ReactPlayer } from "react-player/lazy";
import { ReactPlayerProps } from "react-player/types/lib";
import { toPng } from "html-to-image";
import message from "antd/lib/message";
import { AgentMessageInput } from './message';
import { ConversationState, Feedback } from "../../context/ArenaContext";
import SearchAgentMessage from "./SearchAgentMessage";
import InteractiveMessage from "./InteractiveMessage";
import { Agent_Display } from "./eval";

// Simple Mac-like terminal component using only React + TailwindCSS
const MacTerminal: React.FC<{
  command: string;
  output?: string;
  className?: string;
}> = ({ command, output, className }) => {
  return (
    <div className={`w-full h-full rounded-lg overflow-hidden border border-neutral-300 dark:border-neutral-700 bg-neutral-900 ${className || ""}`}>
      {/* Title bar */}
      <div className="flex items-center gap-2 px-3 py-2 bg-neutral-800 border-b border-neutral-700">
        <span className="size-3 rounded-full bg-red-500"></span>
        <span className="size-3 rounded-full bg-yellow-400"></span>
        <span className="size-3 rounded-full bg-green-500"></span>
        <span className="ml-3 text-xs text-neutral-300 select-none truncate">~/workspace</span>
      </div>
      {/* Content */}
      <div className="flex flex-col w-full h-[calc(100%-32px)] text-neutral-100 font-mono text-xs">
        <div className="px-3 py-2">
          <span className="text-green-400">➜</span>
          <span className="ml-2">{command || ""}</span>
        </div>
        <div className="flex-1 min-h-0 bg-neutral-950 overflow-auto">
          {output && output !== "" ? (
            <pre className="whitespace-pre-wrap break-words px-3 py-2 text-neutral-200">{output}</pre>
          ) : (
            <div className="w-full h-full flex items-center justify-center text-neutral-400">No output</div>
          )}
        </div>
      </div>
    </div>
  );
};

interface NodeProps {
  title: string;
  description: string;
  code: string;
  time: string;
  image: string;
}

// Define a shared interface for trajectory data items
interface TrajectoryDataItem {
  title: string;
  image: string;
  visualization?: string;
  description: string;
  time: string | number;
  obs_time?: string | number;
  agent_time?: string | number;
  env_time?: string | number;
  token?: string | number;
  action?: unknown;
}

interface TrajectoryProps {
  TrajectoryData: TrajectoryDataItem[];
  isLast: boolean;
  position: string;
  isFullScreen?: boolean;
  feedbacks: Feedback[];
  setFeedbacks: (updatedFeedbacks: Feedback[]) => void;
}

interface RuntimeStatus {
  status: string;
  obs_time: number;
  predict_time: number;
  step_time: number;
  completed: boolean; // 标记是否所有时间都已记录
}

const Trajectory: React.FC<TrajectoryProps> = ({
  TrajectoryData,
  isLast,
  position,
  isFullScreen,
  feedbacks,
  setFeedbacks,
}) => {
  const {
    agent,
    vlm,
    currentStateL,
    currentStateR,
    isInConversation,
    isConversationEnded,
    isConversationStopped,
    isEvaluationEnded,
    StopConversation,
    responsive,
    currentStatusL,
    currentStatusR,
    statusHistoryL,
    statusHistoryR,
  } = useArena();
  const { socketService, user_id } = useAuth();
  const [activeStep, setActiveStep] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [imageHeight, setImageHeight] = useState(0);
  const imageContainerRef = useRef<HTMLDivElement>(null);

  // 根据 position 选择对应的状态
  const currentStatus = position === "left" ? currentStatusL : currentStatusR;
  const statusHistory = position === "left" ? statusHistoryL : statusHistoryR;

  useEffect(() => {
    if (feedbacks.length < TrajectoryData.length) {
      // 一次性创建所有需要的新反馈项
      const newFeedbacks = [...feedbacks];
      for (let i = feedbacks.length; i < TrajectoryData.length; i++) {
        newFeedbacks.push({ status: null, index: i });
      }
      // 只调用一次 setFeedbacks
      setFeedbacks(newFeedbacks);
    }
  }, [TrajectoryData.length]);
  useEffect(() => {
    const updateImageHeight = () => {
      if (imageContainerRef.current) {
        setImageHeight(imageContainerRef.current.offsetHeight);
      }
    };

    updateImageHeight();
    window.addEventListener("resize", updateImageHeight);

    return () => {
      window.removeEventListener("resize", updateImageHeight);
    };
  }, []);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (isHovered) {
        if (event.key === "ArrowUp" || event.key === "ArrowDown") {
          event.preventDefault(); // Prevent default scrolling behavior

          if (event.key === "ArrowUp") {
            setActiveStep((prev) => Math.max(0, prev - 1));
          } else if (event.key === "ArrowDown") {
            setActiveStep((prev) =>
              Math.min(TrajectoryData.length - 1, prev + 1)
            );
          }
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isHovered, TrajectoryData.length]);

  // 构示用的轨迹数据
  const displayTrajectoryData = useMemo(() => {
    // 检查是否需要显示加载状态
    const needsLoading =
      // 原有条件：轨迹为空或最后一项不是end
      (TrajectoryData?.length === 0 ||
        (TrajectoryData?.[TrajectoryData?.length - 1]?.title !== "end" &&
          TrajectoryData?.[TrajectoryData?.length - 1]?.title !== "End by user" &&
          TrajectoryData?.[TrajectoryData?.length - 1]?.title !== "Step Limit Exceeded")) &&
      // 新增条件：并且当前是最后一个（isLast为true）
      isLast;

    const needDeleteEnd =
      TrajectoryData?.[TrajectoryData?.length - 1]?.title === "end" ||
      TrajectoryData?.[TrajectoryData?.length - 1]?.title === "End by user" ||
      TrajectoryData?.[TrajectoryData?.length - 1]?.title === "Step Limit Exceeded";

    if (needsLoading) {
      return [
        ...TrajectoryData,
        {
          title: "Generating...",
          time: "",
          image: "", // 可以放一个loading的占位图片
          visualization: "",
          description: "Loading next step...",
          obs_time: "",
          agent_time: "",
          env_time: "",
          token: "",
        },
      ];
    } else if (needDeleteEnd) {
      // 过滤掉结束标记
      return TrajectoryData.filter(
        (item, index) =>
          !(
            index === TrajectoryData.length - 1 &&
            (item.title === "end" || item.title === "End by user" || item.title === "Step Limit Exceeded")
          )
      );
    } else {
      return TrajectoryData;
    }
  }, [TrajectoryData, isLast]);
  const renderLoadingState = () => {
    const showHistory =
      (isConversationEnded || isConversationStopped || isEvaluationEnded) &&
      statusHistory.length > 0;

    if (showHistory) {
      const currentStepStatus = statusHistory[activeStep] || {
        obs_time: 0,
        predict_time: 0,
        step_time: 0,
      };

      return (
        <div className="relative flex flex-row gap-x-0 w-full justify-center">
          {/* Observation Step */}
          <li className="flex items-center justify-center gap-x-2 shrink basis-0 flex-1 group">
            <div className="w-full h-px flex-1 bg-gray-400 group-first:hidden dark:bg-neutral-700"></div>
            <div className="min-w-7 min-h-7 inline-flex justify-center items-center text-xs align-middle">
              <span className="size-7 max-md:size-6 flex justify-center items-center shrink-0 rounded-full bg-green-100 dark:bg-green-900 border border-gray-200 dark:border-neutral-700">
                <svg
                  className="size-4 max-md:size-3 text-green-600 dark:text-green-400"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M4.5 12.75l6 6 9-13.5"
                  />
                </svg>
              </span>
              <div className="ms-2 flex flex-col">
                <span className="block text-[12px] max-md:text-[10px] font-medium text-gray-800 dark:text-white">
                  Observation
                </span>
                <span className="block text-[10px] max-md:text-[8px] text-gray-500 dark:text-gray-400">
                  {currentStepStatus.obs_time.toFixed(2)}s
                </span>
              </div>
            </div>
            <div className="w-full h-px flex-1 bg-gray-400 group-last:hidden dark:bg-neutral-700 max-md:hidden"></div>
          </li>

          {/* Predict Step */}
          <li className="flex items-center gap-x-2 shrink basis-0 flex-1 group max-md:justify-start">
            <div className="w-full h-px flex-1 bg-gray-400 group-first:hidden dark:bg-neutral-700 max-md:hidden"></div>
            <div className="min-w-7 min-h-7 inline-flex justify-center items-center text-xs align-middle">
              <span className="size-7 max-md:size-6 flex justify-center items-center shrink-0 rounded-full bg-green-100 dark:bg-green-900 border border-gray-200 dark:border-neutral-700">
                <svg
                  className="size-4 max-md:size-3 text-green-600 dark:text-green-400"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M4.5 12.75l6 6 9-13.5"
                  />
                </svg>
              </span>
              <div className="ms-2 flex flex-col">
                <span className="block text-[12px] max-md:text-[10px] font-medium text-gray-800 dark:text-white">
                  Predict
                </span>
                <span className="block text-[10px] max-md:text-[8px] text-gray-500 dark:text-gray-400">
                  {currentStepStatus.predict_time.toFixed(2)}s
                </span>
              </div>
            </div>
            <div className="w-full h-px flex-1 bg-gray-400 group-last:hidden dark:bg-neutral-700 max-md:hidden"></div>
          </li>

          {/* Execute Step */}
          <li className="flex items-center gap-x-2 shrink basis-0 flex-1 group max-md:justify-start">
            <div className="w-full h-px flex-1 bg-gray-400 group-first:hidden dark:bg-neutral-700 max-md:hidden"></div>
            <div className="min-w-7 min-h-7 inline-flex justify-center items-center text-xs align-middle">
              <span className="size-7 max-md:size-6 flex justify-center items-center shrink-0 rounded-full bg-green-100 dark:bg-green-900 border border-gray-200 dark:border-neutral-700">
                <svg
                  className="size-4 max-md:size-3 text-green-600 dark:text-green-400"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M4.5 12.75l6 6 9-13.5"
                  />
                </svg>
              </span>
              <div className="ms-2 flex flex-col">
                <span className="block text-[12px] max-md:text-[10px] font-medium text-gray-800 dark:text-white">
                  Execute
                </span>
                <span className="block text-[10px] max-md:text-[8px] text-gray-500 dark:text-gray-400">
                  {currentStepStatus.step_time.toFixed(2)}s
                </span>
              </div>
            </div>
            <div className="w-full h-px flex-1 bg-gray-400 group-last:hidden dark:bg-neutral-700 max-md:hidden"></div>
          </li>
        </div>
      );
    }

    // 会话进行时显示实时状态
    return (
      <div className="relative flex flex-row gap-x-0 w-full justify-center max-md:flex-col max-md:gap-y-2">
        {/* Observation Step */}
        <li className="flex items-center gap-x-2 shrink basis-0 flex-1 group max-md:justify-start">
          <div className="w-full h-px flex-1 bg-gray-400 group-first:hidden dark:bg-neutral-700 max-md:hidden"></div>
          <div className="min-w-7 min-h-7 inline-flex justify-center items-center text-xs align-middle">
            <span
              className={`size-7 max-md:size-6 flex justify-center items-center shrink-0 rounded-full
                ${currentStatus.status === "observation_start"
                  ? "bg-blue-100 dark:bg-blue-900"
                  : currentStatus.status === "observation_end" ||
                    currentStatus.status === "predict_start" ||
                    currentStatus.status === "predict_end" ||
                    currentStatus.status === "step_start" ||
                    currentStatus.status === "step_end"
                    ? "bg-green-100 dark:bg-green-900"
                    : "bg-white dark:bg-neutral-900"
                } 
                border border-gray-200 dark:border-neutral-700`}
            >
              {currentStatus.status === "observation_start" ? (
                <div className="relative">
                  <svg
                    className="size-4 text-blue-600 dark:text-blue-400"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={2}
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                </div>
              ) : currentStatus.status === "observation_end" ||
                currentStatus.status === "predict_start" ||
                currentStatus.status === "predict_end" ||
                currentStatus.status === "step_start" ||
                currentStatus.status === "step_end" ? (
                <svg
                  className="size-4 text-green-600 dark:text-green-400"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M4.5 12.75l6 6 9-13.5"
                  />
                </svg>
              ) : (
                <svg
                  className="size-4 text-gray-600 dark:text-gray-400"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
              )}
            </span>
            <div className="ms-2 flex flex-col">
              <span className="block text-sm max-md:text-xs font-medium text-gray-800 dark:text-white">
                Observation
              </span>
              {currentStatus.obs_time > 0 && (
                <span className="block text-xs max-md:text-[10px] text-gray-500 dark:text-gray-400">
                  {currentStatus.obs_time.toFixed(2)}s
                </span>
              )}
            </div>
          </div>
          <div className="w-full h-px flex-1 bg-gray-400 group-last:hidden dark:bg-neutral-700 max-md:hidden"></div>
        </li>

        {/* Predict Step */}
        <li className="flex items-center gap-x-2 shrink basis-0 flex-1 group max-md:justify-start">
          <div className="w-full h-px flex-1 bg-gray-400 group-first:hidden dark:bg-neutral-700 max-md:hidden"></div>
          <div className="min-w-7 min-h-7 inline-flex justify-center items-center text-xs align-middle">
            <span
              className={`size-7 max-md:size-6 flex justify-center items-center shrink-0 rounded-full
                ${currentStatus.status === "predict_start"
                  ? "bg-blue-100 dark:bg-blue-900"
                  : currentStatus.status === "predict_end" ||
                    currentStatus.status === "step_start" ||
                    currentStatus.status === "step_end"
                    ? "bg-green-100 dark:bg-green-900"
                    : "bg-white dark:bg-neutral-900"
                }
                border border-gray-200 dark:border-neutral-700`}
            >
              {currentStatus.status === "predict_start" ? (
                <div className="relative">
                  <svg
                    className="size-4 text-blue-600 dark:text-blue-400"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={2}
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 18v-5.25m0 0a6.01 6.01 0 001.5-.189m-1.5.189a6.01 6.01 0 01-1.5-.189m3.75 7.478a12.06 12.06 0 01-4.5 0m3.75 2.383a14.406 14.406 0 01-3 0M14.25 18v-.192c0-.983.658-1.823 1.508-2.316a7.5 7.5 0 10-7.517 0c.85.493 1.509 1.333 1.509 2.316V18"
                    />
                  </svg>
                </div>
              ) : currentStatus.status === "predict_end" ||
                currentStatus.status === "step_start" ||
                currentStatus.status === "step_end" ? (
                <svg
                  className="size-4 text-green-600 dark:text-green-400"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M4.5 12.75l6 6 9-13.5"
                  />
                </svg>
              ) : (
                <svg
                  className="size-4 text-gray-600 dark:text-gray-400"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 18v-5.25m0 0a6.01 6.01 0 001.5-.189m-1.5.189a6.01 6.01 0 01-1.5-.189m3.75 7.478a12.06 12.06 0 01-4.5 0m3.75 2.383a14.406 14.406 0 01-3 0M14.25 18v-.192c0-.983.658-1.823 1.508-2.316a7.5 7.5 0 10-7.517 0c.85.493 1.509 1.333 1.509 2.316V18"
                  />
                </svg>
              )}
            </span>
            <div className="ms-2 flex flex-col">
              <span className="block text-sm max-md:text-xs font-medium text-gray-800 dark:text-white">
                Predict
              </span>
              {currentStatus.predict_time > 0 && (
                <span className="block text-xs max-md:text-[10px] text-gray-500 dark:text-gray-400">
                  {currentStatus.predict_time.toFixed(2)}s
                </span>
              )}
            </div>
          </div>
          <div className="w-full h-px flex-1 bg-gray-400 group-last:hidden dark:bg-neutral-700 max-md:hidden"></div>
        </li>

        {/* Step Execution */}
        <li className="flex items-center gap-x-2 shrink basis-0 flex-1 group max-md:justify-start">
          <div className="w-full h-px flex-1 bg-gray-400 group-first:hidden dark:bg-neutral-700 max-md:hidden"></div>
          <div className="min-w-7 min-h-7 inline-flex justify-center items-center text-xs align-middle">
            <span
              className={`size-7 max-md:size-6 flex justify-center items-center shrink-0 rounded-full
                ${currentStatus.status === "step_start"
                  ? "bg-blue-100 dark:bg-blue-900"
                  : currentStatus.status === "step_end"
                    ? "bg-green-100 dark:bg-green-900"
                    : "bg-white dark:bg-neutral-900"
                }
                border border-gray-200 dark:border-neutral-700`}
            >
              {currentStatus.status === "step_start" ? (
                <div className="relative">
                  <svg
                    className="size-4 text-blue-600 dark:text-blue-400"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={2}
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M15.042 21.672L13.684 16.6m0 0l-2.51 2.225.569-9.47 5.227 7.917-3.286-.672zM12 2.25V4.5m5.834.166l-1.591 1.591M20.25 10.5H18M7.757 14.743l-1.59 1.59M6 10.5H3.75m4.007-4.243l-1.59-1.59"
                    />
                  </svg>
                </div>
              ) : currentStatus.status === "step_end" ? (
                <svg
                  className="size-4 text-green-600 dark:text-green-400"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M4.5 12.75l6 6 9-13.5"
                  />
                </svg>
              ) : (
                <svg
                  className="size-4 text-gray-600 dark:text-gray-400"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15.042 21.672L13.684 16.6m0 0l-2.51 2.225.569-9.47 5.227 7.917-3.286-.672zM12 2.25V4.5m5.834.166l-1.591 1.591M20.25 10.5H18M7.757 14.743l-1.59 1.59M6 10.5H3.75m4.007-4.243l-1.59-1.59"
                  />
                </svg>
              )}
            </span>
            <div className="ms-2 flex flex-col">
              <span className="block text-sm max-md:text-xs font-medium text-gray-800 dark:text-white">
                Execute
              </span>
              {currentStatus.step_time > 0 && (
                <span className="block text-xs max-md:text-[10px] text-gray-500 dark:text-gray-400">
                  {currentStatus.step_time.toFixed(2)}s
                </span>
              )}
            </div>
          </div>
          <div className="w-full h-px flex-1 bg-gray-400 group-last:hidden dark:bg-neutral-700 max-md:hidden"></div>
        </li>
      </div>
    );
  };
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
  const [feedbackComment, setFeedbackComment] = useState<string>("");
  const updateFeedback = (index: number, feedback: Feedback) => {
    // 确保feedbacks是一个数组
    if (!Array.isArray(feedbacks)) {
      console.error("Feedbacks is not an array:", feedbacks);
      return;
    }
    
    // 为数组扩容，确保能放入指定索引位置的元素
    let newFeedbacks = [...feedbacks];
    while (newFeedbacks.length <= index) {
      newFeedbacks.push({
        status: null,
        index: newFeedbacks.length
      });
    }
    
    newFeedbacks[index] = feedback;
    setFeedbacks(newFeedbacks);
  };
  const renderFeedback = () => {
    const feedbackOptions = [
      { id: "grounding_error", label: "Click on wrong place" },
      { id: "planning_error", label: "Planning error" },
      { id: "irrelevant", label: "Irrelevant action" },
      { id: "misaligned", label: "Don't follow instructions" },
      { id: "hallucination", label: "Hallucination" },
      { id: "harmful", label: "Dangerous action" },
      { id: "other", label: "Other" },
    ];

    // Update feedback when options change
    const toggleOption = (optionId: string) => {
      const currentFeedback = feedbacks[activeStep] || {};
      const newOptions = currentFeedback.options?.includes(optionId)
        ? currentFeedback.options.filter((id) => id !== optionId)
        : [...(currentFeedback.options || []), optionId];

      // Update the feedback for current step
      const updatedFeedback: Feedback = {
        ...currentFeedback,
        options: newOptions,
      };
      updateFeedback(activeStep, updatedFeedback);
    };

    // Update feedback when comment changes
    const handleCommentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const newComment = e.target.value;

      // Update the feedback for current step
      const updatedFeedback: Feedback = {
        ...feedbacks[activeStep],
        comment: newComment,
      };
      updateFeedback(activeStep, updatedFeedback);
    };

    return (
      <div className="flex flex-col gap-1 w-full px-4">
        <span className="text-sm font-medium text-black dark:text-white mb-2">
          Step {activeStep + 1} Failure reasons & Feedback (optional)
        </span>
        <div className="flex flex-wrap gap-1.5 px-1">
          {feedbackOptions.map((option) => {
            const isSelected = feedbacks[activeStep]?.options?.includes(option.id);
            return (
              <span
                key={option.id}
                onClick={() => toggleOption(option.id)}
                className={`
                py-1 px-2
                rounded-md text-[12px]
                ${isSelected
                    ? "bg-red-200 dark:bg-red-800"
                    : "bg-red-50 dark:bg-red-950"
                  }
                text-red-700 dark:text-red-300
                cursor-pointer
                border-none
              `}
              >
                {option.label}
              </span>
            );
          })}
        </div>
        <div className="mt-2">
          <textarea
            className="w-full px-2 py-1 text-xs border border-neutral-300 text-neutral-600 rounded-md dark:bg-neutral-800 dark:border-neutral-700 dark:text-neutral-200"
            placeholder="Additional feedback (optional)"
            value={feedbacks[activeStep]?.comment || ""}
            onChange={handleCommentChange}
            onClick={(e) => e.stopPropagation()} // Prevent timeline item click
            rows={2}
          />
        </div>
      </div>
    );
  };

  const formatActionForDisplay = (action: unknown): string => {
    if (action === undefined || action === null) return "";
    if (typeof action === "string") return action;
    try {
      return JSON.stringify(action);
    } catch (e) {
      return String(action);
    }
  };

  return isInConversation ||
    isConversationEnded ||
    isConversationStopped ||
    isEvaluationEnded ||
    true ? (
    <div
      className="h-full max-h-full w-full max-w-full overflow-x-hidden flex flex-col"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Desktop View */}
      <div className="hidden md:grid grid-cols-10 gap-1">
        <div
          ref={imageContainerRef}
          className="flex flex-col items-center justify-center col-span-8 w-full aspect-video px-2"
        >
          {displayTrajectoryData[activeStep]?.title === "Generating..." ? (
            <div className="w-full h-full bg-gray-200 dark:bg-neutral-800 rounded-lg flex flex-col items-center justify-center gap-4 px-8">
              {renderLoadingState()}
            </div>
          ) : displayTrajectoryData[activeStep]?.title === "Code Execution" ? (
            <MacTerminal
              command={formatActionForDisplay((displayTrajectoryData as any)[activeStep]?.action)}
              output={displayTrajectoryData[activeStep]?.image as unknown as string}
              className="mt-2 mb-1"
            />
          ) : displayTrajectoryData[activeStep]?.visualization &&
            displayTrajectoryData[activeStep]?.visualization !== "" ? (
            <video
              className="object-contain mt-2 mb-1 w-full h-full max-w-full max-h-full"
              src={displayTrajectoryData[activeStep]?.visualization}
              autoPlay
              loop
              muted
              playsInline
            />
          ) : displayTrajectoryData[activeStep]?.image &&
            displayTrajectoryData[activeStep]?.image !== "" ? (
            <img
              className="object-contain mt-2 mb-1 w-full h-full max-w-full max-h-full"
              src={`data:image/png;base64,${displayTrajectoryData[activeStep]?.image}`}
              alt="Step Image"
            />
          ) : (
            <div className="w-full h-full bg-gray-200 dark:bg-neutral-800 rounded-lg flex flex-col items-center justify-center gap-4">
              <p className="text-gray-600 dark:text-gray-300">
                No observation available
              </p>
            </div>
          )}
          {activeStep <= TrajectoryData.length - 1 && (
            <>
              {/* <div className="flex-shrink-0 h-[5%] flex w-full justify-between px-4 pt-0 mb-2 border-b border-gray-200 dark:border-neutral-700">
                <p
                  className={`${isFullScreen ? "text-sm" : "text-[10px]"
                    } text-gray-600 dark:text-neutral-400`}
                >
                  Time:{" "}
                  {Number(TrajectoryData[activeStep]?.time)?.toFixed(2) + "s"}
                </p>
                <p
                  className={`${isFullScreen ? "text-sm" : "text-[10px]"
                    } text-gray-600 dark:text-neutral-400`}
                >
                  Token:{" "}
                  {Number(TrajectoryData[activeStep]?.token)?.toFixed(0) +
                    " tokens"}
                </p>
              </div> */}
              {/* TODO: fix me temporarily */}
              {/* <div className="flex-shrink-0 flex w-full items-center px-4 pt-4 mb-4">
                {renderLoadingState()}
              </div> */}
            </>
          )}
        </div>
        <div className="flex flex-col col-span-2 h-full">
          <div className="flex flex-col h-full">
            <div className="flex justify-between items-center p-1 border-b dark:border-neutral-700">
              <div className="text-md font-bold text-black my-1 p-0 text-warp dark:text-white">
                Step {activeStep + 1} / {displayTrajectoryData.length}{" "}
                {activeStep + 1 === displayTrajectoryData.length &&
                  displayTrajectoryData[displayTrajectoryData.length - 1]
                    ?.title !== "Generating..."
                  ? " ✅"
                  : ""}
              </div>
            </div>
            <Timeline
              TrajectoryData={displayTrajectoryData}
              activeStep={activeStep}
              setActiveStep={setActiveStep}
              maxHeight={imageHeight}
              isFullScreen={isFullScreen}
              feedbacks={feedbacks}
              setFeedbacks={setFeedbacks}
            />
          </div>
        </div>
        {feedbacks[activeStep]?.status !== null &&
          feedbacks[activeStep]?.status === false && (
            <div className="flex flex-col col-span-10 items-center mx-2 mb-3 px-2 py-1 bg-neutral-50 dark:bg-neutral-950 rounded-lg">
              {renderFeedback()}
            </div>
          )}
      </div>

      {/* Mobile View */}
      <div className="md:hidden flex flex-col h-full w-full overflow-y-auto">
        <div className="flex-shrink-0 h-[5%] flex w-full justify-between px-4 pt-0 mb-2 border-b border-gray-200 dark:border-neutral-700">
          <p className="text-[10px] text-gray-600 dark:text-neutral-400">
            Step {activeStep + 1} / {displayTrajectoryData.length}
            {activeStep + 1 === displayTrajectoryData.length &&
              displayTrajectoryData[displayTrajectoryData.length - 1]?.title !==
              "Generating..."
              ? " ✅"
              : ""}
          </p>
          <p className="text-[10px] text-gray-600 dark:text-neutral-400">
            Time: {Number(TrajectoryData[activeStep]?.time)?.toFixed(2)}s
          </p>
        </div>

        {/* Mobile List View */}
        <div className="flex-grow overflow-y-auto px-2">
          <div className="flex flex-col gap-3">
            {displayTrajectoryData.map((item, index) => (
              <div
                key={index}
                className={`flex flex-col gap-2 p-3 rounded-lg border transition-colors ${index === activeStep
                  ? "border-blue-500 dark:border-blue-400 bg-blue-50/50 dark:bg-blue-950/50"
                  : feedbacks[index]?.status === false
                    ? "border-red-500 dark:border-red-400 bg-red-50/50 dark:bg-red-950/50"
                    : "border-gray-200 dark:border-neutral-700"
                  } ${item.title === "Generating..."
                    ? "animate-pulse bg-gray-50 dark:bg-neutral-800"
                    : ""
                  }`}
                onClick={() => setActiveStep(index)}
              >
                {/* Step Header */}
                <div className="flex justify-between items-center">
                  <span className="flex flex-col gap-2 text-xs font-medium text-gray-700 dark:text-neutral-300">
                    Step {index + 1}
                    {item.title !== "Generating..." &&
                      item.title !== "end" &&
                      item.title !== "End by user" &&
                      item.title !== "Step Limit Exceeded" && (
                        <div className="flex items-center gap-2 mt-1">
                          <span
                            onClick={(e) => {
                              e.stopPropagation();
                              const newFeedback = {
                                ...feedbacks[index],
                                status: feedbacks[index]?.status === true ? null : true,
                                index,
                              };
                              const updatedFeedbacks = [...feedbacks];
                              updatedFeedbacks[index] = newFeedback;
                              setFeedbacks(updatedFeedbacks);
                            }}
                            className={`p-1 rounded-md transition-colors ${feedbacks[index]?.status === true
                              ? "text-green-600 bg-green-100 dark:bg-green-800"
                              : "text-gray-400 hover:text-gray-600"
                              }`}
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              viewBox="0 0 24 24"
                              fill="currentColor"
                              className="w-5 h-5"
                            >
                              <path d="M7.493 18.5c-.425 0-.82-.236-.975-.632A7.48 7.48 0 0 1 6 15.125c0-1.75.599-3.358 1.602-4.634.151-.192.373-.309.6-.397.473-.183.89-.514 1.212-.924a9.042 9.042 0 0 1 2.861-2.4c.723-.384 1.35-.956 1.653-1.715a4.498 4.498 0 0 0 .322-1.672V2.75A.75.75 0 0 1 15 2a2.25 2.25 0 0 1 2.25 2.25c0 1.152-.26 2.243-.723 3.218-.266.558.107 1.282.725 1.282h3.126c1.026 0 1.945.694 2.054 1.715.045.422.068.85.068 1.285a11.95 11.95 0 0 1-2.649 7.521c-.388.482-.987.729-1.605.729H14.23c-.483 0-.964-.078-1.423-.23l-3.114-1.04a4.501 4.501 0 0 0-1.423-.23h-.777Z" />
                            </svg>
                          </span>
                          <span
                            onClick={(e) => {
                              e.stopPropagation();
                              const newFeedback = {
                                ...feedbacks[index],
                                status: feedbacks[index]?.status === false ? null : false,
                                index,
                              };
                              const updatedFeedbacks = [...feedbacks];
                              updatedFeedbacks[index] = newFeedback;
                              setFeedbacks(updatedFeedbacks);
                            }}
                            className={`p-1 rounded-md transition-colors ${feedbacks[index]?.status === false
                              ? "text-red-600 bg-red-100 dark:bg-red-800"
                              : "text-gray-400 hover:text-gray-600"
                              }`}
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              viewBox="0 0 24 24"
                              fill="currentColor"
                              className="w-5 h-5"
                            >
                              <path d="M15.73 5.5h1.035A7.465 7.465 0 0 1 18 9.625a7.465 7.465 0 0 1-1.235 4.125h-.148c-.806 0-1.534.446-2.031 1.08a9.04 9.04 0 0 1-2.861 2.4c-.723.384-1.35.956-1.653 1.715a4.499 4.499 0 0 0-.322 1.672v.633A.75.75 0 0 1 9 22a2.25 2.25 0 0 1-2.25-2.25c0-1.152.26-2.243.723-3.218.266-.558-.107-1.282-.725-1.282H3.622c-1.026 0-1.945-.694-2.054-1.715A12.137 12.137 0 0 1 1.5 12.25c0-2.848.992-5.464 2.649-7.521C4.537 4.247 5.136 4 5.754 4H9.77a4.5 4.5 0 0 1 1.423.23l3.114 1.04a4.5 4.5 0 0 0 1.423.23Z" />
                            </svg>
                          </span>
                        </div>
                      )}
                  </span>
                  <div className="flex gap-2 text-[10px] text-gray-500 dark:text-neutral-400">
                    <span>{Number(item.time).toFixed(2)}s</span>
                    <span>{Number(item.token).toFixed(0)} tokens</span>
                  </div>
                </div>

                {/* Title/Description */}
                <div className="text-xs text-gray-800 font-medium dark:text-neutral-200">
                  {item.title}
                </div>

                {/* Image/Video */}
                {(item.visualization || item.image) && (
                  <div className="w-full aspect-video bg-gray-100 dark:bg-neutral-800 rounded-lg overflow-hidden">
                    {item.visualization ? (
                      <video
                        className="w-full h-full object-contain"
                        src={item.visualization}
                        autoPlay={index === activeStep}
                        loop
                        muted
                        playsInline
                      />
                    ) : item.image ? (
                      <img
                        className="w-full h-full object-contain"
                        src={`data:image/png;base64,${item.image}`}
                        alt={`Step ${index + 1}`}
                      />
                    ) : null}
                  </div>
                )}

                {/* Runtime Status */}
                {/* <div className="flex justify-between items-center text-[10px] text-gray-500 dark:text-neutral-500 pt-1 border-t border-gray-100 dark:border-neutral-800">
                  {item.obs_time && <span>Obs: {Number(item.obs_time).toFixed(2)}s</span>}
                  {item.agent_time && <span>Think: {Number(item.agent_time).toFixed(2)}s</span>}
                  {item.env_time && <span>Act: {Number(item.env_time).toFixed(2)}s</span>}
                  {item.token && <span>Token: {item.token}</span>}
                </div> */}

                {/* Add Feedback Options when thumbs down is selected */}
                {feedbacks[index]?.status === false && (
                  <div className="mt-2 p-2 bg-red-50 dark:bg-red-950 rounded-md">
                    <div className="flex flex-wrap gap-1.5">
                      {[
                        { id: "grounding_error", label: "Click on wrong place" },
                        { id: "planning_error", label: "Planning error" },
                        { id: "irrelevant", label: "Irrelevant action" },
                        { id: "misaligned", label: "Don't follow instructions" },
                        { id: "hallucination", label: "Hallucination" },
                        { id: "harmful", label: "Dangerous action" },
                        { id: "other", label: "Other" },
                      ].map((option) => (
                        <span
                          key={option.id}
                          onClick={(e) => {
                            e.stopPropagation();
                            const currentOptions = feedbacks[index]?.options || [];
                            const newOptions = currentOptions.includes(option.id)
                              ? currentOptions.filter((id) => id !== option.id)
                              : [...currentOptions, option.id];

                            const updatedFeedbacks = [...feedbacks];
                            updatedFeedbacks[index] = {
                              ...feedbacks[index],
                              options: newOptions,
                            };
                            setFeedbacks(updatedFeedbacks);
                          }}
                          className={`
                            py-1 px-2
                            rounded-md text-[10px]
                            ${feedbacks[index]?.options?.includes(option.id)
                              ? "bg-red-200 dark:bg-red-800"
                              : "bg-red-50 dark:bg-red-950"
                            }
                            text-red-700 dark:text-red-300
                            cursor-pointer
                            border-none
                          `}
                        >
                          {option.label}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
        {/* Loading Status */}
        {activeStep <= TrajectoryData.length - 1 && (
          <div className="flex-shrink-0 mt-2 px-2">{renderLoadingState()}</div>
        )}
      </div>
    </div>
  ) : null;
};

const UserMessage: React.FC<{
  alias: string;
  avatar_url: string | null;
  content: string;
}> = ({ alias, avatar_url, content }) => (
  <li className="flex ms-auto gap-x-1 sm:gap-x-4 max-md:gap-x-1">
    <div className="grow text-end space-y-1">
      <div className="inline-block bg-orange-100 rounded-2xl px-4 max-md:px-2 py-0 shadow-sm max-w-[75%]">
        <p className="text-sm max-md:text-xs text-gray-800">{content}</p>
      </div>
    </div>
    <span className="shrink-0 inline-flex items-center justify-center size-[24px] max-md:size-[20px] rounded-full bg-gray-600">
      {avatar_url ? (
        <img
          className="size-[24px] max-md:size-[20px] rounded-full"
          src={avatar_url}
          alt="avatar"
          crossOrigin="anonymous"
        />
      ) : (
        <span className="text-sm max-md:text-xs font-medium text-white leading-none">
          {alias.charAt(0).toUpperCase()}
        </span>
      )}
    </span>
  </li>
);

const FullScreenModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  content: React.ReactNode;
  position: string;
}> = ({ isOpen, onClose, content, position }) => {
  const { StopConversation, isInConversation } = useArena();

  useEffect(() => {
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscKey);
      // Disable scrolling on the body when modal is open
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleEscKey);
      // Re-enable scrolling on the body when modal is closed
      document.body.style.overflow = "auto";
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleModalClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent click from propagating to parent elements
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-[90%] h-[85%] mt-[5%] max-md:w-[95%] max-md:h-[90%] max-md:mt-[2%] bg-white dark:bg-neutral-900 rounded-lg p-4 max-md:p-2 overflow-hidden flex flex-col"
        onClick={handleModalClick}
      >
        {/* Header */}
        <div className="flex-shrink-0 h-[5%] flex justify-between items-center px-4 max-md:px-2 pt-1 border-b border-gray-200 dark:border-neutral-700">
          <span className="text-sm font-medium text-gray-700 dark:text-neutral-400">
            Agent {position === "left" ? "A" : "B"}
          </span>
          <div className="flex gap-2 max-md:gap-1">
            {isInConversation && (
              <span
                className="inline-flex justify-center items-center h-full gap-2 max-md:gap-1 border-solid border border-gray-400 dark:border-neutral-700 px-2 py-1 max-md:px-1 max-md:py-0.5 my-1 rounded-lg cursor-pointer text-gray-700 dark:text-neutral-400 text-sm max-md:text-xs"
                onClick={StopConversation}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="shrink-0 size-4 max-md:size-3"
                >
                  <path
                    fillRule="evenodd"
                    d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12Zm6-2.438c0-.724.588-1.312 1.313-1.312h4.874c.725 0 1.313.588 1.313 1.313v4.874c0 .725-.588 1.313-1.313 1.313H9.564a1.312 1.312 0 0 1-1.313-1.313V9.564Z"
                    clipRule="evenodd"
                  />
                </svg>{" "}
                <span className="max-md:hidden">Stop Conversation</span>
                <span className="hidden max-md:inline">Stop</span>
              </span>
            )}
            <span
              className="inline-flex justify-center items-center h-full rounded-lg gap-2 max-md:gap-1 text-gray-700 dark:text-neutral-400 px-2 py-1 max-md:px-1 max-md:py-0.5 border-solid border border-gray-400 dark:border-neutral-700 cursor-pointer text-sm max-md:text-xs"
              onClick={onClose}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="shrink-0 size-4 max-md:size-3 cursor-pointer"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75h-4.5m4.5 0v4.5m0-4.5L15 9m5.25 11.25h-4.5m4.5 0v-4.5m0 4.5L15 15"
                />
              </svg>
              <span className="max-md:hidden">Close</span>
            </span>
          </div>
        </div>

        {/* Content - Desktop vs Mobile layout */}
        <div className="flex-grow overflow-y-auto">
          <div className="hidden max-md:block">
            <MobileFullScreenContent content={content} />
          </div>
          <div className="block max-md:hidden">{content}</div>
        </div>
      </div>
    </div>
  );
};

// 新增的移动端内容组件
const MobileFullScreenContent: React.FC<{
  content: React.ReactNode;
}> = ({ content }) => {
  // 假设content是Trajectory组件，我们需要访问其props
  const trajectoryProps = (content as React.ReactElement)?.props;
  const { TrajectoryData, activeStep } = trajectoryProps;

  return (
    <div className="flex flex-col gap-4 p-2">
      {TrajectoryData.map((item: any, index: number) => (
        <div
          key={index}
          className={`flex flex-col gap-2 p-4 max-md:p-2 rounded-lg border ${index === activeStep
            ? "border-blue-500 dark:border-blue-400"
            : "border-gray-200 dark:border-neutral-700"
            }`}
        >
          {/* Step Header */}
          <div className="flex justify-between items-center">
            <span className="text-sm max-md:text-xs font-medium text-gray-700 dark:text-neutral-300">
              Step {index + 1}
            </span>
            <span className="text-xs max-md:text-[10px] text-gray-500 dark:text-neutral-400">
              {Number(item.time).toFixed(2)}s
            </span>
          </div>

          {/* Step Image/Video */}
          <div className="w-full aspect-video bg-gray-100 dark:bg-neutral-800 rounded-lg overflow-hidden">
            {item.visualization ? (
              <video
                className="w-full h-full object-contain"
                src={item.visualization}
                autoPlay
                loop
                muted
                playsInline
              />
            ) : item.image ? (
              <img
                className="w-full h-full object-contain"
                src={`data:image/png;base64,${item.image}`}
                alt={`Step ${index + 1}`}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <span className="text-sm max-md:text-xs text-gray-500 dark:text-neutral-400">
                  No image available
                </span>
              </div>
            )}
          </div>

          {/* Step Description */}
          <div className="text-sm max-md:text-xs text-gray-600 dark:text-neutral-400">
            {item.description}
          </div>

          {/* Runtime Status */}
          <div className="flex justify-between items-center flex-wrap text-xs max-md:text-[10px] text-gray-500 dark:text-neutral-500 pt-2 border-t border-gray-100 dark:border-neutral-800">
            {item.obs_time && <span className="mb-1">Observation: {Number(item.obs_time).toFixed(2)}s</span>}
            {item.agent_time && <span className="mb-1">Predict: {Number(item.agent_time).toFixed(2)}s</span>}
            {item.env_time && <span className="mb-1">Execute: {Number(item.env_time).toFixed(2)}s</span>}
            {item.token && <span className="mb-1">Token: {item.token}</span>}
          </div>
        </div>
      ))}
    </div>
  );
};

const AgentMessage: React.FC<{
  content: React.ReactNode;
  position: string;
  fullScreenContent?: React.ReactNode; // 新增属性，用于全屏时显示不同内容
}> = ({ content, position, fullScreenContent }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);
  const { StopConversation, isInConversation } = useArena();
  // 根据position确定显示的字母
  const agentLetter =
    position === "left" ? "A" : position === "right" ? "B" : "A";

  return (
    <li className="h-full max-h-full w-full max-w-full flex space-x-2">
      <span className="shrink-0 inline-flex items-center justify-center size-[24px] max-md:size-[20px] rounded-full bg-gray-600">
        <span className="text-sm max-md:text-xs font-medium text-white leading-none">
          {agentLetter}
        </span>
      </span>
      <div className="flex flex-col h-full w-full bg-white border border-gray-200 rounded-lg dark:bg-neutral-900 dark:border-neutral-700">
        <div className="flex flex-row items-center w-full justify-between">
          <span className="text-gray-700 font-medium flex items-center px-4 max-md:px-2 text-sm max-md:text-xs">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 max-md:h-3 max-md:w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            Computer-Use Agent
          </span>
          <div className="flex-shrink-0 h-[7.5%] flex justify-end px-4 max-md:px-2 py-1 gap-1 border-b border-gray-200 dark:border-neutral-700">
          {isInConversation && (
            <span
              className="inline-flex justify-center items-center h-full rounded-lg gap-2 max-md:gap-1 text-gray-700 dark:text-neutral-400 px-2 py-1 max-md:px-1 max-md:py-0.5 border-solid border border-gray-400 dark:border-neutral-700 cursor-pointer text-sm max-md:text-xs"
              onClick={StopConversation}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="shrink-0 size-4 max-md:size-3"
              >
                <path
                  fillRule="evenodd"
                  d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12Zm6-2.438c0-.724.588-1.312 1.313-1.312h4.874c.725 0 1.313.588 1.313 1.313v4.874c0 .725-.588 1.313-1.313 1.313H9.564a1.312 1.312 0 0 1-1.313-1.313V9.564Z"
                  clipRule="evenodd"
                />
              </svg>{" "}
              <span className="max-md:hidden">Stop Conversation</span>
              <span className="hidden max-md:inline">Stop</span>
            </span>
          )}
            <span
              className="inline-flex justify-center items-center h-full rounded-lg gap-2 max-md:gap-1 text-gray-700 dark:text-neutral-400 px-2 py-1 max-md:px-1 max-md:py-0.5 border-solid border border-gray-400 dark:border-neutral-700 cursor-pointer text-sm max-md:text-xs"
              onClick={openModal}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="shrink-0 size-4 max-md:size-3"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75h-4.5m4.5 0v4.5m0-4.5L15 9m5.25 11.25h-4.5m4.5 0v-4.5m0 4.5L15 15"
                />
              </svg>{" "}
              <span className="max-md:hidden">Full Screen</span>
              <span className="hidden max-md:inline">Expand</span>
            </span>
          </div>
        </div>
        <div className="flex-grow overflow-y-auto py-1">{content}</div>
      </div>
      <FullScreenModal
        isOpen={isModalOpen}
        onClose={closeModal}
        content={fullScreenContent} // 使用全屏专用内容或默认内容
        position={position}
      />
    </li>
  );
};

interface ConversationProps {
  position: string;
}
const Conversation: React.FC<ConversationProps> = ({ position }) => {
  const {
    ConversationDataL,
    ConversationDataR,
    isConversationEnded,
    isConversationStopped,
    isEvaluationEnded,
    feedbacksL,
    setFeedbacksL,
    feedbacksR,
    setFeedbacksR,
    isConversationEndedL,
    isConversationEndedR,
    setCurrentStateL,
    setCurrentStateR,
    messageLeft,
    messageRight,
    setMessageLeft,
    setMessageRight,
    os,
    chat_id,
    agent,
    vlm,
    evaluationResults // Get evaluation results directly from context
  } = useArena();

  const { alias, avatar_url, socketService, user_id } = useAuth();

  // 添加发送独立消息的处理函数
  const handleSendAgentMessage = (agentIdx: number) => {
    const pos = agentIdx === 0 ? "left" : "right";
    const messageData = {
      user_id: user_id,
      chat_id: chat_id,
      user_intent: pos === "left" ? messageLeft : messageRight,
      os_env: os,
      agent_num: 1,
      agent_idx: agentIdx,
    };
    socketService.Send("message_to_agent", messageData);
    if (pos === "left") {
      setMessageLeft("");
      setCurrentStateL(ConversationState.InConversation);
    } else {
      setMessageRight("");
      setCurrentStateR(ConversationState.InConversation);
    }
  };

  const renderConversation = (data: any[], pos: string) => {
    let FeedbackIndex = -1; // 从-1开始，这样第一次增加为0
    
    // 初始化或扩展feedbacks数组，确保有足够的元素
    const ensureFeedbacksInitialized = () => {
      // 计算实际需要的feedback数组长度（计算Agent消息数量）
      let requiredLength = 0;
      data.forEach(item => {
        if (item?.type === 'agent' && item?.name === 'Computer Agent') {
          requiredLength++;
        }
      });
      
      // 确保数组长度足够
      if (pos === "left") {
        if (feedbacksL.length < requiredLength) {
          const newFeedbacks = [...feedbacksL];
          for (let i = feedbacksL.length; i < requiredLength; i++) {
            newFeedbacks[i] = [];
          }
          setFeedbacksL(newFeedbacks);
        }
      } else {
        if (feedbacksR.length < requiredLength) {
          const newFeedbacks = [...feedbacksR];
          for (let i = feedbacksR.length; i < requiredLength; i++) {
            newFeedbacks[i] = [];
          }
          setFeedbacksR(newFeedbacks);
        }
      }
    };
    
    // 在渲染前确保feedbacks数组已初始化
    ensureFeedbacksInitialized();
    
    return (
      <>
        <ul className="w-full space-y-5 list-none p-0 my-2">
          {data?.map((item, index) => {
            if (item?.type === "user") {
              // 用户消息不需要增加FeedbackIndex
              return (
                <UserMessage
                  key={index}
                  alias={alias || "User"}
                  avatar_url={avatar_url}
                  content={item?.content?.[0]?.title}
                />
              );
            } else if (item?.name === "Search Agent") {
              // Render Search Agent messages with the special component
              return (
                <SearchAgentMessage
                  key={index}
                  position={pos}
                  content={item?.content ?? []}
                />
              );
            } else if (item?.type === "message") {
              // Render Interactive messages with our new component
              return (
                <InteractiveMessage
                  key={index}
                  position={pos}
                  content={item?.content ?? []}
                />
              );
            } else if (item?.isThinking) {
              // Render a thinking message when the agent is processing
              return (
                <li className="h-full max-h-full w-full max-w-full flex space-x-2">
                  <span className="shrink-0 inline-flex items-center justify-center size-[24px] rounded-full bg-gray-600">
                    <span className="text-sm font-medium text-white leading-none">
                      {pos === "left" ? "A" : "B"}
                    </span>
                  </span>
                  <div className="flex flex-col h-full w-full bg-white border border-gray-200 rounded-lg dark:bg-neutral-900 dark:border-neutral-700">
                    <div className="flex-grow overflow-y-auto p-4">
                      <div className="flex items-center">
                        <div className="flex space-x-1">
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </li>
              );
            } else {
              // Computer Agent消息需要增加FeedbackIndex
              FeedbackIndex++;
              // 确保当前FeedbackIndex有效
              const currentFeedbackIndex = FeedbackIndex;
              
              const normalContent = (
                <Trajectory
                  TrajectoryData={item?.content ?? []}
                  isLast={index === data?.length - 1}
                  position={pos}
                  isFullScreen={false}
                  feedbacks={pos === "left" 
                    ? (feedbacksL[currentFeedbackIndex] || [])  // 提供默认值防止undefined
                    : (feedbacksR[currentFeedbackIndex] || [])}
                  setFeedbacks={(updatedFeedbacks) => {
                    if (pos === "left") {
                      setFeedbacksL(prev => {
                        const newFeedbacks = [...prev];
                        while (newFeedbacks.length <= currentFeedbackIndex) {
                          newFeedbacks.push([]);  // 确保数组长度足够
                        }
                        newFeedbacks[currentFeedbackIndex] = updatedFeedbacks;
                        return newFeedbacks;
                      });
                    } else {
                      setFeedbacksR(prev => {
                        const newFeedbacks = [...prev];
                        while (newFeedbacks.length <= currentFeedbackIndex) {
                          newFeedbacks.push([]);  // 确保数组长度足够
                        }
                        newFeedbacks[currentFeedbackIndex] = updatedFeedbacks;
                        return newFeedbacks;
                      });
                    }
                  }}
                />
              );

              const fullScreenContent = (
                <Trajectory
                  TrajectoryData={item?.content ?? []}
                  isLast={index === data?.length - 1}
                  position={pos}
                  isFullScreen={true}
                  feedbacks={pos === "left" 
                    ? (feedbacksL[currentFeedbackIndex] || [])  // 提供默认值防止undefined
                    : (feedbacksR[currentFeedbackIndex] || [])}
                  setFeedbacks={(updatedFeedbacks) => {
                    if (pos === "left") {
                      setFeedbacksL(prev => {
                        const newFeedbacks = [...prev];
                        while (newFeedbacks.length <= currentFeedbackIndex) {
                          newFeedbacks.push([]);  // 确保数组长度足够
                        }
                        newFeedbacks[currentFeedbackIndex] = updatedFeedbacks;
                        return newFeedbacks;
                      });
                    } else {
                      setFeedbacksR(prev => {
                        const newFeedbacks = [...prev];
                        while (newFeedbacks.length <= currentFeedbackIndex) {
                          newFeedbacks.push([]);  // 确保数组长度足够
                        }
                        newFeedbacks[currentFeedbackIndex] = updatedFeedbacks;
                        return newFeedbacks;
                      });
                    }
                  }}
                />
              );

              return (
                <AgentMessage
                  key={index}
                  position={pos}
                  content={normalContent}
                  fullScreenContent={fullScreenContent}
                />
              );
            }
          })}
        </ul>

        {/* 添加独立的Agent输入框，仅当最后一条消息是交互式消息时显示 */}
        {data.length > 0 &&
          data[data.length - 1].type === 'message' && (
            <AgentMessageInput
              onSend={handleSendAgentMessage}
              isSettingUp={false}
              position={pos === "left" ? "left" : "right"}
            />
          )}
      </>
    );
  };

  return (
    <>
      {/* 原有的对话内容 */}
      {position === "left" && renderConversation(ConversationDataL, "left")}
      {position === "right" && renderConversation(ConversationDataR, "right")}
    </>
  );
};

const TimelineItem: React.FC<{
  event: TrajectoryDataItem;
  index: number;
  isActive: boolean;
  isLast: boolean;
  activeStep: number;
  onStepClick: (index: number) => void;
  isFullScreen?: boolean;
  feedbacks: Feedback[];
  updateFeedback: (index: number, feedback: Feedback) => void;
}> = ({
  event,
  index,
  isActive,
  isLast,
  activeStep,
  onStepClick,
  isFullScreen,
  feedbacks,
  updateFeedback,
}) => {
    const itemRef = useRef<HTMLDivElement>(null);
    const [lineHeight, setLineHeight] = useState("100%");
    const [StepFeedback, setStepFeedback] = useState<Feedback | null>(null);
    const [isThumbUp, setIsThumbUp] = useState(false);
    const [isThumbDown, setIsThumbDown] = useState(false);

    // Add handlers for thumbs
    const handleThumbUp = (e: React.MouseEvent) => {
      e.stopPropagation(); // Prevent click from propagating
      const updatedFeedback = {
        ...StepFeedback,
        status: isThumbUp ? null : true,
        index: index, // 确保使用正确的索引
      };
      setStepFeedback(updatedFeedback);
      setIsThumbUp(!isThumbUp);
      
      // 立即更新反馈
      updateFeedback(index, updatedFeedback);

      if (isThumbDown) setIsThumbDown(false);
    };

    const handleThumbDown = (e: React.MouseEvent) => {
      e.stopPropagation(); // Prevent click from propagating
      const updatedFeedback = {
        ...StepFeedback,
        status: isThumbDown ? null : false,
        index: index, // 确保使用正确的索引
      };
      setStepFeedback(updatedFeedback);
      setIsThumbDown(!isThumbDown);
      
      // 立即更新反馈
      updateFeedback(index, updatedFeedback);

      if (isThumbUp) setIsThumbUp(false);
    };
    
    // 移除这个useEffect，因为我们已经在上面直接调用了updateFeedback
    // useEffect(() => {
    //   if (StepFeedback) {
    //     updateFeedback(index, StepFeedback);
    //   }
    // }, [StepFeedback]);
    useEffect(() => {
      if (itemRef.current && !isLast) {
        const height = itemRef.current.offsetHeight;
        setLineHeight(`calc(100% + ${height}px)`);
      }
    }, [isLast]);

    const getItemStyle = (index: number) => {
      if (
        Array.isArray(feedbacks) && 
        index < feedbacks.length && 
        feedbacks[index]?.status === false
      ) {
        return "bg-red-50 hover:bg-red-100 dark:bg-red-800 dark:hover:bg-red-700";
      } else if (isActive) {
        return "bg-green-50 hover:bg-green-100 dark:bg-green-800 dark:hover:bg-green-700";
      } else if (index < activeStep) {
        return "bg-gray-100 hover:bg-gray-200 dark:bg-gray-600 dark:hover:bg-gray-500";
      }
      return "hover:bg-gray-50 dark:hover:bg-gray-800";
    };

    const getDotStyle = () => {
      if (
        Array.isArray(feedbacks) && 
        index < feedbacks.length && 
        feedbacks[index]?.status === false
      ) {
        return "bg-red-500 border-red-200 dark:border-red-900";
      } else if (isActive) {
        return "bg-green-500 border-green-200 dark:border-green-900";
      } else if (index < activeStep) {
        return "bg-gray-600 border-gray-300 dark:border-gray-700";
      }
      return "bg-gray-400 border-white dark:border-gray-900";
    };

    return (
      <div
        ref={itemRef}
        className={`flex gap-x-1 max-md:flex-col max-md:h-full relative group rounded-md transition-colors duration-150 ease-in-out ${getItemStyle(
          index
        )}`}
        onClick={() => onStepClick(index)}
      >
        <div className="relative h-full max-md:h-[0.5px] max-md:w-full">
          <div
            className={`absolute top-0 left-2.5 max-md:left-1/2 max-md:top-0 w-px max-md:w-full max-md:h-px bg-gray-300 dark:bg-gray-600`}
            style={{ height: isLast ? "100%" : lineHeight }}
          ></div>
          <div className="relative z-10 w-5 max-md:w-full h-10 max-md:h-4 flex justify-center items-center">
            <div
              className={`w-2 max-md:w-1.5 h-2 max-md:h-1.5 rounded-full border-2 max-md:border ${getDotStyle()}`}
            ></div>
          </div>
        </div>

        <div className="flex flex-col h-full w-full m-0 p-0 gap-y-0">
          <p
            className={`flex flex-col ${isFullScreen
              ? "text-base max-md:text-xs font-semibold"
              : "text-xs max-md:text-[10px] font-semibold"
              } 
          ${Array.isArray(feedbacks) && index < feedbacks.length && feedbacks[index]?.status === false
                ? "text-red-500 dark:text-red-400"
                : "text-gray-800 dark:text-white"
              }
          break-words whitespace-normal line-clamp-2`}
          >
            {event?.title?.includes("\n")
              ? event?.title
                ?.split("\n")
                ?.map((line: string, i: number) => <span key={i}>{line}</span>)
              : event?.title}
          </p>
          {isFullScreen && (
            <p className="text-sm max-md:text-xs -mt-2 text-gray-600 dark:text-neutral-400">
              {event?.description}
            </p>
          )}
          <div className="flex flex-row gap-2 items-center -mt-1 mb-1 flex-wrap max-md:justify-between">
            <div
              className={`${isFullScreen
                ? "text-sm max-md:text-[10px]"
                : "text-[10px] max-md:text-[8px]"
                } text-gray-600 dark:text-neutral-400`}
            >
              {typeof event?.agent_time === "string" &&
                Number(event?.agent_time) !== 0
                ? Number(event?.agent_time)?.toFixed(2) + "s"
                : null}
              {typeof event?.agent_time === "number" && event?.agent_time !== 0
                ? event?.agent_time?.toFixed(2) + "s"
                : null}
            </div>
            {event.title !== "Generating..." && event.title !== "end" && event.title !== "End by user" && event.title !== "Step Limit Exceeded" && (
              <div className={`flex gap-1`}>
                <span
                  onClick={handleThumbUp}
                  className={`${isFullScreen ? "size-6 max-md:size-5" : "size-4 max-md:size-3.5"
                    } transition-colors duration-150 cursor-pointer`}
                >
                  {isThumbUp ? (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      className="text-green-600"
                    >
                      <path d="M7.493 18.5c-.425 0-.82-.236-.975-.632A7.48 7.48 0 0 1 6 15.125c0-1.75.599-3.358 1.602-4.634.151-.192.373-.309.6-.397.473-.183.89-.514 1.212-.924a9.042 9.042 0 0 1 2.861-2.4c.723-.384 1.35-.956 1.653-1.715a4.498 4.498 0 0 0 .322-1.672V2.75A.75.75 0 0 1 15 2a2.25 2.25 0 0 1 2.25 2.25c0 1.152-.26 2.243-.723 3.218-.266.558.107 1.282.725 1.282h3.126c1.026 0 1.945.694 2.054 1.715.045.422.068.85.068 1.285a11.95 11.95 0 0 1-2.649 7.521c-.388.482-.987.729-1.605.729H14.23c-.483 0-.964-.078-1.423-.23l-3.114-1.04a4.501 4.501 0 0 0-1.423-.23h-.777Z" />
                    </svg>
                  ) : (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                      className="w-full h-full text-gray-400 rotate-180"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M7.498 15.25H4.372c-1.026 0-1.945-.694-2.054-1.715a12.137 12.137 0 0 1-.068-1.285c0-2.848.992-5.464 2.649-7.521C5.287 4.247 5.886 4 6.504 4h4.016a4.5 4.5 0 0 1 1.423.23l3.114 1.04a4.5 4.5 0 0 0 1.423.23h1.294M7.498 15.25c.618 0 .991.724.725 1.282A7.471 7.471 0 0 0 7.5 19.75 2.25 2.25 0 0 0 9.75 22a.75.75 0 0 0 .75-.75v-.633c0-.573.11-1.14.322-1.672.304-.76.93-1.33 1.653-1.715a9.04 9.04 0 0 0 2.86-2.4c.498-.634 1.226-1.08 2.032-1.08h.384m-10.253 1.5H9.7m8.075-9.75c.01.05.027.1.05.148.593 1.2.925 2.55.925 3.977 0 1.487-.36 2.89-.999 4.125m.023-8.25c-.076-.365.183-.75.575-.75h.908c.889 0 1.713.518 1.972 1.368.339 1.11.521 2.287.521 3.507 0 1.553-.295 3.036-.831 4.398-.306.774-1.086 1.227-1.918 1.227h-1.053c-.472 0-.745-.556-.5-.96a8.95 8.95 0 0 0 .303-.54"
                      />
                    </svg>
                  )}
                </span>

                <span
                  onClick={handleThumbDown}
                  className={`${isFullScreen ? "size-6 max-md:size-5" : "size-4 max-md:size-3.5"
                    } transition-colors duration-150 cursor-pointer`}
                >
                  {isThumbDown ? (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      className="text-red-600"
                    >
                      <path d="M15.73 5.5h1.035A7.465 7.465 0 0 1 18 9.625a7.465 7.465 0 0 1-1.235 4.125h-.148c-.806 0-1.534.446-2.031 1.08a9.04 9.04 0 0 1-2.861 2.4c-.723.384-1.35.956-1.653 1.715a4.499 4.499 0 0 0-.322 1.672v.633A.75.75 0 0 1 9 22a2.25 2.25 0 0 1-2.25-2.25c0-1.152.26-2.243.723-3.218.266-.558-.107-1.282-.725-1.282H3.622c-1.026 0-1.945-.694-2.054-1.715A12.137 12.137 0 0 1 1.5 12.25c0-2.848.992-5.464 2.649-7.521C4.537 4.247 5.136 4 5.754 4H9.77a4.5 4.5 0 0 1 1.423.23l3.114 1.04a4.5 4.5 0 0 0 1.423.23ZM21.669 14.023c.536-1.362.831-2.845.831-4.398 0-1.22-.182-2.398-.52-3.507-.26-.85-1.084-1.368-1.973-1.368H19.1c-.445 0-.72.498-.523.898.591 1.2.924 2.55.924 3.977a8.958 8.958 0 0 1-1.302 4.666c-.245.403.028.959.5.959h1.053c.832 0 1.612-.453 1.918-1.227Z" />
                    </svg>
                  ) : (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                      className="w-full h-full text-gray-400"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M7.498 15.25H4.372c-1.026 0-1.945-.694-2.054-1.715a12.137 12.137 0 0 1-.068-1.285c0-2.848.992-5.464 2.649-7.521C5.287 4.247 5.886 4 6.504 4h4.016a4.5 4.5 0 0 1 1.423.23l3.114 1.04a4.5 4.5 0 0 0 1.423.23h1.294M7.498 15.25c.618 0 .991.724.725 1.282A7.471 7.471 0 0 0 7.5 19.75 2.25 2.25 0 0 0 9.75 22a.75.75 0 0 0 .75-.75v-.633c0-.573.11-1.14.322-1.672.304-.76.93-1.33 1.653-1.715a9.04 9.04 0 0 0 2.86-2.4c.498-.634 1.226-1.08 2.032-1.08h.384m-10.253 1.5H9.7m8.075-9.75c.01.05.027.1.05.148.593 1.2.925 2.55.925 3.977 0 1.487-.36 2.89-.999 4.125m.023-8.25c-.076-.365.183-.75.575-.75h.908c.889 0 1.713.518 1.972 1.368.339 1.11.521 2.287.521 3.507 0 1.553-.295 3.036-.831 4.398-.306.774-1.086 1.227-1.918 1.227h-1.053c-.472 0-.745-.556-.5-.96a8.95 8.95 0 0 0 .303-.54"
                      />
                    </svg>
                  )}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

const Timeline: React.FC<{
  TrajectoryData: TrajectoryDataItem[];
  activeStep: number;
  setActiveStep: (step: number) => void;
  maxHeight: number;
  isFullScreen?: boolean;
  feedbacks: Feedback[];
  setFeedbacks: (feedbacks: Feedback[]) => void;
}> = ({
  TrajectoryData,
  activeStep,
  setActiveStep,
  maxHeight,
  isFullScreen,
  feedbacks,
  setFeedbacks,
}) => {
    const timelineRef = useRef<HTMLDivElement>(null);
    const activeItemRef = useRef<HTMLDivElement>(null);

    // 添加新的 useEffect 来监听 TrajectoryData 变化
    useEffect(() => {
      if (TrajectoryData.length > 0) {
        if (
          TrajectoryData[TrajectoryData.length - 1]?.title === "end" ||
          TrajectoryData[TrajectoryData.length - 1]?.title === "End by user" ||
          TrajectoryData[TrajectoryData.length - 1]?.title === "Step Limit Exceeded"
        ) {
          setActiveStep(TrajectoryData.length - 1);
        } else {
          setActiveStep(Math.max(0, TrajectoryData.length - 2));
        }
      }
    }, [TrajectoryData.length]);

    useEffect(() => {
      if (timelineRef.current && activeItemRef.current) {
        const timelineElement = timelineRef.current;
        const activeElement = activeItemRef.current;

        const timelineRect = timelineElement.getBoundingClientRect();
        const activeRect = activeElement.getBoundingClientRect();

        const centerPosition =
          activeRect.top + activeRect.height / 2 - timelineRect.height / 2;

        timelineElement.scrollTo({
          top: timelineElement.scrollTop + centerPosition - timelineRect.top,
          behavior: "smooth",
        });
      }
    }, [activeStep]);

    const updateFeedback = (index: number, feedback: Feedback) => {
      // 确保feedbacks是一个数组
      if (!Array.isArray(feedbacks)) {
        console.error("Feedbacks is not an array:", feedbacks);
        return;
      }
      
      // 为数组扩容，确保能放入指定索引位置的元素
      let newFeedbacks = [...feedbacks];
      while (newFeedbacks.length <= index) {
        newFeedbacks.push({
          status: null,
          index: newFeedbacks.length
        });
      }
      
      newFeedbacks[index] = feedback;
      setFeedbacks(newFeedbacks);
    };

    return (
      <div
        ref={timelineRef}
        className="space-y-2 max-md:space-y-0 max-md:space-x-2 overflow-y-auto max-md:overflow-y-hidden max-md:overflow-x-auto overflow-x-hidden max-md:flex max-md:flex-row max-md:p-2"
        style={{
          maxHeight: `${maxHeight - 20}px`,
          scrollbarWidth: "thin",
          scrollbarColor: "rgba(155, 155, 155, 0.5) transparent",
        }}
      >
        {TrajectoryData.map((event, index) => (
          <div
            ref={index === activeStep ? activeItemRef : null}
            key={index}
            className="max-md:py-0.5 max-md:flex-shrink-0 max-md:w-32 max-md:min-w-32"
          >
            <TimelineItem
              event={event}
              index={index}
              isActive={index === activeStep}
              isLast={index === TrajectoryData.length - 1}
              activeStep={activeStep}
              onStepClick={setActiveStep}
              isFullScreen={isFullScreen}
              feedbacks={feedbacks}
              updateFeedback={updateFeedback}
            />
          </div>
        ))}
      </div>
    );
  };

// 增分享预览组件
const RANDOM_TITLES = [
  "🤔 Which computer agent do you think is better?",
  "🎮 Two agents, one task - who does it better?",
  "🧩 Puzzle time: can you tell the agents apart?",
];

export const ConversationSharePreview: React.FC<{
  leftData: any[];
  rightData: any[];
  agent?: string[] | undefined;
  vlm?: string[] | undefined;
  evaluationResults?: {
    correctnessL?: number;
    correctnessR?: number;
    safetyL?: number;
    safetyR?: number;
    harmlessL?: number;
    harmlessR?: number;
    quality?: number;
    feedbacksL?: Feedback[];
    feedbacksR?: Feedback[];
    commentA?: string;
    commentB?: string;
  };
  onShare?: () => void;
}> = ({ leftData, rightData, agent, vlm, evaluationResults, onShare }) => {
  const previewRef = useRef<HTMLDivElement>(null);
  const { alias, avatar_url } = useAuth();
  const randomTitle = useMemo(
    () => RANDOM_TITLES[Math.floor(Math.random() * RANDOM_TITLES.length)],
    []
  );

  // Function to get label for evaluation values
  const getCorrectnessLabel = (value?: number) => {
    if (value === 1) return "Correct";
    if (value === 0.5) return "Partially Correct";
    if (value === 0) return "Wrong";
    return "N/A";
  };

  const getQualityLabel = (value?: number) => {
    if (value === 1) return "A is better";
    if (value === 0.5) return "Tie";
    if (value === 0) return "B is better";
    if (value === -0.5) return "Tie (both bad)";
    return "N/A";
  };

  const getHarmlessLabel = (value?: number) => {
    if (value === 1) return "Safe";
    if (value === 0) return "Harmful";
    return "N/A";
  };


  // 在组件挂载时将ref传递给父组件
  useEffect(() => {
    if (previewRef.current) {
      // 确保所有图片都加载完成
      const images = previewRef.current.getElementsByTagName("img");
      Promise.all(
        Array.from(images).map((img) => {
          if (img.complete) return Promise.resolve();
          return new Promise((resolve) => {
            img.onload = resolve;
            img.onerror = resolve;
          });
        })
      ).then(() => {
        // 设置容器样式以确保完整渲染
        if (previewRef.current) {
          previewRef.current.style.maxHeight = "none";
          previewRef.current.style.overflow = "visible";
        }
      });
    }
  }, [leftData, rightData]);

  return (
    <div
      ref={previewRef}
      className="flex flex-col gap-4 max-md:gap-2 bg-white dark:bg-neutral-900 p-4 max-md:p-2"
      style={{
        width: "100%",
        height: "auto",
        position: "relative",
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b pb-2">
        <div className="flex items-center gap-2 max-md:gap-1">
          <span className="inline-block text-[24px] max-md:text-[18px] font-semibold align-baseline">
            Computer Agent Arena
          </span>
          <a
            href="https://xlang.ai"
            target="_blank"
            rel="noreferrer"
            className="inline-block align-middle ml-1 text-[18px] max-md:text-[14px] text-secondary-dark/70"
          >
            by{" "}
            <img
              src={XlangLogo}
              height={18}
              className="max-md:h-4"
              alt="logo"
            />{" "}
            XLANG Lab
          </a>
        </div>
      </div>

      <div className="text-center text-4xl max-md:text-2xl font-bold text-gray-800 my-12 max-md:my-6 dark:text-gray-300">
        {randomTitle}
      </div>

      {/* Agent Information */}
      {(agent && vlm) && (
        <div className="grid grid-cols-2 max-md:grid-cols-1 max-md:gap-2 gap-4 bg-neutral-100/50 rounded-lg px-4 py-2 mb-2">
          <div className="flex flex-col">
            <h3 className="font-semibold text-base max-md:text-sm mb-1">Agent A</h3>
            <p className="text-sm max-md:text-xs text-gray-600">{Agent_Display(vlm[0], agent[0])}</p>
          </div>
          <div className="flex flex-col">
            <h3 className="font-semibold text-base max-md:text-sm mb-1">Agent B</h3>
            <p className="text-sm max-md:text-xs text-gray-600">{Agent_Display(vlm[1], agent[1])}</p>
          </div>
        </div>
      )}



      <div className="flex flex-col gap-6 max-md:gap-4">
        {leftData.map((leftItem, index) => {
          const rightItem = rightData[index];
          return (
            <div key={index} className="flex flex-col gap-4 max-md:gap-2">
              {/* User Input */}
              {/* {(leftItem?.type === "user" || rightItem?.type === "user") && (
                <div className="flex justify-start gap-2 mx-4 max-md:mx-2">
                  <div className="w-8 h-8 max-md:w-6 max-md:h-6 bg-gray-600 rounded-full bg-white flex items-center justify-center">
                    {avatar_url ? (
                      <img
                        src={avatar_url}
                        alt="avatar"
                        crossOrigin="anonymous"
                        className="rounded-full w-full h-full object-cover"
                      />
                    ) : (
                      <p className="icon max-md:text-sm">
                        {alias ? alias.charAt(0).toUpperCase() : "U"}
                      </p>
                    )}
                  </div>
                  <div className="bg-orange-100 rounded-lg px-4 max-md:px-2 py-1 max-w-[50%]">
                    <p className="text-base max-md:text-sm">
                      {leftItem?.type === "user"
                        ? leftItem?.content?.[0]?.title
                        : rightItem?.content?.[0]?.title}
                    </p>
                  </div>
                </div>
              )} */}

              {/* Agent Responses */}
              <div className="grid grid-cols-2 max-md:grid-cols-1 gap-4 max-md:gap-2">
                {/* Left Agent */}
                {leftItem?.type === "user" ? (
                  <div className="flex justify-start gap-2">
                    <div className="w-6 h-6 max-md:w-5 max-md:h-5 bg-gray-600 rounded-full bg-white flex items-center justify-center">
                      {avatar_url ? (
                        <img
                          src={avatar_url}
                          alt="avatar"
                          crossOrigin="anonymous"
                          className="rounded-full w-full h-full object-cover"
                        />
                      ) : (
                        <p className="text-sm max-md:text-xs">
                          {alias ? alias.charAt(0).toUpperCase() : "U"}
                        </p>
                      )}
                    </div>
                    <div className="bg-orange-100 rounded-lg px-4 max-md:px-2 py-2 max-w-[90%]">
                      <p className="text-sm max-md:text-xs">
                        {leftItem?.content?.[0]?.title || leftItem?.content?.[0]?.description}
                      </p>
                    </div>
                  </div>
                ) : leftItem?.name === "Search Agent" ? (
                  <div className="flex bg-grey-50 hover:bg-grey-100 flex-col gap-2 max-md:gap-1 border rounded-lg p-2">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 max-md:w-5 max-md:h-5 bg-gray-600 rounded-full flex items-center justify-center">
                        <span className="text-white text-sm max-md:text-xs">
                          A
                        </span>
                      </div>
                      <h3 className="text-md max-md:text-sm font-medium">
                        Agent A - {leftItem?.name}
                      </h3>
                    </div>
                    <SearchAgentMessage
                      position="left"
                      content={leftItem?.content ?? []}
                    />
                  </div>
                ) : leftItem?.type === "agent" &&
                Array.isArray(leftItem?.content) && (
                  <div className="flex flex-col bg-grey-50 hover:bg-grey-100 gap-2 max-md:gap-1 border rounded-lg p-2">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 max-md:w-5 max-md:h-5 bg-gray-600 rounded-full flex items-center justify-center">
                        <span className="text-white text-sm max-md:text-xs">
                          A
                        </span>
                      </div>
                      <h3 className="text-md max-md:text-sm font-medium">
                        Agent A - {leftItem?.name}
                      </h3>
                    </div>
                    {leftItem?.content?.map(
                      (step: any, stepIndex: number) => (
                        <div
                          key={stepIndex}
                          className="flex gap-x-1 relative group rounded-md transition-colors duration-150 ease-in-out hover:bg-gray-50 dark:hover:bg-gray-800"
                        >
                          {/* Timeline dot with step number */}
                          <div className="relative h-full">
                            <div
                              className="absolute top-0 left-6 max-md:left-4 w-px bg-gray-300 dark:bg-gray-600"
                              style={{
                                height:
                                  stepIndex === leftItem.content.length - 1
                                    ? "100%"
                                    : "calc(100% + 16px)",
                              }}
                            ></div>
                            <div className="relative z-10 w-12 max-md:w-8 h-12 max-md:h-8 top-6 max-md:top-4 flex justify-center items-center">
                              <div className="w-12 max-md:w-8 h-12 max-md:h-8 rounded-full border-2 max-md:border bg-gray-100 dark:bg-neutral-800 border-gray-300 dark:border-gray-600 flex items-center justify-center">
                                <span className="text-base max-md:text-sm font-medium text-gray-600 dark:text-gray-400">
                                  {stepIndex + 1}
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Content */}
                          <div className="flex flex-col h-full w-full m-0 p-2 max-md:p-1 gap-y-1">
                            {/* Title */}
                            <div className="flex flex-col text-base max-md:text-sm font-semibold text-gray-800 dark:text-white break-words whitespace-normal">
                              {typeof step?.title === "string"
                                ? step?.title?.includes("\n")
                                  ? step.title
                                    .split("\n")
                                    .map(
                                      (line: string, lineIndex: number) => (
                                        <span key={lineIndex}>{line}</span>
                                      )
                                    )
                                  : step.title
                                : // Fallback for non-string titles
                                JSON.stringify(step?.title)}
                            </div>

                            {/* Image */}
                            {step.image && step.image !== "" && (
                              <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden">
                                <img
                                  src={`data:image/png;base64,${step.image}`}
                                  alt={`Step ${stepIndex + 1}`}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                            )}
                            {/* Description */}
                            <div className="text-sm max-md:text-xs text-gray-600 dark:text-gray-400">
                              {step?.description?.length > 0
                                ? step?.description
                                : "No description"}
                            </div>

                            {/* Metrics */}
                            {/* <div className="text-xs max-md:text-[10px] text-gray-500 dark:text-gray-400">
                              <span>
                                Time: {Number(step.agent_time).toFixed(2)}s
                              </span>
                              <span className="ml-2">
                                Tokens: {step.token}
                              </span>
                            </div> */}
                          </div>
                        </div>
                      )
                    )}
                  </div>
                )}

                {/* Left Interact Message */}
                {leftItem?.type === "message" && (
                  <div className="flex flex-col bg-grey-50 hover:bg-grey-100 gap-2 max-md:gap-1 border rounded-lg p-2">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 max-md:w-5 max-md:h-5 bg-gray-600 rounded-full flex items-center justify-center">
                        <span className="text-white text-sm max-md:text-xs">
                          A
                        </span>
                      </div>
                      <h3 className="text-md max-md:text-sm font-medium">
                        Agent A - Message
                      </h3>
                    </div>
                    <div className="flex flex-col h-full w-full m-0 p-2 max-md:p-1 gap-y-1">
                      <div className="text-sm max-md:text-xs text-gray-600 dark:text-gray-400">
                        {leftItem?.content[0]?.description}
                      </div>
                    </div>
                  </div>
                )}

                {/* Right Agent */}
                {rightItem?.type === "user" ? (
                  <div className="flex justify-start gap-2">
                    <div className="w-6 h-6 max-md:w-5 max-md:h-5 bg-gray-600 rounded-full bg-white flex items-center justify-center">
                      {avatar_url ? (
                        <img
                          src={avatar_url}
                          alt="avatar"
                          crossOrigin="anonymous"
                          className="rounded-full w-full h-full object-cover"
                        />
                      ) : (
                        <p className="text-sm max-md:text-xs">
                          {alias ? alias.charAt(0).toUpperCase() : "U"}
                        </p>
                      )}
                    </div>
                    <div className="bg-orange-100 rounded-lg px-4 max-md:px-2 py-2 max-w-[90%]">
                      <p className="text-sm max-md:text-xs">
                        {rightItem?.content?.[0]?.title || rightItem?.content?.[0]?.description}
                      </p>
                    </div>
                  </div>
                ) : rightItem?.name === "Search Agent" ? (
                  <div className="flex flex-col bg-grey-50 hover:bg-grey-100 gap-2 max-md:gap-1 border rounded-lg p-2">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 max-md:w-5 max-md:h-5 bg-gray-600 rounded-full flex items-center justify-center">
                        <span className="text-white text-sm max-md:text-xs">
                          B
                        </span>
                      </div>
                      <h3 className="text-md max-md:text-sm font-medium">
                        Agent B - {rightItem?.name}
                      </h3>
                    </div>
                    <SearchAgentMessage
                      position="right"
                      content={rightItem?.content ?? []}
                    />
                  </div>
                ) : rightItem?.type === "agent" &&
                Array.isArray(rightItem?.content) && (
                  <div className="flex flex-col bg-grey-50 hover:bg-grey-100 gap-2 max-md:gap-1 border rounded-lg p-2">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 max-md:w-5 max-md:h-5 bg-gray-600 rounded-full flex items-center justify-center">
                        <span className="text-white text-sm max-md:text-xs">
                          B
                        </span>
                      </div>
                      <h3 className="text-md max-md:text-sm font-medium">
                        Agent B - {rightItem?.name}
                      </h3>
                    </div>
                    {rightItem?.content?.map(
                      (step: any, stepIndex: number) => (
                        <div
                          key={stepIndex}
                          className="flex gap-x-1 relative group rounded-md transition-colors duration-150 ease-in-out hover:bg-gray-50 dark:hover:bg-gray-800"
                        >
                          {/* Timeline dot with step number */}
                          <div className="relative h-full">
                            <div
                              className="absolute top-0 left-6 max-md:left-4 w-px bg-gray-300 dark:bg-gray-600"
                              style={{
                                height:
                                  stepIndex === rightItem.content.length - 1
                                    ? "100%"
                                    : "calc(100% + 16px)",
                              }}
                            ></div>
                            <div className="relative z-10 w-12 max-md:w-8 h-12 max-md:h-8 top-6 max-md:top-4 flex justify-center items-center">
                              <div className="w-12 max-md:w-8 h-12 max-md:h-8 rounded-full border-2 max-md:border bg-gray-100 dark:bg-neutral-800 border-gray-300 dark:border-gray-600 flex items-center justify-center">
                                <span className="text-base max-md:text-sm font-medium text-gray-600 dark:text-gray-400">
                                  {stepIndex + 1}
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Content */}
                          <div className="flex flex-col h-full w-full m-0 p-2 max-md:p-1 gap-y-1">
                            {/* Title */}
                            <div className="flex flex-col text-base max-md:text-sm font-semibold text-gray-800 dark:text-white break-words whitespace-normal">
                              {typeof step?.title === "string"
                                ? step?.title?.includes("\n")
                                  ? step?.title
                                    .split("\n")
                                    .map(
                                      (line: string, lineIndex: number) => (
                                        <span key={lineIndex}>{line}</span>
                                      )
                                    )
                                  : step?.title
                                : // Fallback for non-string titles
                                JSON.stringify(step?.title)}
                            </div>

                            {/* Image */}
                            {step.image && step.image !== "" && (
                              <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden">
                                <img
                                  src={`data:image/png;base64,${step.image}`}
                                  alt={`Step ${stepIndex + 1}`}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                            )}
                            {/* Description */}
                            <div className="text-sm max-md:text-xs text-gray-600 dark:text-gray-400">
                              {step?.description}
                            </div>

                            {/* Metrics */}
                            <div className="text-xs max-md:text-[10px] text-gray-500 dark:text-gray-400">
                              <span>
                                Time: {Number(step?.agent_time).toFixed(2)}s
                              </span>
                              <span className="ml-2">
                                Tokens: {step?.token}
                              </span>
                            </div>
                          </div>
                        </div>
                      )
                    )}
                  </div>
                )}

                {/* Right Interact Message */}
                {rightItem?.type === "message" && (
                  <div className="flex flex-col bg-grey-50 hover:bg-grey-100 gap-2 max-md:gap-1 border rounded-lg p-2">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 max-md:w-5 max-md:h-5 bg-gray-600 rounded-full flex items-center justify-center">
                        <span className="text-white text-sm max-md:text-xs">
                          B
                        </span>
                      </div>
                      <h3 className="text-md max-md:text-sm font-medium">
                        Agent B - Message
                      </h3>
                    </div>
                    <div className="flex flex-col h-full w-full m-0 p-2 max-md:p-1 gap-y-1">
                      <div className="text-sm max-md:text-xs text-gray-600 dark:text-gray-400">
                        {rightItem?.content[0]?.description}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
      {/* Evaluation Results */}
      {evaluationResults && (
        <div className="bg-gray-100 rounded-lg p-4 max-md:p-2 mb-6 max-md:mb-4">
          <h3 className="font-bold text-xl max-md:text-lg mb-3 max-md:mb-2 text-center">Evaluation Results</h3>

          <div className="grid grid-cols-2 max-md:grid-cols-1 gap-4 max-md:gap-2 mb-4 max-md:mb-3">
            <div className="bg-white rounded-lg p-3 max-md:p-2 shadow-sm">
              <h4 className="font-semibold mb-1 text-base max-md:text-sm">Agent A Results</h4>
              <div className="text-sm max-md:text-xs space-y-1">
                <p><span className="font-medium">Correctness:</span> {getCorrectnessLabel(evaluationResults.correctnessL)}</p>
                {evaluationResults.harmlessL !== undefined && (
                  <p><span className="font-medium">Safety:</span> {getHarmlessLabel(evaluationResults.harmlessL)}</p>
                )}
                {evaluationResults.commentA && (
                  <p><span className="font-medium">Comments:</span> {evaluationResults.commentA}</p>
                )}
              </div>
            </div>

            <div className="bg-white rounded-lg p-3 max-md:p-2 shadow-sm">
              <h4 className="font-semibold mb-1 text-base max-md:text-sm">Agent B Results</h4>
              <div className="text-sm max-md:text-xs space-y-1">
                <p><span className="font-medium">Correctness:</span> {getCorrectnessLabel(evaluationResults.correctnessR)}</p>
                {evaluationResults.harmlessR !== undefined && (
                  <p><span className="font-medium">Safety:</span> {getHarmlessLabel(evaluationResults.harmlessR)}</p>
                )}
                {evaluationResults.commentB && (
                  <p><span className="font-medium">Comments:</span> {evaluationResults.commentB}</p>
                )}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-3 max-md:p-2 shadow-sm">
            <h4 className="font-semibold mb-1 text-center text-base max-md:text-sm">Overall Comparison</h4>
            <p className="text-center text-lg max-md:text-base font-medium text-blue-600">{getQualityLabel(evaluationResults.quality)}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Conversation;
