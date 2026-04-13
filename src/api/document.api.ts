import { apiClient } from './client';
import type {
  UploadedFile,
  ImportPreview,
  ImportOptions,
  ImportResult,
} from '@/types/document.types';

export const uploadDocument = async (file: File): Promise<UploadedFile> => {
  const formData = new FormData();
  formData.append('file', file);

  const response = await apiClient.post('/documents/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

export const parseDocument = async (fileId: string): Promise<void> => {
  await apiClient.post(`/documents/${fileId}/parse`);
};

export const generateImportPreview = async (fileId: string): Promise<ImportPreview> => {
  const response = await apiClient.get(`/documents/${fileId}/preview`);
  return response.data;
};

export const executeImport = async (previewId: string, options: ImportOptions): Promise<ImportResult> => {
  const response = await apiClient.post(`/documents/${previewId}/import`, options);
  return response.data;
};
