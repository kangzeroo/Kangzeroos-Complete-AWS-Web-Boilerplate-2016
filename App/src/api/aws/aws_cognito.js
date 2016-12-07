// AWS Cognito for authenticating user
// https://github.com/aws/amazon-cognito-identity-js

import { CognitoUserPool, CognitoUserAttribute, CognitoUser, AuthenticationDetails, CognitoIdentityCredentials, WebIdentityCredentials } from 'amazon-cognito-identity-js';
import { userPool, LANDLORD_USERPOOL_ID, LANDLORD_IDENTITY_POOL_ID, TENANT_IDENTITY_POOL_ID } from './aws_profile'
import uuid from 'node-uuid'

// https://github.com/aws/amazon-cognito-js/
// entire cognito sync
import 'amazon-cognito-js'

export function signUpUser({email, agentName, password}){
	const p = new Promise((res, rej)=>{
		const attributeList = []
		const dataEmail = {
		    Name : 'email',
		    Value : email
		}
		const dataAgentName = {
		    Name : 'custom:agentName',
		    Value : agentName
		}
		const dataId = {
		    Name : 'custom:id',
		    Value : uuid.v4()
		}
		const attributeEmail = new CognitoUserAttribute(dataEmail)
		const attributeAgentName = new CognitoUserAttribute(dataAgentName)
		const attributeId = new CognitoUserAttribute(dataId)
		attributeList.push(attributeEmail, attributeAgentName, attributeId)
		userPool.signUp(email, password, attributeList, null, function(err, result){
		    if (err) {
		        console.log(err);
		        rej(err)
		        return;
		    }
		    res({email, password})
		})
	})
	return p
}

export function signInUser({email, password}){
	const p = new Promise((res, rej)=>{
		const authenticationDetails = new AuthenticationDetails({
			Username: email,
			Password: password
		})
		const userData = {
			Username: email,
			Pool: userPool
		}
		const cognitoUser = new CognitoUser(userData)
		authenticateUser(cognitoUser, authenticationDetails)
			.then(()=>{
				return buildUserObject(cognitoUser)
			})
			.then((userProfileObject)=>{
				res(userProfileObject)
			})
			.catch((err)=>{
				rej(err)
			})
	})
	return p
}

function authenticateUser(cognitoUser, authenticationDetails){
	const p = new Promise((res, rej)=>{
		cognitoUser.authenticateUser(authenticationDetails, {
	        onSuccess: function (result) {
	            //console.log('access token + ' + result.getAccessToken().getJwtToken());
	            // localStorage.setItem('user_token', result.getAccessToken().getJwtToken());
	            localStorage.setItem('user_token', result.accessToken.jwtToken);
	            console.log("======== VIEW THE REFRESH TOKEN =========")
	            console.log(localStorage.getItem('user_token'))
	            console.log(result)

			    // Edge case, AWS Cognito does not allow for the Logins attr to be dynamically generated. So we must create the loginsObj beforehand
	            const loginsObj = {
	                // Change the key below according to the specific region your user pool is in.
	                [LANDLORD_USERPOOL_ID]: result.getIdToken().getJwtToken()
	            }
			    		AWS.config.credentials = new AWS.CognitoIdentityCredentials({
	                IdentityPoolId : LANDLORD_IDENTITY_POOL_ID, // your identity pool id here
	                Logins : loginsObj
	            })
	            AWS.config.credentials.refresh(function(){
	            	console.log(AWS.config.credentials)
	            })
	            res()
	        },
	        onFailure: function(err) {
	            console.log(err)
	            rej(err)
	        },
	    })
	})
	return p
}

function buildUserObject(cognitoUser){
	const p = new Promise((res, rej)=>{
		cognitoUser.getUserAttributes(function(err, result) {
	        if (err) {
	            console.log(err);
	    		rej(err)
	            return;
	        }
	        let userProfileObject = {}
					for (let i = 0; i < result.length; i++) {
		        if(result[i].getName().indexOf('custom:') >= 0){
		    		let name = result[i].getName().slice(7, result[i].getName().length)
		    		userProfileObject[name] = result[i].getValue()
		    	}else{
		    		userProfileObject[result[i].getName()] = result[i].getValue()
		    	}
		    }
		    const landlordAttrs = ["email", "agentName", "id"]
		    for(let x = 0; x < landlordAttrs.length; x++){
		    	if(!userProfileObject[landlordAttrs[x]]){
		    		userProfileObject[landlordAttrs[x]] = null
		    	}
		    }
	        //console.log(userProfileObject)
	        res(userProfileObject)
	    })
	})
	return p
}

export function verifyUserAccount({email, pin}){
	const p = new Promise((res, rej)=>{
		const userData = {
			Username: email,
			Pool: userPool
		}
		const cognitoUser = new CognitoUser(userData)
		//console.log("Verifying account...")
		cognitoUser.confirmRegistration(pin, true, function(err, result) {
	        if (err) {
	            console.log(err);
		        rej(err)
	            return;
	        }
	        //console.log('call result: ' + result)
	        if(result == "SUCCESS"){
	        	console.log("Successfully verified account!")
	        	cognitoUser.signOut()
	        	res()
	        }else{
	        	rej("Could not verify account")
	        }
	    })
	})
	return p
}

