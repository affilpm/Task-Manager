import React, { useState, useEffect, useMemo } from 'react';
import { Clock, CheckCircle, AlertCircle, List, Calendar, Plus, Filter, Edit, Trash2, Moon, Sun, X, User, ChevronDown, ThumbsUp, Settings, LogOut, AlertTriangle } from 'lucide-react';
import axiosInstance from '../../../api/api';
import { useDispatch, useSelector } from 'react-redux';
import {
  setCategories,
  setCategoryLoading,
  setCategoryError,
} from '../../../slices/categorySlice';
import { setTheme } from '../../../slices/themeSlice';
import {
  setTasks,
  addTask,
  updateTask,
  toggleTaskStatus,
  deleteTask,
  setFilter,
  setSortBy,
  setStats,
  setLoading,
  setError,
} from '../../../slices/taskSlice';
import { useNavigate } from 'react-router-dom';
import TaskCalendar from './TaskCalendar';

// Color Scheme Hook
const useColorScheme = (theme) => {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const checkColorScheme = () => {
      if (theme === 'dark') {
        setIsDark(true);
      } else if (theme === 'light') {
        setIsDark(false);
      } else {
        const darkModeQuery = window.matchMedia('(prefers-color-scheme: dark)');
        setIsDark(darkModeQuery.matches);
      }
    };

    checkColorScheme();

    const darkModeQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = (e) => {
      if (theme === 'system') {
        setIsDark(e.matches);
      }
    };

    darkModeQuery.addEventListener('change', handler);
    return () => darkModeQuery.removeEventListener('change', handler);
  }, [theme]);

  return isDark;
};

// PriorityBadge Component
const PriorityBadge = ({ priority, isDark }) => {
  const getColor = () => {
    switch (priority) {
      case 'high':
        return isDark ? 'bg-red-900 bg-opacity-50 text-red-200' : 'bg-red-100 text-red-800';
      case 'medium':
        return isDark ? 'bg-yellow-900 bg-opacity-50 text-yellow-200' : 'bg-yellow-100 text-yellow-800';
      case 'low':
        return isDark ? 'bg-green-900 bg-opacity-50 text-green-200' : 'bg-green-100 text-green-800';
      default:
        return isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${getColor()} capitalize`}>
      {priority}
    </span>
  );
};

// StatusBadge Component
const StatusBadge = ({ status, isDark }) => {
  const getColor = () => {
    switch (status) {
      case 'completed':
        return isDark ? 'bg-green-900 bg-opacity-50 text-green-200' : 'bg-green-100 text-green-800';
      case 'in-progress':
        return isDark ? 'bg-blue-900 bg-opacity-50 text-blue-200' : 'bg-blue-100 text-blue-800';
      case 'pending':
        return isDark ? 'bg-yellow-900 bg-opacity-50 text-yellow-200' : 'bg-yellow-100 text-yellow-800';
      default:
        return isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${getColor()} capitalize`}>
      {status.replace('-', ' ')}
    </span>
  );
};

