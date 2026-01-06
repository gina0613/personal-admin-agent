import { promises as fs } from 'fs';
import path from 'path';

const filePath = path.join(process.cwd(), 'src/data/todos.json');

async function readTodos() {
  const data = await fs.readFile(filePath, 'utf-8');
  return JSON.parse(data);
}

async function writeTodos(data) {
  await fs.writeFile(filePath, JSON.stringify(data, null, 2));
}

/**
 * Get all todos
 */
export async function getTodos() {
  const data = await readTodos();
  return data.todos;
}

/**
 * Create a new todo
 * @param {string} title - Todo title
 * @param {string} [priority] - Priority: low, medium, high
 * @param {string} [dueDate] - Due date in YYYY-MM-DD format
 */
export async function createTodo(title, priority = 'medium', dueDate = null) {
  const data = await readTodos();

  const newTodo = {
    id: Date.now().toString(),
    title,
    priority,
    dueDate,
    completed: false,
    createdAt: new Date().toISOString(),
  };

  data.todos.push(newTodo);
  await writeTodos(data);

  return newTodo;
}

/**
 * Mark a todo as completed
 * @param {string} id - Todo ID
 */
export async function completeTodo(id) {
  const data = await readTodos();
  const todo = data.todos.find(t => t.id === id);

  if (todo) {
    todo.completed = true;
    todo.completedAt = new Date().toISOString();
    await writeTodos(data);
  }

  return todo;
}

/**
 * Delete a todo
 * @param {string} id - Todo ID
 */
export async function deleteTodo(id) {
  const data = await readTodos();
  const index = data.todos.findIndex(t => t.id === id);

  if (index !== -1) {
    const deleted = data.todos.splice(index, 1)[0];
    await writeTodos(data);
    return deleted;
  }

  return null;
}
