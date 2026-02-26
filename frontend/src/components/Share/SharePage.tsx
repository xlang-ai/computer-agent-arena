import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Spin, Result } from 'antd';
import { Helmet } from 'react-helmet';
import { ConversationSharePreview } from '../Arena/trajectory2';
import { decompressData } from '../../utils/compression';

interface ShareData {
  leftData: any[];
  rightData: any[];
  agent?: string[];
  vlm?: string[];
  evaluationResults?: {
    correctnessL?: number;
    correctnessR?: number;
    safetyL?: number;
    safetyR?: number;
    harmlessL?: number;
    harmlessR?: number;
    quality?: number;
    feedbacksL?: any[];
    feedbacksR?: any[];
    commentA?: string;
    commentB?: string;
  };
}

const SharePage: React.FC = () => {
  const { shareId } = useParams<{ shareId: string }>();
  const [shareData, setShareData] = useState<ShareData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchShareData = async () => {
      try {
        setLoading(true);
        const apiUrl = process.env.REACT_APP_DOMAIN || 'https://arena.xlang.ai';
        console.log(`Fetching data from: ${apiUrl}/share/${shareId}?raw=1`);
        
        const response = await fetch(`${apiUrl}/share/${shareId}?raw=1`);
        
        if (!response.ok) {
          const errorText = await response.text();
          console.error(`API error (${response.status}): ${errorText}`);
          throw new Error(`Failed to fetch share data: ${response.status} ${response.statusText}`);
        }
        
        const rawData = await response.json();
        console.log('Fetched raw data:', rawData);
        
        // Check if data is compressed
        let data;
        if (rawData.compressed && rawData.data) {
          try {
            // Decompress the data
            data = decompressData(rawData.data);
            console.log('Decompressed share data:', data);
          } catch (decompressError) {
            console.error('Error decompressing data:', decompressError);
            throw new Error('Unable to decompress the shared content. The format may be invalid.');
          }
        } else {
          data = rawData;
        }
        
        if (!data.leftData || !data.rightData) {
          throw new Error('Invalid share data format: missing conversation data');
        }
        
        setShareData(data);
        setError(null);
      } catch (err) {
        console.error('Error fetching share data:', err);
        setError(err instanceof Error ? err.message : 'Failed to load shared content. It may have been removed or expired.');
      } finally {
        setLoading(false);
      }
    };

    if (shareId) {
      fetchShareData();
    }
  }, [shareId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spin size="large" tip="Loading shared content..." />
      </div>
    );
  }

  if (error || !shareData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Result
          status="404"
          title="Content Not Found"
          subTitle={error || "The shared content could not be loaded."}
        />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <Helmet>
        <title>Computer Agent Arena - Shared Conversation</title>
        <meta name="description" content="Compare two AI agents in this shared conversation from Computer Agent Arena" />
        
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Computer Agent Arena - Shared Conversation" />
        <meta name="twitter:description" content="Compare two AI agents in this shared conversation" />
        <meta name="twitter:image" content="https://arena.xlang.ai/share/social-preview?raw=1" />
        
        <meta property="og:title" content="Computer Agent Arena - Shared Conversation" />
        <meta property="og:description" content="Compare two AI agents in this shared conversation" />
        <meta property="og:image" content="https://arena.xlang.ai/share/social-preview?raw=1" />
        <meta property="og:url" content={window.location.href} />
        <meta property="og:type" content="website" />
      </Helmet>
      
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="px-4 py-5 sm:p-6">
          {/* <div className="mb-6">
            <h1 className="text-3xl font-bold text-center mb-2">Computer Agent Arena</h1>
            <p className="text-center text-gray-500">
              Compare two AI agents in this shared conversation
            </p>
          </div> */}
          
          <ConversationSharePreview
            leftData={shareData.leftData}
            rightData={shareData.rightData}
            agent={shareData.agent}
            vlm={shareData.vlm}
            evaluationResults={shareData.evaluationResults}
          />
          
          <div className="mt-8 text-center text-sm text-gray-500">
            <p>Try your own conversation at <a href="https://arena.xlang.ai" className="text-blue-500 hover:underline">Computer Agent Arena</a></p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SharePage; 