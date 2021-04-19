import { CustomAuthorizerEvent, CustomAuthorizerResult } from 'aws-lambda'
import 'source-map-support/register'
import * as _ from 'lodash';
import * as jwksClient from 'jwks-rsa';
import { verify, decode } from 'jsonwebtoken'

import { createLogger } from '../../utils/logger'
import { Jwt } from '../../auth/Jwt'
import { JwtPayload } from '../../auth/JwtPayload'

const logger = createLogger('auth')
const jwksUrl = process.env.JWKS_URL;
const jwksTimeOut: number = _.toNumber(process.env.JWKS_TIMEOUT) || 30000;

export const handler = async (
  event: CustomAuthorizerEvent
): Promise<CustomAuthorizerResult> => {
  logger.info('Authorizing a user', event.authorizationToken)
  try {
    const jwtToken = await verifyToken(event.authorizationToken)
    logger.info('User was authorized', jwtToken)

    return {
      principalId: jwtToken.sub,
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect: 'Allow',
            Resource: '*'
          }
        ]
      }
    }
  } catch (e) {
    logger.error('User not authorized', { error: e.message })

    return {
      principalId: 'user',
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect: 'Deny',
            Resource: '*'
          }
        ]
      }
    }
  }
}

async function verifyToken(authHeader: string): Promise<JwtPayload> {
  const token = getToken(authHeader);
  const decodedToken: Jwt = decode(token, { complete: true }) as Jwt;

  // This could fail. If it does handle as 401 as the token is invalid.
  // var decodedToken = jwt.decode(token, {complete: true});
  if (decodedToken.header.alg !== 'RS256') {
    // we are only supporting RS256 so fail if this happens.
    throw new Error('Invalid Header')
  }

  const client = jwksClient({
    jwksUri: jwksUrl,
    timeout: jwksTimeOut,
  });

  const key = await client.getSigningKey(_.get(decodedToken, 'header.kid'));
  const signingKey = key.getPublicKey();

  return verify(token, signingKey, { algorithms: ['RS256'] }) as Promise<JwtPayload>;
}

function getToken(authHeader: string): string {
  if (!authHeader) throw new Error('No authentication header')

  if (!authHeader.toLowerCase().startsWith('bearer '))
    throw new Error('Invalid authentication header')

  const split = authHeader.split(' ')
  const token = split[1]

  return token
}
