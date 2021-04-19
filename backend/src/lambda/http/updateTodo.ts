import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyHandler, APIGatewayProxyResult } from 'aws-lambda'
import * as _ from 'lodash';

import { UpdateTodoRequest } from '../../requests/UpdateTodoRequest'
import { createLogger } from '../../utils/logger';
import { getJwtToken } from '../../auth/utils';
import { updateTodoItem } from '../../businessLogic/todoItems';

const logger = createLogger('updateTodo handler');

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  logger.info('Receive request', event);
  
  const todoId = _.get(event, 'pathParameters.todoId')
  const updatedTodo: UpdateTodoRequest = JSON.parse(event.body)
  const jwtToken = getJwtToken(event);

  const updatedItem = await updateTodoItem(todoId, updatedTodo, jwtToken);

  return {
    statusCode: 201,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Credentials': true
    },
    body: JSON.stringify({
      item: updatedItem,
    })
  }
}
