import React from 'react';
import { Settings2 } from 'lucide-react';

interface ConversionPanelProps {
    enabled: boolean;
    targetPitch: number;
    onToggle: () => void;
    onTargetChange: (v: number) => void;
    disabled: boolean;
}

const PRESETS = [
    { label: '432Hz', value: 432 },
    { label: '444Hz', value: 444 },
    { label: '528Hz', value: 528 },
];

const SOLFEGGIO_PRESETS = [
    { freq: 174, label: 'Relief' },
    { freq: 285, label: 'Heal' },
    { freq: 396, label: 'Fearless' },
    { freq: 417, label: 'Change' },
    { freq: 528, label: 'Miracle' },
    { freq: 639, label: 'Connect' },
    { freq: 741, label: 'Solve' },
    { freq: 852, label: 'Insight' },
    { freq: 963, label: 'Awake' },
];

const ConversionPanel: React.FC<ConversionPanelProps> = ({
    enabled,
    targetPitch,
    onToggle,
    onTargetChange,
    disabled,
}) => {
    return (
        <div className="card fade-up h-full flex flex-col justify-center">
            <div className="card-title">
                <Settings2 className="w-4 h-4 text-accent" /> Pitch Conversion
            </div>

            <div className="pitch-row">
                <button
                    className={`pitch-toggle ${enabled ? 'on' : ''}`}
                    onClick={onToggle}
                    disabled={disabled}
                    aria-label="Toggle Pitch Conversion"
                >
                    <div className="knob" />
                </button>
                <span className="pitch-label">
                    440Hz → {targetPitch}Hz Conversion {enabled ? '✓' : ''}
                </span>
            </div>

            {enabled && (
                <>
                    <div className="pitch-presets">
                        {PRESETS.map((p) => (
                            <button
                                key={p.value}
                                className={`pitch-preset ${targetPitch === p.value ? 'active' : ''}`}
                                onClick={() => onTargetChange(p.value)}
                                disabled={disabled}
                            >
                                440→{p.label}
                            </button>
                        ))}
                    </div>

                    <div className="solfeggio-section">
                        <span className="solfeggio-label">Solfeggio Frequencies</span>
                        <div className="solfeggio-grid">
                            {SOLFEGGIO_PRESETS.map((p) => (
                                <button
                                    key={p.freq}
                                    className={`solfeggio-btn ${targetPitch === p.freq ? 'active' : ''}`}
                                    onClick={() => onTargetChange(p.freq)}
                                    disabled={disabled}
                                >
                                    <span className="sol-freq">{p.freq}Hz</span>
                                    <span className="sol-desc">{p.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="custom-pitch">
                        <span>Custom:</span>
                        <input
                            type="number"
                            min={100}
                            max={1200}
                            value={targetPitch}
                            onChange={(e) => onTargetChange(Number(e.target.value))}
                            disabled={disabled}
                        />
                        <span>Hz</span>
                    </div>

                    <div className="ratio-info">
                        Ratio: ×{(targetPitch / 440).toFixed(6)}（
                        {((targetPitch / 440 - 1) * 100).toFixed(2)}%）
                    </div>
                </>
            )}
        </div>
    );
};

export default ConversionPanel;
