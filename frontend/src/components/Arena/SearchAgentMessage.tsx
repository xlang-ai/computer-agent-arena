import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Tooltip } from 'react-tooltip';
import 'react-tooltip/dist/react-tooltip.css';

// Define the annotation type
interface SearchAnnotation {
  title: string;
  url: string;
  snippet?: string; // Make snippet optional
}

interface SearchAgentMessageProps {
  content: any[];
  position: string;
}


// SearchAgentMessage component for rendering Search Agent messages
const SearchAgentMessage: React.FC<SearchAgentMessageProps> = ({ content, position }) => {
  const [isAnnotationsExpanded, setIsAnnotationsExpanded] = useState(false);
  
  // The agent letter based on position
  const agentLetter = position === "left" ? "A" : position === "right" ? "B" : "A";

  // Basic structure for both loading and content states
  if (!content || content.length === 0) {
    return (
      <li className="h-full max-h-full w-full max-w-full flex space-x-2">
        <span className="shrink-0 inline-flex items-center justify-center size-[24px] rounded-full bg-blue-600">
          <span className="text-sm font-medium text-white leading-none">
            {agentLetter}
          </span>
        </span>
        <div className="flex flex-col h-full w-full bg-white border border-gray-200 rounded-lg dark:bg-neutral-900 dark:border-neutral-700">
          <div className="flex-shrink-0 h-[7.5%] flex justify-between items-center px-4 pt-2 border-b border-gray-200 dark:border-neutral-700">
            <span className="text-gray-700 font-medium flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              Search Agent
            </span>
          </div>
          <div className="flex-grow overflow-y-auto p-4">
            <div className="mb-3">
              <div className="flex items-center w-fit bg-gray-100 text-xs rounded-lg px-3 py-2 dark:bg-neutral-800">
                <svg className="w-4 h-4 mr-2 text-gray-600 dark:text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <span className="text-gray-700 font-medium dark:text-gray-300">Searching</span>
                <div className="ml-2 flex space-x-1">
                  <div className="w-1 h-1 bg-gray-400 rounded-full animate-bounce dark:bg-gray-500" style={{ animationDelay: '0ms' }}></div>
                  <div className="w-1 h-1 bg-gray-400 rounded-full animate-bounce dark:bg-gray-500" style={{ animationDelay: '150ms' }}></div>
                  <div className="w-1 h-1 bg-gray-400 rounded-full animate-bounce dark:bg-gray-500" style={{ animationDelay: '300ms' }}></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </li>
    );
  }

  // Process search results
  const searchResults = content.map(item => {
    try {
      // Try to parse the description as JSON if it contains annotations
      if (item.description && typeof item.description === 'string') {
        const parsedData = JSON.parse(item.description);
        return {
          ...item,
          parsedDescription: parsedData
        };
      }


      
    } catch (e) {
      // If parsing fails, return the raw content
      console.error('Failed to parse JSON in search result:', e);
    }
    return item;
  });

  // Get the current active search result
  const currentSearchResult = searchResults[0]; // Always use the first result
  const parsedDescription = currentSearchResult.parsedDescription || {};
  const annotations = parsedDescription.annotations || [];
  const markdownText = parsedDescription.text || currentSearchResult.description;
  
  // Count total results (annotations)
  const totalResults = annotations.length;

  // Function to get domain from URL
  const getDomain = (url: string) => {
    try {
      return new URL(url).hostname;
    } catch (e) {
      return url;
    }
  };

  // Function to get favicon URL
  const getFaviconUrl = (url: string) => {
    try {
      const domain = new URL(url).hostname;
      return `https://www.google.com/s2/favicons?domain=${domain}&sz=64`;
    } catch (e) {
      return '';
    }
  };

  return (
    <li className="h-full max-h-full w-full max-w-full flex space-x-2 max-md:space-x-1">
      <span className="shrink-0 inline-flex items-center justify-center size-[24px] rounded-full bg-blue-600 max-md:size-[20px]">
        <span className="text-sm max-md:text-xs font-medium text-white leading-none">
          {agentLetter}
        </span>
      </span>
      <div className="flex flex-col h-full w-[95%] max-w-full bg-white border border-gray-200 rounded-lg dark:bg-neutral-900 dark:border-neutral-700">
        <div className="flex-shrink-0 h-[7.5%] flex justify-between items-center px-4 max-md:px-2 pt-2 border-b border-gray-200 dark:border-neutral-700">
          <span className="text-gray-700 font-medium flex items-center max-md:text-sm">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 max-md:h-3 max-md:w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            Search Agent
          </span>
        </div>
        
        <div className="flex-grow overflow-y-auto p-4 max-md:p-2">
          {/* If there are annotations, show the collapsible results summary */}
          {annotations.length > 0 && (
            <div className="mb-3 max-md:mb-2">
              <div 
                className="flex items-center w-fit bg-gray-100 text-xs max-md:text-[10px] rounded-lg px-4 max-md:px-2 py-2 max-md:py-1 cursor-pointer hover:bg-gray-200 transition-colors"
                onClick={() => setIsAnnotationsExpanded(!isAnnotationsExpanded)}
              >
                <svg className="w-4 h-4 mr-2 max-md:w-3 max-md:h-3 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <span className="text-gray-700 font-medium">Found {totalResults} results</span>
                <svg 
                  className={`w-4 h-4 ml-2 max-md:w-3 max-md:h-3 text-gray-600 transition-transform ${isAnnotationsExpanded ? 'rotate-90' : ''}`} 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>

              {/* Display search result annotations (collapsible) */}
              {isAnnotationsExpanded && (
                <div className="mt-2 border border-gray-200 dark:border-neutral-700 rounded-lg overflow-hidden">
                  {annotations.map((annotation: SearchAnnotation, idx: number) => (
                    <div key={idx} className="border-t border-gray-200 bg-gray-50 my-1 rounded-lg dark:border-neutral-700 first:border-t-0">
                      <div className="px-4 max-md:px-2 py-1 hover:bg-gray-50 dark:hover:bg-neutral-800 transition-colors">
                        {/* Website icon and domain */}
                        <div className="flex items-center mb-1">
                          <img 
                            src={getFaviconUrl(annotation.url)} 
                            alt=""
                            className="w-2 h-2 mr-2"
                            onError={(e) => {
                              (e.target as HTMLImageElement).style.display = 'none';
                            }}
                          />
                          <span className="text-[6pt] max-md:text-[5pt] text-gray-500 dark:text-gray-400">
                            {getDomain(annotation.url)}
                          </span>
                        </div>
                        
                        {/* Title */}
                        <a 
                          href={annotation.url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="block text-[8pt] max-md:text-[7pt] font-medium text-gray-900 dark:text-gray-100 hover:underline mb-1"
                        >
                          {annotation.title}
                        </a>
                        
                        {/* Snippet if available */}
                        {annotation.snippet && (
                          <p className="text-xs max-md:text-[9px] text-gray-600 dark:text-gray-300 line-clamp-2">
                            {annotation.snippet}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Display Markdown content */}
          <div className="prose prose-sm max-w-none max-md:prose-xs">
            <ReactMarkdown
              components={{
                h1: ({node, ...props}) => <h1 className="text-base max-md:text-sm font-semibold my-2 max-md:my-1.5" {...props} />,
                h2: ({node, ...props}) => <h2 className="text-sm max-md:text-xs font-semibold my-2 max-md:my-1.5" {...props} />,
                h3: ({node, ...props}) => <h3 className="text-sm max-md:text-xs font-semibold my-1.5 max-md:my-1" {...props} />,
                h4: ({node, ...props}) => <h4 className="text-xs max-md:text-[10px] font-semibold my-1 max-md:my-0.5" {...props} />,
                h5: ({node, ...props}) => <h5 className="text-xs max-md:text-[10px] font-semibold my-1 max-md:my-0.5" {...props} />,
                h6: ({node, ...props}) => <h6 className="text-xs max-md:text-[10px] font-semibold my-1 max-md:my-0.5" {...props} />,
                p: ({node, ...props}) => <p className="text-sm max-md:text-xs my-2 max-md:my-1.5" {...props} />,
                ul: ({node, ...props}) => <ul className="list-disc pl-5 max-md:pl-4 my-2 max-md:my-1.5 text-sm max-md:text-xs" {...props} />,
                ol: ({node, ...props}) => <ol className="list-decimal pl-5 max-md:pl-4 my-2 max-md:my-1.5 text-sm max-md:text-xs" {...props} />,
                li: ({node, ...props}) => <li className="my-1 max-md:my-0.5" {...props} />,
                strong: ({node, ...props}) => <strong className="font-semibold" {...props} />,
                table: ({node, ...props}) => <table className="my-4 max-md:my-2 border-collapse border border-gray-300 dark:border-neutral-600 text-xs max-md:text-[10px] w-full" {...props} />,
                thead: ({node, ...props}) => <thead className="bg-gray-100 dark:bg-neutral-800" {...props} />,
                tbody: ({node, ...props}) => <tbody {...props} />,
                tr: ({node, ...props}) => <tr className="border-b border-gray-300 dark:border-neutral-600" {...props} />,
                th: ({node, ...props}) => <th className="border px-3 py-2 text-left font-semibold" {...props} />,
                td: ({node, ...props}) => <td className="border border-gray-300 dark:border-neutral-600 px-3 py-2" {...props} />,
                a: ({node, href, children, ...props}) => {
                  // Find if this link matches any annotation URL
                  const matchingAnnotation = annotations.find((ann: { url: string | undefined; }) => ann.url === href);
                  
                  if (matchingAnnotation && href) {
                    // For links that match annotations, render the text without the link styling
                    // and add a citation reference after it
                    const domain = getDomain(matchingAnnotation.url);
                    const tooltipId = `tooltip-${href.replace(/[^a-zA-Z0-9]/g, '-')}`;
                    
                    return (
                      <span className="inline-flex items-baseline">
                        <span className="text-gray-900 dark:text-gray-100">{children}</span>
                        <a 
                          href={href}
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="inline-flex ml-1 text-xs cursor-pointer"
                          data-tooltip-id={tooltipId}
                          data-tooltip-place="top"
                        >
                          <span className="text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-neutral-800 px-1.5 py-0.5 rounded text-xs font-medium hover:bg-gray-200 dark:hover:bg-neutral-700 transition-colors">
                            {domain}
                          </span>
                          
                          <Tooltip 
                            id={tooltipId}
                            className="z-50 max-w-xs"
                            style={{ 
                              backgroundColor: "white", 
                              color: "black", 
                              border: "1px solid #e5e7eb",
                              boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
                              padding: 0,
                              opacity: 1,
                              maxWidth: "320px"
                            }}
                          >
                            <div className="w-full">
                              <div className="flex items-center px-4 py-2 bg-gray-100 border-b border-gray-200">
                                <img 
                                  src={getFaviconUrl(matchingAnnotation.url)} 
                                  alt=""
                                  className="w-4 h-4 mr-2"
                                  onError={(e) => {
                                    (e.target as HTMLImageElement).style.display = 'none';
                                  }}
                                />
                                <span className="text-xs text-gray-500">{domain}</span>
                              </div>
                              
                              <div className="px-4 py-2 bg-white">
                                <h3 className="text-xs font-medium text-gray-900">
                                  {matchingAnnotation.title}
                                </h3>
                                
                                {matchingAnnotation.snippet && (
                                  <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                                    {matchingAnnotation.snippet}
                                  </p>
                                )}
                              </div>
                            </div>
                          </Tooltip>
                        </a>
                      </span>
                    );
                  }
                  
                  // Default link rendering for non-annotation links
                  return <a href={href} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline dark:text-blue-400" {...props}>{children}</a>;
                },
                blockquote: ({node, ...props}) => <blockquote className="border-l-4 border-gray-200 pl-4 italic" {...props} />,
                code: ({node, inline, className, children, ...props}: any) => {
                  const match = /language-(\w+)/.exec(className || '');
                  
                  // 处理代码内容，移除可能存在的末尾反引号
                  let codeContent = String(children).replace(/\n$/, '');
                  // 移除末尾的 ``` 如果存在
                  codeContent = codeContent.replace(/```$/, '');
                  
                  return !inline ? (
                    <div className="w-full overflow-x-auto my-3 max-md:my-2 rounded-md max-w-full">
                      <SyntaxHighlighter
                        language={match ? match[1] : ''}
                        PreTag="div"
                        wrapLongLines={true}
                        customStyle={{
                          borderRadius: '0.375rem',
                          fontSize: '0.75rem',
                          margin: '0.75rem 0',
                          maxWidth: '100%',
                          overflowX: 'auto',
                          '@media (max-width: 768px)': {
                            fontSize: '0.625rem',
                            margin: '0.5rem 0',
                          }
                        }}
                        {...props}
                      >
                        {codeContent}
                      </SyntaxHighlighter>
                    </div>
                  ) : (
                    <code className="text-xs max-md:text-[10px] font-mono bg-gray-100 dark:bg-neutral-800 px-1 py-0.5 rounded" {...props}>
                      {children}
                    </code>
                  );
                }

              }}
              remarkPlugins={[remarkGfm]}
            >
              {markdownText}
            </ReactMarkdown>
          </div>
        </div>
      </div>
    </li>
  );
};

export default SearchAgentMessage; 