/**
 * EQ Presets - プリセットEQ（パラメトリックバイクアッドフィルタ）
 */

export type EQPresetName = 'off' | 'natural' | 'clear' | 'warm' | 'wide';

interface BandParams {
    type: 'peaking' | 'lowshelf' | 'highshelf';
    freq: number;
    gain: number; // dB
    Q: number;
}

interface EQPreset {
    name: string;
    label: string;
    description: string;
    bands: BandParams[];
    stereoWidth: number;   // 1.0 = no change
    highPassHz: number;     // 0 = off
    softClipDrive: number;  // 1.0 = off
    normalize: boolean;
    targetRMS: number;      // 0 = off, >0 = RMS loudness normalize target
}

export const EQ_PRESETS: Record<EQPresetName, EQPreset> = {
    off: {
        name: 'off',
        label: 'OFF',
        description: '変換のみ（音質調整なし）',
        bands: [],
        stereoWidth: 1.0,
        highPassHz: 0,
        softClipDrive: 1.0,
        normalize: false,
        targetRMS: 0,
    },
    natural: {
        name: 'natural',
        label: 'ナチュラル',
        description: 'ノーマライズ + 超低域カット。自然な音質改善',
        bands: [
            { type: 'peaking', freq: 3000, gain: 1.5, Q: 0.8 },
        ],
        stereoWidth: 1.0,
        highPassHz: 35,
        softClipDrive: 1.0,
        normalize: true,
        targetRMS: 0.18,
    },
    clear: {
        name: 'clear',
        label: 'クリア',
        description: '高域を大幅ブースト。ボーカル・楽器の輪郭がくっきり',
        bands: [
            { type: 'peaking', freq: 2500, gain: 5.0, Q: 0.8 },
            { type: 'peaking', freq: 5000, gain: 4.0, Q: 0.7 },
            { type: 'highshelf', freq: 8000, gain: 6.0, Q: 0.7 },
            { type: 'peaking', freq: 200, gain: -4.0, Q: 1.0 },
            { type: 'peaking', freq: 400, gain: -2.0, Q: 1.5 },
        ],
        stereoWidth: 1.05,
        highPassHz: 50,
        softClipDrive: 1.0,
        normalize: true,
        targetRMS: 0.2,
    },
    warm: {
        name: 'warm',
        label: 'ウォーム',
        description: '低域を豊かにブースト。432Hzと相性◎の温かいサウンド',
        bands: [
            { type: 'lowshelf', freq: 200, gain: 6.0, Q: 0.7 },
            { type: 'peaking', freq: 500, gain: 3.0, Q: 0.8 },
            { type: 'peaking', freq: 1000, gain: 2.0, Q: 1.0 },
            { type: 'highshelf', freq: 6000, gain: -4.0, Q: 0.7 },
            { type: 'peaking', freq: 10000, gain: -5.0, Q: 0.5 },
        ],
        stereoWidth: 1.0,
        highPassHz: 30,
        softClipDrive: 1.8,
        normalize: true,
        targetRMS: 0.22,
    },
    wide: {
        name: 'wide',
        label: 'ワイド',
        description: 'ステレオ空間を大きく拡張。包み込まれるような立体感',
        bands: [
            { type: 'peaking', freq: 2500, gain: 3.0, Q: 0.8 },
            { type: 'peaking', freq: 800, gain: 2.0, Q: 1.0 },
            { type: 'highshelf', freq: 10000, gain: 3.0, Q: 0.7 },
        ],
        stereoWidth: 1.8,
        highPassHz: 40,
        softClipDrive: 1.0,
        normalize: true,
        targetRMS: 0.18,
    },
};

/**
 * バイクアッドフィルタ（peaking / lowshelf / highshelf）
 */
export function applyBiquadEQ(
    signal: Float32Array,
    sampleRate: number,
    bands: BandParams[]
): Float32Array {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let current: any = new Float32Array(signal);

    for (const band of bands) {
        current = applyBiquadBand(current, sampleRate, band);
    }

    return current;
}

function applyBiquadBand(
    signal: Float32Array,
    sampleRate: number,
    band: BandParams
): Float32Array {
    const omega = (2 * Math.PI * band.freq) / sampleRate;
    const sinOmega = Math.sin(omega);
    const cosOmega = Math.cos(omega);
    const A = Math.pow(10, band.gain / 40); // dB to amplitude
    const alpha = sinOmega / (2 * band.Q);

    let b0: number, b1: number, b2: number, a0: number, a1: number, a2: number;

    switch (band.type) {
        case 'peaking':
            b0 = 1 + alpha * A;
            b1 = -2 * cosOmega;
            b2 = 1 - alpha * A;
            a0 = 1 + alpha / A;
            a1 = -2 * cosOmega;
            a2 = 1 - alpha / A;
            break;
        case 'lowshelf': {
            const sqrtA = Math.sqrt(A);
            b0 = A * ((A + 1) - (A - 1) * cosOmega + 2 * sqrtA * alpha);
            b1 = 2 * A * ((A - 1) - (A + 1) * cosOmega);
            b2 = A * ((A + 1) - (A - 1) * cosOmega - 2 * sqrtA * alpha);
            a0 = (A + 1) + (A - 1) * cosOmega + 2 * sqrtA * alpha;
            a1 = -2 * ((A - 1) + (A + 1) * cosOmega);
            a2 = (A + 1) + (A - 1) * cosOmega - 2 * sqrtA * alpha;
            break;
        }
        case 'highshelf': {
            const sqrtA = Math.sqrt(A);
            b0 = A * ((A + 1) + (A - 1) * cosOmega + 2 * sqrtA * alpha);
            b1 = -2 * A * ((A - 1) + (A + 1) * cosOmega);
            b2 = A * ((A + 1) + (A - 1) * cosOmega - 2 * sqrtA * alpha);
            a0 = (A + 1) - (A - 1) * cosOmega + 2 * sqrtA * alpha;
            a1 = 2 * ((A - 1) - (A + 1) * cosOmega);
            a2 = (A + 1) - (A - 1) * cosOmega - 2 * sqrtA * alpha;
            break;
        }
    }

    // Normalize
    const nb0 = b0 / a0;
    const nb1 = b1 / a0;
    const nb2 = b2 / a0;
    const na1 = a1 / a0;
    const na2 = a2 / a0;

    const output = new Float32Array(signal.length);
    let x1 = 0, x2 = 0, y1 = 0, y2 = 0;

    for (let i = 0; i < signal.length; i++) {
        const x0 = signal[i];
        output[i] = nb0 * x0 + nb1 * x1 + nb2 * x2 - na1 * y1 - na2 * y2;
        x2 = x1; x1 = x0;
        y2 = y1; y1 = output[i];
    }

    return output;
}
