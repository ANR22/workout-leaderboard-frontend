import { useEffect, useState } from 'react';
import type { LeaderboardEntry } from '../api';
import { getLeaderboard } from '../api';

interface LeaderboardProps {
  challengeId: number;
  onRefresh?: () => void;
  refreshTrigger?: number;
}

export function Leaderboard({
  challengeId,
  onRefresh,
  refreshTrigger,
}: LeaderboardProps) {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadLeaderboard = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getLeaderboard(challengeId);
      setEntries(response.leaderboard || []);
    } catch (err) {
      setError('Failed to load leaderboard');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLeaderboard();
  }, [challengeId, refreshTrigger]);

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl">
        {error}
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-slate-200">
      {/* Header */}
      <div className="bg-slate-900 px-6 py-4 flex justify-between items-center">
        <h2 className="text-2xl font-bold text-white">Leaderboard</h2>
        <button
          onClick={() => {
            loadLeaderboard();
            onRefresh?.();
          }}
          disabled={loading}
          className="bg-white text-slate-900 hover:bg-slate-200 font-semibold py-2 px-4 rounded-xl transition-all duration-200 disabled:opacity-50"
        >
          {loading ? 'Refreshing...' : '🔄 Refresh'}
        </button>
      </div>

      {/* Leaderboard Content */}
      <div className="overflow-x-auto">
        {loading && entries.length === 0 ? (
          <div className="p-8 text-center text-slate-500">
            Loading leaderboard...
          </div>
        ) : entries.length === 0 ? (
          <div className="p-8 text-center text-slate-500">
            No participants yet. Be the first to join!
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="bg-slate-100 border-b border-slate-200">
                <th className="px-6 py-3 text-left text-sm font-semibold text-slate-600">
                  Rank
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-slate-600">
                  User
                </th>
                <th className="px-6 py-3 text-right text-sm font-semibold text-slate-600">
                  Aggregated Score
                </th>
              </tr>
            </thead>
            <tbody>
              {entries.map((entry, index) => {
                const isFirstPlace = index === 0;
                const isSecondPlace = index === 1;
                const isThirdPlace = index === 2;

                let medalEmoji = '';
                let rowBgColor = 'hover:bg-slate-50';

                if (isFirstPlace) {
                  medalEmoji = '🥇';
                  rowBgColor = 'bg-amber-50 hover:bg-amber-100';
                } else if (isSecondPlace) {
                  medalEmoji = '🥈';
                  rowBgColor = 'bg-slate-100 hover:bg-slate-200';
                } else if (isThirdPlace) {
                  medalEmoji = '🥉';
                  rowBgColor = 'bg-orange-50 hover:bg-orange-100';
                }

                return (
                  <tr
                    key={`${entry.userId}-${index}`}
                    className={`border-b border-slate-100 transition-colors ${rowBgColor}`}
                  >
                    <td className="px-6 py-4">
                      <span className="text-lg font-bold text-slate-900">
                        {medalEmoji
                          ? `${medalEmoji} #${entry.rank || index + 1}`
                          : `#${entry.rank || index + 1}`}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-slate-700 font-medium">
                        User {entry.userId}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className="text-slate-900 font-bold text-lg">
                        {entry.aggregatedScore}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
