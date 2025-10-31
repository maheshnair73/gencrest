import React, { useState } from 'react';
import { LogIn, User, Lock, Eye, EyeOff, Shield, KeyRound, CheckCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import {apiBaseUrl} from '../services/apiService'
const LoginForm: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showSetPasswordModal, setShowSetPasswordModal] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [saving, setSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await login(username, password) as any;
      console.log('login response', response);

      if (response === 'P') {
        setShowSetPasswordModal(true);
        return;
      }

      if (response === true) {
        window.location.href = '/';
        return;
      }

      setError('Invalid credentials. Please check your username and password.');
    } catch (err) {
      console.error(err);
      setError('Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSaving(true);

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      setSaving(false);
      return;
    }


    try {
      const res = await fetch(`${apiBaseUrl}/api/v1/auth/set-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email:username,
          newPassword: newPassword,
          previousPassword:username
        }),
      });

      if (!res.ok) throw new Error('Failed to set password');

      const data = await res.json();
      console.log('set-password response', data);

      setSuccessMessage('Password successfully set! Redirecting to login...');
      setTimeout(() => {
        setShowSetPasswordModal(false);
        window.location.href = '/login';
      }, 2000);
    } catch (err) {
      console.error(err);
      setError('Failed to set password. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-pink-50 to-blue-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden border border-gray-200">
        {/* Header */}
        <div className="bg-white p-8 text-center border-b border-gray-100">
          <div className="flex items-center justify-center mb-6">
            <img
              src="/Gencrest logo.png"
              alt="Gencrest Logo"
              className="h-14 w-auto"
            />
          </div>
          <h1 className="text-2xl font-bold text-gray-800 mb-1">Sales Empowerment Module</h1>
          <p className="text-gray-500 text-sm">(Beta version)</p>
        </div>

        {/* Login Form */}
        <div className="p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Username
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  placeholder="Enter your role (e.g., mdo, tsm)"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  placeholder="Enter your password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-red-800 text-sm">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-pink-600 text-white py-3 px-4 rounded-lg hover:bg-pink-700 transition-all duration-200 flex items-center justify-center disabled:opacity-50 font-semibold shadow-sm"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <LogIn className="w-4 h-4 mr-2" />
                  Sign In
                </>
              )}
            </button>
          </form>
        </div>
      </div>

      {/* Set Password Modal */}
      {showSetPasswordModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-sm p-5 relative">
            <h2 className="text-lg font-bold mb-3 flex items-center text-pink-600">
              <KeyRound className="w-5 h-5 mr-2" /> Set Your Password
            </h2>

            {successMessage ? (
              <div className="flex items-center bg-green-50 border border-green-200 text-green-700 rounded-lg p-2.5 text-sm">
                <CheckCircle className="w-4 h-4 mr-2 flex-shrink-0" />
                <p>{successMessage}</p>
              </div>
            ) : (
              <form onSubmit={handleSetPassword} className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">New Password</label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-pink-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Confirm Password</label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-pink-500"
                    required
                  />
                </div>

                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-2 text-xs">
                    {error}
                  </div>
                )}

                <div className="flex justify-end gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setShowSetPasswordModal(false)}
                    className="px-3 py-1.5 text-sm rounded-lg border border-gray-300 hover:bg-gray-100"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-3 py-1.5 text-sm bg-pink-600 text-white rounded-lg hover:bg-pink-700 flex items-center justify-center min-w-[100px]"
                  >
                    {saving ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      'Save Password'
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default LoginForm;
