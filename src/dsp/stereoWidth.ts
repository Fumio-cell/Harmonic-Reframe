/**
 * Stereo Width - Mid/Side processing for stereo width adjustment
 */

/**
 * Adjust stereo width
 * @param left - Left channel
 * @param right - Right channel
 * @param width - Width (0=mono, 1=original, 1.5=expanded)
 * @returns [newLeft, newRight]
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
