import React, { useState, useEffect, createContext, useContext, useRef, useMemo } from 'react';

// --- 自定义样式 (Custom Styles) ---
const customSelectStyles = `
  /* 强制下拉菜单里的选项文字为黑色 */
  .custom-select-force-black-options option {
    color: black !important;
  }
  /* 强制暗色模式下，所有输入框和文本域的文字为黑色 */
  .dark .force-black-text::placeholder {
    color: #4b5563; /* 暗模式下稍浅的灰色placeholder */
  }
  .dark .force-black-text {
    color: black !important;
  }
`;

// --- JWT解码辅助函数 (JWT Decode Helper) ---
// const decodeJwt = (token) => {
//   if (token && token.startsWith('guest-')) {
//     return { is_guest: true, exp: Date.now() / 1000 + 3600 };
//   }
//   try {
//     const base64Url = token.split('.')[1];
//     if (!base64Url) return null;
//     const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
//     const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
//         return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
//     }).join(''));
//     return JSON.parse(jsonPayload);
//   } catch (e) {
//     console.error("Failed to decode JWT:", e);
//     return null;
//   }
// };

// --- 配置 (Configuration) ---
// 直接使用你提供的最新后端地址
const API_BASE_URL = 'https://plot-ark-backend-885033581194.us-central1.run.app';


const API_ENDPOINTS = {
  register: `${API_BASE_URL}/api/register`,
  login: `${API_BASE_URL}/api/login`,
  generate: `${API_BASE_URL}/api/generate`,
  history: `${API_BASE_URL}/api/history`,
};

