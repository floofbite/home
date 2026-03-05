'use client';

import { useNProgress } from './hooks/useNProgress';

type Props = {
  onSignOut: () => Promise<void>;
};

const SignOut = ({ onSignOut }: Props) => {
  const { start } = useNProgress();

  const handleSignOut = async () => {
    start(); // 立即顯示進度條
    try {
      await onSignOut();
    } finally {
      // 進度條會在路由變化時自動完成，這裡不需要手動調用 done()
    }
  };

  return (
    <button
      onClick={handleSignOut}
      className="w-full sm:w-auto bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-200 shadow-md hover:shadow-lg text-sm sm:text-base min-h-[44px]"
    >
      登出
    </button>
  );
};

export default SignOut;