import assert from 'node:assert/strict';
import test from 'node:test';

import {
  createQuizOfflineProvider,
  HSK1_EASY_QUESTIONS,
  HSK1_HARD_QUESTIONS,
} from '../src/mocks/quizOffline.ts';
import { shouldEnableQuizOfflineAuth } from '../src/store/quizOfflineAuth.ts';

const containsHanzi = (value: string) => [...value].some((char) => {
  const codePoint = char.codePointAt(0) ?? 0;
  return codePoint >= 0x3400 && codePoint <= 0x9fff;
});

test('offline provider supports full quiz lifecycle', async () => {
  const provider = createQuizOfflineProvider();

  const quizzes = await provider.getQuizzes();
  assert.equal(quizzes.items.length > 0, true);

  const quiz = await provider.getQuizById(quizzes.items[0].id);
  const session = await provider.startQuizSession(quiz.id);
  assert.equal(session.currentQuestionIndex, 0);

  const answerResult = await provider.submitQuizAnswer(session.id, {
    questionId: quiz.questions![0].id,
    answer: quiz.questions![0].correctAnswer,
  });
  assert.equal(answerResult.isCorrect, true);

  const completed = await provider.completeQuizSession(session.id);
  assert.equal(completed.status, 'COMPLETED');

  const history = await provider.getQuizHistory();
  assert.equal(history.items.length, 1);
});

test('offline provider returns stats and wrong answers without backend', async () => {
  const provider = createQuizOfflineProvider();
  const quizzes = await provider.getQuizzes();
  const quiz = await provider.getQuizById(quizzes.items[0].id);
  const session = await provider.startQuizSession(quiz.id);

  await provider.submitQuizAnswer(session.id, {
    questionId: quiz.questions![0].id,
    answer: 'definitely-wrong',
  });
  await provider.completeQuizSession(session.id);

  const stats = await provider.getQuizStats();
  const wrong = await provider.getWrongAnswers(session.id);

  assert.equal(stats.totalAttempts, 1);
  assert.equal(wrong.length, 1);
});

test('quiz offline auth only activates when offline mode is enabled and user is logged out', () => {
  assert.equal(shouldEnableQuizOfflineAuth(true, false), true);
  assert.equal(shouldEnableQuizOfflineAuth(true, true), false);
  assert.equal(shouldEnableQuizOfflineAuth(false, false), false);
});

test('offline provider exposes a single HSK1 entry point', async () => {
  const provider = createQuizOfflineProvider();
  const quizzes = await provider.getQuizzes();

  const hskQuizzes = quizzes.items.filter((quiz) => quiz.topic === 'HSK1');

  assert.equal(hskQuizzes.length, 1);
  assert.equal(hskQuizzes[0]?.id, 'offline-quiz-hsk1');
});

test('offline provider exposes an HSK2 entry point', async () => {
  const provider = createQuizOfflineProvider();
  const quizzes = await provider.getQuizzes();
  const hsk2 = quizzes.items.find((quiz) => quiz.id === 'offline-quiz-hsk2');

  assert.ok(hsk2);
  assert.equal(hsk2?.topic, 'HSK2');
});

test('offline provider exposes an HSK3 entry point', async () => {
  const provider = createQuizOfflineProvider();
  const quizzes = await provider.getQuizzes();
  const hsk3 = quizzes.items.find((quiz) => quiz.id === 'offline-quiz-hsk3');

  assert.ok(hsk3);
  assert.equal(hsk3?.topic, 'HSK3');
});

test('offline HSK2 includes both vocabulary and contextual prompts', async () => {
  const provider = createQuizOfflineProvider();
  const quiz = await provider.getQuizById('offline-quiz-hsk2');
  const prompts = (quiz.questions ?? []).map((item) => item.question);
  const promptText = prompts.join(' ');

  const contextual = prompts.filter((question) =>
    question.includes('如果') ||
    question.includes('哪句') ||
    question.includes('怎么回答') ||
    question.includes('最合适') ||
    question.includes('ý gần nhất') ||
    question.includes('muốn làm gì') ||
    question.includes('câu nào phù hợp') ||
    question.includes('điều gì') ||
    question.includes('tự nhiên nhất') ||
    question.includes('ý chính') ||
    question.includes('phù hợp nhất') ||
    question.includes('đang nói gần nhất')
  ).length;
  const vocabulary = prompts.filter((question) =>
    question.includes('có nghĩa') ||
    question.includes('ý gần đúng') ||
    question.includes('mang nghĩa')
  ).length;

  assert.equal(contextual > 0, true);
  assert.equal(vocabulary > 0, true);
  assert.equal((quiz.questions?.length ?? 0) >= 600, true);
  assert.equal(promptText.length > 22000, true);
});

