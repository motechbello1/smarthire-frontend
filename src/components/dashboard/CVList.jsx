import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FileText, Trash2, Eye, Calendar, User, Mail, Phone } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '../ui/Button';
import { Card, CardBody, CardHeader } from '../ui/Card';
import api from '../../lib/api';

export function CVList({ refreshTrigger }) {
  const [cvs, setCvs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCV, setSelectedCV] = useState(null);

  useEffect(() => {
    fetchCVs();
  }, [refreshTrigger]);

  const fetchCVs = async () => {
    try {
      const response = await api.get('/api/cvs');
      setCvs(response.data);
    } catch (error) {
      toast.error('Failed to fetch CVs');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this CV?')) return;

    try {
      await api.delete(`/api/cvs/${id}`);
      toast.success('CV deleted successfully');
      fetchCVs();
    } catch (error) {
      toast.error('Failed to delete CV');
    }
  };

  const handleViewDetails = async (id) => {
    try {
      const response = await api.get(`/api/cvs/${id}`);
      setSelectedCV(response.data);
    } catch (error) {
      toast.error('Failed to fetch CV details');
    }
  };

  if (loading) {
    return <div className="text-center py-8 text-gray-600 dark:text-gray-400">Loading CVs...</div>;
  }

  if (cvs.length === 0) {
    return (
      <Card>
        <CardBody className="text-center py-12">
          <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No CVs uploaded yet</h3>
          <p className="text-gray-600 dark:text-gray-400">Upload your first CV to get started</p>
        </CardBody>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {cvs.map((cv, idx) => (
          <motion.div
            key={cv.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
          >
            <Card animate className="h-full">
              <CardBody className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="w-10 h-10 rounded-lg bg-primary-100 dark:bg-primary-900 flex items-center justify-center flex-shrink-0">
                      <FileText className="h-5 w-5 text-primary-600 dark:text-primary-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-gray-900 dark:text-white truncate">
                        {cv.filename}
                      </h4>
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        {(cv.file_size / 1024).toFixed(0)} KB • {cv.file_type.toUpperCase()}
                      </p>
                    </div>
                  </div>
                </div>

                {cv.full_name && (
                  <div className="space-y-1 mb-3 text-sm">
                    <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                      <User className="h-4 w-4" />
                      <span className="truncate">{cv.full_name}</span>
                    </div>
                    {cv.email && (
                      <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                        <Mail className="h-4 w-4" />
                        <span className="truncate text-xs">{cv.email}</span>
                      </div>
                    )}
                    {cv.phone && (
                      <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                        <Phone className="h-4 w-4" />
                        <span className="text-xs">{cv.phone}</span>
                      </div>
                    )}
                  </div>
                )}

                <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400 mb-3">
                  <Calendar className="h-3 w-3" />
                  {new Date(cv.uploaded_at).toLocaleDateString()}
                </div>

                {cv.skills && cv.skills.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-3">
                    {cv.skills.slice(0, 3).map((skill, i) => (
                      <span key={i} className="px-2 py-0.5 text-xs rounded bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300">
                        {skill}
                      </span>
                    ))}
                    {cv.skills.length > 3 && (
                      <span className="px-2 py-0.5 text-xs rounded bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400">
                        +{cv.skills.length - 3}
                      </span>
                    )}
                  </div>
                )}

                <div className="flex gap-2 mt-3">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleViewDetails(cv.id)}
                    className="flex-1"
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    View
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleDelete(cv.id)}
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

      {/* CV Details Modal */}
      {selectedCV && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
          onClick={() => setSelectedCV(null)}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto"
          >
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              CV Details
            </h3>

            <div className="space-y-4">
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Contact</h4>
                <div className="text-sm text-gray-700 dark:text-gray-300 space-y-1">
                  {selectedCV.full_name && <p>Name: {selectedCV.full_name}</p>}
                  {selectedCV.email && <p>Email: {selectedCV.email}</p>}
                  {selectedCV.phone && <p>Phone: {selectedCV.phone}</p>}
                </div>
              </div>

              {selectedCV.nysc_info && (
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-2">NYSC</h4>
                  <p className="text-sm text-gray-700 dark:text-gray-300">{selectedCV.nysc_info}</p>
                </div>
              )}

              {selectedCV.siwes_info && (
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-2">SIWES</h4>
                  <p className="text-sm text-gray-700 dark:text-gray-300">{selectedCV.siwes_info}</p>
                </div>
              )}

              {selectedCV.skills && selectedCV.skills.length > 0 && (
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Skills</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedCV.skills.map((skill, i) => (
                      <span key={i} className="px-3 py-1 text-sm rounded-full bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <Button onClick={() => setSelectedCV(null)} className="w-full">
                Close
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
