import React, { useState, useEffect, useRef } from 'react';

// SVG 图标组件
const SunIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>
);

const MoonIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>
);


// 语言字典保持不变
const translations = {
  'zh-CN': {
    title: "灵感方舟 🚀",
    subtitle: "输入CP设定与梗概，生成专属你的故事大纲",
    char1Label: "角色 1",
    char2Label: "角色 2",
    genderLabel: "性别",
    genderOptions: { male: '男', female: '女', nonbinary: '无性别', unspecified: '未指定' },
    promptLabel: "核心梗 / 场景",
    submitButton: "启动方舟",
    generatingButton: "生成中...",
    resultTitle: "生成的大纲",
    errorPrefix: "出错啦",
    errorConnect: "生成大纲时遇到问题，请检查后端服务是否正常运行。",
    langToggle: "Switch to English",
    variantToggle: "切换到繁体",
    themeToggle: "切换主题",
    char1Default: "例如：亚修·林克斯，一个在纽约街头长大、背景复杂、魅力超凡的金发少年…",
    char2Default: "例如：奥村英二，一位善良的日本摄影师，他成为了亚修生命中坚定不移的光…",
    promptDefault: "例如：如果多年以后，他们在现代日本重逢，而亚修失去了记忆，会发生什么？",
  },
  'zh-TW': {
    title: "靈感方舟 🚀",
    subtitle: "輸入CP設定與梗概，生成專屬你的故事大綱",
    char1Label: "角色 1",
    char2Label: "角色 2",
    genderLabel: "性別",
    genderOptions: { male: '男', female: '女', nonbinary: '無性別', unspecified: '未指定' },
    promptLabel: "核心梗 / 場景",
    submitButton: "啟動方舟",
    generatingButton: "生成中...",
    resultTitle: "生成的大綱",
    errorPrefix: "出錯啦",
    errorConnect: "生成大綱時遇到問題，請檢查後端服務是否正常運行。",
    langToggle: "Switch to English",
    variantToggle: "切換到簡體",
    themeToggle: "切換主題",
    char1Default: "例如：亞修·林克斯，一個在紐約街頭長大、背景複雜、魅力超凡的金髮少年…",
    char2Default: "例如：奧村英二，一位善良的日本攝影師，他成為了亞修生命中堅定不移的光…",
    promptDefault: "例如：如果多年以後，他們在現代日本重逢，而亞修失去了記憶，會發生什麼？",
  },
  'en': {
    title: "Plot Ark 🚀",
    subtitle: "Enter CP settings and a plot prompt to generate your unique story outline.",
    char1Label: "Character 1",
    char2Label: "Character 2",
    genderLabel: "Gender",
    genderOptions: { male: 'Male', female: 'Female', nonbinary: 'Non-binary', unspecified: 'Not Specified' },
    promptLabel: "Core Prompt / Scene",
    submitButton: "Launch Ark",
    generatingButton: "Generating...",
    resultTitle: "Generated Outline",
    errorPrefix: "Error",
    errorConnect: "Failed to outline. Please check if the backend service is running correctly.",
    langToggle: "切换到中文",
    variantToggle: "",
    themeToggle: "Toggle Theme",
    char1Default: "e.g., Ash Lynx, a charismatic youth with a complex background from New York...",
    char2Default: "e.g., Eiji Okumura, a kind-hearted Japanese photographer who becomes Ash's light...",
    promptDefault: "e.g., What if they met again years later in modern Japan, and Ash has lost his memories?",
  }
};

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
  const resultRef = useRef(null); // 用于滚动到结果区域

  const t = translations[language];
  const isDark = theme === 'dark';

  const handleLanguageToggle = () => setLanguage(lang => lang === 'en' ? 'zh-CN' : 'en');
  const handleVariantToggle = () => {
    if (!language.startsWith('zh')) return;
    setLanguage(lang => lang === 'zh-CN' ? 'zh-TW' : 'zh-CN');
  };
  const handleThemeToggle = () => setTheme(th => th === 'dark' ? 'light' : 'dark');

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsLoading(true);
    setGeneratedOutline('');
    setError(null);
    const API_ENDPOINT = 'http://127.0.0.1:5000/api/generate'; 
    try {
      const response = await fetch(API_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ character1, gender1, character2, gender2, plot_prompt: plotPrompt, language }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || `${t.errorPrefix}: ${response.status}`);
      setGeneratedOutline(data.outline);
    } catch (err) {
      setError(err.message || t.errorConnect);
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };
  
  // 当生成结果后，自动滚动到结果区域
  useEffect(() => {
    if (generatedOutline || error) {
      resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [generatedOutline, error]);

  // 动态样式类
  const containerClasses = isDark ? "bg-gray-900 text-white selection:bg-purple-500 selection:text-white" : "bg-gray-100 text-gray-800 selection:bg-blue-200";
  const headerTextClasses = isDark ? "text-gray-400 hover:text-white" : "text-gray-500 hover:text-gray-900";
  const subtitleClasses = isDark ? "text-gray-400" : "text-gray-500";
  const formClasses = isDark ? "bg-gray-800/50 backdrop-blur-sm border-gray-700" : "bg-white/80 backdrop-blur-sm border-gray-200";
  const labelClasses = isDark ? "text-gray-300" : "text-gray-700";
  const inputClasses = isDark ? "bg-gray-900 border-gray-700 text-white" : "bg-white border-gray-300 text-gray-900";
  const focusRingClasses = isDark ? "focus:ring-purple-500" : "focus:ring-blue-500";
  const optionClasses = isDark ? "bg-gray-900 text-white" : "bg-white text-gray-900";
  const buttonClasses = isDark ? "bg-purple-600 hover:bg-purple-700 shadow-lg shadow-purple-900/50" : "bg-blue-600 hover:bg-blue-700";
  const errorClasses = isDark ? "bg-red-900/50 border-red-700 text-red-200" : "bg-red-100 border-red-300 text-red-800";
  const resultContainerClasses = isDark ? "bg-gray-800/50 backdrop-blur-sm border-gray-700" : "bg-white/80 backdrop-blur-sm border-gray-200";
  const resultTitleClasses = isDark ? "text-white" : "text-gray-900";
  const resultTextClasses = isDark ? "prose-invert text-gray-300" : "text-gray-700";

  return (
    <div className={`min-h-screen p-4 sm:p-8 font-sans transition-colors duration-500 ${containerClasses}`}>
      <div className="w-full max-w-7xl mx-auto">
        <header className="flex justify-between items-center mb-6">
          <div className={`text-2xl font-bold tracking-wider ${isDark ? 'text-white' : 'text-gray-900'}`}>PLOT ARK</div>
          <div className="flex items-center space-x-4">
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
                <button type="submit" disabled={isLoading} className={`text-white font-bold py-3 px-8 rounded-lg transition-all duration-300 disabled:bg-gray-600 disabled:cursor-not-allowed ${buttonClasses}`}>
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
                  {/* **关键改动**: 在大纲文本外包裹一个带滚动条的 div */}
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
