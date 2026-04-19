export const clamp = (value, min, max) => Math.min(max, Math.max(min, value))

export const lerp = (start, end, amount) => start + (end - start) * amount

export const roundToGrid = (value, gridSize = 16) =>
  Math.round(value / gridSize) * gridSize

export const ensureArray = (value) =>
  Array.isArray(value) ? value : value == null ? [] : [value]

export const isTaskComplete = (value) => {
  if (value && typeof value === 'object') {
    return Boolean(
      value.complete
      || value.completed
      || value.isCompleted
      || value.done
      || value.status === 'completed',
    )
  }

  return Boolean(value)
}

export const allTasksComplete = (tasks = {}) =>
  Object.values(tasks).every((taskState) => isTaskComplete(taskState))
