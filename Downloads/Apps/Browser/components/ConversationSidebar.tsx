"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  Search,
  Calendar,
  Trash2,
  Filter,
  TrendingUp,
  Clock,
  Zap,
} from "lucide-react";

interface Conversation {
  id: string;
  query: string;
  timestamp: Date;
  resultCount?: number;
  type?: "research" | "search" | "timemachine";
}

interface ConversationSidebarProps {
  onSelectConversation: (conversationId: string) => void;
  currentConversationId?: string;
}

export default function ConversationSidebar({
  onSelectConversation,
  currentConversationId,
}: ConversationSidebarProps) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [filter, setFilter] = useState<"all" | "today" | "week" | "month">(
    "all",
  );
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    // Load conversations from localStorage
    const saved = localStorage.getItem("searchHistory");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        const convos: Conversation[] = parsed.map((item: any) => ({
          ...item,
          timestamp: new Date(item.timestamp),
        }));
        setConversations(convos);
      } catch (e) {
        console.error("Failed to parse search history:", e);
      }
    }
  }, []);

  const filteredConversations = useMemo(() => {
    let filtered = conversations;

    // Apply time filter
    const now = new Date();
    const startOfDay = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
    );
    const startOfWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const startOfMonth = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    switch (filter) {
      case "today":
        filtered = filtered.filter((c) => c.timestamp >= startOfDay);
        break;
      case "week":
        filtered = filtered.filter((c) => c.timestamp >= startOfWeek);
        break;
      case "month":
        filtered = filtered.filter((c) => c.timestamp >= startOfMonth);
        break;
    }

    // Apply search filter
    if (searchTerm.trim()) {
      filtered = filtered.filter((c) =>
        c.query.toLowerCase().includes(searchTerm.toLowerCase()),
      );
    }

    return filtered;
  }, [conversations, filter, searchTerm]);

  const deleteConversation = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = conversations.filter((c) => c.id !== id);
    setConversations(updated);
    localStorage.setItem("searchHistory", JSON.stringify(updated));
  };

  const clearAll = () => {
    if (confirm("Are you sure you want to clear all search history?")) {
      setConversations([]);
      localStorage.removeItem("searchHistory");
    }
  };

  const getTypeIcon = (type?: string) => {
    switch (type) {
      case "research":
        return <TrendingUp className="w-3.5 h-3.5" />;
      case "timemachine":
        return <Clock className="w-3.5 h-3.5" />;
      default:
        return <Search className="w-3.5 h-3.5" />;
    }
  };

  const getTypeLabel = (type?: string) => {
    switch (type) {
      case "research":
        return "Research";
      case "timemachine":
        return "Time Machine";
      default:
        return "Search";
    }
  };

  const getTypeBadgeStyles = (type?: string) => {
    switch (type) {
      case "research":
        return "bg-gradient-to-r from-purple-500/20 to-pink-500/20 text-purple-600 dark:text-purple-400 border-purple-500/30";
      case "timemachine":
        return "bg-gradient-to-r from-blue-500/20 to-cyan-500/20 text-blue-600 dark:text-blue-400 border-blue-500/30";
      default:
        return "bg-gradient-to-r from-gray-500/20 to-gray-600/20 text-gray-600 dark:text-gray-400 border-gray-500/30";
    }
  };

  const formatDate = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return "Just now";
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;

    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  const stats = useMemo(() => {
    const now = new Date();
    const startOfDay = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
    );
    const startOfWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    return {
      total: conversations.length,
      today: conversations.filter((c) => c.timestamp >= startOfDay).length,
      week: conversations.filter((c) => c.timestamp >= startOfWeek).length,
    };
  }, [conversations]);

  return (
    <div className="flex flex-col h-full bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 border-r border-gray-200 dark:border-gray-700">
      {/* Header with gradient */}
      <div className="relative overflow-hidden bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 p-6 shadow-lg">
        <div className="absolute inset-0 bg-white/10 dark:bg-black/10"></div>
        <div className="relative">
          <div className="flex items-center gap-2 mb-4">
            <div className="p-2 bg-white/20 dark:bg-white/10 rounded-lg backdrop-blur-sm">
              <Clock className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-xl font-bold text-white">Search History</h2>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-3 gap-2">
            <div className="bg-white/10 dark:bg-white/5 backdrop-blur-sm rounded-lg p-2.5 border border-white/20">
              <div className="text-lg font-bold text-white">{stats.total}</div>
              <div className="text-xs text-white/80">Total</div>
            </div>
            <div className="bg-white/10 dark:bg-white/5 backdrop-blur-sm rounded-lg p-2.5 border border-white/20">
              <div className="text-lg font-bold text-white">{stats.today}</div>
              <div className="text-xs text-white/80">Today</div>
            </div>
            <div className="bg-white/10 dark:bg-white/5 backdrop-blur-sm rounded-lg p-2.5 border border-white/20">
              <div className="text-lg font-bold text-white">{stats.week}</div>
              <div className="text-xs text-white/80">Week</div>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="p-4 space-y-3 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        {/* Search Input */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search history..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm"
          />
        </div>

        {/* Filter Chips */}
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-gray-500" />
          <div className="flex gap-1.5 flex-1 overflow-x-auto">
            {(["all", "today", "week", "month"] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap ${
                  filter === f
                    ? "bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-md"
                    : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                }`}
              >
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Clear All Button */}
        {conversations.length > 0 && (
          <button
            onClick={clearAll}
            className="w-full py-2 px-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 transition-all text-sm font-medium flex items-center justify-center gap-2 border border-red-200 dark:border-red-800"
          >
            <Trash2 className="w-4 h-4" />
            Clear All History
          </button>
        )}
      </div>

      {/* Conversations List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2.5">
        {filteredConversations.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 rounded-2xl flex items-center justify-center">
              <Search className="w-8 h-8 text-gray-400" />
            </div>
            <p className="text-gray-500 dark:text-gray-400 text-sm">
              {searchTerm ? "No matches found" : "No search history yet"}
            </p>
            <p className="text-gray-400 dark:text-gray-500 text-xs mt-1">
              {searchTerm
                ? "Try a different search term"
                : "Start searching to build your history"}
            </p>
          </div>
        ) : (
          filteredConversations.map((conversation) => (
            <div
              key={conversation.id}
              onClick={() => onSelectConversation(conversation.id)}
              className={`group relative p-4 rounded-xl transition-all cursor-pointer border-2 ${
                currentConversationId === conversation.id
                  ? "bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-blue-900/20 dark:via-purple-900/20 dark:to-pink-900/20 border-blue-500/50 shadow-lg shadow-blue-500/10"
                  : "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:border-blue-400/50 dark:hover:border-blue-600/50 hover:shadow-md"
              }`}
            >
              {/* Type Badge */}
              <div
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium mb-2.5 border ${getTypeBadgeStyles(conversation.type)}`}
              >
                {getTypeIcon(conversation.type)}
                <span>{getTypeLabel(conversation.type)}</span>
              </div>

              {/* Query Text */}
              <p
                className={`text-sm font-medium mb-2 line-clamp-2 pr-6 ${
                  currentConversationId === conversation.id
                    ? "text-gray-900 dark:text-white"
                    : "text-gray-700 dark:text-gray-200"
                }`}
              >
                {conversation.query}
              </p>

              {/* Metadata */}
              <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
                <div className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>{formatDate(conversation.timestamp)}</span>
                </div>
                {conversation.resultCount !== undefined && (
                  <div className="flex items-center gap-1">
                    <Zap className="w-3.5 h-3.5" />
                    <span>{conversation.resultCount} results</span>
                  </div>
                )}
              </div>

              {/* Delete Button */}
              <button
                onClick={(e) => deleteConversation(conversation.id, e)}
                className="absolute top-3 right-3 p-1.5 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-100 dark:hover:bg-red-900/30"
                aria-label="Delete conversation"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>

              {/* Active Indicator */}
              {currentConversationId === conversation.id && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-12 bg-gradient-to-b from-blue-500 via-purple-500 to-pink-500 rounded-r-full"></div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
