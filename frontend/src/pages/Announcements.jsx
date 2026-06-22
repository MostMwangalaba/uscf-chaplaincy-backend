import React, { useEffect, useState, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import Layout from '../components/Layout';
import { FaBullhorn, FaPaperPlane, FaImage, FaTrash, FaComments } from 'react-icons/fa';

const Announcements = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newMessage, setNewMessage] = useState('');
  const [file, setFile] = useState(null);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (!user) { navigate('/login'); return; }
    fetchMessages();
    const interval = setInterval(fetchMessages, 10000);
    return () => clearInterval(interval);
  }, [user, navigate]);

  const fetchMessages = () => {
    api.get('/messages')
      .then(res => {
        setMessages(res.data);
        setLoading(false);
        scrollToBottom();
      })
      .catch(() => setLoading(false));
  };

  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const handleSendAdvice = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() && !file) return;
    setSending(true);
    const formData = new FormData();
    formData.append('message', newMessage);
    if (file) formData.append('file', file);
    try {
      await api.post('/messages/advice', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setNewMessage('');
      setFile(null);
      fetchMessages();
    } catch (err) {
      alert('Error sending advice');
    } finally {
      setSending(false);
    }
  };

  const deleteMessage = async (id) => {
    if (!window.confirm('Delete this message?')) return;
    try {
      await api.delete(`/messages/${id}`);
      fetchMessages();
    } catch (err) {
      alert('Error deleting message');
    }
  };

  if (!user) return null;

  // Filter messages: broadcasts and own advice
  const broadcasts = messages.filter(m => m.type === 'broadcast');
  const advices = messages.filter(m => m.type === 'advice' && m.user_id === user.id);

  return (
    <Layout>
      <div className="space-y-6">
        {/* Broadcasts Section */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center">
            <FaBullhorn className="mr-2 text-indigo-600" />
            Announcements & Broadcasts
          </h2>
          {loading ? (
            <p>Loading...</p>
          ) : broadcasts.length === 0 ? (
            <p className="text-gray-500">No announcements yet.</p>
          ) : (
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {broadcasts.map(msg => (
                <div key={msg.id} className="bg-gray-50 rounded-xl p-4 border-l-4 border-indigo-500">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-semibold text-gray-800">{msg.user?.name}</p>
                      <p className="text-xs text-gray-500">{msg.user?.faculty?.name || 'Admin'}</p>
                    </div>
                    <span className="text-xs text-gray-400">{new Date(msg.created_at).toLocaleString()}</span>
                  </div>
                  <p className="mt-2 text-gray-700 whitespace-pre-wrap">{msg.message}</p>
                  {msg.file_path && (
                    <div className="mt-2">
                      {msg.file_type?.startsWith('image/') ? (
                        <img
                          src={`http://localhost:8000/storage/${msg.file_path}`}
                          alt="Attachment"
                          className="max-w-full max-h-48 rounded-lg cursor-pointer"
                          onClick={() => window.open(`http://localhost:8000/storage/${msg.file_path}`, '_blank')}
                        />
                      ) : (
                        <a href={`http://localhost:8000/storage/${msg.file_path}`} target="_blank" rel="noreferrer" className="text-blue-600 underline text-sm">📎 Download</a>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Advice Section */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center">
            <FaComments className="mr-2 text-indigo-600" />
            Send Advice to Your Faculty Admin
          </h2>
          <p className="text-gray-600 text-sm mb-4">
            Your advice will be sent directly to your faculty admin.
          </p>

          <div className="max-h-60 overflow-y-auto space-y-3 mb-4">
            {advices.map(msg => (
              <div key={msg.id} className="bg-blue-50 rounded-xl p-3 border-l-4 border-blue-500">
                <div className="flex justify-between items-start">
                  <p className="text-sm font-medium text-blue-800">You</p>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-400">{new Date(msg.created_at).toLocaleString()}</span>
                    {(msg.user_id === user.id || user.role === 'super_admin') && (
                      <button onClick={() => deleteMessage(msg.id)} className="text-red-500 hover:text-red-700">
                        <FaTrash size={12} />
                      </button>
                    )}
                  </div>
                </div>
                <p className="mt-1 text-gray-700 whitespace-pre-wrap">{msg.message}</p>
                {msg.file_path && (
                  <div className="mt-2">
                    {msg.file_type?.startsWith('image/') ? (
                      <img src={`http://localhost:8000/storage/${msg.file_path}`} alt="Attachment" className="max-w-full max-h-32 rounded-lg" />
                    ) : (
                      <a href={`http://localhost:8000/storage/${msg.file_path}`} target="_blank" rel="noreferrer" className="text-blue-600 underline text-sm">📎 Download</a>
                    )}
                  </div>
                )}
                {/* Show replies if any */}
                {msg.replies && msg.replies.length > 0 && (
                  <div className="mt-2 pl-4 border-l-2 border-blue-300 space-y-1">
                    {msg.replies.map(reply => (
                      <div key={reply.id} className="bg-indigo-50 rounded-lg p-2">
                        <div className="flex justify-between items-start">
                          <p className="text-xs font-medium text-indigo-800">Admin</p>
                          <span className="text-xs text-gray-400">{new Date(reply.created_at).toLocaleTimeString()}</span>
                        </div>
                        <p className="text-sm text-gray-700 whitespace-pre-wrap">{reply.message}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
            {advices.length === 0 && <p className="text-gray-400 text-sm">No advice sent yet.</p>}
            <div ref={messagesEndRef} />
          </div>

          <form onSubmit={handleSendAdvice} className="flex flex-col gap-2">
            <div className="flex gap-2">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type your advice..."
                className="flex-1 border border-gray-300 rounded-xl px-4 py-2 focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="submit"
                disabled={sending || (!newMessage.trim() && !file)}
                className="bg-blue-600 text-white px-4 py-2 rounded-xl hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
              >
                <FaPaperPlane /> {sending ? 'Sending...' : 'Send'}
              </button>
            </div>
            <div className="flex items-center gap-2">
              <label className="cursor-pointer text-gray-500 hover:text-blue-600 text-sm flex items-center gap-1">
                <FaImage /> Attach file
                <input type="file" className="hidden" accept="image/*,.pdf" onChange={(e) => setFile(e.target.files[0])} />
              </label>
              {file && (
                <span className="text-xs text-gray-600">
                  {file.name} ({(file.size / 1024).toFixed(1)} KB)
                  <button type="button" onClick={() => setFile(null)} className="ml-2 text-red-500 hover:text-red-700">✕</button>
                </span>
              )}
            </div>
          </form>
        </div>
      </div>
    </Layout>
  );
};

export default Announcements;
