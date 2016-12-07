import axios from 'axios';
import {browserHistory} from 'react-router';
import { AUTH_LANDLORD, AUTH_ERROR, UNAUTH_LANDLORD, FETCH_MESSAGE, SET_LANDLORD } from './action_types';

import { API_URL } from '../api/API_URLS'

export function authCorrect(){
	return function(dispatch){
		dispatch({type: AUTH_LANDLORD});
	}
}

export function authenticateUser({email, password}){
	console.log("signing in with: ", email, password);

	// using redux-thunk to allow for actions with functions
	return function(dispatch){
		// returned for handleSubmit() from reduxForm
		axios.post(API_URL+'/signin', {email, password})
			.then(response => {
				// if request is good, update state to indicate user is authenticated
				dispatch({type: AUTH_LANDLORD})
				// and save the JWT token for follow-up requests
				// localStorage is browser storage that is private from other domains/websites
				// localStorage is available at global scope
				localStorage.setItem('email', email);
				localStorage.setItem('token', response.data.token);
				// return getLandlord(email)
			})
			.then((data)=>{
				dispatch({
					type: SET_LANDLORD,
					payload: data
				})
				// redirect to route '/feature'
				browserHistory.push('/landlord/dashboard');
			})
			.catch(()=>{
				// if request is bad, show an error to user
				dispatch(authError("Bad Login Info"));
			});
	}
}

export function setUserToReduxState(landlord){
	return function(dispatch){
		dispatch({
			type: AUTH_LANDLORD
		})
		dispatch({
			type: SET_LANDLORD,
			payload: landlord
		})
		// redirect to route
		browserHistory.push('/landlord/dashboard');
	}
}
