import React, { useState, useEffect, useRef } from 'react';

// --- API 地址配置 ---
const API_BASE_URL = 'https://plot-ark-backend-885033581194.us-central1.run.app';
const API_ENDPOINTS = {
  generate: `${API_BASE_URL}/api/generate`,
  generateGuest: `${API_BASE_URL}/api/generate-guest`,
  login: `${API_BASE_URL}/api/login`,
  register: `${API_BASE_URL}/api/register`,
  history: `${API_BASE_URL}/api/history`, // ✨ 新增历史记录接口
};

// --- 图标组件 ---
const SunIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>);
const MoonIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>);
const HistoryIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 4v6h6"/><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"/></svg>);
const CloseIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>);


// --- 语言翻译 (增加历史记录相关) ---
const translations = {
    'zh-CN': {
        // ... 其他翻译 ...
        historyButton: "历史记录",
        historyTitle: "灵感档案馆",
        loadButton: "加载此记录",
        emptyHistory: "你还没有任何创作记录哦，快去生成你的第一个大纲吧！",
    },
    'zh-TW': {
        // ... 其他翻译 ...
        historyButton: "歷史記錄",
        historyTitle: "靈感檔案館",
        loadButton: "加載此記錄",
        emptyHistory: "你還沒有任何創作記錄哦，快去生成你的第一個大綱吧！",
    },
    'en': {
        // ... 其他翻译 ...
        historyButton: "History",
        historyTitle: "Inspiration Archive",
        loadButton: "Load this entry",
        emptyHistory: "You don't have any creation history yet. Go generate your first outline!",
    }
};

