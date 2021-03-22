import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyHandler, APIGatewayProxyResult } from 'aws-lambda'

import { CreateTodoRequest } from '../../requests/CreateTodoRequest'
import { getJwtToken } from '../../auth/utils'
import { createTodoItem } from '../../businessLogic/todoItems'
import { createLogger } from '../../utils/logger';

const logger = createLogger('createTodo handler');

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  logger.info('Receive request', event);
  
  const newTodo: CreateTodoRequest = JSON.parse(event.body)
  const jwtToken: string = getJwtToken(event);

  const newItem = await createTodoItem(newTodo, jwtToken);

  return {
    statusCode: 201,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Credentials': true
    },
    body: JSON.stringify({
      item: newItem,
    })
  }
}
