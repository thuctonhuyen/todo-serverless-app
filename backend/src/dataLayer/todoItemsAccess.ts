import * as AWS  from 'aws-sdk';
import { DocumentClient } from 'aws-sdk/clients/dynamodb';

import { TodoItem } from '../models/TodoItem';

export class TodoItemAccess {
  constructor (
    private readonly docClient: DocumentClient = createDynamoDBClient(),
    private readonly todoItemsTable = process.env.TODOITEMS_TABLE,
  ) {}

  async getAllTodoItems(): Promise<TodoItem[]> {
    console.log('Getting all Todo Items');

    const result = await this.docClient.scan({
      TableName: this.todoItemsTable
    }).promise()

    const items = result.Items
    return items as TodoItem[]
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
