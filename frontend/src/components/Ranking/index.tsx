import React, { useEffect, useState } from 'react';

import dayjs from 'dayjs';

import { ProTable } from '@ant-design/pro-components';
import type { ProColumns } from '@ant-design/pro-components';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMedal, faAward, faTrophy } from '@fortawesome/free-solid-svg-icons';
import { faLinux, faWindows } from '@fortawesome/free-brands-svg-icons';
import { Tooltip } from 'antd';
import { faCircleQuestion } from '@fortawesome/free-regular-svg-icons';

import SocketService from '../../utils/SocketService';

import XlangLogo from '../../icons/logo_color.svg';
import ClaudeLogo from '../../icons/Claude.svg';
import GeminiLogo from '../../icons/Gemini.svg';
import OpenAILogo from '../../icons/OAI.svg';
import MetaLogo from '../../icons/Meta.png';
import AguvisLogo from '../../icons/aguvis.png';
import QwenLogo from '../../icons/Qwen.webp';
import { MODEL_INFO } from '../Arena/eval';

import './ranking.css';

const OSList2Enum = (osList: string[]) => {
  const valueEnum: { [key: string]: any } = {};
  osList.forEach((os) => {
    if (os.toLowerCase() === 'ubuntu') {
      valueEnum[os] = {
        text: (
          <>
            <FontAwesomeIcon icon={faLinux} /> Ubuntu
          </>
        ),
      };
    } else if (os.toLowerCase() === 'windows') {
      valueEnum[os] = {
        text: (
          <>
            <FontAwesomeIcon icon={faWindows} /> Windows
          </>
        ),
      };
    } else {
      valueEnum[os] = { text: os };
    }
  });
  return valueEnum;
};

const AgentList2Enum = (agentList: string[]) => {
  const valueEnum: { [key: string]: any } = {};
  agentList.forEach((agent) => {
    valueEnum[agent] = { text: agent };
  });
  return valueEnum;
};

const VLMList2Enum = (vlmList: string[]) => {
  const valueEnum: { [key: string]: any } = {};
  vlmList.forEach((vlm) => {
    valueEnum[vlm] = { text: vlm };
  });
  return valueEnum;
};