test('offline HSK2 no longer contains fully Vietnamese-only questions', async () => {
  const provider = createQuizOfflineProvider();
  const quiz = await provider.getQuizById('offline-quiz-hsk2');
  const hasHan = (value: string) => /[\u3400-\u9FFF]/u.test(value);

  const badQuestions = (quiz.questions ?? []).filter((question) => {
    const questionHasHan = hasHan(question.question);
    const anyOptionHasHan = (question.options ?? []).some((option) => hasHan(option));
    return !questionHasHan && !anyOptionHasHan;
  });

  assert.equal(badQuestions.length, 0);
});

test('offline HSK2 question text now contains more direct Chinese prompts', async () => {
  const provider = createQuizOfflineProvider();
  const quiz = await provider.getQuizById('offline-quiz-hsk2');
  const hasHan = (value: string) => /[\u3400-\u9FFF]/u.test(value);

  const questionsWithHanPrompt = (quiz.questions ?? []).filter((question) => hasHan(question.question));

  assert.equal(questionsWithHanPrompt.length >= 80, true);
});

test('offline HSK3 includes both vocabulary and contextual prompts', async () => {
  const provider = createQuizOfflineProvider();
  const quiz = await provider.getQuizById('offline-quiz-hsk3');
  const prompts = (quiz.questions ?? []).map((item) => item.question);
  const promptText = prompts.join(' ');

  const contextual = prompts.filter((question) =>
    question.includes('如果') ||
    question.includes('哪句') ||
    question.includes('怎么回答') ||
    question.includes('最合适') ||
    question.includes('ý gần nhất') ||
    question.includes('muốn làm gì') ||
    question.includes('câu nào phù hợp') ||
    question.includes('điều gì') ||
    question.includes('tự nhiên nhất') ||
    question.includes('ý chính')
  ).length;
  const vocabulary = prompts.filter((question) =>
    question.includes('có nghĩa') ||
    question.includes('ý gần đúng')
  ).length;

  assert.equal(contextual > 0, true);
  assert.equal(vocabulary > 0, true);
  assert.equal((quiz.questions?.length ?? 0) >= 600, true);
  assert.equal(promptText.length > 22000, true);
});

test('offline HSK3 no longer contains fully Vietnamese-only questions', async () => {
  const provider = createQuizOfflineProvider();
  const quiz = await provider.getQuizById('offline-quiz-hsk3');
  const hasHan = (value: string) => /[\u3400-\u9FFF]/u.test(value);

  const badQuestions = (quiz.questions ?? []).filter((question) => {
    const questionHasHan = hasHan(question.question);
    const anyOptionHasHan = (question.options ?? []).some((option) => hasHan(option));
    return !questionHasHan && !anyOptionHasHan;
  });

  assert.equal(badQuestions.length, 0);
});

test('offline HSK3 question text now contains more direct Chinese prompts', async () => {
  const provider = createQuizOfflineProvider();
  const quiz = await provider.getQuizById('offline-quiz-hsk3');
  const hasHan = (value: string) => /[\u3400-\u9FFF]/u.test(value);

  const questionsWithHanPrompt = (quiz.questions ?? []).filter((question) => hasHan(question.question));

  assert.equal(questionsWithHanPrompt.length >= 100, true);
});

