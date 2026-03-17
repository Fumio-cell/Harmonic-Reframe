/**
 * Normalize - ピークノーマライズ / ラウドネスノーマライズ
 */

/**
 * ピークノーマライズ: 最大振幅targetLevelに正規化
 */
export function peakNormalize(
    signal: Float32Array,
    targetLevel: number = 0.95
): Float32Array {
    let maxAbs = 0;
    for (let i = 0; i < signal.length; i++) {
        const abs = Math.abs(signal[i]);
        if (abs > maxAbs) maxAbs = abs;
    }

    if (maxAbs < 1e-10) return new Float32Array(signal);

    const gain = targetLevel / maxAbs;
    const output = new Float32Array(signal.length);
    for (let i = 0; i < signal.length; i++) {
        output[i] = signal[i] * gain;
    }
    return output;
}

/**
 * RMSノーマライズ: RMS値をtargetRMSに合わせる
 */
export function rmsNormalize(
    signal: Float32Array,
    targetRMS: number = 0.1
): Float32Array {
    let sumSq = 0;
    for (let i = 0; i < signal.length; i++) {
        sumSq += signal[i] * signal[i];
    }
    const rms = Math.sqrt(sumSq / signal.length);

    if (rms < 1e-10) return new Float32Array(signal);

    const gain = targetRMS / rms;
    const output = new Float32Array(signal.length);
    for (let i = 0; i < signal.length; i++) {
        output[i] = Math.max(-1, Math.min(1, signal[i] * gain));
    }
    return output;
}
