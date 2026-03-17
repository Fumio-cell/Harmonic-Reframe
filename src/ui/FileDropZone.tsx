import React, { useRef, useCallback } from 'react';

interface FileDropZoneProps {
    onFileLoad: (buffer: AudioBuffer, name: string) => void;
    fileName: string | null;
    fileInfo: string | null;
    onClear: () => void;
}

const FileDropZone: React.FC<FileDropZoneProps> = ({
    onFileLoad,
    fileName,
    fileInfo,
    onClear,
}) => {
    const inputRef = useRef<HTMLInputElement>(null);

    const handleFile = useCallback(
        async (file: File) => {
            const arrayBuffer = await file.arrayBuffer();
            const audioCtx = new AudioContext();
            try {
                const buffer = await audioCtx.decodeAudioData(arrayBuffer);
                onFileLoad(buffer, file.name);
            } catch {
                alert('このファイル形式には対応していません。WAV / MP3 / AIFF をお試しください。');
            } finally {
                audioCtx.close();
            }
        },
        [onFileLoad]
    );

    const handleDrop = useCallback(
        (e: React.DragEvent) => {
            e.preventDefault();
            const file = e.dataTransfer.files[0];
            if (file) handleFile(file);
        },
        [handleFile]
    );

    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
    }, []);

    if (fileName) {
        return (
            <div className="file-info fade-up">
                <div>
                    <div className="name">🎵 {fileName}</div>
                    <div className="meta">{fileInfo}</div>
                </div>
                <button className="close-btn" onClick={onClear}>
                    ✕
                </button>
            </div>
        );
    }

    return (
        <>
            <div
                className="dropzone"
                onClick={() => inputRef.current?.click()}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
            >
                <div className="drop-icon">🎶</div>
                <div className="drop-title">音声ファイルをドロップ</div>
                <div className="drop-sub">またはクリックして選択</div>
                <div className="formats">
                    <span className="format-tag">MP3</span>
                    <span className="format-tag">WAV</span>
                    <span className="format-tag">AIFF</span>
                    <span className="format-tag">M4A</span>
                </div>
            </div>
            <input
                ref={inputRef}
                type="file"
                accept="audio/*"
                style={{ display: 'none' }}
                onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleFile(file);
                }}
            />
        </>
    );
};

export default FileDropZone;
