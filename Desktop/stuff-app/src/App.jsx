import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import {
  Plus, Inbox, Calendar, CheckCircle2, List, Tag, Circle, ChevronRight,
  Star, Trash2, Clock, Repeat, Bell, X, StickyNote, Search,
  Settings, BarChart3, Target, Zap, TrendingUp, AlertCircle
} from "lucide-react";
import { DateTimePicker } from "./components/DateTimePicker";
import { parseNaturalLanguageDate } from "./utils/dateParser";

const DURATION_OPTIONS = [
  { value: "15m", label: "15m", minutes: 15 },
  { value: "30m", label: "30m", minutes: 30 },
  { value: "1h", label: "1h", minutes: 60 },
  { value: "2h", label: "2h", minutes: 120 },
  { value: "4h", label: "4h", minutes: 240 },
  { value: "8h", label: "8h", minutes: 480 },
];

const StuffApp = () => {
  // Core state
  const [tasks, setTasks] = useState(() => {
    const saved = localStorage.getItem("stuff-app-tasks");
    return saved ? JSON.parse(saved) : [];
  });
  
  const [projects, setProjects] = useState(() => {
    const saved = localStorage.getItem("stuff-app-projects");
    return saved ? JSON.parse(saved) : [];
  });
  
  const [tags, setTags] = useState(() => {
    const saved = localStorage.getItem("stuff-app-tags");
    return saved ? JSON.parse(saved) : [];
  });

  const [selectedView, setSelectedView] = useState(() => {
    const saved = localStorage.getItem("stuff-app-selectedView");
    return saved || "inbox";
  });

  const [selectedProject, setSelectedProject] = useState(() => {
    const saved = localStorage.getItem("stuff-app-selectedProject");
    return saved ? JSON.parse(saved) : null;
  });

  const [focusTasks, setFocusTasks] = useState(() => {
    const saved = localStorage.getItem("stuff-app-focusTasks");
    return saved ? JSON.parse(saved) : [];
  });

  // UI state
  const [newTaskInput, setNewTaskInput] = useState("");
  const [showNewProjectInput, setShowNewProjectInput] = useState(false);
  const [newProjectName, setNewProjectName] = useState("");
  const [selectedTask, setSelectedTask] = useState(null);
  const [showTaskDetail, setShowTaskDetail] = useState(false);
  const [showTagPanel, setShowTagPanel] = useState(false);
  const [newTagName, setNewTagName] = useState("");
  const [showQuickFind, setShowQuickFind] = useState(false);
  const [quickFindSearch, setQuickFindSearch] = useState("");
  const [showAppSettings, setShowAppSettings] = useState(false);
  const [showDailyPlanning, setShowDailyPlanning] = useState(false);
  const [selectedPlanningTasks, setSelectedPlanningTasks] = useState([]);
  const [showAutoScheduleSuggestions, setShowAutoScheduleSuggestions] = useState(true);
  const [newlyAddedTaskId, setNewlyAddedTaskId] = useState(null);
  const [completingTaskIds, setCompletingTaskIds] = useState([]);
  
  // Settings
  const [selectedTheme, setSelectedTheme] = useState(() => {
    const saved = localStorage.getItem("stuff-app-theme");
    return saved || "none";
  });
  
  const [defaultView, setDefaultView] = useState(() => {
    const saved = localStorage.getItem("stuff-app-defaultView");
    return saved || "inbox";
  });
  
  const [completionSound, setCompletionSound] = useState(() => {
    const saved = localStorage.getItem("stuff-app-completionSound");
    return saved === "true";
  });
  
  const [showConfirmDialogs, setShowConfirmDialogs] = useState(() => {
    const saved = localStorage.getItem("stuff-app-showConfirmDialogs");
    return saved !== "false";
  });
  
  const [showTaskCounts, setShowTaskCounts] = useState(() => {
    const saved = localStorage.getItem("stuff-app-showTaskCounts");
    return saved !== "false";
  });
  
  const [timeFormat, setTimeFormat] = useState(() => {
    const saved = localStorage.getItem("stuff-app-timeFormat");
    return saved || "12";
  });

  const inputRef = useRef(null);

  // Persistence
  useEffect(() => localStorage.setItem("stuff-app-tasks", JSON.stringify(tasks)), [tasks]);
  useEffect(() => localStorage.setItem("stuff-app-projects", JSON.stringify(projects)), [projects]);
  useEffect(() => localStorage.setItem("stuff-app-tags", JSON.stringify(tags)), [tags]);
  useEffect(() => localStorage.setItem("stuff-app-selectedView", selectedView), [selectedView]);
  useEffect(() => localStorage.setItem("stuff-app-selectedProject", JSON.stringify(selectedProject)), [selectedProject]);
  useEffect(() => localStorage.setItem("stuff-app-focusTasks", JSON.stringify(focusTasks)), [focusTasks]);
  useEffect(() => localStorage.setItem("stuff-app-theme", selectedTheme), [selectedTheme]);
  useEffect(() => localStorage.setItem("stuff-app-defaultView", defaultView), [defaultView]);
  useEffect(() => localStorage.setItem("stuff-app-completionSound", completionSound.toString()), [completionSound]);
  useEffect(() => localStorage.setItem("stuff-app-showConfirmDialogs", showConfirmDialogs.toString()), [showConfirmDialogs]);
  useEffect(() => localStorage.setItem("stuff-app-showTaskCounts", showTaskCounts.toString()), [showTaskCounts]);
  useEffect(() => localStorage.setItem("stuff-app-timeFormat", timeFormat), [timeFormat]);

  // Daily Planning Ritual
  useEffect(() => {
    const lastPlanningDate = localStorage.getItem("stuff-app-lastPlanningDate");
    const today = new Date().toDateString();
    
    if (lastPlanningDate !== today && tasks.filter(t => !t.completed).length > 0) {
      setTimeout(() => setShowDailyPlanning(true), 500);
    }
  }, []);

  const completeDailyPlanning = () => {
    if (selectedPlanningTasks.length === 0) {
      alert("Please select at least one task for today");
      return;
    }
    
    // Move selected tasks to today
    setTasks(prev => prev.map(t => 
      selectedPlanningTasks.includes(t.id) ? { ...t, when: "today" } : t
    ));
    
    localStorage.setItem("stuff-app-lastPlanningDate", new Date().toDateString());
    setShowDailyPlanning(false);
    setSelectedPlanningTasks([]);
    setSelectedView("today");
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.shiftKey && e.key === "N" && !e.metaKey && !e.ctrlKey && 
          document.activeElement.tagName !== "INPUT" && 
          document.activeElement.tagName !== "TEXTAREA") {
        e.preventDefault();
        inputRef.current?.focus();
      }
      
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setShowQuickFind(true);
      }
      
      if (e.key === "Escape") {
        if (showQuickFind) setShowQuickFind(false);
        else if (showTaskDetail) {
          setShowTaskDetail(false);
          setSelectedTask(null);
        }
      }
      
      if (e.key >= "1" && e.key <= "5" && !e.metaKey && !e.ctrlKey && 
          !showQuickFind && document.activeElement.tagName !== "INPUT" && 
          document.activeElement.tagName !== "TEXTAREA") {
        const views = ["inbox", "today", "upcoming", "anytime", "dashboard"];
        const index = parseInt(e.key) - 1;
        if (views[index]) {
          setSelectedView(views[index]);
          setSelectedProject(null);
        }
      }
    };
    
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [showTaskDetail, showQuickFind]);

  // Task operations
  const addTask = (taskData = {}) => {
    if (!newTaskInput.trim() && !taskData.title) return;

    const parsed = parseNaturalLanguageDate(newTaskInput);
    let cleanTitle = newTaskInput;
    let deadline = taskData.deadline || null;

    if (parsed && !taskData.deadline) {
      cleanTitle = newTaskInput.replace(new RegExp(parsed.matchedText, "i"), "").trim();
      deadline = parsed.date.toISOString();
    }

    const newTask = {
      id: Date.now(),
      title: taskData.title || cleanTitle,
      notes: taskData.notes || "",
      completed: false,
      priority: taskData.priority || null,
      when: taskData.when || (selectedView === "today" ? "today" : selectedView === "upcoming" ? "upcoming" : null),
      projectId: taskData.projectId || (selectedView === "project" ? selectedProject : null),
      tags: taskData.tags || [],
      checklist: taskData.checklist || [],
      deadline: deadline,
      reminder: taskData.reminder || null,
      recurring: taskData.recurring || null,
      estimatedDuration: taskData.estimatedDuration || null,
      reminderShown: false,
      order: tasks.length,
      createdAt: new Date().toISOString(),
    };
    
    setTasks([...tasks, newTask]);
    setNewTaskInput("");
    setNewlyAddedTaskId(newTask.id);
    setTimeout(() => setNewlyAddedTaskId(null), 300);
  };

  const updateTask = useCallback((taskId, updates) => {
    setTasks(prevTasks => prevTasks.map(task => 
      task.id === taskId ? { ...task, ...updates } : task
    ));
    if (selectedTask?.id === taskId) {
      setSelectedTask(prev => ({ ...prev, ...updates }));
    }
  }, [selectedTask]);

  const toggleTaskComplete = useCallback((taskId) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    if (!task.completed) {
      if (completionSound) {
        const audio = new Audio("data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBTGH0fPTgjMGHm7A7+OZURE=");
        audio.volume = 0.3;
        audio.play().catch(() => {});
      }
      
      setCompletingTaskIds(prev => [...prev, taskId]);
      
      setTimeout(() => {
        if (task.recurring) {
          const newTask = createRecurringTask(task);
          setTasks(prev => [
            ...prev.map(t => t.id === taskId ? { ...t, completed: true, completedAt: new Date().toISOString() } : t),
            newTask
          ]);
        } else {
          setTasks(prev => prev.map(t => 
            t.id === taskId ? { ...t, completed: true, completedAt: new Date().toISOString() } : t
          ));
        }
        setCompletingTaskIds(prev => prev.filter(id => id !== taskId));
      }, 600);
    } else {
      setTasks(prev => prev.map(t => 
        t.id === taskId ? { ...t, completed: false, completedAt: null } : t
      ));
    }
  }, [tasks, completionSound]);

  const createRecurringTask = (task) => {
    let newDeadline = null;
    if (task.deadline) {
      const deadlineDate = new Date(task.deadline);
      switch (task.recurring) {
        case "daily": deadlineDate.setDate(deadlineDate.getDate() + 1); break;
        case "weekly": deadlineDate.setDate(deadlineDate.getDate() + 7); break;
        case "monthly": deadlineDate.setMonth(deadlineDate.getMonth() + 1); break;
        case "yearly": deadlineDate.setFullYear(deadlineDate.getFullYear() + 1); break;
      }
      newDeadline = deadlineDate.toISOString();
    }
    
    return {
      ...task,
      id: Date.now(),
      completed: false,
      deadline: newDeadline,
      reminder: null,
      reminderShown: false,
      completedAt: null,
      order: tasks.length,
      createdAt: new Date().toISOString(),
    };
  };

  const deleteTask = useCallback((taskId) => {
    setTasks(prevTasks => prevTasks.filter(task => task.id !== taskId));
    if (selectedTask?.id === taskId) {
      setShowTaskDetail(false);
      setSelectedTask(null);
    }
  }, [selectedTask]);

  // Project operations
  const addProject = () => {
    if (!newProjectName.trim()) return;
    const newProject = {
      id: Date.now(),
      name: newProjectName,
      color: "#007AFF",
      emoji: null,
    };
    setProjects([...projects, newProject]);
    setNewProjectName("");
    setShowNewProjectInput(false);
  };

  const deleteProject = (projectId) => {
    setProjects(projects.filter(p => p.id !== projectId));
    setTasks(tasks.map(task => 
      task.projectId === projectId ? { ...task, projectId: null } : task
    ));
    if (selectedProject === projectId) {
      setSelectedView("inbox");
      setSelectedProject(null);
    }
  };

  const updateProject = useCallback((projectId, updates) => {
    setProjects(projects.map(p => p.id === projectId ? { ...p, ...updates } : p));
  }, [projects]);

  // Tag operations
  const addTag = () => {
    if (!newTagName.trim()) return;
    if (tags.find(t => t.name.toLowerCase() === newTagName.toLowerCase())) {
      setNewTagName("");
      return;
    }
    
    const colors = ["#FF3B30", "#FF9500", "#FFCC00", "#34C759", "#00C7BE", "#30B0C7", "#007AFF", "#5856D6", "#AF52DE", "#FF2D55"];
    const newTag = {
      id: Date.now(),
      name: newTagName,
      color: colors[Math.floor(Math.random() * colors.length)],
    };
    setTags([...tags, newTag]);
    setNewTagName("");
  };

  const deleteTag = (tagId) => {
    const tagToDelete = tags.find(t => t.id === tagId);
    if (!tagToDelete) return;
    setTags(tags.filter(t => t.id !== tagId));
    setTasks(tasks.map(task => ({
      ...task,
      tags: task.tags.filter(t => t !== tagToDelete.name),
    })));
  };

  // Filtered tasks
  const getFilteredTasks = useMemo(() => {
    let filtered = [...tasks];
    
    switch (selectedView) {
      case "inbox":
        filtered = tasks.filter(t => !t.completed && !t.when && !t.projectId);
        break;
      case "today":
        const today = new Date().toDateString();
        filtered = tasks.filter(t => 
          !t.completed && (t.when === "today" || (t.deadline && new Date(t.deadline).toDateString() === today))
        );
        break;
      case "upcoming":
        filtered = tasks.filter(t => 
          !t.completed && (t.when === "upcoming" || (t.deadline && new Date(t.deadline) > new Date()))
        );
        break;
      case "anytime":
        filtered = tasks.filter(t => !t.completed && t.when === "anytime");
        break;
      case "focus":
        filtered = tasks.filter(t => !t.completed && focusTasks.includes(t.id));
        break;
      case "project":
        if (selectedProject) filtered = tasks.filter(t => t.projectId === selectedProject);
        break;
      case "dashboard":
        return []; // Dashboard handles its own rendering
    }
    
    return filtered.sort((a, b) => (a.order || 0) - (b.order || 0));
  }, [tasks, selectedView, selectedProject, focusTasks]);

  // Calculate total time for today
  const getTodayTotalTime = () => {
    const todayTasks = tasks.filter(t => {
      const today = new Date().toDateString();
      return !t.completed && (t.when === "today" || (t.deadline && new Date(t.deadline).toDateString() === today));
    });
    
    const totalMinutes = todayTasks.reduce((sum, task) => {
      const duration = DURATION_OPTIONS.find(d => d.value === task.estimatedDuration);
      return sum + (duration ? duration.minutes : 0);
    }, 0);
    
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    return { hours, minutes, totalMinutes };
  };

  // Get abandoned tasks (in Anytime > 7 days)
  const getAbandonedTasks = () => {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    return tasks.filter(t => 
      !t.completed && 
      t.when === "anytime" && 
      new Date(t.createdAt) < sevenDaysAgo
    );
  };

  // Get stale tasks (in Anytime > 3 days)
  const getStaleTasks = () => {
    const threeDaysAgo = new Date();
    threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
    
    return tasks.filter(t => 
      !t.completed && 
      t.when === "anytime" && 
      new Date(t.createdAt) < threeDaysAgo
    );
  };

  const isDarkMode = selectedTheme === "dark";

  return (
    <div className="flex h-screen font-sans" style={{ background: isDarkMode ? "#1a1a1a" : "#f5f5f7" }}>
      <style>{`
        @keyframes fadeInUp { 0% { opacity: 0; transform: translateY(20px); } 100% { opacity: 1; transform: translateY(0); } }
        @keyframes scaleIn { 0% { opacity: 0; transform: scale(0.9); } 100% { opacity: 1; transform: scale(1); } }
        @keyframes slideInRight { 0% { transform: translateX(100%); } 100% { transform: translateX(0); } }
        @keyframes taskComplete { 0% { opacity: 1; transform: translateX(0); } 100% { opacity: 0; transform: translateX(20px); } }
        .animate-fade-in-up { animation: fadeInUp 0.4s ease-out; }
        .animate-scale-in { animation: scaleIn 0.3s ease-out; }
        .animate-slide-in-right { animation: slideInRight 0.3s ease-out; }
        .transition-smooth { transition: all 0.2s ease-out; }
        ::-webkit-scrollbar { width: 8px; height: 8px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #D1D1D6; border-radius: 4px; }
        ::-webkit-scrollbar-thumb:hover { background: #AEAEB2; }
      `}</style>

      {/* Sidebar */}
      <div className="w-64 flex flex-col p-3" style={{ backgroundColor: isDarkMode ? "#252525" : "white", borderRight: `1px solid ${isDarkMode ? "#3a3a3a" : "#e5e5e5"}` }}>
        <div className="p-4 flex items-center justify-between border-b" style={{ borderColor: isDarkMode ? "#3a3a3a" : "#e5e5e5" }}>
          <h1 className="text-xl font-semibold" style={{ color: isDarkMode ? "#ffffff" : "#1C1C1E" }}>Stuff</h1>
          <div className="flex items-center gap-3">
            <button onClick={() => setShowQuickFind(true)} style={{ color: "#8E8E93" }} className="hover:text-blue-500">
              <Search className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto py-4 space-y-1">
          {[
            { id: "inbox", icon: Inbox, label: "Inbox", color: "#007AFF" },
            { id: "today", icon: Star, label: "Today", color: "#FFC107" },
            { id: "upcoming", icon: Calendar, label: "Upcoming", color: "#FF3B30" },
            { id: "anytime", icon: List, label: "Anytime", color: "#8E8E93" },
            { id: "focus", icon: Target, label: "Focus", color: "#AF52DE" },
            { id: "dashboard", icon: BarChart3, label: "Dashboard", color: "#34C759" },
          ].map(view => (
            <button
              key={view.id}
              onClick={() => { setSelectedView(view.id); setSelectedProject(null); }}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition-smooth"
              style={{
                backgroundColor: selectedView === view.id ? "#007AFF" : isDarkMode ? "#2a2a2a" : "#f5f5f7",
                color: selectedView === view.id ? "white" : isDarkMode ? "#ffffff" : "#1C1C1E",
              }}
            >
              <view.icon className="w-5 h-5" style={{ color: selectedView === view.id ? "white" : view.color }} />
              <span className="flex-1 text-left text-sm font-medium">{view.label}</span>
              {showTaskCounts && view.id !== "focus" && view.id !== "dashboard" && (
                <span className="text-xs px-2 py-0.5 rounded-full" style={{
                  backgroundColor: selectedView === view.id ? "rgba(255,255,255,0.3)" : isDarkMode ? "#3a3a3a" : "#e5e5e5",
                }}>
                  {getFilteredTasks.length}
                </span>
              )}
            </button>
          ))}

          <div className="pt-6 mt-6" style={{ borderTop: `1px solid ${isDarkMode ? "#3a3a3a" : "#e5e5e5"}` }}>
            <div className="flex items-center justify-between px-2 mb-2">
              <span className="text-xs font-semibold uppercase" style={{ color: "#8E8E93" }}>Projects</span>
              <button onClick={() => setShowNewProjectInput(true)} style={{ color: "#8E8E93" }}>
                <Plus className="w-4 h-4" />
              </button>
            </div>

            {showNewProjectInput && (
              <input
                type="text"
                value={newProjectName}
                onChange={e => setNewProjectName(e.target.value)}
                onKeyPress={e => e.key === "Enter" && addProject()}
                onBlur={() => { if (newProjectName.trim()) addProject(); else setShowNewProjectInput(false); }}
                placeholder="New Project"
                className="w-full px-3 py-2 mb-2 text-sm rounded-xl border focus:outline-none focus:ring-2 focus:ring-blue-500"
                style={{ backgroundColor: isDarkMode ? "#2a2a2a" : "white", borderColor: isDarkMode ? "#3a3a3a" : "#e5e5e5", color: isDarkMode ? "#ffffff" : "#1C1C1E" }}
                autoFocus
              />
            )}

            {projects.map(project => (
              <button
                key={project.id}
                onClick={() => { setSelectedView("project"); setSelectedProject(project.id); }}
                className="w-full flex items-center gap-3 px-4 py-2 rounded-2xl transition-smooth text-sm"
                style={{
                  backgroundColor: selectedView === "project" && selectedProject === project.id ? "#007AFF" : isDarkMode ? "#2a2a2a" : "#f5f5f7",
                  color: selectedView === "project" && selectedProject === project.id ? "white" : isDarkMode ? "#ffffff" : "#1C1C1E",
                }}
              >
                <span>{project.emoji || "🎯"}</span>
                <span className="flex-1 text-left truncate">{project.name}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="pt-3" style={{ borderTop: `1px solid ${isDarkMode ? "#3a3a3a" : "#e5e5e5"}` }}>
          <button
            onClick={() => setShowAppSettings(true)}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition-smooth"
            style={{ backgroundColor: isDarkMode ? "#2a2a2a" : "#f5f5f7", color: isDarkMode ? "#ffffff" : "#8E8E93" }}
          >
            <Settings className="w-5 h-5" />
            <span className="text-sm font-medium">Settings</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="px-8 py-6" style={{ backgroundColor: isDarkMode ? "#252525" : "white", borderBottom: `1px solid ${isDarkMode ? "#3a3a3a" : "#e5e5e5"}` }}>
          <h2 className="text-3xl font-bold" style={{ color: isDarkMode ? "#ffffff" : "#1C1C1E" }}>
            {selectedView === "inbox" && "Inbox"}
            {selectedView === "today" && "Today"}
            {selectedView === "upcoming" && "Upcoming"}
            {selectedView === "anytime" && "Anytime"}
            {selectedView === "focus" && "Focus"}
            {selectedView === "dashboard" && "Dashboard"}
            {selectedView === "project" && projects.find(p => p.id === selectedProject)?.name}
          </h2>
          
          {selectedView === "today" && (
            <div className="mt-2 flex items-center gap-4">
              <p className="text-sm" style={{ color: "#8E8E93" }}>
                {getFilteredTasks.length} tasks
              </p>
              {getTodayTotalTime().totalMinutes > 0 && (
                <div className="flex items-center gap-2 px-3 py-1 rounded-full" style={{ backgroundColor: "#007AFF15", color: "#007AFF" }}>
                  <Clock className="w-4 h-4" />
                  <span className="text-sm font-medium">
                    {getTodayTotalTime().hours}h {getTodayTotalTime().minutes}m estimated
                  </span>
                </div>
              )}
            </div>
          )}
          
          {selectedView === "anytime" && getStaleTasks().length > 0 && showAutoScheduleSuggestions && (
            <div className="mt-3 p-4 rounded-xl flex items-start gap-3" style={{ backgroundColor: "#FFF3CD", borderLeft: "4px solid #FFC107" }}>
              <AlertCircle className="w-5 h-5 flex-shrink-0" style={{ color: "#FF9500" }} />
              <div className="flex-1">
                <p className="text-sm font-semibold" style={{ color: "#1C1C1E" }}>
                  You have {getStaleTasks().length} task{getStaleTasks().length > 1 ? 's' : ''} sitting here for over 3 days
                </p>
                <p className="text-xs mt-1" style={{ color: "#666" }}>
                  Consider moving them to Today or Upcoming to make progress
                </p>
              </div>
              <button onClick={() => setShowAutoScheduleSuggestions(false)} style={{ color: "#8E8E93" }}>
                <X className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        {/* Task Input */}
        {selectedView !== "dashboard" && selectedView !== "focus" && (
          <div className="px-8 py-4" style={{ backgroundColor: isDarkMode ? "#1f1f1f" : "#fafafa" }}>
            <div className="flex gap-3 items-start">
              <input
                ref={inputRef}
                type="text"
                value={newTaskInput}
                onChange={e => setNewTaskInput(e.target.value)}
                onKeyPress={e => e.key === "Enter" && addTask()}
                placeholder="Add a task... (try 'tomorrow at 2pm')"
                className="flex-1 px-6 py-4 rounded-2xl text-base focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-lg"
                style={{ 
                  backgroundColor: isDarkMode ? "#2a2a2a" : "white", 
                  border: `2px solid ${isDarkMode ? "#3a3a3a" : "#007AFF20"}`,
                  color: isDarkMode ? "#ffffff" : "#1C1C1E"
                }}
              />
              <button 
                onClick={() => addTask()}
                className="px-6 py-4 rounded-2xl flex items-center gap-2 font-medium shadow-lg transition-smooth hover:opacity-90"
                style={{ backgroundColor: "#007AFF", color: "white" }}
              >
                <Plus className="w-5 h-5" />
                Add
              </button>
            </div>
            
            {/* Quick Actions */}
            <div className="flex gap-2 mt-3">
              <span className="text-xs" style={{ color: "#8E8E93" }}>Quick:</span>
              {[
                { label: "! High", action: () => {} },
                { label: "15m", action: () => {} },
                { label: "30m", action: () => {} },
                { label: "1h", action: () => {} },
              ].map((btn, i) => (
                <button
                  key={i}
                  className="px-3 py-1 rounded-lg text-xs font-medium transition-smooth"
                  style={{ backgroundColor: isDarkMode ? "#2a2a2a" : "#e5e5e5", color: isDarkMode ? "#ffffff" : "#1C1C1E" }}
                >
                  {btn.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Tasks List or Dashboard */}
        <div className="flex-1 overflow-y-auto px-8 py-6">
          {selectedView === "dashboard" ? (
            <DashboardView tasks={tasks} projects={projects} getAbandonedTasks={getAbandonedTasks} isDarkMode={isDarkMode} />
          ) : selectedView === "focus" ? (
            <FocusView tasks={tasks} focusTasks={focusTasks} setFocusTasks={setFocusTasks} isDarkMode={isDarkMode} />
          ) : getFilteredTasks.length === 0 ? (
            <EmptyState view={selectedView} isDarkMode={isDarkMode} />
          ) : (
            <div className="space-y-3 max-w-4xl">
              {getFilteredTasks.map(task => (
                <TaskItem key={task.id} task={task} />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Panels and Modals */}
      {showDailyPlanning && <DailyPlanningModal />}
      {showQuickFind && <QuickFindPanel />}
      {showAppSettings && <SettingsPanel />}
      {showTaskDetail && selectedTask && <TaskDetailPanel />}
    </div>
  );

  // Sub-components defined inline...
  function TaskItem({ task }) {
    const isCompleting = completingTaskIds.includes(task.id);
    
    return (
      <div 
        onClick={() => { setSelectedTask(task); setShowTaskDetail(true); }}
        className="group flex items-center gap-4 px-6 py-4 rounded-2xl cursor-pointer transition-smooth hover:shadow-lg animate-fade-in-up"
        style={{
          backgroundColor: isDarkMode ? "#2a2a2a" : "white",
          border: `1px solid ${isDarkMode ? "#3a3a3a" : "#e5e5e5"}`,
          animation: isCompleting ? "taskComplete 0.6s forwards" : "none"
        }}
      >
        <button
          onClick={e => { e.stopPropagation(); toggleTaskComplete(task.id); }}
          className="flex-shrink-0"
        >
          {task.completed || isCompleting ? (
            <CheckCircle2 className="w-6 h-6" style={{ color: "#34C759" }} />
          ) : (
            <Circle className="w-6 h-6" style={{ color: "#C7C7CC" }} />
          )}
        </button>
        
        <div className="flex-1 min-w-0">
          <div className={`text-base font-medium ${task.completed ? "line-through" : ""}`} style={{ color: task.completed ? "#8E8E93" : isDarkMode ? "#ffffff" : "#1C1C1E" }}>
            {task.title}
          </div>
          
          <div className="flex flex-wrap gap-2 mt-2">
            {task.priority && (
              <span className="px-2 py-0.5 rounded-full text-xs font-bold" style={{ backgroundColor: task.priority === "high" ? "#FF3B3015" : task.priority === "medium" ? "#FF950015" : "#007AFF15", color: task.priority === "high" ? "#FF3B30" : task.priority === "medium" ? "#FF9500" : "#007AFF" }}>
                {task.priority === "high" ? "!!!" : task.priority === "medium" ? "!!" : "!"}
              </span>
            )}
            
            {task.estimatedDuration && (
              <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-xs" style={{ backgroundColor: "#007AFF15", color: "#007AFF" }}>
                <Clock className="w-3 h-3" />
                {task.estimatedDuration}
              </span>
            )}
            
            {task.deadline && (
              <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-xs" style={{ backgroundColor: "#FF950015", color: "#FF9500" }}>
                <Calendar className="w-3 h-3" />
                {new Date(task.deadline).toLocaleDateString()}
              </span>
            )}
            
            {task.tags?.map(tagName => {
              const tag = tags.find(t => t.name === tagName);
              return (
                <span key={tagName} className="px-2 py-0.5 rounded-full text-xs" style={{ backgroundColor: tag?.color + "15", color: tag?.color }}>
                  {tagName}
                </span>
              );
            })}
          </div>
        </div>
        
        <button
          onClick={e => { e.stopPropagation(); deleteTask(task.id); }}
          className="opacity-0 group-hover:opacity-100 transition-smooth"
        >
          <Trash2 className="w-5 h-5" style={{ color: "#8E8E93" }} />
        </button>
      </div>
    );
  }

  function EmptyState({ view }) {
    const messages = {
      inbox: { icon: Inbox, title: "Your inbox is empty!", subtitle: "New tasks without a schedule will appear here" },
      today: { icon: Star, title: "Nothing scheduled for today", subtitle: "Add tasks or move them from your inbox" },
      upcoming: { icon: Calendar, title: "No upcoming tasks", subtitle: "Schedule tasks with deadlines to see them here" },
      anytime: { icon: List, title: "No anytime tasks", subtitle: "Tasks you'll do eventually go here" },
    };
    
    const msg = messages[view] || messages.inbox;
    const Icon = msg.icon;
    
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Icon className="w-24 h-24 mb-4" style={{ color: "#C7C7CC" }} />
        <h3 className="text-2xl font-semibold mb-2" style={{ color: isDarkMode ? "#ffffff" : "#1C1C1E" }}>{msg.title}</h3>
        <p className="text-base" style={{ color: "#8E8E93" }}>{msg.subtitle}</p>
      </div>
    );
  }

  function DashboardView({ tasks, projects, getAbandonedTasks }) {
    const thisWeek = tasks.filter(t => {
      if (!t.completed || !t.completedAt) return false;
      const completedDate = new Date(t.completedAt);
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return completedDate >= weekAgo;
    });
    
    const totalTasks = tasks.filter(t => !t.completed).length;
    const completionRate = totalTasks > 0 ? Math.round((thisWeek.length / (thisWeek.length + totalTasks)) * 100) : 0;
    
    const projectStats = projects.map(p => ({
      ...p,
      taskCount: tasks.filter(t => t.projectId === p.id && !t.completed).length
    })).filter(p => p.taskCount > 0).sort((a, b) => b.taskCount - a.taskCount).slice(0, 3);
    
    return (
      <div className="max-w-5xl space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-3 gap-6">
          <div className="p-6 rounded-2xl" style={{ backgroundColor: isDarkMode ? "#2a2a2a" : "white", border: `1px solid ${isDarkMode ? "#3a3a3a" : "#e5e5e5"}` }}>
            <div className="flex items-center gap-3 mb-2">
              <CheckCircle2 className="w-6 h-6" style={{ color: "#34C759" }} />
              <span className="text-sm font-semibold" style={{ color: "#8E8E93" }}>THIS WEEK</span>
            </div>
            <div className="text-4xl font-bold" style={{ color: isDarkMode ? "#ffffff" : "#1C1C1E" }}>{thisWeek.length}</div>
            <p className="text-sm mt-1" style={{ color: "#8E8E93" }}>tasks completed</p>
          </div>
          
          <div className="p-6 rounded-2xl" style={{ backgroundColor: isDarkMode ? "#2a2a2a" : "white", border: `1px solid ${isDarkMode ? "#3a3a3a" : "#e5e5e5"}` }}>
            <div className="flex items-center gap-3 mb-2">
              <TrendingUp className="w-6 h-6" style={{ color: "#007AFF" }} />
              <span className="text-sm font-semibold" style={{ color: "#8E8E93" }}>COMPLETION RATE</span>
            </div>
            <div className="text-4xl font-bold" style={{ color: isDarkMode ? "#ffffff" : "#1C1C1E" }}>{completionRate}%</div>
            <p className="text-sm mt-1" style={{ color: "#8E8E93" }}>of all tasks</p>
          </div>
          
          <div className="p-6 rounded-2xl" style={{ backgroundColor: isDarkMode ? "#2a2a2a" : "white", border: `1px solid ${isDarkMode ? "#3a3a3a" : "#e5e5e5"}` }}>
            <div className="flex items-center gap-3 mb-2">
              <Zap className="w-6 h-6" style={{ color: "#FF9500" }} />
              <span className="text-sm font-semibold" style={{ color: "#8E8E93" }}>ACTIVE TASKS</span>
            </div>
            <div className="text-4xl font-bold" style={{ color: isDarkMode ? "#ffffff" : "#1C1C1E" }}>{totalTasks}</div>
            <p className="text-sm mt-1" style={{ color: "#8E8E93" }}>remaining</p>
          </div>
        </div>
        
        {/* Top Projects */}
        {projectStats.length > 0 && (
          <div className="p-6 rounded-2xl" style={{ backgroundColor: isDarkMode ? "#2a2a2a" : "white", border: `1px solid ${isDarkMode ? "#3a3a3a" : "#e5e5e5"}` }}>
            <h3 className="text-lg font-semibold mb-4" style={{ color: isDarkMode ? "#ffffff" : "#1C1C1E" }}>Top Projects</h3>
            <div className="space-y-3">
              {projectStats.map((project, i) => (
                <div key={project.id} className="flex items-center gap-3">
                  <div className="w-8 h-8 flex items-center justify-center rounded-full font-bold text-sm" style={{ backgroundColor: "#007AFF15", color: "#007AFF" }}>
                    {i + 1}
                  </div>
                  <span className="text-lg">{project.emoji || "🎯"}</span>
                  <span className="flex-1 font-medium" style={{ color: isDarkMode ? "#ffffff" : "#1C1C1E" }}>{project.name}</span>
                  <span className="text-sm font-semibold" style={{ color: "#8E8E93" }}>{project.taskCount} tasks</span>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* Abandoned Tasks */}
        {getAbandonedTasks().length > 0 && (
          <div className="p-6 rounded-2xl" style={{ backgroundColor: "#FFF3CD", border: "1px solid #FFC107" }}>
            <div className="flex items-center gap-3 mb-4">
              <AlertCircle className="w-6 h-6" style={{ color: "#FF9500" }} />
              <h3 className="text-lg font-semibold" style={{ color: "#1C1C1E" }}>Abandoned Tasks ({getAbandonedTasks().length})</h3>
            </div>
            <p className="text-sm mb-4" style={{ color: "#666" }}>These tasks have been in Anytime for over a week</p>
            <div className="space-y-2">
              {getAbandonedTasks().slice(0, 5).map(task => (
                <div key={task.id} className="flex items-center gap-3 px-4 py-2 rounded-xl" style={{ backgroundColor: "white" }}>
                  <Circle className="w-5 h-5" style={{ color: "#8E8E93" }} />
                  <span className="flex-1" style={{ color: "#1C1C1E" }}>{task.title}</span>
                  <span className="text-xs" style={{ color: "#8E8E93" }}>
                    {Math.floor((new Date() - new Date(task.createdAt)) / (1000 * 60 * 60 * 24))} days ago
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  function FocusView({ tasks, focusTasks, setFocusTasks }) {
    const availableTasks = tasks.filter(t => !t.completed && !focusTasks.includes(t.id));
    const currentFocusTasks = tasks.filter(t => focusTasks.includes(t.id) && !t.completed);
    
    return (
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-8">
          <Target className="w-16 h-16 mx-auto mb-4" style={{ color: "#AF52DE" }} />
          <h3 className="text-2xl font-bold mb-2" style={{ color: isDarkMode ? "#ffffff" : "#1C1C1E" }}>Focus Mode</h3>
          <p style={{ color: "#8E8E93" }}>Pick your top 3 most important tasks to focus on</p>
        </div>
        
        {currentFocusTasks.length === 0 ? (
          <div className="space-y-3">
            {availableTasks.slice(0, 5).map(task => (
              <button
                key={task.id}
                onClick={() => focusTasks.length < 3 && setFocusTasks([...focusTasks, task.id])}
                className="w-full flex items-center gap-4 px-6 py-4 rounded-2xl text-left transition-smooth hover:shadow-lg"
                style={{ backgroundColor: isDarkMode ? "#2a2a2a" : "white", border: `1px solid ${isDarkMode ? "#3a3a3a" : "#e5e5e5"}` }}
                disabled={focusTasks.length >= 3}
              >
                <Circle className="w-6 h-6" style={{ color: "#C7C7CC" }} />
                <span className="flex-1 font-medium" style={{ color: isDarkMode ? "#ffffff" : "#1C1C1E" }}>{task.title}</span>
                <Plus className="w-5 h-5" style={{ color: "#007AFF" }} />
              </button>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {currentFocusTasks.map((task, i) => (
              <div key={task.id} className="p-8 rounded-3xl" style={{ backgroundColor: isDarkMode ? "#2a2a2a" : "white", border: `3px solid ${isDarkMode ? "#AF52DE" : "#AF52DE30"}` }}>
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 flex items-center justify-center rounded-full text-xl font-bold" style={{ backgroundColor: "#AF52DE", color: "white" }}>
                    {i + 1}
                  </div>
                  <div className="flex-1">
                    <h4 className="text-2xl font-bold mb-2" style={{ color: isDarkMode ? "#ffffff" : "#1C1C1E" }}>{task.title}</h4>
                    {task.notes && <p className="text-base mb-3" style={{ color: "#8E8E93" }}>{task.notes}</p>}
                    <button
                      onClick={() => toggleTaskComplete(task.id)}
                      className="px-6 py-3 rounded-xl font-medium transition-smooth"
                      style={{ backgroundColor: "#34C759", color: "white" }}
                    >
                      Complete Task
                    </button>
                  </div>
                  <button onClick={() => setFocusTasks(focusTasks.filter(id => id !== task.id))} style={{ color: "#8E8E93" }}>
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))}
            
            {currentFocusTasks.length < 3 && (
              <button
                onClick={() => {}}
                className="w-full p-6 rounded-2xl border-2 border-dashed flex items-center justify-center gap-2 transition-smooth hover:border-blue-500"
                style={{ borderColor: isDarkMode ? "#3a3a3a" : "#e5e5e5", color: "#8E8E93" }}
              >
                <Plus className="w-5 h-5" />
                <span>Add another focus task ({3 - currentFocusTasks.length} remaining)</span>
              </button>
            )}
          </div>
        )}
      </div>
    );
  }

  function DailyPlanningModal() {
    const availableTasks = tasks.filter(t => !t.completed);
    
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-8">
        <div className="max-w-2xl w-full p-8 rounded-3xl" style={{ backgroundColor: isDarkMode ? "#252525" : "white", maxHeight: "80vh", overflow: "auto" }}>
          <div className="text-center mb-8">
            <Calendar className="w-16 h-16 mx-auto mb-4" style={{ color: "#007AFF" }} />
            <h2 className="text-3xl font-bold mb-2" style={{ color: isDarkMode ? "#ffffff" : "#1C1C1E" }}>Good Morning!</h2>
            <p className="text-lg" style={{ color: "#8E8E93" }}>What will you accomplish today?</p>
            <p className="text-sm mt-2" style={{ color: "#8E8E93" }}>Select at least one task to get started</p>
          </div>
          
          <div className="space-y-2 mb-8 max-h-96 overflow-y-auto">
            {availableTasks.slice(0, 10).map(task => (
              <button
                key={task.id}
                onClick={() => {
                  if (selectedPlanningTasks.includes(task.id)) {
                    setSelectedPlanningTasks(selectedPlanningTasks.filter(id => id !== task.id));
                  } else {
                    setSelectedPlanningTasks([...selectedPlanningTasks, task.id]);
                  }
                }}
                className="w-full flex items-center gap-4 px-5 py-4 rounded-xl text-left transition-smooth"
                style={{
                  backgroundColor: selectedPlanningTasks.includes(task.id) ? "#007AFF15" : isDarkMode ? "#2a2a2a" : "#f5f5f7",
                  border: `2px solid ${selectedPlanningTasks.includes(task.id) ? "#007AFF" : "transparent"}`,
                }}
              >
                <div className="w-6 h-6 rounded-full flex items-center justify-center border-2" style={{ 
                  borderColor: selectedPlanningTasks.includes(task.id) ? "#007AFF" : "#C7C7CC",
                  backgroundColor: selectedPlanningTasks.includes(task.id) ? "#007AFF" : "transparent"
                }}>
                  {selectedPlanningTasks.includes(task.id) && <CheckCircle2 className="w-4 h-4" style={{ color: "white" }} />}
                </div>
                <span className="flex-1 font-medium" style={{ color: isDarkMode ? "#ffffff" : "#1C1C1E" }}>{task.title}</span>
              </button>
            ))}
          </div>
          
          <button
            onClick={completeDailyPlanning}
            className="w-full py-4 rounded-xl text-lg font-semibold transition-smooth"
            style={{ backgroundColor: "#007AFF", color: "white" }}
            disabled={selectedPlanningTasks.length === 0}
          >
            Start My Day ({selectedPlanningTasks.length} task{selectedPlanningTasks.length !== 1 ? 's' : ''})
          </button>
        </div>
      </div>
    );
  }

  function TaskDetailPanel() {
    return (
      <div className="fixed right-0 top-0 bottom-0 w-96 p-6 overflow-y-auto shadow-2xl animate-slide-in-right" style={{ backgroundColor: isDarkMode ? "#252525" : "white", borderLeft: `1px solid ${isDarkMode ? "#3a3a3a" : "#e5e5e5"}` }}>
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold" style={{ color: isDarkMode ? "#ffffff" : "#1C1C1E" }}>Task Details</h3>
          <button onClick={() => { setShowTaskDetail(false); setSelectedTask(null); }}>
            <X className="w-5 h-5" style={{ color: "#8E8E93" }} />
          </button>
        </div>
        
        <div className="space-y-4">
          <div>
            <label className="text-xs font-semibold uppercase mb-2 block" style={{ color: "#8E8E93" }}>Title</label>
            <input
              type="text"
              value={selectedTask.title}
              onChange={e => updateTask(selectedTask.id, { title: e.target.value })}
              className="w-full px-4 py-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-blue-500"
              style={{ backgroundColor: isDarkMode ? "#2a2a2a" : "#f5f5f7", borderColor: isDarkMode ? "#3a3a3a" : "#e5e5e5", color: isDarkMode ? "#ffffff" : "#1C1C1E" }}
            />
          </div>
          
          <div>
            <label className="text-xs font-semibold uppercase mb-2 block" style={{ color: "#8E8E93" }}>Notes</label>
            <textarea
              value={selectedTask.notes || ""}
              onChange={e => updateTask(selectedTask.id, { notes: e.target.value })}
              className="w-full px-4 py-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              rows={4}
              style={{ backgroundColor: isDarkMode ? "#2a2a2a" : "#f5f5f7", borderColor: isDarkMode ? "#3a3a3a" : "#e5e5e5", color: isDarkMode ? "#ffffff" : "#1C1C1E" }}
              placeholder="Add notes..."
            />
          </div>
          
          <div>
            <label className="text-xs font-semibold uppercase mb-2 block" style={{ color: "#8E8E93" }}>Priority</label>
            <div className="flex gap-2">
              {[
                { value: "high", label: "High", color: "#FF3B30" },
                { value: "medium", label: "Medium", color: "#FF9500" },
                { value: "low", label: "Low", color: "#007AFF" },
              ].map(p => (
                <button
                  key={p.value}
                  onClick={() => updateTask(selectedTask.id, { priority: selectedTask.priority === p.value ? null : p.value })}
                  className="flex-1 py-2 rounded-xl text-sm font-semibold transition-smooth"
                  style={{
                    backgroundColor: selectedTask.priority === p.value ? p.color + "20" : isDarkMode ? "#2a2a2a" : "#f5f5f7",
                    color: selectedTask.priority === p.value ? p.color : "#8E8E93",
                    border: `2px solid ${selectedTask.priority === p.value ? p.color : "transparent"}`,
                  }}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>
          
          <div>
            <label className="text-xs font-semibold uppercase mb-2 block" style={{ color: "#8E8E93" }}>Estimated Duration</label>
            <select
              value={selectedTask.estimatedDuration || ""}
              onChange={e => updateTask(selectedTask.id, { estimatedDuration: e.target.value || null })}
              className="w-full px-4 py-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-blue-500"
              style={{ backgroundColor: isDarkMode ? "#2a2a2a" : "#f5f5f7", borderColor: isDarkMode ? "#3a3a3a" : "#e5e5e5", color: isDarkMode ? "#ffffff" : "#1C1C1E" }}
            >
              <option value="">None</option>
              {DURATION_OPTIONS.map(d => (
                <option key={d.value} value={d.value}>{d.label}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="text-xs font-semibold uppercase mb-2 block" style={{ color: "#8E8E93" }}>Deadline</label>
            <DateTimePicker
              value={selectedTask.deadline || ""}
              onChange={newValue => updateTask(selectedTask.id, { deadline: newValue || null })}
              placeholder="Set deadline"
              timeFormat={timeFormat}
              isDarkMode={isDarkMode}
            />
          </div>
          
          <div>
            <label className="text-xs font-semibold uppercase mb-2 block" style={{ color: "#8E8E93" }}>When</label>
            <select
              value={selectedTask.when || ""}
              onChange={e => updateTask(selectedTask.id, { when: e.target.value || null })}
              className="w-full px-4 py-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-blue-500"
              style={{ backgroundColor: isDarkMode ? "#2a2a2a" : "#f5f5f7", borderColor: isDarkMode ? "#3a3a3a" : "#e5e5e5", color: isDarkMode ? "#ffffff" : "#1C1C1E" }}
            >
              <option value="">None</option>
              <option value="today">Today</option>
              <option value="upcoming">Upcoming</option>
              <option value="anytime">Anytime</option>
            </select>
          </div>
          
          <button
            onClick={() => {
              if (showConfirmDialogs && !confirm(`Delete "${selectedTask.title}"?`)) return;
              deleteTask(selectedTask.id);
            }}
            className="w-full py-3 rounded-xl text-sm font-semibold transition-smooth"
            style={{ backgroundColor: "#FF3B3015", color: "#FF3B30", border: "2px solid #FF3B30" }}
          >
            Delete Task
          </button>
        </div>
      </div>
    );
  }

  function QuickFindPanel() {
    const searchResults = tasks.filter(t => 
      t.title.toLowerCase().includes(quickFindSearch.toLowerCase())
    ).slice(0, 10);
    
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-start justify-center pt-32 z-50" onClick={() => setShowQuickFind(false)}>
        <div className="w-full max-w-2xl p-6 rounded-3xl animate-scale-in" style={{ backgroundColor: isDarkMode ? "#252525" : "white" }} onClick={e => e.stopPropagation()}>
          <div className="flex items-center gap-3 px-4 py-3 rounded-2xl mb-4" style={{ backgroundColor: isDarkMode ? "#2a2a2a" : "#f5f5f7" }}>
            <Search className="w-5 h-5" style={{ color: "#8E8E93" }} />
            <input
              type="text"
              value={quickFindSearch}
              onChange={e => setQuickFindSearch(e.target.value)}
              placeholder="Search tasks..."
              className="flex-1 bg-transparent outline-none"
              style={{ color: isDarkMode ? "#ffffff" : "#1C1C1E" }}
              autoFocus
            />
          </div>
          
          {quickFindSearch && (
            <div className="space-y-2">
              {searchResults.map(task => (
                <button
                  key={task.id}
                  onClick={() => { setSelectedTask(task); setShowTaskDetail(true); setShowQuickFind(false); }}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-smooth hover:bg-blue-50"
                  style={{ backgroundColor: isDarkMode ? "#2a2a2a" : "#f5f5f7" }}
                >
                  <Circle className="w-5 h-5" style={{ color: "#8E8E93" }} />
                  <span style={{ color: isDarkMode ? "#ffffff" : "#1C1C1E" }}>{task.title}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  function SettingsPanel() {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-8" onClick={() => setShowAppSettings(false)}>
        <div className="max-w-2xl w-full p-8 rounded-3xl max-h-screen overflow-y-auto" style={{ backgroundColor: isDarkMode ? "#252525" : "white" }} onClick={e => e.stopPropagation()}>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold" style={{ color: isDarkMode ? "#ffffff" : "#1C1C1E" }}>Settings</h2>
            <button onClick={() => setShowAppSettings(false)}>
              <X className="w-6 h-6" style={{ color: "#8E8E93" }} />
            </button>
          </div>
          
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-3" style={{ color: isDarkMode ? "#ffffff" : "#1C1C1E" }}>General</h3>
              
              <div className="flex items-center justify-between py-3">
                <div>
                  <div className="font-medium" style={{ color: isDarkMode ? "#ffffff" : "#1C1C1E" }}>Completion Sound</div>
                  <div className="text-sm" style={{ color: "#8E8E93" }}>Play sound when completing tasks</div>
                </div>
                <button
                  onClick={() => setCompletionSound(!completionSound)}
                  className="w-12 h-6 rounded-full transition-smooth"
                  style={{ backgroundColor: completionSound ? "#34C759" : "#8E8E93" }}
                >
                  <div className="w-5 h-5 bg-white rounded-full shadow transition-transform" style={{ transform: completionSound ? "translateX(24px)" : "translateX(2px)" }} />
                </button>
              </div>
              
              <div className="flex items-center justify-between py-3">
                <div>
                  <div className="font-medium" style={{ color: isDarkMode ? "#ffffff" : "#1C1C1E" }}>Show Task Counts</div>
                  <div className="text-sm" style={{ color: "#8E8E93" }}>Display task counts in sidebar</div>
                </div>
                <button
                  onClick={() => setShowTaskCounts(!showTaskCounts)}
                  className="w-12 h-6 rounded-full transition-smooth"
                  style={{ backgroundColor: showTaskCounts ? "#34C759" : "#8E8E93" }}
                >
                  <div className="w-5 h-5 bg-white rounded-full shadow transition-transform" style={{ transform: showTaskCounts ? "translateX(24px)" : "translateX(2px)" }} />
                </button>
              </div>
            </div>
            
            <div className="pt-6" style={{ borderTop: `1px solid ${isDarkMode ? "#3a3a3a" : "#e5e5e5"}` }}>
              <h3 className="text-lg font-semibold mb-3" style={{ color: isDarkMode ? "#ffffff" : "#1C1C1E" }}>Theme</h3>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { id: "none", name: "Light", preview: "#ffffff" },
                  { id: "dark", name: "Dark", preview: "#1a1a1a" },
                ].map(theme => (
                  <button
                    key={theme.id}
                    onClick={() => setSelectedTheme(theme.id)}
                    className="p-4 rounded-2xl border-2 transition-smooth"
                    style={{
                      borderColor: selectedTheme === theme.id ? "#007AFF" : isDarkMode ? "#3a3a3a" : "#e5e5e5",
                      backgroundColor: isDarkMode ? "#2a2a2a" : "#f5f5f7"
                    }}
                  >
                    <div className="w-full h-20 rounded-xl mb-2" style={{ backgroundColor: theme.preview }} />
                    <div className="font-medium" style={{ color: isDarkMode ? "#ffffff" : "#1C1C1E" }}>{theme.name}</div>
                  </button>
                ))}
              </div>
            </div>
            
            <div className="pt-6" style={{ borderTop: `1px solid ${isDarkMode ? "#3a3a3a" : "#e5e5e5"}` }}>
              <h3 className="text-lg font-semibold mb-3" style={{ color: isDarkMode ? "#ffffff" : "#1C1C1E" }}>Data</h3>
              <button
                onClick={() => {
                  const data = { tasks, projects, tags, version: "2.0.0", exportDate: new Date().toISOString() };
                  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement("a");
                  a.href = url;
                  a.download = `stuff-backup-${new Date().toISOString().split("T")[0]}.json`;
                  a.click();
                  URL.revokeObjectURL(url);
                }}
                className="w-full py-3 rounded-xl font-medium transition-smooth"
                style={{ backgroundColor: "#007AFF15", color: "#007AFF" }}
              >
                Export All Data
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }
};

export default StuffApp;
