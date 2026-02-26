import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

interface InteractiveMessageProps {
  content: any[];
  position: string;
}

/**
 * Component for rendering interactive messages from agents
 * These are simple text messages agents send to users to ask questions or provide updates
 */
const InteractiveMessage: React.FC<InteractiveMessageProps> = ({ content, position }) => {
  // The agent letter based on position
  const agentLetter = position === "left" ? "A" : position === "right" ? "B" : "A";
  
  // Get the message text from content
  const getMessage = () => {
    if (!content || content.length === 0) {
      return "...";
    }
    
    
    // Find the first item with action="interact"
    const interactItem = content.find(item => item.action === "interact");
    if (interactItem) {
      return interactItem.description;
    }
    
    // Fallback to the first item's description
    return content[0]?.description || "...";
  };
  
  const messageText = getMessage();
  
  return (
    <li className="h-full max-h-full w-full max-w-full flex space-x-2">
      <span className="shrink-0 inline-flex items-center justify-center size-[24px] rounded-full bg-purple-600">
        <span className="text-sm font-medium text-white leading-none">
          {agentLetter}
        </span>
      </span>
      <div className="flex flex-col h-full w-[95%] max-w-full bg-white border border-gray-200 rounded-lg dark:bg-neutral-900 dark:border-neutral-700">
        <div className="flex-grow overflow-y-auto p-4 w-full max-w-full">
          <div className="prose prose-sm w-full max-w-full">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                h1: ({node, ...props}) => <h1 className="text-base font-semibold my-2" {...props} />,
                h2: ({node, ...props}) => <h2 className="text-sm font-semibold my-2" {...props} />,
                h3: ({node, ...props}) => <h3 className="text-sm font-semibold my-1.5" {...props} />,
                h4: ({node, ...props}) => <h4 className="text-xs font-semibold my-1" {...props} />,
                h5: ({node, ...props}) => <h5 className="text-xs font-semibold my-1" {...props} />,
                h6: ({node, ...props}) => <h6 className="text-xs font-semibold my-1" {...props} />,
                p: ({node, ...props}) => <p className="text-sm my-2" {...props} />,
                ul: ({node, ...props}) => <ul className="list-disc pl-5 my-2 text-sm" {...props} />,
                ol: ({node, ...props}) => <ol className="list-decimal pl-5 my-2 text-sm" {...props} />,
                li: ({node, ...props}) => <li className="my-1" {...props} />,
                strong: ({node, ...props}) => <strong className="font-semibold" {...props} />,
                table: ({node, ...props}) => (
                  <div className="my-4 w-full overflow-x-auto max-w-full">
                    <table className="border-collapse border border-gray-300 dark:border-neutral-600 text-xs w-full table-fixed overflow-hidden" style={{tableLayout: 'fixed'}} {...props} />
                  </div>
                ),
                thead: ({node, ...props}) => <thead className="bg-gray-100 dark:bg-neutral-800" {...props} />,
                tbody: ({node, ...props}) => <tbody {...props} />,
                tr: ({node, ...props}) => <tr className="border-b border-gray-300 dark:border-neutral-600" {...props} />,
                th: ({node, ...props}) => <th className="border px-3 py-2 text-left font-semibold break-words max-w-[150px] truncate" {...props} />,
                td: ({node, ...props}) => <td className="border border-gray-300 dark:border-neutral-600 px-3 py-2 break-words max-w-[150px] overflow-hidden text-ellipsis" {...props} />,
                a: ({node, ...props}) => <a className="text-blue-500 hover:underline" {...props} />,
                blockquote: ({node, ...props}) => <blockquote className="border-l-4 border-gray-200 pl-4 italic" {...props} />,
                code: ({node, inline, className, children, ...props}: any) => {
                  const match = /language-(\w+)/.exec(className || '');
                  
                  // 处理代码内容，移除可能存在的末尾反引号
                  let codeContent = String(children).replace(/\n$/, '');
                  // 移除末尾的 ``` 如果存在
                  codeContent = codeContent.replace(/```$/, '');
                  
                  return !inline ? (
                    <div className="w-full overflow-x-auto my-3 rounded-md max-w-full">
                      <SyntaxHighlighter
                        language={match ? match[1] : ''}
                        PreTag="div"
                        wrapLongLines={true}
                        customStyle={{
                          borderRadius: '0.375rem',
                          fontSize: '0.75rem',
                          margin: '0.75rem 0',
                          maxWidth: '100%',
                          overflowX: 'auto'
                        }}
                        {...props}
                      >
                        {codeContent}
                      </SyntaxHighlighter>
                    </div>
                  ) : (
                    <code className="text-xs font-mono bg-gray-100 dark:bg-neutral-800 px-1 py-0.5 rounded" {...props}>
                      {children}
                    </code>
                  );
                }
              }}
            >
              {messageText}
            </ReactMarkdown>
          </div>
        </div>
      </div>
    </li>
  );
};

export default InteractiveMessage; 