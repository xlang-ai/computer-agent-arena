import { useState, useEffect, useRef } from "react";
import React from "react";
import { useArena } from "../../context/ArenaContext";
import "../CSS/eval.css";
import { faAnglesLeft, faHandPointLeft, faPaperPlane, faArrowRotateRight, faShareNodes } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import ClaudeLogo from "../../icons/Claude.svg";
import GeminiLogo from "../../icons/Gemini.svg";
import OpenAILogo from "../../icons/OAI.svg";
import MetaLogo from "../../icons/Meta.png";
import AguvisLogo from "../../icons/aguvis.png";
import QwenLogo from "../../icons/Qwen.webp";
import UITarsLogo from "../../icons/ui-tars.png";
import { useAuth } from "../../context/AuthContext";
import { message } from "antd";
import { ConversationSharePreview } from "./trajectory2";
import { compressData } from "../../utils/compression";
import { showNotification } from "./notification";

interface Feedback {
  status: boolean | null;
  index: number;
  options?: string[];
  comment?: string;
}
interface EvalProps {
  handleSendEval: (
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
  ) => void;
  RestartConversation: () => void;
  PowerOff: () => void;
}

const CorrectnessOptions = [
  { label: "Correct", value: 1 },
  { label: "Partially Correct", value: 0.5 },
  { label: "Wrong", value: 0 },
];

const HarmlessOptions = [
  { label: "Safe", value: 1 },
  { label: "Harmful", value: 0 },
];

const SafetyOptions = [
  { label: "Safe", value: 1 },
  { label: "Unsafe", value: 0 },
];

const QualityOptions = [
  { label: "A is better", value: 1 },
  { label: "Tie", value: 0.5 },
  { label: "B is better", value: 0 },
  { label: "Tie(both bad)", value: -0.5 },
];

const SuccessOptions = [
  { label: "Yes", value: 1 },
  { label: "No", value: 0 },
];

const EfficiencyOptions = [
  { label: "Efficient", value: 1 },
  { label: "Lagging", value: 0 },
];

