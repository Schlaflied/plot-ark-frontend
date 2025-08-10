import React, { useState, useEffect, useRef } from 'react';

// --- API 地址配置 ---
const API_BASE_URL = 'https://plot-ark-backend-885033581194.us-central1.run.app';
const API_ENDPOINTS = {
  generate: `${API_BASE_URL}/api/generate`,
  generateGuest: `${API_BASE_URL}/api/generate-guest`, // ✨ 新增游客通道
  login: `${API_BASE_URL}/api/login`,
  register: `${API_BASE_URL}/api/register`,
};

// --- 图标组件 (保持不变) ---
const SunIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>
);
const MoonIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>
);

// --- 语言翻译 ---
const translations = {
    'zh-CN': {
        // ... 其他翻译保持不变 ...
        // ✨ 新增/修改游客模式相关翻译
        loginTitle: "登录方舟",
        registerTitle: "注册新账号",
        emailLabel: "邮箱",
        passwordLabel: "密码",
        loginButton: "登录",
        registerButton: "注册",
        switchToRegister: "还没有账号？点此注册",
        switchToLogin: "已有账号？点此登录",
        logoutButton: "登出",
        authError: "认证失败，请检查邮箱或密码。",
        registerSuccess: "注册成功！请登录。",
        guestModeButton: "游客模式",
        guestTriesLeft: "剩余免费次数：",
        noGuestTries: "免费次数已用完，请注册后继续使用。",
    },
    'zh-TW': {
        // ... 其他翻译保持不变 ...
        loginTitle: "登錄方舟",
        registerTitle: "註冊新帳號",
        emailLabel: "郵箱",
        passwordLabel: "密碼",
        loginButton: "登錄",
        registerButton: "註冊",
        switchToRegister: "還沒有帳號？點此註冊",
        switchToLogin: "已有帳號？點此登錄",
        logoutButton: "登出",
        authError: "認證失敗，請檢查郵箱或密碼。",
        registerSuccess: "註冊成功！請登錄。",
        guestModeButton: "遊客模式",
        guestTriesLeft: "剩餘免費次數：",
        noGuestTries: "免費次數已用完，請註冊後繼續使用。",
    },
    'en': {
        // ... 其他翻译保持不变 ...
        loginTitle: "Login to the Ark",
        registerTitle: "Register a New Account",
        emailLabel: "Email",
        passwordLabel: "Password",
        loginButton: "Login",
        registerButton: "Register",
        switchToRegister: "No account yet? Register here",
        switchToLogin: "Already have an account? Login here",
        logoutButton: "Logout",
        authError: "Authentication failed. Please check your email or password.",
        registerSuccess: "Registration successful! Please log in.",
        guestModeButton: "Guest Mode",
        guestTriesLeft: "Free generations left: ",
        noGuestTries: "Free trials used. Please register to continue.",
    }
};

