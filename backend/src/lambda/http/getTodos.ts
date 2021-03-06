import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult, APIGatewayProxyHandler } from 'aws-lambda'
import { getAllTodoItems } from '../../businessLogic/todoItems';
import { getJwtToken } from '../../auth/utils';
import { createLogger } from '../../utils/logger';

const logger = createLogger('getTodos handler');

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  logger.info('Receive request', event);

  const jwtToken = getJwtToken(event);
  const result = await getAllTodoItems(jwtToken);

  return {
    statusCode: 200,
    headers: {
      'Access-Control-Allow-Origin': '*'
    },
    body: JSON.stringify({
      items: result,
    })
  };
}
