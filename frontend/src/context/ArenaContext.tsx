import React, {
    createContext,
    useContext,
    useState,
    ReactNode,
    useEffect,
} from "react";
import { useAuth } from "./AuthContext";
import { isMobile } from 'react-device-detect';

export interface Feedback {
    status: boolean | null;
    index: number;
    options?: string[];
    comment?: string;
  }

interface RuntimeStatus {
    status: string;
    obs_time: number;
    predict_time: number;
    step_time: number;
    completed: boolean;
}

// Define evaluation results interface
interface EvaluationResults {
    correctnessL?: number;
    correctnessR?: number;
    safetyL?: number;
    safetyR?: number;
    harmlessL?: number;
    harmlessR?: number;
    quality?: number;
    commentA?: string;
    commentB?: string;
    successL?: number;
    successR?: number;
    efficiencyL?: number;
    efficiencyR?: number;
}

// Define a conversation entry interface that includes isThinking
interface ConversationEntry {
    type: string;
    name: string;
    content: {
        title?: string;
        time?: string | number;
        image?: string;
        description?: string;
        agent_time?: string | number;
        env_time?: string | number;
        obs_time?: string | number;
        token?: string | number;
        action?: string;
        visualization?: string;
    }[];
    isThinking?: boolean;
}

interface ArenaContextType {
    os: string | undefined;
    setOs: (value: string | undefined) => void;
    agent: string[] | undefined;
    setAgent: (value: string[] | undefined) => void;
    vlm: string[] | undefined;
    setVlm: (value: string[] | undefined) => void;
    chat_id: string | undefined;
    setChat_id: (value: string | undefined) => void;
    message: string;
    setMessage: (value: string) => void;
    messageLeft: string;
    setMessageLeft: (value: string) => void;
    messageRight: string;
    setMessageRight: (value: string) => void;
    SetupOptions: {};
    setSetupOptions: (value: {}) => void;
    ConversationData: ConversationEntry[]
    setConversationData: (value: ConversationEntry[]) => void;
    ConversationDataL: ConversationEntry[]
    setConversationDataL: (value: ConversationEntry[]) => void;
    ConversationDataR: ConversationEntry[]
    setConversationDataR: (value: ConversationEntry[]) => void;
    responsive: boolean;
    setResponsive: (value: boolean) => void;
    currentState: ConversationState;
    setCurrentState: (value: ConversationState) => void;
    currentStateL: ConversationState;
    setCurrentStateL: (value: ConversationState) => void;
    currentStateR: ConversationState;
    setCurrentStateR: (value: ConversationState) => void;
    isInactive: boolean;
    setIsInactive: (value: boolean) => void;
    isInitial: boolean;
    setIsInitial: (value: boolean) => void;
    isInConversation: boolean;
    setIsInConversation: (value: boolean) => void;
    isConversationEnded: boolean;
    setIsConversationEnded: (value: boolean) => void;
    isConversationStopped: boolean;
    setIsConversationStopped: (value: boolean) => void;
    isEvaluationEnded: boolean;
    setIsEvaluationEnded: (value: boolean) => void;
    isVncConnected: boolean;
    setIsVncConnected: (value: boolean) => void;
    VncIp: string | undefined;
    setVncIp: (value: string | undefined) => void;
    VncIpL: string | undefined;
    setVncIpL: (value: string | undefined) => void;
    VncIpR: string | undefined;
    VncPortL: number | undefined;
    setVncPortL: (value: number | undefined) => void;
    setVncIpR: (value: string | undefined) => void;
    VncPortR: number | undefined;
    setVncPortR: (value: number | undefined) => void;
    // onClick={RestartConversation()
    RestartConversation: () => void;
    StopConversation: () => void;
    Disconnect: () => void;
    IsWaiting: boolean;
    SetIsWaiting: (value: boolean) => void;
    WaitingMessage: string;
    SetWaitingMessage: (value: string) => void;
    isTutorialOpen: boolean;
    setIsTutorialOpen: (value: boolean) => void;
    isBannerOpen: boolean;
    setIsBannerOpen: (value: boolean) => void;
    isExampleOpen: boolean;
    setIsExampleOpen: (value: boolean) => void;
    currentStatusL: RuntimeStatus;
    setCurrentStatusL: (value: RuntimeStatus) => void;
    currentStatusR: RuntimeStatus;
    setCurrentStatusR: (value: RuntimeStatus) => void;
    statusHistoryL: RuntimeStatus[];
    setStatusHistoryL: (value: RuntimeStatus[]) => void;
    statusHistoryR: RuntimeStatus[];
    setStatusHistoryR: (value: RuntimeStatus[]) => void;
    feedbacksL: Feedback[][];
    setFeedbacksL: React.Dispatch<React.SetStateAction<Feedback[][]>>;
    feedbacksR: Feedback[][];
    setFeedbacksR: React.Dispatch<React.SetStateAction<Feedback[][]>>;
    isSpecialEnv: boolean;
    setIsSpecialEnv: (value: boolean) => void;
    isInConversationL: boolean;
    setIsInConversationL: (value: boolean) => void;
    isInConversationR: boolean;
    setIsInConversationR: (value: boolean) => void;
    isConversationEndedL: boolean;
    setIsConversationEndedL: (value: boolean) => void;
    isConversationEndedR: boolean;
    setIsConversationEndedR: (value: boolean) => void;
    evaluationResults: EvaluationResults;
    setEvaluationResults: (results: EvaluationResults) => void;
    isShareModalVisible: boolean;
    setIsShareModalVisible: (value: boolean) => void;
}

