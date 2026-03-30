import React, { useState, useRef, useCallback, useEffect } from 'react';
import './ui/styles/index.css';
import FileDropZone from './ui/FileDropZone';
import ConversionPanel from './ui/ConversionPanel';
import EnhancerPanel from './ui/EnhancerPanel';
import ExportButton from './ui/ExportButton';
import WaveformPreview from './ui/WaveformPreview';
import PlaybackControls from './ui/PlaybackControls';
import { Header } from './ui/Header';
import { encodeWav } from './audio/encoder';
import type { EQPresetName } from './dsp/eqPreset';
import type { AppState, ConversionParams } from './types/types';

const App: React.FC = () => {
    // Audio state
    const [audioBuffer, setAudioBuffer] = useState<AudioBuffer | null>(null);
    const [fileName, setFileName] = useState<string | null>(null);
    const [appState, setAppState] = useState<AppState>('idle');
    const [isPro, setIsPro] = useState(false);

    useEffect(() => {
        const handleAuth = (e: any) => setIsPro(e.detail.isPro);
        window.addEventListener('auth:status', handleAuth as EventListener);
        return () => window.removeEventListener('auth:status', handleAuth as EventListener);
    }, []);

    // Converted audio (for A/B playback)
    const [convertedChannels, setConvertedChannels] = useState<Float32Array[] | null>(null);
    const [convertedSampleRate, setConvertedSampleRate] = useState<number | null>(null);

    // Conversion settings
    const [retuneEnabled, setRetuneEnabled] = useState(true);
    const [targetPitch, setTargetPitch] = useState(432);
    const [enhancePreset, setEnhancePreset] = useState<EQPresetName>('natural');

    // Processing state
    const [progress, setProgress] = useState(0);
    const [stage, setStage] = useState('');

    const workerRef = useRef<Worker | null>(null);

    const handleFileLoad = useCallback((buffer: AudioBuffer, name: string) => {
        setAudioBuffer(buffer);
        setFileName(name);
        setAppState('loaded');
        setConvertedChannels(null);
        setConvertedSampleRate(null);
    }, []);

    const handleClear = useCallback(() => {
        setAudioBuffer(null);
        setFileName(null);
        setAppState('idle');
        setConvertedChannels(null);
        setConvertedSampleRate(null);
    }, []);

    const getFileInfo = (): string | null => {
        if (!audioBuffer) return null;
        const ch = audioBuffer.numberOfChannels === 1 ? 'Mono' : 'Stereo';
        const dur = audioBuffer.duration.toFixed(1);
        const sr = (audioBuffer.sampleRate / 1000).toFixed(1);
        return `${ch} | ${sr}kHz | ${dur}s`;
    };

    const getParams = (): ConversionParams => ({
        retuneEnabled,
        sourcePitch: 440,
        targetPitch,
        enhancePreset,
    });

    const runConversion = useCallback(
        (onDone: (channels: Float32Array[], sampleRate: number) => void) => {
            if (!audioBuffer) return;

            setAppState('processing');
            setProgress(0);
            setStage('Initializing...');

            const worker = new Worker(
                new URL('./workers/converterWorker.ts', import.meta.url),
                { type: 'module' }
            );

            workerRef.current = worker;

            // Extract channel data
            const channelData: Float32Array[] = [];
            for (let ch = 0; ch < audioBuffer.numberOfChannels; ch++) {
                channelData.push(new Float32Array(audioBuffer.getChannelData(ch)));
            }

            worker.onmessage = (e) => {
                const msg = e.data;
                if (msg.type === 'progress') {
                    setProgress(msg.value);
                    setStage(msg.stage);
                } else if (msg.type === 'result') {
                    // Store converted data for playback
                    setConvertedChannels(msg.channelData);
                    setConvertedSampleRate(msg.sampleRate);
                    onDone(msg.channelData, msg.sampleRate);
                    setAppState('done');
                    worker.terminate();
                } else if (msg.type === 'error') {
                    alert(`Error: ${msg.message}`);
                    setAppState('loaded');
                    worker.terminate();
                }
            };

            worker.postMessage({
                type: 'convert',
                channelData,
                sampleRate: audioBuffer.sampleRate,
                params: getParams(),
            });
        },
        [audioBuffer, retuneEnabled, targetPitch, enhancePreset]
    );

    const handleConvert = useCallback(() => {
        if (!isPro && (audioBuffer?.duration || 0) > 120) {
            if (confirm("Files longer than 2 minutes require PRO for export. Would you like to upgrade?")) {
                window.dispatchEvent(new CustomEvent('app:buyPro'));
            }
            return;
        }

        runConversion((channels, sampleRate) => {
            const blob = encodeWav(channels, sampleRate);
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;

            // Generate filename
            const base = fileName?.replace(/\.[^.]+$/, '') || 'output';
            const suffix = retuneEnabled ? `_${targetPitch}Hz` : '';
            const enhance = enhancePreset !== 'off' ? `_${enhancePreset}` : '';
            a.download = `${base}${suffix}${enhance}.wav`;
            a.click();
            URL.revokeObjectURL(url);
        });
    }, [runConversion, fileName, retuneEnabled, targetPitch, enhancePreset, isPro, audioBuffer]);

    const handleConvertOnly = useCallback(() => {
        runConversion(() => {
            // Just store the result for playback, no download
        });
    }, [runConversion]);

    const processing = appState === 'processing';

    return (
        <div className="app-container">
            <Header />
            <main className={`app ${appState !== 'idle' ? 'app--split' : ''}`}>
                <div className="app__left">
                    {/* File Drop and Waveform */}
                    <div className="card flex-1 flex flex-col justify-center">
                        <FileDropZone
                            onFileLoad={handleFileLoad}
                            fileName={fileName}
                            fileInfo={getFileInfo()}
                            onClear={handleClear}
                        />
                        <WaveformPreview audioBuffer={audioBuffer} />
                    </div>

                    {/* Conversion Panel */}
                    {appState !== 'idle' && (
                        <ConversionPanel
                            enabled={retuneEnabled}
                            targetPitch={targetPitch}
                            onToggle={() => setRetuneEnabled(!retuneEnabled)}
                            onTargetChange={setTargetPitch}
                            disabled={processing}
                        />
                    )}

                    {/* Enhancer Panel */}
                    {appState !== 'idle' && (
                        <EnhancerPanel
                            preset={enhancePreset}
                            onPresetChange={setEnhancePreset}
                            disabled={processing}
                            isPro={isPro}
                        />
                    )}
                </div>

                {appState !== 'idle' && (
                    <div className="app__right">
                        {/* Playback Controls */}
                        <PlaybackControls
                            audioBuffer={audioBuffer}
                            convertedChannels={convertedChannels}
                            convertedSampleRate={convertedSampleRate}
                        />

                        {/* Export Sector (Run Conversion + Save as WAV) */}
                        <ExportButton
                            processing={processing}
                            progress={progress}
                            stage={stage}
                            canExport={appState === 'loaded' || appState === 'done'}
                            onConvert={handleConvert}
                            onPreview={handleConvertOnly}
                            isPro={isPro}
                            duration={audioBuffer?.duration || 0}
                        />
                    </div>
                )}

                {/* Footer */}
                <footer className="footer">
                    Harmonic Reframe — Client-side Audio Processing
                </footer>
            </main>
        </div>
    );
};

export default App;
