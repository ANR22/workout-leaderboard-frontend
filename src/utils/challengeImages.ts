import type { Challenge } from '../api';

export const getChallengeImage = (challenge: Challenge): string => {
  const images = ['/workouts/running.svg', '/workouts/gym.svg'];
  // Stable pseudo-random pick per challenge so image order appears random but does not flicker.
  const seed = (challenge.id * 9301 + 49297) % 233280;
  return images[seed % images.length];
};
