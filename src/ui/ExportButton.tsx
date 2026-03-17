import React from 'react';
import { Zap, Download, Play } from 'lucide-react';

interface ExportButtonProps {
    processing: boolean;
    progress: number;
    stage: string;
    canExport: boolean;
    onConvert: () => void;
    onPreview: () => void;
    isPro: boolean;
    duration: number;
}

const ExportButton: React.FC<ExportButtonProps> = ({
    processing,
    progress,
    stage,
    canExport,
    onConvert,
    onPreview,
    isPro,
    duration,
}) => {
    const isGated = !isPro && duration > 120;

    if (processing) {
        return (
            <div className="card fade-up">
                <div className="progress-wrap">
                    <div className="progress-bar-bg">
                        <div
                            className="progress-bar-fill"
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                    <div className="progress-stage">{stage}</div>
                    <div className="progress-pct">{Math.round(progress)}%</div>
                </div>
            </div>
        );
    }

    return (
        <div className="card fade-up">
            <div className="card-title">
                <span className="icon">💾</span> 出力 (Output)
            </div>

            <div className="btn-group">
                <button
                    className="btn btn-secondary"
                    onClick={onPreview}
                    disabled={!canExport}
                >
                    <Play className="w-4 h-4" /> 変換実行 (Preview)
                </button>
                <button
                    className={`btn btn-primary pulse ${isGated ? 'gated-btn' : ''}`}
                    onClick={onConvert}
                    disabled={!canExport}
                >
                    {isGated ? <Zap className="w-4 h-4" /> : <Download className="w-4 h-4" />}
                    {isGated ? 'Get PRO to Export Long File' : '💾 変換 → WAV保存'}
                </button>
            </div>
            {isGated && (
                <p className="gated-tip">
                    <Zap className="inline w-3 h-3 mr-1" />
                    Files over 2 minutes require PRO for export.
                </p>
            )}
        </div>
    );
};

export default ExportButton;
