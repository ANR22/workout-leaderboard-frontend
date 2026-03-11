import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import type { Challenge } from '../api';
import { submitScore, getChallenges } from '../api';
import { Leaderboard } from '../components/Leaderboard';
import { SubmitScoreModal } from '../components/SubmitScoreModal';
import { useAuth } from '../contexts/AuthContext';
import { getChallengeImage } from '../utils/challengeImages';

export function ChallengeDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [challenge, setChallenge] = useState<Challenge | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasJoined, setHasJoined] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [joinLoading, setJoinLoading] = useState(false);

  const { user, isAuthenticated } = useAuth();

  useEffect(() => {
    const loadChallenge = async () => {
      if (!id) return;

      try {
        setLoading(true);
        const challenges = await getChallenges();
        const foundChallenge = challenges.find(c => c.id === parseInt(id));
        if (foundChallenge) {
          setChallenge(foundChallenge);
        } else {
          setError('Challenge not found');
        }
      } catch (err) {
        setError('Failed to load challenge');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadChallenge();
  }, [id]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-xl text-gray-600">Loading challenge...</div>
      </div>
    );
  }

  if (error || !challenge) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-xl text-red-600">{error || 'Challenge not found'}</div>
      </div>
    );
  }

  const handleSubmitScore = async (value: number) => {
    if (!user) return;

    try {
      setSubmitting(true);
      await submitScore(challenge.id, user.id, value);
      // Trigger leaderboard refresh
      setRefreshTrigger((prev) => prev + 1);
    } finally {
      setSubmitting(false);
    }
  };

  const handleJoin = async () => {
    setJoinLoading(true);
    // Simulate join action (no backend endpoint for this yet)
    setTimeout(() => {
      setHasJoined(true);
      setJoinLoading(false);
    }, 500);
  };

  const handleBack = () => {
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white py-8 px-4 border-b border-slate-200">
        <div className="max-w-6xl mx-auto">
          <button
            onClick={handleBack}
            className="inline-flex items-center gap-2 mb-4 text-slate-500 hover:text-slate-900 transition-colors"
          >
            ← Back to Challenges
          </button>
          <h1 className="text-4xl font-black tracking-tight text-slate-900 mb-2">{challenge.name}</h1>
          <p className="text-slate-600">{challenge.description}</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left: Challenge Details and Actions */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sticky top-4">
              <div className="mb-6 overflow-hidden rounded-xl border border-slate-200 bg-slate-100">
                <img
                  src={getChallengeImage(challenge)}
                  alt={`${challenge.name} workout`}
                  className="h-44 w-full object-cover"
                />
              </div>
              {/* Challenge Details Card */}
              <div className="mb-6">
                <h2 className="text-xl font-bold text-slate-900 mb-4">
                  Challenge Details
                </h2>
                <p className="text-slate-700 leading-relaxed">
                  {challenge.details || challenge.description}
                </p>
                {(challenge.startDate || challenge.endDate || challenge.createdAt) && (
                  <div className="mt-4 text-sm text-slate-500">
                    {challenge.startDate && <div>Start: {challenge.startDate}</div>}
                    {challenge.endDate && <div>End: {challenge.endDate}</div>}
                    {challenge.createdAt && <div>Created: {challenge.createdAt}</div>}
                  </div>
                )}
              </div>

              {/* Status Badge */}
              <div className="mb-6">
                <div
                  className={`inline-block px-4 py-2 rounded-full font-semibold text-sm ${
                    hasJoined
                      ? 'bg-emerald-100 text-emerald-700 border border-emerald-300'
                      : 'bg-amber-100 text-amber-700 border border-amber-300'
                  }`}
                >
                  {hasJoined ? '✓ Joined' : 'Not Joined'}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                {!isAuthenticated ? (
                  <div className="text-center">
                    <p className="text-slate-500 text-sm mb-4">
                      Please login to join challenges and submit scores
                    </p>
                    <Link
                      to="/auth"
                      className="w-full bg-slate-900 hover:bg-slate-700 text-white font-semibold py-3 px-4 rounded-xl transition-all duration-200 inline-block text-center"
                    >
                      Login / Sign Up
                    </Link>
                  </div>
                ) : !hasJoined ? (
                  <button
                    onClick={handleJoin}
                    disabled={joinLoading}
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3 px-4 rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {joinLoading ? 'Joining...' : 'Join Challenge'}
                  </button>
                ) : (
                  <button
                    onClick={() => setIsModalOpen(true)}
                    disabled={submitting}
                    className="w-full bg-slate-900 hover:bg-slate-700 text-white font-semibold py-3 px-4 rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    📊 Submit Score
                  </button>
                )}
              </div>

              {/* Help Text */}
              {!hasJoined && (
                <p className="text-slate-500 text-sm mt-4">
                  Join the challenge to submit your scores and compete with
                  others!
                </p>
              )}
            </div>
          </div>

          {/* Right: Leaderboard */}
          <div className="lg:col-span-2">
            <Leaderboard
              challengeId={challenge.id}
              refreshTrigger={refreshTrigger}
              onRefresh={() => console.log('Leaderboard refreshed')}
            />
          </div>
        </div>
      </div>

      {/* Submit Score Modal */}
      <SubmitScoreModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSubmitScore}
        challengeName={challenge.name}
      />
    </div>
  );
}
