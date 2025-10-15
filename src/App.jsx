import React, { useState, useEffect, useRef } from 'react';

// --- API 地址配置 ---
// 保持你的 Cloud Run 地址不变
const API_BASE_URL = 'https://plot-ark-backend-885033581194.us-central1.run.app';
const API_ENDPOINTS = {
  generate: `${API_BASE_URL}/api/generate`,
  // ❌ 删除了不存在的 generateGuest 接口
  login: `${API_BASE_URL}/api/login`,
  register: `${API_BASE_URL}/api/register`,
  history: `${API_BASE_URL}/api/history`,
};

// --- 图标组件 (保持不变) ---
const SunIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>);
const MoonIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>);
const HistoryIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 4v6h6"/><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"/></svg>);
const CloseIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>);
const TrashIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>);
const UserIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>);
const CreditIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="7"/><polyline points="8.21 13.89 7 23 12 17 17 23 15.79 13.88"/></svg>);

// --- 语言翻译 (新增了和点数、用户相关的内容) ---
const translations = {
    'zh-CN': {
        title: "灵感方舟 🚀", subtitle: "输入CP设定与梗概，生成专属你的故事大纲", char1Label: "角色 1", char2Label: "角色 2", genderLabel: "性别", genderOptions: { male: '男', female: '女', nonbinary: '无性别', unspecified: '未指定' }, promptLabel: "核心梗 / 场景", submitButton: "启动方舟", generatingButton: "生成中...", resultTitle: "生成的大纲", errorPrefix: "出错啦", errorConnect: "生成大纲时遇到问题，请检查后端服务是否正常运行。", langToggle: "Switch to English", variantToggle: "切换到繁体", themeToggle: "切换主题", 
        char1Default: "例如：亚修·林克斯，一个在纽约街头长大、背景复杂、魅力超凡的金发少年…",
        char2Default: "例如：奥村英二，一位善良的日本摄影师，他成为了亚修生命中坚定不移的光…",
        promptDefault: "例如：如果多年以后，他们在现代日本重逢，而亚修失去了记忆，会发生什么？",
        loginTitle: "登录方舟", registerTitle: "注册新账号", emailLabel: "邮箱", passwordLabel: "密码", loginButton: "登录", registerButton: "注册", switchToRegister: "还没有账号？点此注册", switchToLogin: "已有账号？点此登录", logoutButton: "登出", authError: "认证失败，请检查邮箱或密码。", registerSuccess: "注册成功！请检查邮箱以激活账户。", registerError: "注册失败，该邮箱可能已被使用。", guestModeButton: "游客模式 (剩余 {tries} 次)", noGuestTries: "游客次数已用完", historyButton: "历史记录", historyTitle: "灵感档案馆", loadButton: "加载此记录", emptyHistory: "你还没有任何创作记录哦，快去生成你的第一个大纲吧！", deleteButton: "删除", confirmDelete: "你确定要永久删除这条灵感记录吗？", credits: "创作点数", notVerified: "账户未激活，请检查邮箱", insufficientCredits: "创作点数不足，请充值。",
    },
    'zh-TW': {
        title: "靈感方舟 🚀", subtitle: "輸入CP設定與梗概，生成專屬你的故事大綱", char1Label: "角色 1", char2Label: "角色 2", genderLabel: "性別", genderOptions: { male: '男', female: '女', nonbinary: '無性別', unspecified: '未指定' }, promptLabel: "核心梗 / 場景", submitButton: "啟動方舟", generatingButton: "生成中...", resultTitle: "生成的大綱", errorPrefix: "出錯啦", errorConnect: "生成大綱時遇到問題，請檢查後端服務是否正常運行。", langToggle: "Switch to English", variantToggle: "切換到簡體", themeToggle: "切換主題", 
        char1Default: "例如：亞修·林克斯，一個在紐約街頭長大、背景複雜、魅力超凡的金髮少年…",
        char2Default: "例如：奧村英二，一位善良的日本攝影師，他成為了亞修生命中堅定不移的光…",
        promptDefault: "例如：如果多年以後，他們在現代日本重逢，而亞修失去了記憶，會發生什麼？",
        loginTitle: "登錄方舟", registerTitle: "註冊新帳號", emailLabel: "郵箱", passwordLabel: "密碼", loginButton: "登錄", registerButton: "註冊", switchToRegister: "還沒有帳號？點此註冊", switchToLogin: "已有帳號？點此登錄", logoutButton: "登出", authError: "認證失敗，請檢查郵箱或密碼。", registerSuccess: "註冊成功！請檢查郵箱以激活帳戶。", registerError: "註冊失敗，該郵箱可能已被使用。", guestModeButton: "遊客模式 (剩餘 {tries} 次)", noGuestTries: "遊客次數已用完", historyButton: "歷史記錄", historyTitle: "靈感檔案館", loadButton: "加載此記錄", emptyHistory: "你還沒有任何創作記錄哦，快去生成你的第一個大綱吧！", deleteButton: "刪除", confirmDelete: "你確定要永久刪除這條靈感記錄嗎？", credits: "創作點數", notVerified: "帳戶未激活，請檢查郵箱", insufficientCredits: "創作點數不足，請充值。",
    },
    'en': {
        title: "Plot Ark 🚀", subtitle: "Enter CP settings and a plot prompt to generate your unique story outline.", char1Label: "Character 1", char2Label: "Character 2", genderLabel: "Gender", genderOptions: { male: 'Male', female: 'Female', nonbinary: 'Non-binary', unspecified: 'Not Specified' }, promptLabel: "Core Prompt / Scene", submitButton: "Launch Ark", generatingButton: "Generating...", resultTitle: "Generated Outline", errorPrefix: "Error", errorConnect: "Failed to fetch outline. Please check if the backend service is running correctly.", langToggle: "切换到中文", variantToggle: "", themeToggle: "Toggle Theme", 
        char1Default: "e.g., Ash Lynx, a charismatic youth with a complex background from New York...",
        char2Default: "e.g., Eiji Okumura, a kind-hearted Japanese photographer who becomes Ash's light...",
        promptDefault: "e.g., What if they met again years later in modern Japan, and Ash has lost his memories?",
        loginTitle: "Login to the Ark", registerTitle: "Register a New Account", emailLabel: "Email", passwordLabel: "Password", loginButton: "Login", registerButton: "Register", switchToRegister: "No account yet? Register here", switchToLogin: "Already have an account? Login here", logoutButton: "Logout", authError: "Authentication failed. Please check your email or password.", registerSuccess: "Registration successful! Please check your email to activate.", registerError: "Registration failed. The email might already be in use.", guestModeButton: "Guest Mode ({tries} left)", noGuestTries: "Guest tries finished", historyButton: "History", historyTitle: "Inspiration Archive", loadButton: "Load this entry", emptyHistory: "You don't have any creation history yet. Go generate your first outline!", deleteButton: "Delete", confirmDelete: "Are you sure you want to permanently delete this inspiration entry?", credits: "Credits", notVerified: "Account not verified, please check your email", insufficientCredits: "Insufficient credits, please top up.",
    }
};

