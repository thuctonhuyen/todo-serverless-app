import * as AWS  from 'aws-sdk';
import * as AWSXRay from 'aws-xray-sdk'
import { DocumentClient } from 'aws-sdk/clients/dynamodb';
import * as _ from 'lodash';

import { TodoItem } from '../models/TodoItem';
import { TodoUpdate } from '../models/TodoUpdate';
import { UpdateTodoRequest } from '../requests/UpdateTodoRequest';
import { createLogger } from '../utils/logger';

const logger = createLogger('TodoItemAccess');
const XAWS = AWSXRay.captureAWS(AWS);

export class TodoItemAccess {
  constructor (
    private readonly docClient: DocumentClient = createDynamoDBClient(),
    private readonly todoItemsTable: string = process.env.TODOITEMS_TABLE,
  ) {}

  async getAllTodoItems(userId: string): Promise<TodoItem[]> {
    logger.info('Getting all Todo Items for user', { userId } );

    const result = await this.docClient.query({
      TableName: this.todoItemsTable,
      KeyConditionExpression: 'userId = :userId',
      ExpressionAttributeValues: {
        ':userId': userId,
      }
    }).promise();

    const items = result.Items;
    return items as TodoItem[];
  }

  async createTodoItem(todoItem: TodoItem): Promise<TodoItem> {
    logger.info('Create Todo Item', { todoItem });

    await this.docClient.put({
      TableName: this.todoItemsTable,
      Item: todoItem,
    }).promise();

    logger.info('Successfully created TodoItem', todoItem);
    return todoItem;
  }

  async deleteTodoItem(todoId: string, userId: string) {
    try {
      logger.info('Delete Todo Item', { todoId, userId });

      await this.docClient.delete({
        TableName: this.todoItemsTable,
        Key: {
          userId,
          todoId,
        }
      }).promise();

    } catch(e) {
      logger.error('Fail to delete Todo Item', { error: e.message });
    }
  }

  async updateTodoItem(todoId: string, updateTodoItem: UpdateTodoRequest, userId: string): Promise<TodoUpdate> {
    try {
      logger.info('Update Todo Item', {
        todoId, updateTodoItem, userId,
      });

      await this.docClient.update({
        TableName: this.todoItemsTable,
        Key: {
          userId,
          todoId,
        },
        UpdateExpression: 'SET #todo_name = :name, dueDate = :dueDate, done = :done',
        ExpressionAttributeValues: {
          ':name': updateTodoItem.name,
          ':dueDate': updateTodoItem.dueDate,
          ':done': updateTodoItem.done,
        },
        ExpressionAttributeNames: {
          '#todo_name': 'name',
        },
        ReturnValues: 'ALL_NEW',
      }).promise();

      logger.info('Successfully updated TodoItem', updateTodoItem);
      return updateTodoItem;
    } catch(e) {
      logger.error('Fail to update Todo Item', { error: e.message });
    }
  }

  async getTodoItem(todoId: string, userId: string): Promise<Boolean> {
    try {
      logger.info('Todo Item Exist?', { todoId, userId });

      const result = await this.docClient.get({
        TableName: this.todoItemsTable,
        Key: {
          userId,
          todoId,
        }
      }).promise();

      logger.info('Successfully found todo item', result);
      return !_.isEmpty(result.Item) ? true : false;
    } catch (e) {
      logger.error('Fail to find Todo Item', { error: e.message });
      return false;
    }
  }

  async updateTodoItemAttachmentUrl(todoId: string, userId: string, attachmentUrl: string) {
    try {
      logger.info('Update Todo Item Attachment URL', {
        todoId, userId, attachmentUrl,
      });

      const result = await this.docClient.update({
        TableName: this.todoItemsTable,
        Key: {
          userId,
          todoId,
        },
        UpdateExpression: 'SET attachmentUrl = :attachmentUrl',
        ExpressionAttributeValues: {
          ':attachmentUrl': attachmentUrl,
        },
        ReturnValues: 'ALL_NEW',
      }).promise();

      logger.info('Successfully updated todo item attachment url', result);

      return result;
    } catch (e) {
      logger.error('Fail to update Todo Item Attachment URL', { error: e.message });
    }
  }
}

function createDynamoDBClient() {
  if (process.env.IS_OFFLINE) {
    logger.info('Creating a local DynamoDB instance')
    return new AWS.DynamoDB.DocumentClient({
      region: 'localhost',
      endpoint: 'http://localhost:8000'
    })
  }

  return new XAWS.DynamoDB.DocumentClient()
}
