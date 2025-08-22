import React, { useState, useEffect, useRef, useCallback } from 'react';
import axios from '../Axios/AxiosInstance';
import { useAuth } from '../AuthContext/AuthContext';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useNavigate } from 'react-router-dom';

const Profile = () => {
  const { user, loading: authLoading } = useAuth();
  const [profile, setProfile] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    mobile: '',
    address: '',
    pincode: '',
    gender: '',
    dob: '',
  });
  const [image, setImage] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const [loading, setLoading] = useState(true);
  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (authLoading) {
      console.log('Auth is still loading');
      return;
    }

    if (!user || !user._id) {
      console.log('No user or user._id found in AuthContext:', JSON.stringify(user, null, 2));
      toast.error('Session expired or invalid. Please log in again.', {
        position: 'top-left',
      });
      setLoading(false);
      navigate('/login');
      return;
    }

    console.log('User in Profile component:', JSON.stringify(user, null, 2));
    fetchProfile(user._id);
  }, [user?._id, authLoading, navigate]);

  const fetchProfile = useCallback(async (id) => {
    try {
      console.log('Fetching profile for user ID:', id);
      const res = await axios.get(`/api/profile/${id}`, { withCredentials: true });
      if (res.data.message === "No profile found for this user") {
        console.log('No profile found, initializing formData with user data:', user);
        setProfile(null);
        setFormData({
          name: user.name || '',
          email: user.email || '',
          mobile: '',
          address: '',
          pincode: '',
          gender: '',
          dob: '',
        });
        setPreviewImage(user.image || 'https://via.placeholder.com/150');
      } else {
        setProfile(res.data);
        setFormData({
          name: res.data.name || '',
          email: res.data.email || user.email || '',
          mobile: res.data.mobile || '',
          address: res.data.address || '',
          pincode: res.data.pincode || '',
          gender: res.data.gender || '',
          dob: res.data.dob ? new Date(res.data.dob).toISOString().split('T')[0] : '',
        });
        setPreviewImage(res.data.profileImage || user.image || 'https://via.placeholder.com/150');
      }
    } catch (err) {
      console.error('Fetch profile error:', err.response?.data || err.message);
      console.log('User data on error:', user);
      
      setProfile(null);
      setFormData({
        name: user?.name || '',
        email: user?.email || '',
        mobile: '',
        address: '',
        pincode: '',
        gender: '',
        dob: '',
      });
      setPreviewImage(user?.image || 'https://via.placeholder.com/150');
    } finally {
      setLoading(false);
      console.log('Rendering profile form, profile exists:', !!profile, 'formData:', formData);
    }
  }, [user]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        toast.error('Only image files are allowed', { position: 'top-left' });
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image size must be less than 5MB', { position: 'top-left' });
        return;
      }
      setImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async () => {
    try {
      if (!user?._id) {
        toast.error('User not authenticated', { position: 'top-left' });
        navigate('/login');
        return;
      }

      // Validate required fields
      const { name, email, mobile, address, pincode } = formData;
      if (!name || !email || !mobile || !address || !pincode) {
        toast.error('All required fields (name, email, mobile, address, pincode) must be provided', {
          position: 'top-left',
        });
        return;
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        toast.error('Invalid email format', { position: 'top-left' });
        return;
      }

      const form = new FormData();
      Object.keys(formData).forEach((key) => {
        form.append(key, formData[key] || '');
      });
      if (image) {
        form.append('profileImage', image);
      } else if (!profile && !previewImage) {
        toast.error('Profile image is required for new profiles', { position: 'top-left' });
        return;
      }

      console.log('FormData entries:', Object.fromEntries(form.entries()));

      let res;
      if (profile) {
        res = await axios.put(`/api/profile/${user._id}`, form, {
          headers: { 'Content-Type': 'multipart/form-data' },
          withCredentials: true,
        });
        toast.success('Profile updated successfully', { position: 'top-left' });
      } else {
        res = await axios.post('/api/profile', form, {
          headers: { 'Content-Type': 'multipart/form-data' },
          withCredentials: true,
        });
        toast.success('Profile created successfully', { position: 'top-left' });
      }

      const profileData = res.data.profile || res.data;
      setProfile(profileData);
      setFormData({
        name: profileData.name || '',
        email: profileData.email || user.email || '',
        mobile: profileData.mobile || '',
        address: profileData.address || '',
        pincode: profileData.pincode || '',
        gender: profileData.gender || '',
        dob: profileData.dob ? new Date(profileData.dob).toISOString().split('T')[0] : '',
      });
      if (profileData.profileImage) setPreviewImage(profileData.profileImage);
      setImage(null);
      if (fileInputRef.current) fileInputRef.current.value = null;
    } catch (err) {
      console.error('Submit error:', err.response?.data || err.message);
      toast.error(`Failed to save profile: ${err.response?.data?.message || 'Server error'}`, {
        position: 'top-left',
      });
    }
  };

  const handleDelete = async () => {
    try {
      if (!user?._id) {
        toast.error('User not authenticated', { position: 'top-left' });
        navigate('/login');
        return;
      }
      await axios.delete(`/api/profile/${user._id}`, { withCredentials: true });
      toast.success('Profile deleted', { position: 'top-left' });
      setProfile(null);
      setPreviewImage(null);
      setFormData({
        name: user.name || '',
        email: user.email || '',
        mobile: '',
        address: '',
        pincode: '',
        gender: '',
        dob: '',
      });
    } catch (err) {
      console.error('Delete error:', err.response?.data || err.message);
      toast.error(`Failed to delete profile: ${err.response?.data?.message || 'Server error'}`, {
        position: 'top-left',
      });
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-100">
        <div className="animate-spin h-14 w-14 border-t-4 border-b-4 border-blue-600 rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl bg-white rounded-lg shadow-lg p-8">
        <h1 className="text-3xl font-bold text-gray-900 text-center mb-8">My Profile</h1>

        <div className="flex flex-col md:flex-row gap-8">
          {/* Profile Image Section */}
          <div className="flex flex-col items-center md:w-1/3">
            <div className="relative">
              <img
                src={previewImage || '/default-profile.png'}
                alt="Profile"
                className="w-32 h-32 rounded-full border-4 border-blue-600 shadow-md object-cover"
              />
              <div className="absolute bottom-0 right-0 bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center cursor-pointer hover:bg-blue-700 transition-colors">
                <span onClick={() => fileInputRef.current.click()} className="text-sm">✎</span>
              </div>
            </div>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImageChange}
              className="hidden"
              accept="image/*"
            />
            <button
              onClick={() => fileInputRef.current.click()}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              Change Photo
            </button>
          </div>

          {/* Form Section */}
          <div className="md:w-2/3 space-y-6">
            {[
              { name: 'name', label: 'Full Name', type: 'text', placeholder: 'Enter your full name' },
              { name: 'email', label: 'Email Address', type: 'email', placeholder: 'Enter your email', disabled: true },
              { name: 'mobile', label: 'Mobile Number', type: 'tel', placeholder: 'Enter your mobile number' },
              { name: 'address', label: 'Address', type: 'text', placeholder: 'Enter your address' },
              { name: 'pincode', label: 'Pincode', type: 'text', placeholder: 'Enter your pincode' },
            ].map((field) => (
              <div key={field.name}>
                <label className="block text-sm font-medium text-gray-900 mb-1">{field.label}</label>
                <input
                  name={field.name}
                  type={field.type}
                  value={formData[field.name] || ''}
                  onChange={handleChange}
                  placeholder={field.placeholder}
                  disabled={field.disabled}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-blue-600 text-gray-900 placeholder-gray-500 outline-none transition-colors disabled:bg-gray-100 disabled:cursor-not-allowed"
                />
              </div>
            ))}

            <div>
              <label className="block text-sm font-medium text-gray-900 mb-1">Date of Birth</label>
              <input
                name="dob"
                type="date"
                value={formData.dob || ''}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-blue-600 text-gray-900 outline-none transition-colors"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-900 mb-1">Gender</label>
              <select
                name="gender"
                value={formData.gender || ''}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-blue-600 text-gray-900 outline-none transition-colors"
              >
                <option value="">Select Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div className="flex gap-4">
              <button
                onClick={handleSubmit}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-md"
              >
                {profile ? 'Update Profile' : 'Create Profile'}
              </button>
              {profile && (
                <button
                  onClick={handleDelete}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium shadow-md"
                >
                  Delete Profile
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
      <ToastContainer position="top-left" autoClose={2000} hideProgressBar={true} />
    </div>
  )
}

export default Profile;