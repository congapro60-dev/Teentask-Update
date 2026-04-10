import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { collection, query, orderBy, onSnapshot, addDoc, serverTimestamp, doc, updateDoc, getDoc } from 'firebase/firestore';
import { db, auth, useFirebase } from './FirebaseProvider';
import { Chat, Message } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { Send, ChevronLeft, MoreVertical, Phone, Video, Image, Paperclip, Smile, Sparkles, Bot, Zap, HelpCircle, BookOpen, UserPlus } from 'lucide-react';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { TEENTASK_BOT_ID, TEENTASK_BOT_SYSTEM_INSTRUCTION, getGeminiModel, countTokens } from '../lib/gemini';

export default function ChatRoom() {
  const { chatId } = useParams();
  const { profile } = useFirebase();
  const [chat, setChat] = useState<Chat | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [isTyping, setIsTyping] = useState(false);
  const [estimatedTokens, setEstimatedTokens] = useState(0);
  const [showAIInfo, setShowAIInfo] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(async () => {
      if (newMessage.trim() && (chatId === TEENTASK_BOT_ID || chatId?.startsWith(`${TEENTASK_BOT_ID}_`))) {
        const tokens = await countTokens(newMessage, profile?.geminiApiKey);
        setEstimatedTokens(tokens);
      } else {
        setEstimatedTokens(0);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [newMessage, chatId, profile?.geminiApiKey]);

  const BOT_SUGGESTIONS = [
    { icon: HelpCircle, text: "TeenTask là gì?", prompt: "TeenTask là gì và hoạt động như thế nào?" },
    { icon: UserPlus, text: "Xác thực phụ huynh", prompt: "Làm thế nào để xác thực phụ huynh cho tài khoản học sinh?" },
    { icon: BookOpen, text: "Cách tìm việc làm", prompt: "Hướng dẫn tôi cách tìm và ứng tuyển việc làm trên app." },
    { icon: Zap, text: "Mẹo viết CV", prompt: "Cho tôi một vài mẹo để viết hồ sơ năng lực ấn tượng." },
  ];

  useEffect(() => {
    if (!chatId || !auth.currentUser) return;

    // Fetch Chat Details
    const isBotChat = chatId === TEENTASK_BOT_ID || chatId?.startsWith(`${TEENTASK_BOT_ID}_`);
    const actualChatId = (chatId === TEENTASK_BOT_ID && auth.currentUser) 
      ? `${TEENTASK_BOT_ID}_${auth.currentUser.uid}` 
      : chatId || '';

    const fetchChat = async () => {
      try {
        if (isBotChat) {
          // Check if bot chat doc exists in Firestore
          const botChatDoc = await getDoc(doc(db, 'chats', actualChatId));
          if (botChatDoc.exists()) {
            setChat({ id: botChatDoc.id, ...botChatDoc.data() } as Chat);
          } else {
            // Create the bot chat document immediately
            const botChatData = {
              participants: [auth.currentUser?.uid || '', TEENTASK_BOT_ID],
              participantDetails: {
                [auth.currentUser?.uid || '']: {
                  displayName: auth.currentUser?.displayName || 'User',
                  photoURL: auth.currentUser?.photoURL || null
                },
                [TEENTASK_BOT_ID]: {
                  displayName: 'TeenTask Assistant',
                  photoURL: null,
                  role: 'bot'
                }
              },
              lastMessage: 'Chào bạn! Tôi có thể giúp gì cho bạn về TeenTask?',
              lastMessageAt: Date.now(),
              createdAt: Date.now()
            };
            
            const { setDoc } = await import('firebase/firestore');
            await setDoc(doc(db, 'chats', actualChatId), botChatData);
            setChat({ id: actualChatId, ...botChatData } as any as Chat);
          }
        } else {
          const chatDoc = await getDoc(doc(db, 'chats', actualChatId));
          if (chatDoc.exists()) {
            setChat({ id: chatDoc.id, ...chatDoc.data() } as Chat);
          } else {
            // If it's a user-to-user chat and doesn't exist, we might need to derive details
            // But usually this is handled by createChat in FirebaseProvider
            console.warn("Chat document does not exist:", actualChatId);
            setLoading(false);
          }
        }
      } catch (err) {
        console.error("Error fetching chat details:", err);
        setLoading(false);
      }
    };
    fetchChat();

    // Fetch Messages
    const q = query(
      collection(db, 'chats', actualChatId, 'messages'),
      orderBy('createdAt', 'asc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const messageData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Message));
      setMessages(messageData);
      setLoading(false);
      
      // Scroll to bottom
      setTimeout(() => {
        scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }, (error) => {
      // If it's a bot chat and doc doesn't exist yet, it's fine to have empty messages
      if (isBotChat && error.message.includes('insufficient permissions')) {
        setMessages([]);
        setLoading(false);
      } else {
        console.error("Error fetching messages:", error);
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [chatId]);

  const handleSendMessage = async (e: React.FormEvent, customText?: string) => {
    if (e) e.preventDefault();
    const textToUse = customText || newMessage.trim();
    if (!textToUse || !chatId || !auth.currentUser) return;

    setNewMessage('');

    try {
      const isBotChat = chatId === TEENTASK_BOT_ID || chatId?.startsWith(`${TEENTASK_BOT_ID}_`);
      const actualChatId = (chatId === TEENTASK_BOT_ID && auth.currentUser) 
        ? `${TEENTASK_BOT_ID}_${auth.currentUser.uid}` 
        : chatId || '';

      // Add message to subcollection
      await addDoc(collection(db, 'chats', actualChatId, 'messages'), {
        chatId: actualChatId,
        senderId: auth.currentUser.uid,
        text: textToUse,
        createdAt: Date.now()
      });

      // Update last message in chat document
      await updateDoc(doc(db, 'chats', actualChatId), {
        lastMessage: textToUse,
        lastMessageAt: Date.now()
      });

      // Handle Bot Response
      if (isBotChat) {
        setIsTyping(true);
        setTimeout(async () => {
          try {
            const client = getGeminiModel("gemini-3-flash-preview", profile?.geminiApiKey);
            
            // Construct history for Gemini
            const history = messages.slice(-10).map(m => ({
              role: m.senderId === auth.currentUser?.uid ? 'user' : 'model',
              parts: [{ text: m.text }]
            }));

            const chatSession = client.chats.create({
              model: "gemini-3-flash-preview",
              config: {
                systemInstruction: TEENTASK_BOT_SYSTEM_INSTRUCTION
              },
              history: history
            });

            const result = await chatSession.sendMessage({ message: textToUse });
            const botResponse = result.text || "Xin lỗi, tôi không thể trả lời lúc này.";

            await addDoc(collection(db, 'chats', actualChatId, 'messages'), {
              chatId: actualChatId,
              senderId: TEENTASK_BOT_ID,
              text: botResponse,
              createdAt: Date.now()
            });

            await updateDoc(doc(db, 'chats', actualChatId), {
              lastMessage: botResponse,
              lastMessageAt: Date.now()
            });
          } catch (aiError) {
            console.error("Bot AI Error:", aiError);
            // Add a fallback message if AI fails
            await addDoc(collection(db, 'chats', actualChatId, 'messages'), {
              chatId: actualChatId,
              senderId: TEENTASK_BOT_ID,
              text: "Xin lỗi, tôi đang gặp chút sự cố kỹ thuật. Bạn vui lòng thử lại sau nhé!",
              createdAt: Date.now()
            });
          } finally {
            setIsTyping(false);
          }
        }, 1000);
      }
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#4F46E5]"></div>
      </div>
    );
  }

    const otherParticipantUid = chat?.participants.find(uid => uid !== auth.currentUser?.uid);
    const otherParticipant = chat?.participantDetails[otherParticipantUid || ''];
    const isBot = otherParticipantUid === TEENTASK_BOT_ID;

    return (
      <div className="flex flex-col h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white p-6 pt-10 rounded-b-[40px] border-b border-gray-100 shadow-sm backdrop-blur-2xl sticky top-0 z-30">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => navigate('/messages')}
              className="p-3 bg-gray-50 rounded-2xl text-gray-600 hover:bg-gray-100 transition-all border border-gray-100 active:scale-90"
            >
              <ChevronLeft size={20} strokeWidth={3} />
            </button>
            
            <div className="flex-1 flex items-center gap-4">
              <div className="relative">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center overflow-hidden border-2 shadow-sm ${
                  isBot ? 'bg-indigo-50 border-indigo-100' : 'bg-white border-gray-100'
                }`}>
                  {isBot ? (
                    <Bot size={24} className="text-primary" strokeWidth={3} />
                  ) : otherParticipant?.photoURL ? (
                    <img src={otherParticipant.photoURL} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  ) : (
                    <span className="text-lg font-black text-primary">
                      {otherParticipant?.displayName?.charAt(0)}
                    </span>
                  )}
                </div>
                <div className={`absolute -bottom-1 -right-1 w-4 h-4 border-2 border-white rounded-full shadow-sm ${
                  isBot ? 'bg-primary' : 'bg-emerald-500'
                }`}></div>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-black tracking-tight text-gray-900 leading-tight">{otherParticipant?.displayName}</h3>
                  {isBot && (
                    <span className="px-2 py-0.5 bg-primary/10 text-primary text-[7px] font-black uppercase tracking-widest rounded-full border border-primary/20">AI BOT</span>
                  )}
                </div>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <div className={`w-1.5 h-1.5 rounded-full animate-pulse ${
                    isBot ? 'bg-primary' : 'bg-emerald-500'
                  }`}></div>
                  <span className={`text-[9px] font-black uppercase tracking-widest ${
                    isBot ? 'text-primary' : 'text-emerald-500'
                  }`}>Đang hoạt động</span>
                </div>
              </div>
            </div>

          <div className="flex items-center gap-2">
            <button 
              onClick={() => setShowAIInfo(true)}
              className="p-3 text-gray-400 hover:text-primary hover:bg-primary/5 rounded-xl transition-all active:scale-90"
            >
              <HelpCircle size={18} strokeWidth={3} />
            </button>
            <button className="p-3 text-gray-400 hover:text-primary hover:bg-primary/5 rounded-xl transition-all active:scale-90">
              <Phone size={18} strokeWidth={3} />
            </button>
            <button className="p-3 text-gray-400 hover:text-primary hover:bg-primary/5 rounded-xl transition-all active:scale-90">
              <Video size={18} strokeWidth={3} />
            </button>
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-8 scroll-smooth no-scrollbar">
        {messages.length === 0 && isBot && (
          <div className="flex flex-col items-center justify-center py-12 text-center space-y-6">
            <motion.div
              initial={{ scale: 0, rotate: -20 }}
              animate={{ scale: 1, rotate: 0 }}
              className="w-24 h-24 bg-primary/10 rounded-[40px] flex items-center justify-center border-4 border-white shadow-xl"
            >
              <Bot size={48} className="text-primary" strokeWidth={2.5} />
            </motion.div>
            <div className="space-y-2">
              <h2 className="text-2xl font-black text-gray-900 tracking-tight">Chào mừng bạn!</h2>
              <p className="text-sm text-gray-500 font-bold max-w-xs mx-auto leading-relaxed">
                Tôi là TeenTask Bot, trợ lý ảo của bạn. Hãy hỏi tôi bất cứ điều gì về ứng dụng!
              </p>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-md pt-4">
              {BOT_SUGGESTIONS.map((s, i) => (
                <motion.button
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  onClick={() => handleSendMessage(null as any, s.prompt)}
                  className="flex items-center gap-3 p-4 bg-white rounded-2xl border border-gray-100 shadow-sm hover:border-primary/30 hover:bg-primary/5 transition-all text-left group"
                >
                  <div className="w-8 h-8 bg-gray-50 rounded-xl flex items-center justify-center text-gray-400 group-hover:bg-white group-hover:text-primary transition-colors">
                    <s.icon size={16} />
                  </div>
                  <span className="text-xs font-black text-gray-700 group-hover:text-primary transition-colors">{s.text}</span>
                </motion.button>
              ))}
            </div>
          </div>
        )}

        {chat?.relatedTo && (
          <div className="flex justify-center mb-8">
            <motion.div 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white px-5 py-3 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4"
            >
              <div className="w-10 h-10 bg-primary/5 rounded-xl flex items-center justify-center border border-primary/10">
                <Sparkles size={18} className="text-primary" strokeWidth={3} />
              </div>
              <div>
                <p className="text-[9px] font-black text-gray-400 uppercase tracking-[0.2em] mb-0.5">Liên quan đến</p>
                <p className="text-xs font-bold text-gray-900 tracking-tight">{chat.relatedTo.title}</p>
              </div>
            </motion.div>
          </div>
        )}

        <AnimatePresence initial={false}>
          {messages.map((msg, index) => {
            const isMe = msg.senderId === auth.currentUser?.uid;
            const showTime = index === 0 || 
              (messages[index].createdAt - messages[index-1].createdAt > 300000); // 5 mins gap

            return (
              <div key={msg.id} className="space-y-3">
                {showTime && (
                  <div className="flex justify-center py-4">
                    <span className="text-[9px] font-black text-gray-400 uppercase tracking-[0.2em] bg-white border border-gray-100 px-4 py-1.5 rounded-full shadow-sm">
                      {format(msg.createdAt, 'HH:mm, dd/MM', { locale: vi })}
                    </span>
                  </div>
                )}
                <div className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                  <motion.div
                    initial={{ scale: 0.9, opacity: 0, y: 10 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    className={`max-w-[80%] p-4 rounded-[24px] text-sm font-medium shadow-sm leading-relaxed tracking-tight relative ${
                      isMe 
                        ? 'bg-primary text-white rounded-tr-none' 
                        : 'bg-white text-gray-800 rounded-tl-none border border-gray-100'
                    }`}
                  >
                    <p className="relative z-10">{msg.text}</p>
                  </motion.div>
                </div>
              </div>
            );
          })}
          {isTyping && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex justify-start"
            >
              <div className="bg-white p-4 rounded-[24px] rounded-tl-none border border-gray-100 shadow-sm flex gap-1">
                <motion.div animate={{ scale: [1, 1.5, 1] }} transition={{ repeat: Infinity, duration: 0.6 }} className="w-1.5 h-1.5 bg-primary rounded-full" />
                <motion.div animate={{ scale: [1, 1.5, 1] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.2 }} className="w-1.5 h-1.5 bg-primary rounded-full" />
                <motion.div animate={{ scale: [1, 1.5, 1] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.4 }} className="w-1.5 h-1.5 bg-primary rounded-full" />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        <div ref={scrollRef} />
      </div>

      {/* Input Area */}
      <div className="p-6 bg-white border-t border-gray-100 pb-10">
        {estimatedTokens > 0 && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-4xl mx-auto mb-3 flex justify-end"
          >
            <div className="px-3 py-1 bg-indigo-50 text-indigo-600 text-[10px] font-black rounded-full border border-indigo-100 flex items-center gap-2">
              <Zap size={10} />
              Ước tính: ~{estimatedTokens} tokens
            </div>
          </motion.div>
        )}
        <form onSubmit={handleSendMessage} className="flex items-center gap-3 bg-gray-50 p-2 rounded-[32px] border border-gray-200 focus-within:bg-white focus-within:border-primary/20 focus-within:ring-4 focus-within:ring-primary/5 transition-all max-w-4xl mx-auto">
          <div className="flex items-center gap-1 pl-1">
            <button type="button" className="p-3 text-gray-400 hover:text-primary transition-all active:scale-90 hover:bg-primary/5 rounded-2xl">
              <Image size={20} strokeWidth={3} />
            </button>
            <button type="button" className="p-3 text-gray-400 hover:text-primary transition-all active:scale-90 hover:bg-primary/5 rounded-2xl">
              <Smile size={20} strokeWidth={3} />
            </button>
          </div>
          
          <input
            type="text"
            placeholder="Viết tin nhắn..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            className="flex-1 py-3 px-2 bg-transparent border-none text-sm font-bold text-gray-900 placeholder:text-gray-400 focus:ring-0 outline-none"
          />
          
          <motion.button
            whileTap={{ scale: 0.9 }}
            type="submit"
            disabled={!newMessage.trim()}
            className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all active:scale-90 ${
              newMessage.trim() 
                ? 'bg-primary text-white shadow-lg shadow-primary/20' 
                : 'bg-gray-200 text-gray-400'
            }`}
          >
            <Send size={20} strokeWidth={3} />
          </motion.button>
        </form>
      </div>
      {/* AI Transparency Modal */}
      <AnimatePresence>
        {showAIInfo && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowAIInfo(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-md bg-white rounded-[40px] p-8 shadow-2xl overflow-hidden"
            >
              <div className="absolute top-0 right-0 p-6">
                <button onClick={() => setShowAIInfo(false)} className="p-2 bg-gray-50 text-gray-400 rounded-full hover:bg-gray-100">
                  <ChevronLeft size={20} className="rotate-90" />
                </button>
              </div>

              <div className="space-y-6">
                <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center">
                  <Sparkles size={32} className="text-primary" />
                </div>
                
                <div className="space-y-2">
                  <h2 className="text-2xl font-black text-gray-900 tracking-tight">Về TeenTask AI</h2>
                  <p className="text-sm text-gray-500 font-medium leading-relaxed">
                    TeenTask sử dụng mô hình Gemini 1.5 Flash để hỗ trợ bạn trong quá trình học tập và tìm kiếm cơ hội.
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                    <h4 className="text-xs font-black text-gray-900 mb-2 flex items-center gap-2">
                      <Zap size={14} className="text-amber-500" />
                      Mục đích sử dụng
                    </h4>
                    <ul className="text-[11px] text-gray-500 font-bold space-y-2">
                      <li className="flex items-start gap-2">• Cá nhân hóa lộ trình phát triển kỹ năng.</li>
                      <li className="flex items-start gap-2">• Gợi ý việc làm & kiến tập phù hợp nhất.</li>
                      <li className="flex items-start gap-2">• Hỗ trợ Mentor 24/7 giải đáp thắc mắc.</li>
                    </ul>
                  </div>

                  <div className="p-4 bg-indigo-50 rounded-2xl border border-indigo-100">
                    <h4 className="text-xs font-black text-indigo-900 mb-2 flex items-center gap-2">
                      <Zap size={14} className="text-indigo-600" />
                      Về Token & Giới hạn
                    </h4>
                    <p className="text-[10px] text-indigo-700 font-bold leading-relaxed">
                      Mỗi yêu cầu tiêu tốn một lượng "tokens" nhất định. Nếu bạn sử dụng API key cá nhân, giới hạn sẽ phụ thuộc vào gói cước của bạn (thường là 15 yêu cầu/phút cho bản miễn phí).
                    </p>
                  </div>
                </div>

                <button 
                  onClick={() => setShowAIInfo(false)}
                  className="w-full py-4 bg-primary text-white rounded-2xl font-black shadow-lg shadow-primary/20 active:scale-95 transition-all"
                >
                  Đã hiểu
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
