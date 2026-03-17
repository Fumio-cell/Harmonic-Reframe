/**
 * 432Hz Converter 型定義
 */

import type { EQPresetName } from '../dsp/eqPreset';

export interface ConversionParams {
    /** ピッチ変換有効 */
    retuneEnabled: boolean;
    /** 元の基準ピッチ */
    sourcePitch: number;
    /** 変換先ピッチ */
    targetPitch: number;
    /** 音質向上プリセット */
    enhancePreset: EQPresetName;
}

/** Worker へのメッセージ */
export interface WorkerMessage {
    type: 'convert';
    channelData: Float32Array[];
    sampleRate: number;
    params: ConversionParams;
}

/** Worker からのメッセージ */
export type WorkerResponse =
    | { type: 'progress'; value: number; stage: string }
    | { type: 'result'; channelData: Float32Array[]; sampleRate: number }
    | { type: 'error'; message: string };

/** アプリの状態 */
export type AppState = 'idle' | 'loaded' | 'processing' | 'done';