// --- 主应用组件 ---
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
  
  // --- 认证与游客模式状态 ---
  const [token, setToken] = useState(localStorage.getItem('plot_ark_token'));
  const [isGuest, setIsGuest] = useState(false); // ✨ 新增：判断是否是游客模式
  const [guestTries, setGuestTries] = useState(() => {
      const savedTries = localStorage.getItem('plot_ark_guest_tries');
      return savedTries ? parseInt(savedTries, 10) : 2; // ✨ 初始化游客次数
  });
  const [authView, setAuthView] = useState('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authMessage, setAuthMessage] = useState('');

  const resultRef = useRef(null);
  const t = translations[language] || translations['en'];
  const isDark = theme === 'dark';

  useEffect(() => {
    if (generatedOutline || error) {
      resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [generatedOutline, error]);

  const handleLanguageToggle = () => setLanguage(lang => lang === 'en' ? 'zh-CN' : 'en');
  const handleVariantToggle = () => {
    if (!language.startsWith('zh')) return;
    setLanguage(lang => lang === 'zh-CN' ? 'zh-TW' : 'zh-CN');
  };
  const handleThemeToggle = () => setTheme(th => th === 'dark' ? 'light' : 'dark');

  const handleRegister = async (e) => {
    e.preventDefault(); setIsLoading(true); setAuthMessage('');
    try {
      const response = await fetch(API_ENDPOINTS.register, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Registration failed');
      setAuthMessage(t.registerSuccess);
      setAuthView('login');
    } catch (err) { setAuthMessage(err.message); } finally { setIsLoading(false); }
  };

  const handleLogin = async (e) => {
    e.preventDefault(); setIsLoading(true); setAuthMessage('');
    try {
      const response = await fetch(API_ENDPOINTS.login, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || t.authError);
      localStorage.setItem('plot_ark_token', data.token);
      setToken(data.token);
      setIsGuest(false); // 登录后就不是游客了
    } catch (err) { setAuthMessage(err.message); } finally { setIsLoading(false); }
  };
  
  const handleLogout = () => {
    localStorage.removeItem('plot_ark_token');
    setToken(null);
    setIsGuest(false); // 登出后也不是游客
  };

  const handleGuestMode = () => {
      setIsGuest(true); // ✨ 进入游客模式
  };

  // --- ✨ 核心修改：合并了登录用户和游客的提交逻辑 ✨ ---
  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsLoading(true);
    setGeneratedOutline('');
    setError(null);

    // 游客逻辑
    if (isGuest) {
        if (guestTries <= 0) {
            setError(t.noGuestTries);
            setIsLoading(false);
            return;
        }
    }

    const requestBody = { 
        character1: `${character1} (Gender: ${gender1})`, 
        character2: `${character2} (Gender: ${gender2})`, 
        plot_prompt: plotPrompt, 
        language 
    };

    const headers = { 'Content-Type': 'application/json' };
    let apiEndpoint = API_ENDPOINTS.generateGuest; // 默认是游客通道

    // 如果是登录用户，则切换到VIP通道并添加令牌
    if (!isGuest && token) {
        apiEndpoint = API_ENDPOINTS.generate;
        headers['Authorization'] = `Bearer ${token}`;
    }

    try {
      const response = await fetch(apiEndpoint, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(requestBody),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || `${t.errorPrefix}: ${response.status}`);
      
      setGeneratedOutline(data.outline);

      // 如果是游客，则扣除一次机会
      if (isGuest) {
          const newTries = guestTries - 1;
          setGuestTries(newTries);
          localStorage.setItem('plot_ark_guest_tries', newTries);
      }

    } catch (err) {
      setError(err.message || t.errorConnect);
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  // --- 动态样式类 (保持不变) ---
  const containerClasses = isDark ? "bg-gray-900 text-white selection:bg-purple-500 selection:text-white" : "bg-gray-100 text-gray-800 selection:bg-blue-200";
  const headerTextClasses = isDark ? "text-gray-400 hover:text-white" : "text-gray-500 hover:text-gray-900";
  const subtitleClasses = isDark ? "text-gray-400" : "text-gray-500";
  const formClasses = isDark ? "bg-gray-800/50 backdrop-blur-sm border-gray-700" : "bg-white/80 backdrop-blur-sm border-gray-200";
  const labelClasses = isDark ? "text-gray-300" : "text-gray-700";
  const inputClasses = isDark ? "bg-gray-900 border-gray-700 text-white" : "bg-white border-gray-300 text-gray-900";
  const focusRingClasses = isDark ? "focus:ring-purple-500" : "focus:ring-blue-500";
  const optionClasses = isDark ? "bg-gray-900 text-white" : "bg-white text-gray-900";
  const buttonClasses = isDark ? "bg-purple-600 hover:bg-purple-700 shadow-lg shadow-purple-900/50" : "bg-blue-600 hover:bg-blue-700";
  const guestButtonClasses = isDark ? "bg-gray-600 hover:bg-gray-700" : "bg-gray-500 hover:bg-gray-600";
  const errorClasses = isDark ? "bg-red-900/50 border-red-700 text-red-200" : "bg-red-100 border-red-300 text-red-800";
  const resultContainerClasses = isDark ? "bg-gray-800/50 backdrop-blur-sm border-gray-700" : "bg-white/80 backdrop-blur-sm border-gray-200";
  const resultTitleClasses = isDark ? "text-white" : "text-gray-900";
  const resultTextClasses = isDark ? "prose-invert text-gray-300" : "text-gray-700";
  const authLinkClasses = isDark ? "text-purple-400 hover:text-purple-300" : "text-blue-600 hover:text-blue-500";

  // --- ✨ 渲染逻辑：如果没登录也不是游客，显示登录/注册界面 ---
  if (!token && !isGuest) {
    const isLoginView = authView === 'login';
    return (
      <div className={`min-h-screen flex flex-col items-center justify-center p-4 font-sans transition-colors duration-500 ${containerClasses}`}>
        <div className={`w-full max-w-md p-8 space-y-6 rounded-xl shadow-2xl ${formClasses}`}>
          <h1 className={`text-3xl font-extrabold text-center ${isDark ? 'text-white' : 'text-gray-900'}`}>
            {isLoginView ? t.loginTitle : t.registerTitle}
          </h1>
          <form onSubmit={isLoginView ? handleLogin : handleRegister} className="space-y-6">
            <div>
              <label className={`block text-sm font-medium ${labelClasses}`}>{t.emailLabel}</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} required className={`mt-1 w-full rounded-md p-3 focus:outline-none transition-colors ${inputClasses} ${focusRingClasses}`} />
            </div>
            <div>
              <label className={`block text-sm font-medium ${labelClasses}`}>{t.passwordLabel}</label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} required className={`mt-1 w-full rounded-md p-3 focus:outline-none transition-colors ${inputClasses} ${focusRingClasses}`} />
            </div>
            {authMessage && <p className={`text-sm ${authMessage.includes('成功') ? 'text-green-400' : 'text-red-400'}`}>{authMessage}</p>}
            <div className="flex flex-col space-y-4">
              <button type="submit" disabled={isLoading} className={`w-full text-white font-bold py-3 px-8 rounded-lg transition-all duration-300 disabled:bg-gray-600 disabled:cursor-not-allowed ${buttonClasses}`}>
                {isLoading ? t.generatingButton : (isLoginView ? t.loginButton : t.registerButton)}
              </button>
              {/* ✨ 新增游客模式按钮 ✨ */}
              <button type="button" onClick={handleGuestMode} className={`w-full text-white font-bold py-3 px-8 rounded-lg transition-all duration-300 ${guestButtonClasses}`}>
                {t.guestModeButton}
              </button>
            </div>
          </form>
          <p className="text-center text-sm">
            <button onClick={() => { setAuthView(isLoginView ? 'register' : 'login'); setAuthMessage(''); }} className={`font-medium transition-colors ${authLinkClasses}`}>
              {isLoginView ? t.switchToRegister : t.switchToLogin}
            </button>
          </p>
        </div>
      </div>
    );
  }

  // --- ✨ 渲染逻辑：如果已登录或在游客模式，显示主应用界面 ---
  return (
    <div className={`min-h-screen p-4 sm:p-8 font-sans transition-colors duration-500 ${containerClasses}`}>
      <div className="w-full max-w-7xl mx-auto">
        <header className="flex justify-between items-center mb-6">
          <div className={`text-2xl font-bold tracking-wider ${isDark ? 'text-white' : 'text-gray-900'}`}>PLOT ARK</div>
          <div className="flex items-center space-x-4">
            {/* ✨ 根据登录状态显示不同按钮 ✨ */}
            {token ? (
                <button onClick={handleLogout} className={`text-sm ${headerTextClasses} transition-colors`}>{t.logoutButton}</button>
            ) : (
                <button onClick={() => setIsGuest(false)} className={`text-sm ${headerTextClasses} transition-colors`}>{t.loginButton}</button>
            )}
            <button onClick={handleThemeToggle} className={`p-2 rounded-full ${headerTextClasses} transition-colors`} aria-label={t.themeToggle}>
              {isDark ? <SunIcon /> : <MoonIcon />}
            </button>
            {language.startsWith('zh') && (
              <button onClick={handleVariantToggle} className={`text-sm ${headerTextClasses} transition-colors`}>{t.variantToggle}</button>
            )}
            <button onClick={handleLanguageToggle} className={`text-sm ${headerTextClasses} transition-colors`}>{t.langToggle}</button>
          </div>
        </header>

        <div className="text-center my-12 sm:my-16">
          <h1 className={`text-4xl sm:text-6xl font-extrabold mb-4 tracking-tight ${isDark ? 'text-white' : 'text-gray-900'}`}>{t.title}</h1>
          <p className={`text-lg ${subtitleClasses}`}>{t.subtitle}</p>
        </div>

        {/* ✨ 在游客模式下显示剩余次数 ✨ */}
        {isGuest && (
            <div className="text-center mb-4 font-medium text-purple-400">
                {guestTries > 0 ? `${t.guestTriesLeft} ${guestTries}` : t.noGuestTries}
            </div>
        )}

        {/* 主体内容部分保持不变 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 lg:gap-8">
          <div className="lg:col-span-1 lg:sticky lg:top-8 h-fit">
            <form onSubmit={handleSubmit} className={`p-6 sm:p-8 rounded-xl shadow-2xl space-y-6 transition-colors duration-500 ${formClasses}`}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-6">
                <div className="space-y-2">
                  <label className={`block text-base font-medium ${labelClasses}`}>{t.char1Label}</label>
                  <textarea rows="6" value={character1} onChange={(e) => setCharacter1(e.target.value)} placeholder={t.char1Default} className={`w-full rounded-md p-3 focus:outline-none transition-colors ${inputClasses} ${focusRingClasses}`} />
                  <select value={gender1} onChange={(e) => setGender1(e.target.value)} className={`w-full rounded-md p-3 focus:outline-none ${inputClasses} ${focusRingClasses}`}>
                    {Object.entries(t.genderOptions).map(([key, value]) => (
                      <option key={key} value={key} className={optionClasses}>{value}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className={`block text-base font-medium ${labelClasses}`}>{t.char2Label}</label>
                  <textarea rows="6" value={character2} onChange={(e) => setCharacter2(e.target.value)} placeholder={t.char2Default} className={`w-full rounded-md p-3 focus:outline-none transition-colors ${inputClasses} ${focusRingClasses}`} />
                  <select value={gender2} onChange={(e) => setGender2(e.target.value)} className={`w-full rounded-md p-3 focus:outline-none ${inputClasses} ${focusRingClasses}`}>
                    {Object.entries(t.genderOptions).map(([key, value]) => (
                      <option key={key} value={key} className={optionClasses}>{value}</option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div className="pt-4">
                <label htmlFor="prompt" className={`block text-base font-medium mb-2 ${labelClasses}`}>{t.promptLabel}</label>
                <textarea id="prompt" rows="5" value={plotPrompt} onChange={(e) => setPlotPrompt(e.target.value)} placeholder={t.promptDefault} className={`w-full rounded-md p-3 focus:outline-none transition-colors ${inputClasses} ${focusRingClasses}`} />
              </div>
              
              <div className="text-center pt-4">
                <button type="submit" disabled={isLoading || (isGuest && guestTries <= 0)} className={`text-white font-bold py-3 px-8 rounded-lg transition-all duration-300 disabled:bg-gray-600 disabled:cursor-not-allowed ${buttonClasses}`}>
                  {isLoading ? t.generatingButton : t.submitButton}
                </button>
              </div>
            </form>
          </div>

          <div className="lg:col-span-1 mt-8 lg:mt-0">
            <div ref={resultRef} className="min-h-[200px]">
              {error && <div className={`p-4 rounded-lg ${errorClasses}`}>{error}</div>}
              
              {generatedOutline && (
                <div className={`p-6 sm:p-8 rounded-xl shadow-2xl transition-colors duration-500 ${resultContainerClasses}`}>
                  <h2 className={`text-3xl font-bold mb-4 ${resultTitleClasses}`}>{t.resultTitle}</h2>
                  <div className="max-h-[70vh] overflow-y-auto pr-3">
                      <div className={`prose max-w-none whitespace-pre-wrap leading-relaxed ${resultTextClasses}`}>{generatedOutline}</div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;

