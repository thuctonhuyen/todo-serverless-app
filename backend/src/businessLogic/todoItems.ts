import * as uuid from 'uuid';

import { TodoItem } from '../models/TodoItem';
import { TodoItemAccess } from '../dataLayer/todoItemsAccess';
import { CreateTodoRequest } from '../requests/CreateTodoRequest';
import { UpdateTodoRequest } from '../requests/UpdateTodoRequest';
import { parseUserId } from '../auth/utils';

const todoItemAccess = new TodoItemAccess();

export async function getAllTodoItems(jwtToken: string): Promise<TodoItem[]> {
  const userId: string = parseUserId(jwtToken);
  return todoItemAccess.getAllTodoItems(userId);
}

export async function createTodoItem(
  createTodoItemRequest: CreateTodoRequest,
  jwtToken: string,
) : Promise<TodoItem> {
  const itemId = uuid.v4();
  const userId = parseUserId(jwtToken);

  return await todoItemAccess.createTodoItem({
    userId: userId,
    todoId: itemId,
    createdAt: new Date().toISOString(),
    name: createTodoItemRequest.name,
    dueDate: createTodoItemRequest.dueDate,
    done: false,
  });
};

export async function deleteTodoItem(
  todoId: string,
  jwtToken: string,
) {
  const userId = parseUserId(jwtToken);

  return await todoItemAccess.deleteTodoItem(
    todoId, userId,
  );
}

export async function updateTodoItem(
  todoId: string,
  updateTodoItemRequest: UpdateTodoRequest,
  jwtToken: string,
) {
  const userId = parseUserId(jwtToken);

  return await todoItemAccess.updateTodoItem(
    todoId, updateTodoItemRequest, userId,
  );
}

export async function todoItemExist(
  todoId: string,
  jwtToken: string,
) {
  const userId = parseUserId(jwtToken);

  return await todoItemAccess.getTodoItem(
    todoId, userId,
  );
}

export async function updateTodoItemAttachmentUrl(
  todoId: string,
  jwtToken: string,
  attachmentUrl: string,
) {
  const userId = parseUserId(jwtToken);

  return await todoItemAccess.updateTodoItemAttachmentUrl(
    todoId, userId, attachmentUrl,
  );
}