// --- 多语言文本 (Internationalization) ---
const translations = {
  en: {
    title: 'Plot Ark',
    subtitle: 'Input Couple/Pairing settings and concepts to generate your unique story outline',
    authWelcome: 'Welcome to Plot Ark',
    authSubtitle: 'Log in or register to unleash your creative potential',
    emailLabel: 'Email',
    passwordLabel: 'Password',
    loginButton: 'Login',
    registerButton: 'Register',
    guestModeButton: 'Guest Mode',
    noAccount: "Don't have an account?",
    clickToRegister: 'Click here to register',
    logoutButton: 'Logout',
    generateButton: 'Launch Ark',
    generatingButton: 'Generating...', 
    character1: 'Character 1',
    character2: 'Character 2',
    gender: 'Gender',
    male: 'Male',
    female: 'Female',
    none: 'nonbinary',
    character1Placeholder: 'Example: Ash Lynx, a charismatic gang leader in New York with a traumatic past, extraordinary intelligence, and blonde hair...', 
    character2Placeholder: 'Example: Eiji Okumura, a kind-hearted Japanese photographer who becomes an unwavering light in Ash\'s life...',
    plotPromptPlaceholder: 'Example: What if, years later, they reunite in modern Japan, but Ash has lost his memories?',
    historyTitle: 'Creation History',
    loadButton: 'Load',
    deleteButton: 'Delete',
    closeButton: 'Close',
    confirmDelete: 'Are you sure you want to delete this entry?',
    userCredits: 'Credits: {credits}',
    freeCredits: 'Free Credits: {credits}',
    loginToContinue: 'Login / Register',
    error: 'Error',
    success: 'Success',
    registerSuccess: 'Registration successful! Please check your email to activate your account.',
    insufficientCredits: 'Insufficient credits. Please top up.',
    notVerified: 'Your account is not verified. Please check your email.',
    waitingForInspiration: 'Waiting for your inspiration to set sail...',
    inspirationFlowing: 'Inspiration is flowing...', 
    emailExists: 'This email is already registered.',
    invalidCredentials: 'Invalid email or password.',
    genericError: 'An unexpected error occurred.',
    failedToFetch: 'Failed to fetch',
    plotPromptLabel: 'Core Trope / Scene',
    backToLogin: 'Already have an account? Go back to login',
    orSeparator: 'OR',
    loading: 'Loading...', 
    noHistoryFound: 'No history found.',
    failedToDeleteHistory: 'Failed to delete history item.',
    errorDeletingHistory: 'An error occurred while deleting the history item.',
    loadingButton: '...', 
    copyOutline: 'Copy Full Outline',
    copied: 'Copied!',
  },
  zh_CN: {
    title: '灵感方舟',
    subtitle: '输入CP设定与梗概，生成专属你的故事大纲',
    authWelcome: '登录方舟',
    authSubtitle: '登录或注册以释放你的创作潜力',
    emailLabel: '邮箱',
    passwordLabel: '密码',
    loginButton: '登录',
    registerButton: '注册',
    guestModeButton: '游客模式',
    noAccount: '还没有账号？',
    clickToRegister: '点此注册',
    logoutButton: '退出登录',
    generateButton: '启动方舟',
    generatingButton: '生成中…',
    character1: '角色 1',
    character2: '角色 2',
    gender: '性别',
    male: '男',
    female: '女',
    none: '无性别',
    character1Placeholder: '例如：亚修·林克斯，一个在纽约街头长大、背景复杂、魅力超凡的金发少年...', 
    character2Placeholder: '例如：奥村英二，一位善良的日本摄影师，他成为了亚修生命中坚定不移的光...', 
    plotPromptPlaceholder: '例如：如果多年以后，他们在现代日本重逢，而亚修失去了记忆，会发生什么？',
    historyTitle: '创作历史',
    loadButton: '载入',
    deleteButton: '删除',
    closeButton: '关闭',
    confirmDelete: '确定要删除这条历史记录吗？',
    userCredits: '创作点数: {credits}',
    freeCredits: '免费额度: {credits}',
    loginToContinue: '登录 / 注册',
    error: '错误',
    success: '成功',
    registerSuccess: '注册成功！请检查您的邮箱以激活账户。',
    insufficientCredits: '创作点数不足，请充值。',
    notVerified: '您的账户尚未激活，请检查邮箱。',
    waitingForInspiration: '在这里等待你的灵感方舟起航…',
    inspirationFlowing: '灵感正在迸发…',
    emailExists: '该邮箱已被注册。',
    invalidCredentials: '邮箱或密码错误。',
    genericError: '发生未知错误。',
    failedToFetch: '请求失败',
    plotPromptLabel: '核心梗 / 场景',
    backToLogin: '已有账号？返回登录',
    orSeparator: '或',
    loading: '加载中...', 
    noHistoryFound: '暂无历史记录。',
    failedToDeleteHistory: '删除历史记录失败。',
    errorDeletingHistory: '删除历史记录时发生错误。',
    loadingButton: '...', 
    copyOutline: '复制完整大纲',
    copied: '已复制!',
  },
  zh_TW: {
    title: '靈感方舟',
    subtitle: '輸入CP設定與梗概，生成專屬您的故事大綱',
    authWelcome: '登入方舟',
    authSubtitle: '登入或註冊以釋放您的創作潛力',
    emailLabel: '郵箱',
    passwordLabel: '密碼',
    loginButton: '登入',
    registerButton: '註冊',
    guestModeButton: '遊客模式',
    noAccount: '還沒有帳號？',
    clickToRegister: '點此註冊',
    logoutButton: '登出',
    generateButton: '啟動方舟',
    generatingButton: '生成中…',
    character1: '角色 1',
    character2: '角色 2',
    gender: '性別',
    male: '男',
    female: '女',
    none: '無性別',
    character1Placeholder: '例如：亞修·林克斯，一個在紐約街頭長大、背景複雜、魅力超凡的金髮少年...', 
    character2Placeholder: '例如：奧村英二，一位善良的日本攝影師，他成為了亞修生命中堅定不移的光...', 
    plotPromptPlaceholder: '例如：如果多年以後，他們在現代日本重逢，而亞修失去了記憶，會發生什麼？',
    historyTitle: '創作歷史',
    loadButton: '載入',
    deleteButton: '刪除',
    closeButton: '關閉',
    confirmDelete: '確定要刪除這條歷史記錄嗎？',
    userCredits: '創作點數: {credits}',
    freeCredits: '免費額度: {credits}',
    loginToContinue: '登入 / 註冊',
    error: '錯誤',
    success: '成功',
    registerSuccess: '註冊成功！請檢查您的郵箱以啟用帳戶。',
    insufficientCredits: '創作點數不足，請儲值。',
    notVerified: '您的帳戶尚未啟用，請檢查郵箱。',
    genericError: '發生未知錯誤。',
    failedToFetch: '請求失敗',
    waitingForInspiration: '在這裡等待你的靈感方舟啟航…',
    inspirationFlowing: '靈感正在迸發…',
    emailExists: '該郵箱已被註冊。',
    invalidCredentials: '郵箱或密碼錯誤。',
    plotPromptLabel: '核心梗 / 場景',
    backToLogin: '已有帳號？返回登入',
    orSeparator: '或',
    loading: '載入中...', 
    noHistoryFound: '暫無歷史記錄。',
    failedToDeleteHistory: '刪除歷史記錄失敗。',
    errorDeletingHistory: '刪除歷史記錄時發生錯誤。',
    loadingButton: '...', 
    copyOutline: '複製完整大綱',
    copied: '已複製!',
  },
};

// --- 上下文 (Context for Theme & Language) ---
const AppContext = createContext();

