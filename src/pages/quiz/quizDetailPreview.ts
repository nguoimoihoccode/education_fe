interface PreviewQuestionLike {
  id: string;
}

export function getQuizDetailPreviewQuestions<T extends PreviewQuestionLike>(
  questions: T[],
  isOfflineHsk1Quiz: boolean,
  seed = 0,
  previewCount = 20,
): T[] {
  if (!isOfflineHsk1Quiz) {
    return questions;
  }

  if (questions.length <= previewCount) {
    return questions;
  }

  const step = Math.max(1, Math.floor(questions.length / previewCount));
  const startOffset = seed % step;
  const preview: T[] = [];

  for (let index = startOffset; index < questions.length && preview.length < previewCount; index += step) {
    preview.push(questions[index]);
  }

  for (let index = 0; index < questions.length && preview.length < previewCount; index += step) {
    if (!preview.includes(questions[index])) {
      preview.push(questions[index]);
    }
  }

  return preview.slice(0, previewCount);
}
