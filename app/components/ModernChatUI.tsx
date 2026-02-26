"use client"

import React, { useState, useRef, useEffect } from "react"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"

interface Message {
  role: "user" | "assistant"
  content: string
}

export default function ModernChatUI() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const [isPaused, setIsPaused] = useState(false)

  const fullTextRef = useRef("")
  const currentIndexRef = useRef(0)
  const typingIntervalRef = useRef<NodeJS.Timeout | null>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const sendMessage = async () => {
    if (!input.trim() || loading) return

    const userMessage: Message = { role: "user", content: input }
    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setLoading(true)

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: input }),
      })

      const data = await res.json()

      const botMessage: Message = {
        role: "assistant",
        content: data.reply || "No response",
      }

      setMessages((prev) => [...prev, botMessage])
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Error connecting to server." },
      ])
    }

    setLoading(false)
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  return (
    <div className="flex flex-col h-screen h-[100dvh] bg-mesh-gradient animate-mesh-pan text-neutral-800 font-sans selection:bg-purple-300 selection:text-purple-900">
      <header className="py-6 px-8 flex items-center justify-between bg-white/40 backdrop-blur-md border-b border-white/30 sticky top-0 z-10 shadow-sm">
        <div className="flex items-center gap-3 animate-fade-in-down">
          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-purple-500 to-pink-500 flex items-center justify-center shadow-lg shadow-purple-500/30">
            <span className="text-white font-bold text-xl leading-none">G</span>
          </div>
          <div>
            <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-900 to-pink-800">
              Gemini Interface
            </h1>
            <p className="text-xs text-purple-900/60 font-medium">Powering your ideas</p>
          </div>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8 space-y-6 max-w-5xl mx-auto w-full scrollbar-thin scrollbar-thumb-purple-500/20 scrollbar-track-transparent">
        {messages.length === 0 && !loading && (
          <div className="h-full flex flex-col items-center justify-center text-center opacity-70 animate-fade-in">
            <div className="w-24 h-24 mb-6 rounded-3xl bg-white/50 backdrop-blur-xl border border-white/60 shadow-xl flex items-center justify-center transform rotate-12 hover:rotate-0 transition-all duration-500">
              <span className="text-5xl drop-shadow-md">✨</span>
            </div>
            <h2 className="text-2xl font-semibold text-purple-950 mb-2">How can I help you today?</h2>
            <p className="text-purple-900/70 max-w-md">I can generate code, write essays, format tables, and much more.</p>
          </div>
        )}

        {messages.map((msg, index) => (
          <div
            key={index}
            className={`flex w-full ${msg.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[90%] md:max-w-[80%] rounded-3xl p-5 sm:p-6 shadow-xl backdrop-blur-md transition-all duration-300 ease-out message-entrance ${msg.role === "user"
                ? "bg-purple-600 text-white rounded-br-sm border border-purple-500/50"
                : "bg-white/70 text-neutral-800 rounded-bl-sm border border-white/60"
                }`}
            >
              <div className={`prose prose-sm sm:prose-base max-w-none ${msg.role === "user" ? "prose-invert prose-p:text-white prose-headings:text-white" : "prose-purple"}`}>
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  components={{
                    h1: ({ node, ...props }: any) => <h1 className="text-2xl font-bold mb-4 mt-6 first:mt-0 tracking-tight" {...props} />,
                    h2: ({ node, ...props }: any) => <h2 className="text-xl font-bold mb-3 mt-5 tracking-tight border-b border-purple-200 pb-2" {...props} />,
                    h3: ({ node, ...props }: any) => <h3 className="text-lg font-semibold mb-2 mt-4" {...props} />,
                    p: ({ node, ...props }: any) => <p className="mb-4 last:mb-0 leading-relaxed" {...props} />,
                    ul: ({ node, ...props }: any) => <ul className="list-disc pl-6 mb-4 space-y-1 marker:text-purple-500" {...props} />,
                    ol: ({ node, ...props }: any) => <ol className="list-decimal pl-6 mb-4 space-y-1 marker:text-purple-500 font-medium" {...props} />,
                    li: ({ node, ...props }: any) => <li className="pl-1" {...props} />,
                    blockquote: ({ node, ...props }: any) => <blockquote className="border-l-4 border-purple-400 pl-4 py-1 mb-4 italic text-neutral-600 bg-purple-50/50 rounded-r-lg" {...props} />,
                    a: ({ node, ...props }: any) => <a className="text-purple-600 hover:text-purple-800 underline decoration-purple-300 underline-offset-2 transition-colors duration-200" target="_blank" rel="noopener noreferrer" {...props} />,
                    table: ({ node, ...props }: any) => (
                      <div className="overflow-x-auto mb-6 rounded-xl border border-purple-100 shadow-sm">
                        <table className="w-full text-left border-collapse bg-white/50" {...props} />
                      </div>
                    ),
                    th: ({ node, ...props }: any) => <th className="bg-purple-100/80 px-4 py-3 font-semibold text-purple-900 border-b border-purple-200" {...props} />,
                    td: ({ node, ...props }: any) => <td className="px-4 py-3 border-b border-purple-100 last:border-0" {...props} />,
                    code({ inline, className, children, ...props }: any) {
                      const match = /language-(\w+)/.exec(className || "")
                      const language = match ? match[1] : ""
                      const isInline = inline || !match

                      if (isInline) {
                        return (
                          <code className={`px-1.5 py-0.5 rounded-md font-mono text-sm ${msg.role === "user" ? "bg-purple-700/50 text-purple-100" : "bg-purple-100 text-purple-900 font-semibold"}`} {...props}>
                            {children}
                          </code>
                        )
                      }

                      const codeString = String(children).replace(/\n$/, "")

                      return (
                        <div className="relative group my-6 overflow-hidden rounded-xl border border-neutral-800/20 bg-[#1e1e2e] shadow-2xl">
                          <div className="flex items-center justify-between px-4 py-2 bg-[#181825] border-b border-neutral-700/50">
                            <span className="text-xs font-mono text-neutral-400 capitalize">{language || "code"}</span>
                            <button
                              onClick={() => {
                                copyToClipboard(codeString);
                                const btn = document.getElementById(`copy-btn-${codeString.substring(0, 10)}`);
                                if (btn) {
                                  btn.innerText = "Copied!";
                                  setTimeout(() => btn.innerText = "Copy", 2000);
                                }
                              }}
                              id={`copy-btn-${codeString.substring(0, 10)}`}
                              className="text-xs px-2.5 py-1 rounded bg-[#313244] text-neutral-300 hover:bg-[#45475a] hover:text-white transition-all opacity-0 group-hover:opacity-100 focus:opacity-100"
                            >
                              Copy
                            </button>
                          </div>
                          <div className="p-4 overflow-x-auto text-sm font-mono text-[#cdd6f4] leading-relaxed">
                            <pre className="!m-0 !p-0 bg-transparent">
                              <code {...props}>{children}</code>
                            </pre>
                          </div>
                        </div>
                      )
                    },
                  }}
                >
                  {msg.content}
                </ReactMarkdown>
              </div>
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className="bg-white/70 backdrop-blur-md rounded-3xl rounded-bl-sm border border-white/60 p-5 shadow-xl w-32">
              <div className="flex space-x-2 items-center justify-center py-1">
                <div className="w-2.5 h-2.5 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></div>
                <div className="w-2.5 h-2.5 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></div>
                <div className="w-2.5 h-2.5 bg-pink-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 sm:p-6 bg-white/40 backdrop-blur-xl border-t border-white/40">
        <div className="max-w-5xl mx-auto flex items-end gap-3 relative">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault()
                sendMessage()
              }
            }}
            className="flex-1 min-h-[56px] max-h-40 overflow-y-auto bg-white/80 border border-purple-100 p-4 rounded-2xl placeholder-neutral-400 text-neutral-800 focus:outline-none focus:ring-2 focus:ring-purple-400/50 focus:border-purple-400 shadow-inner resize-none transition-all duration-300"
            placeholder="Type your message here... (Shift+Enter for new line)"
            rows={1}
          />
          <button
            onClick={sendMessage}
            disabled={!input.trim() || loading}
            className="h-14 w-14 shrink-0 bg-gradient-to-br from-purple-600 to-pink-500 text-white rounded-2xl flex items-center justify-center hover:shadow-lg hover:shadow-purple-500/40 hover:-translate-y-1 transition-all duration-300 disabled:opacity-50 disabled:hover:translate-y-0 shadow-md group border border-white/20"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="w-6 h-6 group-hover:scale-110 transition-transform duration-300"
            >
              <path d="M3.478 2.404a.75.75 0 00-.926.941l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.404z" />
            </svg>
          </button>
        </div>
      </div>

      {/* Decorative blurred blobs behind everything */}
      <div className="fixed top-20 -left-20 w-72 h-72 bg-purple-400 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob pointer-events-none -z-10"></div>
      <div className="fixed top-40 -right-20 w-72 h-72 bg-pink-400 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000 pointer-events-none -z-10"></div>
      <div className="fixed -bottom-32 left-1/3 w-80 h-80 bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000 pointer-events-none -z-10"></div>
    </div>
  )
}
