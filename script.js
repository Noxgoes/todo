const STORAGE_KEY = "todo-list.tasks";

const state = {
  tasks: loadTasks(),
  filter: "all",
};

const taskForm = document.querySelector("#task-form");
const taskInput = document.querySelector("#task-input");
const priorityInput = document.querySelector("#priority-input");
const dueInput = document.querySelector("#due-input");
const searchInput = document.querySelector("#search-input");
const taskList = document.querySelector("#task-list");
const taskTemplate = document.querySelector("#task-template");
const filterButtons = document.querySelectorAll("[data-filter]");
const clearCompletedButton = document.querySelector("#clear-completed");
const taskCount = document.querySelector("#task-count");
const totalCount = document.querySelector("#total-count");
const activeCountElement = document.querySelector("#active-count");
const completedCount = document.querySelector("#completed-count");
const progressPercent = document.querySelector("#progress-percent");
const completionDonut = document.querySelector("#completion-donut");
const miniProgress = document.querySelector(".mini-progress");
const miniProgressPercent = document.querySelector("#mini-progress-percent");
const miniProgressLabel = document.querySelector("#mini-progress-label");
const navTotal = document.querySelector("#nav-total");
const navActive = document.querySelector("#nav-active");
const navCompleted = document.querySelector("#nav-completed");
const highCount = document.querySelector("#high-count");
const mediumCount = document.querySelector("#medium-count");
const lowCount = document.querySelector("#low-count");
const focusTaskInput = document.querySelector("#focus-task-input");

taskForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const title = taskInput.value.trim();
  if (!title) return;

  state.tasks.unshift({
    id: crypto.randomUUID(),
    title,
    priority: priorityInput.value,
    dueDate: dueInput.value,
    completed: false,
    createdAt: Date.now(),
  });

  taskInput.value = "";
  priorityInput.value = "medium";
  dueInput.value = "";
  saveAndRender();
});

taskList.addEventListener("click", (event) => {
  const actionElement = event.target.closest("[data-action]");
  if (!actionElement) return;

  const taskItem = event.target.closest(".task-item");
  const task = findTask(taskItem?.dataset.id);
  if (!task) return;

  const action = actionElement.dataset.action;

  if (action === "toggle") {
    task.completed = actionElement.checked;
    saveAndRender();
  }

  if (action === "edit") {
    enterEditMode(taskItem, task.title);
  }

  if (action === "delete") {
    state.tasks = state.tasks.filter((currentTask) => currentTask.id !== task.id);
    saveAndRender();
  }
});

taskList.addEventListener("submit", (event) => {
  if (!event.target.matches(".edit-form")) return;
  event.preventDefault();
  commitEdit(event.target);
});

taskList.addEventListener("focusout", (event) => {
  if (!event.target.matches("[data-action='edit-input']")) return;
  commitEdit(event.target.form);
});

taskList.addEventListener("keydown", (event) => {
  if (!event.target.matches("[data-action='edit-input']")) return;

  if (event.key === "Escape") {
    render();
  }
});

document.addEventListener("click", (event) => {
  const button = event.target.closest("[data-filter]");
  if (!button) return;

  state.filter = button.dataset.filter;
  render();
});

searchInput.addEventListener("input", render);

focusTaskInput.addEventListener("click", () => {
  taskInput.focus();
});

clearCompletedButton.addEventListener("click", () => {
  state.tasks = state.tasks.filter((task) => !task.completed);
  saveAndRender();
});

render();

