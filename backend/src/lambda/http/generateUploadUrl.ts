import 'source-map-support/register'

import * as AWS  from 'aws-sdk';
import { APIGatewayProxyEvent, APIGatewayProxyResult, APIGatewayProxyHandler } from 'aws-lambda';
import * as _ from 'lodash';
import * as uuid from 'uuid'
import * as AWSXRay from 'aws-xray-sdk'

import { createLogger } from '../../utils/logger';
import { getJwtToken } from '../../auth/utils';
import { todoItemExist, updateTodoItemAttachmentUrl } from '../../businessLogic/todoItems';

const XAWS = AWSXRay.captureAWS(AWS);
const logger = createLogger('generateUploadUrl handler');
const bucketName = process.env.IMAGES_S3_BUCKET;
const urlExpiration = process.env.SIGNED_URL_EXPIRATION;
const s3 = new XAWS.S3({
  signatureVersion: 'v4'
});

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  logger.info('Receive request', event);

  const todoId = _.get(event, 'pathParameters.todoId');
  const jwtToken = getJwtToken(event);

  const validTodoId = await todoItemExist(todoId, jwtToken);

  if (!validTodoId) {
    return {
      statusCode: 404,
      body: JSON.stringify({
        error: 'TodoItem does not exist'
      })
    }
  }

  const imageId = uuid.v4();
  const url = getUploadUrl(imageId)

  logger.info('S3 signed URL', url);

  const udpatedItem = await updateTodoItemAttachmentUrl(todoId, jwtToken, getRetrievedUrl(imageId));

  logger.info('updated item', udpatedItem);

  return {
    statusCode: 201,
    headers: {
      'Access-Control-Allow-Origin': '*',
    },
    body: JSON.stringify({
      item: udpatedItem,
      uploadUrl: url
    })
  }
}

function getRetrievedUrl(key: string): string {
  return s3.getSignedUrl('getObject', {
    Bucket: bucketName,
    Key: key,
    Expires: urlExpiration,
  });
}

function getUploadUrl(imageId: string) {
  return s3.getSignedUrl('putObject', {
    Bucket: bucketName,
    Key: imageId,
    Expires: urlExpiration
  })
}
