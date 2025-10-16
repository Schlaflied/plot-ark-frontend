import React, { useState, useEffect, useRef } from 'react';
import { jwtDecode } from 'jwt-decode';
import './App.css';
import './index.css'; // 确保引入样式

// --- 配置: 后端 API 地址 ---
const API_BASE_URL = 'https://plot-ark-backend-vpy736x7ja-uc.a.run.app';

const API_ENDPOINTS = {
  register: `${API_BASE_URL}/api/register`,
  login: `${API_BASE_URL}/api/login`,
  generate: `${API_BASE_URL}/api/generate`,
  history: `${API_BASE_URL}/api/history`,
};

// --- 多语言文本 ---
const translations = {
  zh: {
    title: '灵感方舟',
    authTitle: '欢迎来到灵感方舟',
    authSubtitle: '登录或注册以释放你的创作潜力',
    emailLabel: '邮箱',
    passwordLabel: '密码',
    loginButton: '登录',
    registerButton: '注册',
    guestModeButton: '游客模式 (剩余 {tries} 次)',
    noGuestTries: '游客次数已用尽',
    logoutButton: '退出登录',
    generateButton: '启动方舟',
    generatingButton: '生成中...',
    character1Placeholder: '角色1 (Ash): 外貌，性格，背景故事...',
    character2Placeholder: '角色2 (Eiji): 外貌，性格，背景故事...',
    plotPromptPlaceholder: '核心梗概 (例如：Ash 和 Eiji 在现代东京的第一次相遇)',
    historyTitle: '创作历史',
    deleteButton: '删除',
    confirmDelete: '确定要删除这条历史记录吗？',
    userCredits: '创作点数: {credits}',
    loginToContinue: '登录/注册以继续',
  }
};

// --- 主应用组件 ---
function App() {
  const [lang, setLang] = useState('zh');
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [user, setUser] = useState(null);
  const [currentView, setCurrentView] = useState('auth');
  const [error, setError] = useState('');
  const t = translations[lang];

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    if (storedToken) {
      try {
        const decodedToken = jwtDecode(storedToken);
        if (decodedToken.exp * 1000 < Date.now() - 60000) {
          handleLogout();
        } else {
          setToken(storedToken);
          const storedUser = localStorage.getItem('user');
          if (storedUser) {
            setUser(JSON.parse(storedUser));
          }
          setCurrentView('app');
        }
      } catch (e) {
        console.error("无效的Token格式:", e);
        handleLogout();
      }
    }
  }, []);

  const handleLogin = async (email, password) => {
    setError('');
    try {
      const response = await fetch(API_ENDPOINTS.login, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || '登录失败');
      }
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      setToken(data.token);
      setUser(data.user);
      setCurrentView('app');
    } catch (err) {
      setError(err.message);
    }
  };

  const handleRegister = async (email, password) => {
    setError('');
    try {
      const response = await fetch(API_ENDPOINTS.register, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || '注册失败');
      }
      alert('注册成功！请检查您的邮箱以激活账户。');
    } catch (err) {
      setError(err.message);
    }
  };

  const handleGuestMode = () => {
    setUser(null);
    setToken(null);
    setCurrentView('app');
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
    setCurrentView('auth');
  };

  const updateUserCredits = (newCredits) => {
    if (user) {
      const updatedUser = { ...user, credits: newCredits };
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
    }
  };

  return (
    <div className="App bg-gray-900 text-white min-h-screen font-sans">
      <Header t={t} user={user} onLogout={handleLogout} onLoginClick={() => setCurrentView('auth')} isGuest={!user && currentView === 'app'} />
      <main className="container mx-auto p-4">
        {currentView === 'auth' ? (
          <AuthPage t={t} onLogin={handleLogin} onRegister={handleRegister} onGuestMode={handleGuestMode} error={error} />
        ) : (
          <MainApp t={t} token={token} user={user} updateUserCredits={updateUserCredits} />
        )}
      </main>
    </div>
  );
}

