'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import NProgress from 'nprogress';

// 配置 NProgress
if (typeof window !== 'undefined') {
  NProgress.configure({
    showSpinner: false, // 隱藏旋轉器
    speed: 400, // 動畫速度
    minimum: 0.2, // 最小進度
    trickleSpeed: 200, // 自動遞增速度
  });
}

const LoadingBar = () => {
  const pathname = usePathname();

  useEffect(() => {
    // 路由變化時完成進度條
    const timer = setTimeout(() => {
      NProgress.done();
    }, 100);

    return () => {
      clearTimeout(timer);
    };
  }, [pathname]);

  useEffect(() => {
    // 監聽所有可能觸發導航的點擊事件
    const handleClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      
      // 檢查是否點擊了連結、按鈕或可點擊元素
      const clickableElement = target.closest('a, button, [role="button"], [data-navigate]');
      
      if (clickableElement) {
        const element = clickableElement as HTMLAnchorElement | HTMLButtonElement;
        
        // 檢查是否是導航連結
        if (element.tagName === 'A') {
          const href = element.getAttribute('href');
          // 如果是內部連結且不是當前頁面
          if (href && href.startsWith('/') && href !== pathname) {
            NProgress.start();
          }
        }
        
        // 檢查是否是表單提交按鈕
        if (element.tagName === 'BUTTON') {
          const type = element.getAttribute('type');
          const form = element.closest('form');
          
          // 如果是提交按鈕或在表單中的按鈕
          if (type === 'submit' || form) {
            NProgress.start();
          }
        }
      }
    };

    // 監聽表單提交
    const handleFormSubmit = () => {
      NProgress.start();
    };

    // 監聽頁面卸載（新頁面開始載入）
    const handleBeforeUnload = () => {
      NProgress.start();
    };

    // 添加事件監聽器
    document.addEventListener('click', handleClick);
    document.addEventListener('submit', handleFormSubmit);
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      document.removeEventListener('click', handleClick);
      document.removeEventListener('submit', handleFormSubmit);
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [pathname]);

  return null;
};

export default LoadingBar;