test('offline HSK1 quiz can complete a session and appear in history', async () => {
  const provider = createQuizOfflineProvider();
  const quizzes = await provider.getQuizzes();
  const quiz = quizzes.items.find((item) => item.id === 'offline-quiz-hsk1');

  assert.ok(quiz);

  const session = await provider.startQuizSession(quiz!.id);
  const firstQuestion = (await provider.getSessionQuestions(session.id))[0];

  await provider.submitQuizAnswer(session.id, {
    questionId: firstQuestion.id,
    answer: firstQuestion.correctAnswer,
  });

  const completed = await provider.completeQuizSession(session.id);
  const history = await provider.getQuizHistory();

  assert.equal(completed.quizId, quiz!.id);
  assert.equal(history.items.some((item) => item.quizId === quiz!.id), true);
});

test('offline HSK1 sessions honor selected difficulty and question count', async () => {
  const provider = createQuizOfflineProvider();
  const easy10 = await provider.startQuizSession('offline-quiz-hsk1', {
    difficulty: 'EASY',
    questionCount: 10,
  });
  const easyQuestions = await provider.getSessionQuestions(easy10.id);
  assert.equal(easyQuestions.length, 10);
  assert.equal(easyQuestions.every((question) => question.type === 'MULTIPLE_CHOICE'), true);

  const hard30 = await provider.startQuizSession('offline-quiz-hsk1', {
    difficulty: 'HARD',
    questionCount: 30,
  });
  const hardQuestions = await provider.getSessionQuestions(hard30.id);
  assert.equal(hardQuestions.length, 30);
  assert.equal(hardQuestions.every((question) => question.type === 'MULTIPLE_CHOICE'), true);
});

test('offline HSK1 hard pool includes more contextual prompts than easy pool', () => {
  const countContextual = (questions: typeof HSK1_EASY_QUESTIONS) => questions.filter((question) =>
    question.question.includes('如果') ||
    question.question.includes('怎么回答') ||
    question.question.includes('最合适') ||
    question.question.includes('哪句') ||
    question.question.includes('正在问')
  ).length;

  assert.equal(countContextual(HSK1_HARD_QUESTIONS) > countContextual(HSK1_EASY_QUESTIONS), true);
});

test('offline HSK2 sessions honor selected difficulty and question count', async () => {
  const provider = createQuizOfflineProvider();
  const session = await provider.startQuizSession('offline-quiz-hsk2', {
    difficulty: 'MEDIUM',
    questionCount: 20,
  });
  const questions = await provider.getSessionQuestions(session.id);

  assert.equal(questions.length, 20);
});

test('offline HSK3 sessions honor selected difficulty and question count', async () => {
  const provider = createQuizOfflineProvider();
  const session = await provider.startQuizSession('offline-quiz-hsk3', {
    difficulty: 'HARD',
    questionCount: 30,
  });
  const questions = await provider.getSessionQuestions(session.id);

  assert.equal(questions.length, 30);
});

test('offline HSK1 quiz includes multiple beginner topic groups', async () => {
  const provider = createQuizOfflineProvider();
  const quizzes = await provider.getQuizzes();
  const questionText = quizzes.items
    .filter((item) => item.topic === 'HSK1')
    .flatMap((item) => item.questions ?? [])
    .map((item) => item.question)
    .join(' ');

  assert.equal(questionText.includes('老师'), true);
  assert.equal(questionText.includes('学生'), true);
  assert.equal(questionText.includes('几'), true);
  assert.equal(questionText.includes('喜欢'), true);
  assert.equal(questionText.length > 4000, true);
});

test('offline HSK1 pools contain both vocabulary-style and contextual prompts', async () => {
  const provider = createQuizOfflineProvider();
  const quiz = await provider.getQuizById('offline-quiz-hsk1');

  const prompts = (quiz.questions ?? []).map((item) => item.question);
  const contextualCount = prompts.filter((question) =>
    question.includes('如果') ||
    question.includes('哪句') ||
    question.includes('怎么回答') ||
    question.includes('什么意思') ||
    question.includes('正在问') ||
    question.includes('说') ||
    question.includes('如果 ai đó') ||
    question.includes('Câu nào phù hợp') ||
    question.includes('ý gần nhất') ||
    question.includes('đang hỏi')
  ).length;
  const vocabularyCount = prompts.filter((question) =>
    question.includes('có nghĩa là gì') ||
    question.includes('mang nghĩa') ||
    question.includes('có nghĩa gần đúng là gì')
  ).length;

  assert.equal(contextualCount >= 20, true);
  assert.equal(vocabularyCount >= 20, true);
});

