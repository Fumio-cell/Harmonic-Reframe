import React from 'react';
import type { EQPresetName } from '../dsp/eqPreset';
import { EQ_PRESETS } from '../dsp/eqPreset';
import { Zap } from 'lucide-react';

interface EnhancerPanelProps {
    preset: EQPresetName;
    onPresetChange: (v: EQPresetName) => void;
    disabled: boolean;
    isPro: boolean;
}

const ICONS: Record<EQPresetName, string> = {
    off: '⏸️',
    natural: '🍃',
    clear: '✨',
    warm: '🔥',
    wide: '🎧',
};

const PRO_PRESETS: EQPresetName[] = ['clear', 'warm', 'wide'];

const EnhancerPanel: React.FC<EnhancerPanelProps> = ({
    preset,
    onPresetChange,
    disabled,
    isPro,
}) => {
    const presetNames = Object.keys(EQ_PRESETS) as EQPresetName[];
    const current = EQ_PRESETS[preset];

    const handlePresetClick = (name: EQPresetName) => {
        if (!isPro && PRO_PRESETS.includes(name)) {
            if (confirm(`${EQ_PRESETS[name].label} enhancer is a PRO feature. Would you like to upgrade?`)) {
                window.dispatchEvent(new CustomEvent('app:buyPro'));
            }
            return;
        }
        onPresetChange(name);
    };

    return (
        <div className="card fade-up h-full flex flex-col justify-center">
            <div className="card-title">
                <span className="icon">🎛️</span> Enhancer
            </div>

            <div className="enhance-grid">
                {presetNames.map((name) => {
                    const isGated = !isPro && PRO_PRESETS.includes(name);
                    return (
                        <button
                            key={name}
                            className={`enhance-btn ${preset === name ? 'active' : ''} ${isGated ? 'gated' : ''}`}
                            onClick={() => handlePresetClick(name)}
                            disabled={disabled}
                        >
                            <span className="enhance-icon">
                                {isGated ? <Zap className="w-4 h-4 text-amber-500 fill-amber-500" /> : ICONS[name]}
                            </span>
                            <span className="enhance-label">
                                {EQ_PRESETS[name].label}
                                {isGated && <span className="pro-label">PRO</span>}
                            </span>
                        </button>
                    );
                })}
            </div>

            {preset !== 'off' && (
                <div className="enhance-desc fade-up">{current.description}</div>
            )}
        </div>
    );
};

export default EnhancerPanel;
