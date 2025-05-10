import { createSlice } from '@reduxjs/toolkit';

const taskSlice = createSlice({
  name: 'tasks',
  initialState: {
    tasks: [],
    status: 'idle',
    error: null,
    filter: 'all',
    sortBy: 'dueDate',
    stats: {
      total: 0,
      completed: 0,
      in_progress: 0,
      pending: 0,
      high_priority: 0,
    },
  },
  reducers: {
    setTasks(state, action) {
      state.tasks = action.payload;
      state.status = 'succeeded';
    },
    addTask(state, action) {
      state.tasks.push(action.payload);
      state.stats.total += 1;
      if (action.payload.status === 'completed') state.stats.completed += 1;
      if (action.payload.status === 'in-progress') state.stats.in_progress += 1;
      if (action.payload.status === 'pending') state.stats.pending += 1;
      if (action.payload.priority === 'high') state.stats.high_priority += 1;
    },
    updateTask(state, action) {
      const index = state.tasks.findIndex(task => task.id === action.payload.id);
      if (index !== -1) {
        const oldTask = state.tasks[index];
        state.tasks[index] = action.payload;
        // Update stats
        if (oldTask.status !== action.payload.status) {
          if (oldTask.status === 'completed') state.stats.completed -= 1;
          if (oldTask.status === 'in-progress') state.stats.in_progress -= 1;
          if (oldTask.status === 'pending') state.stats.pending -= 1;
          if (action.payload.status === 'completed') state.stats.completed += 1;
          if (action.payload.status === 'in-progress') state.stats.in_progress += 1;
          if (action.payload.status === 'pending') state.stats.pending += 1;
        }
        if (oldTask.priority !== action.payload.priority) {
          if (oldTask.priority === 'high') state.stats.high_priority -= 1;
          if (action.payload.priority === 'high') state.stats.high_priority += 1;
        }
      }
    },
    deleteTask(state, action) {
      const index = state.tasks.findIndex(task => task.id === action.payload);
      if (index !== -1) {
        const task = state.tasks[index];
        state.tasks.splice(index, 1);
        state.stats.total -= 1;
        if (task.status === 'completed') state.stats.completed -= 1;
        if (task.status === 'in-progress') state.stats.in_progress -= 1;
        if (task.status === 'pending') state.stats.pending -= 1;
        if (task.priority === 'high') state.stats.high_priority -= 1;
      }
    },
    toggleTaskStatus(state, action) {
      const index = state.tasks.findIndex(task => task.id === action.payload);
      if (index !== -1) {
        const task = state.tasks[index];
        const newStatus = task.status === 'completed' ? 'pending' : 'completed';
        state.tasks[index].status = newStatus;
        if (task.status === 'completed') {
          state.stats.completed -= 1;
          state.stats.pending += 1;
        } else {
          state.stats.completed += 1;
          state.stats.pending -= 1;
        }
      }
    },
    setFilter(state, action) {
      state.filter = action.payload;
    },
    setSortBy(state, action) {
      state.sortBy = action.payload;
    },
    setStats(state, action) {
      state.stats = action.payload;
    },
    setLoading(state) {
      state.status = 'loading';
    },
    setError(state, action) {
      state.status = 'failed';
      state.error = action.payload;
    },
  },
});

export const {
  setTasks,
  addTask,
  updateTask,
  deleteTask,
  toggleTaskStatus,
  setFilter,
  setSortBy,
  setStats,
  setLoading,
  setError,
} = taskSlice.actions;

export default taskSlice.reducer;