export const MODEL_INFO: { [key: string]: { link: string, alias: React.ReactNode } } = {
  'claude-3-5-sonnet-20241022+base_agent': {
    link: 'https://www.anthropic.com/news/3-5-models-and-computer-use',
    alias:
      <div className="flex flex-row gap-2 items-center text-base">
        <img src={ClaudeLogo} alt="Claude Logo" className="w-6 h-6" />
          Claude 3.5 Sonnet
        </div>,
  },
  'claude-3-7-sonnet-20250219+base_agent': {
    link: 'https://www.anthropic.com/news/claude-3-7-sonnet',
    alias: <div className="flex flex-row gap-2 items-center text-base">
      <img src={ClaudeLogo} alt="Claude Logo" className="w-6 h-6" />
        Claude 3.7 Sonnet
    </div>,
  },
  'claude-4-sonnet-20250514+claude_computer_use': {
    link: 'https://docs.anthropic.com/en/docs/agents-and-tools/computer-use',
    alias: <div className="flex flex-row gap-2 items-center text-base">
      <img src={ClaudeLogo} alt="Claude Logo" className="w-6 h-6" />
        Claude Sonnet 4
    </div>,
  },
  'claude-4-opus-20250514+base_agent': {
    link: 'https://www.anthropic.com/news/claude-4-opus',
    alias: <div className="flex flex-row gap-2 items-center text-base">
      <img src={ClaudeLogo} alt="Claude Logo" className="w-6 h-6" />
        Claude Opus 4
    </div>,
  },
  'claude-4-sonnet-20250514+base_agent': {
    link: 'https://www.anthropic.com/news/claude-4-opus',
    alias: <div className="flex flex-row gap-2 items-center text-base">
      <img src={ClaudeLogo} alt="Claude Logo" className="w-6 h-6" />
        Claude Sonnet 4 
    </div>,
  },
  'claude-3-5-sonnet-20241022+claude_computer_use': {
    link: 'https://docs.anthropic.com/en/docs/agents-and-tools/computer-use',
    alias: <div className="flex flex-row gap-2 items-center text-base">
      <img src={ClaudeLogo} alt="Claude Logo" className="w-6 h-6" />
        Claude 3.5 Sonnet (New)
      </div>,
  },
  'claude-3-7-sonnet-20250219+claude_computer_use': {
    link: 'https://docs.anthropic.com/en/docs/agents-and-tools/computer-use',
    alias: <div className="flex flex-row gap-2 items-center text-base">
      <img src={ClaudeLogo} alt="Claude Logo" className="w-6 h-6" />
        Claude 3.7 Sonnet
      </div>,
  },
  'claude-3-5-sonnet-20240620+base_agent': {
    link: 'https://www.anthropic.com/news/claude-3-5-sonnet',
    alias: <div className="flex flex-row gap-2 items-center text-base">
      <img src={ClaudeLogo} alt="Claude Logo" className="w-6 h-6" />
        Claude 3.5 Sonnet (20240620)
      </div>,
  },
  'claude-3-opus-20240229+base_agent': {
    link: 'https://www.anthropic.com/news/claude-3-family',
    alias: <div className="flex flex-row gap-2 items-center text-base">
      <img src={ClaudeLogo} alt="Claude Logo" className="w-6 h-6" />
        Claude 3 Opus (20240229)
      </div>,
  },
  'aguvis+aguvis_agent': {
    link: 'https://aguvis-project.github.io/',
    alias: <div className="flex flex-row gap-2 items-center text-base">
      <img src={AguvisLogo} alt="Aguvis Logo" className="h-4" />
      Aguvis
    </div>,
  },
  'gemini/gemini-1.5-flash+base_agent': {
    link: 'https://aistudio.google.com/app/prompts/new_chat?instructions=lmsys&model=gemini-1.5-flash-002',
    alias: <div className="flex flex-row gap-2 items-center text-base">
      <img src={GeminiLogo} alt="Gemini Logo" className="w-6 h-6" />
      Gemini 1.5 Flash
    </div>,
  },
  'gemini/gemini-1.5-pro+base_agent': {
    link: 'https://aistudio.google.com/app/prompts/new_chat?instructions=lmsys&model=gemini-1.5-pro-002',
    alias: <div className="flex flex-row gap-2 items-center text-base">
      <img src={GeminiLogo} alt="Gemini Logo" className="w-6 h-6" />
      Gemini 1.5 Pro
    </div>,
  },
  'gemini/gemini-2.0-flash-exp+base_agent': {
    link: 'https://aistudio.google.com/app/prompts/new_chat?instructions=lmsys&model=gemini-2.0-flash-exp-002',
    alias: <div className="flex flex-row gap-2 items-center text-base">
      <img src={GeminiLogo} alt="Gemini Logo" className="w-6 h-6" />
      Gemini 2.0 Flash Exp
    </div>,
  },
  'gemini/gemini-2.0-flash+base_agent': {
    link: 'https://ai.google.dev/gemini-api/docs/models/gemini?_gl=1*1st6smc*_up*MQ..*_ga*MTI0MjAxNzI5MS4xNzM5MDMyMjM2*_ga_P1DBVKWT6V*MTczOTAzMjIzNi4xLjAuMTczOTAzMjIzNi4wLjAuMTExODUxOTI5Mg..#gemini-2.0-flash',
    alias: <div className="flex flex-row gap-2 items-center text-base">
      <img src={GeminiLogo} alt="Gemini Logo" className="w-6 h-6" />
      Gemini 2.0 Flash
    </div>,
  },
  'gemini/gemini-2.5-pro-exp-03-25+base_agent': {
    link: 'https://blog.google/technology/google-deepmind/gemini-model-thinking-updates-march-2025/',
    alias: <div className="flex flex-row gap-2 items-center text-base">
      <img src={GeminiLogo} alt="Gemini Logo" className="w-6 h-6" />
      Gemini 2.5 Pro
    </div>,
  },
  'gemini/gemini-2.5-pro-preview-03-25+gemini_agent': {
    link: 'https://blog.google/technology/google-deepmind/gemini-model-thinking-updates-march-2025/',
    alias: <div className="flex flex-row gap-2 items-center text-base">
      <img src={GeminiLogo} alt="Gemini Logo" className="w-6 h-6" />
      Gemini 2.5 Pro
    </div>,
  },
  'openai/qwen2.5-vl-72b-instruct+base_agent': {
    link: 'https://qwenlm.github.io/blog/qwen2.5-vl/',
    alias: <div className="flex flex-row gap-2 items-center text-base">
      <img src={QwenLogo} alt="Qwen Logo" className="w-6 h-6" />
      Qwen 2.5 VL 72B Instruct
    </div>,
  },
  'openai/qwen2.5-vl-72b-instruct+qwen_agent': {
    link: 'https://qwenlm.github.io/blog/qwen2.5-vl/',
    alias: <div className="flex flex-row gap-2 items-center text-base">
      <img src={QwenLogo} alt="Qwen Logo" className="w-6 h-6" />
      Qwen 2.5 VL 72B Instruct
    </div>,
  },
  'computer-use-preview+openai_cua_agent': {
    link: 'https://platform.openai.com/docs/models/computer-use-preview',
    alias: <div className="flex flex-row gap-2 items-center text-base">
      <img src={OpenAILogo} alt="OpenAI Logo" className="w-6 h-6" />
        Operator
      </div>,
  },
  'computer-use-preview-2025-02-04+openai_cua_agent': {
    link: 'https://platform.openai.com/docs/models/computer-use-preview',
    alias: <div className="flex flex-row gap-2 items-center text-base">
      <img src={OpenAILogo} alt="OpenAI Logo" className="w-6 h-6" />
        Operator
      </div>,
  },
  'o3-2025-04-16+base_agent': {
    link: 'https://openai.com/index/introducing-o3-and-o4-mini/',
    alias: <div className="flex flex-row gap-2 items-center text-base">
      <img src={OpenAILogo} alt="OpenAI Logo" className="w-6 h-6" />
        o3
      </div>,
  },
  'o4-mini-2025-04-16+base_agent': {
    link: 'https://openai.com/index/gpt-4-1/',
    alias: <div className="flex flex-row gap-2 items-center text-base">
      <img src={OpenAILogo} alt="OpenAI Logo" className="w-6 h-6" />
        o4-mini
      </div>,
  },
  'gpt-4.1-2025-04-14+base_agent': {
    link: 'https://openai.com/index/introducing-o3-and-o4-mini/',
    alias: <div className="flex flex-row gap-2 items-center text-base">
      <img src={OpenAILogo} alt="OpenAI Logo" className="w-6 h-6" />
        gpt-4.1
      </div>,
  },
  'ui-tars-1.5+ui_tars_agent': {
    link: 'https://seed-tars.com/',
    alias: <div className="flex flex-row gap-2 items-center text-base">
      <img src={UITarsLogo} alt="UI-TARS-1.5 Logo" className="w-6 h-6" />
        UI-TARS-1.5
      </div>,
  },
  'ui-tars-1.5-qwen-2.5+ui_tars_agent': {
    link: 'https://seed-tars.com/',
    alias: <div className="flex flex-row gap-2 items-center text-base">
      <img src={UITarsLogo} alt="UI-TARS-1.5 Logo" className="w-6 h-6" />
        UI-TARS-1.5 (Qwen 2.5 VL)
      </div>,
  },
  'gpt-4o-2024-08-06+base_agent': {
    link: 'https://platform.openai.com/docs/models/gpt-4o',
    alias: <div className="flex flex-row gap-2 items-center text-base">
      <img src={OpenAILogo} alt="OpenAI Logo" className="w-6 h-6" />
        GPT-4o (20240806)
      </div>,
  },
  'gpt-4o-2024-11-20+base_agent': {
    link: 'https://platform.openai.com/docs/models/gpt-4o',
    alias: <div className="flex flex-row gap-2 items-center text-base">
      <img src={OpenAILogo} alt="OpenAI Logo" className="w-6 h-6" />
        GPT-4o (20241120)
      </div>,
  },
  'gpt-4-turbo-2024-04-09+base_agent': {
    link: 'https://platform.openai.com/docs/models/gpt-4o#gpt-4-turbo-and-gpt-4',
    alias: <div className="flex flex-row gap-2 items-center text-base">
      <img src={OpenAILogo} alt="OpenAI Logo" className="w-6 h-6" />
      GPT-4 Turbo (20240409)
    </div>,
  },
  'gpt-4o-mini-2024-07-18+base_agent': {
    link: 'https://platform.openai.com/docs/models/gpt-4o#gpt-4o-mini',
    alias: <div className="flex flex-row gap-2 items-center text-base">
      <img src={OpenAILogo} alt="OpenAI Logo" className="w-6 h-6" />
      GPT-4o Mini (20240718)
    </div>,
  },
  'llama3-2-90b-instruct+base_agent': {
    link: 'https://huggingface.co/meta-llama/Llama-3.2-90B-Vision-Instruct',
    alias: <div className="flex flex-row gap-2 items-center text-base text-l g；">
      <img src={MetaLogo} alt="Meta Logo" className="w-6 h-6" />
      Llama 3.2 90B Instruct
    </div>,
  },
};

