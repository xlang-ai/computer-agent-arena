import React, { useState } from 'react';
import ArenaMainFigure from '../../assets/blog/arena/main_figure.gif';
import 'katex/dist/katex.min.css';
import { InlineMath, BlockMath } from 'react-katex';
import Figure2 from '../../assets/blog/arena/figure2.png';
import Figure3 from '../../assets/blog/arena/figure3.png';
import Figure4 from '../../assets/blog/arena/figure4.png';
import Figure5 from '../../assets/blog/arena/figure5.png';
import Figure6 from '../../assets/blog/arena/figure6.png';
import Figure7 from '../../assets/blog/arena/figure7.png';
import Figure8 from '../../assets/blog/arena/figure8.png';
import Figure9 from '../../assets/blog/arena/figure9.png';
import Figure10 from '../../assets/blog/arena/figure10.png';
import { RankingTable } from '../Ranking';
import { useAuth } from '../../context/AuthContext';
const ArenaBlog: React.FC = () => {
    const {socketService} = useAuth();
    const [setupOptions, setSetupOptions] = useState<{
        [key: string]: any;
    }>({});
    return (
        <div className="bg-white mt-0 py-8 sm:py-8 max-w-7xl min-w-[70%] mx-auto">
            <article className="mx-auto max-w-3xl px-6 lg:px-8">
                <div className="mx-auto max-w-2xl lg:max-w-4xl">
                    <header className="mb-10">
                        <time dateTime="2025-01-24" className="text-gray-500">
                         April 07, 2025
                        </time>
                        <h1 className="mt-4 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
                            Computer Agent Arena
                        </h1>
                        <p className="text-gray-600 text-lg leading-relaxed mt-4 mb-8">
                            Computer Agent Arena's infrastructure, leaderboard (tentative) and initial insights.
                        </p>
                        
                        <div className="mt-2 grid grid-cols-3 gap-8 border-2 border-gray-200 px-4 py-2 rounded-lg">
                            <div>
                                <h3 className="font-semibold text-gray-900 mb-2 text-xs">AUTHORS</h3>
                                <div className="text-gray-600 gap-0 text-[10px]">
                                    <p><a href="https://bowenbryanwang.github.io/" target="_blank" rel="noopener noreferrer">Bowen Wang*</a></p>
                                    <p><a href="https://xinyuanwangcs.github.io/" target="_blank" rel="noopener noreferrer">Xinyuan Wang*</a></p>
                                    <p><a href="https://www.linkedin.com/in/jiaqideng/?originalSubdomain=hk" target="_blank" rel="noopener noreferrer">Jiaqi Deng*</a></p>
                                    <p><a href="https://tianbaoxie.com/" target="_blank" rel="noopener noreferrer">Tianbao Xie</a></p>
                                    <p><a href="https://www.linkedin.com/in/ryan-li-a9b2761b8/" target="_blank" rel="noopener noreferrer">Ryan Li</a></p>
                                    <p><a href="https://stevenyzzhang.github.io/website/" target="_blank" rel="noopener noreferrer">Yanzhe Zhang</a></p>
                                    <p>Gavin Li</p>
                                    <p><a href="https://github.com/ztjhz" target="_blank" rel="noopener noreferrer">Toh Jing Hua</a></p>
                                    <p><a href="https://people.eecs.berkeley.edu/~istoica/" target="_blank" rel="noopener noreferrer">Ion Stoica</a></p>
                                    <p><a href="https://infwinston.github.io/" target="_blank" rel="noopener noreferrer">Wei-Lin Chiang</a></p>
                                    <p><a href="https://cs.stanford.edu/~diyiy/" target="_blank" rel="noopener noreferrer">Diyi Yang</a></p>
                                    <p><a href="https://ysu1989.github.io/" target="_blank" rel="noopener noreferrer">Yu Su</a></p>
                                    <p><a href="https://scholar.google.com/citations?user=sxs6h_wAAAAJ&hl=zh-CN" target="_blank" rel="noopener noreferrer">Yi Zhang</a></p>
                                    <p><a href="https://zhiguowang.github.io/" target="_blank" rel="noopener noreferrer">Zhiguo Wang</a></p>
                                    <p><a href="https://www.victorzhong.com/" target="_blank" rel="noopener noreferrer">Victor Zhong</a></p>
                                    <p><a href="https://taoyds.github.io/" target="_blank" rel="noopener noreferrer">Tao Yu</a></p>
                                </div>
                            </div>
                            
                            <div>
                                <h3 className="font-semibold text-gray-900 mb-2 text-xs">AFFILIATIONS</h3>
                                <div className="text-gray-600 text-[10px]">
                                    <p>The University of Hong Kong</p>
                                    <p>University of Waterloo</p>
                                    <p>UC Berkeley</p>
                                    <p>Stanford University</p>
                                    <p>The Ohio State University</p>
                                    <p>Amazon AWS Bedrock</p>
                                </div>
                            </div>
                            <div>
                                <h3 className="font-semibold text-gray-900 mb-2 text-xs">PUBLISHED</h3>
                                <div className="text-gray-600 text-[10px]">
                                    <p>April 07, 2025</p>
                                </div>
                            </div>
                        </div>
                    </header>

                    <div className="prose prose-lg prose-indigo mx-auto">

                        <section className="mb-12">
                            <h2 className="text-2xl font-bold mb-4">Overview</h2>
                            <p className="text-gray-600 leading-relaxed">
                                Computer Agent Arena is an open platform for evaluating LLM and VLM-based agents performing real-world computer-use tasks, from daily activities to specialized workflows like coding, data analysis, and video editing. In this post, we'll explore the platform's motivation, its infrastructure, and share the initial leaderboard and results. We invite the broader community to participate by testing agent capabilities and contributing new configurations and agents.
                            </p>
                        </section>

                        <section className="mb-12">
                            <h2 className="text-2xl font-bold mb-4">Introduction</h2>
                            <p className="text-gray-600 leading-relaxed">
                                The rapid development of Large Language Models (LLMs) and Vision Language Models (VLMs) increasingly allow digital agents to seamlessly translate user instructions into actionable tasks within immersive environments. Notable recent breakthroughs include coding agents like <a className="text-blue-500" href="https://swe-agent.com/latest/" target="_blank" rel="noopener noreferrer">SWEAgent</a> that can analyze, edit, and generate code, web agents that can navigate and use websites, and gaming agents that serve as engaging computer-controlled characters. Shared among these exciting developments is the computer, which serves as an unified framework for embodied digital agents to observe and interact with their surroundings.
                            </p>
                            <p className="text-gray-600 leading-relaxed mt-4">
                                Notable milestones include OpenAI's <a className="text-blue-500" href="https://openai.com/index/computer-using-agent/" target="_blank" rel="noopener noreferrer">Operator Computer-Using Agent (CUA)</a>, which achieved a 38.1% success rate on our <a className="text-blue-500" href="https://os-world.github.io/" target="_blank" rel="noopener noreferrer">OSWorld</a> benchmark, and Anthropic's <a className="text-blue-500" href="https://www.anthropic.com/news/claude-3-7-sonnet" target="_blank" rel="noopener noreferrer">Claude 3.7 Sonnet</a>, with a 28% success rate (100 steps). These achievements signal a new era for general-purpose digital agents. However, users perform billions of different tasks and workflows on their computers every day, yet existing benchmarks are very limited (e.g., only 369 tasks in OSWorld and 812 tasks in WebArena). This makes it difficult to measure agents' capabilities in real-world computer-use tasks. Additionally, as agent frameworks become more sophisticated, users face growing challenges in configuring and deploying them on personal computers, with technical complexity and privacy concerns creating barriers to experimentation and adoption, especially for non-expert users.
                            </p>
                            <p className="text-gray-600 leading-relaxed mt-4">
                                While platforms like <a className="text-blue-500" href="https://lmarena.ai/" target="_blank" rel="noopener noreferrer">Chatbot Arena</a> have pioneered crowdsourced evaluation for language models, they fall short of providing embodied environments where digital agents can interact with real applications and websites. To bridge these gaps, we introduce Computer Agent Arena—an open-ended platform designed to evaluate multimodal LLM-based agents across diverse, real-world computer tasks. From everyday desktop operations to specialized workflows like web browsing, programming, and multimedia editing, our platform offers a unified, embodied environment that enables comprehensive and realistic assessments. In this post, we'll dive into the infrastructure of Computer Agent Arena, present initial results, and unveil a tentative leaderboard powered by the Elo algorithm.
                            </p>
                        </section>

                        <section className="mb-12">
                            <h2 className="text-2xl font-bold mb-4">The Infrastructure of Computer Agent Arena</h2>
                            <figure className="my-4">
                                <img
                                    src={ArenaMainFigure}
                                    alt="Pipeline overview of Computer Agent Arena"
                                    className="w-full"
                                />
                                <figcaption className="text-center text-sm text-gray-500 mt-2">
                                    Figure 1: Pipeline overview of Computer Agent Arena
                                </figcaption>
                            </figure>
                            <p className="text-gray-600 leading-relaxed">
                                Computer Agent Arena offers a robust evaluation framework hosted on cloud-based virtual machines, supporting Windows, Ubuntu, and soon MacOS. Users can set up their evaluation environment by choosing from a curated list of preset applications and websites (e.g., Google Docs, Slack, YouTube), or by customizing the environment with either quick-start actions like uploading files or opening specific sites or normally controlling the computers (e.g. click, type, scroll etc.). Once configured, users can then propose computer-use tasks that challenge two anonymized computer agents with different models and frameworks in executing the tasks in head-to-head environments. Finally, users can evaluate the agents' performance based on the visualized agent execution trajectories and the pair-wise evaluation results are calculated by the Elo algorithm to maintain the ultimate leaderboard.
                            </p>
                        </section>
                        <section className="mb-12">
                            <h2 className="text-2xl font-bold mb-4">Evaluation of General-Purpose Digital Agents</h2>
                            <div className="relative -mx-10 lg:-mx-12 overflow-x-auto flex justify-center mb-4">
                                <div className="min-w-[800px] mb-4 max-w-none text-base">
                                    <RankingTable socketService={socketService} setupOptions={setupOptions} />
                                </div>
                            </div>
                            <figure className="my-0">
                                <figcaption className="text-center text-sm text-gray-500 mt-2">
                                    Figure 2: Initial leaderboard (tentative)
                                </figcaption>
                            </figure>
                            <p className="text-gray-600 leading-relaxed">
                                Based on <span className="font-bold">95</span> valid human evaluations collected, our leaderboard (tentative) presents three key performance metrics: Elo Score, Correct Rate, and Win Rate.
                            </p>
                            <figure className="my-4">
                                <img
                                    src={Figure3}
                                    alt="Bootstrapped Elo score ranking with 95% confidence interval"
                                    className="w-full"
                                />
                                <figcaption className="text-center text-sm text-gray-500 mt-2">
                                    Figure 3: Bootstrapped Elo score ranking with 95% confidence interval
                                </figcaption>
                            </figure>
                            <p className="text-gray-600 leading-relaxed mt-4">
                                <span className="font-bold">Elo score</span>. The Elo score quantifies relative performance through pairwise agent evaluations. For any two competing agents (A and B) with respective Elo ratings <InlineMath math="R_A" /> and <InlineMath math="R_B" />, the expected score of Agent A is calculated as:
                                <BlockMath math="E_A = \frac{1}{1 + 10^{(R_B - R_A)/400}}" />
                                where the expected score represents the probability of winning plus half the probability of drawing.
                                Following each competition, an agent's Elo rating is updated based on the difference between its actual score (<InlineMath math="S_A" />) and expected score (<InlineMath math="E_A" />):
                                <BlockMath math="R'_A = R_A + K \cdot (S_A - E_A)" />
                                where <InlineMath math="K" /> is the rating adjustment factor and set to be 4 in our settings.
                            </p>
                            <figure className="my-4">
                                <img
                                    src={Figure4}
                                    alt="Win rate vs. correct rate for all agents"
                                    className="w-full"
                                />
                                <figcaption className="text-center text-sm text-gray-500 mt-2">
                                    Figure 4: Win rate vs. correct rate for all agents
                                </figcaption>
                            </figure>
                            <p className="text-gray-600 leading-relaxed mt-4">
                                <span className="font-bold">Correct rate</span>. The Correct Rate measures task execution accuracy based on user feedback. It is calculated as:
                                <BlockMath math="\text{Correct Rate} = \frac{\text{Number of Correctly Completed Tasks}}{\text{Total Number of Evaluations}}" />
                                Users assess whether each agent successfully completed its assigned task according to the given prompt.
                            </p>
                            <p className="text-gray-600 leading-relaxed mt-4">
                                <span className="font-bold">Win rate</span>. The Win Rate indicates an agent's competitive performance, defined as:
                                <BlockMath math="\text{Win Rate} = \frac{\text{Number of Winning Evaluations}}{\text{Total Number of Evaluations}}" />
                                This metric directly reflects how often an agent outperforms its competitors in head-to-head evaluations.
                            </p>
                            <p className="text-gray-600 leading-relaxed mt-4">
                                Current Elo scores show a confidence interval of approximately +-20 points, indicating that additional data collection is needed to achieve more reliable rankings. We are actively gathering more evaluations to increase statistical confidence and stabilize the leaderboard results.
                            </p>
                        </section>

                        <section className="mb-12">
                            <h2 className="text-2xl font-bold mb-4">A Diverse and Growing Set of Computer Use Settings</h2>
                            <p className="text-gray-600 leading-relaxed">
                                Unlike traditional chatbot or agent evaluation tasks, computer-use scenarios are fundamentally dependent on the initial state of the computing environment, including installed software, accessible websites, and available files and data. Given this universal characteristic, generating diverse and representative computer scenarios is crucial for collecting meaningful task evaluations. To address this need, we have developed an Initial Setup Hub with customizable configuration options.
                            </p>
                            <figure className="my-4">
                                <img
                                    src={Figure5}
                                    alt="Overview of initial desktop setup options"
                                    className="w-full"
                                />
                                <figcaption className="text-center text-sm text-gray-500 mt-2">
                                    Figure 5: Overview of initial desktop setup options
                                </figcaption>
                            </figure>
                            <p className="text-gray-600 leading-relaxed mt-4">
                                To implement this vision, we have pre-installed a comprehensive suite of popular applications, software, and services in our computer environment images. These span multiple domains:
                            </p>
                            <ul className="list-disc pl-6 text-gray-600 mt-4 space-y-2">
                                <li>Productivity tools: LibreOffice, Slack, Zoom</li>
                                <li>Multimedia applications: YouTube, Spotify, Netflix</li>
                                <li>Professional software: VSCode, Gimp, PDF editors</li>
                                <li>More...</li>
                            </ul>
                            <p className="text-gray-600 leading-relaxed mt-4">
                                Each application is populated with simulated content to create realistic usage scenarios. Additionally, we maintain a rotating collection of default files and data across all images, periodically refreshed to ensure variety. We have also curated an extensive list of popular websites to support browser-related task evaluation.
                            </p>
                            <figure className="my-4 flex flex-col items-center justify-center">
                                <img
                                    src={Figure6}
                                    alt="Computer Agent Arena UI for initial setups"
                                    className="w-[70%] mx-auto items-center"
                                />
                                <figcaption className="text-center text-sm text-gray-500 mt-2">
                                    Figure 6: Computer Agent Arena UI for initial setups
                                </figcaption>
                            </figure>
                            <p className="text-gray-600 leading-relaxed mt-4">
                                This infrastructure serves two critical purposes. First, it enables us to monitor and analyze the domain distribution of user-evaluated computer tasks, ensuring high-quality evaluation data. Second, it helps ensure that evaluation task settings comprehensively cover real-world usage scenarios, allowing us to assess computer agents' capabilities across diverse environmental conditions effectively.
                            </p>
                        </section>

                        {/* <section className="mb-12">
                            <h2 className="text-2xl font-bold mb-4">Understanding User Behavior in Computer Agent Arena</h2>
                            <p className="text-gray-600 leading-relaxed">
                                Computer Agent Arena is designed to evaluate agents in real-world digital environments shaped by diverse user-defined settings. Understanding how users specify tasks within the arena is crucial for refining agent capabilities and ensuring meaningful evaluations. Given the variety of real-world computer use cases—ranging from web browsing and software operations to system management and coding—analyzing user interactions helps model practical agent applications.
                            </p>
                            <p className="text-gray-600 leading-relaxed mt-4">
                                In open-ended environments, real users' tasks predominantly involve web-related activities within browsers, followed by commonly used apps such as email clients, office productivity tools, code editors like VSCode, and various system settings.
                            </p>
                            <figure className="my-4">
                                <img
                                    src={Figure8}
                                    alt="Distribution difference of computer agent arena against other static benchmarks"
                                    className="w-full"
                                />
                                <figcaption className="text-center text-sm text-gray-500 mt-2">
                                    Figure 7: Distribution difference of computer agent arena against other static benchmarks
                                </figcaption>
                            </figure>
                        </section>

                        <section className="mb-12">
                            <h2 className="text-2xl font-bold mb-4">Initial Analysis and Findings</h2>
                            <p className="text-gray-600 leading-relaxed">
                                Traditional leaderboards, with overall Elo ratings, fail to capture the nuanced capabilities that agents need for different computer tasks. Current evaluation methods rely on simple heuristics or application-based groupings, which don't fully reflect the complex skills required for task completion. A more sophisticated, granular approach is needed—one that identifies core capabilities such as GUI navigation, sequential reasoning, and planning, and maps tasks to these fundamental skills.
                            </p>
                            <p className="text-gray-600 leading-relaxed mt-4">
                                To address this, we propose a six-category classification framework for task evaluation:
                            </p>
                            <ul className="list-disc pl-6 text-gray-600 mt-4 space-y-2">
                                <li>Information Retrieval</li>
                                <li>Content Creation</li>
                                <li>Productivity & Work</li>
                                <li>OS Operation</li>
                                <li>Professional & Domain-specific</li>
                                <li>Cross App/Domain</li>
                            </ul>
                            <p className="text-gray-600 leading-relaxed mt-4">
                                For consistency, we developed a structured checklist for each category, outlining the specific requirements for classification. LLM models were then used to assess whether each task met the checklist criteria, ensuring objective categorization.
                            </p>
                            <figure className="my-4">
                                <img
                                    src={Figure9}
                                    alt="Distribution of computer agent arena against other static benchmarks"
                                    className="w-full"
                                />
                                <figcaption className="text-center text-sm text-gray-500 mt-2">
                                    Figure 8: Task categorization distribution
                                </figcaption>
                            </figure>
                            <p className="text-gray-600 leading-relaxed mt-4">
                                Our initial analysis of task distribution shows a clear user preference for tasks in three main categories: Information Retrieval, UI Navigation, and OS Operation. This pattern aligns with our previous findings, confirming that web browsing and operating system interactions are the most common tasks.
                            </p>
                            <p className="text-gray-600 leading-relaxed mt-4">
                                We observed some unexpected results in agent performance. Despite being popular, tasks in Information Retrieval and OS Operations had relatively low success rates across all agents. On the other hand, Content Creation tasks saw higher success rates, likely due to their lower reliance on complex GUI interactions and greater emphasis on content generation.
                            </p>
                            <figure className="my-4">
                                <img
                                    src={Figure10}
                                    alt="Elo score difference between agents"
                                    className="w-full"
                                />
                                <figcaption className="text-center text-sm text-gray-500 mt-2">
                                    Figure 9: Elo scores in different categorizations
                                </figcaption>
                            </figure>
                            <p className="text-gray-600 leading-relaxed mt-4">
                                Analysis of category-specific Elo scores revealed significant variations. Agents like Claude Computer Use and Aguvis, which were trained on GUI interaction data, performed well in GUI interaction-intensive tasks. However, their performance in Content Creation tasks was weaker. The similar performance between these two agents suggests that their fine-tuning on human-demonstrated trajectories makes them especially suited for GUI-based tasks.
                            </p>
                        </section> */}

                        <section className="mb-12">
                            <h2 className="text-2xl font-bold mb-4">Future Plans</h2>
                            <p className="text-gray-600 leading-relaxed">
                                Looking ahead, we are excited to further expand and refine the Computer Agent Arena. Our primary focus will be on fostering community contributions and building a more transparent & robust platform for evaluating digital agents.
                            </p>
                            <ul className="list-disc pl-6 space-y-3 text-gray-600 mt-4">
                                <li className="leading-relaxed">
                                    <span className="font-medium">Community-Driven Agent Models:</span> In the near future, we plan to support a wider variety of agent models by leveraging the contributions of the community. We will open-source the initial desktop setup, allowing users to create and share their own configurations. This will enable the community to contribute more diverse and engaging setups, making the arena even more dynamic.
                                </li>
                                <li className="leading-relaxed">
                                    <span className="font-medium">Crowd-Sourced Evaluations:</span> By enabling crowd-sourced evaluations, we hope to gather more votes and assessments from real users, which will help guide the development of computer agents. We are excited to see how these contributions will lead to more interesting analyses, offering new insights into agent capabilities and performance across various tasks.
                                </li>
                                <li className="leading-relaxed">
                                    <span className="font-medium">AI Model Training:</span> Computer Agent Arena will also serve as a tool for training AI models. By collecting user-agent interaction data and preferences, we can refine reward functions for reinforcement learning (RL), helping to train more efficient and user-aligned agents. This will also involve gathering demonstration data to improve agent decision-making and behavior in real-world scenarios.
                                </li>
                                <li className="leading-relaxed">
                                    <span className="font-medium">Open-Source Initiative:</span> More importantly, both our arena system (frontend & backend) and part of the collected data will be open-sourced in a few weeks, making them accessible to the research community to foster innovation and further advancements in AI agent evaluation.
                                </li>
                            </ul>
                        </section>

                        <section className="mb-12">
                            <h2 className="text-2xl font-bold mb-4">Citation</h2>
                            <pre className="bg-gray-50 p-4 rounded-lg text-sm overflow-x-auto">
                {`@misc{wang2025computer,
    title={Computer Agent Arena: Compare & Test Computer Use Agents on Crowdsourced Real-World Tasks},
    author={Bowen Wang and Xinyuan Wang and Jiaqi Deng and Tianbao Xie and Ryan Li and Yanzhe Zhang and Gavin Li and Toh Jing Hua and Ion Stoica and Wei-Lin Chiang and Diyi Yang and Yu Su and Yi Zhang and Zhiguo Wang and Victor Zhong and Tao Yu},
    year={2025},
}`}
                            </pre>
                        </section>
                    </div>
                </div>
            </article>
        </div>
    );
};

export default ArenaBlog;
