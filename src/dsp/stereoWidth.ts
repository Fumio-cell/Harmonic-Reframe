/**
 * Stereo Width - Mid/Side処理によるステレオ幅調整
 */

/**
 * ステレオ幅を調整
 * @param left - 左チャンネル
 * @param right - 右チャンネル
 * @param width - 幅 (0=モノ, 1=原音, 1.5=拡張)
 * @returns [新left, 新right]
 */
export function adjustStereoWidth(
    left: Float32Array,
    right: Float32Array,
    width: number = 1.0
): [Float32Array, Float32Array] {
    const len = Math.min(left.length, right.length);
    const outL = new Float32Array(len);
    const outR = new Float32Array(len);

    for (let i = 0; i < len; i++) {
        // Mid/Side decomposition
        const mid = (left[i] + right[i]) * 0.5;
        const side = (left[i] - right[i]) * 0.5;

        // Adjust width
        const newSide = side * width;

        // Recompose
        outL[i] = mid + newSide;
        outR[i] = mid - newSide;
    }

    return [outL, outR];
}
