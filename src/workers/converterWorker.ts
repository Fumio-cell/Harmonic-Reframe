/**
 * Converter Worker
 * 変換パイプライン: Retune → HighPass → EQ → Normalize → Loudness → SoftClip → Stereo
 */

import { retuneSignal } from '../dsp/pitchRetune';
import { peakNormalize, rmsNormalize } from '../dsp/normalize';
import { adjustStereoWidth } from '../dsp/stereoWidth';
import { highPassFilter } from '../dsp/highPass';
import { softClip } from '../dsp/softClipper';
import { applyBiquadEQ, EQ_PRESETS } from '../dsp/eqPreset';
import type { ConversionParams } from '../types/types';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const w: any = self;

w.onmessage = (e: MessageEvent) => {
    const { type, channelData, sampleRate, params } = e.data;

    if (type !== 'convert') {
        w.postMessage({ type: 'error', message: `Unknown type: ${type}` });
        return;
    }

    try {
        const result = processAudio(channelData, sampleRate, params);
        const transferables = result.map((ch: Float32Array) => ch.buffer);
        w.postMessage(
            { type: 'result', channelData: result, sampleRate },
            transferables
        );
    } catch (err) {
        w.postMessage({
            type: 'error',
            message: err instanceof Error ? err.message : String(err),
        });
    }
};

function progress(value: number, stage: string) {
    w.postMessage({ type: 'progress', value, stage });
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function processAudio(
    channelData: Float32Array[],
    sampleRate: number,
    params: ConversionParams
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
): any[] {
    const { retuneEnabled, sourcePitch, targetPitch, enhancePreset } = params;
    const preset = EQ_PRESETS[enhancePreset];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let channels: any[] = channelData.map((ch) => new Float32Array(ch));

    // === Step 1: Pitch Retune ===
    progress(5, '🎵 ピッチ変換中...');
    if (retuneEnabled && Math.abs(targetPitch / sourcePitch - 1.0) > 1e-10) {
        channels = channels.map((ch: Float32Array) => retuneSignal(ch, sourcePitch, targetPitch));
    }
    progress(20, 'ピッチ変換完了');

    // === Step 2: High Pass Filter ===
    if (preset.highPassHz > 0) {
        progress(25, '🔊 ハイパスフィルタ...');
        channels = channels.map((ch: Float32Array) =>
            highPassFilter(ch, preset.highPassHz, sampleRate)
        );
    }
    progress(35, 'フィルタ完了');

    // === Step 3: EQ ===
    if (preset.bands.length > 0) {
        progress(40, '🎛️ EQ適用中...');
        channels = channels.map((ch: Float32Array) =>
            applyBiquadEQ(ch, sampleRate, preset.bands)
        );
    }
    progress(50, 'EQ完了');

    // === Step 4: Peak Normalize ===
    if (preset.normalize) {
        progress(55, '📊 ノーマライズ...');
        channels = channels.map((ch: Float32Array) => peakNormalize(ch, 0.95));
    }
    progress(60, 'ノーマライズ完了');

    // === Step 5: RMS Loudness Normalize ===
    if (preset.targetRMS > 0) {
        progress(65, '📢 ラウドネス調整...');
        channels = channels.map((ch: Float32Array) => rmsNormalize(ch, preset.targetRMS));
    }
    progress(72, 'ラウドネス完了');

    // === Step 6: Soft Clipper ===
    if (preset.softClipDrive > 1.0) {
        progress(76, '🔥 ソフトクリッパー...');
        channels = channels.map((ch: Float32Array) => softClip(ch, preset.softClipDrive));
    }
    progress(82, 'クリッパー完了');

    // === Step 7: Stereo Width ===
    if (channels.length >= 2 && Math.abs(preset.stereoWidth - 1.0) > 0.01) {
        progress(86, '🎧 ステレオ調整...');
        const [newL, newR] = adjustStereoWidth(
            channels[0],
            channels[1],
            preset.stereoWidth
        );
        channels[0] = newL;
        channels[1] = newR;
    }
    progress(92, 'ステレオ完了');

    // Final peak normalize to prevent clipping
    channels = channels.map((ch: Float32Array) => peakNormalize(ch, 0.98));
    progress(100, '✅ 完了！');

    return channels;
}

