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
            <>
                <div className="card fade-up flex-1 flex flex-col justify-center">
                    <div className="progress-wrap m-0">
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
                <div className="card fade-up flex-1 flex flex-col">
                    <div className="card-title">
                        <span className="icon">💾</span> Output
                    </div>
                    <button
                        className="btn btn-primary"
                        disabled
                    >
                        <Download className="w-4 h-4" /> Save as WAV
                    </button>
                </div>
            </>
        );
    }

    return (
        <>
            <div className="card fade-up flex-1 flex flex-col justify-center">
                <button
                    className="btn btn-secondary w-full"
                    onClick={onPreview}
                    disabled={!canExport}
                >
                    <Play className="w-4 h-4" /> Run Conversion
                </button>
            </div>
            
            <div className="card fade-up flex-1 flex flex-col justify-between">
                <div className="card-title m-0 mb-3">
                    <span className="icon">💾</span> Output
                </div>
                <div>
                    <button
                        className={`btn btn-primary pulse w-full ${isGated ? 'gated-btn' : ''}`}
                        onClick={onConvert}
                        disabled={!canExport}
                    >
                        {isGated ? <Zap className="w-4 h-4" /> : <Download className="w-4 h-4" />}
                        {isGated ? 'Get PRO to Export' : 'Save as WAV'}
                    </button>
                    {isGated && (
                        <p className="gated-tip">
                            <Zap className="inline w-3 h-3 mr-1" />
                            Over 2m needs PRO
                        </p>
                    )}
                </div>
            </div>
        </>
    );
};

export default ExportButton;
