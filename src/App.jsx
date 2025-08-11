import React, { useState, useEffect, useRef } from 'react';

// --- API 地址配置 ---
const API_BASE_URL = 'https://plot-ark-backend-885033581194.us-central1.run.app';
const API_ENDPOINTS = {
  generate: `${API_BASE_URL}/api/generate`,
  generateGuest: `${API_BASE_URL}/api/generate-guest`,
  login: `${API_BASE_URL}/api/login`,
  register: `${API_BASE_URL}/api/register`,
  history: `${API_BASE_URL}/api/history`, 
};

// --- 图标组件 ---
const SunIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>);
const MoonIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>);
const HistoryIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 4v6h6"/><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"/></svg>);
const CloseIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>);
// ✨ 新增垃圾桶图标 ✨
const TrashIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>);


// --- 语言翻译 (增加删除相关) ---
const translations = {
    'zh-CN': {
        // ... 其他翻译 ...
        deleteButton: "删除",
        confirmDelete: "你确定要永久删除这条灵感记录吗？",
    },
    'zh-TW': {
        // ... 其他翻译 ...
        deleteButton: "刪除",
        confirmDelete: "你確定要永久刪除這條靈感記錄嗎？",
    },
    'en': {
        // ... 其他翻译 ...
        deleteButton: "Delete",
        confirmDelete: "Are you sure you want to permanently delete this inspiration entry?",
    }
};

// --- ✨ 升级版：历史记录弹窗组件 ✨ ---
const HistoryModal = ({ t, isDark, history, onLoad, onClose, onDelete }) => {
    const modalBg = isDark ? "bg-gray-900 border border-gray-700" : "bg-white border border-gray-200";
    const itemBg = isDark ? "bg-gray-800 hover:bg-gray-700/50" : "bg-gray-100 hover:bg-gray-200/50";
    const textMuted = isDark ? "text-gray-400" : "text-gray-500";
    const loadButtonClasses = isDark ? "bg-purple-600 hover:bg-purple-700" : "bg-blue-600 hover:bg-blue-700";
    const deleteButtonClasses = isDark ? "bg-red-800 hover:bg-red-700" : "bg-red-600 hover:bg-red-500";

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
                                    <p className={`text-sm ${textMuted} mt-1`}>{new Date(item.created_at).toLocaleString()}</p>
                                    <div className="flex items-center gap-2 mt-3">
                                        <button onClick={() => onLoad(item)} className={`px-4 py-2 text-sm text-white font-semibold rounded-md ${loadButtonClasses}`}>{t.loadButton}</button>
                                        {/* ✨ 新增删除按钮 ✨ */}
                                        <button onClick={() => onDelete(item.id)} className={`px-4 py-2 text-sm text-white font-semibold rounded-md flex items-center gap-1 ${deleteButtonClasses}`}><TrashIcon /> {t.deleteButton}</button>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </div>
        </div>
    );
};


// ... (Header, AuthPage, MainApp 组件保持不变) ...

// --- 根组件 (大脑) ---
function App() {
  // ... (所有 state 保持不变) ...
  const [history, setHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);

  // --- 所有函数也住在这里 ---
  useEffect(() => {
    if (token) { fetchHistory(); }
  }, [token]);

  const fetchHistory = async () => { /* ... (代码不变) ... */ };
  const handleLoadFromHistory = (item) => { /* ... (代码不变) ... */ };
  const handleSubmit = async (event) => { /* ... (代码不变) ... */ };
  const handleLanguageToggle = () => { /* ... */ };
  const handleVariantToggle = () => { /* ... */ };
  const handleThemeToggle = () => { /* ... */ };
  const handleRegister = async (e) => { /* ... */ };
  const handleLogin = async (e) => { /* ... */ };
  const handleLogout = () => { /* ... */ };
  const handleGuestMode = () => { /* ... */ };

  // --- ✨ 新增：处理删除历史记录的函数 ✨ ---
  const handleDeleteHistoryItem = async (promptId) => {
      // 注意：真实产品中，这里应该弹出一个漂亮的确认框，而不是用丑丑的 window.confirm
      // 但为了快速实现功能，我们先用这个！
      if (window.confirm(t.confirmDelete)) {
          const currentToken = localStorage.getItem('plot_ark_token');
          if (!currentToken) {
              setError("认证信息已过期，请重新登录。");
              return;
          }

          try {
              const response = await fetch(`${API_ENDPOINTS.history}/${promptId}`, {
                  method: 'DELETE',
                  headers: { 'Authorization': `Bearer ${currentToken}` }
              });

              if (!response.ok) {
                  const data = await response.json();
                  throw new Error(data.error || '删除失败。');
              }
              
              // ✨ 乐观更新 UI：直接在前端把这条记录删掉，让界面反应更快 ✨
              setHistory(prevHistory => prevHistory.filter(item => item.id !== promptId));

          } catch (err) {
              console.error(err);
              // 如果删除失败，最好给用户一个提示
              // 这里我们暂时只在控制台打印错误
          }
      }
  };


  const t = translations[language] || translations['en'];
  const isDark = theme === 'dark';
  const containerClasses = isDark ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-800";

  // ... (props 组织和最终渲染逻辑保持不变) ...
  
  return (
    <div className={`min-h-screen p-4 sm:p-8 font-sans transition-colors duration-500 ${containerClasses}`}>
        {showHistory && <HistoryModal t={t} isDark={isDark} history={history} onLoad={handleLoadFromHistory} onClose={() => setShowHistory(false)} onDelete={handleDeleteHistoryItem} />}
        
        {/* ... (页面渲染逻辑不变) ... */}
    </div>
  );
}

export default App;
