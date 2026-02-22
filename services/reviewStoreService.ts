import { CodeReviewResult } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000';

export const saveReview = async (
  code: string,
  language: string,
  focusAreas: string[],
  result: CodeReviewResult
): Promise<void> => {
  const response = await fetch(`${API_BASE_URL}/api/reviews`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      code,
      language,
      focusAreas,
      summary: result.markdown,
    }),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(body || 'Failed to save review to database.');
  }
};
