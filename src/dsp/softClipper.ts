/**
 * Soft Clipper - tanh系のソフトクリッピング
 * 歪みなく音圧を上げる
 */

/**
 * ソフトクリッピング: tanh関数で自然に飽和させる
 * @param signal - 入力信号
 * @param drive - ドライブ量 (1.0=無し, 2.0=軽め, 4.0=強め)
 * @param makeup - メイクアップゲイン (1.0=自動)
 * @returns クリッピング適用後の信号
 */
export function softClip(
    signal: Float32Array,
    drive: number = 1.5,
    makeup: number = 0
): Float32Array {
    const output = new Float32Array(signal.length);

    // Auto makeup gain to compensate for volume loss
    const autoMakeup = makeup > 0 ? makeup : 1.0 / Math.tanh(drive);

    for (let i = 0; i < signal.length; i++) {
        output[i] = Math.tanh(signal[i] * drive) * autoMakeup;
    }

    return output;
}