const ArenaContext = createContext<ArenaContextType | undefined>(undefined);

export enum ConversationState {
    Inactive,
    Initial,
    InConversation,
    ConversationEnded,
    ConversationStopped,
    EvaluationEnded
}
export const ArenaProvider: React.FC<{ children: ReactNode }> = ({
    children,
}) => {
    const { socketService, user_id, isFirstUser } = useAuth();
    const [isSpecialEnv, setIsSpecialEnv] = useState(true);

    const [os, setOs] = useState<string | undefined>("Windows");
    const [agent, setAgent] = useState<string[] | undefined>([]);
    const [vlm, setVlm] = useState<string[] | undefined>([]);
    const [chat_id, setChat_id] = useState<string | undefined>();
    const [message, setMessage] = useState("");
    const [messageLeft, setMessageLeft] = useState("");
    const [messageRight, setMessageRight] = useState("");
    const [SetupOptions, setSetupOptions] = useState({});
    const [ConversationData, setConversationData] = useState<ConversationEntry[]>([]);
    const [ConversationDataL, setConversationDataL] = useState<ConversationEntry[]>([]);
    const [ConversationDataR, setConversationDataR] = useState<ConversationEntry[]>([]);
    const [responsive, setResponsive] = useState(isMobile);
    const [currentState, setCurrentState] = useState<ConversationState>(
        ConversationState.Inactive
    );
    const [currentStateL, setCurrentStateL] = useState<ConversationState>(
        ConversationState.Inactive
    );
    const [currentStateR, setCurrentStateR] = useState<ConversationState>(
        ConversationState.Inactive
    );
    const [isInactive, setIsInactive] = useState(true);
    const [isInitial, setIsInitial] = useState(false);
    const [isInConversation, setIsInConversation] = useState(false);
    const [isConversationEnded, setIsConversationEnded] = useState(false);
    const [isConversationStopped, setIsConversationStopped] = useState(false);
    const [isEvaluationEnded, setIsEvaluationEnded] = useState(false);
    const [isVncConnected, setIsVncConnected] = useState(false);
    const [VncIp, setVncIp] = useState<string | undefined>();
    const [VncIpL, setVncIpL] = useState<string | undefined>();
    const [VncIpR, setVncIpR] = useState<string | undefined>();
    const [VncPortL, setVncPortL] = useState<number | undefined>();
    const [VncPortR, setVncPortR] = useState<number | undefined>();
    const [IsWaiting, SetIsWaiting] = useState(false);
    const [WaitingMessage, SetWaitingMessage] = useState("");
    const [isTutorialOpen, setIsTutorialOpen] = useState(false);
    const [isBannerOpen, setIsBannerOpen] = useState(true);
    const [isExampleOpen, setIsExampleOpen] = useState(true);
    const [currentStatusL, setCurrentStatusL] = useState<RuntimeStatus>({
        status: '',
        obs_time: 0,
        predict_time: 0,
        step_time: 0,
        completed: false
    });
    const [currentStatusR, setCurrentStatusR] = useState<RuntimeStatus>({
        status: '',
        obs_time: 0,
        predict_time: 0,
        step_time: 0,
        completed: false
    });
    const [statusHistoryL, setStatusHistoryL] = useState<RuntimeStatus[]>([]);
    const [statusHistoryR, setStatusHistoryR] = useState<RuntimeStatus[]>([]);
    const [feedbacksL, setFeedbacksL] = useState<Feedback[][]>([[]]);
    const [feedbacksR, setFeedbacksR] = useState<Feedback[][]>([[]]);
    const [isInConversationL, setIsInConversationL] = useState(false);
    const [isInConversationR, setIsInConversationR] = useState(false);
    const [isConversationEndedL, setIsConversationEndedL] = useState(false);
    const [isConversationEndedR, setIsConversationEndedR] = useState(false);
    const [evaluationResults, setEvaluationResults] = useState<EvaluationResults>({});
    const [isShareModalVisible, setIsShareModalVisible] = useState(false);

    useEffect(() => {
        if (currentStateL === ConversationState.ConversationEnded && currentStateR === ConversationState.ConversationEnded) {
            setCurrentState(ConversationState.ConversationEnded);
        }
        setIsInactive((currentState === ConversationState.Inactive) || ((currentStateL === ConversationState.Inactive) && (currentStateR === ConversationState.Inactive)));
        setIsInitial((currentState === ConversationState.Initial) || ((currentStateL === ConversationState.Initial) && (currentStateR === ConversationState.Initial)));
        setIsInConversation((currentState === ConversationState.InConversation) || ((currentStateL === ConversationState.InConversation) && (currentStateR === ConversationState.InConversation)) || ((currentStateL === ConversationState.ConversationEnded) && (currentStateR === ConversationState.InConversation)) || ((currentStateL === ConversationState.InConversation) && (currentStateR === ConversationState.ConversationEnded)));
        setIsConversationEnded((currentState === ConversationState.ConversationEnded) || ((currentStateL === ConversationState.ConversationEnded) && (currentStateR === ConversationState.ConversationEnded)));
        setIsConversationStopped((currentState === ConversationState.ConversationStopped) || ((currentStateL === ConversationState.ConversationStopped) && (currentStateR === ConversationState.ConversationStopped)));
        setIsEvaluationEnded((currentState === ConversationState.EvaluationEnded) || ((currentStateL === ConversationState.EvaluationEnded) && (currentStateR === ConversationState.EvaluationEnded)));
        setIsInConversationL(currentStateL === ConversationState.InConversation);
        setIsInConversationR(currentStateR === ConversationState.InConversation);
        setIsConversationEndedL(currentStateL === ConversationState.ConversationEnded);
        setIsConversationEndedR(currentStateR === ConversationState.ConversationEnded);
    }, [currentState, currentStateL, currentStateR]);
    useEffect(() => {
        setCurrentState(ConversationState.Initial);
        return () => {
            setCurrentState(ConversationState.Inactive);
        };
    }, []);
    useEffect(() => {
        if (isInitial) {
            setIsExampleOpen(true);
        } else {
            setIsExampleOpen(false);
        }
    }, [isInitial]);

    useEffect(() => {
        if (isFirstUser) {
            setIsBannerOpen(false);
        } else {
            setIsBannerOpen(false);
        }
    }, [isFirstUser]);
    useEffect(() => {
        console.log(feedbacksL.flat());
    }, [feedbacksL]);

    useEffect(() => {
        const handleStatusUpdate = (data: any, position: 'left' | 'right') => {
            if (data.user_id === user_id) {
                const setCurrentStatus = position === 'left' ? setCurrentStatusL : setCurrentStatusR;
                const setStatusHistory = position === 'left' ? setStatusHistoryL : setStatusHistoryR;

                setCurrentStatus(prev => {
                    const newStatus = {
                        ...prev,
                        status: data.content.status,
                        obs_time: data.content.obs_time || prev.obs_time,
                        predict_time: data.content.predict_time || prev.predict_time,
                        step_time: data.content.step_time || prev.step_time,
                    };

                    const isCompleted = newStatus.obs_time > 0 && 
                                        newStatus.predict_time > 0 && 
                                        newStatus.step_time > 0;

                    if (isCompleted && !prev.completed) {
                        setStatusHistory(history => [...history, { ...newStatus, completed: true }]);
                        return {
                            status: '',
                            obs_time: 0,
                            predict_time: 0,
                            step_time: 0,
                            completed: false,
                        };
                    }

                    return { ...newStatus, completed: false };
                });
            }
        };

        socketService.Listen('message_agent_runtime_status_left', 
            (data) => handleStatusUpdate(data, 'left')
        );
        socketService.Listen('message_agent_runtime_status_right', 
            (data) => handleStatusUpdate(data, 'right')
        );

        return () => {
            socketService.Unlisten('message_agent_runtime_status_left');
            socketService.Unlisten('message_agent_runtime_status_right');
        };
    }, [user_id, socketService]);

    

    const RestartConversation = async () => {
        //将这里的所有变量都设置为初始值
        const UserData = {
            user_id: user_id,
            chat_id: chat_id,
        }
        await socketService.Send("clean_up_and_setup_new_conversation", UserData);
        setOs("Ubuntu");
        setAgent([]);
        setVlm([]);
        setChat_id(undefined);
        setMessage("");
        setMessageLeft("");
        setMessageRight("");
        setSetupOptions({});
        setConversationData([]);
        setConversationDataL([]);
        setConversationDataR([]);
        setResponsive(false);
        setCurrentState(ConversationState.Inactive);
        setCurrentStateL(ConversationState.Inactive);
        setCurrentStateR(ConversationState.Inactive);
        setVncIp(undefined);
        setVncIpL(undefined);
        setVncIpR(undefined);
        setVncPortL(undefined);
        setVncPortR(undefined);
        setIsVncConnected(false);
        SetIsWaiting(false);
        SetWaitingMessage("");
        setCurrentStatusL({
            status: '',
            obs_time: 0,
            predict_time: 0,
            step_time: 0,
            completed: false
        });
        setCurrentStatusR({
            status: '',
            obs_time: 0,
            predict_time: 0,
            step_time: 0,
            completed: false
        });
        setStatusHistoryL([]);
        setStatusHistoryR([]);
        setFeedbacksL([[]]);
        setFeedbacksR([[]]);
        setEvaluationResults({});
        setIsShareModalVisible(false);
    };
    const StopConversation = () => {
        if (currentStateL !== ConversationState.ConversationEnded) {
            setCurrentStateL(ConversationState.ConversationEnded);
        }
        if (currentStateR !== ConversationState.ConversationEnded) {
            setCurrentStateR(ConversationState.ConversationEnded);
        }
        if (currentState !== ConversationState.ConversationEnded) {
            setCurrentState(ConversationState.ConversationEnded);
        }
        socketService.Send("stop_execution", { user_id: user_id, chat_id: chat_id });
    };
    
    const Disconnect = async () => {
        //将这里的所有变量都设置为初始值
        await socketService.Send("terminal_clean_up", { user_id: user_id, chat_id: chat_id });
        setOs("Ubuntu");
        setAgent([]);
        setVlm([]);
        setChat_id(undefined);
        setMessage("");
        setMessageLeft("");
        setMessageRight("");
        setSetupOptions({});
        setConversationData([]);
        setConversationDataL([]);
        setConversationDataR([]);
        setResponsive(false);
        setCurrentState(ConversationState.Inactive);
        setCurrentStateL(ConversationState.Inactive);
        setCurrentStateR(ConversationState.Inactive);
        setVncIp(undefined);
        setVncIpL(undefined);
        setVncIpR(undefined);
        setVncPortL(undefined);
        setVncPortR(undefined);
        setIsVncConnected(false);
        SetIsWaiting(false);
        SetWaitingMessage("");
        setCurrentStatusL({
            status: '',
            obs_time: 0,
            predict_time: 0,
            step_time: 0,
            completed: false
        });
        setCurrentStatusR({
            status: '',
            obs_time: 0,
            predict_time: 0,
            step_time: 0,
            completed: false
        });
        setStatusHistoryL([]);
        setStatusHistoryR([]);
        setFeedbacksL([[]]);
        setFeedbacksR([[]]);
        setEvaluationResults({});
        setIsShareModalVisible(false);
    }
    return (
        <ArenaContext.Provider
            value={{
                os,
                setOs,
                agent,
                setAgent,
                vlm,
                setVlm,
                chat_id,
                setChat_id,
                message,
                setMessage,
                messageLeft,
                setMessageLeft,
                messageRight,
                setMessageRight,
                SetupOptions,
                setSetupOptions,
                ConversationData,
                setConversationData,
                ConversationDataL,
                setConversationDataL,
                ConversationDataR,
                setConversationDataR,
                responsive,
                setResponsive,
                currentState,
                setCurrentState,
                currentStateL,
                setCurrentStateL,
                currentStateR,
                setCurrentStateR,
                isInactive,
                setIsInactive,
                isInitial,
                setIsInitial,
                isInConversation,
                setIsInConversation,
                isConversationEnded,
                setIsConversationEnded,
                isConversationStopped,
                setIsConversationStopped,
                isEvaluationEnded,
                setIsEvaluationEnded,
                isVncConnected,
                setIsVncConnected,
                VncIp,
                setVncIp,
                VncIpL,
                setVncIpL,
                VncIpR,
                setVncIpR,
                VncPortL,
                setVncPortL,
                VncPortR,
                setVncPortR,
                RestartConversation,
                StopConversation,
                Disconnect,
                IsWaiting,
                SetIsWaiting,
                WaitingMessage,
                SetWaitingMessage,
                isTutorialOpen,
                setIsTutorialOpen,
                isBannerOpen,
                setIsBannerOpen,
                isExampleOpen,
                setIsExampleOpen,
                currentStatusL,
                setCurrentStatusL,
                currentStatusR,
                setCurrentStatusR,
                statusHistoryL,
                setStatusHistoryL,
                statusHistoryR,
                setStatusHistoryR,
                feedbacksL,
                setFeedbacksL,
                feedbacksR,
                setFeedbacksR,
                isSpecialEnv,
                setIsSpecialEnv,
                isInConversationL,
                setIsInConversationL,
                isInConversationR,
                setIsInConversationR,
                isConversationEndedL,
                setIsConversationEndedL,
                isConversationEndedR,
                setIsConversationEndedR,
                evaluationResults,
                setEvaluationResults,
                isShareModalVisible,
                setIsShareModalVisible,
            }}
        >
            {children}
        </ArenaContext.Provider>
    );
};

export const useArena = () => {
    const context = useContext(ArenaContext);
    if (context === undefined) {
        throw new Error("ArenaAuth must be used within an ArenaProvider");
    }
    return context;
};