const Agent_Display = (vlm_name: string, agent: string) => {
  const modelInfo = MODEL_INFO[vlm_name+ "+" + agent];
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
export type TableListItem = {
  // {'os_env': 'Ubuntu', 'vlm_name': 'gpt-4-vision-preview', 'agent': 'naive_screenshot', 'compare times': 1, 'evaluate times': 1, 'correct rate': 1.0, 'quality': 0, 'win rate': 0.5, 'elo': 1500.0, 'overall': 1500.0}
  os_env: string;
  vlm_name: string;
  agent: string;
  'compare times': number;
  'evaluate times': number;
  'correct rate': number;
  quality: number;
  'win rate': number;
  'safe rate': number;
  'harmless rate': number;
  'execution time': number;
  elo: number;
  overall: number;
  ci_high: number;
  ci_low: number;
  organization: string;
  license: string;
  rank?: number;
  children?: TableListItem[];
  key?: string;
};

interface RankingTableProps {
  socketService: SocketService;
  setupOptions: {
    [key: string]: any;
  };
  size?: 'small' | 'middle' | 'large';
}

// CSV解析函数
const parseCSV = (csvText: string): TableListItem[] => {
  const lines = csvText.split('\n');
  const headers = lines[0].split(',').map(h => h.trim());
  
  return lines.slice(1)
    .filter(line => line.trim().length > 0)
    .map(line => {
      const values = line.split(',');
      const item: any = {};
      
      headers.forEach((header, index) => {
        // 对数值类型进行转换
        const value = values[index]?.trim();
        if (!isNaN(Number(value)) && value !== '') {
          item[header] = Number(value);
        } else {
          item[header] = value;
        }
      });
      
      return item as TableListItem;
    });
};

// 从本地文件读取CSV数据
const fetchRankingDataFromCSV = async (): Promise<TableListItem[]> => {
  try {
    const response = await fetch('./ranking_data_0616.csv');
    const csvText = await response.text();
    return parseCSV(csvText);
  } catch (error) {
    
    console.error('Error loading CSV data:', error);
    return [];
  }
};

// 数据分组和处理函数
const processRankingData = (rawData: TableListItem[]): TableListItem[] => {
  // 分离主条目和子条目（在排序前进行）
  const mainItems: (TableListItem & { children?: TableListItem[] })[] = [];
  const childItems: TableListItem[] = [];
  
  // 识别子条目 - 这里我们将ui-tars-1.5-qwen-2.5作为ui-tars-1.5的子条目
  rawData.forEach(item => {
    if (item.vlm_name === 'ui-tars-1.5-qwen-2.5' && item.agent === 'ui_tars_agent') {
      childItems.push(item);
    } else {
      mainItems.push(item);
    }
  });
  
  // 将子条目附加到对应的主条目
  mainItems.forEach(mainItem => {
    if (mainItem.vlm_name === 'ui-tars-1.5' && mainItem.agent === 'ui_tars_agent') {
      const relatedChildren = childItems.filter(child => 
        child.agent === mainItem.agent
      );
      if (relatedChildren.length > 0) {
        // 去重，确保只有一个子条目
        const uniqueChildren = relatedChildren.filter((child, index, arr) => 
          arr.findIndex(c => c.vlm_name === child.vlm_name) === index
        );
        mainItem.children = uniqueChildren;
      }
    }
  });
  
  // 然后按overall降序排序主条目
  const sortedMainItems = mainItems.sort((a, b) => b.overall - a.overall);
  
  // 为主条目添加排名
  const dataWithRank = sortedMainItems.map((item, index) => ({
    ...item,
    rank: index + 1,
    key: `${item.vlm_name}-${item.agent}-${index}` // 添加唯一key
  }));
  
  return dataWithRank;
};

export const RankingTable: React.FC<RankingTableProps> = ({ socketService, setupOptions, size = 'middle' }) => {
  const [time, setTime] = useState(() => Date.now());

  const columns: ProColumns<TableListItem>[] = [
    {
      title: <div>Rank (UB) <Tooltip title="Model ranking (upper bound)">
      <FontAwesomeIcon icon={faCircleQuestion} className="text-xs text-gray-500 hover:text-gray-700 cursor-pointer"/>
    </Tooltip></div>,
      dataIndex: 'rank',
      width: 120,
      render: (_, record, index) => {
        const rank = record.rank;
        if (rank === 1) {
          return <FontAwesomeIcon icon={faMedal} style={{ color: 'gold' }} />;
        } else if (rank === 2) {
          return <FontAwesomeIcon icon={faAward} style={{ color: 'silver' }} />;
        } else if (rank === 3) {
          return (
            <FontAwesomeIcon icon={faTrophy} style={{ color: '#cd7f32' }} />
          );
        } else if (rank) {
          return rank;
        } else {
          return ''; // 子条目不显示排名
        }
      },
    },
    {
      title: 'Model',
      dataIndex: ['vlm_name', 'agent'],
      initialValue: 'all',
      onFilter: false,
      render: (dom: React.ReactNode, record: TableListItem) => {
        const displayComponent = Agent_Display(record.vlm_name, record.agent);
        
        // 如果是ui-tars-1.5-qwen-2.5，添加deprecated标记
        if (record.vlm_name === 'ui-tars-1.5-qwen-2.5' && record.agent === 'ui_tars_agent') {
          const textSizeClass = size === 'small' ? 'text-xs' : size === 'large' ? 'text-base' : 'text-sm';
          return (
            <span className="flex items-center">
              <span className='text-xs'>{displayComponent}</span>
              <Tooltip title="This is a deprecated version.">
                <span className="ml-1 text-orange-500 cursor-help">*</span>
              </Tooltip>
            </span>
          );
        }
        
        return displayComponent;
      },
    },
    {
      title: 'Arena Score',
      dataIndex: 'overall',
      hideInSearch: true,
      sorter: (a, b) => a.overall - b.overall,
      defaultSortOrder: 'descend',
      render: (_, record, index) => {
        if (record['overall'] === 0) {
          return '';
        }
        return Number(record['overall']).toFixed(2);
      },
    },
    {
      title: <div>95% CI <Tooltip title="95% Confidence Interval">
      <FontAwesomeIcon icon={faCircleQuestion} className="text-xs text-gray-500 hover:text-gray-700 cursor-pointer"/>
    </Tooltip></div>,
      dataIndex: ['ci_high', 'ci_low'],
      hideInSearch: true,
      onFilter: false,
      render: (_, record) => {
        if (record.ci_high === 0 || record.ci_low === 0) {
          return '';
        }
        const high = Number(record.ci_high).toFixed(0);
        const low = Number(record.ci_low).toFixed(0);
        return `+${high}/${low}`;
      },
    },
    {
      title: 'Votes',
      dataIndex: 'evaluate times',
      hideInSearch: true,
      onFilter: false,
      render: (_, record, index) => {
        return Math.round(Number(record['evaluate times']));
      },
    },
    {
      title: 'Correct Rate',
      dataIndex: 'correct rate',
      hideInSearch: true,
      onFilter: false,
      sorter: (a, b) => a['correct rate'] - b['correct rate'], // 确定排序函数，这里以数值排序为例
      render: (_, record, index) => {
        // 保留两位小数
        return Number(record['correct rate']).toFixed(2);
      },
    },
    {
      title: 'Organization',
      dataIndex: 'organization',
      initialValue: 'all',
      filters: true,
      onFilter: true,
    },
    {
      title: 'License',
      dataIndex: 'license',
      initialValue: 'all',
      filters: true,
      onFilter: true,
    },
  ];

  return (
    <ProTable<TableListItem>
      columns={columns}
      rowKey='key'
      search={false}
      size={size}
      pagination={{
        showSizeChanger: true,
              }}
        toolBarRender={false}
        expandable={{
          rowExpandable: (record) => {
            const expandable = !!(record.children && record.children.length > 0);
            if (record.vlm_name === 'ui-tars-1.5') {
              console.log('ui-tars-1.5 expandable check:', expandable, 'children:', record.children);
            }
            return expandable;
          },
          defaultExpandAllRows: false, // 默认折叠
        }}
        request={async () => {
        // 从本地CSV文件读取排名数据而不是使用socketService
        const rankingData = await fetchRankingDataFromCSV();
        
        // 处理数据，实现分组和排名
        const processedData = processRankingData(rankingData);
        
        setTime(Date.now());
        return {
          data: processedData,
          success: true,
          total: processedData.length,
        };
      }}
    />
  );
};

interface RankingProps {
  socketService: SocketService;
}

export const Ranking: React.FC<RankingProps> = ({ socketService }) => {
  const [setupOptions, setSetupOptions] = useState<{
    [key: string]: any;
  }>({});

  const fetchOptionsData = async () => {
    try {
      const SetupOptionsData = await socketService.Get('get_setup_options');
      setSetupOptions(SetupOptionsData);
    } catch (error) {
      console.error('Error fetching options data:', error);
    }
  };
  useEffect(() => {
    fetchOptionsData();
  }, []);

  return (
    <>
      <div>
        <span className='inline-block text-xl font-bold align-baseline'>
          Computer Agent Arena Leaderboard (tentative)
        </span>
        <a
          href='https://xlang.ai'
          target='_blank'
          rel='noreferrer'
          className='inline-block align-middle ml-1 text-[10px] text-secondary-dark/70'
        >
          by <img src={XlangLogo} height={10} alt='logo' /> XLANG Lab
        </a>
      </div>
      <div className='mt-4 flex flex-row gap-4'>
        <span> Total #models: <span className="font-semibold">9</span></span>
        <span> Total verified #votes: <span className="font-semibold">2,052</span></span>
        <span> Last updated: 2025-06-16</span>
      </div>
      <div className='mt-4 mb-4'>
        Computer Agent Arena by{' '}
        <a href='https://xlang.ai' target='_blank' rel='noreferrer'>
          XLANG Lab
        </a>{' '}
        is an open evaluation platform where users can compare LLM/VLM-based AI agents performing real-world computer tasks,  ranging from general computer use to specialized workflows like coding, data analysis, and video editing.
      </div>
      
      <RankingTable socketService={socketService} setupOptions={setupOptions} size="middle" />
      
      <div className="mt-2">
        <h2 className="text-xl font-bold my-2 px-2 py-1">More Statistics for Computer Agent Arena (Overall)</h2>
        <div className="grid grid-cols-2 gap-4">
          <div className="border bg-white rounded-lg px-4 py-2 shadow-sm">
            <p className="text-lg font-bold px-2 py-1">Confidence Interval for Agent Strength</p>
            <iframe 
              src="elo_bootstrap.html"
              className="w-full h-[600px]"
              frameBorder="0"
            />
          </div>
          
          <div className="border bg-white rounded-lg px-4 py-2 shadow-sm">
            <p className="text-lg font-bold px-2 py-1">Correct Rate vs. Win Rate for All Agents</p>
            <iframe 
              src="win_rate_vs_correct_rate.html"
              className="w-full h-[600px]"
              frameBorder="0"
            />
          </div>
          
          <div className="border bg-white rounded-lg px-4 py-2 shadow-sm">
            <p className="text-lg font-bold px-2 py-1">Fraction of Agent A Wins for All Non-tied A vs. B Battles            </p>
            <iframe 
              src="pairwise_win_rate_hot.html"
              className="w-full h-[600px]"
              frameBorder="0"
            />
          </div>
          
          <div className="border bg-white rounded-lg px-4 py-2 shadow-sm">
            <p className="text-lg font-bold px-2 py-1">Battle Count for Each Combination of Agents (without Ties)</p>
            <iframe 
              src="battle_count.html"
              className="w-full h-[600px]"
              frameBorder="0"
            />
          </div>
        </div>
      </div>

      {/* <div id="base-agent-intro" className="mt-2">
        <h3 className="text-xl font-bold mb-4">Base Agent</h3>
      </div> */}
    </>
  );
};

export default Ranking;
