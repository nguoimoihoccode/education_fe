import assert from 'node:assert/strict';
import test from 'node:test';

import { DOCUMENT_IMPORT_CONVERT_PATH } from '../src/api/documentImportPaths.ts';

test('document import uses the backend conversion endpoint', () => {
  assert.equal(DOCUMENT_IMPORT_CONVERT_PATH, '/document-import/convert');
});
