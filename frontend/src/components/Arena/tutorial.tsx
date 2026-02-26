import React, { useState } from "react";
import { Alert, Button, Divider, Modal, Steps } from "antd";
import {
    faArrowPointer,
    faCircleInfo,
    faFile,
    faKeyboard,
    faScroll,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { PageContainer, ProCard } from "@ant-design/pro-components";
import { useArena } from "../../context/ArenaContext";
import { Flex, Image, Tag } from "antd";

import Gif1 from "../../task_examples/examples/example0.gif";
import Gif2 from "../../task_examples/examples/example1.gif";
import Gif3 from "../../task_examples/examples/example2.gif";
import Gif4 from "../../task_examples/examples/example3.gif";
import Gift5 from "../../task_examples/examples/example4.gif";
import Gift6 from "../../task_examples/examples/example5.gif";
import Gift7 from "../../task_examples/examples/example6.gif";
import Gift8 from "../../task_examples/examples/example7.gif";
import Gift9 from "../../task_examples/examples/example8.gif";

interface PromptOptions {
    options: {
        name: string | undefined;
        path: string;
        tag: string[];
        difficalty: string;
    };
}
const Prompt: React.FC<PromptOptions> = ({ options }) => {
    const selectFIGfromPath = (path: string) => {
        switch (path) {
            case "../../task_examples/examples/example0.gif":
                return Gif1;
            case "../../task_examples/examples/example1.gif":
                return Gif2;
            case "../../task_examples/examples/example2.gif":
                return Gif3;
            case "../../task_examples/examples/example3.gif":
                return Gif4;
            case "../../task_examples/examples/example4.gif":
                return Gift5;
            case "../../task_examples/examples/example5.gif":
                return Gift6;
            case "../../task_examples/examples/example6.gif":
                return Gift7;
            case "../../task_examples/examples/example7.gif":
                return Gift8;
            case "../../task_examples/examples/example8.gif":
                return Gift9;
        }
    };
    const selectColorfromTag = (tag: string) => {
        switch (tag) {
            case "os":
                return "green";
            case "multi_apps":
                return "blue";
            case "libreoffice_writer":
                return "red";
            default:
                return "lime";
        }
    };
    return (
        <ProCard
            bordered
            style={{ backgroundColor: "white" }}
            direction="row"
            gutter={16}
        >
            <ProCard colSpan="25%" ghost>
                {/* <img src=根据path来决定src是Gif1还是其他 /> */}
                <Image
                    src={selectFIGfromPath(options.path)}
                    alt="example"
                    style={{ width: "100%" }}
                />
            </ProCard>
            <ProCard colSpan="auto" ghost>
                <div style={{ fontSize: "12px" }}>{options.name}</div>
                <Flex gap="4px 0" wrap="wrap">
                    {options.tag.map((tag, index) => {
                        return (
                            <Tag color={selectColorfromTag(tag)} style={{ fontSize: "12px" }}>
                                {tag}
                            </Tag>
                        );
                    })}
                </Flex>
            </ProCard>
        </ProCard>
    );
};
const Tutorial: React.FC = () => {
    const { isTutorialOpen, setIsTutorialOpen, responsive } = useArena();
    const [current, setCurrent] = useState(0);
    const onChange = (value: number) => {
        // console.log("onChange:", value);
        setCurrent(value);
    };
    const task_examples = require("../../task_examples/all.json");

    return (
        <>
            <Modal
                title={
                    <div style={{ fontSize: responsive ? "medium" : "large" }} className="font-bold">
                        <FontAwesomeIcon icon={faCircleInfo} /> Tutorial
                    </div>
                }
                centered
                open={isTutorialOpen}
                onOk={() => setIsTutorialOpen(false)}
                onCancel={() => setIsTutorialOpen(false)}
                width={responsive ? "90%" : "80%"}
            >
                <ProCard direction={responsive ? "column" : "row"} style={{ height: responsive ? "80vh" : "75vh" }}>
                    <ProCard colSpan={responsive ? "100%" : "25%"}>
                        <Steps
                            current={current}
                            onChange={onChange}
                            type={responsive ? "inline" : "default"}
                            size={responsive ? "small" : "default"}
                            direction={responsive ? "horizontal" : "vertical"}
                            items={[
                                {
                                    title: "Computer",
                                    description: responsive ? "" : "Set up your computer"
                                },
                                {
                                    title: "Task",
                                    description: responsive ? "" : "choose a task",
                                },
                                {
                                    title: "Output",
                                    description: responsive ? "" : "Observe the output",
                                },
                                {
                                    title: "Evaluation",
                                    description: responsive ? "" : "Evaluate the process",
                                },
                                {
                                    title: "Leaderboard",
                                    description: responsive ? "" : "Check the most powerful VLM Agents",
                                },
                            ]}
                            style={{ marginBlockStart: responsive ? "5%" : "25%" }}
                        />
                    </ProCard>
                    <Divider type="vertical" style={{ height: "75vh" }} />
                    <ProCard
                        colSpan="auto"
                        style={{ maxHeight: "70vh", overflow: "auto", }}
                    >
                        {current === 0 && (
                            <ProCard direction="column" style={{ backgroundColor: "white", padding: responsive ? "5%" : "2.5%" }}>
                                <h1>Step 1: Get to know your computer</h1>
                                <h2>Computers</h2>
                                <p>
                                    We would allocate you with 2 computers on top of the
                                    interface.
                                </p>
                                <div
                                    style={{
                                        width: "100%",
                                        display: "flex",
                                        justifyContent: "center",
                                    }}
                                >
                                    <img
                                        src={require("../../assets/tutorial/computer.png")}
                                        style={{ width: "75%" }}
                                        alt="tutorial trajectory"
                                    />
                                </div>
                                <p>
                                    They are real virtual computers like your PC, and the agent
                                    would execute in these environments.
                                </p>
                                <h2>Operating System</h2>
                                <p>
                                    Currently we support 3 Operating Systems as shown below to
                                    best simulate real computer environment:
                                </p>
                                <div
                                    style={{
                                        width: "100%",
                                        display: "flex",
                                        justifyContent: "center",
                                    }}
                                >
                                    <img
                                        src={require("../../assets/tutorial/OS.gif")}
                                        style={{ width: "80%" }}
                                        alt="tutorial trajectory"
                                    />
                                </div>
                                <Alert
                                    message="📌 Note: Only Ubuntu is supported at the moment, Windows and MacOS computers are on the road."
                                    type="warning"
                                />
                                <h2>Simple Setup</h2>
                                <p>You can freely edit the computers whatever you want.</p>
                                <div
                                    style={{
                                        width: "100%",
                                        display: "flex",
                                        justifyContent: "center",
                                    }}
                                >
                                    <img
                                        src={require("../../assets/tutorial/settings.png")}
                                        style={{ width: "100%" }}
                                        alt="tutorial trajectory"
                                    />
                                </div>
                                <p>
                                    1, You can explore the computer by{" "}
                                    <Button
                                        type="dashed"
                                        size="small"
                                        icon={<FontAwesomeIcon icon={faArrowPointer} />}
                                    >
                                        Click
                                    </Button>
                                    <Button
                                        type="dashed"
                                        size="small"
                                        icon={<FontAwesomeIcon icon={faKeyboard} />}
                                    >
                                        Type
                                    </Button>{" "}
                                    or do any other operations just like your own PC;
                                </p>
                                <p>
                                    2, You can
                                    <Button
                                        type="dashed"
                                        size="small"
                                        icon={<FontAwesomeIcon icon={faScroll} />}
                                    >
                                        Drag
                                    </Button>{" "}
                                    your local file <FontAwesomeIcon icon={faFile} /> over the
                                    computers to upload it.
                                </p>
                            </ProCard>
                        )}
                        {current === 1 && (
                            <ProCard direction="column" style={{ backgroundColor: "white", padding: responsive ? "5%" : "2.5%" }}>
                                <h1>Step 2: Choose a Task</h1>
                                <h2>Task</h2>
                                <p>
                                    To best evaluate the VLMs and agents, you can freely customize
                                    a task instruction for the agent to execute on the computer.
                                </p>
                                <p>Here are a few examples:</p>
                                <div
                                    style={{
                                        maxHeight: "25vh",
                                        overflow: "auto",
                                        display: "flex",
                                        flexDirection: "column",
                                    }}
                                >
                                    {task_examples.map((task: any, index: number) => {
                                        return <Prompt options={task}></Prompt>;
                                    }
                                    )}
                                </div>
                                <Alert
                                    message=" 📌 Note: The difficulty of the task is positively correlated with the performance of the VLM Agent"
                                    type="warning"
                                />
                                <h2>Input</h2>
                                <p>
                                    Type your instruction in the input box and click "Send" to
                                    send the instruction to the VLM agents.
                                </p>
                                <div
                                    style={{
                                        width: "100%",
                                        display: "flex",
                                        justifyContent: "center",
                                    }}
                                >
                                    <img
                                        src={require("../../assets/tutorial/input.png")}
                                        style={{ width: "100%", margin: "2.5%" }}
                                        alt="tutorial trajectory"
                                    />
                                </div>
                                <p>
                                    Once you send the instruction, we would randomly allocate 2
                                    VLM agents to execute the task on both sides correspondingly.
                                </p>
                                <div
                                    style={{
                                        width: "100%",
                                        display: "flex",
                                        justifyContent: "center",
                                    }}
                                >
                                    <img
                                        src={require("../../assets/tutorial/anonymous.png")}
                                        style={{ width: "75%", margin: "2.5%" }}
                                        alt="tutorial trajectory"
                                    />
                                </div>
                                <Alert
                                    message=" ❗️Remember: The 2 VLM agents stay anonymous while executing the task, only if you finish the evaluation, the details of the VLM agents are revealed."
                                    type="error"
                                />
                            </ProCard>
                        )}
                        {current === 2 && (
                            <ProCard direction="column" style={{ backgroundColor: "white", padding: responsive ? "5%" : "2.5%" }}>
                                <h1>Step 3: Observe the output</h1>
                                <h2>Trajectory</h2>
                                <p>
                                    Once you had sent the instruction, you can observe the trajectory output of the VLM agents on the computer.
                                </p>
                                <div
                                    style={{
                                        width: "100%",
                                        display: "flex",
                                        justifyContent: "center",
                                    }}
                                >
                                    <img
                                        src={require("../../assets/tutorial/traj.gif")}
                                        style={{ width: "90%", margin: "2.5%" }}
                                        alt="tutorial trajectory"
                                    />
                                </div>
                                <h2>Step Structure</h2>
                                <div
                                    style={{
                                        width: "100%",
                                        display: "flex",
                                        justifyContent: "center",
                                    }}
                                >
                                    <img
                                        src={require("../../assets/tutorial/step.png")}
                                        style={{ width: "100%", margin: "2.5%" }}
                                        alt="tutorial trajectory"
                                    />
                                </div>
                            </ProCard>
                        )}
                        {current === 3 && (
                            <ProCard direction="column" style={{ backgroundColor: "white", padding: responsive ? "5%" : "2.5%" }}>
                                <h1>Step 4: Evaluate the VLM Agent</h1>
                                <Alert
                                    message=" ❓Have you observed the Agent executing process? How do you feel about it?"
                                    type="warning"
                                />
                                <h2>Evaluation</h2>
                                <p>
                                    Computer Agent Arena serves as a platform for competition, so it's time for you to judge the performance of them!
                                </p>
                                <div
                                    style={{
                                        width: "100%",
                                        display: "flex",
                                        justifyContent: "center",
                                    }}
                                >
                                    <img
                                        src={require("../../assets/tutorial/eval.png")}
                                        style={{ width: "100%", margin: "2.5%" }}
                                        alt="tutorial trajectory"
                                    />
                                </div>
                                <p>Please finish these evaluation options and finally decide "which one is better", that's very important to us~</p>
                                <Alert
                                    message=" Note: Once you have finished the evaluation and submitted the form, the 2 anonymous VLM agents would be revealed."
                                    type="warning"
                                />
                                <h2>Step-wise Evaluation (Optional)</h2>
                                <p>If you are interested in contributing more comments on the VLM Agents, your kind feedback on step-wise evaluation would be highly appreciated!</p>
                                <div
                                    style={{
                                        width: "100%",
                                        display: "flex",
                                        justifyContent: "center",
                                    }}
                                >
                                    <img
                                        src={require("../../assets/tutorial/eval_step.png")}
                                        style={{ width: "80%", margin: "2.5%" }}
                                        alt="tutorial trajectory"
                                    />
                                </div>
                            </ProCard>
                        )}
                        {current === 4 && (
                            <ProCard direction="column" style={{ backgroundColor: "white", padding: responsive ? "5%" : "2.5%" }}>
                                <h1>Finally: Let's see the 🏆leaderboard</h1>
                                <Alert
                                    message="Ever wondered which one is the champion VLM Agent? Let's check it out!"
                                    type="error"
                                />
                                <p>
                                    Click on the ranking tab to check out which VLM Agent is the king👑！
                                </p>
                                <div
                                    style={{
                                        width: "100%",
                                        display: "flex",
                                        justifyContent: "center",
                                    }}
                                >
                                    <img
                                        src={require("../../assets/tutorial/leaderboard.png")}
                                        style={{ width: "100%", margin: "2.5%" }}
                                        alt="tutorial trajectory"
                                    />
                                </div>
                            </ProCard>
                        )}
                    </ProCard>
                </ProCard>
            </Modal >
        </>
    );
};

export default Tutorial;
