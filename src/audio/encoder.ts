/**
 * WAV Encoder - PCM 16bit WAV エンコード
 * ステレオ/モノラル対応
 */

export function encodeWav(
    channels: Float32Array[],
    sampleRate: number,
    bitDepth: number = 16
): Blob {
    const numChannels = channels.length;
    const numSamples = channels[0].length;
    const bytesPerSample = bitDepth / 8;
    const blockAlign = numChannels * bytesPerSample;
    const dataSize = numSamples * blockAlign;
    const bufferSize = 44 + dataSize; // 44 = WAV header size

    const buffer = new ArrayBuffer(bufferSize);
    const view = new DataView(buffer);

    // RIFF header
    writeString(view, 0, 'RIFF');
    view.setUint32(4, bufferSize - 8, true);
    writeString(view, 8, 'WAVE');

    // fmt chunk
    writeString(view, 12, 'fmt ');
    view.setUint32(16, 16, true);                          // chunk size
    view.setUint16(20, 1, true);                           // PCM format
    view.setUint16(22, numChannels, true);                 // num channels
    view.setUint32(24, sampleRate, true);                  // sample rate
    view.setUint32(28, sampleRate * blockAlign, true);     // byte rate
    view.setUint16(32, blockAlign, true);                  // block align
    view.setUint16(34, bitDepth, true);                    // bits per sample

    // data chunk
    writeString(view, 36, 'data');
    view.setUint32(40, dataSize, true);

    // interleave and write samples
    let offset = 44;
    for (let i = 0; i < numSamples; i++) {
        for (let ch = 0; ch < numChannels; ch++) {
            const sample = channels[ch][i];
            // Clamp to [-1, 1]
            const clamped = Math.max(-1, Math.min(1, sample));

            if (bitDepth === 16) {
                const val = clamped < 0 ? clamped * 0x8000 : clamped * 0x7FFF;
                view.setInt16(offset, val, true);
            } else if (bitDepth === 24) {
                const val = clamped < 0 ? clamped * 0x800000 : clamped * 0x7FFFFF;
                const intVal = Math.round(val);
                view.setUint8(offset, intVal & 0xFF);
                view.setUint8(offset + 1, (intVal >> 8) & 0xFF);
                view.setUint8(offset + 2, (intVal >> 16) & 0xFF);
            }

            offset += bytesPerSample;
        }
    }

    return new Blob([buffer], { type: 'audio/wav' });
}

function writeString(view: DataView, offset: number, str: string): void {
    for (let i = 0; i < str.length; i++) {
        view.setUint8(offset + i, str.charCodeAt(i));
    }
}
