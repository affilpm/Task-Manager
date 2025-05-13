import React, { useState, useMemo, useEffect } from 'react';
import { Calendar, ChevronLeft, ChevronRight, Plus } from 'lucide-react';

const TaskCalendar = ({ tasks, onDateClick, onTaskClick, onAddTask, isDark }) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);

  // Reset selected date when month changes
  useEffect(() => {
    setSelectedDate(null);
  }, [currentMonth]);

  // Generate days in the current month
  const daysInMonth = useMemo(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startingDayOfWeek = firstDay.getDay();
    const days = Array(startingDayOfWeek).fill(null);

    for (let day = 1; day <= lastDay.getDate(); day++) {
      days.push(new Date(year, month, day));
    }

    return days;
  }, [currentMonth]);

  const weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  // Navigate to previous month
  const prevMonth = () => {
    setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  // Navigate to next month
  const nextMonth = () => {
    setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  // Format date as YYYY-MM-DD in local timezone
  const formatDate = (date) => {
    if (!date) return '';
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Get tasks for a specific date
  const getTasksForDate = (date) => {
    if (!date) return [];
    const dateStr = formatDate(date);
    return tasks.filter(task => {
      const taskDate = task.due_date.split('T')[0]; // Strip time if present
      return taskDate === dateStr;
    });
  };

  // Handle date click
  const handleDateClick = (date) => {
    if (!date) return;
    setSelectedDate(date);
    if (onDateClick) onDateClick(formatDate(date));
  };

  // Check if date is today
  const isToday = (date) => {
    if (!date) return false;
    const today = new Date();
    return date.getDate() === today.getDate() &&
           date.getMonth() === today.getMonth() &&
           date.getFullYear() === today.getFullYear();
  };

  // Check if date is selected
  const isSelected = (date) => {
    if (!date || !selectedDate) return false;
    return date.getDate() === selectedDate.getDate() &&
           date.getMonth() === selectedDate.getMonth() &&
           date.getFullYear() === selectedDate.getFullYear();
  };

  // Get task counts by priority for a date
  const getTaskCountsByPriority = (date) => {
    if (!date) return { high: 0, medium: 0, low: 0, total: 0 };
    const tasksForDate = getTasksForDate(date);
    return {
      high: tasksForDate.filter(task => task.priority === 'high').length,
      medium: tasksForDate.filter(task => task.priority === 'medium').length,
      low: tasksForDate.filter(task => task.priority === 'low').length,
      total: tasksForDate.length
    };
  };

  return (
    <div className={`${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border rounded-lg shadow-md p-4 sm:p-6`}>
      {/* Calendar Header */}
      <div className="flex justify-between items-center mb-4">
        <h2 className={`text-lg sm:text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
          <div className="flex items-center">
            <Calendar size={20} className="mr-2" />
            Task Calendar
          </div>
        </h2>
        <div className="flex items-center space-x-1">
          <button
            onClick={prevMonth}
            aria-label="Previous month"
            className={`p-2 rounded-lg ${isDark ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-600 hover:bg-gray-100'} transition-colors`}
          >
            <ChevronLeft size={20} />
          </button>
          <span className={`text-sm font-medium px-2 ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
            {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </span>
          <button
            onClick={nextMonth}
            aria-label="Next month"
            className={`p-2 rounded-lg ${isDark ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-600 hover:bg-gray-100'} transition-colors`}
          >
            <ChevronRight size={20} />
          </button>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-1">
        {/* Weekday Headers */}
        {weekdays.map(day => (
          <div
            key={day}
            className={`text-center text-xs font-medium py-2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}
          >
            {day}
          </div>
        ))}

        {/* Calendar Days */}
        {daysInMonth.map((date, index) => {
          const taskCounts = date ? getTaskCountsByPriority(date) : { total: 0 };

          return (
            <div
              key={index}
              onClick={() => handleDateClick(date)}
              className={`
                relative min-h-16 border rounded-lg p-1 text-sm
                ${!date ? 'invisible' : 'cursor-pointer'}
                ${isToday(date) ? isDark ? 'border-blue-500' : 'border-blue-400' : isDark ? 'border-gray-700' : 'border-gray-200'}
                ${isSelected(date) ? isDark ? 'bg-blue-900 bg-opacity-30' : 'bg-blue-50' : ''}
                ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-50'}
                transition-colors
              `}
            >
              {date && (
                <>
                  <div className={`text-right ${isDark ? 'text-gray-300' : 'text-gray-700'} ${isToday(date) ? 'font-bold' : ''}`}>
                    {date.getDate()}
                  </div>
                  {taskCounts.total > 0 && (
                    <div className="mt-1 flex flex-col gap-1">
                      {taskCounts.high > 0 && (
                        <div className={`text-xs rounded-full py-0.5 px-1.5 text-center font-medium ${isDark ? 'bg-red-900 bg-opacity-40 text-red-300' : 'bg-red-100 text-red-800'}`}>
                          {taskCounts.high} high
                        </div>
                      )}
                      {taskCounts.medium > 0 && (
                        <div className={`text-xs rounded-full py-0.5 px-1.5 text-center font-medium ${isDark ? 'bg-yellow-900 bg-opacity-40 text-yellow-300' : 'bg-yellow-100 text-yellow-800'}`}>
                          {taskCounts.medium} med
                        </div>
                      )}
                      {taskCounts.low > 0 && (
                        <div className={`text-xs rounded-full py-0.5 px-1.5 text-center font-medium ${isDark ? 'bg-green-900 bg-opacity-40 text-green-300' : 'bg-green-100 text-green-800'}`}>
                          {taskCounts.low} low
                        </div>
                      )}
                    </div>
                  )}
                  {/* Quick Add Button */}
                  {taskCounts.total === 0 && (
                    <div
                      className="absolute bottom-1 right-1 opacity-0 group-hover:opacity-100 hover:opacity-100 transition-opacity"
                      onClick={(e) => {
                        e.stopPropagation();
                        onAddTask && onAddTask(formatDate(date));
                      }}
                    >
                      <button
                        className={`w-5 h-5 rounded-full flex items-center justify-center ${isDark ? 'bg-gray-700 hover:bg-gray-600 text-gray-300' : 'bg-gray-200 hover:bg-gray-300 text-gray-700'}`}
                        aria-label="Add task"
                      >
                        <Plus size={12} />
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          );
        })}
      </div>

      {/* Selected Date Tasks */}
      {selectedDate && (
        <div className="mt-4">
          <div className="flex justify-between items-center mb-2">
            <h3 className={`font-medium ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>
              Tasks for {selectedDate.toLocaleDateString()}
            </h3>
            <button
              onClick={() => onAddTask && onAddTask(formatDate(selectedDate))}
              className={`flex items-center text-xs ${isDark ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-700'}`}
            >
              <Plus size={14} className="mr-1" /> Add Task
            </button>
          </div>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {getTasksForDate(selectedDate).length > 0 ? (
              getTasksForDate(selectedDate).map(task => (
                <div
                  key={task.id}
                  onClick={() => onTaskClick && onTaskClick(task)}
                  className={`p-2 rounded-md cursor-pointer flex items-center justify-between ${isDark ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'} transition-colors`}
                >
                  <div className="flex items-center">
                    <div className={`w-2 h-2 rounded-full mr-2 ${
                      task.priority === 'high' ? 'bg-red-500' :
                      task.priority === 'medium' ? 'bg-yellow-500' : 'bg-green-500'
                    }`}></div>
                    <span className={`text-sm truncate max-w-xs ${isDark ? 'text-gray-200' : 'text-gray-800'} ${task.status === 'completed' ? 'line-through opacity-70' : ''}`}>
                      {task.title}
                    </span>
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    task.status === 'completed' ? isDark ? 'bg-green-900 bg-opacity-50 text-green-300' : 'bg-green-100 text-green-800' :
                    task.status === 'in-progress' ? isDark ? 'bg-blue-900 bg-opacity-50 text-blue-300' : 'bg-blue-100 text-blue-800' :
                    isDark ? 'bg-yellow-900 bg-opacity-50 text-yellow-300' : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {task.status.replace('-', ' ')}
                  </span>
                </div>
              ))
            ) : (
              <div className={`text-center py-4 text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                No tasks scheduled for this day
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default TaskCalendar;