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

/**
 * AIFF Encoder - PCM 16bit Big-endian
 * AIFF (Audio Interchange File Format)
 */
export function encodeAif(
    channels: Float32Array[],
    sampleRate: number
): Blob {
    const numChannels = channels.length;
    const numSamples = channels[0].length;
    const bytesPerSample = 2; // Fixed 16bit for AIFF
    const dataSize = numSamples * numChannels * bytesPerSample;
    
    // AIFF 構造: FORM -> COMM -> SSND
    // FORM header (12) + COMM chunk (26) + SSND chunk (16 + dataSize)
    const bufferSize = 12 + 26 + 16 + dataSize;
    const buffer = new ArrayBuffer(bufferSize);
    const view = new DataView(buffer);

    // FORM chunk
    writeString(view, 0, 'FORM');
    view.setUint32(4, bufferSize - 8, false); // Big-endian
    writeString(view, 8, 'AIFF');

    // COMM chunk
    writeString(view, 12, 'COMM');
    view.setUint32(16, 18, false);             // Chunk size
    view.setUint16(20, numChannels, false);     // Num channels
    view.setUint32(22, numSamples, false);      // Num samples per channel
    view.setUint16(26, 16, false);              // Bits per sample
    
    // Sample Rate (IEEE 754 80-bit extended floating point) - Simple implementation for common SRs
    // 0x400E 0xAC44 0x0000 0x0000 0x0000 for 44100
    // We'll use a helper or simple mapping for sampleRate:
    const exp = 16384 + Math.floor(Math.log2(sampleRate));
    const mant = (sampleRate / Math.pow(2, Math.floor(Math.log2(sampleRate)))) * 0x80000000;
    view.setUint16(28, exp, false);
    view.setUint32(30, mant, false);
    view.setUint32(34, 0, false); // Remaining mantissa

    // SSND chunk
    writeString(view, 38, 'SSND');
    view.setUint32(42, dataSize + 8, false);
    view.setUint32(46, 0, false);              // offset
    view.setUint32(50, 0, false);              // block size

    // Write samples (Interleaved PCM 16bit BE)
    let offset = 54;
    for (let i = 0; i < numSamples; i++) {
        for (let ch = 0; ch < numChannels; ch++) {
            const sample = channels[ch][i];
            const clamped = Math.max(-1, Math.min(1, sample));
            const val = clamped < 0 ? clamped * 0x8000 : clamped * 0x7FFF;
            view.setInt16(offset, val, false); // Big-endian for AIFF
            offset += 2;
        }
    }

    return new Blob([buffer], { type: 'audio/x-aiff' });
}

function writeString(view: DataView, offset: number, str: string): void {
    for (let i = 0; i < str.length; i++) {
        view.setUint8(offset + i, str.charCodeAt(i));
    }
}
