import React from 'react';
import { Zap, Download, Play, FileOutput, FileAudio } from 'lucide-react';

interface RunConversionCardProps {
    processing: boolean;
    progress: number;
    stage: string;
    canExport: boolean;
    onPreview: () => void;
}

export const RunConversionCard: React.FC<RunConversionCardProps> = ({
    processing,
    progress,
    stage,
    canExport,
    onPreview,
}) => {
    if (processing) {
        return (
            <div className="card fade-up h-full flex flex-col justify-center">
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
        );
    }

    return (
        <div className="card fade-up h-full flex flex-col justify-center">
            <button
                className="btn btn-run pulse-red w-full flex items-center justify-center gap-2"
                onClick={onPreview}
                disabled={!canExport}
            >
                <Play className="w-5 h-5 fill-current" />
                <span style={{ fontSize: '1.1rem' }}>Run Conversion</span>
            </button>
        </div>
    );
};

interface ExportCardProps {
    processing: boolean;
    canExport: boolean;
    onConvert: () => void;
    isPro: boolean;
    duration: number;
    format: 'wav' | 'aif';
    onFormatChange: (f: 'wav' | 'aif') => void;
}

export const ExportCard: React.FC<ExportCardProps> = ({
    processing,
    canExport,
    onConvert,
    isPro,
    duration,
    format,
    onFormatChange,
}) => {
    const isGated = !isPro && duration > 120;

    return (
        <div className="card fade-up h-full flex flex-col justify-between">
            <div className="card-title m-0 mb-3">
                <FileAudio className="w-4 h-4 text-accent" /> Export
            </div>
            
            <div className="ab-switch mb-3">
                <button 
                    className={`ab-btn ${format === 'wav' ? 'active' : ''}`}
                    onClick={() => onFormatChange('wav')}
                >
                    WAV
                </button>
                <button 
                    className={`ab-btn ${format === 'aif' ? 'active' : ''}`}
                    onClick={() => onFormatChange('aif')}
                >
                    AIFF
                </button>
            </div>

            <div>
                <button
                    className={`btn btn-primary pulse w-full ${isGated ? 'gated-btn' : ''}`}
                    onClick={onConvert}
                    disabled={!canExport || processing}
                >
                    {isGated ? <Zap className="w-4 h-4" /> : <Download className="w-4 h-4" />}
                    {isGated ? 'Get PRO to Export' : `Save as ${format.toUpperCase()}`}
                </button>
                {isGated && (
                    <p className="gated-tip">
                        <Zap className="inline w-3 h-3 mr-1" />
                        Over 2m needs PRO
                    </p>
                )}
            </div>
        </div>
    );
};
