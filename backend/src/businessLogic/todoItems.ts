// import * as uuid from 'uuid';

import { TodoItem } from '../models/TodoItem';
import { TodoItemAccess } from '../dataLayer/todoItemsAccess';

const todoItemAccess = new TodoItemAccess();

export async function getAllTodoItems(): Promise<TodoItem[]> {
  return todoItemAccess.getAllTodoItems();
}