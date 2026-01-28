import { useState, useCallback, useRef } from 'react';
import { validateFile, readFile, formatFileSize } from '../utils/fileUtils';
import { APP_CONFIG } from '../config/appConfig';
import useToastStore from '../stores/toastStore';

/**
 * Hook fájl feltöltés kezeléséhez
 * @param {Object} options - Opciók
 * @param {string[]} options.allowedTypes - Engedélyezett fájl típusok
 * @param {number} options.maxSize - Maximum fájl méret (bytes)
 * @param {string} options.readAs - Olvasási mód ('text', 'dataURL', 'arrayBuffer')
 * @param {Function} options.onFileSelect - Callback fájl kiválasztáskor
 * @param {Function} options.onError - Callback hiba esetén
 * @returns {Object} { file, setFile, handleFileSelect, handleDrop, handleDragOver, isDragging, error, clear }
 */
export function useFileUpload(options = {}) {
  const {
    allowedTypes = [],
    maxSize = null,
    readAs = 'text',
    onFileSelect = null,
    onError = null
  } = options;

  const [file, setFile] = useState(null);
  const [fileContent, setFileContent] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef(null);

  // Fájl kiválasztása
  const handleFileSelect = useCallback(async (selectedFile) => {
    if (!selectedFile) {
      setFile(null);
      setFileContent(null);
      setError(null);
      return;
    }

    // Validáció
    const validation = validateFile(selectedFile, {
      allowedTypes,
      maxSize,
      showToast: true
    });

    if (!validation.isValid) {
      setError(validation.error);
      if (onError) {
        onError(validation.error);
      }
      return;
    }

    setError(null);
    setFile(selectedFile);
    setIsLoading(true);

    try {
      // Fájl olvasása
      const content = await readFile(selectedFile, readAs);
      setFileContent(content);

      // Callback hívása
      if (onFileSelect) {
        onFileSelect(selectedFile, content);
      }
    } catch (err) {
      const errorMsg = err.message || 'Hiba a fájl olvasása során';
      setError(errorMsg);
      useToastStore.getState().error(errorMsg);
      if (onError) {
        onError(errorMsg);
      }
    } finally {
      setIsLoading(false);
    }
  }, [allowedTypes, maxSize, readAs, onFileSelect, onError]);

  // Drag & Drop kezelés
  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const droppedFiles = e.dataTransfer.files;
    if (droppedFiles.length > 0) {
      handleFileSelect(droppedFiles[0]);
    }
  }, [handleFileSelect]);

  // Input change kezelés
  const handleInputChange = useCallback((e) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      handleFileSelect(selectedFile);
    }
  }, [handleFileSelect]);

  // File input megnyitása
  const openFileDialog = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  // Clear
  const clear = useCallback(() => {
    setFile(null);
    setFileContent(null);
    setError(null);
    setIsDragging(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, []);

  return {
    file,
    fileContent,
    setFile: handleFileSelect,
    handleFileSelect,
    handleDrop,
    handleDragOver,
    handleDragLeave,
    handleInputChange,
    openFileDialog,
    isDragging,
    isLoading,
    error,
    clear,
    fileInputRef,
    fileSize: file ? formatFileSize(file.size) : null,
    fileName: file?.name || null
  };
}

