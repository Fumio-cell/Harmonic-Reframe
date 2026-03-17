/**
 * Pitch Retune - リサンプリング方式の基準ピッチ変換
 */

/**
 * 比率ベースのピッチリチューニング
 * @param signal - 入力信号
 * @param sourcePitch - 元の基準ピッチ (Hz)
 * @param targetPitch - 変換先の基準ピッチ (Hz)
 * @returns リチューニングされた信号
 */
export function retuneSignal(
    signal: Float32Array,
    sourcePitch: number,
    targetPitch: number
): Float32Array {
    const ratio = targetPitch / sourcePitch;

    if (Math.abs(ratio - 1.0) < 1e-10) {
        return new Float32Array(signal);
    }

    const outputLength = signal.length;
    const output = new Float32Array(outputLength);
    const resampleFactor = ratio;

    for (let i = 0; i < outputLength; i++) {
        const srcPos = i * resampleFactor;
        const srcFloor = Math.floor(srcPos);
        const frac = srcPos - srcFloor;

        if (srcFloor + 1 < signal.length) {
            output[i] = signal[srcFloor] * (1 - frac) + signal[srcFloor + 1] * frac;
        } else if (srcFloor < signal.length) {
            output[i] = signal[srcFloor] * (1 - frac);
        } else {
            output[i] = 0;
        }
    }

    return output;
}
