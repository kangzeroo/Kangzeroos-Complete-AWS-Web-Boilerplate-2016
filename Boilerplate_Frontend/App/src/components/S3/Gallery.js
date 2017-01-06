import React, {Component} from 'react';
import {connect} from 'react-redux';
import Radium from 'radium'
import ImageUploader from './ImageUploader'

class Gallery extends Component {

		render() {
			return (
				<div style={comStyles().mainview}>
					<h1>Gallery Page</h1>
					<ImageUploader />
				</div>
			)
		}
}

Gallery.propTypes = {
}

function mapStateToProps(state){
	return {
	}
}

const RadiumHOC = Radium(Gallery)

export default connect(

)(RadiumHOC)

// ================================

const comStyles = () => {
	return {
		mainview: {
			textAlign: "center",
			padding: "20px"
		},
	}
}
