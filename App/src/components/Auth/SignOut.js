import React, {Component} from 'react';
import { connect } from 'react-redux';
import {signoutLandlord} from '../../actions/auth_actions';
import Radium from 'radium'
import {browserHistory} from 'react-router'
import { xMidBlue } from '../../stylesJS/base_colors'

class SignOut extends Component {

	componentWillMount(){
		// signoutLandlord() is a function from `actions` coming from index.js
		this.props.signoutLandlord()
		setTimeout(()=>{
			browserHistory.push('/login')
		}, 500)
	}

	render() {
		return (
			<div style={comStyles().background}>
				<div style={comStyles().goodbye}>Sorry to see you go...</div>
			</div>
		)
	}
}

SignOut.propTypes = {
	signoutLandlord: React.PropTypes.func.isRequired
};

const RadiumHOC = Radium(SignOut);

function mapDispatchToProps(dispatch){
	signoutLandlord: dispatch(signoutLandlord)
}

export default connect(null, {signoutLandlord})(RadiumHOC);


// ==================================


const comStyles = () => {
	return {
		background: {
			backgroundColor: xMidBlue,
			width: "100%",
			height: "100%",
			margin: "0",
			left: "0",
			top: "0",
			display:"flex",
			justifyContent: "center"
		},
		goodbye: {
			fontSize: "1.5rem",
			fontWeight: "bold",
			color: "white",
			margin: "auto"
		}
	}
}
