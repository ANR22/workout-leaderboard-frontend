import { useState } from 'react';

interface SubmitScoreModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (score: number) => Promise<void>;
  challengeName: string;
}

export function SubmitScoreModal({
  isOpen,
  onClose,
  onSubmit,
  challengeName,
}: SubmitScoreModalProps) {
  const [score, setScore] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!score.trim()) {
      setError('Please enter a score');
      return;
    }

    const scoreValue = parseFloat(score);
    if (isNaN(scoreValue)) {
      setError('Please enter a valid number');
      return;
    }

    if (scoreValue < 0) {
      setError('Score cannot be negative');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      await onSubmit(scoreValue);
      setScore('');
      onClose();
    } catch (err) {
      setError('Failed to submit score. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 animate-fadeIn">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-md w-full mx-4 animate-slideIn">
        {/* Header */}
        <div className="bg-slate-900 px-6 py-4">
          <h2 className="text-2xl font-bold text-white">Submit Score</h2>
          <p className="text-slate-300 text-sm mt-1">{challengeName}</p>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6">
          {/* Score Input */}
          <div className="mb-6">
            <label className="block text-slate-700 font-semibold mb-2">
              Your Score
            </label>
            <input
              type="number"
              step="0.01"
              value={score}
              onChange={(e) => {
                setScore(e.target.value);
                setError(null);
              }}
              placeholder="Enter your score"
              className="w-full px-4 py-3 bg-white border border-slate-300 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900/20 focus:border-slate-500 transition-all"
              disabled={loading}
              autoFocus
            />
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm">
              {error}
            </div>
          )}

          {/* Buttons */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold py-2.5 px-4 rounded-xl transition-all duration-200 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-slate-900 hover:bg-slate-700 text-white font-semibold py-2.5 px-4 rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Submitting...' : 'Submit'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
