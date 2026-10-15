(() => {
  const STORAGE_KEY = "studyflow-tasks";
  const THEME_KEY = "studyflow-theme";

  const form = document.getElementById("taskForm");
  const input = document.getElementById("taskInput");
  const errorEl = document.getElementById("taskError");
  const listEl = document.getElementById("taskList");
  const emptyState = document.getElementById("emptyState");
  const totalCount = document.getElementById("totalCount");
  const completedCount = document.getElementById("completedCount");
  const pendingCount = document.getElementById("pendingCount");
  const progressBar = document.getElementById("progressBar");
  const progressFill = document.getElementById("progressFill");
  const progressCaption = document.getElementById("progressCaption");
  const themeToggle = document.getElementById("themeToggle");
  const liveRegion = document.getElementById("liveRegion");
  const filterButtons = Array.from(document.querySelectorAll("[data-filter]"));

  let tasks = [];
  let currentFilter = "all";

  applyTheme(loadTheme());

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }

  function init() {
    tasks = loadTasks();
    applyTheme(loadTheme());
    render();
    bindEvents();
  }

  function bindEvents() {
    form.addEventListener("submit", onSubmit);
    input.addEventListener("input", clearValidation);
    listEl.addEventListener("change", onListChange);
    listEl.addEventListener("click", onListClick);
    themeToggle.addEventListener("click", toggleTheme);
    filterButtons.forEach((button) => {
      button.addEventListener("click", () => setFilter(button.dataset.filter));
    });
  }

  function onSubmit(event) {
    event.preventDefault();
    const title = input.value.trim();

    if (!title) {
      showValidation("Please enter a study task before adding it.");
      input.focus();
      return;
    }

    tasks.unshift({
      id: createId(),
      title,
      completed: false,
      createdAt: Date.now(),
    });

    persistTasks();
    clearValidation();
    input.value = "";
    input.focus();
    announce(`Added task: ${title}.`);
    render();
  }

  function onListChange(event) {
    const checkbox = event.target.closest("[data-action='toggle']");
    if (!checkbox) return;

    const task = findTask(checkbox.closest(".task-item")?.dataset.id);
    if (!task) return;

    task.completed = checkbox.checked;
    persistTasks();
    announce(
      task.completed
        ? `Marked complete: ${task.title}.`
        : `Marked incomplete: ${task.title}.`
    );
    render();
  }

  function onListClick(event) {
    const button = event.target.closest("[data-action='delete']");
    if (!button) return;

    const id = button.closest(".task-item")?.dataset.id;
    const task = findTask(id);
    if (!task) return;

    tasks = tasks.filter((item) => item.id !== id);
    persistTasks();
    announce(`Deleted task: ${task.title}.`);
    render();
    input.focus();
  }

  function setFilter(filter) {
    currentFilter = filter;
    filterButtons.forEach((button) => {
      const isActive = button.dataset.filter === filter;
      button.classList.toggle("is-active", isActive);
      button.setAttribute("aria-selected", String(isActive));
    });
    render();
  }

  function render() {
    const visibleTasks = getVisibleTasks();
    listEl.replaceChildren();

    visibleTasks.forEach((task) => {
      listEl.appendChild(createTaskElement(task));
    });

    const hasVisible = visibleTasks.length > 0;
    emptyState.hidden = hasVisible;
    emptyState.textContent = getEmptyMessage();
    updateStats();
  }

  function createTaskElement(task) {
    const item = document.createElement("li");
    item.className = `task-item${task.completed ? " completed" : ""}`;
    item.dataset.id = task.id;

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.className = "task-check";
    checkbox.checked = task.completed;
    checkbox.dataset.action = "toggle";
    checkbox.setAttribute("aria-label", `Mark ${task.title} as ${task.completed ? "incomplete" : "complete"}`);

    const title = document.createElement("p");
    title.className = "task-title";
    title.textContent = task.title;

    const deleteBtn = document.createElement("button");
    deleteBtn.type = "button";
    deleteBtn.className = "delete-btn icon-btn";
    deleteBtn.dataset.action = "delete";
    deleteBtn.setAttribute("aria-label", `Delete ${task.title}`);
    deleteBtn.textContent = "Delete";

    item.append(checkbox, title, deleteBtn);
    return item;
  }

  function updateStats() {
    const total = tasks.length;
    const completed = tasks.filter((task) => task.completed).length;
    const pending = total - completed;
    const percent = total === 0 ? 0 : Math.round((completed / total) * 100);

    totalCount.textContent = String(total);
    completedCount.textContent = String(completed);
    pendingCount.textContent = String(pending);

    progressFill.style.width = `${percent}%`;
    progressBar.setAttribute("aria-valuenow", String(percent));
    progressCaption.textContent =
      total === 0
        ? "No tasks yet. Add your first study goal."
        : `${percent}% complete · ${pending} pending`;
  }

  function getVisibleTasks() {
    if (currentFilter === "active") {
      return tasks.filter((task) => !task.completed);
    }
    if (currentFilter === "completed") {
      return tasks.filter((task) => task.completed);
    }
    return tasks;
  }

  function getEmptyMessage() {
    if (tasks.length === 0) {
      return "No study tasks yet. Add one above to start your flow.";
    }
    if (currentFilter === "active") {
      return "No active tasks. Everything on your list is complete.";
    }
    if (currentFilter === "completed") {
      return "No completed tasks yet. Check one off to see it here.";
    }
    return "No study tasks yet. Add one above to start your flow.";
  }

  function showValidation(message) {
    errorEl.hidden = false;
    errorEl.textContent = message;
    input.classList.add("is-invalid");
    input.setAttribute("aria-invalid", "true");
  }

  function clearValidation() {
    errorEl.hidden = true;
    errorEl.textContent = "";
    input.classList.remove("is-invalid");
    input.removeAttribute("aria-invalid");
  }

  function announce(message) {
    liveRegion.textContent = "";
    window.setTimeout(() => {
      liveRegion.textContent = message;
    }, 50);
  }

  function findTask(id) {
    return tasks.find((task) => task.id === id);
  }

  function persistTasks() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
    } catch (error) {
      announce("Could not save tasks in this browser.");
    }
  }

  function loadTasks() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) return [];
      return parsed
        .filter((task) => task && typeof task.title === "string" && task.title.trim())
        .map((task) => ({
          id: String(task.id || createId()),
          title: task.title.trim(),
          completed: Boolean(task.completed),
          createdAt: Number(task.createdAt) || Date.now(),
        }));
    } catch (error) {
      return [];
    }
  }

  function toggleTheme() {
    const next = document.documentElement.getAttribute("data-theme") === "dark" ? "light" : "dark";
    applyTheme(next);
    persistTheme(next);
  }

  function applyTheme(theme) {
    const isDark = theme === "dark";
    document.documentElement.setAttribute("data-theme", isDark ? "dark" : "light");
    themeToggle.setAttribute("aria-pressed", String(isDark));
    themeToggle.setAttribute("aria-label", isDark ? "Switch to light mode" : "Switch to dark mode");
    themeToggle.querySelector(".theme-icon").textContent = isDark ? "☀️" : "🌙";
    themeToggle.querySelector(".theme-label").textContent = isDark ? "Light" : "Dark";
  }

  function persistTheme(theme) {
    try {
      localStorage.setItem(THEME_KEY, theme);
    } catch (error) {
      // Theme still applies for this session even if storage is blocked.
    }
  }

  function loadTheme() {
    try {
      const saved = localStorage.getItem(THEME_KEY);
      if (saved === "dark" || saved === "light") return saved;
    } catch (error) {
      // Fall through to system preference.
    }
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  }

  function createId() {
    if (window.crypto && typeof window.crypto.randomUUID === "function") {
      return window.crypto.randomUUID();
    }
    return `task-${Date.now()}-${Math.random().toString(16).slice(2)}`;
  }
})();