function render() {
  taskList.replaceChildren();

  getVisibleTasks().forEach((task) => {
    const item = taskTemplate.content.firstElementChild.cloneNode(true);
    const checkbox = item.querySelector("[data-action='toggle']");
    const title = item.querySelector(".task-check span");
    const editInput = item.querySelector("[data-action='edit-input']");
    const priority = item.querySelector(".priority-pill");
    const dueDate = item.querySelector(".due-pill");
    const taskPriority = task.priority || "medium";

    item.dataset.id = task.id;
    item.classList.toggle("completed", task.completed);
    item.classList.add(`priority-${taskPriority}`);
    checkbox.checked = task.completed;
    title.textContent = task.title;
    editInput.value = task.title;
    priority.textContent = capitalize(taskPriority);
    priority.classList.add(taskPriority);
    dueDate.textContent = formatDueDate(task.dueDate);
    dueDate.hidden = !task.dueDate;
    dueDate.classList.toggle("overdue", isOverdue(task));

    taskList.append(item);
  });

  filterButtons.forEach((button) => {
    button.classList.toggle("active", button.dataset.filter === state.filter);
  });

  const activeCount = state.tasks.filter((task) => !task.completed).length;
  const doneCount = state.tasks.length - activeCount;
  const completion = state.tasks.length ? Math.round((doneCount / state.tasks.length) * 100) : 0;
  const highPriorityCount = state.tasks.filter((task) => (task.priority || "medium") === "high").length;
  const mediumPriorityCount = state.tasks.filter((task) => (task.priority || "medium") === "medium").length;
  const lowPriorityCount = state.tasks.filter((task) => (task.priority || "medium") === "low").length;
  const progressDegrees = completion * 3.6;

  taskCount.textContent = `${activeCount} ${activeCount === 1 ? "active task" : "active tasks"}`;
  totalCount.textContent = state.tasks.length;
  activeCountElement.textContent = activeCount;
  completedCount.textContent = doneCount;
  progressPercent.textContent = `${completion}%`;
  completionDonut.style.background = `conic-gradient(var(--yellow) 0deg, var(--yellow) ${progressDegrees}deg, #ffeaa3 ${progressDegrees}deg 360deg)`;
  miniProgress.style.background = `conic-gradient(var(--yellow) 0deg, var(--yellow) ${progressDegrees}deg, #ffeaa3 ${progressDegrees}deg 360deg)`;
  miniProgressPercent.textContent = `${completion}%`;
  miniProgressLabel.textContent = `${doneCount} of ${state.tasks.length} tasks`;
  navTotal.textContent = state.tasks.length;
  navActive.textContent = activeCount;
  navCompleted.textContent = doneCount;
  highCount.textContent = highPriorityCount;
  mediumCount.textContent = mediumPriorityCount;
  lowCount.textContent = lowPriorityCount;
  clearCompletedButton.disabled = !state.tasks.some((task) => task.completed);
}

function getVisibleTasks() {
  if (state.filter === "active") {
    return searchTasks(state.tasks.filter((task) => !task.completed));
  }

  if (state.filter === "completed") {
    return searchTasks(state.tasks.filter((task) => task.completed));
  }

  return searchTasks(state.tasks);
}

function enterEditMode(taskItem, title) {
  taskItem.classList.add("editing");
  const input = taskItem.querySelector("[data-action='edit-input']");
  input.value = title;
  input.focus();
  input.select();
}

function commitEdit(form) {
  const taskItem = form.closest(".task-item");
  const task = findTask(taskItem?.dataset.id);
  if (!task) return;

  const input = form.querySelector("[data-action='edit-input']");
  const nextTitle = input.value.trim();

  if (!nextTitle) {
    state.tasks = state.tasks.filter((currentTask) => currentTask.id !== task.id);
  } else {
    task.title = nextTitle;
  }

  saveAndRender();
}

function findTask(id) {
  return state.tasks.find((task) => task.id === id);
}

function saveAndRender() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state.tasks));
  render();
}

function loadTasks() {
  try {
    const savedTasks = JSON.parse(localStorage.getItem(STORAGE_KEY));
    return Array.isArray(savedTasks) ? savedTasks : [];
  } catch {
    return [];
  }
}

function searchTasks(tasks) {
  const searchTerm = searchInput.value.trim().toLowerCase();
  if (!searchTerm) return tasks;

  return tasks.filter((task) => task.title.toLowerCase().includes(searchTerm));
}

function formatDueDate(value) {
  if (!value) return "";

  const date = new Date(`${value}T00:00:00`);
  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
}

function isOverdue(task) {
  if (!task.dueDate || task.completed) return false;

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return new Date(`${task.dueDate}T00:00:00`) < today;
}

function capitalize(value) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}