// --- AI输出处理与Markdown转换辅助函数 (for HistoryModal) ---
const processAIOutput = (text) => {
    if (!text) return '';

    let processedText = text;

    // 1. 精确移除AI回复中多余的前导语句
    const preambles = [
        "好的，身为一位深爱这些角色的 storyteller，我将为你构建一个完全忠于他们性格和",
        "好的，我将以对这些角色深刻理解和尊重的态度，为你构建一个符合他们性格逻辑和情感轨迹的情节大纲。",
        "好的，我将以对这些角色深刻理解和尊重的态度，来构建这个故事。"
    ];
    preambles.forEach(p => {
        processedText = processedText.replaceAll(p, '');
    });
    processedText = processedText.trim();

    // 2. 转换Markdown为HTML，以实现加粗等格式
    // 处理一级标题
    processedText = processedText.replace(/^### (.*$)/gim, '<h3>$1</h3>');
    // 处理二级标题
    processedText = processedText.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    // 处理斜体 (以防万一)
    processedText = processedText.replace(/\*(.*?)\*/g, '<em>$1</em>');

    // 3. 处理换行
    processedText = processedText.replace(/\n/g, '<br />');

    return processedText;
};


// --- 大纲解析为卡片数据结构 ---
const parseOutlineToCards = (text) => {
    if (!text) return [];

    let processedText = text;

    // 1. 移除AI回复中多余的前导语句
    const preambles = [
        "好的，身为一位深爱这些角色的 storyteller，我将为你构建一个完全忠于他们性格和",
        "好的，我将以对这些角色深刻理解和尊重的态度，为你构建一个符合他们性格逻辑和情感轨迹的情节大纲。",
        "好的，我将以对这些角色深刻理解和尊重的态度，来构建这个故事。"
    ];
    preambles.forEach(p => {
        processedText = processedText.replaceAll(p, '');
    });
    processedText = processedText.trim();

    const sections = [];
    const lines = processedText.split('\n').map(line => line.trim()).filter(line => line.length > 0);

    let currentMainSection = null;
    let currentSubSection = null;

    lines.forEach(line => {
        if (line.startsWith('### ')) {
            currentMainSection = { type: 'main_section', title: line.substring(4).trim(), content: [] };
            sections.push(currentMainSection);
            currentSubSection = null;
        } else if (line.startsWith('**') && (line.includes(':**') || line.includes('：**'))) {
            const parts = line.split(/:(?=\*\*)|：(?=\*\*)/);
            const titleText = parts[0].replace(/\*\*/g, '').trim();
            let initialContent = '';
            if (parts.length > 1) {
                initialContent = parts.slice(1).join(':').replace(/\*\*/g, '').trim();
            }

            if (currentMainSection) {
                currentSubSection = { type: 'sub_section', title: titleText, text: initialContent };
                currentMainSection.content.push(currentSubSection);
            } else {
                currentMainSection = { type: 'main_section', title: '大纲内容', content: [] };
                sections.push(currentMainSection);
                currentSubSection = { type: 'sub_section', title: titleText, text: initialContent };
                currentMainSection.content.push(currentSubSection);
            }
        } else if (line.startsWith('* ')) {
            const listItemText = '• ' + line.substring(2).trim();
            if (currentSubSection) {
                // Append list item to the current sub-section's text
                currentSubSection.text += (currentSubSection.text ? '\n' : '') + listItemText;
            } else if (currentMainSection) {
                // Otherwise, add it as a content item to the main section (for Character Analysis)
                currentMainSection.content.push({ type: 'list_item', text: line.substring(2).trim() });
            }
        } else {
            if (currentSubSection) {
                currentSubSection.text += (currentSubSection.text ? '\n' : '') + line;
            } else if (currentMainSection) {
                if (!currentMainSection.text) currentMainSection.text = '';
                currentMainSection.text += (currentMainSection.text ? '\n' : '') + line;
            }
        }
    });

    return sections;
};

// --- OutlineCard Component ---
const OutlineCard = ({ section }) => {
    const { theme } = useContext(AppContext);

    if (!section) {
        return null; // Don't render if section is undefined
    }

    const cardClasses = `
        bg-light-card dark:bg-dark-card p-4 rounded-lg shadow-md transition-colors duration-300
        ${section.type === 'main_section' ? 'border-l-4 border-light-primary dark:border-dark-primary' : ''}
    `;
    const titleClasses = `
        font-bold mb-2 text-lg text-light-primary dark:text-dark-primary
    `;
    const contentClasses = `
        text-sm text-light-text-primary dark:text-dark-text-primary whitespace-pre-wrap
    `;

    return (
        <div className={cardClasses}>
            {section.title && <h3 className={titleClasses}>{section.title}</h3>}
            
            {/* Renders simple text content for sections like Rising Action */}
            {section.text && <p className={contentClasses}>{section.text}</p>}
            
            {/* Renders structured content for sections like Character Analysis */}
            {section.content && section.content.length > 0 && (
                <div className="mt-2 space-y-4">
                    {section.content.map((item, index) => {
                        if (!item) return null;

                        // Specifically for list_items from Character Analysis
                        if (item.type === 'list_item') {
                            return <p key={index} className={contentClasses}>{item.text}</p>;
                        }

                        // For potential future nested sub_sections
                        if (item.type === 'sub_section') {
                            return (
                                <div key={index}>
                                    {item.title && <p className="font-semibold text-md mb-1">{item.title}</p>}
                                    {item.text && <p className={contentClasses}>{item.text}</p>}
                                </div>
                            );
                        }
                        return null;
                    })}
                </div>
            )}
        </div>
    );
};


// --- 图标组件 (Icon Components) ---
const SunIcon = ({ className }) => <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/></svg>;
const MoonIcon = ({ className }) => <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/></svg>;
const HistoryIcon = ({ className }) => <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>;

// --- 主应用组件 (Main App Component) ---
function App() {
  // Simplified state initializers
  const [theme, setTheme] = useState('dark');
  const [lang, setLang] = useState('zh_CN');
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);
  const [isAuthReady, setIsAuthReady] = useState(false);

  // Simplified t function
  const t = (key) => {
    if (typeof key !== 'string') {
      console.warn('Translation key is not a string or is undefined:', key);
      return String(key || ''); 
    }
    const translated = translations[lang][key];
    if (translated === undefined) {
      console.warn(`Translation for key "${key}" in language "${lang}" not found.`);
      return key; 
    }
    return translated;
  };

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove(theme === 'dark' ? 'light' : 'dark');
    root.classList.add(theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  useEffect(() => {
    localStorage.setItem('lang', lang);
  }, [lang]);

  useEffect(() => {
    // Simulate auth check
    const storedToken = localStorage.getItem('token');
    if (storedToken) {
      // In a real app, you'd validate the token with your backend
      // For now, we'll just assume a token means logged in
      setUser({ email: 'user@example.com', credits: 10, is_guest: false }); // Placeholder user
      setToken(storedToken);
    }
    setIsAuthReady(true);
  }, []);

  const handleLoginSuccess = (data) => {
    setToken(data.token);
    setUser(data.user);
    localStorage.setItem('token', data.token);
  };

  const handleLogout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
  };

  const updateUserCredits = (newCredits) => {
    if (user) {
      setUser(prevUser => ({ ...prevUser, credits: newCredits }));
    }
  };

  if (!isAuthReady) {
    return <div className="bg-light-background dark:bg-dark-background min-h-screen" />;
  }

  return (
    <AppContext.Provider value={{ theme, setTheme, lang, setLang, t }}>
      <style>{customSelectStyles}</style>
      <div className="bg-light-background dark:bg-dark-background min-h-screen text-light-text-primary dark:text-dark-text-primary transition-colors duration-300">
        {user ? (
          <>
            <Header user={user} onLogout={handleLogout} />
            <main className="container mx-auto p-4">
              <MainAppPage token={token} user={user} updateUserCredits={updateUserCredits} />
            </main>
          </>
        ) : (
          <AuthPage onLoginSuccess={handleLoginSuccess} />
        )}
      </div>
    </AppContext.Provider>
  );
}

