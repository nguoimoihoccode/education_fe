/**
 * Every endpoint the AI surface calls, in one place. Kept as plain constants and
 * pure string functions so a contract test can pin them without pulling the HTTP
 * client (axios + browser storage) into a `node --test` process — a path typo
 * here is otherwise only discovered in production, against a 404.
 */
export const AI_CONVERSATIONS_PATH = '/ai/conversations';
export const AI_SETTINGS_PATH = '/ai/settings';
export const AI_SETTINGS_TEST_PATH = '/ai/settings/test';
export const AI_KNOWLEDGE_REINDEX_PATH = '/ai/knowledge/reindex';
export const AI_KNOWLEDGE_STATUS_PATH = '/ai/knowledge/status';

/** No `conversationId` → the collection itself (list / create). */
export function getAiConversationPath(conversationId?: string): string {
  return conversationId
    ? `${AI_CONVERSATIONS_PATH}/${conversationId}`
    : AI_CONVERSATIONS_PATH;
}

export function getAiMessagesPath(conversationId: string): string {
  return `${getAiConversationPath(conversationId)}/messages`;
}