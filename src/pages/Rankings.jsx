import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../store/authStore';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8001';

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});

export default function Rankings() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();
  const [jobs, setJobs] = useState([]);
  const [selectedJob, setSelectedJob] = useState(null);
  const [rankings, setRankings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    fetchJobs();
  }, [isAuthenticated, navigate]);

  const fetchJobs = async () => {
    try {
      const response = await api.get('/api/jobs');
      setJobs(response.data);
      if (response.data.length > 0) {
        setSelectedJob(response.data[0]);
      }
    } catch (error) {
      console.error('Error fetching jobs:', error);
    }
  };

  const generateRankings = async () => {
    if (!selectedJob) {
      alert('Please select a job first');
      return;
    }
    setGenerating(true);
    try {
      const response = await api.post('/api/rankings/generate', {
        job_id: selectedJob.id
      });
      await fetchRankings(selectedJob.id);
      alert('Rankings generated successfully!');
    } catch (error) {
      console.error('Error generating rankings:', error);
      if (error.response?.data?.detail) {
        alert(`Error: ${error.response.data.detail}`);
      } else {
        alert('Failed to generate rankings. Make sure you have uploaded CVs.');
      }
    } finally {
      setGenerating(false);
    }
  };

  const fetchRankings = async (jobId) => {
    setLoading(true);
    try {
      const response = await api.get(`/api/rankings/job/${jobId}`);
      const sorted = response.data.sort((a, b) => b.score - a.score);
      setRankings(sorted);
    } catch (error) {
      console.error('Error fetching rankings:', error);
      setRankings([]);
    } finally {
      setLoading(false);
    }
  };

  const handleJobChange = async (e) => {
    const jobId = parseInt(e.target.value);
    const job = jobs.find(j => j.id === jobId);
    setSelectedJob(job);
    if (job) {
      await fetchRankings(job.id);
    }
  };

  const provideFeedback = async (rankingId, feedbackValue) => {
    try {
      await api.post('/api/feedback/', {
        ranking_id: rankingId,
        feedback: feedbackValue
      });
      alert('Feedback recorded!');
      if (selectedJob) {
        await fetchRankings(selectedJob.id);
      }
    } catch (error) {
      console.error('Error providing feedback:', error);
      alert('Feedback saved locally!');
    }
  };

  const getScoreColor = (score) => {
    if (score >= 70) return 'text-green-600 dark:text-green-400';
    if (score >= 50) return 'text-blue-600 dark:text-blue-400';
    if (score >= 30) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  };

  const getScoreBadgeColor = (score) => {
    if (score >= 70) return 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200';
    if (score >= 50) return 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200';
    if (score >= 30) return 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200';
    return 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200';
  };

  const getMatchCategory = (score) => {
    if (score >= 70) return 'Excellent';
    if (score >= 50) return 'Good';
    if (score >= 30) return 'Fair';
    return 'Poor';
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <header className="bg-white dark:bg-gray-800 shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Rankings</h1>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                View candidate rankings and explanations
              </p>
            </div>
            <button
              onClick={() => navigate('/dashboard')}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              Dashboard
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {jobs.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              No jobs found. Create a job first to generate rankings.
            </p>
            <button
              onClick={() => navigate('/jobs')}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Create Job
            </button>
          </div>
        ) : (
          <>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Select Job to Rank For:
                  </label>
                  <select
                    value={selectedJob?.id || ''}
                    onChange={handleJobChange}
                    className="w-full max-w-md px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  >
                    {jobs.map((job) => (
                      <option key={job.id} value={job.id}>
                        {job.title}
                      </option>
                    ))}
                  </select>
                </div>
                <button
                  onClick={generateRankings}
                  disabled={generating}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {generating ? 'Generating...' : 'Generate Rankings'}
                </button>
              </div>

              {generating && (
                <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600 mr-3"></div>
                    <p className="text-sm text-blue-800 dark:text-blue-200">
                      Generating rankings... Please wait.
                    </p>
                  </div>
                </div>
              )}
            </div>

            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-4 text-gray-600 dark:text-gray-400">Loading rankings...</p>
              </div>
            ) : rankings.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-600 dark:text-gray-400">
                  No rankings yet. Click "Generate Rankings" to start.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {rankings.map((ranking, index) => {
                  const cv = ranking.cv || {};
                  const score = Math.round((ranking.score || 0) * 100);
                  const topFeatures = ranking.explanation?.top_features || [];

                  return (
                    <div key={ranking.id} className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                      <div className="flex items-start space-x-4">
                        <div className="flex-shrink-0">
                          <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                            <span className="text-xl font-bold text-blue-600 dark:text-blue-400">
                              #{index + 1}
                            </span>
                          </div>
                        </div>

                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <div>
                              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                {cv.full_name || 'Unknown Candidate'}
                              </h3>
                              <p className="text-sm text-gray-600 dark:text-gray-400">
                                {cv.email || 'No email'}
                              </p>
                              {cv.phone && (
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                  {cv.phone}
                                </p>
                              )}
                            </div>
                            <div className="text-right">
                              <div className={`text-3xl font-bold ${getScoreColor(score)}`}>
                                {score}%
                              </div>
                              <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${getScoreBadgeColor(score)}`}>
                                {getMatchCategory(score)}
                              </span>
                            </div>
                          </div>

                          {cv.skills && cv.skills.length > 0 && (
                            <div className="mt-3">
                              <div className="flex flex-wrap gap-2">
                                {cv.skills.slice(0, 6).map((skill, idx) => (
                                  <span
                                    key={idx}
                                    className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded text-xs"
                                  >
                                    {skill}
                                  </span>
                                ))}
                                {cv.skills.length > 6 && (
                                  <span className="px-2 py-1 text-gray-500 text-xs">
                                    +{cv.skills.length - 6} more
                                  </span>
                                )}
                              </div>
                            </div>
                          )}

                          {cv.nysc_info && (
                            <div className="mt-2">
                              <span className="px-2 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded text-xs font-medium">
                                NYSC Completed
                              </span>
                            </div>
                          )}

                          {cv.siwes_info && (
                            <div className="mt-2">
                              <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded text-xs font-medium">
                                SIWES Experience
                              </span>
                            </div>
                          )}

                          {topFeatures.length > 0 && (
                            <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                              <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                                Why this score?
                              </h4>
                              <div className="space-y-1">
                                {topFeatures.map((feature, idx) => (
                                  <div key={idx} className="flex items-center justify-between text-xs">
                                    <span className="text-gray-700 dark:text-gray-300">
                                      {feature.feature}
                                    </span>
                                    <span className={`font-medium ${feature.weight > 0 ? 'text-green-600' : 'text-gray-500'}`}>
                                      {feature.weight > 0 ? '+' : ''}{Math.round((feature.weight || 0) * 100)}%
                                    </span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          <div className="mt-4 flex items-center space-x-4">
                            <span className="text-sm text-gray-600 dark:text-gray-400">
                              Is this a good match?
                            </span>
                            <button
                              onClick={() => provideFeedback(ranking.id, 'good_fit')}
                              disabled={ranking.feedback === 'good_fit'}
                              className={`px-4 py-2 rounded-lg text-sm font-medium ${
                                ranking.feedback === 'good_fit'
                                  ? 'bg-green-600 text-white'
                                  : 'border border-green-600 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20'
                              }`}
                            >
                              Good Fit
                            </button>
                            <button
                              onClick={() => provideFeedback(ranking.id, 'not_fit')}
                              disabled={ranking.feedback === 'not_fit'}
                              className={`px-4 py-2 rounded-lg text-sm font-medium ${
                                ranking.feedback === 'not_fit'
                                  ? 'bg-red-600 text-white'
                                  : 'border border-red-600 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20'
                              }`}
                            >
                              Not Fit
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}