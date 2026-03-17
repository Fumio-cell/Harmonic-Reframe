import React, { useRef, useEffect } from 'react';

interface WaveformPreviewProps {
    audioBuffer: AudioBuffer | null;
}

const WaveformPreview: React.FC<WaveformPreviewProps> = ({ audioBuffer }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        if (!audioBuffer || !canvasRef.current) return;

        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const dpr = window.devicePixelRatio || 1;
        const rect = canvas.getBoundingClientRect();
        canvas.width = rect.width * dpr;
        canvas.height = rect.height * dpr;
        ctx.scale(dpr, dpr);

        const width = rect.width;
        const height = rect.height;
        const data = audioBuffer.getChannelData(0);
        const step = Math.ceil(data.length / width);

        ctx.clearRect(0, 0, width, height);

        // Gradient
        const grad = ctx.createLinearGradient(0, 0, width, 0);
        grad.addColorStop(0, '#8b5cf6');
        grad.addColorStop(0.5, '#06b6d4');
        grad.addColorStop(1, '#8b5cf6');

        ctx.beginPath();
        const mid = height / 2;

        for (let x = 0; x < width; x++) {
            let min = 1.0, max = -1.0;
            for (let j = 0; j < step; j++) {
                const idx = x * step + j;
                if (idx < data.length) {
                    const v = data[idx];
                    if (v < min) min = v;
                    if (v > max) max = v;
                }
            }
            const yTop = mid + min * mid * 0.9;
            const yBot = mid + max * mid * 0.9;
            ctx.moveTo(x, yTop);
            ctx.lineTo(x, yBot);
        }

        ctx.strokeStyle = grad;
        ctx.lineWidth = 1;
        ctx.stroke();

        // Center line
        ctx.beginPath();
        ctx.moveTo(0, mid);
        ctx.lineTo(width, mid);
        ctx.strokeStyle = 'rgba(148, 163, 184, 0.15)';
        ctx.lineWidth = 1;
        ctx.stroke();
    }, [audioBuffer]);

    if (!audioBuffer) return null;

    return (
        <div className="waveform-wrap fade-up">
            <canvas ref={canvasRef} className="waveform-canvas" />
        </div>
    );
};

export default WaveformPreview;
