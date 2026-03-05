'use client';

import { useCallback } from 'react';
import NProgress from 'nprogress';

// 配置 NProgress 全域設置
if (typeof window !== 'undefined') {
  NProgress.configure({
    showSpinner: false,
    speed: 400,
    minimum: 0.2,
    trickleSpeed: 200,
  });
}

export const useNProgress = () => {
  const start = useCallback(() => NProgress.start(), []);
  const done = useCallback(() => NProgress.done(), []);
  const set = useCallback((progress: number) => NProgress.set(progress), []);
  const inc = useCallback((amount?: number) => NProgress.inc(amount), []);
  
  return { start, done, set, inc };
};

// 用於按鈕點擊時的進度條鉤子
export const useButtonProgress = () => {
  const { start, done } = useNProgress();
  
  const handleClick = useCallback(() => {
    start();
    // 可以選擇在操作完成後調用 done()
  }, [start]);
  
  const handleAsyncAction = useCallback(async (action: () => Promise<void>) => {
    start();
    try {
      await action();
    } finally {
      done();
    }
  }, [start, done]);
  
  return { handleClick, handleAsyncAction, start, done };
};
