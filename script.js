// ------- Elements -------
const taskForm = document.getElementById("task-form");
const taskInput = document.getElementById("task-input");
const taskList = document.getElementById("task-list");
const filterBtns = document.querySelectorAll(".filter-btn");
const counterEl = document.getElementById("task-counter");
const clearBtn = document.getElementById("clear-completed-btn");
const darkToggle = document.getElementById("dark-mode-toggle");

// ------- State -------
let tasks = JSON.parse(localStorage.getItem("tasks") || "[]");
let currentFilter = localStorage.getItem("taskFilter") || "all";

// Ensure tasks have stable ids
tasks = tasks.map(t => (t.id ? t : { ...t, id: cryptoRandomId() }));

// ------- Utils -------
function saveTasks() {
  localStorage.setItem("tasks", JSON.stringify(tasks));
}
function cryptoRandomId() {
  // Stable, unique id (works offline)
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}
function setActiveFilterButton() {
  filterBtns.forEach(b => {
    b.classList.toggle("active", b.dataset.filter === currentFilter);
  });
}

// ------- Render -------
function render() {
  taskList.innerHTML = "";

  const filtered = tasks.filter(t =>
    currentFilter === "completed" ? t.completed :
    currentFilter === "pending"   ? !t.completed : true
  );

  for (const task of filtered) {
    const li = document.createElement("li");
    li.className = `task ${task.completed ? "completed" : ""}`;
    li.dataset.id = task.id;

    const left = document.createElement("div");
    left.className = "task-left";

    const cb = document.createElement("input");
    cb.type = "checkbox";
    cb.checked = task.completed;
    cb.className = "toggle";

    const span = document.createElement("span");
    span.className = "task-text";
    span.textContent = task.text;

    left.append(cb, span);

    const actions = document.createElement("div");
    actions.className = "task-actions";

    const editBtn = document.createElement("button");
    editBtn.type = "button";
    editBtn.className = "action-btn edit-btn";
    editBtn.textContent = "Edit";

    const delBtn = document.createElement("button");
    delBtn.type = "button";
    delBtn.className = "action-btn delete-btn";
    delBtn.textContent = "Delete";

    actions.append(editBtn, delBtn);
    li.append(left, actions);
    taskList.appendChild(li);
  }

  // counter
  const pending = tasks.filter(t => !t.completed).length;
  counterEl.textContent =
    tasks.length === 0 ? "No tasks yet. Add one above!" :
    pending === 0       ? "🎉 All tasks completed!" :
                          `${pending} task(s) left`;

  setActiveFilterButton();
}

// ------- Actions -------
function addTask(text) {
  const t = text.trim();
  if (!t) return;
  tasks.push({ id: cryptoRandomId(), text: t, completed: false });
  saveTasks();
  render();
}

function toggleTask(id) {
  const idx = tasks.findIndex(t => t.id === id);
  if (idx > -1) {
    tasks[idx].completed = !tasks[idx].completed;
    saveTasks();
    render();
  }
}

function deleteTask(id) {
  tasks = tasks.filter(t => t.id !== id);
  saveTasks();
  render();
}

function editTask(id) {
  const idx = tasks.findIndex(t => t.id === id);
  if (idx === -1) return;
  const current = tasks[idx].text;
  const next = prompt("Edit your task:", current);
  if (next !== null) {
    const cleaned = next.trim();
    if (cleaned) {
      tasks[idx].text = cleaned;
      saveTasks();
      render();
    }
  }
}

function clearCompleted() {
  tasks = tasks.filter(t => !t.completed);
  saveTasks();
  render();
}

// ------- Events -------
// Add via form submit (Enter works too)
taskForm.addEventListener("submit", (e) => {
  e.preventDefault();
  addTask(taskInput.value);
  taskInput.value = "";
  taskInput.focus();
});

// Event delegation for list
taskList.addEventListener("change", (e) => {
  if (e.target.classList.contains("toggle")) {
    const li = e.target.closest("li.task");
    toggleTask(li.dataset.id);
  }
});
taskList.addEventListener("click", (e) => {
  const li = e.target.closest("li.task");
  if (!li) return;
  const id = li.dataset.id;

  if (e.target.classList.contains("delete-btn")) deleteTask(id);
  if (e.target.classList.contains("edit-btn"))   editTask(id);
});

// Filters
filterBtns.forEach(btn => {
  btn.addEventListener("click", () => {
    currentFilter = btn.dataset.filter;
    localStorage.setItem("taskFilter", currentFilter);
    render();
  });
});

// Clear completed
clearBtn.addEventListener("click", clearCompleted);

// Dark mode
if (localStorage.getItem("darkMode") === "enabled") {
  document.body.classList.add("dark");
  darkToggle.textContent = "☀️ Light Mode";
  darkToggle.setAttribute("aria-pressed", "true");
}
darkToggle.addEventListener("click", () => {
  const enabled = document.body.classList.toggle("dark");
  localStorage.setItem("darkMode", enabled ? "enabled" : "disabled");
  darkToggle.textContent = enabled ? "☀️ Light Mode" : "🌙 Dark Mode";
  darkToggle.setAttribute("aria-pressed", enabled ? "true" : "false");
});

// ------- Initial -------
render();