// --- 头部组件 (Header Component) ---
const Header = ({ user, onLogout }) => {
  const { theme, setTheme, lang, setLang, t } = useContext(AppContext);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  
  const toggleTheme = () => setTheme(theme === 'dark' ? 'light' : 'dark');

  const langOptions = {
    'zh_CN': '简体',
    'zh_TW': '繁體',
    'en': 'EN'
  };
  
  return (
    <>
      <header className="bg-light-card dark:bg-dark-card shadow-sm sticky top-0 z-10 transition-colors duration-300">
        <div className="container mx-auto p-4 flex justify-between items-center">
          <div className="flex items-center space-x-3">
              <span className="text-2xl" role="img" aria-label="rocket">🚀</span>
              <h1 className="text-xl sm:text-2xl font-bold tracking-wider">{t('title')}</h1>
          </div>
          <div className="flex items-center space-x-2 sm:space-x-4">
            {user && (
              <>
                <span className="hidden sm:inline text-sm font-medium text-light-text-secondary dark:text-dark-text-secondary">
                    {user.is_guest ? t('freeCredits').replace('{credits}', user.credits) : `${user.email} (${t('userCredits').replace('{credits}', user.credits)})`}
                </span>
                <button onClick={() => setIsHistoryOpen(true)} className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium bg-black/5 dark:bg-white/10 text-light-text-secondary dark:text-dark-text-secondary hover:bg-black/10 dark:hover:bg-white/20 transition-colors duration-200" aria-label={t('historyTitle')}> 
                    <HistoryIcon className="w-5 h-5"/>
                    <span className="hidden sm:inline">{t('historyTitle')}</span>
                </button>
              </>
            )}

            <div className="flex items-center bg-black/5 dark:bg-white/10 p-1 rounded-lg">
              {Object.keys(langOptions).map(key => (
                <button 
                  key={key} 
                  onClick={() => setLang(key)}
                  className={`px-3 py-1 text-sm font-bold rounded-md transition-colors duration-200 ${lang === key ? 'bg-light-card dark:bg-dark-card shadow-sm text-light-primary dark:text-dark-primary' : 'text-light-text-secondary dark:text-dark-text-secondary hover:text-light-text-primary dark:hover:text-dark-text-primary'}`}
                >
                  {langOptions[key]}
                </button>
              ))}
            </div>

            <button onClick={toggleTheme} className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors duration-200" aria-label="Toggle Theme">
              {theme === 'dark' ? <SunIcon className="w-5 h-5"/> : <MoonIcon className="w-5 h-5"/>}
            </button>
            
            {user && (
              <button onClick={onLogout} className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-lg text-sm transition-colors duration-200">{t('logoutButton')}</button>
            )}
          </div>
        </div>
      </header>
      {isHistoryOpen && <HistoryModal onClose={() => setIsHistoryOpen(false)} />}
    </>
  );
};