// --- ✨ 新增：历史记录弹窗组件 ✨ ---
const HistoryModal = ({ t, isDark, history, onLoad, onClose }) => {
    const modalBg = isDark ? "bg-gray-900 border border-gray-700" : "bg-white border border-gray-200";
    const itemBg = isDark ? "bg-gray-800 hover:bg-gray-700/50" : "bg-gray-100 hover:bg-gray-200/50";
    const textMuted = isDark ? "text-gray-400" : "text-gray-500";
    const buttonClasses = isDark ? "bg-purple-600 hover:bg-purple-700" : "bg-blue-600 hover:bg-blue-700";

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className={`w-full max-w-2xl h-[80vh] rounded-xl shadow-2xl flex flex-col ${modalBg}`}>
                <header className="flex justify-between items-center p-4 border-b" style={{borderColor: isDark ? '#374151' : '#e5e7eb'}}>
                    <h2 className="text-2xl font-bold flex items-center gap-2"><HistoryIcon /> {t.historyTitle}</h2>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-500/20"><CloseIcon /></button>
                </header>
                <div className="flex-grow p-4 overflow-y-auto">
                    {history.length === 0 ? (
                        <p className={`text-center py-10 ${textMuted}`}>{t.emptyHistory}</p>
                    ) : (
                        <ul className="space-y-4">
                            {history.map(item => (
                                <li key={item.id} className={`p-4 rounded-lg transition-colors ${itemBg}`}>
                                    <p className="font-semibold truncate">{t.promptLabel}: {item.core_prompt}</p>
                                    <p className={`text-sm ${textMuted} mt-1`}>
                                        {new Date(item.created_at).toLocaleString()}
                                    </p>
                                    <button onClick={() => onLoad(item)} className={`mt-3 px-4 py-2 text-sm text-white font-semibold rounded-md ${buttonClasses}`}>
                                        {t.loadButton}
                                    </button>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </div>
        </div>
    );
};


// ... (Header, AuthPage, MainApp 组件保持不变，但会接收新的 props) ...
const Header = ({ t, isDark, handleThemeToggle, language, handleVariantToggle, handleLanguageToggle, token, isGuest, handleLogout, setIsGuest, onShowHistory }) => {
    const headerTextClasses = isDark ? "text-gray-400 hover:text-white" : "text-gray-500 hover:text-gray-900";
    return (
        <header className="flex justify-between items-center mb-6">
            <div className={`text-2xl font-bold tracking-wider ${isDark ? 'text-white' : 'text-gray-900'}`}>PLOT ARK</div>
            <div className="flex items-center space-x-4">
                { (token || isGuest) && (
                    token ? (
                        <>
                            <button onClick={onShowHistory} className={`text-sm flex items-center gap-1 ${headerTextClasses} transition-colors`}><HistoryIcon />{t.historyButton}</button>
                            <button onClick={handleLogout} className={`text-sm ${headerTextClasses} transition-colors`}>{t.logoutButton}</button>
                        </>
                    ) : (
                        <button onClick={() => setIsGuest(false)} className={`text-sm ${headerTextClasses} transition-colors`}>{t.loginButton}</button>
                    )
                )}
                <button onClick={handleThemeToggle} className={`p-2 rounded-full ${headerTextClasses} transition-colors`} aria-label={t.themeToggle}><isDark ? <SunIcon /> : <MoonIcon /></button>
                {language.startsWith('zh') && (<button onClick={handleVariantToggle} className={`text-sm ${headerTextClasses} transition-colors`}>{t.variantToggle}</button>)}
                <button onClick={handleLanguageToggle} className={`text-sm ${headerTextClasses} transition-colors`}>{t.langToggle}</button>
            </div>
        </header>
    );
};

// ... (AuthPage 和 MainApp 的 JSX 结构不变，但 App 根组件会传递新的函数给它们) ...

// --- 根组件 (大脑) ---
function App() {
  // --- 所有状态都住在这里 ---
  const [language, setLanguage] = useState('zh-CN');
  const [theme, setTheme] = useState('dark');
  const [character1, setCharacter1] = useState('');
  const [gender1, setGender1] = useState('male');
  const [character2, setCharacter2] = useState('');
  const [gender2, setGender2] = useState('male');
  const [plotPrompt, setPlotPrompt] = useState('');
  const [generatedOutline, setGeneratedOutline] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const [token, setToken] = useState(() => localStorage.getItem('plot_ark_token'));
  const [isGuest, setIsGuest] = useState(false);
  const [guestTries, setGuestTries] = useState(() => parseInt(localStorage.getItem('plot_ark_guest_tries') || '2', 10));
  const [authView, setAuthView] = useState('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authMessage, setAuthMessage] = useState('');
  const resultRef = useRef(null);

  // ✨ 新增历史记录相关状态 ✨
  const [history, setHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);

  // --- 所有函数也住在这里 ---
  useEffect(() => {
    // 登录后自动获取历史记录
    if (token) {
        fetchHistory();
    }
  }, [token]);

  const fetchHistory = async () => {
    const currentToken = localStorage.getItem('plot_ark_token');
    if (!currentToken) return;
    try {
        const response = await fetch(API_ENDPOINTS.history, {
            headers: { 'Authorization': `Bearer ${currentToken}` }
        });
        if (!response.ok) throw new Error('Failed to fetch history');
        const data = await response.json();
        setHistory(data);
    } catch (err) {
        console.error(err);
        setError("无法加载历史记录。");
    }
  };

  const handleLoadFromHistory = (item) => {
    // 从历史记录中提取角色和性别信息
    const char1Data = item.character1_setting || "";
    const char2Data = item.character2_setting || "";
    const gender1Match = char1Data.match(/\(Gender: (\w+)\)/);
    const gender2Match = char2Data.match(/\(Gender: (\w+)\)/);
    
    setCharacter1(char1Data.replace(/\s*\(Gender: \w+\)/, ''));
    setGender1(gender1Match ? gender1Match[1].toLowerCase() : 'male');
    setCharacter2(char2Data.replace(/\s*\(Gender: \w+\)/, ''));
    setGender2(gender2Match ? gender2Match[1].toLowerCase() : 'male');
    
    setPlotPrompt(item.core_prompt);
    setGeneratedOutline(item.generated_outline);
    setShowHistory(false); // 关闭弹窗
  };

  const handleSubmit = async (event) => {
    // ... (这个函数逻辑基本不变，只是在成功后会刷新历史记录)
    event.preventDefault(); setIsLoading(true); setGeneratedOutline(''); setError(null);
    if (isGuest && guestTries <= 0) { setError(t.noGuestTries); setIsLoading(false); return; }
    const requestBody = { character1: `${character1} (Gender: ${gender1})`, character2: `${character2} (Gender: ${gender2})`, plot_prompt: plotPrompt, language };
    const headers = { 'Content-Type': 'application/json' };
    let apiEndpoint = isGuest ? API_ENDPOINTS.generateGuest : API_ENDPOINTS.generate;
    if (!isGuest && token) { headers['Authorization'] = `Bearer ${token}`; } 
    else if (!isGuest && !token) { setError("Authentication error. Please log in."); setIsLoading(false); return; }
    try {
      const response = await fetch(apiEndpoint, { method: 'POST', headers: headers, body: JSON.stringify(requestBody) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || `${t.errorPrefix}: ${response.status}`);
      setGeneratedOutline(data.outline);
      if (isGuest) {
          const newTries = guestTries - 1;
          setGuestTries(newTries);
          localStorage.setItem('plot_ark_guest_tries', newTries);
      } else if (token) {
          // ✨ 成功生成后，刷新历史记录 ✨
          fetchHistory();
      }
    } catch (err) { setError(err.message || t.errorConnect); console.error(err); } finally { setIsLoading(false); }
  };

  // ... (其他 handle 函数保持不变) ...
  const handleLanguageToggle = () => setLanguage(lang => lang === 'en' ? 'zh-CN' : 'en');
  const handleVariantToggle = () => { if (language.startsWith('zh')) setLanguage(lang => lang === 'zh-CN' ? 'zh-TW' : 'zh-CN'); };
  const handleThemeToggle = () => setTheme(th => th === 'dark' ? 'light' : 'dark');
  const handleRegister = async (e) => { /* ... */ };
  const handleLogin = async (e) => { /* ... */ };
  const handleLogout = () => { /* ... */ setHistory([]); /* 登出时清空历史记录 */ };
  const handleGuestMode = () => setIsGuest(true);

  const t = translations[language] || translations['en'];
  const isDark = theme === 'dark';
  const containerClasses = isDark ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-800";

  // --- 最终的渲染决定 ---
  return (
    <div className={`min-h-screen p-4 sm:p-8 font-sans transition-colors duration-500 ${containerClasses}`}>
        {/* ✨ 根据 showHistory 状态决定是否渲染弹窗 ✨ */}
        {showHistory && <HistoryModal t={t} isDark={isDark} history={history} onLoad={handleLoadFromHistory} onClose={() => setShowHistory(false)} />}
        
        {/* ... (原有的登录页/主应用页的渲染逻辑保持不变) ... */}
    </div>
  );
}

export default App;


export default App;
