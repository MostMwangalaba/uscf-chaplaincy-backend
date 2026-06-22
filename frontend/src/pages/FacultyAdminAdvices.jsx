import React, { useEffect, useState, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import Layout from '../components/Layout';
import { FaComments, FaPaperPlane, FaImage, FaTrash, FaReply } from 'react-icons/fa';

const FacultyAdminAdvices = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [replyMessage, setReplyMessage] = useState('');
  const [replyFile, setReplyFile] = useState(null);
  const [replyingTo, setReplyingTo] = useState(null);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
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
      .catch(err => {
        console.error('Error fetching messages:', err);
        setLoading(false);
      });
  };

  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const handleReplySubmit = async (parentId) => {
    if (!replyMessage.trim() && !replyFile) return;
    setSending(true);
    const formData = new FormData();
    formData.append('parent_id', parentId);
    formData.append('message', replyMessage);
    if (replyFile) formData.append('file', replyFile);
    try {
      await api.post('/messages/reply', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      setReplyMessage('');
      setReplyFile(null);
      setReplyingTo(null);
      fetchMessages();
    } catch (err) {
      alert('Error sending reply');
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

  const advices = messages.filter(m => m.type === 'advice');

  return (
    <Layout>
      <div className="space-y-6">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center">
            <FaComments className="mr-2 text-indigo-600" />
            Advices from Members
          </h2>
          {loading ? (
            <p>Loading...</p>
          ) : advices.length === 0 ? (
            <p className="text-gray-500">No advice messages from members yet.</p>
          ) : (
            <div className="space-y-4">
              {advices.map(advice => {
                const replies = messages.filter(r => r.parent_id === advice.id);
                return (
                  <div key={advice.id} className="border border-gray-200 rounded-xl p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-semibold text-gray-800">{advice.user?.name}</p>
                        <p className="text-xs text-gray-500">{advice.user?.member_id}</p>
                      </div>
                      <span className="text-xs text-gray-400">{new Date(advice.created_at).toLocaleString()}</span>
                    </div>
                    <p className="mt-2 text-gray-700 whitespace-pre-wrap">{advice.message}</p>
                    {advice.file_path && (
                      <div className="mt-2">
                        {advice.file_type?.startsWith('image/') ? (
                          <img
                            src={`http://localhost:8000/storage/${advice.file_path}`}
                            alt="Attachment"
                            className="max-w-full max-h-48 rounded-lg cursor-pointer"
                            onClick={() => window.open(`http://localhost:8000/storage/${advice.file_path}`, '_blank')}
                          />
                        ) : (
                          <a href={`http://localhost:8000/storage/${advice.file_path}`} target="_blank" rel="noreferrer" className="text-blue-600 underline text-sm">📎 Download</a>
                        )}
                      </div>
                    )}
                    {replies.length > 0 && (
                      <div className="mt-3 pl-4 border-l-2 border-indigo-300 space-y-2">
                        {replies.map(reply => (
                          <div key={reply.id} className="bg-indigo-50 rounded-lg p-3">
                            <div className="flex justify-between items-start">
                              <p className="text-sm font-medium text-indigo-800">You (Admin)</p>
                              <span className="text-xs text-gray-400">{new Date(reply.created_at).toLocaleString()}</span>
                            </div>
                            <p className="mt-1 text-gray-700 whitespace-pre-wrap">{reply.message}</p>
                            {reply.file_path && (
                              <div className="mt-1">
                                {reply.file_type?.startsWith('image/') ? (
                                  <img src={`http://localhost:8000/storage/${reply.file_path}`} alt="Attachment" className="max-w-full max-h-32 rounded-lg" />
                                ) : (
                                  <a href={`http://localhost:8000/storage/${reply.file_path}`} target="_blank" rel="noreferrer" className="text-blue-600 underline text-sm">📎 Download</a>
                                )}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                    {replyingTo === advice.id ? (
                      <div className="mt-3 bg-gray-50 rounded-lg p-3">
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={replyMessage}
                            onChange={(e) => setReplyMessage(e.target.value)}
                            placeholder="Type your reply..."
                            className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500"
                          />
                          <button
                            onClick={() => handleReplySubmit(advice.id)}
                            disabled={sending || (!replyMessage.trim() && !replyFile)}
                            className="bg-indigo-600 text-white px-3 py-2 rounded-lg hover:bg-indigo-700 disabled:opacity-50 flex items-center gap-1"
                          >
                            <FaPaperPlane size={14} /> {sending ? '...' : 'Reply'}
                          </button>
                          <button
                            onClick={() => {
                              setReplyingTo(null);
                              setReplyMessage('');
                              setReplyFile(null);
                            }}
                            className="text-gray-500 hover:text-gray-700 px-2"
                          >
                            ✕
                          </button>
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <label className="cursor-pointer text-gray-500 hover:text-indigo-600 text-xs flex items-center gap-1">
                            <FaImage /> Attach
                            <input
                              type="file"
                              className="hidden"
                              accept="image/*,.pdf"
                              onChange={(e) => setReplyFile(e.target.files[0])}
                            />
                          </label>
                          {replyFile && (
                            <span className="text-xs text-gray-600">
                              {replyFile.name} ({(replyFile.size / 1024).toFixed(1)} KB)
                              <button
                                type="button"
                                onClick={() => setReplyFile(null)}
                                className="ml-2 text-red-500 hover:text-red-700"
                              >
                                ✕
                              </button>
                            </span>
                          )}
                        </div>
                      </div>
                    ) : (
                      <button
                        onClick={() => setReplyingTo(advice.id)}
                        className="mt-2 text-sm text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
                      >
                        <FaReply size={12} /> Reply
                      </button>
                    )}
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default FacultyAdminAdvices;
