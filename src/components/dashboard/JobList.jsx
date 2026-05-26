import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Briefcase, MapPin, Calendar, Edit2, Trash2, TrendingUp } from 'lucide-react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { Button } from '../ui/Button';
import { Card, CardBody } from '../ui/Card';
import api from '../../lib/api';

export function JobList({ refreshTrigger, onEdit }) {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchJobs();
  }, [refreshTrigger]);

  const fetchJobs = async () => {
    try {
      const response = await api.get('/api/jobs');
      setJobs(response.data);
    } catch (error) {
      toast.error('Failed to fetch jobs');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this job?')) return;

    try {
      await api.delete(`/api/jobs/${id}`);
      toast.success('Job deleted successfully');
      fetchJobs();
    } catch (error) {
      toast.error('Failed to delete job');
    }
  };

  const handleRank = (jobId) => {
    navigate(`/rankings?job=${jobId}`);
  };

  if (loading) {
    return <div className="text-center py-8 text-gray-600 dark:text-gray-400">Loading jobs...</div>;
  }

  if (jobs.length === 0) {
    return (
      <Card>
        <CardBody className="text-center py-12">
          <Briefcase className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No jobs created yet</h3>
          <p className="text-gray-600 dark:text-gray-400">Create your first job to start ranking CVs</p>
        </CardBody>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {jobs.map((job, idx) => (
        <motion.div
          key={job.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: idx * 0.1 }}
        >
          <Card animate className="h-full">
            <CardBody className="p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h4 className="font-semibold text-lg text-gray-900 dark:text-white mb-1">
                    {job.title}
                  </h4>
                  {job.company && (
                    <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">
                      {job.company}
                    </p>
                  )}
                </div>
                {job.is_active && (
                  <span className="px-2 py-1 text-xs rounded-full bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300">
                    Active
                  </span>
                )}
              </div>

              <div className="space-y-2 mb-4 text-sm">
                {job.location && (
                  <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                    <MapPin className="h-4 w-4" />
                    {job.location}
                  </div>
                )}
                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                  <Calendar className="h-4 w-4" />
                  Created {new Date(job.created_at).toLocaleDateString()}
                </div>
              </div>

              <p className="text-sm text-gray-700 dark:text-gray-300 mb-4 line-clamp-3">
                {job.description}
              </p>

              <div className="flex gap-2">
                <Button
                  size="sm"
                  onClick={() => handleRank(job.id)}
                  className="flex-1"
                >
                  <TrendingUp className="h-4 w-4 mr-1" />
                  Rank CVs
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onEdit(job)}
                >
                  <Edit2 className="h-4 w-4" />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => handleDelete(job.id)}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardBody>
          </Card>
        </motion.div>
      ))}
    </div>
  );
}
