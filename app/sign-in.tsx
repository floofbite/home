'use client';

import { useNProgress } from './hooks/useNProgress';

type Props = {
  onSignIn: () => Promise<void>;
};

const SignIn = ({ onSignIn }: Props) => {
  const { start } = useNProgress();

  const handleSignIn = async () => {
    start(); // 立即顯示進度條
    try {
      await onSignIn();
    } catch (error) {
      console.error('登入失敗:', error);
    }
  };

  return (
    <button
      onClick={handleSignIn}
      className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl text-base sm:text-lg min-h-[44px]"
    >
      登入
    </button>
  );
};

export default SignIn;