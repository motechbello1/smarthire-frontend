import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../store/authStore';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8001';

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});

export default function CVs() {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuthStore();
  const [cvs, setCvs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    fetchCVs();
  }, [isAuthenticated, navigate]);

  const fetchCVs = async () => {
    try {
      const response = await api.get('/api/cvs');
      console.log('CVs fetched:', response.data);
      setCvs(response.data);
    } catch (error) {
      console.error('Error fetching CVs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.name.endsWith('.pdf') && !file.name.endsWith('.docx')) {
      alert('Please upload a PDF or DOCX file');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      alert('File size must be less than 10MB');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    setUploading(true);

    try {
      const response = await api.post('/api/cvs/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      console.log('CV uploaded:', response.data);
      fetchCVs();
      alert('CV uploaded successfully!');
      e.target.value = '';
    } catch (error) {
      console.error('Error uploading CV:', error);
      alert('Failed to upload CV. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (cvId) => {
    if (!confirm('Are you sure you want to delete this CV?')) return;

    try {
      await api.delete(`/api/cvs/${cvId}`);
      fetchCVs();
      alert('CV deleted successfully!');
    } catch (error) {
      console.error('Error deleting CV:', error);
      alert('Failed to delete CV');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading CVs...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <header className="bg-white dark:bg-gray-800 shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">CV Management</h1>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Upload and manage candidate resumes
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
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Upload CV</h2>
          <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center">
            <input
              type="file"
              accept=".pdf,.docx"
              onChange={handleFileUpload}
              disabled={uploading}
              className="hidden"
              id="cv-upload"
            />
            <label htmlFor="cv-upload" className={`cursor-pointer ${uploading ? 'opacity-50' : ''}`}>
              <div className="text-4xl mb-4">📄</div>
              <p className="text-gray-700 dark:text-gray-300 mb-2">
                {uploading ? 'Uploading and parsing...' : 'Click to upload or drag and drop'}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">PDF or DOCX (Max 10MB)</p>
            </label>
          </div>
        </div>

        {cvs.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600 dark:text-gray-400">No CVs uploaded yet.</p>
          </div>
        ) : (
          <div className="grid gap-6">
            {cvs.map((cv) => {
              // Backend returns flat fields, not nested parsed_data
              const name = cv.full_name || 'Unknown Candidate';
              const email = cv.email || 'No email';
              const phone = cv.phone;
              const skills = cv.skills || [];
              const nysc = cv.nysc_info;
              const siwes = cv.siwes_info;
              
              return (
                <div key={cv.id} className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                            {name}
                          </h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{email}</p>
                          {phone && <p className="text-sm text-gray-600 dark:text-gray-400">{phone}</p>}
                          <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
                            File: {cv.file_name || cv.filename}
                          </p>
                        </div>
                        <button
                          onClick={() => handleDelete(cv.id)}
                          className="ml-4 px-3 py-1 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
                        >
                          Delete
                        </button>
                      </div>
                      
                      {skills.length > 0 && (
                        <div className="mt-4">
                          <h4 className="font-medium text-gray-900 dark:text-white mb-2">Skills:</h4>
                          <div className="flex flex-wrap gap-2">
                            {skills.map((skill, idx) => (
                              <span
                                key={idx}
                                className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-sm"
                              >
                                {skill}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {nysc && (
                        <div className="mt-4">
                          <h4 className="font-medium text-gray-900 dark:text-white mb-2">NYSC:</h4>
                          <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                            {nysc}
                          </p>
                        </div>
                      )}

                      {siwes && (
                        <div className="mt-4">
                          <h4 className="font-medium text-gray-900 dark:text-white mb-2">SIWES:</h4>
                          <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                            {siwes}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