// --- 子组件 ---
const HistoryModal = ({ t, isDark, history, onLoad, onClose, onDelete }) => {
    // ... (保持不变)
    const modalBg = isDark ? "bg-gray-900 border border-gray-700" : "bg-white border border-gray-200";
    const itemBg = isDark ? "bg-gray-800 hover:bg-gray-700/50" : "bg-gray-100 hover:bg-gray-200/50";
    const textMuted = isDark ? "text-gray-400" : "text-gray-500";
    const loadButtonClasses = isDark ? "bg-purple-600 hover:bg-purple-700" : "bg-blue-600 hover:bg-blue-700";
    const deleteButtonClasses = isDark ? "bg-red-800 hover:bg-red-700" : "bg-red-600 hover:bg-red-500";
    return (<div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"><div className={`w-full max-w-2xl h-[80vh] rounded-xl shadow-2xl flex flex-col ${modalBg}`}><header className="flex justify-between items-center p-4 border-b" style={{borderColor: isDark ? '#374151' : '#e5e7eb'}}><h2 className="text-2xl font-bold flex items-center gap-2"><HistoryIcon /> {t.historyTitle}</h2><button onClick={onClose} className="p-2 rounded-full hover:bg-gray-500/20"><CloseIcon /></button></header><div className="flex-grow p-4 overflow-y-auto">{history.length === 0 ? (<p className={`text-center py-10 ${textMuted}`}>{t.emptyHistory}</p>) : (<ul className="space-y-4">{history.map(item => (<li key={item.id} className={`p-4 rounded-lg transition-colors ${itemBg}`}><p className="font-semibold truncate">{t.promptLabel}: {item.core_prompt}</p><p className={`text-sm ${textMuted} mt-1`}>{new Date(item.created_at).toLocaleString()}</p><div className="flex items-center gap-2 mt-3"><button onClick={() => onLoad(item)} className={`px-4 py-2 text-sm text-white font-semibold rounded-md ${loadButtonClasses}`}>{t.loadButton}</button><button onClick={() => onDelete(item.id)} className={`px-4 py-2 text-sm text-white font-semibold rounded-md flex items-center gap-1 ${deleteButtonClasses}`}><TrashIcon /> {t.deleteButton}</button></div></li>))}</ul>)}</div></div></div>);
};

const Header = ({ t, isDark, handleThemeToggle, language, handleVariantToggle, handleLanguageToggle, user, handleLogout, onShowHistory }) => {
    const headerTextClasses = isDark ? "text-gray-400 hover:text-white" : "text-gray-500 hover:text-gray-900";
    return (<header className="flex justify-between items-center mb-6"><div className={`text-2xl font-bold tracking-wider ${isDark ? 'text-white' : 'text-gray-900'}`}>PLOT ARK</div><div className="flex items-center space-x-4">{user ? (<><div className="flex items-center gap-4 text-sm"><span className={`flex items-center gap-1 ${headerTextClasses}`}><UserIcon /> {user.email}</span><span className={`flex items-center gap-1 font-semibold ${isDark ? 'text-purple-400' : 'text-blue-600'}`}><CreditIcon /> {user.credits} {t.credits}</span></div><button onClick={onShowHistory} className={`text-sm flex items-center gap-1 ${headerTextClasses} transition-colors`}><HistoryIcon />{t.historyButton}</button><button onClick={handleLogout} className={`text-sm ${headerTextClasses} transition-colors`}>{t.logoutButton}</button></>) : null}<button onClick={handleThemeToggle} className={`p-2 rounded-full ${headerTextClasses} transition-colors`} aria-label={t.themeToggle}>{isDark ? <SunIcon /> : <MoonIcon />}</button>{language.startsWith('zh') && (<button onClick={handleVariantToggle} className={`text-sm ${headerTextClasses} transition-colors`}>{t.variantToggle}</button>)}<button onClick={handleLanguageToggle} className={`text-sm ${headerTextClasses} transition-colors`}>{t.langToggle}</button></div></header>);
};

const AuthPage = ({ commonProps, authProps }) => {
    // ... (基本不变，但更新了按钮文本)
    const { t, isDark } = commonProps;
    const { authView, setAuthView, email, setEmail, password, setPassword, isLoading, authMessage, handleLogin, handleRegister, handleGuestMode, guestTries } = authProps;
    const isLoginView = authView === 'login';
    const formClasses = isDark ? "bg-gray-800/50 backdrop-blur-sm border border-gray-700" : "bg-white/80 backdrop-blur-sm border border-gray-200";
    const labelClasses = isDark ? "text-gray-300" : "text-gray-700";
    const inputClasses = isDark ? "bg-gray-900 border-gray-700 text-white focus:border-purple-500" : "bg-white border-gray-300 text-gray-900 focus:border-blue-500";
    const focusRingClasses = isDark ? "focus:ring-purple-500" : "focus:ring-blue-500";
    const buttonClasses = isDark ? "bg-purple-600 hover:bg-purple-700 shadow-lg shadow-purple-900/50" : "bg-blue-600 hover:bg-blue-700";
    const guestButtonClasses = isDark ? "bg-gray-600 hover:bg-gray-700" : "bg-gray-500 hover:bg-gray-600";
    const authLinkClasses = isDark ? "text-purple-400 hover:text-purple-300" : "text-blue-600 hover:text-blue-500";
    return (<div className="w-full max-w-md mx-auto"><div className="text-center py-10"><h1 className={`text-5xl font-extrabold ${isDark ? 'text-white' : 'text-gray-900'}`}>{t.title}</h1><p className={`mt-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t.subtitle}</p></div><div className={`w-full p-8 space-y-6 rounded-xl shadow-2xl ${formClasses}`}><h1 className={`text-3xl font-extrabold text-center ${isDark ? 'text-white' : 'text-gray-900'}`}>{isLoginView ? t.loginTitle : t.registerTitle}</h1><form onSubmit={isLoginView ? handleLogin : handleRegister} className="space-y-6"><div><label className={`block text-sm font-medium ${labelClasses}`}>{t.emailLabel}</label><input type="email" value={email} onChange={e => setEmail(e.target.value)} required className={`mt-1 w-full rounded-md p-3 focus:outline-none transition-colors border ${inputClasses} ${focusRingClasses}`} /></div><div><label className={`block text-sm font-medium ${labelClasses}`}>{t.passwordLabel}</label><input type="password" value={password} onChange={e => setPassword(e.target.value)} required className={`mt-1 w-full rounded-md p-3 focus:outline-none transition-colors border ${inputClasses} ${focusRingClasses}`} /></div>{authMessage && <p className={`text-sm ${authMessage.includes('成功') ? 'text-green-400' : 'text-red-400'}`}>{authMessage}</p>}<div className="flex flex-col space-y-4 pt-2"><button type="submit" disabled={isLoading} className={`w-full text-white font-bold py-3 px-8 rounded-lg transition-all duration-300 disabled:bg-gray-600 disabled:cursor-not-allowed ${buttonClasses}`}>{isLoading ? t.generatingButton : (isLoginView ? t.loginButton : t.registerButton)}</button><button type="button" onClick={handleGuestMode} disabled={guestTries <= 0} className={`w-full text-white font-bold py-3 px-8 rounded-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed ${guestButtonClasses}`}>{guestTries > 0 ? t.guestModeButton.replace('{tries}', guestTries) : t.noGuestTries}</button></div></form><p className="text-center text-sm"><button onClick={() => { setAuthView(isLoginView ? 'register' : 'login'); setAuthMessage(''); }} className={`font-medium transition-colors ${authLinkClasses}`}>{isLoginView ? t.switchToRegister : t.switchToLogin}</button></p></div></div>);
};

const MainApp = ({ commonProps, appProps }) => {
    // ... (基本不变)
    const { t, isDark } = commonProps;
    const { character1, setCharacter1, gender1, setGender1, character2, setCharacter2, gender2, setGender2, plotPrompt, setPlotPrompt, handleSubmit, isLoading, error, generatedOutline, resultRef } = appProps;
    const subtitleClasses = isDark ? "text-gray-400" : "text-gray-500";
    const formClasses = isDark ? "bg-gray-800/50 backdrop-blur-sm border border-gray-700" : "bg-white/80 backdrop-blur-sm border border-gray-200";
    const labelClasses = isDark ? "text-gray-300" : "text-gray-700";
    const inputClasses = isDark ? "bg-gray-900 border-gray-700 text-white focus:border-purple-500" : "bg-white border-gray-300 text-gray-900 focus:border-blue-500";
    const focusRingClasses = isDark ? "focus:ring-purple-500" : "focus:ring-blue-500";
    const optionClasses = isDark ? "bg-gray-900 text-white" : "bg-white text-gray-900";
    const buttonClasses = isDark ? "bg-purple-600 hover:bg-purple-700 shadow-lg shadow-purple-900/50" : "bg-blue-600 hover:bg-blue-700";
    const errorClasses = isDark ? "bg-red-900/50 border-red-700 text-red-200" : "bg-red-100 border-red-300 text-red-800";
    const resultContainerClasses = isDark ? "bg-gray-800/50 backdrop-blur-sm border border-gray-700" : "bg-white/80 backdrop-blur-sm border border-gray-200";
    const resultTitleClasses = isDark ? "text-white" : "text-gray-900";
    const resultTextClasses = isDark ? "prose-invert text-gray-300" : "text-gray-700";
    return (<div className="w-full max-w-7xl mx-auto"><Header {...commonProps} /><div className="text-center my-12 sm:my-16"><h1 className={`text-4xl sm:text-6xl font-extrabold mb-4 tracking-tight ${isDark ? 'text-white' : 'text-gray-900'}`}>{t.title}</h1><p className={`text-lg ${subtitleClasses}`}>{t.subtitle}</p></div><div className="grid grid-cols-1 lg:grid-cols-2 lg:gap-8"><div className="lg:col-span-1 lg:sticky lg:top-8 h-fit"><form onSubmit={handleSubmit} className={`p-6 sm:p-8 rounded-xl shadow-2xl space-y-6 transition-colors duration-500 ${formClasses}`}><div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-6"><div className="space-y-2"><label className={`block text-base font-medium ${labelClasses}`}>{t.char1Label}</label><textarea rows="6" value={character1} onChange={(e) => setCharacter1(e.target.value)} placeholder={t.char1Default} className={`w-full rounded-md p-3 focus:outline-none transition-colors border ${inputClasses} ${focusRingClasses}`} /><select value={gender1} onChange={(e) => setGender1(e.target.value)} className={`w-full rounded-md p-3 focus:outline-none ${inputClasses} ${focusRingClasses}`}>{Object.entries(t.genderOptions).map(([key, value]) => (<option key={key} value={key} className={optionClasses}>{value}</option>))}</select></div><div className="space-y-2"><label className={`block text-base font-medium ${labelClasses}`}>{t.char2Label}</label><textarea rows="6" value={character2} onChange={(e) => setCharacter2(e.target.value)} placeholder={t.char2Default} className={`w-full rounded-md p-3 focus:outline-none transition-colors border ${inputClasses} ${focusRingClasses}`} /><select value={gender2} onChange={(e) => setGender2(e.target.value)} className={`w-full rounded-md p-3 focus:outline-none ${inputClasses} ${focusRingClasses}`}>{Object.entries(t.genderOptions).map(([key, value]) => (<option key={key} value={key} className={optionClasses}>{value}</option>))}</select></div></div><div className="pt-4"><label htmlFor="prompt" className={`block text-base font-medium mb-2 ${labelClasses}`}>{t.promptLabel}</label><textarea id="prompt" rows="5" value={plotPrompt} onChange={(e) => setPlotPrompt(e.target.value)} placeholder={t.promptDefault} className={`w-full rounded-md p-3 focus:outline-none transition-colors border ${inputClasses} ${focusRingClasses}`} /></div><div className="text-center pt-4"><button type="submit" disabled={isLoading} className={`text-white font-bold py-3 px-8 rounded-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed ${buttonClasses}`}>{isLoading ? t.generatingButton : t.submitButton}</button></div></form></div><div className="lg:col-span-1 mt-8 lg:mt-0"><div ref={resultRef} className="min-h-[200px]">{error && <div className={`p-4 rounded-lg ${errorClasses}`}>{error}</div>}{generatedOutline && (<div className={`p-6 sm:p-8 rounded-xl shadow-2xl transition-colors duration-500 ${resultContainerClasses}`}><h2 className={`text-3xl font-bold mb-4 ${resultTitleClasses}`}>{t.resultTitle}</h2><div className="max-h-[70vh] overflow-y-auto pr-3"><div className={`prose max-w-none whitespace-pre-wrap leading-relaxed ${resultTextClasses}`}>{generatedOutline}</div></div></div>)}</div></div></div></div>);
};


// --- 根组件 (大脑) ---
function App() {
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
  
  // ✨ 用户状态管理重构
  const [user, setUser] = useState(null); // 用一个 user 对象管理所有用户信息
  const [token, setToken] = useState(() => localStorage.getItem('plot_ark_token'));
  
  // ✨ 游客模式重构
  const [guestTries, setGuestTries] = useState(() => parseInt(localStorage.getItem('plot_ark_guest_tries') || '3', 10));

  const [authView, setAuthView] = useState('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authMessage, setAuthMessage] = useState('');
  const resultRef = useRef(null);

  const [history, setHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);

  // 检查初始登录状态
  useEffect(() => {
    if (token) {
      // 可以在这里加一个 /api/profile 接口来验证token并获取最新的用户信息
      // 简单起见, 我们先从 localStorage 恢复
      const savedUser = localStorage.getItem('plot_ark_user');
      if (savedUser) {
        setUser(JSON.parse(savedUser));
      }
      fetchHistory();
    }
  }, [token]);

  const fetchHistory = async () => {
    const currentToken = localStorage.getItem('plot_ark_token');
    if (!currentToken) return;
    try {
        const response = await fetch(API_ENDPOINTS.history, { headers: { 'Authorization': `Bearer ${currentToken}` } });
        if (!response.ok) throw new Error('Failed to fetch history');
        const data = await response.json();
        setHistory(data);
    } catch (err) { console.error(err); }
  };

  const handleLoadFromHistory = (item) => {
    setCharacter1(item.character1_setting || '');
    setCharacter2(item.character2_setting || '');
    setPlotPrompt(item.core_prompt);
    setGeneratedOutline(item.generated_outline);
    setShowHistory(false);
  };
  
  // ✅ 统一的 handleSubmit, 彻底修复逻辑
  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsLoading(true);
    setGeneratedOutline('');
    setError(null);

    // 游客模式用匿名 token
    const isGuestMode = !user; 
    let authToken = token;

    if (isGuestMode) {
        if (guestTries <= 0) {
            setError(t.noGuestTries);
            setIsLoading(false);
            return;
        }
        // 游客模式我们不发送 token，让后端处理
        authToken = null; 
    }

    const requestBody = { character1, character2, plot_prompt: plotPrompt, language };
    const headers = { 'Content-Type': 'application/json' };
    
    // 只有登录用户才需要发送 Authorization header
    if (authToken) {
        headers['Authorization'] = `Bearer ${authToken}`;
    }

    try {
      // 统一请求 /api/generate 接口
      const response = await fetch(API_ENDPOINTS.generate, { method: 'POST', headers: headers, body: JSON.stringify(requestBody) });
      const data = await response.json();
      
      if (!response.ok) {
        // 根据后端返回的错误类型显示不同信息
        if (data.error === 'not_verified') throw new Error(t.notVerified);
        if (data.error === 'insufficient_credits') throw new Error(t.insufficientCredits);
        throw new Error(data.message || 'An error occurred');
      }

      setGeneratedOutline(data.outline);

      if (isGuestMode) {
          const newTries = guestTries - 1;
          setGuestTries(newTries);
          localStorage.setItem('plot_ark_guest_tries', newTries);
      } else {
          // 更新用户点数信息并重新获取历史
          setUser(prevUser => ({ ...prevUser, credits: data.remaining_credits }));
          localStorage.setItem('plot_ark_user', JSON.stringify({ ...user, credits: data.remaining_credits }));
          fetchHistory();
      }
    } catch (err) { 
        setError(err.message || t.errorConnect); 
        console.error(err); 
    } finally { 
        setIsLoading(false); 
        resultRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  };


  const handleLanguageToggle = () => setLanguage(lang => lang === 'en' ? 'zh-CN' : 'en');
  const handleVariantToggle = () => { if (language.startsWith('zh')) setLanguage(lang => lang === 'zh-CN' ? 'zh-TW' : 'zh-CN'); };
  const handleThemeToggle = () => setTheme(th => th === 'dark' ? 'light' : 'dark');

  const handleRegister = async (e) => {
      e.preventDefault(); setIsLoading(true); setAuthMessage('');
      try {
        const response = await fetch(API_ENDPOINTS.register, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, password }) });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || t.registerError);
        setAuthMessage(t.registerSuccess);
        setAuthView('login');
        // 如果后端在注册成功时返回了测试用的验证链接, 可以在控制台打印出来方便测试
        if (data.verification_url_for_testing) {
            console.log("TESTING: Verification URL -> ", data.verification_url_for_testing);
        }
      } catch (err) { setAuthMessage(err.message); } finally { setIsLoading(false); }
  };

  const handleLogin = async (e) => {
      e.preventDefault(); setIsLoading(true); setAuthMessage('');
      try {
        const response = await fetch(API_ENDPOINTS.login, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, password }) });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || t.authError);
        localStorage.setItem('plot_ark_token', data.token);
        localStorage.setItem('plot_ark_user', JSON.stringify(data.user)); // 保存用户信息
        setToken(data.token);
        setUser(data.user);
      } catch (err) { setAuthMessage(err.message); } finally { setIsLoading(false); }
  };

  const handleLogout = () => {
      localStorage.removeItem('plot_ark_token');
      localStorage.removeItem('plot_ark_user');
      setToken(null);
      setUser(null);
      setHistory([]);
  };

  // ✅ 游客模式现在只是一个状态，不再需要 token
  const handleGuestMode = () => setUser(null); 
  
  const handleDeleteHistoryItem = async (promptId) => {
    if (window.confirm(t.confirmDelete)) {
        const currentToken = localStorage.getItem('plot_ark_token');
        if (!currentToken) return;
        try {
            const response = await fetch(`${API_ENDPOINTS.history}/${promptId}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${currentToken}` }
            });
            if (!response.ok) throw new Error('Delete failed');
            setHistory(prevHistory => prevHistory.filter(item => item.id !== promptId));
        } catch (err) { console.error(err); }
    }
  };

  const t = translations[language] || translations['en'];
  const isDark = theme === 'dark';
  const containerClasses = isDark ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-800";

  // 根据 user 状态决定显示哪个页面
  const isLoggedIn = !!user;

  const commonProps = { t, isDark, handleThemeToggle, language, handleVariantToggle, handleLanguageToggle, user, handleLogout, onShowHistory: () => setShowHistory(true) };
  const authProps = { authView, setAuthView, email, setEmail, password, setPassword, isLoading, authMessage, handleLogin, handleRegister, handleGuestMode, guestTries };
  const appProps = { character1, setCharacter1, gender1, setGender1, character2, setCharacter2, gender2, setGender2, plotPrompt, setPlotPrompt, handleSubmit, isLoading, error, generatedOutline, resultRef };

  return (
    <div className={`min-h-screen p-4 sm:p-8 font-sans transition-colors duration-500 ${containerClasses}`}>
        {isLoggedIn && showHistory && <HistoryModal t={t} isDark={isDark} history={history} onLoad={handleLoadFromHistory} onClose={() => setShowHistory(false)} onDelete={handleDeleteHistoryItem} />}
        
        {!isLoggedIn
            ? <AuthPage commonProps={commonProps} authProps={authProps} />
            : <MainApp commonProps={commonProps} appProps={appProps} />
        }
    </div>
  );
}

export default App;
