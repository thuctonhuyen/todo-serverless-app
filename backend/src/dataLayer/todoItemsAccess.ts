import * as AWS  from 'aws-sdk';
import { DocumentClient } from 'aws-sdk/clients/dynamodb';

import { TodoItem } from '../models/TodoItem';
import { createLogger } from '../utils/logger';

const logger = createLogger('TodoItemAccess')

export class TodoItemAccess {
  constructor (
    private readonly docClient: DocumentClient = createDynamoDBClient(),
    private readonly todoItemsTable: string = process.env.TODOITEMS_TABLE,
  ) {}

  async getAllTodoItems(userId: string): Promise<TodoItem[]> {
    logger.info('Getting all Todo Items for user', userId);

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
    logger.info('Create Todo Item', todoItem);

    await this.docClient.put({
      TableName: this.todoItemsTable,
      Item: todoItem,
    }).promise();

    logger.info('Successfully creating TodoItem', todoItem);
    return todoItem;
  }

  async deleteTodoItem(todoId: string, userId: string) {
    try {
      logger.info('Delete Todo Item', todoId, userId);

      await this.docClient.delete({
        TableName: this.todoItemsTable,
        Key: {
          userId,
          todoId,
        }
      }).promise();

    } catch(e) {
      logger.error('Invalid action', { error: e.message });
    }
  }
}

// TODO: figure it out to share the folowing function:
function createDynamoDBClient() {
  if (process.env.IS_OFFLINE) {
    logger.info('Creating a local DynamoDB instance')
    return new AWS.DynamoDB.DocumentClient({
      region: 'localhost',
      endpoint: 'http://localhost:8000'
    })
  }

  return new AWS.DynamoDB.DocumentClient()
}
