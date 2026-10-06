import React, { useState } from 'react';
import { X, Play, CheckCircle2, AlertTriangle, Copy, FastForward, Trophy } from 'lucide-react';
import { useGameStore } from '../game/gameState';
import { PipeType } from '../puzzle/Pipe';
import { FlowColor, COLOR_PALETTE } from '../puzzle/ColorSystem';
import { LevelConfig } from '../gameplay/Level';
import { LevelValidator } from '../gameplay/LevelValidator';
import { LevelLoader } from '../gameplay/LevelLoader';
import { posKey } from '../puzzle/Grid';
import { AudioManager } from '../engine/AudioManager';

export const LevelEditorModal: React.FC = () => {
  const {
    setShowEditor,
    loadLevel,
    currentLevelNumber,
    nextLevel,
    setPhase,
  } = useGameStore();

  const [gridW, setGridW] = useState(4);
  const [gridH, setGridH] = useState(4);
  const [selectedColor, setSelectedColor] = useState<FlowColor>('red');
  const [selectedTool, setSelectedTool] = useState<
    'pipe_straight' | 'pipe_corner' | 'pipe_t' | 'pipe_cross' | 'pipe_splitter' | 'pipe_merger' | 'pipe_gate' | 'pipe_oneway' | 'pipe_color_changer' | 'source' | 'target' | 'eraser'
  >('pipe_straight');

  const [editorPipes, setEditorPipes] = useState<Map<string, { type: PipeType; rotation: number; targetColor?: FlowColor }>>(
    new Map()
  );
  const [editorSources, setEditorSources] = useState<Map<string, { color: FlowColor; amount: number }>>(
    new Map()
  );
  const [editorTargets, setEditorTargets] = useState<Map<string, { color: FlowColor; amount: number }>>(
    new Map()
  );

  const [validationMsg, setValidationMsg] = useState<{ valid: boolean; errors: string[]; warnings: string[] } | null>(null);
  const [copiedNotice, setCopiedNotice] = useState(false);

  const handleCellClick = (x: number, y: number) => {
    const key = `${x},${y}`;

    if (selectedTool === 'eraser') {
      const p = new Map(editorPipes);
      const s = new Map(editorSources);
      const t = new Map(editorTargets);
      p.delete(key);
      s.delete(key);
      t.delete(key);
      setEditorPipes(p);
      setEditorSources(s);
      setEditorTargets(t);
      return;
    }

    if (selectedTool === 'source') {
      const s = new Map(editorSources);
      s.set(key, { color: selectedColor, amount: 10 });
      setEditorSources(s);
      // Clean up pipe/target at this cell
      const p = new Map(editorPipes);
      const t = new Map(editorTargets);
      p.delete(key);
      t.delete(key);
      setEditorPipes(p);
      setEditorTargets(t);
      return;
    }

    if (selectedTool === 'target') {
      const t = new Map(editorTargets);
      t.set(key, { color: selectedColor, amount: 10 });
      setEditorTargets(t);
      // Clean up
      const p = new Map(editorPipes);
      const s = new Map(editorSources);
      p.delete(key);
      s.delete(key);
      setEditorPipes(p);
      setEditorSources(s);
      return;
    }

    // Pipe tool
    const typeMap: Record<string, PipeType> = {
      pipe_straight: 'straight',
      pipe_corner: 'corner',
      pipe_t: 't_junction',
      pipe_cross: 'cross',
      pipe_splitter: 'splitter',
      pipe_merger: 'merger',
      pipe_gate: 'gate',
      pipe_oneway: 'one_way',
      pipe_color_changer: 'color_changer',
    };

    const pipeType = typeMap[selectedTool] || 'straight';
    const p = new Map(editorPipes);

    const existing = p.get(key);
    if (existing && existing.type === pipeType) {
      // Rotate existing pipe
      p.set(key, {
        ...existing,
        rotation: (existing.rotation + 90) % 360,
      });
    } else {
      p.set(key, {
        type: pipeType,
        rotation: 0,
        targetColor: pipeType === 'color_changer' ? selectedColor : undefined,
      });
    }

    // Clear sources/targets at cell
    const s = new Map(editorSources);
    const t = new Map(editorTargets);
    s.delete(key);
    t.delete(key);
    setEditorPipes(p);
    setEditorSources(s);
    setEditorTargets(t);
  };

  const buildCurrentLevelConfig = (): LevelConfig => {
    const sources = Array.from(editorSources.entries()).map(([k, s], idx) => {
      const [x, y] = k.split(',').map(Number);
      return {
        id: `custom_src_${idx + 1}`,
        position: { x, y },
        direction: 'down' as const,
        color: s.color,
        amount: s.amount,
      };
    });

    const targets = Array.from(editorTargets.entries()).map(([k, t], idx) => {
      const [x, y] = k.split(',').map(Number);
      return {
        id: `custom_tgt_${idx + 1}`,
        position: { x, y },
        acceptDirection: 'up' as const,
        color: t.color,
        requiredAmount: t.amount,
        currentAmount: 0,
      };
    });

    const pipes = Array.from(editorPipes.entries()).map(([k, p], idx) => {
      const [x, y] = k.split(',').map(Number);
      return {
        id: `custom_p_${idx + 1}`,
        type: p.type,
        gridPosition: { x, y },
        rotation: p.rotation,
        targetColor: p.targetColor,
      };
    });

    return {
      id: `custom_level_${Date.now()}`,
      number: 999,
      title: 'Custom Workshop Level',
      grid: { width: gridW, height: gridH },
      sources,
      targets,
      pipes,
      targetMoves: 6,
      maxMoves: 16,
    };
  };

  const handleValidate = () => {
    const config = buildCurrentLevelConfig();
    const result = LevelValidator.validate(config);
    setValidationMsg(result);
  };

  const handleExportJson = () => {
    const config = buildCurrentLevelConfig();
    const jsonStr = JSON.stringify(config, null, 2);
    navigator.clipboard.writeText(jsonStr);
    setCopiedNotice(true);
    setTimeout(() => setCopiedNotice(false), 2000);
  };

  const handlePlayCustom = () => {
    const config = buildCurrentLevelConfig();
    LevelLoader.registerCustomLevel(config);
    loadLevel(999);
    setShowEditor(false);
  };

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center p-3 md:p-6 bg-slate-950/80 backdrop-blur-md select-none animate-fade-in text-white">
      <div className="w-full max-w-2xl max-h-[92vh] rounded-3xl bg-slate-900 border-2 border-white/20 shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-4 px-6 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h3 className="text-xl font-black">Level Editor & Dev Tools</h3>
            <span className="text-xs py-0.5 px-2.5 rounded-full bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/30">
              Debug Mode
            </span>
          </div>
          <button
            onClick={() => setShowEditor(false)}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center cursor-pointer transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Editor Body */}
        <div className="p-5 overflow-y-auto flex flex-col gap-4 custom-scrollbar">
          {/* Quick Cheats / Dev Actions */}
          <div className="p-3 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-between flex-wrap gap-2">
            <span className="text-xs font-bold text-white/60">DEV CHEATS:</span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  AudioManager.playButtonClick();
                  nextLevel();
                  setShowEditor(false);
                }}
                className="py-1.5 px-3 rounded-xl bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-300 text-xs font-bold flex items-center gap-1.5 border border-indigo-500/30 cursor-pointer"
              >
                <FastForward className="w-3.5 h-3.5" /> Skip Level
              </button>

              <button
                onClick={() => {
                  AudioManager.playButtonClick();
                  setPhase('completed');
                  setShowEditor(false);
                }}
                className="py-1.5 px-3 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 text-xs font-bold flex items-center gap-1.5 border border-emerald-500/30 cursor-pointer"
              >
                <Trophy className="w-3.5 h-3.5" /> Instant Win
              </button>
            </div>
          </div>

          {/* Grid Size Selectors */}
          <div className="flex items-center gap-4 flex-wrap text-sm">
            <span className="font-bold text-white/80">Grid Dimensions:</span>
            <div className="flex items-center gap-2">
              <span>W:</span>
              {[3, 4, 5, 6, 7].map((w) => (
                <button
                  key={w}
                  onClick={() => setGridW(w)}
                  className={`w-7 h-7 rounded-lg text-xs font-black cursor-pointer ${
                    gridW === w ? 'bg-cyan-500 text-white' : 'bg-white/10 text-white/70'
                  }`}
                >
                  {w}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-2">
              <span>H:</span>
              {[3, 4, 5, 6, 7].map((h) => (
                <button
                  key={h}
                  onClick={() => setGridH(h)}
                  className={`w-7 h-7 rounded-lg text-xs font-black cursor-pointer ${
                    gridH === h ? 'bg-cyan-500 text-white' : 'bg-white/10 text-white/70'
                  }`}
                >
                  {h}
                </button>
              ))}
            </div>
          </div>

          {/* Tool Selector */}
          <div className="flex flex-col gap-1.5">
            <span className="text-xs font-bold text-white/60">PIECE PALETTE:</span>
            <div className="flex flex-wrap gap-1.5">
              {[
                { id: 'pipe_straight', label: 'Straight ┃' },
                { id: 'pipe_corner', label: 'Elbow ┓' },
                { id: 'pipe_t', label: 'T-Pipe ┳' },
                { id: 'pipe_cross', label: 'Cross ╋' },
                { id: 'pipe_splitter', label: 'Splitter ⑂' },
                { id: 'pipe_merger', label: 'Merger ⑃' },
                { id: 'pipe_gate', label: 'Gate ⚙' },
                { id: 'pipe_oneway', label: 'One-Way ⬇' },
                { id: 'pipe_color_changer', label: 'Prism ◈' },
                { id: 'source', label: 'Source 🚰' },
                { id: 'target', label: 'Target 🫙' },
                { id: 'eraser', label: 'Eraser ✕' },
              ].map((tool) => (
                <button
                  key={tool.id}
                  onClick={() => setSelectedTool(tool.id as any)}
                  className={`py-1.5 px-3 rounded-xl text-xs font-bold transition-colors cursor-pointer border ${
                    selectedTool === tool.id
                      ? 'bg-cyan-500 border-cyan-400 text-white shadow-md'
                      : 'bg-white/10 border-white/10 text-white/80 hover:bg-white/15'
                  }`}
                >
                  {tool.label}
                </button>
              ))}
            </div>
          </div>

          {/* Color Selector */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-bold text-white/60">COLOR:</span>
            {(['red', 'blue', 'yellow', 'green', 'purple', 'orange'] as FlowColor[]).map((c) => (
              <button
                key={c}
                onClick={() => setSelectedColor(c)}
                className={`py-1 px-3 rounded-full text-xs font-black transition-all cursor-pointer flex items-center gap-1.5 border ${
                  selectedColor === c ? 'scale-105 ring-2 ring-white' : 'opacity-70'
                }`}
                style={{ backgroundColor: COLOR_PALETTE[c].hex }}
              >
                <div className="w-2.5 h-2.5 rounded-full bg-white/50" />
                <span className="text-white drop-shadow-sm capitalize">{c}</span>
              </button>
            ))}
          </div>

          {/* Interactive Grid Canvas */}
          <div className="p-4 bg-slate-950/70 border border-white/10 rounded-2xl flex items-center justify-center overflow-x-auto">
            <div
              className="grid gap-1.5"
              style={{
                gridTemplateColumns: `repeat(${gridW}, minmax(0, 1fr))`,
              }}
            >
              {Array.from({ length: gridH }).map((_, y) =>
                Array.from({ length: gridW }).map((_, x) => {
                  const key = `${x},${y}`;
                  const p = editorPipes.get(key);
                  const s = editorSources.get(key);
                  const t = editorTargets.get(key);

                  return (
                    <button
                      key={key}
                      onClick={() => handleCellClick(x, y)}
                      className="w-12 h-12 md:w-14 md:h-14 rounded-xl border border-white/15 bg-slate-800/80 hover:border-cyan-400 active:scale-90 transition-all flex flex-col items-center justify-center relative cursor-pointer group"
                    >
                      {s && (
                        <div
                          className="w-6 h-6 rounded-full border border-white/60 shadow-md flex items-center justify-center text-[9px] font-black text-white"
                          style={{ backgroundColor: COLOR_PALETTE[s.color].hex }}
                        >
                          S
                        </div>
                      )}
                      {t && (
                        <div
                          className="w-6 h-6 rounded-md border border-white/60 shadow-md flex items-center justify-center text-[9px] font-black text-white"
                          style={{ backgroundColor: COLOR_PALETTE[t.color].hex }}
                        >
                          T
                        </div>
                      )}
                      {p && (
                        <div className="flex flex-col items-center">
                          <span
                            className="text-sm font-black text-white transform transition-transform"
                            style={{ transform: `rotate(${p.rotation}deg)` }}
                          >
                            {p.type === 'straight' && '┃'}
                            {p.type === 'corner' && '┓'}
                            {p.type === 't_junction' && '┳'}
                            {p.type === 'cross' && '╋'}
                            {p.type === 'splitter' && '⑂'}
                            {p.type === 'merger' && '⑃'}
                            {p.type === 'gate' && '⚙'}
                            {p.type === 'one_way' && '⬇'}
                            {p.type === 'color_changer' && '◈'}
                          </span>
                          <span className="text-[8px] text-white/50">{p.rotation}°</span>
                        </div>
                      )}
                      {!s && !t && !p && (
                        <span className="text-[10px] text-white/20 font-bold group-hover:text-white/60">
                          {x},{y}
                        </span>
                      )}
                    </button>
                  );
                })
              )}
            </div>
          </div>

          {/* Validation Feedback */}
          {validationMsg && (
            <div
              className={`p-3 rounded-xl border text-xs flex flex-col gap-1 ${
                validationMsg.valid
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                  : 'bg-red-500/10 border-red-500/30 text-red-300'
              }`}
            >
              <div className="flex items-center gap-1.5 font-bold">
                {validationMsg.valid ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                ) : (
                  <AlertTriangle className="w-4 h-4 text-red-400" />
                )}
                <span>
                  {validationMsg.valid ? 'Level Validated Successfully!' : 'Validation Errors:'}
                </span>
              </div>
              {validationMsg.errors.map((err, i) => (
                <p key={i} className="ml-5 list-disc">• {err}</p>
              ))}
              {validationMsg.warnings.map((warn, i) => (
                <p key={i} className="ml-5 text-amber-300">• Warning: {warn}</p>
              ))}
            </div>
          )}

          {/* Actions Bottom Bar */}
          <div className="flex items-center justify-between gap-3 pt-2 border-t border-white/10 flex-wrap">
            <div className="flex items-center gap-2">
              <button
                onClick={handleValidate}
                className="py-2.5 px-4 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer border border-white/15"
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                Validate Level
              </button>

              <button
                onClick={handleExportJson}
                className="py-2.5 px-4 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer border border-white/15"
              >
                <Copy className="w-4 h-4" />
                {copiedNotice ? 'Copied JSON!' : 'Export JSON'}
              </button>
            </div>

            <button
              onClick={handlePlayCustom}
              className="py-2.5 px-5 rounded-xl bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-400 hover:to-green-500 text-white font-black text-xs flex items-center gap-2 cursor-pointer shadow-lg active:scale-95 transition-all"
            >
              <Play className="w-4 h-4 fill-white" />
              PLAY IN 3D
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
