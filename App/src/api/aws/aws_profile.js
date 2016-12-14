import { CognitoUserPool } from 'amazon-cognito-identity-js';
import 'amazon-cognito-js'


const REGION = "us-east-1"
const USER_POOL_ID = 'us-east-1_Sa93GBBWt'
const CLIENT_ID = '5ee2p08hbh3kcfvhgtsm6o0lg9'

AWS.config.update({
	region: REGION
})
const userData = {
    UserPoolId : USER_POOL_ID,
    ClientId : CLIENT_ID
}

export const BUCKET_NAME = 'rentburrow-pics'
export const userPool = new CognitoUserPool(userData);
export const USERPOOL_ID = 'cognito-idp.'+REGION+'.amazonaws.com/'+USER_POOL_ID
export const IDENTITY_POOL_ID = 'us-east-1:45a699d8-cfa9-4410-aaa1-b9fe4d9c5d32'
