import assert from 'node:assert/strict';
import test from 'node:test';

import {
  AI_CONVERSATIONS_PATH,
  AI_KNOWLEDGE_REINDEX_PATH,
  AI_SETTINGS_PATH,
  AI_SETTINGS_TEST_PATH,
  getAiConversationPath,
  getAiMessagesPath,
} from '../src/api/aiPaths.ts';

// These constants are the frontend half of a contract with the NestJS routes in
// ../education_be/src/modules/ai/ai.controller.ts. Nothing else checks that the
// two agree, so a rename on either side lands as a 404 in production.

test('settings endpoints match the ai controller decorators', () => {
  assert.equal(AI_SETTINGS_PATH, '/ai/settings');
  assert.equal(AI_SETTINGS_TEST_PATH, '/ai/settings/test');
});

test('knowledge reindex matches the reindex endpoint', () => {
  assert.equal(AI_KNOWLEDGE_REINDEX_PATH, '/ai/knowledge/reindex');
});

test('conversation paths address the collection and one conversation', () => {
  assert.equal(AI_CONVERSATIONS_PATH, '/ai/conversations');
  assert.equal(getAiConversationPath(), '/ai/conversations');
  assert.equal(getAiConversationPath('c-1'), '/ai/conversations/c-1');
});

test('messages hang off one conversation', () => {
  assert.equal(getAiMessagesPath('c-1'), '/ai/conversations/c-1/messages');
});

test('every ai path is relative, without the /api prefix nginx adds', () => {
  // apiClient prepends VITE_API_URL (`/api`), and nginx proxies `^~ /api/`
  // wholesale. A path that repeated the prefix here would resolve to /api/api.
  for (const path of [
    AI_CONVERSATIONS_PATH,
    AI_SETTINGS_PATH,
    AI_SETTINGS_TEST_PATH,
    AI_KNOWLEDGE_REINDEX_PATH,
    getAiConversationPath('c-1'),
    getAiMessagesPath('c-1'),
  ]) {
    assert.match(path, /^\/ai\//);
    assert.doesNotMatch(path, /^\/api\//);
  }
});