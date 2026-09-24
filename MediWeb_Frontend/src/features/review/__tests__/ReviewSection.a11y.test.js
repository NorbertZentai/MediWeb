import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';
import ReviewSection from '../ReviewSection';
import { ThemeContext } from 'contexts/ThemeContext';
import { lightTheme } from 'styles/theme';
import { assertInteractiveNodesAreAccessible } from 'test-utils/a11yTreeWalk';

// Keeps axios and the api config out of the test.
jest.mock('../review.api', () => ({ reportReview: jest.fn() }));

const review = (overrides) => ({
  reviewId: 1,
  userId: 'u2',
  author: 'Teszt Elek',
  rating: 4,
  positive: 'Jól működik',
  negative: 'Drága',
  createdAt: '2025-01-15T10:00:00Z',
  ...overrides,
});

const foreignReviews = [
  review({ reviewId: 1, userId: 'u2', author: 'Teszt Elek' }),
  review({ reviewId: 2, userId: 'u3', author: 'Minta Béla', rating: 5 }),
];

function renderReviews(props = {}) {
  return render(
    <ThemeContext.Provider value={{ theme: lightTheme, isDark: false, toggleTheme: jest.fn() }}>
      <ReviewSection
        isLoggedIn
        userId="u1"
        reviews={foreignReviews}
        averageRating={4.5}
        ratingDistribution={{ 5: 1, 4: 1 }}
        onSubmit={jest.fn()}
        updateReview={jest.fn()}
        {...props}
      />
    </ThemeContext.Provider>
  );
}

// Issue #111: ReviewSection is checked by the runtime a11y walker.
describe('ReviewSection accessibility (#111)', () => {
  it('passes the interactive-node a11y walker for a logged-in user', async () => {
    await renderReviews();
    assertInteractiveNodesAreAccessible(screen.toJSON());
  });

  it('still passes the walker once a rating enables the submit button', async () => {
    await renderReviews();
    await fireEvent.press(screen.getByRole('button', { name: '4 csillag' }));
    expect(screen.getByRole('button', { name: 'Vélemény küldése' }).props.accessibilityState.disabled).toBe(false);
    assertInteractiveNodesAreAccessible(screen.toJSON());
  });

  it('labels the review inputs and exposes the submit button', async () => {
    await renderReviews();
    expect(screen.getByLabelText('Pozitív vélemény')).toBeTruthy();
    expect(screen.getByLabelText('Negatív vélemény')).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Vélemény küldése' })).toBeTruthy();
  });

  it('renders one "Értékelés bejelentése" button per foreign review', async () => {
    await renderReviews();
    expect(screen.getAllByRole('button', { name: 'Értékelés bejelentése' })).toHaveLength(2);
  });

  it('names the submit button "Véleményed frissítése" and hides the report button on the own review', async () => {
    await renderReviews({
      reviews: [review({ reviewId: 3, userId: 'u1', author: 'Én' }), ...foreignReviews],
    });
    expect(screen.getByRole('button', { name: 'Véleményed frissítése' })).toBeTruthy();
    expect(screen.getAllByRole('button', { name: 'Értékelés bejelentése' })).toHaveLength(2);
  });
});
