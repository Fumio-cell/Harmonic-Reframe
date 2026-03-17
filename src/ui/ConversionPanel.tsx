import React from 'react';

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
    { label: '442Hz', value: 442 },
];

const ConversionPanel: React.FC<ConversionPanelProps> = ({
    enabled,
    targetPitch,
    onToggle,
    onTargetChange,
    disabled,
}) => {
    return (
        <div className="card fade-up">
            <div className="card-title">
                <span className="icon">🎵</span> ピッチ変換
            </div>

            <div className="pitch-row">
                <button
                    className={`pitch-toggle ${enabled ? 'on' : ''}`}
                    onClick={onToggle}
                    disabled={disabled}
                    aria-label="ピッチ変換の切替"
                >
                    <div className="knob" />
                </button>
                <span className="pitch-label">
                    440Hz → {targetPitch}Hz に変換 {enabled ? '✓' : ''}
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

                    <div className="custom-pitch">
                        <span>カスタム:</span>
                        <input
                            type="number"
                            min={400}
                            max={480}
                            value={targetPitch}
                            onChange={(e) => onTargetChange(Number(e.target.value))}
                            disabled={disabled}
                        />
                        <span>Hz</span>
                    </div>

                    <div className="ratio-info">
                        比率: ×{(targetPitch / 440).toFixed(6)}（
                        {((targetPitch / 440 - 1) * 100).toFixed(2)}%）
                    </div>
                </>
            )}
        </div>
    );
};

export default ConversionPanel;
