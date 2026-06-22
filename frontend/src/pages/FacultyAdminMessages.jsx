import React, { useEffect, useState, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import Layout from '../components/Layout';
import { FaComments, FaPaperPlane, FaImage, FaTrash } from 'react-icons/fa';

const FacultyAdminMessages = () => {
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
    const interval = setInterval(fetchMessages, 5000);
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

  const handleSend = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() && !file) return;
    setSending(true);
    const formData = new FormData();
    formData.append('message', newMessage);
    if (file) formData.append('file', file);
    try {
      await api.post('/messages', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setNewMessage('');
      setFile(null);
      fetchMessages();
    } catch (err) {
      alert('Error sending message');
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

  // Correct function: mark as read using /messages/{id}/read
  const markAsRead = async (id) => {
    try {
      await api.post(`/messages/${id}/read`);
      // Update local state to reflect read status
      setMessages(prev => prev.map(msg =>
        msg.id === id ? { ...msg, read_at: new Date().toISOString() } : msg
      ));
    } catch (err) {
      // ignore
    }
  };

  if (!user) return null;

  return (
    <Layout>
      <div className="h-[calc(100vh-12rem)] flex flex-col bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-200 flex items-center">
          <FaComments className="text-indigo-600 text-xl mr-2" />
          <h2 className="text-xl font-bold text-gray-800">Messages</h2>
          <span className="ml-3 text-xs text-gray-500">Faculty Admins & Super Admin</span>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {loading ? (
            <p className="text-gray-500 text-center">Loading messages...</p>
          ) : messages.length === 0 ? (
            <p className="text-gray-500 text-center">No messages yet. Start the conversation!</p>
          ) : (
            messages.map(msg => {
              const isUnread = !msg.read_at && msg.user_id !== user.id;
              return (
                <div
                  key={msg.id}
                  className={`flex ${msg.user_id === user.id ? 'justify-end' : 'justify-start'}`}
                  onClick={() => isUnread && markAsRead(msg.id)}
                >
                  <div className={`max-w-[70%] rounded-2xl px-4 py-2 ${msg.user_id === user.id ? 'bg-indigo-600 text-white' : isUnread ? 'bg-yellow-50 border border-yellow-200' : 'bg-gray-100 text-gray-800'}`}>
                    <p className="text-xs font-semibold mb-1">
                      {msg.user?.name || 'Unknown'} ({msg.user?.faculty?.name || 'Admin'})
                    </p>
                    {msg.message && <p className="text-sm whitespace-pre-wrap">{msg.message}</p>}
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
                          <a
                            href={`http://localhost:8000/storage/${msg.file_path}`}
                            target="_blank"
                            rel="noreferrer"
                            className="text-sm underline text-blue-600"
                          >
                            📎 Download Attachment
                          </a>
                        )}
                      </div>
                    )}
                    <p className="text-xs opacity-70 mt-1">
                      {new Date(msg.created_at).toLocaleTimeString()}
                      {isUnread && <span className="ml-2 text-xs text-yellow-600 font-bold">● New</span>}
                      {(msg.user_id === user.id || user.role === 'super_admin') && (
                        <button
                          onClick={(e) => { e.stopPropagation(); deleteMessage(msg.id); }}
                          className="ml-2 text-red-500 hover:text-red-700"
                        >
                          <FaTrash size={12} />
                        </button>
                      )}
                    </p>
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        <form onSubmit={handleSend} className="p-4 border-t border-gray-200 bg-gray-50 flex items-end gap-2">
          <div className="flex-1">
            <textarea
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type a message..."
              className="w-full border border-gray-300 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
              rows="2"
            />
            <div className="mt-1 flex items-center gap-2">
              <label className="cursor-pointer text-gray-500 hover:text-indigo-600">
                <FaImage size={20} />
                <input
                  type="file"
                  className="hidden"
                  accept="image/*,.pdf"
                  onChange={(e) => setFile(e.target.files[0])}
                />
              </label>
              {file && (
                <span className="text-xs text-gray-600">
                  {file.name} ({(file.size / 1024).toFixed(1)} KB)
                  <button
                    type="button"
                    onClick={() => setFile(null)}
                    className="ml-2 text-red-500 hover:text-red-700"
                  >
                    ✕
                  </button>
                </span>
              )}
            </div>
          </div>
          <button
            type="submit"
            disabled={sending || (!newMessage.trim() && !file)}
            className="bg-indigo-600 text-white px-6 py-2 rounded-xl hover:bg-indigo-700 disabled:opacity-50 flex items-center gap-2 h-fit"
          >
            <FaPaperPlane /> {sending ? 'Sending...' : 'Send'}
          </button>
        </form>
      </div>
    </Layout>
  );
};

export default FacultyAdminMessages;
