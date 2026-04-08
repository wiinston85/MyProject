# Todo CRUD Operations Documentation

## Overview

The Todo App implements comprehensive Create, Read, Update, and Delete (CRUD) operations with persistent storage, validation, error handling, and Singapore timezone support.

---

## Architecture

### TodoStore Class
Manages all data operations and persistence via `localStorage`.

### TodoUI Class
Handles user interactions, rendering, and error display.

---

## CRUD Operations

### CREATE - Add a Todo

**Method**: `TodoStore.create(text)`

**Validation Rules**:
- Text must not be empty
- Length: 1-200 characters
- Automatically trimmed

**Storage**:
```javascript
{
  id: Date.now(),
  text: "string",
  createdAt: "ISO 8601 timestamp",
  updatedAt: "ISO 8601 timestamp"
}
```

**Example**:
```javascript
const store = new TodoStore();
try {
  const todo = store.create("Buy groceries");
  console.log(todo.id); // 1712577600000
} catch (error) {
  console.error(error.message); // "Todo cannot be empty"
}
```

**Error Cases**:
- Empty string: `"Todo cannot be empty"`
- Over 200 characters: `"Todo must not exceed 200 characters"`

---

### READ - Retrieve Todos

**Method**: `TodoStore.getAll()`

Returns array of all todos from localStorage.

**Example**:
```javascript
const todos = store.getAll();
// [
//   {
//     id: 1712577600000,
//     text: "Buy groceries",
//     createdAt: "2026-04-08T10:00:00.000Z",
//     updatedAt: "2026-04-08T10:00:00.000Z"
//   }
// ]
```

**Local Storage**:
- Key: `"todos"`
- Value: JSON stringified array of todos
- Persists across browser sessions

---

### UPDATE - Edit a Todo

**Method**: `TodoStore.update(id, text)`

**Validation**:
- Same as CREATE (1-200 characters, non-empty)
- Updates `updatedAt` timestamp

**Returns**:
Updated todo object with new text and timestamp.

**Example**:
```javascript
const updatedTodo = store.update(1712577600000, "Buy groceries and milk");
console.log(updatedTodo.updatedAt); // "2026-04-08T10:05:00.000Z"
```

**Error Cases**:
- Invalid text: Same validation errors as CREATE
- Todo not found: `"Todo not found"`

**UI Flow**:
1. User clicks "Edit" button
2. Input field appears with current text
3. User modifies text with 200-character limit enforced
4. User clicks "Save" to commit or "Cancel" to discard

---

### DELETE - Remove a Todo

**Method**: `TodoStore.delete(id)`

**Implementation**:
- Removes todo from array
- Saves updated array to localStorage
- No return value

**Example**:
```javascript
store.delete(1712577600000);
console.log(store.getAll().length); // Decreased by 1
```

**Error Cases**:
- Todo not found: `"Todo not found"`

**Optimistic UI**:
1. Item immediately becomes semi-transparent (opacity: 0.6)
2. 300ms delay simulates async operation
3. Item removed from DOM
4. Success message displayed

---

## Validation Rules

### Text Content
| Rule | Requirement |
|------|-------------|
| Empty check | Cannot be empty |
| Min length | 1 character |
| Max length | 200 characters |
| Trimming | Leading/trailing whitespace removed |

### Validation Method
```javascript
validate(text) {
  const trimmed = text.trim();
  
  if (!trimmed) {
    return { valid: false, error: "Todo cannot be empty" };
  }
  
  if (trimmed.length > 200) {
    return { valid: false, error: "Todo must not exceed 200 characters" };
  }
  
  return { valid: true };
}
```

---

## Error Handling

### Error Messages
All errors display in the error container and auto-dismiss after 5 seconds.

**Dismissible**: User can manually close errors with × button.

**Error Scenarios**:
| Scenario | Error Message |
|----------|---------------|
| Empty input | "Todo cannot be empty" |
| Text > 200 chars | "Todo must not exceed 200 characters" |
| Duplicate edit attempt | "Cannot edit multiple todos at once" |
| Delete non-existent todo | "Todo not found" |
| Update non-existent todo | "Todo not found" |

---

## Singapore Timezone (SGT)

### Timestamp Display
All timestamps display in Singapore timezone using `Intl.DateTimeFormat`.

**Format**: `DD/MM/YYYY, HH:MM:SS`

**Example Output**:
```
Created: 08/04/2026, 10:00:00
```

**Implementation**:
```javascript
function formatDateSGT(date = new Date()) {
  return new Intl.DateTimeFormat("en-SG", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    timeZone: "Asia/Singapore",
  }).format(date);
}
```

---

## Data Persistence

### LocalStorage
- **Storage Key**: `"todos"`
- **Storage Type**: JSON stringified array
- **Capacity**: ~5-10MB (browser dependent)
- **Persistence**: Across browser sessions

### Save Trigger
Automatically saves after every CREATE, UPDATE, or DELETE operation.

**Manual Save Method**:
```javascript
store.save(); // JSON.stringify and save to localStorage
```

---

## Event Flow

### Add Todo
```
User Input → Form Submit → Validation → Create → Save → Render → Clear Input
```

### Edit Todo
```
Click Edit → Render Input Field → User Edits → Click Save → Validation → Update → Save → Render
```

### Delete Todo
```
Click Delete → Mark Pending (UI) → 300ms Delay → Delete → Save → Render → Success Message
```

---

## Usage Example

```javascript
// Initialize UI (automatically creates store and renders)
document.addEventListener("DOMContentLoaded", () => {
  const ui = new TodoUI();
});

// Programmatic access via store
const store = new TodoStore();

// Create
const todo = store.create("Learn CRUD operations");

// Read
const allTodos = store.getAll();
console.log(allTodos[0].text);

// Update
store.update(allTodos[0].id, "Learn CRUD and localStorage");

// Delete
store.delete(allTodos[0].id);
```

---

## Testing CRUD Operations

### In Browser Console

```javascript
// Get store instance from UI
const ui = new TodoUI();
const store = ui.store;

// Test CREATE
store.create("Test todo");

// Test READ
console.log(store.getAll());

// Get first todo ID
const firstId = store.getAll()[0].id;

// Test UPDATE
store.update(firstId, "Updated test todo");

// Test DELETE
store.delete(firstId);

// Verify deletion
console.log(store.getAll().length);
```

---

## Limitations & Future Enhancements

### Current Limitations
- No backend sync (client-side only)
- No undo/redo functionality
- No filtering or sorting options
- No priority levels or categories
- Single user, no multi-device sync

### Potential Enhancements
- Backend API integration for sync
- Todo categories or tags
- Priority levels (high, medium, low)
- Due dates and reminders
- Dark mode support
- Batch operations (delete multiple)
- Search and filter functionality
- Undo/redo stack
