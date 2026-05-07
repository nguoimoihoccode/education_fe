export function getQuizSessionQuestionsPath(
  quizId: string,
  sessionId?: string,
): string {
  return sessionId
    ? `/quizzes/sessions/${sessionId}/questions`
    : `/quizzes/${quizId}/questions`;
}
