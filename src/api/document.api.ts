import { apiClient } from './client';
import {
  DOCUMENT_IMPORT_CONFIRM_PATH,
  DOCUMENT_IMPORT_PREVIEW_PATH,
} from './documentImportPreviewPaths';
import type {
  ImportPreview,
  ImportOptions,
  ImportResult,
  ConfirmDocumentImportRequest,
} from '@/types/document.types';

export const previewDocumentImport = async (
  file: File,
  options: ImportOptions = {},
): Promise<ImportPreview> => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('language', 'zh');
  formData.append('maxVocabulary', String(options.maxCards ?? 50));
  formData.append('minWordLength', '1');

  const response = await apiClient.post(DOCUMENT_IMPORT_PREVIEW_PATH, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    cache: false,
  });
  return response.data;
};

export const confirmDocumentImport = async (
  payload: ConfirmDocumentImportRequest,
): Promise<ImportResult> => {
  const response = await apiClient.post(DOCUMENT_IMPORT_CONFIRM_PATH, payload, {
    cache: false,
  });
  return response.data;
};
