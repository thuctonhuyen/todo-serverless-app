import { APIGatewayProxyEvent } from 'aws-lambda';
import { decode } from 'jsonwebtoken'
import _ from 'lodash';

import { JwtPayload } from './JwtPayload'

/**
 * Parse a JWT token and return a user id
 * @param jwtToken JWT token to parse
 * @returns a user id from the JWT token
 */
export function parseUserId(jwtToken: string): string {
  const decodedJwt = decode(jwtToken) as JwtPayload
  return decodedJwt.sub
}

export function getJwtToken(event: APIGatewayProxyEvent): string {
  const authorization = _.get(event, 'headers.Authorization');
  const split = authorization.split(' ');
  const token = _.size(split) > 1 ? split[1] : '';

  return token;
}