/**
 * High Pass Filter - バイクアッドハイパスフィルタ
 * 不要な超低音を除去してスッキリさせる
 */

/**
 * 2次IIRハイパスフィルタ
 * @param signal - 入力信号
 * @param cutoffHz - カットオフ周波数
 * @param sampleRate - サンプルレート
 * @param Q - Q値 (0.707 = Butterworth)
 * @returns フィルタ適用後の信号
 */
export function highPassFilter(
    signal: Float32Array,
    cutoffHz: number,
    sampleRate: number,
    Q: number = 0.707
): Float32Array {
    // Biquad coefficients for high-pass filter
    const omega = (2 * Math.PI * cutoffHz) / sampleRate;
    const sinOmega = Math.sin(omega);
    const cosOmega = Math.cos(omega);
    const alpha = sinOmega / (2 * Q);

    const b0 = (1 + cosOmega) / 2;
    const b1 = -(1 + cosOmega);
    const b2 = (1 + cosOmega) / 2;
    const a0 = 1 + alpha;
    const a1 = -2 * cosOmega;
    const a2 = 1 - alpha;

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

        x2 = x1;
        x1 = x0;
        y2 = y1;
        y1 = output[i];
    }

    return output;
}