// TaskForm Component
const TaskForm = ({ initialData = {}, onCancel, isDark }) => {
  const dispatch = useDispatch();
  const status = useSelector(state => state.tasks.status);
  const error = useSelector(state => state.tasks.error);
  const categories = useSelector(state => state.categories.categories);

  const today = new Date().toISOString().split('T')[0];

  const [taskData, setTaskData] = useState({
    title: initialData.title || '',
    description: initialData.description || '',
    priority: initialData.priority || 'medium',
    due_date: initialData.due_date || today,
    status: initialData.status || 'pending',
    category: initialData.category?.id || '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setTaskData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...taskData,
        due_date: taskData.due_date,
        category: taskData.category || null,
      };

      if (initialData.id) {
        const response = await axiosInstance.put(`/tasks/tasks/${initialData.id}/`, payload);
        dispatch(updateTask(response.data));
      } else {
        const response = await axiosInstance.post('/tasks/tasks/', payload);
        dispatch(addTask(response.data));
      }
      // Fetch updated stats after task creation/update
      const statsResponse = await axiosInstance.get('/tasks/tasks/stats/');
      dispatch(setStats(statsResponse.data));
      onCancel();
    } catch (err) {
      dispatch(setError(err.response?.data?.detail || 'Failed to save task'));
    }
  };

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-0 sm:bg-black sm:bg-opacity-50 ${isDark ? 'bg-gray-900' : 'bg-gray-100'} overflow-y-auto`} role="dialog" aria-modal="true">
      <div className={`w-full max-w-md sm:max-w-lg ${isDark ? 'bg-gray-800 text-gray-100' : 'bg-white text-gray-800'} p-6 rounded-lg shadow-2xl relative max-h-[90vh] overflow-y-auto`}>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">{initialData.id ? 'Update Task' : 'New Task'}</h3>
          <button
            type="button"
            onClick={onCancel}
            className={`p-2 rounded-full ${isDark ? 'text-gray-400 hover:bg-gray-700' : 'text-gray-500 hover:bg-gray-100'}`}
            aria-label="Close form"
          >
            <X size={20} />
          </button>
        </div>

        {status === 'failed' && error && (
          <div className="text-red-500 text-sm mb-4 bg-red-100 dark:bg-red-900 dark:bg-opacity-20 p-3 rounded">{error}</div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`} htmlFor="title">Task Title</label>
            <input
              id="title"
              type="text"
              name="title"
              value={taskData.title}
              onChange={handleChange}
              required
              className={`mt-1 block w-full rounded-md shadow-sm p-3 text-sm ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'} border focus:ring-2 focus:ring-blue-500`}
            />
          </div>

          <div>
            <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`} htmlFor="description">Description (Optional)</label>
            <textarea
              id="description"
              name="description"
              value={taskData.description}
              onChange={handleChange}
              rows="3"
              className={`mt-1 block w-full rounded-md shadow-sm p-3 text-sm ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'} border focus:ring-2 focus:ring-blue-500`}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`} htmlFor="priority">Priority</label>
              <select
                id="priority"
                name="priority"
                value={taskData.priority}
                onChange={handleChange}
                className={`mt-1 block w-full rounded-md shadow-sm p-3 text-sm ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'} border focus:ring-2 focus:ring-blue-500`}
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>

            <div>
              <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`} htmlFor="status">Status</label>
              <select
                id="status"
                name="status"
                value={taskData.status}
                onChange={handleChange}
                className={`mt-1 block w-full rounded-md shadow-sm p-3 text-sm ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'} border focus:ring-2 focus:ring-blue-500`}
              >
                <option value="pending">Pending</option>
                <option value="in-progress">In Progress</option>
                <option value="completed">Completed</option>
              </select>
            </div>
          </div>

          <div>
            <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`} htmlFor="category">Category (Optional)</label>
            <select
              id="category"
              name="category"
              value={taskData.category}
              onChange={handleChange}
              className={`mt-1 block w-full rounded-md shadow-sm p-3 text-sm ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'} border focus:ring-2 focus:ring-blue-500`}
            >
              <option value="">No Category</option>
              {categories.map(category => (
                <option key={category.id} value={category.id}>{category.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`} htmlFor="due_date">Due Date</label>
            <input
              id="due_date"
              type="date"
              name="due_date"
              value={taskData.due_date}
              min={today}
              onChange={handleChange}
              className={`mt-1 block w-full rounded-md shadow-sm p-3 text-sm ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'} border focus:ring-2 focus:ring-blue-500`}
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onCancel}
              className={`px-4 py-2 border rounded-md text-sm font-medium ${isDark ? 'border-gray-600 text-gray-300 hover:bg-gray-700' : 'border-gray-300 text-gray-700 hover:bg-gray-50'} transition-colors`}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={status === 'loading'}
              className={`px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${status === 'loading' ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'} transition-colors`}
            >
              {status === 'loading' ? 'Processing...' : initialData.id ? 'Update Task' : 'Add Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// TaskCard Component
const TaskCard = ({ task, onToggle, onEdit, onDelete, isDark }) => {
  const [showDetails, setShowDetails] = useState(false);

  const getDaysLeft = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dueDate = new Date(task.due_date);
    dueDate.setHours(0, 0, 0, 0);

    const diffTime = dueDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return { text: `${Math.abs(diffDays)} days overdue`, color: 'text-red-500' };
    if (diffDays === 0) return { text: 'Due today', color: 'text-yellow-500' };
    if (diffDays === 1) return { text: '1 day left', color: 'text-yellow-500' };
    return { text: `${diffDays} days left`, color: '' };
  };

  const daysLeft = getDaysLeft();

  return (
    <div className={`${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border p-4 rounded-lg shadow mb-4 transition-all duration-200`}>
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3">
        <div className="flex items-start space-x-3 flex-grow">
          <button
            onClick={() => onToggle(task.id)}
            className="cursor-pointer mt-1 focus:outline-none p-2"
            aria-label={task.status === 'completed' ? 'Mark as incomplete' : 'Mark as complete'}
          >
            {task.status === 'completed' ? (
              <CheckCircle className="text-green-500" size={20} />
            ) : (
              <div className={`w-5 h-5 border-2 rounded-full ${isDark ? 'border-gray-500' : 'border-gray-300'}`} />
            )}
          </button>
          <div className="flex-grow">
            <h3 className={`font-medium text-sm sm:text-base ${task.status === 'completed' ? 'line-through text-gray-500' : isDark ? 'text-white' : 'text-gray-900'}`}>
              {task.title}
            </h3>
            <div className="flex flex-wrap gap-2 mt-2">
              <StatusBadge status={task.status} isDark={isDark} />
              <PriorityBadge priority={task.priority} isDark={isDark} />
              <span className={`text-xs flex items-center ${isDark ? 'text-gray-400' : 'text-gray-500'} ${daysLeft.color}`}>
                <Calendar size={12} className="mr-1" />
                {new Date(task.due_date).toLocaleDateString()} • {daysLeft.text}
              </span>
            </div>

            {showDetails && task.description && (
              <div className={`mt-3 text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                {task.description}
              </div>
            )}
          </div>
        </div>
        <div className="flex space-x-2 sm:mt-0 mt-2">
          {task.description && (
            <button
              onClick={() => setShowDetails(!showDetails)}
              className={`text-xs px-3 py-1.5 rounded-lg ${isDark ? 'text-blue-400 bg-gray-700 hover:bg-gray-600' : 'text-blue-600 bg-gray-100 hover:bg-gray-200'} transition-colors`}
              aria-label={showDetails ? 'Hide details' : 'Show details'}
            >
              {showDetails ? 'Less' : 'More'}
            </button>
          )}
          <button
            onClick={() => onEdit(task)}
            className={`p-2 rounded-lg ${isDark ? 'text-gray-400 hover:bg-gray-700' : 'text-gray-400 hover:bg-gray-100'} transition-colors`}
            aria-label="Edit task"
          >
            <Edit size={18} />
          </button>
          <button
            onClick={() => onDelete(task.id)}
            className={`p-2 rounded-lg ${isDark ? 'text-gray-400 hover:bg-gray-700' : 'text-gray-400 hover:bg-gray-100'} transition-colors`}
            aria-label="Delete task"
          >
            <Trash2 size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};

// ThemeSelector Component
const ThemeSelector = ({ theme, onThemeChange, isDark }) => {
  return (
    <div className="flex items-center">
      <label className={`text-sm mr-2 hidden sm:block ${isDark ? 'text-gray-300' : 'text-gray-600'}`} id="theme-label">Theme:</label>
      <div className="flex border rounded-lg overflow-hidden" role="group" aria-labelledby="theme-label">
        <button
          onClick={() => onThemeChange('light')}
          className={`flex items-center px-3 py-2 text-xs ${theme === 'light' ? 'bg-blue-500 text-white' : isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-700'} transition-colors`}
          aria-pressed={theme === 'light'}
        >
          <Sun size={14} className="mr-1" /> <span className="hidden sm:inline">Light</span>
        </button>
        <button
          onClick={() => onThemeChange('system')}
          className={`flex items-center px-3 py-2 text-xs ${theme === 'system' ? 'bg-blue-500 text-white' : isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-700'} transition-colors`}
          aria-pressed={theme === 'system'}
        >
          <span className="hidden sm:inline">System</span>
        </button>
        <button
          onClick={() => onThemeChange('dark')}
          className={`flex items-center px-3 py-2 text-xs ${theme === 'dark' ? 'bg-blue-500 text-white' : isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-700'} transition-colors`}
          aria-pressed={theme === 'dark'}
        >
          <Moon size={14} className="mr-1" /> <span className="hidden sm:inline">Dark</span>
        </button>
      </div>
    </div>
  );
};

// EmptyState Component
const EmptyState = ({ onAddClick, isDark }) => {
  return (
    <div className="flex flex-col items-center justify-center py-10">
      <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}>
        <List size={28} className={isDark ? 'text-gray-400' : 'text-gray-500'} />
      </div>
      <h3 className={`text-lg font-medium mb-2 ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>No tasks yet</h3>
      <p className={`text-sm mb-6 text-center ${isDark ? 'text-gray-400' : 'text-gray-500'} max-w-xs`}>
        Create your first task to get organized
      </p>
      <button
        onClick={onAddClick}
        className="flex items-center bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg text-sm font-medium transition-colors shadow-md"
        aria-label="Create new task"
      >
        <Plus size={18} className="mr-2" /> Create Task
      </button>
    </div>
  );
};



// TaskDashboard Component
const TaskDashboard = () => {
  const dispatch = useDispatch();
  const { tasks, filter, sortBy, stats, status, error } = useSelector(state => state.tasks);
  const fullName = useSelector((state) => state.user.fullName);
  const email = useSelector((state) => state.user.email);
  const { theme } = useSelector(state => state.theme);
  const [modalState, setModalState] = useState({ isOpen: false, task: null });
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const isDark = useColorScheme(theme);
  const navigate = useNavigate();

  // Handle modal close
  const handleModalClose = () => {
    setModalState({ isOpen: false, task: null });
  };

  // Format date for input (YYYY-MM-DD)
  const formatDateForInput = (dateString) => {
    if (!dateString) return '';
    const [year, month, day] = dateString.split('-').map(Number);
    const date = new Date(Date.UTC(year, month - 1, day));
    return date.toISOString().split('T')[0];
  };

  // Handle adding task from calendar
  const handleAddTaskFromCalendar = (dateString) => {
    const formattedDate = formatDateForInput(dateString);
    setModalState({ isOpen: true, task: { due_date: formattedDate } });
  };

  // Fetch tasks and stats
  useEffect(() => {
    const fetchTasks = async () => {
      dispatch(setLoading());
      try {
        const response = await axiosInstance.get('/tasks/tasks/');
        const tasksData = Array.isArray(response.data) ? response.data : [];
        dispatch(setTasks(tasksData));
      } catch (err) {
        dispatch(setError(err.response?.data?.detail || 'Failed to fetch tasks'));
      }
    };

    const fetchStats = async () => {
      try {
        const response = await axiosInstance.get('/tasks/tasks/stats/');
        dispatch(setStats(response.data));
      } catch (err) {
        dispatch(setError(err.response?.data?.detail || 'Failed to fetch stats'));
      }
    };

    fetchTasks();
    fetchStats();
  }, [dispatch]);

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      dispatch(setCategoryLoading());
      try {
        const response = await axiosInstance.get('/tasks/categories/');
        dispatch(setCategories(response.data));
      } catch (err) {
        dispatch(setCategoryError(err.response?.data?.detail || 'Failed to fetch categories'));
      }
    };

    fetchCategories();
  }, [dispatch]);

  // Handle clicks outside profile menu
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileMenuOpen && !event.target.closest('#profile-menu-container')) {
        setProfileMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [profileMenuOpen]);

  // Filter and sort tasks
  const filteredTasks = useMemo(() => {
    let filtered = Array.isArray(tasks) ? [...tasks] : [];

    if (filter !== 'all') {
      filtered = filtered.filter(task => {
        if (filter === 'completed') return task.status === 'completed';
        if (filter === 'pending') return task.status === 'pending';
        if (filter === 'in-progress') return task.status === 'in-progress';
        if (filter === 'high-priority') return task.priority === 'high';
        if (filter.startsWith('date-')) {
          const dateStr = filter.substring(5);
          return task.due_date === dateStr;
        }
        return true;
      });
    }

    filtered.sort((a, b) => {
      if (sortBy === 'dueDate') return new Date(a.due_date) - new Date(b.due_date);
      if (sortBy === 'priority') {
        const priorityValues = { high: 3, medium: 2, low: 1 };
        return priorityValues[b.priority] - priorityValues[a.priority];
      }
      if (sortBy === 'title') return a.title.localeCompare(b.title);
      if (sortBy === 'status') {
        const statusValues = { pending: 1, 'in-progress': 2, completed: 3 };
        return statusValues[a.status] - statusValues[b.status];
      }
      return 0;
    });

    return filtered;
  }, [tasks, filter, sortBy]);

  // Handlers
  const handleEditTask = (task) => {
    setModalState({ isOpen: true, task });
  };

  const handleDeleteTask = async (taskId) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      try {
        await axiosInstance.delete(`/tasks/tasks/${taskId}/`);
        dispatch(deleteTask(taskId));
        const statsResponse = await axiosInstance.get('/tasks/tasks/stats/');
        dispatch(setStats(statsResponse.data));
      } catch (err) {
        dispatch(setError(err.response?.data?.detail || 'Failed to delete task'));
      }
    }
  };

  const handleToggleStatus = async (taskId) => {
    try {
      const task = tasks.find(t => t.id === taskId);
      const newStatus = task.status === 'completed' ? 'pending' : 'completed';
      await axiosInstance.patch(`/tasks/tasks/${taskId}/`, { status: newStatus });
      dispatch(toggleTaskStatus(taskId));
      const statsResponse = await axiosInstance.get('/tasks/tasks/stats/');
      dispatch(setStats(statsResponse.data));
    } catch (err) {
      dispatch(setError(err.response?.data?.detail || 'Failed to toggle status'));
    }
  };

  const handleFilterChange = (newFilter) => {
    dispatch(setFilter(newFilter));
  };

  const handleSortChange = (e) => {
    dispatch(setSortBy(e.target.value));
  };

  const handleThemeChange = (newTheme) => {
    dispatch(setTheme(newTheme));
  };

  const toggleProfileMenu = () => {
    setProfileMenuOpen(!profileMenuOpen);
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  // Theme-based styles
  const bgColor = isDark ? 'bg-gray-900' : 'bg-gray-50';
  const textColor = isDark ? 'text-white' : 'text-gray-900';
  const secondaryBg = isDark ? 'bg-gray-800' : 'bg-white';
  const borderColor = isDark ? 'border-gray-700' : 'border-gray-200';

  return (
    <div className={`${bgColor} min-h-screen transition-colors duration-300`}>
      <div className="container mx-auto px-4 sm:px-6 py-8">
        {/* Header */}
        <header className="mb-6 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <div>
            <h1 className={`text-2xl sm:text-3xl font-bold ${textColor} mb-1`}>Task Dashboard</h1>
            <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'} text-sm sm:text-base`}>Manage your tasks efficiently</p>
          </div>
          <div className="flex items-center space-x-3 sm:space-x-4">
            <ThemeSelector theme={theme} onThemeChange={handleThemeChange} isDark={isDark} />
            <div id="profile-menu-container" className="relative z-10">
              <button
                onClick={toggleProfileMenu}
                className={`flex items-center ${secondaryBg} ${borderColor} border rounded-full p-2 px-3 sm:px-4 hover:shadow-md transition-all duration-200`}
                aria-expanded={profileMenuOpen}
                aria-haspopup="true"
                aria-label="User profile menu"
              >
                <div className={`w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center rounded-full ${isDark ? 'bg-blue-600' : 'bg-blue-100'} mr-2 sm:mr-3`}>
                  <User size={16} className={isDark ? 'text-white' : 'text-blue-600'} />
                </div>
                <span className={`hidden sm:block font-medium text-sm ${textColor}`}>{fullName}</span>
                <ChevronDown size={16} className={`ml-1 sm:ml-2 ${textColor} transition-transform ${profileMenuOpen ? 'rotate-180' : ''}`} />
              </button>
              {profileMenuOpen && (
                <div
                  className={`absolute right-0 mt-2 w-52 sm:w-56 ${secondaryBg} ${borderColor} border rounded-lg shadow-xl py-1 z-50 max-h-[calc(100vh-100px)] overflow-y-auto`}
                  role="menu"
                  aria-orientation="vertical"
                >
                  <div className={`px-4 py-3 border-b ${borderColor}`}>
                    <p className={`font-semibold ${textColor} text-base`}>{fullName}</p>
                    <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'} truncate`}>{email}</p>
                  </div>
                  <a
                    onClick={() => navigate('/profile')}
                    className={`flex items-center px-4 py-2 text-sm ${textColor} hover:${isDark ? 'bg-gray-700' : 'bg-gray-100'} transition-colors`}
                    role="menuitem"
                  >
                    <User size={16} className="mr-3" />
                    Your Profile
                  </a>
                  <a
                    href="#settings"
                    className={`flex items-center px-4 py-2 text-sm ${textColor} hover:${isDark ? 'bg-gray-700' : 'bg-gray-100'} transition-colors`}
                    role="menuitem"
                  >
                    <Settings size={16} className="mr-3" />
                    Settings
                  </a>
                  <div className={`border-t ${borderColor} my-1`}></div>
                  <button
                    onClick={() => navigate('/logout')}
                    className={`flex items-center w-full text-left px-4 py-2 text-sm ${isDark ? 'text-red-400 hover:bg-gray-700' : 'text-red-600 hover:bg-gray-100'} transition-colors`}
                    role="menuitem"
                  >
                    <LogOut size={16} className="mr-3" />
                    Sign out
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Dashboard Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6">
          <div className={`${secondaryBg} ${borderColor} border rounded-lg shadow-md p-4 sm:p-5 hover:shadow-lg transition-all duration-200`}>
            <div className="flex items-center">
              <div className={`rounded-lg ${isDark ? 'bg-blue-900 bg-opacity-30' : 'bg-blue-100'} p-3 mr-3 sm:mr-4`}>
                <List className={isDark ? 'text-blue-300' : 'text-blue-600'} size={20} />
              </div>
              <div>
                <p className={`${isDark ? 'text-gray-400' : 'text-gray-500'} text-xs sm:text-sm mb-1`}>Total Tasks</p>
                <h3 className={`text-xl sm:text-2xl font-bold ${textColor}`}>{stats.total}</h3>
              </div>
            </div>
          </div>
          <div className={`${secondaryBg} ${borderColor} border rounded-lg shadow-md p-4 sm:p-5 hover:shadow-lg transition-all duration-200`}>
            <div className="flex items-center">
              <div className={`rounded-lg ${isDark ? 'bg-green-900 bg-opacity-30' : 'bg-green-100'} p-3 mr-3 sm:mr-4`}>
                <CheckCircle className={isDark ? 'text-green-300' : 'text-green-600'} size={20} />
              </div>
              <div>
                <p className={`${isDark ? 'text-gray-400' : 'text-gray-500'} text-xs sm:text-sm mb-1`}>Completed</p>
                <h3 className={`text-xl sm:text-2xl font-bold ${textColor}`}>{stats.completed}</h3>
              </div>
            </div>
          </div>
          <div className={`${secondaryBg} ${borderColor} border rounded-lg shadow-md p-4 sm:p-5 hover:shadow-lg transition-all duration-200`}>
            <div className="flex items-center">
              <div className={`rounded-lg ${isDark ? 'bg-yellow-900 bg-opacity-30' : 'bg-yellow-100'} p-3 mr-3 sm:mr-4`}>
                <Clock className={isDark ? 'text-yellow-300' : 'text-yellow-600'} size={20} />
              </div>
              <div>
                <p className={`${isDark ? 'text-gray-400' : 'text-gray-500'} text-xs sm:text-sm mb-1`}>In Progress</p>
                <h3 className={`text-xl sm:text-2xl font-bold ${textColor}`}>{stats.in_progress}</h3>
              </div>
            </div>
          </div>
          <div className={`${secondaryBg} ${borderColor} border rounded-lg shadow-md p-4 sm:p-5 hover:shadow-lg transition-all duration-200`}>
            <div className="flex items-center">
              <div className={`rounded-lg ${isDark ? 'bg-red-900 bg-opacity-30' : 'bg-red-100'} p-3 mr-3 sm:mr-4`}>
                <AlertCircle className={isDark ? 'text-red-300' : 'text-red-600'} size={20} />
              </div>
              <div>
                <p className={`${isDark ? 'text-gray-400' : 'text-gray-500'} text-xs sm:text-sm mb-1`}>High Priority</p>
                <h3 className={`text-xl sm:text-2xl font-bold ${textColor}`}>{stats.high_priority}</h3>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex flex-col lg:grid lg:grid-cols-3 lg:gap-6">
          {/* Main Task List */}
          <div className="lg:col-span-2 mb-6 lg:mb-0">
            <div className={`${secondaryBg} ${borderColor} border rounded-lg shadow-md p-4 sm:p-6`}>
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 gap-4">
                <h2 className={`text-xl sm:text-2xl font-bold ${textColor}`}>My Tasks</h2>
                <button
                  onClick={() => setModalState({ isOpen: true, task: null })}
                  className="flex items-center bg-blue-600 hover:bg-blue-700 text-white px-4 sm:px-5 py-2.5 rounded-lg text-sm font-medium transition-colors shadow-md hover:shadow-lg w-full sm:w-auto justify-center"
                  aria-label="Add new task"
                >
                  <Plus size={18} className="mr-2" /> New Task
                </button>
              </div>

              {/* Filter & Sort Controls */}
              <div className="flex flex-col gap-4 mb-6">
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => handleFilterChange('all')}
                    className={`px-3 sm:px-4 py-2 text-sm rounded-lg font-medium transition-colors ${filter === 'all' ? 'bg-blue-600 text-white shadow-md' : isDark ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                    aria-pressed={filter === 'all'}
                  >
                    All
                  </button>
                  <button
                    onClick={() => handleFilterChange('pending')}
                    className={`px-3 sm:px-4 py-2 text-sm rounded-lg font-medium transition-colors ${filter === 'pending' ? 'bg-yellow-600 text-white shadow-md' : isDark ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                    aria-pressed={filter === 'pending'}
                  >
                    Pending
                  </button>
                  <button
                    onClick={() => handleFilterChange('in-progress')}
                    className={`px-3 sm:px-4 py-2 text-sm rounded-lg font-medium transition-colors ${filter === 'in-progress' ? 'bg-blue-600 text-white shadow-md' : isDark ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                    aria-pressed={filter === 'in-progress'}
                  >
                    In Progress
                  </button>
                  <button
                    onClick={() => handleFilterChange('completed')}
                    className={`px-3 sm:px-4 py-2 text-sm rounded-lg font-medium transition-colors ${filter === 'completed' ? 'bg-green-600 text-white shadow-md' : isDark ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                    aria-pressed={filter === 'completed'}
                  >
                    Completed
                  </button>
                  <button
                    onClick={() => handleFilterChange('high-priority')}
                    className={`px-3 sm:px-4 py-2 text-sm rounded-lg font-medium transition-colors ${filter === 'high-priority' ? 'bg-red-600 text-white shadow-md' : isDark ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                    aria-pressed={filter === 'high-priority'}
                  >
                    High Priority
                  </button>
                </div>
                <div className="flex items-center justify-between sm:justify-end">
                  <label className={`text-sm mr-2 font-medium ${isDark ? 'text-gray-300' : 'text-gray-600'}`} htmlFor="sortBy">Sort by:</label>
                  <select
                    id="sortBy"
                    value={sortBy}
                    onChange={handleSortChange}
                    className={`text-sm border rounded-lg py-2 px-3 ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-700'} w-full sm:w-auto max-w-[150px]`}
                  >
                    <option value="dueDate">Due Date</option>
                    <option value="priority">Priority</option>
                    <option value="title">Title</option>
                    <option value="status">Status</option>
                  </select>
                </div>
              </div>

              {/* Task Cards */}
              <div className="space-y-4">
                {status === 'loading' ? (
                  <div className="text-center py-12 flex justify-center">
                    <svg className="animate-spin h-8 w-8 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  </div>
                ) : status === 'failed' ? (
                  <div className="text-red-500 text-center py-8 bg-red-100 dark:bg-red-900 dark:bg-opacity-20 rounded-lg p-4">
                    <AlertTriangle size={24} className="mx-auto mb-2" />
                    {error}
                  </div>
                ) : tasks.length === 0 ? (
                  <EmptyState onAddClick={() => setModalState({ isOpen: true, task: null })} isDark={isDark} />
                ) : filteredTasks.length > 0 ? (
                  filteredTasks.map(task => (
                    <TaskCard
                      key={task.id}
                      task={task}
                      onToggle={handleToggleStatus}
                      onEdit={handleEditTask}
                      onDelete={handleDeleteTask}
                      isDark={isDark}
                    />
                  ))
                ) : (
                  <div className={`py-10 text-center ${isDark ? 'text-gray-400' : 'text-gray-500'} bg-opacity-20 rounded-lg border ${borderColor}`}>
                    <Filter size={24} className="mx-auto mb-2" />
                    No tasks match your current filters
                    <button
                      onClick={() => handleFilterChange('all')}
                      className={`mt-3 text-sm px-4 py-2 ${isDark ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-gray-200 hover:bg-gray-300 text-gray-800'} rounded-lg transition-colors inline-block`}
                    >
                      Clear filters
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Task Form Modal */}
            {modalState.isOpen && (
              <TaskForm
                initialData={modalState.task || {}}
                onCancel={handleModalClose}
                isDark={isDark}
              />
            )}

            {/* High Priority Tasks */}
            <div className={`${secondaryBg} ${borderColor} border rounded-lg shadow-md p-4 sm:p-6`}>
              <div className="flex justify-between items-center mb-4">
                <h2 className={`text-lg sm:text-xl font-bold ${textColor}`}>High Priority</h2>
                <button
                  onClick={() => handleFilterChange('high-priority')}
                  className={`text-sm flex items-center ${isDark ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-700'} font-medium`}
                  aria-label="View all high priority tasks"
                >
                  <Filter size={14} className="mr-1" /> View all
                </button>
              </div>
              <div className="space-y-3">
                {tasks
                  .filter(task => task.priority === 'high' && task.status !== 'completed')
                  .slice(0, 3)
                  .map(task => (
                    <TaskCard
                      key={task.id}
                      task={task}
                      onToggle={handleToggleStatus}
                      onEdit={handleEditTask}
                      onDelete={handleDeleteTask}
                      isDark={isDark}
                    />
                  ))}
                {tasks.filter(task => task.priority === 'high' && task.status !== 'completed').length === 0 && (
                  <div className={`text-center py-6 ${isDark ? 'text-gray-400' : 'text-gray-500'} bg-opacity-10 rounded-lg`}>
                    <ThumbsUp size={24} className="mx-auto mb-2" />
                    No high priority tasks pending
                  </div>
                )}
              </div>
            </div>

            {/* Upcoming Deadlines */}
            <div className={`${secondaryBg} ${borderColor} border rounded-lg shadow-md p-4 sm:p-6`}>
              <h2 className={`text-lg sm:text-xl font-bold mb-4 ${textColor}`}>Upcoming Deadlines</h2>
              <div className="space-y-3">
                {tasks
                  .filter(task => task.status !== 'completed')
                  .sort((a, b) => new Date(a.due_date) - new Date(b.due_date))
                  .slice(0, 3)
                  .map(task => (
                    <div
                      key={task.id}
                      className={`flex justify-between items-center p-3 sm:p-4 rounded-lg ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-50'} transition-colors border ${borderColor}`}
                    >
                      <div>
                        <p className={`font-medium text-sm sm:text-base ${new Date(task.due_date) < new Date() ? isDark ? 'text-red-400' : 'text-red-600' : isDark ? 'text-gray-200' : 'text-gray-800'}`}>
                          {task.title}
                        </p>
                        <div className={`flex items-center text-xs mt-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                          <Calendar size={12} className="mr-1" />
                          {formatDate(task.due_date)}
                        </div>
                      </div>
                      <PriorityBadge priority={task.priority} isDark={isDark} />
                    </div>
                  ))}
                {tasks.filter(task => task.status !== 'completed').length === 0 && (
                  <div className={`text-center py-6 ${isDark ? 'text-gray-400' : 'text-gray-500'} bg-opacity-10 rounded-lg`}>
                    <Calendar size={24} className="mx-auto mb-2" />
                    No upcoming deadlines
                  </div>
                )}
              </div>
            </div>

            {/* Task Summary */}
            <div className={`${secondaryBg} ${borderColor} border rounded-lg shadow-md p-4 sm:p-6`}>
              <h2 className={`text-lg sm:text-xl font-bold mb-4 ${textColor}`}>Task Summary</h2>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-xs sm:text-sm mb-2">
                    <span className={`${isDark ? 'text-gray-300' : 'text-gray-600'} font-medium`}>Completed</span>
                    <span className={`${isDark ? 'text-gray-300' : 'text-gray-600'} font-medium`}>
                      {stats.completed}/{stats.total} ({stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0}%)
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                    <div
                      className="bg-green-600 h-2.5 rounded-full transition-all duration-500"
                      style={{ width: `${stats.total > 0 ? (stats.completed / stats.total) * 100 : 0}%` }}
                    ></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-xs sm:text-sm mb-2">
                    <span className={`${isDark ? 'text-gray-300' : 'text-gray-600'} font-medium`}>In Progress</span>
                    <span className={`${isDark ? 'text-gray-300' : 'text-gray-600'} font-medium`}>
                      {stats.in_progress}/{stats.total} ({stats.total > 0 ? Math.round((stats.in_progress / stats.total) * 100) : 0}%)
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                    <div
                      className="bg-blue-600 h-2.5 rounded-full transition-all duration-500"
                      style={{ width: `${stats.total > 0 ? (stats.in_progress / stats.total) * 100 : 0}%` }}
                    ></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-xs sm:text-sm mb-2">
                    <span className={`${isDark ? 'text-gray-300' : 'text-gray-600'} font-medium`}>Pending</span>
                    <span className={`${isDark ? 'text-gray-300' : 'text-gray-600'} font-medium`}>
                      {stats.pending}/{stats.total} ({stats.total > 0 ? Math.round((stats.pending / stats.total) * 100) : 0}%)
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                    <div
                      className="bg-yellow-500 h-2.5 rounded-full transition-all duration-500"
                      style={{ width: `${stats.total > 0 ? (stats.pending / stats.total) * 100 : 0}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Calendar Section */}
        <div className="mt-6">
          <div className={`${secondaryBg} ${borderColor} border rounded-lg shadow-md p-4 sm:p-6`}>
            <h2 className={`text-lg sm:text-xl font-bold mb-4 ${textColor}`}>Task Calendar</h2>
            <TaskCalendar
              tasks={tasks}
              onDateClick={(date) => handleFilterChange('date-' + date)}
              onTaskClick={(task) => setModalState({ isOpen: true, task })}
              onAddTask={handleAddTaskFromCalendar}
              isDark={isDark}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskDashboard;