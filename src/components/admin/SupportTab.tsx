import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MessageSquare, X, Send, CheckCircle2 } from 'lucide-react';
import { collection, query, onSnapshot, doc, updateDoc, addDoc } from 'firebase/firestore';
import { db } from '../FirebaseProvider';

interface SupportTabProps {
  filter: string;
  searchQuery: string;
}

export default function SupportTab({ filter, searchQuery }: SupportTabProps) {
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMessage, setSelectedMessage] = useState<any>(null);
  const [replyText, setReplyText] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'support_messages'), (snapshot) => {
      setMessages(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleSendReply = async () => {
    if (!selectedMessage || !replyText.trim()) return;
    setActionLoading(true);
    try {
      await addDoc(collection(db, 'notifications'), {
        userId: selectedMessage.userId,
        title: 'Phản hồi từ quản trị viên',
        message: replyText,
        type: 'message',
        read: false,
        createdAt: Date.now()
      });
      await updateDoc(doc(db, 'support_messages', selectedMessage.id), {
        replied: true,
        replyText: replyText,
        repliedAt: Date.now()
      });
      setReplyText('');
      setSelectedMessage(null);
      alert('Đã gửi phản hồi!');
    } catch (error) {
      console.error("Error sending reply:", error);
    } finally {
      setActionLoading(false);
    }
  };

  const filteredMessages = messages.filter(msg => {
    const matchesFilter = filter === 'all' || (filter === 'pending' ? !msg.replied : msg.replied);
    const matchesSearch = !searchQuery || msg.message.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  if (loading) return <div className="py-20 text-center text-gray-400">Đang tải tin nhắn...</div>;

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence mode="popLayout">
          {filteredMessages.map((msg: any) => (
            <motion.div
              key={msg.id}
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white p-6 rounded-[32px] shadow-sm border border-gray-100 hover:shadow-xl hover:shadow-indigo-100/50 transition-all group"
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="font-bold text-gray-900">{msg.userName}</h3>
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">{new Date(msg.createdAt).toLocaleString()}</p>
                </div>
                <div className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${
                  msg.replied ? 'bg-green-50 text-green-600 border-green-100' : 'bg-amber-50 text-amber-600 border-amber-100'
                }`}>
                  {msg.replied ? 'Đã trả lời' : 'Chưa trả lời'}
                </div>
              </div>
              <p className="text-sm text-gray-600 line-clamp-2 mb-4">{msg.message}</p>
              <div className="flex gap-3">
                <button 
                  onClick={() => setSelectedMessage(msg)}
                  className="flex-1 py-3 bg-gray-50 text-gray-600 rounded-2xl text-xs font-bold hover:bg-gray-100 transition-colors flex items-center justify-center gap-2"
                >
                  <MessageSquare size={14} /> {msg.replied ? 'Xem lại' : 'Trả lời'}
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {filteredMessages.length === 0 && (
        <div className="text-center py-20 text-gray-400">
          <CheckCircle2 size={48} className="mx-auto mb-4 opacity-20" />
          <p className="font-bold">Không có tin nhắn nào</p>
        </div>
      )}

      <AnimatePresence>
        {selectedMessage && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="w-full max-w-2xl bg-white rounded-[40px] p-8 shadow-2xl relative">
              <button onClick={() => setSelectedMessage(null)} className="absolute top-6 right-6 p-2 bg-gray-100 rounded-full text-gray-400 hover:text-gray-600"><X size={20} /></button>
              <h2 className="text-2xl font-black mb-2">Tin nhắn từ {selectedMessage.userName}</h2>
              <p className="text-gray-400 text-xs mb-6">{new Date(selectedMessage.createdAt).toLocaleString()}</p>
              <div className="bg-gray-50 p-6 rounded-3xl mb-6">
                <p className="text-gray-700">{selectedMessage.message}</p>
              </div>
              {selectedMessage.replied ? (
                <div className="bg-indigo-50 p-6 rounded-3xl">
                  <p className="text-[10px] font-black text-[#4F46E5] uppercase mb-2">Phản hồi của bạn</p>
                  <p className="text-gray-700">{selectedMessage.replyText}</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <textarea
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder="Nhập nội dung phản hồi..."
                    className="w-full h-32 p-4 bg-gray-50 border-2 border-transparent rounded-3xl focus:border-indigo-100 outline-none transition-all"
                  />
                  <button
                    onClick={handleSendReply}
                    disabled={actionLoading}
                    className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-black flex items-center justify-center gap-2"
                  >
                    <Send size={20} /> GỬI PHẢN HỒI
                  </button>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
