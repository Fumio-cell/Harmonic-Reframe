import React, { useState, useRef, useCallback, useEffect } from 'react';

interface PlaybackControlsProps {
    /** 原音 AudioBuffer */
    audioBuffer: AudioBuffer | null;
    /** 変換後の channel data（あれば） */
    convertedChannels: Float32Array[] | null;
    convertedSampleRate: number | null;
}

type PlaybackMode = 'original' | 'converted';

const PlaybackControls: React.FC<PlaybackControlsProps> = ({
    audioBuffer,
    convertedChannels,
    convertedSampleRate,
}) => {
    const [playing, setPlaying] = useState(false);
    const [mode, setMode] = useState<PlaybackMode>('original');
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);

    const audioCtxRef = useRef<AudioContext | null>(null);
    const sourceRef = useRef<AudioBufferSourceNode | null>(null);
    const startTimeRef = useRef(0);
    const offsetRef = useRef(0);
    const animFrameRef = useRef<number>(0);

    const hasConverted = convertedChannels !== null;

    // Duration update
    useEffect(() => {
        if (audioBuffer) {
            setDuration(audioBuffer.duration);
        }
    }, [audioBuffer]);

    const stopPlayback = useCallback(() => {
        if (sourceRef.current) {
            try { sourceRef.current.stop(); } catch { /* already stopped */ }
            sourceRef.current = null;
        }
        if (animFrameRef.current) {
            cancelAnimationFrame(animFrameRef.current);
        }
        setPlaying(false);
    }, []);

    const startPlayback = useCallback((playMode: PlaybackMode, offset = 0) => {
        if (!audioBuffer) return;

        // Stop any existing playback
        stopPlayback();

        const ctx = audioCtxRef.current || new AudioContext();
        audioCtxRef.current = ctx;

        let buffer: AudioBuffer;

        if (playMode === 'converted' && convertedChannels && convertedSampleRate) {
            buffer = ctx.createBuffer(
                convertedChannels.length,
                convertedChannels[0].length,
                convertedSampleRate
            );
            for (let ch = 0; ch < convertedChannels.length; ch++) {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                buffer.copyToChannel(convertedChannels[ch] as any, ch);
            }
        } else {
            buffer = audioBuffer;
        }

        const source = ctx.createBufferSource();
        source.buffer = buffer;
        source.connect(ctx.destination);
        source.start(0, offset);
        sourceRef.current = source;
        startTimeRef.current = ctx.currentTime;
        offsetRef.current = offset;
        setPlaying(true);

        // Update time display
        const tick = () => {
            if (audioCtxRef.current && sourceRef.current) {
                const elapsed = audioCtxRef.current.currentTime - startTimeRef.current + offsetRef.current;
                setCurrentTime(Math.min(elapsed, buffer.duration));
                animFrameRef.current = requestAnimationFrame(tick);
            }
        };
        tick();

        source.onended = () => {
            setPlaying(false);
            setCurrentTime(0);
            offsetRef.current = 0;
            if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
        };
    }, [audioBuffer, convertedChannels, convertedSampleRate, stopPlayback]);

    const togglePlay = useCallback(() => {
        if (playing) {
            // Pause: remember position
            if (audioCtxRef.current) {
                offsetRef.current += audioCtxRef.current.currentTime - startTimeRef.current;
            }
            stopPlayback();
        } else {
            startPlayback(mode, offsetRef.current);
        }
    }, [playing, mode, startPlayback, stopPlayback]);

    const handleStop = useCallback(() => {
        stopPlayback();
        setCurrentTime(0);
        offsetRef.current = 0;
    }, [stopPlayback]);

    const switchMode = useCallback((newMode: PlaybackMode) => {
        const wasPlaying = playing;
        if (wasPlaying) {
            if (audioCtxRef.current) {
                offsetRef.current += audioCtxRef.current.currentTime - startTimeRef.current;
            }
            stopPlayback();
        }
        setMode(newMode);
        if (wasPlaying) {
            // Restart in new mode from same position
            setTimeout(() => startPlayback(newMode, offsetRef.current), 50);
        }
    }, [playing, stopPlayback, startPlayback]);

    // Keyboard shortcut: Space = toggle, Escape = stop
    useEffect(() => {
        const handleKey = (e: KeyboardEvent) => {
            // Don't trigger if typing in an input
            if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

            if (e.code === 'Space') {
                e.preventDefault();
                togglePlay();
            } else if (e.code === 'Escape') {
                e.preventDefault();
                handleStop();
            }
        };
        window.addEventListener('keydown', handleKey);
        return () => window.removeEventListener('keydown', handleKey);
    }, [togglePlay, handleStop]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            stopPlayback();
            if (audioCtxRef.current) {
                audioCtxRef.current.close();
            }
        };
    }, [stopPlayback]);

    if (!audioBuffer) return null;

    const formatTime = (t: number) => {
        const m = Math.floor(t / 60);
        const s = Math.floor(t % 60);
        return `${m}:${s.toString().padStart(2, '0')}`;
    };

    const progressPct = duration > 0 ? (currentTime / duration) * 100 : 0;

    return (
        <div className="card fade-up h-full flex flex-col justify-between">
            <div className="card-title">
                <span className="icon">🎧</span> Playback Preview
                <span className="shortcut-hint">Space: Play/Pause · Esc: Stop</span>
            </div>

            {/* A/B Mode Switch */}
            <div className="ab-switch">
                <button
                    className={`ab-btn ${mode === 'original' ? 'active' : ''}`}
                    onClick={() => switchMode('original')}
                >
                    🅰️ Original
                </button>
                <button
                    className={`ab-btn ${mode === 'converted' ? 'active' : ''}`}
                    onClick={() => switchMode('converted')}
                    disabled={!hasConverted}
                >
                    🅱️ Converted
                </button>
            </div>

            {/* Progress bar */}
            <div className="playback-progress">
                <div className="progress-bar-bg">
                    <div
                        className="progress-bar-fill"
                        style={{ width: `${progressPct}%` }}
                    />
                </div>
                <div className="playback-time">
                    <span>{formatTime(currentTime)}</span>
                    <span>{formatTime(duration)}</span>
                </div>
            </div>

            {/* Transport Controls */}
            <div className="transport">
                <button className="transport-btn" onClick={handleStop} title="Stop (Esc)">
                    ⏹
                </button>
                <button
                    className={`transport-btn play-btn ${playing ? 'playing' : ''}`}
                    onClick={togglePlay}
                    title="Play/Pause (Space)"
                >
                    {playing ? '⏸' : '▶'}
                </button>
            </div>

            {!hasConverted && mode === 'original' && (
                <div className="playback-hint">
                    💡 Once you "Run Conversion", you can preview the processed sound.
                </div>
            )}
        </div>
    );
};

export default PlaybackControls;
