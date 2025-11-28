import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const ProfilePage = () => {
  const navigate = useNavigate();
  const { currentUser, logout, deleteAccount } = useAuth();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  const handleDeleteAccount = async () => {
    try {
      setIsDeleting(true);
      await deleteAccount();
      navigate('/');
    } catch (error) {
      console.error('Error deleting account:', error);
      alert('Failed to delete account. Please try again.');
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  if (!currentUser) {
    navigate('/');
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 via-sky-100 to-cyan-100 p-3 md:p-4 relative overflow-hidden">
      {/* Rich Background Elements */}
      <div className="absolute top-1/4 left-1/6 w-96 h-96 bg-gradient-to-br from-blue-400/50 to-indigo-400/40 blur-xl rounded-full animate-[float_25s_ease-in-out_infinite] -z-10"></div>
      <div className="absolute bottom-1/4 right-1/6 w-80 h-80 bg-gradient-to-br from-sky-400/45 to-blue-400/35 blur-xl rounded-full animate-[float_30s_ease-in-out_infinite] -z-10" style={{ animationDelay: '12s' }}></div>
      <div className="absolute top-1/2 right-1/3 w-64 h-64 bg-gradient-to-br from-cyan-400/40 to-sky-400/30 blur-xl rounded-full animate-[float_35s_ease-in-out_infinite] -z-10" style={{ animationDelay: '18s' }}></div>
      
      <div className="max-w-2xl mx-auto relative z-10">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <button
            onClick={() => navigate('/dashboard')}
            className="bg-gradient-to-r from-gray-100 to-gray-200 hover:from-gray-200 hover:to-gray-300 text-gray-800 font-medium py-2 px-4 rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl border border-gray-200/50 text-sm flex items-center gap-2"
          >
            ← Back to Dashboard
          </button>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
            My Profile
          </h1>
        </div>

        {/* Profile Card */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 md:p-8 border border-blue-100">
          {/* Profile Header */}
          <div className="text-center mb-8">
            <div className="w-24 h-24 bg-gradient-to-br from-blue-400 to-sky-500 rounded-full flex items-center justify-center text-white text-3xl font-bold mx-auto mb-4">
              {currentUser.firstName.charAt(0).toUpperCase()}{currentUser.lastName.charAt(0).toUpperCase()}
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              {currentUser.displayName}
            </h2>
            <p className="text-gray-600">TravelAI Explorer</p>
          </div>

          {/* Profile Information */}
          <div className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-1">
                <label className="block text-gray-700 font-medium text-sm">
                  First Name
                </label>
                <div className="w-full p-3 border border-blue-200 rounded-lg bg-gray-50 text-gray-700">
                  {currentUser.firstName}
                </div>
              </div>
              
              <div className="space-y-1">
                <label className="block text-gray-700 font-medium text-sm">
                  Last Name
                </label>
                <div className="w-full p-3 border border-blue-200 rounded-lg bg-gray-50 text-gray-700">
                  {currentUser.lastName}
                </div>
              </div>
            </div>

            <div className="space-y-1">
              <label className="block text-gray-700 font-medium text-sm">
                Email Address
              </label>
              <div className="w-full p-3 border border-blue-200 rounded-lg bg-gray-50 text-gray-700">
                {currentUser.email}
              </div>
            </div>

            <div className="space-y-1">
              <label className="block text-gray-700 font-medium text-sm">
                Member Since
              </label>
              <div className="w-full p-3 border border-blue-200 rounded-lg bg-gray-50 text-gray-700">
                {(() => {
                  try {
                    const date = currentUser.createdAt ? new Date(currentUser.createdAt) : new Date();
                    return isNaN(date.getTime()) ? 
                      new Date().toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      }) :
                      date.toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      });
                  } catch (error) {
                    return new Date().toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    });
                  }
                })()}
              </div>
            </div>

            <div className="space-y-1">
              <label className="block text-gray-700 font-medium text-sm">
                User ID
              </label>
              <div className="w-full p-3 border border-blue-200 rounded-lg bg-gray-50 text-gray-700 font-mono text-xs">
                {currentUser.uid}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 mt-8 pt-6 border-t border-gray-200">
            <button
              onClick={() => navigate('/dashboard')}
              className="flex-1 bg-gradient-to-r from-blue-500 to-sky-600 hover:from-blue-600 hover:to-sky-700 text-white font-medium py-3 px-6 rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl"
            >
              Continue Planning Trips
            </button>
            <button
              onClick={handleLogout}
              className="flex-1 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-medium py-3 px-6 rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl"
            >
              Sign Out
            </button>
          </div>
        </div>

        {/* Travel Stats Card */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 mt-6 border border-blue-100">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Travel Stats</h3>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">0</div>
              <div className="text-sm text-gray-600">Trips Planned</div>
            </div>
            <div className="p-4 bg-sky-50 rounded-lg">
              <div className="text-2xl font-bold text-sky-600">0</div>
              <div className="text-sm text-gray-600">Destinations</div>
            </div>
            <div className="p-4 bg-cyan-50 rounded-lg">
              <div className="text-2xl font-bold text-cyan-600">0</div>
              <div className="text-sm text-gray-600">AI Chats</div>
            </div>
          </div>
        </div>

        {/* Danger Zone */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 mt-6 border border-red-200">
          <h3 className="text-lg font-semibold text-red-800 mb-4">Danger Zone</h3>
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <h4 className="text-red-800 font-medium mb-2">Delete Account</h4>
            <p className="text-red-600 text-sm mb-4">
              Permanently delete your account and all associated data. This action cannot be undone.
            </p>
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-medium py-2 px-4 rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl text-sm"
            >
              Delete My Account
            </button>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-red-600 text-2xl">⚠️</span>
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">Delete Account</h3>
              <p className="text-gray-600 mb-6">
                Are you sure you want to delete your account? This will permanently remove all your data and cannot be undone.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  disabled={isDeleting}
                  className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-3 px-4 rounded-lg transition-all duration-300 disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteAccount}
                  disabled={isDeleting}
                  className="flex-1 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-medium py-3 px-4 rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50"
                >
                  {isDeleting ? 'Deleting...' : 'Delete Account'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfilePage;
