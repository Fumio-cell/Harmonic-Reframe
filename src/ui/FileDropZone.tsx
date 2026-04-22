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
                alert('Unsupported file format. Please try WAV, MP3, AIFF, or M4A.');
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
                    <div className="name" style={{ display: 'flex', alignItems: 'center' }}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-music" style={{ marginRight: '8px', color: '#5ce0fc' }}><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>
                        {fileName}
                    </div>
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
                <div className="drop-icon" style={{ color: '#5ce0fc', display: 'flex', justifyContent: 'center', marginBottom: '16px' }}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="52" height="52" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-radio" opacity="0.9">
                        <circle cx="12" cy="12" r="2"/><path d="M4.93 19.07a10 10 0 0 1 0-14.14"/><path d="M7.76 16.24a6 6 0 0 1 0-8.48"/><path d="M16.24 7.76a6 6 0 0 1 0 8.48"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14"/>
                    </svg>
                </div>
                <div className="drop-title">Drop audio file here</div>
                <div className="drop-sub">or click to browse</div>
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
