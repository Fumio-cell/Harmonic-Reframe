import { Download, Play, FileAudio } from 'lucide-react';
import { DEMO_MODE, DEMO_MAX_SECONDS, BUY_URL } from '../config';

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
    demoLimited: boolean;
    format: 'wav' | 'aif';
    onFormatChange: (f: 'wav' | 'aif') => void;
}

export const ExportCard: React.FC<ExportCardProps> = ({
    processing,
    canExport,
    onConvert,
    demoLimited,
    format,
    onFormatChange,
}) => {
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
                    className="btn btn-primary pulse w-full"
                    onClick={onConvert}
                    disabled={!canExport || processing}
                >
                    <Download className="w-4 h-4" />
                    {DEMO_MODE ? `Export (${DEMO_MAX_SECONDS}s preview)` : `Save as ${format.toUpperCase()}`}
                </button>
                {DEMO_MODE && demoLimited && (
                    <p className="demo-notice">
                        Demo export is limited to {DEMO_MAX_SECONDS} seconds.{' '}
                        <a href={BUY_URL} target="_blank" rel="noopener noreferrer">
                            Get the full version
                        </a>
                    </p>
                )}
            </div>
        </div>
    );
};
