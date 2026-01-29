
import React, { useState, useCallback } from 'react';
import GameCanvas from './components/GameCanvas';
import { GameStatus } from './types';
import { Trophy, Play, RotateCcw, Mountain } from 'lucide-react';

const App: React.FC = () => {
  const [status, setStatus] = useState<GameStatus>(GameStatus.START);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(() => {
    const saved = localStorage.getItem('ski_highscore');
    return saved ? parseInt(saved, 10) : 0;
  });

  const handleGameOver = useCallback((finalScore: number) => {
    setStatus(GameStatus.GAMEOVER);
    setScore(finalScore);
    if (finalScore > highScore) {
      setHighScore(finalScore);
      localStorage.setItem('ski_highscore', finalScore.toString());
    }
  }, [highScore]);

  const startGame = () => {
    setStatus(GameStatus.PLAYING);
    setScore(0);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-sky-50 font-sans text-slate-900">
      {/* 标题信息 */}
      <div className="mb-6 flex flex-col items-center">
        <div className="flex items-center gap-2 mb-1">
          <Mountain className="text-sky-600 w-8 h-8" />
          <h1 className="text-4xl font-extrabold tracking-tight text-sky-900 italic">高山滑雪</h1>
        </div>
        <p className="text-sky-600/70 font-semibold text-sm tracking-widest uppercase">闪避障碍 • 征服雪道</p>
      </div>

      <div className="relative w-full max-w-[600px]">
        {/* 游戏画布 */}
        <GameCanvas 
          status={status} 
          onGameOver={handleGameOver} 
          onScoreUpdate={setScore}
        />

        {/* HUD - 分数显示 */}
        {status === GameStatus.PLAYING && (
          <div className="absolute top-4 left-4 right-4 flex justify-between items-start pointer-events-none">
            <div className="bg-white/80 backdrop-blur-md px-4 py-2 rounded-full shadow-lg border border-sky-100">
              <span className="text-xs font-bold text-sky-500 block uppercase tracking-wider">当前得分</span>
              <span className="text-2xl font-black text-sky-900">{score}</span>
            </div>
            <div className="bg-white/80 backdrop-blur-md px-4 py-2 rounded-full shadow-lg border border-sky-100 flex items-center gap-2">
              <Trophy className="w-4 h-4 text-amber-500" />
              <div>
                <span className="text-xs font-bold text-amber-600 block uppercase tracking-wider">最高纪录</span>
                <span className="text-lg font-black text-slate-800">{highScore}</span>
              </div>
            </div>
          </div>
        )}

        {/* 开始界面遮罩 */}
        {status === GameStatus.START && (
          <div className="absolute inset-0 z-10 bg-white/40 backdrop-blur-[2px] flex items-center justify-center p-8 rounded-xl">
            <div className="bg-white p-8 rounded-3xl shadow-2xl text-center max-w-sm w-full border border-sky-50">
              <h2 className="text-2xl font-black mb-4 text-sky-900">准备好出发了吗？</h2>
              <p className="text-slate-600 mb-8 leading-relaxed">
                使用 <span className="px-2 py-1 bg-slate-100 rounded font-bold">左</span> 和 <span className="px-2 py-1 bg-slate-100 rounded font-bold">右</span> 方向键控制转向。
                注意不要撞到树木或石块！
              </p>
              <button 
                onClick={startGame}
                className="group w-full flex items-center justify-center gap-3 bg-sky-600 hover:bg-sky-700 text-white font-bold py-4 px-8 rounded-2xl transition-all shadow-[0_8px_0_#0369a1] active:shadow-none active:translate-y-2"
              >
                <Play className="fill-current w-6 h-6" />
                开始滑雪
              </button>
            </div>
          </div>
        )}

        {/* 游戏结束界面遮罩 */}
        {status === GameStatus.GAMEOVER && (
          <div className="absolute inset-0 z-10 bg-rose-500/10 backdrop-blur-sm flex items-center justify-center p-8 rounded-xl">
            <div className="bg-white p-8 rounded-3xl shadow-2xl text-center max-w-sm w-full border-4 border-rose-100">
              <div className="w-20 h-20 bg-rose-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Mountain className="text-rose-500 w-10 h-10" />
              </div>
              <h2 className="text-3xl font-black mb-2 text-rose-600 uppercase italic">哎呀，摔倒了！</h2>
              <div className="grid grid-cols-2 gap-4 mb-8">
                <div className="p-4 bg-slate-50 rounded-2xl">
                  <p className="text-xs font-bold text-slate-400 uppercase mb-1">本次得分</p>
                  <p className="text-2xl font-black text-slate-800">{score}</p>
                </div>
                <div className="p-4 bg-amber-50 rounded-2xl">
                  <p className="text-xs font-bold text-amber-500 uppercase mb-1">历史最高</p>
                  <p className="text-2xl font-black text-slate-800">{highScore}</p>
                </div>
              </div>
              <button 
                onClick={startGame}
                className="group w-full flex items-center justify-center gap-3 bg-rose-500 hover:bg-rose-600 text-white font-bold py-4 px-8 rounded-2xl transition-all shadow-[0_8px_0_#be123c] active:shadow-none active:translate-y-2"
              >
                <RotateCcw className="w-6 h-6" />
                再试一次
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 底部操作说明 */}
      <div className="mt-8 text-sky-900/40 text-sm font-medium flex items-center gap-4">
        <span className="flex items-center gap-1"><kbd className="px-2 py-0.5 bg-sky-100 rounded text-sky-700">←</kbd> 左移</span>
        <span className="flex items-center gap-1"><kbd className="px-2 py-0.5 bg-sky-100 rounded text-sky-700">→</kbd> 右移</span>
        <span className="hidden sm:inline">•</span>
        <span className="hidden sm:inline">闪避石块和树木以生存</span>
      </div>
    </div>
  );
};

export default App;
