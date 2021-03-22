import * as AWS  from 'aws-sdk';
import { DocumentClient } from 'aws-sdk/clients/dynamodb';

import { TodoItem } from '../models/TodoItem';

export class TodoItemAccess {
  constructor (
    private readonly docClient: DocumentClient = createDynamoDBClient(),
    private readonly todoItemsTable: string = process.env.TODOITEMS_TABLE,
  ) {}

  async getAllTodoItems(userId: string): Promise<TodoItem[]> {
    console.log('Getting all Todo Items for ', userId);

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
    console.log('Create Todo Item', todoItem);

    await this.docClient.put({
      TableName: this.todoItemsTable,
      Item: todoItem,
    }).promise();

    console.log('Successfully creating TodoItem', todoItem);
    return todoItem;
  }
}

// TODO: figure it out to share the folowing function:
function createDynamoDBClient() {
  if (process.env.IS_OFFLINE) {
    console.log('Creating a local DynamoDB instance')
    return new AWS.DynamoDB.DocumentClient({
      region: 'localhost',
      endpoint: 'http://localhost:8000'
    })
  }

  return new AWS.DynamoDB.DocumentClient()
}