test('offline HSK1 questions are Hanzi-first enough for real Chinese practice', async () => {
  const provider = createQuizOfflineProvider();
  const quiz = await provider.getQuizById('offline-quiz-hsk1');

  const badQuestions = (quiz.questions ?? []).filter((question) => {
    const questionHasHan = containsHanzi(question.question);
    const optionsHaveHan = (question.options ?? []).some((option) => containsHanzi(option));
    return !questionHasHan && !optionsHaveHan;
  });

  const vocabularyQuestions = (quiz.questions ?? []).filter((question) =>
    question.question.includes('có nghĩa') ||
    question.question.includes('ý gần đúng') ||
    question.question.includes('mang nghĩa')
  );

  const vocabularyWithoutHanOptions = vocabularyQuestions.filter((question) =>
    !(question.options ?? []).some((option) => containsHanzi(option))
  );

  assert.equal(badQuestions.length, 0);
  assert.equal(vocabularyWithoutHanOptions.length, 0);
});

test('offline HSK1 no longer contains fully Vietnamese-only questions', async () => {
  const provider = createQuizOfflineProvider();
  const quiz = await provider.getQuizById('offline-quiz-hsk1');
  const hasHan = (value: string) => /[\u3400-\u9FFF]/u.test(value);

  const badQuestions = (quiz.questions ?? []).filter((question) => {
    const questionHasHan = hasHan(question.question);
    const anyOptionHasHan = (question.options ?? []).some((option) => hasHan(option));
    return !questionHasHan && !anyOptionHasHan;
  });

  assert.equal(badQuestions.length, 0);
});

test('offline HSK1 vocabulary-style prompts prefer Hanzi as the correct answer', async () => {
  const provider = createQuizOfflineProvider();
  const quiz = await provider.getQuizById('offline-quiz-hsk1');

  const vocabularyQuestions = (quiz.questions ?? []).filter((question) =>
    question.question.includes('có nghĩa') ||
    question.question.includes('mang nghĩa')
  );

  const wrongShape = vocabularyQuestions.filter((question) => !containsHanzi(question.correctAnswer));

  assert.equal(wrongShape.length, 0);
});

test('offline HSK2 vocabulary-style prompts prefer Hanzi as the correct answer', async () => {
  const provider = createQuizOfflineProvider();
  const quiz = await provider.getQuizById('offline-quiz-hsk2');
  const hasHan = (value: string) => /[\u3400-\u9FFF]/u.test(value);

  const vocabularyQuestions = (quiz.questions ?? []).filter((question) =>
    question.question.includes('có nghĩa') ||
    question.question.includes('mang nghĩa')
  );

  const wrongShape = vocabularyQuestions.filter((question) => !hasHan(question.correctAnswer));

  assert.equal(wrongShape.length, 0);
});

test('offline HSK3 vocabulary-style prompts prefer Hanzi as the correct answer', async () => {
  const provider = createQuizOfflineProvider();
  const quiz = await provider.getQuizById('offline-quiz-hsk3');
  const hasHan = (value: string) => /[\u3400-\u9FFF]/u.test(value);

  const vocabularyQuestions = (quiz.questions ?? []).filter((question) =>
    question.question.includes('có nghĩa') ||
    question.question.includes('mang nghĩa')
  );

  const wrongShape = vocabularyQuestions.filter((question) => !hasHan(question.correctAnswer));

  assert.equal(wrongShape.length, 0);
});

test('offline HSK1 vocabulary-style prompts do not always place the correct answer in slot A', async () => {
  const provider = createQuizOfflineProvider();
  const quiz = await provider.getQuizById('offline-quiz-hsk1');

  const questions = (quiz.questions ?? []).filter((question) =>
    question.question.includes('có nghĩa') || question.question.includes('ý gần nhất')
  );

  const answerIndexes = questions
    .map((question) => question.options?.findIndex((option) => option === question.correctAnswer) ?? -1)
    .filter((index) => index >= 0);

  const uniqueIndexes = Array.from(new Set(answerIndexes));

  assert.equal(uniqueIndexes.length > 1, true);
});
