/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class', // 开启 class-based dark mode
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // 亮色主题 (蓝白配色)
        'light-background': '#f0f9ff', // 非常浅的蓝色
        'light-card': '#ffffff',
        'light-primary': '#2563eb',    // Blue-600
        'light-primary-hover': '#1d4ed8', // Blue-700
        'light-text-primary': '#1e293b',   // Slate-800
        'light-text-secondary': '#64748b',// Slate-500
        'light-border': '#e2e8f0',       // Slate-200
        'light-success': '#16a34a',      // Green-600
        'light-error': '#dc2626',        // Red-600

        // 暗色主题 (紫灰配色)
        'dark-background': '#111827',     // Gray-900 (一个中性的深灰色)
        'dark-card': '#1f2937',          // Gray-800
        'dark-primary': '#7c3aed',         // Violet-600
        'dark-primary-hover': '#6d28d9',  // Violet-700
        'dark-text-primary': '#f9fafb',    // Gray-50
        'dark-text-secondary': '#9ca3af', // Gray-400
        'dark-border': '#374151',        // Gray-700
        'dark-success': '#22c55e',       // Green-500
        'dark-error': '#ef4444',         // Red-500
      }
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
}

