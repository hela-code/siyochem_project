'use client'

import React, { useState, useEffect, useRef, Suspense } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import {
  MessageCircle,
  Send,
  ArrowLeft,
  Loader2,
  Search,
  Clock,
  User,
  ChevronRight,
  Link2,
} from 'lucide-react'
import { useAuthStore } from '@/stores/authStore'
import axios from 'axios'

function MessagesContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const chatWith = searchParams.get('chat')

  const { user: currentUser, isAuthenticated, token, loading: authLoading } = useAuthStore()

  const [conversations, setConversations] = useState([])
  const [bondedUsers, setBondedUsers] = useState([])
  const [loadingConvos, setLoadingConvos] = useState(true)
  const [activeChat, setActiveChat] = useState(chatWith || null)
  const [partner, setPartner] = useState(null)
  const [messages, setMessages] = useState([])
  const [loadingMessages, setLoadingMessages] = useState(false)
  const [newMessage, setNewMessage] = useState('')
  const [sending, setSending] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const messagesEndRef = useRef(null)

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) router.push('/login')
  }, [authLoading, isAuthenticated, router])

  // Fetch conversations
  const fetchConversations = async (showLoading = true) => {
    if (!token) return
    try {
      if (showLoading) setLoadingConvos(true)
      const { data } = await axios.get('/api/messages', {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (data.success) {
        setConversations(data.conversations)
        setBondedUsers(data.bondedUsers || [])
      }
    } catch (err) {
      console.error('Failed to fetch conversations:', err)
    } finally {
      if (showLoading) setLoadingConvos(false)
    }
  }

  useEffect(() => {
    fetchConversations(true)
  }, [token])

  // Poll conversation list every 10 seconds
  useEffect(() => {
    if (!token) return
    const interval = setInterval(() => fetchConversations(false), 10000)
    return () => clearInterval(interval)
  }, [token])

  // Fetch messages when activeChat changes
  useEffect(() => {
    if (!activeChat || !token) return
    const fetchMessages = async () => {
      try {
        setLoadingMessages(true)
        const { data } = await axios.get(`/api/messages/${activeChat}`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        if (data.success) {
          setPartner(data.partner)
          setMessages(data.messages)
        }
      } catch (err) {
        console.error('Failed to fetch messages:', err)
      } finally {
        setLoadingMessages(false)
      }
    }
    fetchMessages()
  }, [activeChat, token])

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Poll for new messages every 5 seconds
  useEffect(() => {
    if (!activeChat || !token) return
    const interval = setInterval(async () => {
      try {
        const { data } = await axios.get(`/api/messages/${activeChat}`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        if (data.success) setMessages(data.messages)
      } catch (_) {}
    }, 5000)
    return () => clearInterval(interval)
  }, [activeChat, token])

  const handleSend = async (e) => {
    e.preventDefault()
    if (!newMessage.trim() || !activeChat || sending) return

    try {
      setSending(true)
      const { data } = await axios.post(
        `/api/messages/${activeChat}`,
        { content: newMessage.trim() },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      if (data.success) {
        setMessages((prev) => [...prev, data.message])
        setNewMessage('')
        // Update conversation list
        setConversations((prev) => {
          const existing = prev.find((c) => c.partnerId === activeChat)
          if (existing) {
            return prev.map((c) =>
              c.partnerId === activeChat
                ? { ...c, lastMessage: data.message.content, lastMessageAt: data.message.createdAt, isMine: true }
                : c
            ).sort((a, b) => new Date(b.lastMessageAt) - new Date(a.lastMessageAt))
          }
          // New conversation (e.g. from bonded user) — add it
          const bondedUser = bondedUsers.find((b) => b.id === activeChat)
          const newConvo = {
            partnerId: activeChat,
            username: partner?.username || bondedUser?.username || '',
            firstName: partner?.firstName || bondedUser?.firstName || '',
            lastName: partner?.lastName || bondedUser?.lastName || '',
            avatar: partner?.avatar || bondedUser?.avatar || null,
            lastMessage: data.message.content,
            lastMessageAt: data.message.createdAt,
            isMine: true,
            isRead: false,
            unreadCount: 0,
          }
          return [newConvo, ...prev]
        })
        // Remove from bonded users list (now has a conversation)
        setBondedUsers((prev) => prev.filter((b) => b.id !== activeChat))
        // Refresh conversations from server to stay in sync
        setTimeout(() => fetchConversations(false), 500)
      }
    } catch (err) {
      console.error('Failed to send message:', err)
    } finally {
      setSending(false)
    }
  }

  const openChat = (partnerId) => {
    setActiveChat(partnerId)
    router.replace(`/messages?chat=${partnerId}`, { scroll: false })
  }

  const closeChat = () => {
    setActiveChat(null)
    setPartner(null)
    setMessages([])
    router.replace('/messages', { scroll: false })
    // Refresh conversation list to show any new conversations
    fetchConversations(false)
  }

  const timeAgo = (dateStr) => {
    if (!dateStr) return ''
    const now = new Date()
    const date = new Date(dateStr)
    const mins = Math.floor((now - date) / 60000)
    if (mins < 1) return 'Just now'
    if (mins < 60) return `${mins}m`
    const hours = Math.floor(mins / 60)
    if (hours < 24) return `${hours}h`
    const days = Math.floor(hours / 24)
    if (days < 7) return `${days}d`
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

  const getAvatarColor = (name = 'U') => {
    const colors = [
      'from-blue-500 to-cyan-500',
      'from-purple-500 to-pink-500',
      'from-green-500 to-emerald-500',
      'from-orange-500 to-amber-500',
      'from-red-500 to-rose-500',
      'from-indigo-500 to-violet-500',
    ]
    let hash = 0
    for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash)
    return colors[Math.abs(hash) % colors.length]
  }

  const filteredConversations = conversations.filter((c) => {
    if (!searchQuery) return true
    const fullName = `${c.firstName} ${c.lastName}`.toLowerCase()
    return fullName.includes(searchQuery.toLowerCase()) || c.username?.toLowerCase().includes(searchQuery.toLowerCase())
  })

  const filteredBondedUsers = bondedUsers.filter((b) => {
    if (!searchQuery) return true
    const fullName = `${b.firstName} ${b.lastName}`.toLowerCase()
    return fullName.includes(searchQuery.toLowerCase()) || b.username?.toLowerCase().includes(searchQuery.toLowerCase())
  })

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-primary-400 animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen pb-8">
      <div className="max-w-5xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-bold text-white flex items-center gap-3">
              <MessageCircle className="w-8 h-8 text-primary-400" />
              Messages
            </h1>
          </div>

          <div className="glass-card rounded-2xl overflow-hidden" style={{ height: 'calc(100vh - 200px)' }}>
            <div className="flex h-full">
              {/* Conversation List — hidden on mobile when chat is open */}
              <div className={`w-full sm:w-80 border-r border-white/10 flex flex-col ${activeChat ? 'hidden sm:flex' : 'flex'}`}>
                {/* Search */}
                <div className="p-4 border-b border-white/10">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search conversations..."
                      className="w-full pl-10 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 text-sm focus:outline-none focus:border-primary-500 transition-colors"
                    />
                  </div>
                </div>

                {/* Conversation list */}
                <div className="flex-1 overflow-y-auto">
                  {loadingConvos ? (
                    <div className="flex items-center justify-center py-12">
                      <Loader2 className="w-6 h-6 text-primary-400 animate-spin" />
                    </div>
                  ) : (
                    <>
                      {/* Existing conversations */}
                      {filteredConversations.length === 0 && filteredBondedUsers.length === 0 ? (
                        <div className="text-center py-12 px-6">
                          <MessageCircle className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                          <p className="text-gray-400 text-sm">
                            No conversations yet. Bond with someone to start messaging!
                          </p>
                        </div>
                      ) : (
                        <>
                          {/* Conversations with messages */}
                          {filteredConversations.length > 0 && (
                            <div className="px-4 py-2 border-b border-white/10">
                              <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
                                Conversations
                              </p>
                            </div>
                          )}
                          {filteredConversations.map((c) => {
                            const fullName = `${c.firstName || ''} ${c.lastName || ''}`.trim() || c.username
                            const isActive = activeChat === c.partnerId
                            return (
                              <button
                                key={c.partnerId}
                                onClick={() => openChat(c.partnerId)}
                                className={`w-full flex items-center gap-3 p-4 text-left transition-all duration-200 border-b border-white/5 ${
                                  isActive
                                    ? 'bg-primary-500/10 border-l-2 border-l-primary-500'
                                    : 'hover:bg-white/5'
                                }`}
                              >
                                {c.avatar ? (
                                  <div className="w-11 h-11 rounded-full overflow-hidden shrink-0">
                                    <img src={c.avatar} alt="" className="w-full h-full object-cover" />
                                  </div>
                                ) : (
                                  <div className={`w-11 h-11 rounded-full bg-gradient-to-br ${getAvatarColor(fullName)} flex items-center justify-center shrink-0`}>
                                    <span className="text-white text-sm font-bold">
                                      {c.firstName?.[0] || ''}{c.lastName?.[0] || 'U'}
                                    </span>
                                  </div>
                                )}
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center justify-between">
                                    <p className="text-white font-medium text-sm truncate">{fullName}</p>
                                    <span className="text-gray-500 text-xs shrink-0 ml-2">{timeAgo(c.lastMessageAt)}</span>
                                  </div>
                                  <p className="text-gray-400 text-xs truncate mt-0.5">
                                    {c.isMine ? 'You: ' : ''}{c.lastMessage}
                                  </p>
                                </div>
                                {c.unreadCount > 0 && (
                                  <span className="w-5 h-5 bg-primary-500 rounded-full flex items-center justify-center shrink-0">
                                    <span className="text-white text-[10px] font-bold">{c.unreadCount}</span>
                                  </span>
                                )}
                              </button>
                            )
                          })}

                          {/* Bonded users without conversations — shown as list items */}
                          {filteredBondedUsers.length > 0 && (
                            <>
                              <div className="px-4 py-2 border-b border-white/10">
                                <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-1.5">
                                  <Link2 className="w-3 h-3 text-cyan-400" />
                                  My Bonds — Tap to message
                                </p>
                              </div>
                              {filteredBondedUsers.map((b) => {
                                const fullName = `${b.firstName || ''} ${b.lastName || ''}`.trim() || b.username
                                const isActive = activeChat === b.id
                                return (
                                  <button
                                    key={b.id}
                                    onClick={() => openChat(b.id)}
                                    className={`w-full flex items-center gap-3 p-4 text-left transition-all duration-200 border-b border-white/5 ${
                                      isActive
                                        ? 'bg-primary-500/10 border-l-2 border-l-primary-500'
                                        : 'hover:bg-white/5'
                                    }`}
                                  >
                                    {b.avatar ? (
                                      <div className="w-11 h-11 rounded-full overflow-hidden shrink-0">
                                        <img src={b.avatar} alt="" className="w-full h-full object-cover" />
                                      </div>
                                    ) : (
                                      <div className={`w-11 h-11 rounded-full bg-gradient-to-br ${getAvatarColor(fullName)} flex items-center justify-center shrink-0`}>
                                        <span className="text-white text-sm font-bold">
                                          {b.firstName?.[0] || ''}{b.lastName?.[0] || 'U'}
                                        </span>
                                      </div>
                                    )}
                                    <div className="flex-1 min-w-0">
                                      <p className="text-white font-medium text-sm truncate">{fullName}</p>
                                      <p className="text-gray-500 text-xs mt-0.5 flex items-center gap-1">
                                        <Link2 className="w-3 h-3 text-cyan-400" />
                                        <span className="text-cyan-400/70">Bonded</span>
                                        <span className="text-gray-600">· Tap to message</span>
                                      </p>
                                    </div>
                                    <Send className="w-4 h-4 text-gray-600 shrink-0" />
                                  </button>
                                )
                              })}
                            </>
                          )}
                        </>
                      )}
                    </>
                  )}
                </div>
              </div>

              {/* Chat Area */}
              <div className={`flex-1 flex flex-col ${activeChat ? 'flex' : 'hidden sm:flex'}`}>
                {activeChat ? (
                  <>
                    {/* Chat Header */}
                    <div className="flex items-center gap-3 p-4 border-b border-white/10">
                      <button onClick={closeChat} className="sm:hidden text-gray-400 hover:text-white">
                        <ArrowLeft className="w-5 h-5" />
                      </button>
                      {partner && (
                        <Link href={`/profile/${partner.id}`} className="flex items-center gap-3 group">
                          {partner.avatar ? (
                            <div className="w-10 h-10 rounded-full overflow-hidden">
                              <img src={partner.avatar} alt="" className="w-full h-full object-cover" />
                            </div>
                          ) : (
                            <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${getAvatarColor(`${partner.firstName} ${partner.lastName}`)} flex items-center justify-center`}>
                              <span className="text-white text-sm font-bold">
                                {partner.firstName?.[0] || ''}{partner.lastName?.[0] || 'U'}
                              </span>
                            </div>
                          )}
                          <div>
                            <p className="text-white font-medium text-sm group-hover:text-primary-400 transition-colors">
                              {partner.firstName} {partner.lastName}
                            </p>
                            <p className="text-gray-500 text-xs">@{partner.username}</p>
                          </div>
                        </Link>
                      )}
                    </div>

                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4">
                      {loadingMessages ? (
                        <div className="flex items-center justify-center py-12">
                          <Loader2 className="w-6 h-6 text-primary-400 animate-spin" />
                        </div>
                      ) : messages.length === 0 ? (
                        <div className="text-center py-12">
                          <MessageCircle className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                          <p className="text-gray-400 text-sm">No messages yet. Say hello!</p>
                        </div>
                      ) : (
                        messages.map((msg, idx) => {
                          const prevMsg = messages[idx - 1]
                          const sameSenderAsPrev = prevMsg && prevMsg.isMine === msg.isMine
                          const showAvatar = !msg.isMine && !sameSenderAsPrev

                          return (
                            <motion.div
                              key={msg.id}
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              className={`flex items-end gap-2 ${msg.isMine ? 'justify-end' : 'justify-start'} ${sameSenderAsPrev ? 'mt-0.5' : 'mt-3'}`}
                            >
                              {/* Partner avatar */}
                              {!msg.isMine && (
                                <div className="w-7 h-7 shrink-0">
                                  {showAvatar && partner ? (
                                    partner.avatar ? (
                                      <img src={partner.avatar} alt="" className="w-7 h-7 rounded-full object-cover" />
                                    ) : (
                                      <div className={`w-7 h-7 rounded-full bg-gradient-to-br ${getAvatarColor(`${partner.firstName} ${partner.lastName}`)} flex items-center justify-center`}>
                                        <span className="text-white text-[10px] font-bold">
                                          {partner.firstName?.[0] || ''}{partner.lastName?.[0] || 'U'}
                                        </span>
                                      </div>
                                    )
                                  ) : null}
                                </div>
                              )}

                              <div className={`max-w-[70%]`}>
                                <div
                                  className={`px-3.5 py-2 text-sm leading-relaxed ${
                                    msg.isMine
                                      ? `bg-gradient-to-br from-primary-500 to-primary-600 text-white ${sameSenderAsPrev ? 'rounded-2xl rounded-tr-md' : 'rounded-2xl rounded-br-md'}`
                                      : `bg-white/10 text-gray-200 ${sameSenderAsPrev ? 'rounded-2xl rounded-tl-md' : 'rounded-2xl rounded-bl-md'}`
                                  }`}
                                >
                                  {msg.content}
                                </div>
                                {/* Time + read status */}
                                <div className={`flex items-center gap-1 mt-0.5 ${msg.isMine ? 'justify-end' : 'justify-start'}`}>
                                  <span className="text-[10px] text-gray-500">{timeAgo(msg.createdAt)}</span>
                                  {msg.isMine && (
                                    <span className={`text-[10px] ${msg.isRead ? 'text-primary-400' : 'text-gray-500'}`}>
                                      {msg.isRead ? '✓✓' : '✓'}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </motion.div>
                          )
                        })
                      )}
                      <div ref={messagesEndRef} />
                    </div>

                    {/* Message Input */}
                    <form onSubmit={handleSend} className="p-4 border-t border-white/10">
                      <div className="flex items-center gap-3">
                        <input
                          type="text"
                          value={newMessage}
                          onChange={(e) => setNewMessage(e.target.value)}
                          placeholder="Type a message..."
                          className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder-gray-500 text-sm focus:outline-none focus:border-primary-500 transition-colors"
                          maxLength={2000}
                        />
                        <motion.button
                          type="submit"
                          whileTap={{ scale: 0.9 }}
                          disabled={!newMessage.trim() || sending}
                          className="p-2.5 bg-primary-500 hover:bg-primary-600 text-white rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                          {sending ? (
                            <Loader2 className="w-5 h-5 animate-spin" />
                          ) : (
                            <Send className="w-5 h-5" />
                          )}
                        </motion.button>
                      </div>
                    </form>
                  </>
                ) : (
                  /* No chat selected */
                  <div className="flex-1 flex items-center justify-center">
                    <div className="text-center">
                      <MessageCircle className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                      <h3 className="text-xl font-semibold text-white mb-2">Your Messages</h3>
                      <p className="text-gray-400 text-sm max-w-xs">
                        Select a conversation or start a new one from a student&apos;s profile
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

export default function MessagesPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-dark-950 flex items-center justify-center"><Loader2 className="w-8 h-8 text-primary-400 animate-spin" /></div>}>
      <MessagesContent />
    </Suspense>
  )
}