export function updateUserInfo(email, editedInfo){
	console.log(editedInfo)
	const p = new Promise((res, rej)=>{
		const attrs = ["custom:agentName"]
		const attributeList = []
		for(let a = 0; a<attrs.length; a++){
			if(editedInfo[attrs[a]]){
				console.log(editedInfo[attrs[a]])
				let attribute = {
			        Name : attrs[a],
			        Value : editedInfo[attrs[a]]
			    }
			    let x = new CognitoUserAttribute(attribute)
			    attributeList.push(x)
			}
		}
		console.log(attributeList)
	    const cognitoUser = userPool.getCurrentUser()
	    cognitoUser.getSession(function(err, result) {
            if (result) {
                cognitoUser.updateAttributes(attributeList, function(err, result) {
			        if (err) {
			            console.log(err);
		        		rej(err)
			            return;
			        }
			        setTimeout(()=>{
				        cognitoUser.getUserAttributes(function(err, result) {
					        if (err) {
					            console.log(err);
		        				rej(err)
					            return;
					        }
					        buildUserObject(cognitoUser)
					        	.then((userProfileObject)=>{
					        		res(userProfileObject)
					        	})
					    })
			        }, 500)
			    });
            }
        });
	})
	return p
}

export function forgotPassword(email){
	const p = new Promise((res, rej)=>{
		// console.log(email)
		// console.log(userPool)
		const userData = {
			Username: email,
			Pool: userPool
		}
		const cognitoUser = new CognitoUser(userData)
		//console.log(cognitoUser)

		cognitoUser.forgotPassword({
	        onSuccess: function (result) {
	            console.log('call result: ' + result);
	        },
	        onFailure: function(err) {
	            console.log(err);
		        rej(err)
	        },
	        //Optional automatic callback
	        inputVerificationCode: function(data) {
	            //console.log('Code sent to: ' + data)
	            res({
	            	cognitoUser: cognitoUser,
	            	thirdArg: this
	            })
	        }
	    })
	})
	return p
}

export function resetVerificationPIN(email){
	const p = new Promise((res, rej)=>{
		const userData = {
			Username: email,
			Pool: userPool
		}
		const cognitoUser = new CognitoUser(userData)
		cognitoUser.resendConfirmationCode(function(err, result) {
	        if (err) {
	            console.log(err);
		        rej(err)
	        }
	        //console.log('call result: ' + result);
	        res()
	    })
	})
	return p
}

export function retrieveUserFromLocalStorage(){
	const p = new Promise((res, rej)=>{
	    const cognitoUser = userPool.getCurrentUser();
	    console.log("Getting cognitoUser from local storage...")
	    console.log(cognitoUser)
	    if (cognitoUser != null) {
	        cognitoUser.getSession(function(err, session) {
	            if (err) {
	                alert(err);
	                return;
	            }
	            console.log('session validity: ' + session.isValid());
	            console.log(session);
	            localStorage.setItem('user_token', session.getAccessToken().getJwtToken());
	            //console.log(localStorage.getItem('user_token'))
	            // Edge case, AWS Cognito does not allow for the Logins attr to be dynamically generated. So we must create the loginsObj beforehand
	            const loginsObj = {
	                // Change the key below according to the specific region your user pool is in.
	                [LANDLORD_USERPOOL_ID] : session.getIdToken().getJwtToken()
	            }
			    AWS.config.credentials = new AWS.CognitoIdentityCredentials({
	                IdentityPoolId : LANDLORD_IDENTITY_POOL_ID, // your identity pool id here
	                Logins : loginsObj
	            })
	            AWS.config.credentials.refresh(function(){
	            	console.log(AWS.config.credentials)
	            	res(buildUserObject(cognitoUser))
	            })
	        });
	    }else{
	    	rej('Failed to retrieve user from localStorage')
	    }
	})
	return p
}

export function signOutUser(){
	const p = new Promise((res, rej)=>{
		const cognitoUser = userPool.getCurrentUser()
		cognitoUser.signOut()
	})
	return p
}

export function registerFacebookLoginWithCognito(response){
	console.log("registerFacebookLoginWithCognito")
	console.log(response)
	// Check if the user logged in successfully.
	  if (response.authResponse) {

	    console.log('You are now logged in.');
	    const cognitoidentity = new AWS.CognitoIdentity();

	    // Add the Facebook access token to the Cognito credentials login map.
	    AWS.config.credentials = new AWS.CognitoIdentityCredentials({
	      IdentityPoolId: TENANT_IDENTITY_POOL_ID,
	      Logins: {
	         'graph.facebook.com': response.authResponse.accessToken
	      }
	    })

	    // AWS Cognito Sync to sync Facebook
	    AWS.config.credentials.get(function() {
		    const client = new AWS.CognitoSyncManager();
		    console.log(AWS.config.credentials)
		});

	  } else {
	    console.log('There was a problem logging you in.');
	  }
}