export const Agent_Display = (vlm_name: string, agent: string) => {
  const modelInfo = MODEL_INFO[vlm_name + "+" + agent];
  if (modelInfo) {
    return (
      <a href={modelInfo.link} target="_blank" rel="noopener noreferrer">
        {modelInfo.alias}
      </a>
    )
  } else {
    return (
      <span>
        {vlm_name} + {agent}
      </span>
    )
  }
};

const calculateTotalTime = (conversationData: any[]) => {
  let totalTime = 0;
  conversationData.forEach((item) => {
    if (item.type === "agent") {
      item.content.forEach((content: any) => {
        if (content.agent_time) {
          totalTime += parseFloat(content.agent_time);
        }
      });
    }
  });
  return totalTime.toFixed(2);
};

const Eval: React.FC<EvalProps> = ({
  handleSendEval,
  RestartConversation,
  PowerOff,
}) => {
  const {
    isConversationEnded,
    isEvaluationEnded,
    responsive,
    Disconnect,
    agent,
    vlm,
    ConversationDataL,
    ConversationDataR,
    feedbacksL,
    feedbacksR,
    evaluationResults,
    setEvaluationResults,
    isShareModalVisible,
    setIsShareModalVisible,
    chat_id,
  } = useArena();

  const { alias, avatar_url, socketService, user_id } = useAuth();
  const sharePreviewRef = useRef<HTMLDivElement>(null);

  // Derived state for checking if required fields are filled
  const requiredFieldsFilled = React.useMemo(() => {
    return (
      evaluationResults.correctnessL !== undefined &&
      evaluationResults.correctnessR !== undefined &&
      evaluationResults.quality !== undefined
    );
  }, [evaluationResults.correctnessL, evaluationResults.correctnessR, evaluationResults.quality]);

  // Helper functions to update evaluation results in context
  const onCorrectnessChangeL = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEvaluationResults({
      ...evaluationResults,
      correctnessL: Number(e.target.value)
    });
  };
  
  const onCorrectnessChangeR = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEvaluationResults({
      ...evaluationResults,
      correctnessR: Number(e.target.value)
    });
  };
  
  const onQualityChange = (value: number) => {
    setEvaluationResults({
      ...evaluationResults,
      quality: value
    });
  };
  
  const onSafetyChangeL = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEvaluationResults({
      ...evaluationResults,
      safetyL: Number(e.target.value)
    });
  };
  
  const onSafetyChangeR = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEvaluationResults({
      ...evaluationResults,
      safetyR: Number(e.target.value)
    });
  };
  
  const onHarmlessChangeL = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEvaluationResults({
      ...evaluationResults,
      harmlessL: Number(e.target.value)
    });
  };
  
  const onHarmlessChangeR = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEvaluationResults({
      ...evaluationResults,
      harmlessR: Number(e.target.value)
    });
  };

  const onEfficiencyChangeL = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEvaluationResults({
      ...evaluationResults,
      efficiencyL: Number(e.target.value)
    });
  };

  const onEfficiencyChangeR = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEvaluationResults({
      ...evaluationResults,
      efficiencyR: Number(e.target.value)
    });
  };

  const onSuccessChangeL = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEvaluationResults({
      ...evaluationResults,
      successL: Number(e.target.value)
    });
  };

  const onSuccessChangeR = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEvaluationResults({
      ...evaluationResults,
      successR: Number(e.target.value)
    });
  };

  const onCommentAChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setEvaluationResults({
      ...evaluationResults,
      commentA: e.target.value
    });
  };

  const onCommentBChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setEvaluationResults({
      ...evaluationResults,
      commentB: e.target.value
    });
  };

  const handleShare = () => {
    setIsShareModalVisible(true);
  };

  const handleShareConfirm = async () => {
    if (!sharePreviewRef.current) return;

    try {
      const loadingMessage = message.loading(
        "Preparing your share link...",
        0
      );

      // 收集需要分享的数据
      const shareData = {
        leftData: ConversationDataL,
        rightData: ConversationDataR,
        agent: agent,
        vlm: vlm,
        evaluationResults: evaluationResults,
        user_id: user_id
      };

      // 压缩数据
      const base64Compressed = compressData(shareData);

      // 确定API URL
      const apiUrl = process.env.REACT_APP_DOMAIN || 'https://arena.xlang.ai';

      // 发送压缩后的数据到后端
      const response = await fetch(
        `${apiUrl}/upload_share_data`,
        {
          method: "POST",
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ 
            compressed: true,
            data: base64Compressed 
          })
        }
      );

      if (!response.ok) {
        throw new Error("Upload failed");
      }
      const responseJson = await response.json();
      const shareId = responseJson.share_id;

      // 构建分享URL - 使用前端路由
      const shareUrl = `${window.location.origin}/share_preview/${shareId}`;

      // 准备推文文本和URL
      const tweetText =
        "Check out this interesting AI agent comparison by Computer Agent Arena🤖!";

      // 构建Twitter分享URL
      const twitterShareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(
        tweetText
      )}&url=${encodeURIComponent(shareUrl)}&via=XLangNLP`;

      // 关闭加载消息
      loadingMessage();

      // 在新标签页中打开Twitter分享URL
      window.open(twitterShareUrl, "_blank");

      setIsShareModalVisible(false);
      message.success("Opening Twitter share page!");
    } catch (err) {
      console.error("Error sharing conversation:", err);
      message.error("Failed to share conversation");
    }
  };

  // 需要添加处理复制链接的函数
  const handleCopyShareLink = async () => {
    try {
      const loadingMessage = message.loading(
        "Generating share link...",
        0
      );

      // 收集需要分享的数据
      const shareData = {
        leftData: ConversationDataL,
        rightData: ConversationDataR,
        agent: agent,
        vlm: vlm,
        evaluationResults: evaluationResults,
        user_id: user_id
      };

      // 压缩数据
      const base64Compressed = compressData(shareData);

      // 确定API URL
      const apiUrl = process.env.REACT_APP_DOMAIN || 'https://arena.xlang.ai';

      // 发送压缩后的数据到后端
      const response = await fetch(
        `${apiUrl}/upload_share_data`,
        {
          method: "POST",
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ 
            compressed: true,
            data: base64Compressed 
          })
        }
      );

      if (!response.ok) {
        throw new Error("Upload failed");
      }
      const responseJson = await response.json();
      const shareId = responseJson.share_id;

      // 构建分享URL
      const shareUrl = `${window.location.origin}/share_preview/${shareId}`;

      // 复制到剪贴板
      await navigator.clipboard.writeText(shareUrl);

      // 在新标签页中打开分享链接
      window.open(shareUrl, '_blank');

      // 关闭加载消息
      loadingMessage();

      // 成功提示
      message.success("Link copied to clipboard and opened in new tab!");
    } catch (err) {
      console.error("Error generating share link:", err);
      message.error("Failed to generate share link");
    }
  };

  return isConversationEnded || isEvaluationEnded ? (
    <div className="w-full mt-4 mb-4 px-2 md:px-8 py-6 bg-[#E7F2F0] rounded-lg">
      <div className="flex flex-col gap-4">
        <div className="w-full">
          <div className="flex flex-col">
            <div className="mt-2 border-t border-gray-100">
              <dl className="divide-y divide-gray-100 gap-2">
                {isEvaluationEnded && (
                  <div className="grid grid-cols-2 max-md:grid-cols-1 max-md:gap-1">
                    <div className="bg-transparent px-2 md:px-4 py-2 md:py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-3 max-md:py-2">
                      <dt className="text-sm md:text-base font-medium leading-5 md:leading-6 text-green-900">Model A</dt>
                      <dd className="w-full ml-0 mt-0.5 md:mt-1 text-xs md:text-sm leading-5 md:leading-6 text-green-700 sm:col-span-2 sm:mt-0">
                        <div>{agent && vlm && Agent_Display(vlm[0], agent[0])}</div>
                      </dd>
                    </div>
                    <div className="bg-transparent px-2 md:px-4 py-2 md:py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-3 max-md:py-2">
                      <dt className="text-sm md:text-base font-medium leading-5 md:leading-6 text-green-900">Model B</dt>
                      <dd className="w-full ml-0 mt-0.5 md:mt-1 text-xs md:text-sm leading-5 md:leading-6 text-green-700 sm:col-span-2 sm:mt-0">
                        <div>{agent && vlm && Agent_Display(vlm[1], agent[1])}</div>
                      </dd>
                    </div>
                  </div>
                )}
                <div className="grid grid-cols-2 max-md:grid-cols-1 gap-2">
                  {/* Correctness A */}
                  <div className="bg-transparent px-1 md:px-4 py-2 md:py-4 sm:grid sm:grid-cols-3 sm:gap-4 max-md:py-2">
                    <dt className="text-sm md:text-base font-medium leading-6 text-gray-900 mb-1 md:mb-0">
                      Correctness A <span className="text-red-500 text-xs md:text-base">*</span>
                    </dt>
                    <dd className="w-full ml-0 mt-1 md:mt-0 text-xs md:text-sm leading-5 md:leading-6 text-gray-700 sm:col-span-2 sm:mt-0">
                      {isEvaluationEnded ? (
                        <div>{CorrectnessOptions.find(
                          (item) => item.value === evaluationResults.correctnessL
                        )?.label}</div>
                      ) : (
                        <div className="flex flex-col gap-1 md:gap-2">
                          {CorrectnessOptions.map((option) => (
                            <label key={option.value} className="flex items-center">
                              <input
                                type="radio"
                                name="correctnessA"
                                value={option.value}
                                checked={evaluationResults.correctnessL === option.value}
                                onChange={onCorrectnessChangeL}
                                className="mr-1 md:mr-2 w-3 h-3 md:w-4 md:h-4"
                              />
                              <span className="text-xs md:text-sm">{option.label}</span>
                            </label>
                          ))}
                        </div>
                      )}
                    </dd>
                  </div>
                  {/* Correctness B */}
                  <div className="bg-transparent px-1 md:px-4 py-2 md:py-4 sm:grid sm:grid-cols-3 sm:gap-4 max-md:py-2">
                    <dt className="text-sm md:text-base font-medium leading-6 text-gray-900 mb-1 md:mb-0">
                      Correctness B <span className="text-red-500 text-xs md:text-base">*</span>
                    </dt>
                    <dd className="w-full ml-0 mt-1 md:mt-0 text-xs md:text-sm leading-5 md:leading-6 text-gray-700 sm:col-span-2 sm:mt-0">
                      {isEvaluationEnded ? (
                        <div>{CorrectnessOptions.find(
                          (item) => item.value === evaluationResults.correctnessR
                        )?.label}</div>
                      ) : (
                        <div className="flex flex-col gap-1 md:gap-2">
                          {CorrectnessOptions.map((option) => (
                            <label key={option.value} className="flex items-center">
                              <input
                                type="radio"
                                name="correctnessB"
                                value={option.value}
                                checked={evaluationResults.correctnessR === option.value}
                                onChange={onCorrectnessChangeR}
                                className="mr-1 md:mr-2 w-3 h-3 md:w-4 md:h-4"
                              />
                              <span className="text-xs md:text-sm">{option.label}</span>
                            </label>
                          ))}
                        </div>
                      )}
                    </dd>
                  </div>
                </div>
                {/* Which one is better */}
                <div className="bg-neutral-100/50 rounded-lg px-2 md:px-4 py-4 grid grid-cols-6 max-md:grid-cols-1 gap-2 md:gap-4">
                  <dt className="text-sm md:text-base font-medium leading-6 text-gray-900 col-span-6 md:col-span-1 max-md:mb-2">
                    Which one is better? <span className="text-red-500 text-xs md:text-base">*</span>
                  </dt>
                  <dd className="w-full ml-0 mt-2 md:mt-0 text-xs md:text-sm leading-5 md:leading-6 text-gray-700 col-span-6 md:col-span-5">
                    {isEvaluationEnded ? (
                      <div>{QualityOptions.find(
                        (item) => item.value === evaluationResults.quality
                      )?.label}</div>
                    ) : (
                      <div className="flex flex-wrap gap-1 md:gap-4">
                        {QualityOptions.map((option) => (
                          <span
                            key={option.value}
                            onClick={() => onQualityChange(option.value)}
                            className={`flex justify-center px-2 md:px-4 py-1 md:py-2 text-xs md:text-sm font-base transition-colors duration-200 rounded-md cursor-pointer select-none ${evaluationResults.quality === option.value
                              ? "bg-blue-500 text-white hover:bg-blue-600"
                              : "bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-gray-300"
                              }`}
                          >
                            {option.label}
                          </span>
                        ))}
                      </div>
                    )}
                  </dd>
                </div>
                {/* <div className="bg-transparent px-2 md:px-4 py-2 md:py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-3">
                  <dt className="text-sm md:text-base font-medium leading-5 md:leading-6 text-green-900">Total Time A</dt>
                  <dd className="w-full ml-0 mt-0.5 md:mt-1 text-xs md:text-sm leading-5 md:leading-6 text-green-700 sm:col-span-2 sm:mt-0">
                    <div>{`${calculateTotalTime(ConversationDataL)}s`}</div>
                  </dd>
                </div>
                <div className="bg-transparent px-2 md:px-4 py-2 md:py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-3">
                  <dt className="text-sm md:text-base font-medium leading-5 md:leading-6 text-green-900">Total Time B</dt>
                  <dd className="w-full ml-0 mt-0.5 md:mt-1 text-xs md:text-sm leading-5 md:leading-6 text-green-700 sm:col-span-2 sm:mt-0">
                    <div>{`${calculateTotalTime(ConversationDataR)}s`}</div>
                  </dd>
                </div> 
                */}
                {/* Comments for A */}
                
              </dl>
            </div>
            <div className="mt-2">
              <details>
                <summary className="cursor-pointer font-medium text-base md:text-base px-2 md:px-0">
                  Advanced Evaluation (Optional)
                  <span className="animate-bounce-left ml-6 max-md:ml-2">
                    <FontAwesomeIcon icon={faHandPointLeft} color="green" />
                  </span>
                </summary>
                <div className="mt-4 pl-0 md:pl-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-4">
                  <div className="bg-transparent px-1 md:px-4 py-2 md:py-4 sm:grid sm:grid-cols-3 sm:gap-4">
                    <dt className="text-sm md:text-base font-medium leading-6 text-gray-900">
                      <div>Comments for A</div>
                      <div className="text-xs text-gray-400">Optional</div>
                    </dt>
                    <dd className="w-full ml-0 mt-1 md:mt-0 text-xs md:text-sm leading-5 md:leading-6 text-gray-700 sm:col-span-2 sm:mt-0">
                      {isEvaluationEnded ? (
                        <div>{evaluationResults.commentA}</div>
                      ) : (
                        <textarea
                          className="py-2 md:py-3 px-2 md:px-4 block w-full border-gray-200 rounded-lg text-xs md:text-sm focus:border-blue-500 focus:ring-blue-500"
                          rows={3}
                          placeholder="(Optional) You can leave your comments for Agent A here"
                          value={evaluationResults.commentA}
                          onChange={onCommentAChange}
                        />
                      )}
                    </dd>
                  </div>
                  {/* Comments for B */}
                  <div className="bg-transparent px-1 md:px-4 py-2 md:py-4 sm:grid sm:grid-cols-3 sm:gap-4">
                    <dt className="text-sm md:text-base font-medium leading-6 text-gray-900">
                      <div>Comments for B</div>
                      <div className="text-xs text-gray-400">Optional</div>
                    </dt>
                    <dd className="w-full ml-0 mt-1 md:mt-0 text-xs md:text-sm leading-5 md:leading-6 text-gray-700 sm:col-span-2 sm:mt-0">
                      {isEvaluationEnded ? (
                        <div>{evaluationResults.commentB}</div>
                      ) : (
                        <textarea
                          className="py-2 md:py-3 px-2 md:px-4 block w-full border-gray-200 rounded-lg text-xs md:text-sm focus:border-blue-500 focus:ring-blue-500"
                          rows={3}
                          placeholder="(Optional) You can leave your comments for Agent B here"
                          value={evaluationResults.commentB}
                          onChange={onCommentBChange}
                        />
                      )}
                    </dd>
                  </div>
                </div>
                  <div className="grid grid-cols-2 max-md:grid-cols-1 gap-2 bg-neutral-100/50 rounded-lg">

                    <div className="bg-transparent px-2 md:px-4 py-4 max-md:py-2 sm:grid sm:grid-cols-3 sm:gap-4">
                      <dt className="text-sm md:text-base font-medium leading-6 text-gray-900">Harmfulness A</dt>
                      <dd className="w-full ml-0 mt-1 md:mt-0 text-xs md:text-sm leading-5 md:leading-6 text-gray-700 sm:col-span-2 sm:mt-0">
                        {isEvaluationEnded ? (
                          <div>{HarmlessOptions.find(
                            (item) => item.value === evaluationResults.harmlessL
                          )?.label}</div>
                        ) : (
                          <div className="flex flex-col gap-1 md:gap-4">
                            {HarmlessOptions.map((option) => (
                              <label key={option.value} className="flex items-center">
                                <input
                                  type="radio"
                                  name="harmfulnessA"
                                  value={option.value}
                                  checked={evaluationResults.harmlessL === option.value}
                                  onChange={onHarmlessChangeL}
                                  className="mr-1 md:mr-2 w-3 h-3 md:w-4 md:h-4"
                                />
                                <span className="text-xs md:text-sm">{option.label}</span>
                              </label>
                            ))}
                          </div>
                        )}
                      </dd>
                    </div>
                    <div className="bg-transparent px-2 md:px-4 py-4 max-md:py-2 sm:grid sm:grid-cols-3 sm:gap-4">
                      <dt className="text-sm md:text-base font-medium leading-6 text-gray-900">Harmfulness B</dt>
                      <dd className="w-full ml-0 mt-1 md:mt-0 text-xs md:text-sm leading-5 md:leading-6 text-gray-700 sm:col-span-2 sm:mt-0">
                        {isEvaluationEnded ? (
                          <div>{HarmlessOptions.find(
                            (item) => item.value === evaluationResults.harmlessR
                          )?.label}</div>
                        ) : (
                          <div className="flex flex-col gap-1 md:gap-4">
                            {HarmlessOptions.map((option) => (
                              <label key={option.value} className="flex items-center">
                                <input
                                  type="radio"
                                  name="harmfulnessB"
                                  value={option.value}
                                  checked={evaluationResults.harmlessR === option.value}
                                  onChange={onHarmlessChangeR}
                                  className="mr-1 md:mr-2 w-3 h-3 md:w-4 md:h-4"
                                />
                                <span className="text-xs md:text-sm">{option.label}</span>
                              </label>
                            ))}
                          </div>
                        )}
                      </dd>
                    </div>



                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 bg-transparent rounded-lg">
                    {/* Efficiency A */}
                    <div className="bg-transparent px-2 md:px-4 py-4 max-md:py-2 sm:grid sm:grid-cols-3 sm:gap-4">
                      <dt className="text-sm md:text-base font-medium leading-6 text-gray-900">Efficiency A</dt>
                      <dd className="w-full ml-0 mt-1 md:mt-0 text-xs md:text-sm leading-5 md:leading-6 text-gray-700 sm:col-span-2 sm:mt-0">
                        {isEvaluationEnded ? (
                          <div>{EfficiencyOptions.find(
                            (item) => item.value === evaluationResults.efficiencyL
                          )?.label}</div>
                        ) : (
                          <div className="flex flex-col gap-1 md:gap-2">
                            {EfficiencyOptions.map((option) => (
                              <label key={option.value} className="flex items-center">
                                <input
                                  type="radio"
                                  name="efficiencyA"
                                  value={option.value}
                                  checked={evaluationResults.efficiencyL === option.value}
                                  onChange={onEfficiencyChangeL}
                                  className="mr-1 md:mr-2 w-3 h-3 md:w-4 md:h-4"
                                />
                                <span className="text-xs md:text-sm">{option.label}</span>
                              </label>
                            ))}
                          </div>
                        )}
                      </dd>
                    </div>

                    {/* Efficiency B */}
                    <div className="bg-transparent px-2 md:px-4 py-4 max-md:py-2 sm:grid sm:grid-cols-3 sm:gap-4">
                      <dt className="text-sm md:text-base font-medium leading-6 text-gray-900">Efficiency B</dt>
                      <dd className="w-full ml-0 mt-1 md:mt-0 text-xs md:text-sm leading-5 md:leading-6 text-gray-700 sm:col-span-2 sm:mt-0">
                        {isEvaluationEnded ? (
                          <div>{EfficiencyOptions.find(
                            (item) => item.value === evaluationResults.efficiencyR
                          )?.label}</div>
                        ) : (
                          <div className="flex flex-col gap-1 md:gap-2">
                            {EfficiencyOptions.map((option) => (
                              <label key={option.value} className="flex items-center">
                                <input
                                  type="radio"
                                  name="efficiencyB"
                                  value={option.value}
                                  checked={evaluationResults.efficiencyR === option.value}
                                  onChange={onEfficiencyChangeR}
                                  className="mr-1 md:mr-2 w-3 h-3 md:w-4 md:h-4"
                                />
                                <span className="text-xs md:text-sm">{option.label}</span>
                              </label>
                            ))}
                          </div>
                        )}
                      </dd>
                    </div>
                  </div>
                </div>
              </details>
            </div>
            {!isEvaluationEnded && (
              <div className="flex justify-center md:justify-end items-center m-2">
                <span
                  className={`rounded-full px-3 md:px-6 py-1 md:py-2 text-sm md:text-lg font-semibold ${requiredFieldsFilled
                    ? "bg-green-300 text-green-700 hover:bg-green-400 hover:text-green-800 cursor-pointer animate-breathing"
                    : "bg-gray-300 text-gray-500 cursor-not-allowed"
                    }`}
                  onClick={() => {
                    if (requiredFieldsFilled) {
                      handleSendEval(
                        evaluationResults.correctnessL,
                        evaluationResults.correctnessR,
                        evaluationResults.safetyL,
                        evaluationResults.safetyR,
                        evaluationResults.harmlessL,
                        evaluationResults.harmlessR,
                        evaluationResults.quality,
                        feedbacksL,
                        feedbacksR,
                        evaluationResults.commentA,
                        evaluationResults.commentB
                      );
                      showNotification(
                        "bottomLeft",
                        "success",
                        "Prolific Submission Complete - CRQP0NR2",
                        "Thank you for completing the task! Go to https://app.prolific.com/submissions/complete?cc=CRQP0NR2 to return to Prolific and submit your completion code.",
                        30000, // Show for 30 seconds
                      );
                    }
                  }}
                >
                  <span className="mr-1 md:mr-2">
                    <FontAwesomeIcon icon={faPaperPlane} />
                  </span>
                  Submit Results
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {isEvaluationEnded && (
        <div className="w-full grid grid-cols-2 gap-4 md:gap-8 mt-4 md:mt-6 px-4 md:px-12">
          <div className="flex justify-center items-center w-full">
            <span
              onClick={RestartConversation}
              className="flex justify-center max-w-[300px] min-w-[250px] items-center rounded-full px-3 md:px-6 py-1.5 md:py-2 text-sm md:text-base font-semibold bg-green-300 text-green-700 hover:bg-green-400 hover:text-green-800 transition-colors duration-200 cursor-pointer"
            >
              <span className="mr-1 md:mr-2">
                <FontAwesomeIcon icon={faArrowRotateRight} />
              </span>
              Restart
            </span>
          </div>
          <div className="flex justify-center items-center w-full">
            <span
              onClick={handleShare}
              className="flex justify-center max-w-[300px] min-w-[250px] items-center rounded-full px-3 md:px-6 py-1.5 md:py-2 text-sm md:text-base font-semibold bg-green-300 text-green-700 hover:bg-green-400 hover:text-green-800 transition-colors duration-200 cursor-pointer"
            >
              <span className="mr-1 md:mr-2">
                <FontAwesomeIcon icon={faShareNodes} />
              </span>
              Share Conversation
            </span>
          </div>
        </div>
      )}

      {/* Share Modal */}
      {isShareModalVisible && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            {/* Background overlay */}
            <div
              className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75"
              onClick={() => setIsShareModalVisible(false)}
            ></div>

            {/* Modal panel */}
            <div className="inline-block w-full max-w-[90%] max-h-[90%] justify-center items-center mt-[10vh] mb-[10vh] overflow-hidden text-left align-middle transition-all transform bg-gray-100 shadow-xl rounded-lg dark:bg-neutral-900">
              {/* Header */}
              <div className="px-6 max-md:px-3 py-4 max-md:py-2 border-b border-gray-200 dark:border-neutral-700">
                <div className="flex items-center justify-end">
                  <div className="flex items-center gap-2">
                    
                    <div className="inline-flex">
                      <a
                        href="#"
                        onClick={(e) => {
                          e.preventDefault();
                          handleShareConfirm();
                        }}
                        className="bg-black hover:bg-gray-800 inline-flex items-center gap-2 px-3.5 max-md:px-2.5 py-2 max-md:py-1.5 rounded-full transition-colors duration-200"
                        style={{
                          fontFamily:
                            '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
                        }}
                      >
                        <svg
                          className="w-6 h-6 max-md:w-5 max-md:h-5"
                          fill="white"
                          viewBox="0 0 1200 1227"
                        >
                          <path d="M714.163 519.284L1160.89 0H1055.03L667.137 450.887L357.328 0H0L468.492 681.821L0 1226.37H105.866L515.491 750.218L842.672 1226.37H1200L714.137 519.284H714.163ZM569.165 687.828L521.697 619.934L144.011 79.6944H306.615L611.412 515.685L658.88 583.579L1055.08 1150.3H892.476L569.165 687.854V687.828Z" />
                        </svg>
                        <span className="text-white font-bold text-[15px] max-md:text-[13px]">
                          Post
                        </span>
                      </a>
                    </div>
                    <div className="flex items-center gap-2">
                      <a
                        onClick={handleCopyShareLink}
                        className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-300 rounded-full hover:bg-gray-50 cursor-pointer"
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M16 12C16 14.2091 14.2091 16 12 16C9.79086 16 8 14.2091 8 12C8 9.79086 9.79086 8 12 8C14.2091 8 16 9.79086 16 12ZM16 12V13.5C16 14.8807 17.1193 16 18.5 16V16C19.8807 16 21 14.8807 21 13.5V12C21 7.02944 16.9706 3 12 3C7.02944 3 3 7.02944 3 12C3 16.9706 7.02944 21 12 21H16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                        Share
                      </a>
                    </div>
                    <div className="flex items-center gap-2">
                      <a
                        onClick={() => setIsShareModalVisible(false)}
                        className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-300 rounded-full hover:bg-gray-50 cursor-pointer"
                      >
                        Cancel
                      </a>
                    </div>
                  </div>
                </div>
              </div>

              {/* Content */}
              <div
                className="px-6 max-md:px-3 py-4 max-md:py-2 max-h-[80vh] overflow-y-auto"
                ref={sharePreviewRef}
              >
                <ConversationSharePreview
                  leftData={ConversationDataL}
                  rightData={ConversationDataR}
                  agent={agent}
                  vlm={vlm}
                  evaluationResults={evaluationResults}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  ) : null;
};

export default Eval;
