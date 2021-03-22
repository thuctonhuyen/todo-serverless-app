import 'source-map-support/register'
import { APIGatewayProxyEvent, APIGatewayProxyResult, APIGatewayProxyHandler } from 'aws-lambda'

import { createLogger } from '../../utils/logger';
import { getJwtToken } from '../../auth/utils';
import { deleteTodoItem } from '../../businessLogic/todoItems';

const logger = createLogger('deleteTodo handler');

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  logger.info('Receive request', event);

  const todoId = event.pathParameters.todoId
  const jwtToken = getJwtToken(event);

  await deleteTodoItem(todoId, jwtToken);

  return {
    statusCode: 200,
    body: ''
  }
}
