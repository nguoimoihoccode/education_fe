import assert from 'node:assert/strict';
import test from 'node:test';

import {
  DOCUMENT_IMPORT_CONFIRM_PATH,
  DOCUMENT_IMPORT_PREVIEW_PATH,
} from '../src/api/documentImportPreviewPaths.ts';

test('document import preview and confirm use backend endpoints', () => {
  assert.equal(DOCUMENT_IMPORT_PREVIEW_PATH, '/document-import/preview');
  assert.equal(DOCUMENT_IMPORT_CONFIRM_PATH, '/document-import/confirm');
});