// --- 认证页面组件 (Auth Page Component) ---
const AuthPage = ({ onLoginSuccess }) => {
  const { t, theme, setTheme, lang, setLang } = useContext(AppContext);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isRegisterMode, setIsRegisterMode] = useState(false);

  const toggleTheme = () => setTheme(theme === 'dark' ? 'light' : 'dark');
  const langOptions = { 'zh_CN': '简体', 'zh_TW': '繁體', 'en': 'EN' };

  const handleApiCall = async (apiFunc, successCallback) => {
    setError(''); setMessage(''); setIsLoading(true);
    try {
      const response = await apiFunc();
      const data = await response.json();
      if (!response.ok) {
        const errorKey = data.error === 'email_exists' ? 'emailExists' : data.error === 'invalid_credentials' ? 'invalidCredentials' : 'genericError';
        throw new Error(t(errorKey));
      }
      successCallback(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isRegisterMode) {
      handleApiCall(() => fetch(API_ENDPOINTS.register, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      }), () => {
          setMessage(t('registerSuccess'));
          setIsRegisterMode(false);
      });
    } else {
      handleApiCall(() => fetch(API_ENDPOINTS.login, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      }), onLoginSuccess);
    }
  };
  
  const handleGuestMode = () => {
    const guestUser = { email: 'guest', credits: 3, is_verified: true, is_guest: true };
    onLoginSuccess({
        token: `guest-${Date.now()}`,
        user: guestUser
    });
  };
  
  return (
    <div className="flex flex-col items-center justify-center min-h-screen pt-10 sm:pt-0 px-4">
        <div className="absolute top-4 right-4 flex items-center space-x-2">
            <div className="flex items-center bg-black/5 dark:bg-white/10 p-1 rounded-lg">
              {Object.keys(langOptions).map(key => (
                <button 
                  key={key} 
                  onClick={() => setLang(key)}
                  className={`px-3 py-1 text-sm font-bold rounded-md transition-colors duration-200 ${lang === key ? 'bg-light-card dark:bg-dark-card shadow-sm text-light-primary dark:text-dark-primary' : 'text-light-text-secondary dark:text-dark-text-secondary hover:text-light-text-primary dark:hover:text-dark-text-primary'}`}
                >
                  {langOptions[key]}
                </button>
              ))}
            </div>
            <button onClick={toggleTheme} className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors duration-200" aria-label="Toggle Theme">
              {theme === 'dark' ? <SunIcon className="w-5 h-5"/> : <MoonIcon className="w-5 h-5"/>}
            </button>
        </div>

        <div className="text-center mb-10">
            <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight mb-2 flex items-center justify-center space-x-3">
                <span className="text-4xl sm:text-5xl" role="img" aria-label="rocket">🚀</span>
                <span>{t('title')}</span>
            </h1>
            <p className="text-lg text-light-text-secondary dark:text-dark-text-secondary">{t('subtitle')}</p>
        </div>
        <div className="max-w-md w-full space-y-8 bg-light-card dark:bg-dark-card p-8 sm:p-10 rounded-2xl shadow-lg">
            <div>
                <h2 className="text-center text-2xl font-bold">{isRegisterMode ? t('registerButton') : t('authWelcome')}</h2>
            </div>
            {error && <div className="bg-red-500/10 border border-light-error/30 dark:border-dark-error/30 text-light-error dark:text-dark-error px-4 py-3 rounded-lg text-center text-sm" role="alert">{error}</div>}
            {message && <div className="bg-green-500/10 border border-light-success/30 dark:border-dark-success/30 text-light-success dark:text-dark-success px-4 py-3 rounded-lg text-center text-sm" role="alert">{message}</div>}
            <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                <div className="rounded-md -space-y-px">
                    <input id="email-address" name="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="appearance-none rounded-none relative block w-full px-3 py-3 border border-light-border dark:border-dark-border placeholder-gray-500 bg-light-card dark:bg-dark-card rounded-t-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-light-primary dark:focus:ring-dark-primary dark:focus:ring-offset-dark-card sm:text-sm" placeholder={t('emailLabel')} />
                    <input id="password" name="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required className="appearance-none rounded-none relative block w-full px-3 py-3 border border-light-border dark:border-dark-border placeholder-gray-500 bg-light-card dark:bg-dark-card rounded-b-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-light-primary dark:focus:ring-dark-primary dark:focus:ring-offset-dark-card sm:text-sm" placeholder={t('passwordLabel')} />
                </div>
                <div>
                    <button type="submit" disabled={isLoading} className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-light-primary hover:bg-light-primary-hover dark:bg-dark-primary dark:hover:bg-dark-primary-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-light-primary dark:focus:ring-dark-primary dark:focus:ring-offset-dark-card disabled:opacity-50 transition-colors">
                        {isLoading ? t('loadingButton') : (isRegisterMode ? t('registerButton') : t('loginButton'))}
                    </button>
                </div>
            </form>
             <div className="text-center text-sm">
                <a href="#" onClick={(e) => { e.preventDefault(); setIsRegisterMode(!isRegisterMode); setError(''); setMessage(''); }} className="font-medium text-light-primary hover:text-light-primary-hover dark:text-dark-primary dark:hover:text-dark-primary-hover transition-colors">
                    {isRegisterMode ? t('backToLogin') : t('noAccount') + ' ' + t('clickToRegister')}
                </a>
             </div>
            <div className="relative">
                <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-light-border dark:border-dark-border" /></div>
                <div className="relative flex justify-center text-sm"><span className="px-2 bg-light-card dark:bg-dark-card text-light-text-secondary dark:text-dark-text-secondary">{t('orSeparator')}</span></div>
            </div>
             <div>
                <button type="button" onClick={handleGuestMode} className="group relative w-full flex justify-center py-3 px-4 border border-light-border dark:border-dark-border text-sm font-medium rounded-md hover:bg-black/5 dark:hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 dark:focus:ring-offset-dark-card transition-colors">
                    {t('guestModeButton')}
                </button>
            </div>
        </div>
    </div>
  );
};

