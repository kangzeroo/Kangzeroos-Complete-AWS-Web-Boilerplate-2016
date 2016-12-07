import { CognitoUserPool } from 'amazon-cognito-identity-js';
import 'amazon-cognito-js'


const REGION = "us-east-1"
const LANDLORD_USER_POOL_ID = 'us-east-1_Sa93GBBWt'
const LANDLORD_CLIENT_ID = '5ee2p08hbh3kcfvhgtsm6o0lg9'

AWS.config.update({
	region: REGION
})
const userData = {
    UserPoolId : LANDLORD_USER_POOL_ID,
    ClientId : LANDLORD_CLIENT_ID
}

export const BUCKET_NAME = 'rentburrow-pics'
export const userPool = new CognitoUserPool(userData);
export const LANDLORD_USERPOOL_ID = 'cognito-idp.'+REGION+'.amazonaws.com/'+LANDLORD_USER_POOL_ID
export const TENANT_IDENTITY_POOL_ID = 'us-east-1:45a699d8-cfa9-4410-aaa1-b9fe4d9c5d32'
export const LANDLORD_IDENTITY_POOL_ID = 'us-east-1:53d95fd0-0bae-4588-8e88-d0c1022b125e'
