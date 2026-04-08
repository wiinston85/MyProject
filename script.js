// Singapore timezone helper
const SINGAPORE_TIMEZONE = "Asia/Singapore";

function formatDateSGT(date = new Date()) {
  return new Intl.DateTimeFormat("en-SG", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    timeZone: SINGAPORE_TIMEZONE,
  }).format(date);
}

// Storage management
class TodoStore {
  constructor() {
    this.storageKey = "todos";
    this.todos = this.read();
  }

  read() {
    const stored = localStorage.getItem(this.storageKey);
    return stored ? JSON.parse(stored) : [];
  }

  create(text) {
    const validation = this.validate(text);
    if (!validation.valid) {
      throw new Error(validation.error);
    }

    const todo = {
      id: Date.now(),
      text: text.trim(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.todos.push(todo);
    this.save();
    return todo;
  }

  update(id, text) {
    const validation = this.validate(text);
    if (!validation.valid) {
      throw new Error(validation.error);
    }

    const todo = this.todos.find((t) => t.id === id);
    if (!todo) {
      throw new Error("Todo not found");
    }

    todo.text = text.trim();
    todo.updatedAt = new Date().toISOString();
    this.save();
    return todo;
  }

  delete(id) {
    const index = this.todos.findIndex((t) => t.id === id);
    if (index === -1) {
      throw new Error("Todo not found");
    }

    this.todos.splice(index, 1);
    this.save();
  }

  validate(text) {
    const trimmed = text.trim();

    if (!trimmed) {
      return { valid: false, error: "Todo cannot be empty" };
    }

    if (trimmed.length < 1) {
      return { valid: false, error: "Todo must be at least 1 character" };
    }

    if (trimmed.length > 200) {
      return { valid: false, error: "Todo must not exceed 200 characters" };
    }

    return { valid: true };
  }

  save() {
    localStorage.setItem(this.storageKey, JSON.stringify(this.todos));
  }

  getAll() {
    return this.read();
  }
}

// UI Management
class TodoUI {
  constructor() {
    this.todoForm = document.getElementById("todo-form");
    this.todoInput = document.getElementById("todo-input");
    this.todoList = document.getElementById("todo-list");
    this.errorContainer = document.getElementById("error-messages");
    this.store = new TodoStore();
    this.editingId = null;

    this.init();
  }

  init() {
    this.render();
    this.setupEventListeners();
  }

  setupEventListeners() {
    this.todoForm.addEventListener("submit", (e) => this.handleAddTodo(e));
  }

  handleAddTodo(event) {
    event.preventDefault();

    const text = this.todoInput.value;

    try {
      const todo = this.store.create(text);
      this.todoInput.value = "";
      this.todoInput.focus();
      this.showSuccess(`Todo added: "${todo.text}"`);
      this.render();
    } catch (error) {
      this.showError(error.message);
    }
  }

  handleEdit(id) {
    if (this.editingId !== null) {
      this.showError("Cannot edit multiple todos at once");
      return;
    }

    const todo = this.store.todos.find((t) => t.id === id);
    if (!todo) return;

    this.editingId = id;
    this.render();

    setTimeout(() => {
      const input = document.querySelector(`[data-edit-input="${id}"]`);
      if (input) input.focus();
    }, 0);
  }

  handleSaveEdit(id) {
    const input = document.querySelector(`[data-edit-input="${id}"]`);
    const newText = input.value;

    try {
      this.store.update(id, newText);
      this.editingId = null;
      this.showSuccess("Todo updated");
      this.render();
    } catch (error) {
      this.showError(error.message);
    }
  }

  handleCancelEdit() {
    this.editingId = null;
    this.render();
  }

  handleDelete(id) {
    try {
      const todo = this.store.todos.find((t) => t.id === id);
      const text = todo ? todo.text : "Unknown";

      // Optimistic UI update
      this.markAsPending(id);

      // Simulate async operation
      setTimeout(() => {
        try {
          this.store.delete(id);
          this.showSuccess(`Deleted: "${text}"`);
          this.render();
        } catch (error) {
          this.showError("Failed to delete todo");
          this.render();
        }
      }, 300);
    } catch (error) {
      this.showError(error.message);
    }
  }

  markAsPending(id) {
    const li = document.querySelector(`[data-todo-id="${id}"]`);
    if (li) {
      li.classList.add("pending");
    }
  }

  showError(message) {
    const errorDiv = document.createElement("div");
    errorDiv.className = "error-message";

    const text = document.createElement("span");
    text.textContent = message;

    const closeBtn = document.createElement("button");
    closeBtn.textContent = "×";
    closeBtn.type = "button";
    closeBtn.addEventListener("click", () => {
      errorDiv.remove();
    });

    errorDiv.appendChild(text);
    errorDiv.appendChild(closeBtn);
    this.errorContainer.insertBefore(errorDiv, this.errorContainer.firstChild);

    // Auto-remove after 5 seconds
    setTimeout(() => {
      if (errorDiv.parentNode) {
        errorDiv.remove();
      }
    }, 5000);
  }

  showSuccess(message) {
    const todos = this.store.getAll();
    console.log(`✓ ${message} (Total todos: ${todos.length})`);
  }

  render() {
    this.todoList.innerHTML = "";

    const todos = this.store.getAll();

    if (todos.length === 0) {
      const li = document.createElement("li");
      li.className = "todo-item";
      li.style.justifyContent = "center";
      li.textContent = "No todos yet. Add one to get started!";
      li.style.color = "#9ca3af";
      this.todoList.appendChild(li);
      return;
    }

    todos.forEach((todo) => {
      const li = document.createElement("li");
      li.className = "todo-item";
      li.setAttribute("data-todo-id", todo.id);

      if (this.editingId === todo.id) {
        // Edit mode
        const editForm = document.createElement("div");
        editForm.className = "todo-edit-form";

        const input = document.createElement("input");
        input.type = "text";
        input.className = "todo-edit-input";
        input.value = todo.text;
        input.setAttribute("data-edit-input", todo.id);
        input.maxLength = 200;

        const actionsDiv = document.createElement("div");
        actionsDiv.className = "todo-actions";

        const saveBtn = document.createElement("button");
        saveBtn.type = "button";
        saveBtn.className = "save-btn";
        saveBtn.textContent = "Save";
        saveBtn.addEventListener("click", () => this.handleSaveEdit(todo.id));

        const cancelBtn = document.createElement("button");
        cancelBtn.type = "button";
        cancelBtn.className = "cancel-btn";
        cancelBtn.textContent = "Cancel";
        cancelBtn.addEventListener("click", () => this.handleCancelEdit());

        actionsDiv.appendChild(saveBtn);
        actionsDiv.appendChild(cancelBtn);

        editForm.appendChild(input);
        editForm.appendChild(actionsDiv);
        li.appendChild(editForm);
      } else {
        // Display mode
        const contentDiv = document.createElement("div");
        contentDiv.className = "todo-content";

        const textSpan = document.createElement("span");
        textSpan.className = "todo-text";
        textSpan.textContent = todo.text;

        const timestampSpan = document.createElement("span");
        timestampSpan.className = "todo-timestamp";
        const createdDate = new Date(todo.createdAt);
        timestampSpan.textContent = `Created: ${formatDateSGT(createdDate)}`;

        contentDiv.appendChild(textSpan);
        contentDiv.appendChild(timestampSpan);

        const actionsDiv = document.createElement("div");
        actionsDiv.className = "todo-actions";

        const editBtn = document.createElement("button");
        editBtn.type = "button";
        editBtn.className = "edit-btn";
        editBtn.textContent = "Edit";
        editBtn.addEventListener("click", () => this.handleEdit(todo.id));

        const deleteBtn = document.createElement("button");
        deleteBtn.type = "button";
        deleteBtn.className = "delete-btn";
        deleteBtn.textContent = "Delete";
        deleteBtn.addEventListener("click", () => this.handleDelete(todo.id));

        actionsDiv.appendChild(editBtn);
        actionsDiv.appendChild(deleteBtn);

        li.appendChild(contentDiv);
        li.appendChild(actionsDiv);
      }

      this.todoList.appendChild(li);
    });
  }
}

// Initialize app
document.addEventListener("DOMContentLoaded", () => {
  new TodoUI();
});
