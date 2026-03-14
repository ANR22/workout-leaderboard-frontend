import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import type { Challenge } from '../api';
import { getChallenges } from '../api';
import { useAuth } from '../contexts/AuthContext';
import { getChallengeImage } from '../utils/challengeImages';

const parseDate = (value?: string): Date | null => {
  if (!value) return null;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
};

const isChallengeEnded = (challenge: Challenge): boolean => {
  const end = parseDate(challenge.endDate);
  if (!end) return false;
  return end.getTime() < Date.now();
};

function ChallengeCard({ challenge, ended = false }: { challenge: Challenge; ended?: boolean }) {
  return (
    <Link
      key={challenge.id}
      to={`/challenge/${challenge.id}`}
      className="block"
    >
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 cursor-pointer group">
        <div className="h-48 overflow-hidden bg-slate-100">
          <img
            src={getChallengeImage(challenge)}
            alt={`${challenge.name} workout`}
            className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />
        </div>

        <div className="p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xl font-bold text-slate-900">{challenge.name}</h3>
            <span
              className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${
                ended
                  ? 'bg-rose-50 text-rose-700 border-rose-200'
                  : 'bg-emerald-50 text-emerald-700 border-emerald-200'
              }`}
            >
              {ended ? 'Recently Ended' : 'Ongoing'}
            </span>
          </div>

          <p className="text-slate-600 text-sm mb-4">{challenge.description}</p>

          <button className="w-full bg-slate-900 hover:bg-slate-700 text-white font-semibold py-2.5 px-4 rounded-xl transition-all duration-200">
            View Details
          </button>
        </div>
      </div>
    </Link>
  );
}

export function ChallengesPage() {
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { user, logout, isAuthenticated } = useAuth();

  const ongoingChallenges = challenges.filter((challenge) => !isChallengeEnded(challenge));
  const recentlyEndedChallenges = challenges.filter((challenge) => isChallengeEnded(challenge));

  useEffect(() => {
    const loadChallenges = async () => {
      try {
        setLoading(true);
        const data = await getChallenges();
        setChallenges(Array.isArray(data) ? data : []);
      } catch (err) {
        setError('Failed to load challenges');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadChallenges();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-xl text-gray-600">Loading challenges...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-xl text-red-600">{error}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white py-10 px-4 border-b border-slate-200">
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-4xl font-black tracking-tight text-slate-900 mb-2">
                Workout Leaderboard
              </h1>
              <p className="text-slate-600">Discover challenges and track your progress</p>
            </div>

            {/* Auth Section */}
            <div className="flex items-center gap-4">
              {isAuthenticated ? (
                <div className="flex items-center gap-4">
                  <span className="text-slate-700 font-semibold">Welcome, {user?.name}!</span>
                  <button
                    onClick={logout}
                    className="bg-slate-900 hover:bg-slate-700 text-white font-semibold py-2 px-4 rounded-xl transition-all duration-200"
                  >
                    Logout
                  </button>
                </div>
              ) : (
                <Link
                  to="/auth"
                  className="bg-slate-900 hover:bg-slate-700 text-white font-semibold py-2 px-4 rounded-xl transition-all duration-200"
                >
                  Login / Sign Up
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Ongoing Challenges */}
      <div className="max-w-6xl mx-auto px-4 py-12">
        {challenges.length === 0 ? (
          <div className="text-center text-slate-500">
            <p className="text-lg">No challenges available at the moment</p>
          </div>
        ) : (
          <>
            <div className="mb-10">
              <div className="flex items-center gap-4 mb-5">
                <h2 className="text-2xl font-black text-slate-900">Ongoing Challenges</h2>
                <div className="h-px bg-slate-300 flex-1" />
              </div>
              {ongoingChallenges.length === 0 ? (
                <p className="text-slate-500">No ongoing challenges right now.</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {ongoingChallenges.map((challenge) => (
                    <ChallengeCard key={challenge.id} challenge={challenge} />
                  ))}
                </div>
              )}
            </div>

            <div>
              <div className="flex items-center gap-4 mb-5">
                <h2 className="text-2xl font-black text-slate-900">Recently Ended Challenges</h2>
                <div className="h-px bg-slate-300 flex-1" />
              </div>
              {recentlyEndedChallenges.length === 0 ? (
                <p className="text-slate-500">No recently ended challenges.</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {recentlyEndedChallenges.map((challenge) => (
                    <ChallengeCard key={challenge.id} challenge={challenge} ended />
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
