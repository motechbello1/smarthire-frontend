import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Trophy, FileText, TrendingUp, Award, Medal } from 'lucide-react';
import { toast } from 'sonner';
import { Card, CardBody, CardHeader } from '../ui/Card';
import { Button } from '../ui/Button';
import api from '../../lib/api';

export function RankingResults({ jobId }) {
  const [rankings, setRankings] = useState([]);
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    if (jobId) {
      fetchJob();
      fetchRankings();
    }
  }, [jobId]);

  const fetchJob = async () => {
    try {
      const response = await api.get(`/api/jobs/${jobId}`);
      setJob(response.data);
    } catch (error) {
      toast.error('Failed to fetch job details');
    }
  };

  const fetchRankings = async () => {
    setLoading(true);
    try {
      const response = await api.get(`/api/rankings/job/${jobId}`);
      setRankings(response.data);
    } catch (error) {
      // No rankings yet - that's ok
      setRankings([]);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerate = async () => {
    setGenerating(true);
    try {
      const response = await api.post('/api/rankings/generate', { job_id: parseInt(jobId) });
      setRankings(response.data);
      toast.success(`Ranked ${response.data.length} CVs successfully!`);
    } catch (error) {
      const message = error.response?.data?.detail || 'Failed to generate rankings';
      toast.error(message);
    } finally {
      setGenerating(false);
    }
  };

  const getRankIcon = (position) => {
    if (position === 1) return <Trophy className="h-6 w-6 text-yellow-500" />;
    if (position === 2) return <Medal className="h-6 w-6 text-gray-400" />;
    if (position === 3) return <Award className="h-6 w-6 text-orange-600" />;
    return <span className="text-lg font-bold text-gray-600 dark:text-gray-400">#{position}</span>;
  };

  const getScoreColor = (score) => {
    if (score >= 0.8) return 'text-green-600 dark:text-green-400';
    if (score >= 0.6) return 'text-blue-600 dark:text-blue-400';
    if (score >= 0.4) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-gray-600 dark:text-gray-400';
  };

  return (
    <div className="space-y-6">
      {job && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                  {job.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mt-1">
                  {job.company} • {job.location}
                </p>
              </div>
              <Button
                onClick={handleGenerate}
                isLoading={generating}
                disabled={generating}
              >
                <TrendingUp className="h-4 w-4 mr-2" />
                {rankings.length > 0 ? 'Re-rank CVs' : 'Generate Rankings'}
              </Button>
            </div>
          </CardHeader>
        </Card>
      )}

      {loading ? (
        <div className="text-center py-12 text-gray-600 dark:text-gray-400">
          Loading rankings...
        </div>
      ) : rankings.length === 0 ? (
        <Card>
          <CardBody className="text-center py-12">
            <TrendingUp className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No rankings yet
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Click "Generate Rankings" to rank CVs using BERT semantic matching
            </p>
          </CardBody>
        </Card>
      ) : (
        <div className="space-y-3">
          {rankings.map((ranking, idx) => (
            <motion.div
              key={ranking.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.05 }}
            >
              <Card animate>
                <CardBody className="p-4">
                  <div className="flex items-center gap-4">
                    <div className="flex-shrink-0 w-12 flex justify-center">
                      {getRankIcon(ranking.rank_position)}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2">
                        <FileText className="h-5 w-5 text-primary-600 dark:text-primary-400 flex-shrink-0" />
                        <h4 className="font-medium text-gray-900 dark:text-white truncate">
                          {ranking.cv_filename}
                        </h4>
                      </div>

                      <div className="flex items-center gap-4 text-sm">
                        <div>
                          <span className="text-gray-600 dark:text-gray-400">Relevance: </span>
                          <span className={`font-semibold ${getScoreColor(ranking.relevance_score)}`}>
                            {(ranking.relevance_score * 100).toFixed(1)}%
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-600 dark:text-gray-400">Confidence: </span>
                          <span className="font-semibold text-gray-900 dark:text-white">
                            {(ranking.confidence * 100).toFixed(1)}%
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex-shrink-0">
                      <div className="w-16 h-16 rounded-full border-4 border-primary-600 dark:border-primary-400 flex items-center justify-center">
                        <span className={`text-xl font-bold ${getScoreColor(ranking.relevance_score)}`}>
                          {(ranking.relevance_score * 100).toFixed(0)}
                        </span>
                      </div>
                    </div>
                  </div>
                </CardBody>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
