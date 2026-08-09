import React, { useEffect, useState, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { io, Socket } from 'socket.io-client';
import { T } from '../theme/tokens';
import DashboardLayout from '../components/layout/DashboardLayout';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { Send, User as UserIcon } from 'lucide-react';

export default function Inbox() {
  const { user } = useAuth();
  const location = useLocation();
  const [socket, setSocket] = useState<Socket | null>(null);
  
  const [conversations, setConversations] = useState<any[]>([]);
  const [activeChatUser, setActiveChatUser] = useState<any | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initialize Socket.io
  useEffect(() => {
    if (!user) return;
    const newSocket = io(import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5001');
    setSocket(newSocket);

    newSocket.on('connect', () => {
      newSocket.emit('register', user.id);
    });

    return () => {
      newSocket.disconnect();
    };
  }, [user]);

  // Load conversations
  useEffect(() => {
    fetchConversations();
  }, []);

  // Check if we came from a "Chat" button on a Gig page
  useEffect(() => {
    if (location.state && location.state.freelancer) {
      const pId = location.state.freelancer._id;
      // See if they are already in the list
      const existing = conversations.find(c => c.user._id === pId);
      if (existing) {
        handleSelectConversation(existing.user);
      } else {
        // Temp add them to the list so we can chat
        const tempUser = { _id: pId, name: location.state.freelancer.name, role: 'freelancer' };
        setConversations([{ user: tempUser, lastMessage: null }, ...conversations]);
        handleSelectConversation(tempUser);
      }
      // clear state so it doesn't loop
      window.history.replaceState({}, document.title);
    }
  }, [location.state, conversations]);

  // Handle incoming messages
  useEffect(() => {
    if (!socket) return;
    
    socket.on('receive_message', (msg) => {
      // If it belongs to active chat, add it
      if (activeChatUser && (msg.sender._id === activeChatUser._id || msg.sender === activeChatUser._id)) {
        setMessages(prev => [...prev, msg]);
        scrollToBottom();
      }
      // Update conversations list (refresh it)
      fetchConversations();
    });

    socket.on('message_sent', (msg) => {
      if (activeChatUser && (msg.receiver._id === activeChatUser._id || msg.receiver === activeChatUser._id)) {
        setMessages(prev => [...prev, msg]);
        scrollToBottom();
      }
      fetchConversations();
    });

    return () => {
      socket.off('receive_message');
      socket.off('message_sent');
    };
  }, [socket, activeChatUser]);

  const fetchConversations = async () => {
    try {
      const res = await api.get('/messages/conversations');
      setConversations(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectConversation = async (chatUser: any) => {
    setActiveChatUser(chatUser);
    try {
      const res = await api.get(`/messages/${chatUser._id}`);
      setMessages(res.data);
      setTimeout(scrollToBottom, 100);
    } catch (err) {
      console.error(err);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const sendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !socket || !activeChatUser) return;

    socket.emit('send_message', {
      senderId: user?.id,
      receiverId: activeChatUser._id,
      content: newMessage.trim()
    });

    setNewMessage('');
  };

  if (loading) return <DashboardLayout title="Inbox"><div style={{ padding: 40, textAlign: 'center', color: T.muted }}>Loading...</div></DashboardLayout>;

  return (
    <DashboardLayout title="Inbox">
      <div style={{ display: 'flex', height: 'calc(100vh - 120px)', backgroundColor: T.white, borderRadius: 16, border: `1px solid ${T.border}`, overflow: 'hidden' }}>
        
        {/* Left Sidebar: Conversations List */}
        <div style={{ width: 320, borderRight: `1px solid ${T.border}`, display: 'flex', flexDirection: 'column', backgroundColor: T.bg }}>
          <div style={{ padding: 20, borderBottom: `1px solid ${T.border}` }}>
            <h3 style={{ fontFamily: 'Inter, sans-serif', fontSize: 16, fontWeight: 600, color: T.ink, margin: 0 }}>Conversations</h3>
          </div>
          
          <div style={{ flex: 1, overflowY: 'auto' }}>
            {conversations.length === 0 ? (
              <div style={{ padding: 32, textAlign: 'center', color: T.muted, fontFamily: 'Inter, sans-serif', fontSize: 13 }}>
                No active conversations yet.
              </div>
            ) : (
              conversations.map(conv => (
                <div 
                  key={conv.user._id} 
                  onClick={() => handleSelectConversation(conv.user)}
                  style={{ 
                    padding: '16px 20px', display: 'flex', gap: 12, cursor: 'pointer',
                    backgroundColor: activeChatUser?._id === conv.user._id ? T.indigoTint : 'transparent',
                    borderBottom: `1px solid ${T.border}`, transition: 'background 0.2s'
                  }}
                >
                  <div style={{ width: 44, height: 44, borderRadius: '50%', backgroundColor: T.indigo, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 16, fontWeight: 600, color: T.white }}>
                      {conv.user.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                      <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 14, fontWeight: 600, color: T.ink, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {conv.user.name}
                      </span>
                    </div>
                    <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 12, color: T.muted, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {conv.lastMessage?.content || "Say hi!"}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right Area: Chat History */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          {activeChatUser ? (
            <>
              {/* Chat Header */}
              <div style={{ padding: '16px 24px', borderBottom: `1px solid ${T.border}`, display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 40, height: 40, borderRadius: '50%', backgroundColor: T.indigo, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 15, fontWeight: 600, color: T.white }}>
                    {activeChatUser.name.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div>
                  <h3 style={{ fontFamily: 'Inter, sans-serif', fontSize: 16, fontWeight: 600, color: T.ink, margin: 0 }}>{activeChatUser.name}</h3>
                  <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 12, color: T.muted, textTransform: 'capitalize' }}>{activeChatUser.role}</span>
                </div>
              </div>

              {/* Chat Messages */}
              <div style={{ flex: 1, padding: 24, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 16, backgroundColor: T.white }}>
                {messages.length === 0 ? (
                  <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: T.muted, fontFamily: 'Inter, sans-serif', fontSize: 14 }}>
                    No messages yet. Send a message to start the conversation!
                  </div>
                ) : (
                  messages.map((msg, idx) => {
                    const isMe = msg.sender === user?.id || msg.sender._id === user?.id;
                    return (
                      <div key={idx} style={{ display: 'flex', justifyContent: isMe ? 'flex-end' : 'flex-start' }}>
                        <div style={{ 
                          maxWidth: '70%', padding: '12px 16px', borderRadius: 16,
                          backgroundColor: isMe ? T.indigo : T.bg,
                          color: isMe ? T.white : T.ink,
                          borderBottomRightRadius: isMe ? 4 : 16,
                          borderBottomLeftRadius: isMe ? 16 : 4
                        }}>
                          <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 14, margin: 0, whiteSpace: 'pre-wrap', lineHeight: 1.4 }}>
                            {msg.content}
                          </p>
                          <span style={{ display: 'block', fontFamily: 'Inter, sans-serif', fontSize: 10, color: isMe ? 'rgba(255,255,255,0.6)' : T.muted, marginTop: 4, textAlign: 'right' }}>
                            {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Chat Input Form */}
              <div style={{ padding: 16, borderTop: `1px solid ${T.border}`, backgroundColor: T.bg }}>
                <form onSubmit={sendMessage} style={{ display: 'flex', gap: 12 }}>
                  <input 
                    type="text" 
                    value={newMessage}
                    onChange={e => setNewMessage(e.target.value)}
                    placeholder="Type your message..."
                    style={{ flex: 1, padding: '12px 16px', borderRadius: 24, border: `1px solid ${T.border}`, fontFamily: 'Inter, sans-serif', fontSize: 14, outline: 'none' }}
                  />
                  <button 
                    type="submit"
                    disabled={!newMessage.trim()}
                    style={{ 
                      width: 44, height: 44, borderRadius: '50%', border: 'none', backgroundColor: T.indigo, color: T.white,
                      display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: newMessage.trim() ? 'pointer' : 'default',
                      opacity: newMessage.trim() ? 1 : 0.5
                    }}
                  >
                    <Send size={18} style={{ marginLeft: -2 }} />
                  </button>
                </form>
              </div>
            </>
          ) : (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: T.muted }}>
              <div style={{ width: 80, height: 80, borderRadius: '50%', backgroundColor: T.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
                <UserIcon size={32} color={T.muted} />
              </div>
              <h3 style={{ fontFamily: 'Fraunces, serif', fontSize: 20, fontWeight: 600, color: T.ink, margin: '0 0 8px' }}>Your Inbox</h3>
              <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 14, margin: 0 }}>Select a conversation from the left to start messaging.</p>
            </div>
          )}
        </div>

      </div>
    </DashboardLayout>
  );
}