// --- 历史记录弹窗 (History Modal) ---
const HistoryModal = ({ onClose }) => {
    const { t } = useContext(AppContext);
    const [history, setHistory] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [expandedId, setExpandedId] = useState(null);
    const token = localStorage.getItem('token');

    useEffect(() => {
        const fetchHistory = async () => {
            if (!token) { setIsLoading(false); return; }
            try {
                const response = await fetch(API_ENDPOINTS.history, { headers: { 'Authorization': `Bearer ${token}` } });
                if (response.ok) {
                    const data = await response.json();
                    // 按日期排序，最新的在前
                    setHistory(data.sort((a, b) => new Date(b.created_at) - new Date(a.created_at)));
                }
            } catch (error) {
                console.error('Failed to fetch history:', error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchHistory();
    }, [token]);
    
    const handleDelete = async (idToDelete) => {
        if (!window.confirm(t('confirmDelete'))) return; 
        
        try {
            // 假设删除的 API 端点是 DELETE /api/history/:id
            const response = await fetch(`${API_ENDPOINTS.history}/${idToDelete}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) {
                setHistory(prevHistory => prevHistory.filter(item => item.id !== idToDelete));
            } else {
                console.error('Failed to delete history item.');
                alert(t('failedToDeleteHistory'));
            }
        } catch (error) {
            console.error('Failed to delete history item:', error);
            alert(t('errorDeletingHistory'));
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
            <div className="bg-light-card dark:bg-dark-card rounded-2xl shadow-xl w-full max-w-3xl max-h-[80vh] flex flex-col" onClick={e => e.stopPropagation()}>
                <div className="p-6 border-b border-light-border dark:border-dark-border flex justify-between items-center">
                    <h2 className="text-xl font-bold">{t('historyTitle')}</h2>
                    <button onClick={onClose} className="text-light-text-secondary dark:text-dark-text-secondary hover:text-light-text-primary dark:hover:text-dark-text-primary text-2xl leading-none">&times;</button>
                </div>
                <div className="p-6 overflow-y-auto space-y-4">
                    {isLoading ? <p>{t('loading')}</p> : history.length > 0 ? history.map(item => (
                         <div key={item.id} className="bg-light-background dark:bg-dark-background/50 rounded-lg transition-shadow hover:shadow-md">
                            <div className="p-4">
                                <div className="flex justify-between items-start mb-2">
                                    <p className="font-semibold text-sm pr-4 flex-grow cursor-pointer" onClick={() => setExpandedId(expandedId === item.id ? null : item.id)}>{item.core_prompt}</p>
                                    <div className="flex items-center space-x-3 flex-shrink-0">
                                        <p className="text-xs text-light-text-secondary dark:text-dark-text-secondary">{new Date(item.created_at).toLocaleString()}</p>
                                        <button onClick={(e) => { e.stopPropagation(); handleDelete(item.id); }} className="text-red-500 hover:text-red-700 text-xs font-semibold">{t('deleteButton')}</button>
                                    </div>
                                </div>
                                {expandedId === item.id && (
                                    <div className="border-t border-light-border dark:border-dark-border mt-2 pt-3">
                                        <div 
                                            className="prose prose-sm dark:prose-invert max-w-none prose-p:text-light-text-primary dark:prose-p:text-dark-text-primary prose-headings:text-light-text-primary dark:prose-headings:text-dark-text-primary whitespace-pre-wrap leading-relaxed"
                                            dangerouslySetInnerHTML={{ __html: processAIOutput(item.outline || t('waitingForInspiration')) }}
                                        />
                                    </div>
                                )}
                            </div>
                        </div>
                    )) : <p className="text-center text-light-text-secondary dark:text-dark-text-secondary">{t('noHistoryFound')}</p>}
                </div>
                 <div className="p-4 border-t border-light-border dark:border-dark-border text-right">
                    <button onClick={onClose} className="bg-light-primary dark:bg-dark-primary text-white font-bold py-2 px-4 rounded-lg text-sm">{t('closeButton')}</button>
                </div>
            </div>
        </div>
    );
};


const stripMarkdown = (text) => {
    if (!text) return '';
    return text
        .replace(/^### (.*$)/gim, '$1')      // Remove ### headers
        .replace(/\*\*(.*?)\*\*/g, '$1')   // Remove **bold**
        .replace(/\*(.*?)\*/g, '$1')       // Remove *italic*
        .replace(/^\* (.*$)/gim, '$1')       // Remove * list items
        .trim();
};

// --- 主应用页面组件 (Main App Page Component) ---
const MainAppPage = ({ token, user, updateUserCredits }) => {
    const { t, lang } = useContext(AppContext);
    const [character1, setCharacter1] = useState('');
    const [gender1, setGender1] = useState('male');
    const [character2, setCharacter2] = useState('');
    const [gender2, setGender2] = useState('male');
    const [plotPrompt, setPlotPrompt] = useState('');
    const [outline, setOutline] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [currentPage, setCurrentPage] = useState(0);
    const [showCard, setShowCard] = useState(true);
    const [displayPages, setDisplayPages] = useState([]); // New state for flattened pages
    const [isCopied, setIsCopied] = useState(false); // State for copy button feedback
    
    const outlineRef = useRef(null);

    const langCodeMapping = { 'en': 'en', 'zh_CN': 'zh-CN', 'zh_TW': 'zh-TW' };
    
    const parsedOutline = useMemo(() => parseOutlineToCards(outline), [outline]);

    useEffect(() => {
        if (parsedOutline.length > 0) {
            const newDisplayPages = [];
            const plotOutlineSection = parsedOutline.find(sec => sec.title && (sec.title.includes('情节大纲') || sec.title.includes('大纲内容') || sec.title.includes('Plot Outline')));
            const characterAnalysisSection = parsedOutline.find(sec => sec.title && (sec.title.includes('角色性格分析') || sec.title.includes('Character Analysis')));

            // 1. Process and add Character Analysis first
            if (characterAnalysisSection) {
                newDisplayPages.push(characterAnalysisSection);
            }

            // 2. Process and add Plot Outline sections
            if (plotOutlineSection && plotOutlineSection.content) {
                plotOutlineSection.content.forEach(subSection => {
                    if(subSection.type === 'sub_section') {
                        newDisplayPages.push({
                            type: 'main_section',
                            title: subSection.title,
                            text: subSection.text
                        });
                    }
                });
            }

            setDisplayPages(newDisplayPages);
            setCurrentPage(0); // Reset to first page
            setShowCard(true); // Show card
            if (outline) {
              outlineRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        } else {
            setDisplayPages([]); // Clear pages if there's no outline
        }
    }, [parsedOutline, outline]);


    const handleNavigation = (direction) => {
        setShowCard(false); // Start fade-out
        setTimeout(() => {
            setCurrentPage(prev => {
                const newPage = direction === 'next' ? Math.min(prev + 1, displayPages.length - 1) : Math.max(prev - 1, 0);
                return newPage;
            });
            setShowCard(true); // Start fade-in for new card
        }, 300); // Duration of fade-out transition
    };

    const handleNext = () => handleNavigation('next');
    const handlePrev = () => handleNavigation('prev');

    const handleCopy = () => {
        const plainText = stripMarkdown(outline);
        navigator.clipboard.writeText(plainText).then(() => {
            setIsCopied(true);
            setTimeout(() => setIsCopied(false), 2000);
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (user.credits <= 0) { setError(t('insufficientCredits')); return; }
        setIsLoading(true); setOutline(''); setError('');
        
        const fullCharacter1 = `(${t(gender1)}) ${character1}`;
        const fullCharacter2 = `(${t(gender2)}) ${character2}`;

        const headers = { 'Content-Type': 'application/json' };
        if (token) headers['Authorization'] = `Bearer ${token}`;

        try {
            const response = await fetch(API_ENDPOINTS.generate, {
                method: 'POST',
                headers,
                body: JSON.stringify({ character1: fullCharacter1, character2: fullCharacter2, plot_prompt: plotPrompt, language: langCodeMapping[lang] }),
            });
            const data = await response.json();
            if (!response.ok) {
                const errorKey = data.error === 'insufficient_credits' ? 'insufficientCredits' : data.error === 'not_verified' ? 'notVerified' : data.error === '内容被安全系统拦截' ? 'failedToFetch' : 'genericError';
                throw new Error(t(errorKey) + (data.reason ? ` (${data.reason})` : ''));
            }
            setOutline(data.outline);
            const newCredits = data.remaining_credits !== undefined ? data.remaining_credits : user.credits - 1;
            updateUserCredits(newCredits);
        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };
    
    const sharedTextareaClass = "w-full rounded-lg p-3 bg-light-background dark:bg-dark-input border border-light-border dark:border-dark-border focus:outline-none focus:ring-2 focus:ring-light-primary dark:focus:ring-dark-primary dark:focus:ring-offset-dark-card transition-all duration-200 shadow-sm text-sm force-black-text";
    const sharedSelectClass = "w-full rounded-lg p-3 bg-light-background dark:bg-dark-input border border-light-border dark:border-dark-border focus:outline-none focus:ring-2 focus:ring-light-primary dark:focus:ring-dark-primary dark:focus:ring-offset-dark-card transition-all duration-200 shadow-sm text-sm custom-select-force-black-options force-black-text";


    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-6">
            {/* Left Column: Input Form */}
            <div className="lg:col-span-1 bg-light-card dark:bg-dark-card p-6 sm:p-8 rounded-xl shadow-lg h-fit">
                <form onSubmit={handleSubmit}>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
                        {/* Character 1 */}
                        <div>
                            <label className="block text-sm font-bold mb-2">{t('character1')}</label>
                            <textarea value={character1} onChange={(e) => setCharacter1(e.target.value)} placeholder={t('character1Placeholder')} className={sharedTextareaClass} rows="6" required></textarea>
                            <label className="block text-sm font-bold mb-2 mt-4">{t('gender')}</label>
                            <select value={gender1} onChange={(e) => setGender1(e.target.value)} className={sharedSelectClass}>
                                <option value="male">{t('male')}</option>
                                <option value="female">{t('female')}</option>
                                <option value="none">{t('none')}</option>
                            </select>
                        </div>
                        {/* Character 2 */}
                        <div>
                            <label className="block text-sm font-bold mb-2">{t('character2')}</label>
                            <textarea value={character2} onChange={(e) => setCharacter2(e.target.value)} placeholder={t('character2Placeholder')} className={sharedTextareaClass} rows="6" required></textarea>
                             <label className="block text-sm font-bold mb-2 mt-4">{t('gender')}</label>
                            <select value={gender2} onChange={(e) => setGender2(e.target.value)} className={sharedSelectClass}>
                                <option value="male">{t('male')}</option>
                                <option value="female">{t('female')}</option>
                                <option value="none">{t('none')}</option>
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-bold mb-2">{t('plotPromptLabel')}</label>
                        <textarea value={plotPrompt} onChange={(e) => setPlotPrompt(e.target.value)} placeholder={t('plotPromptPlaceholder')} className={`${sharedTextareaClass} min-h-[100px]`} required></textarea>
                    </div>

                    <div className="mt-6">
                        <button type="submit" disabled={isLoading} className="w-full bg-light-primary hover:bg-light-primary-hover dark:bg-dark-primary dark:hover:bg-dark-primary-hover text-white font-bold py-3 px-4 rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-wait flex items-center justify-center">
                            {isLoading && <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>}
                            {isLoading ? t('generatingButton') : t('generateButton')}
                        </button>
                    </div>
                     {error && <div className="mt-4 bg-red-500/10 border border-light-error/30 dark:border-dark-error/30 text-light-error dark:text-dark-error px-4 py-3 rounded-lg text-center text-sm" role="alert">{error}</div>}
                </form>
            </div>

            {/* Right Column: Output */}
            <div className="lg:col-span-1 flex flex-col space-y-4">
                 <div className="bg-light-card dark:bg-dark-card p-6 sm:p-8 rounded-xl shadow-lg flex-grow min-h-[40vh] relative overflow-hidden">
                    <div ref={outlineRef} className="prose dark:prose-invert max-w-none prose-p:text-light-text-primary dark:prose-p:text-dark-text-primary prose-headings:text-light-text-primary dark:prose-headings:text-dark-text-primary whitespace-pre-wrap leading-relaxed h-full flex flex-col justify-between">
                    {isLoading ? (
                            <div className="flex justify-center items-center h-full"><p>{t('inspirationFlowing')}</p></div>
                    ) : (displayPages.length > 0 && displayPages[currentPage] ? (
                            <div className={`flex-grow flex items-center justify-center transition-opacity duration-300 ${showCard ? 'opacity-100' : 'opacity-0'}`}>
                                <OutlineCard key={currentPage} section={displayPages[currentPage]} />
                            </div>
                    ) : (
                            <p className="text-light-text-secondary dark:text-dark-text-secondary text-center flex-grow flex items-center justify-center">{t('waitingForInspiration')}</p>
                    ))}
                    {displayPages.length > 1 && !isLoading && (
                        <div className="flex justify-between items-center mt-4">
                            <button 
                                onClick={handlePrev} 
                                disabled={currentPage === 0}
                                className="px-4 py-2 bg-light-primary dark:bg-dark-primary text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed font-mono text-lg"
                            >
                                &lt;
                            </button>
                            
                            <div className="flex-grow text-center">
                                <button
                                    onClick={handleCopy}
                                    className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-sm rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                                >
                                    {isCopied ? t('copied') : t('copyOutline')}
                                </button>
                            </div>

                            <span className="text-sm text-light-text-secondary dark:text-dark-text-secondary flex items-center absolute left-1/2 -translate-x-1/2 bottom-3">
                                {currentPage + 1} / {displayPages.length}
                            </span>

                            <button 
                                onClick={handleNext} 
                                disabled={currentPage === displayPages.length - 1}
                                className="px-4 py-2 bg-light-primary dark:bg-dark-primary text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed font-mono text-lg"
                            >
                                &gt;
                            </button>
                        </div>
                    )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default App;