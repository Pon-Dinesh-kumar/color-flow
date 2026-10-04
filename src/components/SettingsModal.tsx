import React, { useRef, useState } from 'react';
import { X, Volume2, VolumeX, Music, Trash2, Image, Upload, Check, RotateCcw } from 'lucide-react';
import { useGameStore } from '../game/gameState';
import { AudioManager } from '../engine/AudioManager';

export const SettingsModal: React.FC = () => {
  const {
    sfx,
    music,
    toggleSfx,
    toggleMusic,
    resetProgress,
    setShowSettings,
    customBackgroundUrl,
    setCustomBackgroundUrl,
  } = useGameStore();

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [uploadStatus, setUploadStatus] = useState<string | null>(null);

  const handleReset = () => {
    if (confirm('Are you sure you want to reset all game progress?')) {
      AudioManager.playButtonClick();
      resetProgress();
      setShowSettings(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadStatus('Loading...');
    const reader = new FileReader();
    reader.onload = async () => {
      const dataUrl = reader.result as string;
      setCustomBackgroundUrl(dataUrl);
      setUploadStatus('Applied!');

      // Also persist to server disk so public/assets/default_background.jpg is permanently replaced
      try {
        await fetch('/api/upload-background', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ imageBase64: dataUrl }),
        });
      } catch (err) {
        console.warn('Could not persist to server disk:', err);
      }

      setTimeout(() => setUploadStatus(null), 3500);
    };
    reader.readAsDataURL(file);
  };

  const handleResetBackground = () => {
    AudioManager.playButtonClick();
    setCustomBackgroundUrl(null);
    setUploadStatus('Default Restored');
    setTimeout(() => setUploadStatus(null), 2500);
  };

  return (
    <div className="absolute inset-0 z-40 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md select-none animate-fade-in">
      <div className="w-full max-w-sm rounded-3xl bg-slate-900 border-2 border-white/20 shadow-2xl p-6 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-4">
          <h3 className="text-xl font-black text-white">Settings</h3>
          <button
            onClick={() => {
              AudioManager.playButtonClick();
              setShowSettings(false);
            }}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center cursor-pointer transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Options */}
        <div className="flex flex-col gap-4">
          {/* SFX Toggle */}
          <div className="flex items-center justify-between py-1">
            <div className="flex items-center gap-3 text-white">
              {sfx ? <Volume2 className="w-5 h-5 text-emerald-400" /> : <VolumeX className="w-5 h-5 text-red-400" />}
              <span className="font-bold text-sm">Sound Effects</span>
            </div>
            <button
              onClick={() => {
                AudioManager.playButtonClick();
                toggleSfx();
              }}
              className={`w-14 h-8 rounded-full p-1 transition-colors cursor-pointer ${
                sfx ? 'bg-emerald-500' : 'bg-slate-700'
              }`}
            >
              <div
                className={`w-6 h-6 rounded-full bg-white transition-transform ${
                  sfx ? 'translate-x-6' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Music Toggle */}
          <div className="flex items-center justify-between py-1">
            <div className="flex items-center gap-3 text-white">
              <Music className={`w-5 h-5 ${music ? 'text-indigo-400' : 'text-slate-500'}`} />
              <span className="font-bold text-sm">Background Music</span>
            </div>
            <button
              onClick={() => {
                AudioManager.playButtonClick();
                toggleMusic();
              }}
              className={`w-14 h-8 rounded-full p-1 transition-colors cursor-pointer ${
                music ? 'bg-indigo-500' : 'bg-slate-700'
              }`}
            >
              <div
                className={`w-6 h-6 rounded-full bg-white transition-transform ${
                  music ? 'translate-x-6' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Background Image Direct Replacement */}
          <div className="pt-3 border-t border-white/10 flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5 text-white">
                <Image className="w-4 h-4 text-cyan-400" />
                <span className="font-bold text-sm">Background Image</span>
              </div>
              {uploadStatus && (
                <span className="text-xs font-bold text-emerald-400 flex items-center gap-1">
                  <Check className="w-3.5 h-3.5" />
                  {uploadStatus}
                </span>
              )}
            </div>

            <p className="text-white/60 text-xs">
              Upload your exact image directly without AI generation.
            </p>

            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/*"
              className="hidden"
            />

            <div className="flex items-center gap-2 mt-1">
              <button
                onClick={() => {
                  AudioManager.playButtonClick();
                  fileInputRef.current?.click();
                }}
                className="flex-1 py-2 px-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 active:scale-95 text-white font-extrabold text-xs flex items-center justify-center gap-1.5 shadow-md cursor-pointer transition-all border border-white/20"
              >
                <Upload className="w-3.5 h-3.5" />
                Upload Exact Image
              </button>

              {customBackgroundUrl && (
                <button
                  onClick={handleResetBackground}
                  title="Restore default"
                  className="py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white/80 font-bold text-xs flex items-center gap-1 border border-white/15 cursor-pointer active:scale-95 transition-all"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  Default
                </button>
              )}
            </div>
          </div>

          {/* Reset progress */}
          <div className="pt-3 border-t border-white/10 flex justify-between items-center">
            <div>
              <p className="text-white font-bold text-sm">Reset Progress</p>
              <p className="text-white/50 text-xs">Clear all levels and stars</p>
            </div>
            <button
              onClick={handleReset}
              className="py-2 px-3 rounded-xl bg-red-500/20 hover:bg-red-500/30 text-red-400 font-bold text-xs flex items-center gap-1.5 border border-red-500/30 cursor-pointer active:scale-95 transition-all"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Reset
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
