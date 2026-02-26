import { ConfigProvider } from 'antd';
import enUSIntl from 'antd/lib/locale/en_US';
import Homepage from './components/homepage';
import { AuthProvider } from './context/AuthContext';
import { ArenaProvider } from './context/ArenaContext';
import { GoogleOAuthProvider } from '@react-oauth/google';

function App() {
  return (
    <GoogleOAuthProvider clientId="你的Google客户端ID">
    <div className='App'>
      <ConfigProvider locale={enUSIntl}
        theme={{
          
          components: {
            Segmented: {
              trackBg: '#E8DFF4',
              itemActiveBg: '#CCBFE6',
              itemHoverBg: '#CCBFE6',
              itemSelectedBg: '#CCBFE6',
            },
          },
        }}>
        <AuthProvider>
          <ArenaProvider>
            <Homepage />
          </ArenaProvider>
        </AuthProvider>
      </ConfigProvider>
    </div>
    </GoogleOAuthProvider>
  );
}

export default App;
