import assert from 'node:assert/strict';
import test from 'node:test';

import { getQuizDetailPreviewQuestions } from '../src/pages/quiz/quizDetailPreview.ts';

test('HSK1 detail preview does not always use the first 20 questions', () => {
  const questions = Array.from({ length: 50 }, (_, index) => ({
    id: `q-${index + 1}`,
    question: `Question ${index + 1}`,
  }));

  const preview = getQuizDetailPreviewQuestions(questions, true, 1, 20);

  assert.equal(preview.length, 20);
  assert.notDeepEqual(
    preview.map((item) => item.id),
    questions.slice(0, 20).map((item) => item.id),
  );
});

test('HSK1 detail preview stays stable for the same seed and changes for a different seed', () => {
  const questions = Array.from({ length: 50 }, (_, index) => ({
    id: `q-${index + 1}`,
    question: `Question ${index + 1}`,
  }));

  const previewA1 = getQuizDetailPreviewQuestions(questions, true, 1, 20).map((item) => item.id);
  const previewA2 = getQuizDetailPreviewQuestions(questions, true, 1, 20).map((item) => item.id);
  const previewB = getQuizDetailPreviewQuestions(questions, true, 2, 20).map((item) => item.id);

  assert.deepEqual(previewA1, previewA2);
  assert.notDeepEqual(previewA1, previewB);
});

test('non-HSK1 preview still returns the original question list', () => {
  const questions = Array.from({ length: 5 }, (_, index) => ({
    id: `q-${index + 1}`,
    question: `Question ${index + 1}`,
  }));

  const preview = getQuizDetailPreviewQuestions(questions, false, 1, 20);

  assert.deepEqual(preview.map((item) => item.id), questions.map((item) => item.id));
});

test('HSK1 preview changes when the selected difficulty pool changes', () => {
  const easyQuestions = Array.from({ length: 30 }, (_, index) => ({
    id: `easy-${index + 1}`,
    question: `Easy ${index + 1}`,
  }));
  const hardQuestions = Array.from({ length: 30 }, (_, index) => ({
    id: `hard-${index + 1}`,
    question: `Hard ${index + 1}`,
  }));

  const easyPreview = getQuizDetailPreviewQuestions(easyQuestions, true, 7, 20).map((item) => item.id);
  const hardPreview = getQuizDetailPreviewQuestions(hardQuestions, true, 7, 20).map((item) => item.id);

  assert.notDeepEqual(easyPreview, hardPreview);
});

test('HSK1 preview follows the selected question count', () => {
  const questions = Array.from({ length: 50 }, (_, index) => ({
    id: `q-${index + 1}`,
    question: `Question ${index + 1}`,
  }));

  const preview10 = getQuizDetailPreviewQuestions(questions, true, 5, 10);
  const preview20 = getQuizDetailPreviewQuestions(questions, true, 5, 20);
  const preview30 = getQuizDetailPreviewQuestions(questions, true, 5, 30);

  assert.equal(preview10.length, 10);
  assert.equal(preview20.length, 20);
  assert.equal(preview30.length, 30);
});