const Header = ({ t, user, onLogout, onLoginClick, isGuest }) => (
    <header className="p-4 flex justify-between items-center bg-gray-800 shadow-md">
      <h1 className="text-2xl font-bold tracking-wider">{t.title}</h1>
      <nav>
        {user ? (
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-300">{t.userCredits.replace('{credits}', user.credits)}</span>
            <span className="text-sm font-medium">{user.email}</span>
            <button onClick={onLogout} className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg transition-colors duration-200">{t.logoutButton}</button>
          </div>
        ) : isGuest ? (
           <button onClick={onLoginClick} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition-colors duration-200">{t.loginToContinue}</button>
        ) : null}
      </nav>
    </header>
);

const AuthPage = ({ t, onLogin, onRegister, onGuestMode, error }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [guestTries, setGuestTries] = useState(() => parseInt(localStorage.getItem('guestTries') || '3'));

    const handleSubmitLogin = (e) => {
        e.preventDefault();
        onLogin(email, password);
    };

    const handleSubmitRegister = (e) => {
        e.preventDefault();
        onRegister(email, password);
    };

    const handleGuestClick = () => {
        if (guestTries > 0) {
            onGuestMode();
        }
    };

    return (
        <div className="max-w-md mx-auto mt-10 p-8 bg-gray-800 rounded-xl shadow-lg">
            <h2 className="text-3xl font-bold text-center mb-2">{t.authTitle}</h2>
            <p className="text-center text-gray-400 mb-8">{t.authSubtitle}</p>
            {error && <p className="bg-red-800 border border-red-600 text-red-200 px-4 py-3 rounded-lg relative mb-6 text-center">{error}</p>}
            <form>
                <div className="mb-4">
                    <label htmlFor="email" className="block text-gray-300 text-sm font-bold mb-2">{t.emailLabel}</label>
                    <input type="email" id="email" value={email} onChange={(e) => setEmail(e.target.value)} className="shadow-inner appearance-none border border-gray-600 rounded-lg w-full py-3 px-4 bg-gray-700 text-white leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div className="mb-6">
                    <label htmlFor="password" className="block text-gray-300 text-sm font-bold mb-2">{t.passwordLabel}</label>
                    <input type="password" id="password" value={password} onChange={(e) => setPassword(e.target.value)} className="shadow-inner appearance-none border border-gray-600 rounded-lg w-full py-3 px-4 bg-gray-700 text-white mb-3 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div className="flex flex-col space-y-4">
                    <button type="button" onClick={handleSubmitLogin} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg w-full transition-colors duration-200">{t.loginButton}</button>
                    <button type="button" onClick={handleSubmitRegister} className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded-lg w-full transition-colors duration-200">{t.registerButton}</button>
                    <button type="button" onClick={handleGuestClick} disabled={guestTries <= 0} className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-3 px-4 rounded-lg w-full transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed">
                        {guestTries > 0 ? t.guestModeButton.replace('{tries}', guestTries) : t.noGuestTries}
                    </button>
                </div>
            </form>
        </div>
    );
};


