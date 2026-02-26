import React, { useEffect, useState } from "react";
import {
    faArrowsRotate,

    faXmark,
} from "@fortawesome/free-solid-svg-icons";
import { Flex, Image, Tag } from 'antd';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { PageContainer, ProCard } from "@ant-design/pro-components";
import Gif1 from "../../task_examples/examples/example0.gif"
import Gif2 from "../../task_examples/examples/example1.gif"
import Gif3 from "../../task_examples/examples/example2.gif"
import Gif4 from "../../task_examples/examples/example3.gif"
import Gift5 from "../../task_examples/examples/example4.gif"
import Gift6 from "../../task_examples/examples/example5.gif"
import Gift7 from "../../task_examples/examples/example6.gif"
import Gift8 from "../../task_examples/examples/example7.gif"
import Gift9 from "../../task_examples/examples/example8.gif"
import { useArena } from "../../context/ArenaContext";
interface PromptOptions {
    options: {
        name: string | undefined;
        path: string;
        tag: string[];
        difficalty: string;
    }
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
    }
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
    }
    return (
        <ProCard bordered style={{ margin: "1%", backgroundColor: "white" }} direction="row" gutter={16}>
            <ProCard colSpan="25%" ghost>
                <Image src={selectFIGfromPath(options.path)} alt="example" style={{ width: "100%" }} />
            </ProCard>
            <ProCard colSpan="auto" ghost>

                <div style={{ fontSize: "12px" }}>{options.name}</div>
                <Flex gap="4px 0" wrap="wrap">
                    {options.tag.map((tag, index) => {
                        return (
                            <Tag color={selectColorfromTag(tag)} style={{ fontSize: "12px" }}>{tag}</Tag>
                        );
                    })}
                </Flex>
            </ProCard>
        </ProCard >
    );
};
const PromptTutorial: React.FC = () => {
    const task_examples: [] = require("../../task_examples/all.json");
    const task_examples_length: number = task_examples.length;
    const [random, setRandom] = useState<number[]>([0, 1, 2, 7]);
    const handleRefresh = () => {
        let indices = new Set();
        while (indices.size < 4) {
            indices.add(Math.floor(Math.random() * task_examples_length));
        }
        let uniqueIndices: number[] = Array.from(indices) as number[];
        setRandom(uniqueIndices);
    };
    const { isExampleOpen, setIsExampleOpen, isInitial } = useArena();
    return (
        isExampleOpen && isInitial ? (
            <ProCard
                direction="row"
                title="Task Examples"
                bordered
                style={{ width: "100%", backgroundColor: "white" }}
                gutter={8}
                extra={
                    <div>
                        <FontAwesomeIcon icon={faArrowsRotate} style={{ marginRight: '10px' }} onClick={handleRefresh} />{" "}
                        <FontAwesomeIcon icon={faXmark} style={{ fontSize: "12pt" }} onClick={() => setIsExampleOpen(false)} />
                    </div>
                }
            >
                <ProCard colSpan="50%" ghost direction="column" gutter={8}>
                    <Prompt options={task_examples[random[0]]}></Prompt>
                    <Prompt options={task_examples[random[1]]}></Prompt>
                </ProCard>
                <ProCard colSpan="50%" ghost direction="column" gutter={8}>
                    <Prompt options={task_examples[random[2]]}></Prompt>
                    <Prompt options={task_examples[random[3]]}></Prompt>
                </ProCard>
            </ProCard>
        ) : null
    );
};

export default PromptTutorial;