const MainApp = ({ t, token, user, updateUserCredits }) => {
    const [character1, setCharacter1] = useState('');
    const [character2, setCharacter2] = useState('');
    const [plotPrompt, setPlotPrompt] = useState('');
    const [outline, setOutline] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [history, setHistory] = useState([]);
    const [guestTries, setGuestTries] = useState(() => parseInt(localStorage.getItem('guestTries') || '3'));
    
    const isGuest = !user;
    const outlineRef = useRef(null);

    useEffect(() => {
        if (!isGuest) {
            fetchHistory();
        }
    }, [isGuest, token]);
    
    useEffect(() => {
        if (outline && outlineRef.current) {
            outlineRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [outline]);


    const fetchHistory = async () => {
        if (!token) return;
        try {
            const response = await fetch(API_ENDPOINTS.history, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) {
                const data = await response.json();
                setHistory(data);
            }
        } catch (error) {
            console.error('获取历史记录失败:', error);
        }
    };
    
    const handleDeleteHistory = async (id) => {
        if (window.confirm(t.confirmDelete)) {
             if (!token) return;
             try {
                const response = await fetch(`${API_ENDPOINTS.history}/${id}`, {
                    method: 'DELETE',
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (response.ok) {
                    fetchHistory();
                }
             } catch (error) {
                console.error('删除历史记录失败:', error);
             }
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (isGuest && guestTries <= 0) {
            alert(t.noGuestTries);
            return;
        }

        setIsLoading(true);
        setOutline('');

        const headers = { 'Content-Type': 'application/json' };
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        try {
            const response = await fetch(API_ENDPOINTS.generate, {
                method: 'POST',
                headers: headers,
                body: JSON.stringify({
                    character1: character1,
                    character2: character2,
                    plot_prompt: plotPrompt,
                    language: 'zh-CN' 
                }),
            });
            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.message || '生成大纲时出错');
            }
            setOutline(data.outline);
            if (isGuest) {
                const newTries = guestTries - 1;
                setGuestTries(newTries);
                localStorage.setItem('guestTries', newTries);
            } else if (data.remaining_credits !== undefined) {
                updateUserCredits(data.remaining_credits);
                fetchHistory();
            }
            
        } catch (err) {
            alert(`错误: ${err.message}`);
        } finally {
            setIsLoading(false);
        }
    };
    
    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-6">
            <div className="md:col-span-1">
                <form onSubmit={handleSubmit} className="bg-gray-800 p-6 rounded-xl shadow-lg">
                    <textarea value={character1} onChange={(e) => setCharacter1(e.target.value)} placeholder={t.character1Placeholder} className="textarea-style" rows="5"></textarea>
                    <textarea value={character2} onChange={(e) => setCharacter2(e.target.value)} placeholder={t.character2Placeholder} className="textarea-style" rows="5"></textarea>
                    <textarea value={plotPrompt} onChange={(e) => setPlotPrompt(e.target.value)} placeholder={t.plotPromptPlaceholder} className="textarea-style" rows="3"></textarea>
                    <button type="submit" disabled={isLoading} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-wait">
                        {isLoading ? t.generatingButton : t.generateButton}
                    </button>
                </form>
                 {!isGuest && (
                    <div className="mt-8 bg-gray-800 p-6 rounded-xl shadow-lg">
                        <h3 className="text-xl font-bold mb-4">{t.historyTitle}</h3>
                        <div className="max-h-96 overflow-y-auto pr-2">
                           {history && history.map(item => (
                               <div key={item.id} className="bg-gray-700 p-4 rounded-lg mb-3">
                                   <p className="font-semibold truncate">{item.core_prompt}</p>
                                   <p className="text-xs text-gray-400">{new Date(item.created_at).toLocaleString()}</p>
                                   <button onClick={() => {setPlotPrompt(item.core_prompt); setCharacter1(item.character1_setting); setCharacter2(item.character2_setting);}} className="text-blue-400 hover:text-blue-300 text-xs mr-4">载入</button>
                                   <button onClick={() => handleDeleteHistory(item.id)} className="text-red-400 hover:text-red-300 text-xs">{t.deleteButton}</button>
                               </div>
                           ))}
                        </div>
                    </div>
                 )}
            </div>
            <div className="md:col-span-2 bg-gray-800 p-6 rounded-xl shadow-lg">
                <div ref={outlineRef} className="prose prose-invert max-w-none prose-p:text-gray-300 prose-headings:text-white whitespace-pre-wrap">
                   {isLoading ? <p>灵感正在迸发...</p> : (outline || <p>在这里等待你的灵感方舟起航...</p>)}
                </div>
            </div>
        </div>
    );
};

export default App;

