import React, {Component} from 'react';
import {connect} from 'react-redux';
import Radium from 'radium'

import {uploadImageToS3} from '../../api/aws/aws_s3'

import Dropzone from 'react-dropzone'

class ImageUploader extends Component {

	constructor(){
		super()
		this.state = {
			uploadedFiles: [],
			errorMessage: null,
			loading: false
		}
	}

	handleChange(attr, event){
		this.setState({
			[attr]: event.target.value
		})
	}

	filterNonImages(acceptedFiles){
		// console.log(acceptedFiles)
		const filteredFiles = acceptedFiles.filter((file)=>{
			const parts = file.name.split('.')
			const extension = parts[parts.length-1]
			if(extension == "jpg" || extension == "jpeg" || extension == "png"){
				return true
			}else{
				return false
			}
		})
		// console.log(filteredFiles)
		return filteredFiles
	}

	uploadImages(acceptedFiles, rejectedFiles){
		const filteredFiles = this.filterNonImages(acceptedFiles)
  	this.setState({
  		uploadedFiles: filteredFiles
  	})
	}

	removeImageFromDropzone(image){
		const c = confirm("Are you sure you want to remove this image?")
		if(c == true){
			let imgExistsPosition
			const imgExists = this.state.uploadedFiles.filter((img, index)=>{
				if(img == image){
					imgExistsPosition = index
					return true
				}else{
					return false
				}
			})
			if(imgExists.length > 0){
				const x = this.state.uploadedFiles
				x.splice(imgExistsPosition, 1)
				this.setState({
					uploadedFiles: x
				})
			}
		}
	}

  saveChanges(){
		console.log(this.state.uploadedFiles)
		this.setState({loading: true})
		if(this.state.uploadedFiles.length > 0){
			uploadImageToS3(this.props.user.email, this.state.uploadedFiles)
				.then((S3ImageObjs)=>{
					this.setState({loading: false})
				})
				.catch((err)=>{
					// console.log(err)
					this.setState({
						loading: false,
						errorMessage: err
					})
				})
		}else{
			this.setState({
				loading: false,
				errorMessage: "Please select at least 1 image for upload."
			})
		}
  }

	render() {
		return (
			<div style={comStyles().mainview}>
					{
						this.props.user
						?
						<div style={comStyles().dropbox}>
					      <Dropzone onDrop={this.uploadImages.bind(this)} multiple={true} style={comStyles().dropzone}>
		              <div>Drag files here, or click to select files to upload.</div>
		            </Dropzone>
								<div style={comStyles().previewRow}>
		            	{this.state.uploadedFiles.map((img)=>{
		            		return (
		            			<div key={img.preview} onClick={()=>this.removeImageFromDropzone(img)} style={comStyles().imgWithDeleteIcon}>
		            				<i key={img.preview+"_delIcon"} className='ion-close-circled' style={comStyles().deleteIcon}></i>
		            				<img key={img.preview+"_img"} src={img.preview} style={comStyles().preview} />
		            			</div>
		            		)
		            	})}
		            </div>
								{
									this.state.errorMessage
									?
									<div className='alert alert-danger' style={comStyles().errorMessage}>
										{this.state.errorMessage}
									</div>
									:
									null
								}
								{
									this.state.loading
									?
									<div style={comStyles().loadingBox}>
										<img src='../../../res/images/loading.gif' style={comStyles().loadingGif} />
									</div>
									:
									<button style={comStyles().upload} onClick={this.saveChanges.bind(this)} className='btn btn-success' type='button'>UPLOAD TO S3</button>
								}
			      </div>
						:
						<div style={comStyles().loginWarning}>
							<h4>You must be logged in to upload images</h4>
						</div>
					}
			</div>
		);
	}
}

ImageUploader.propTypes = {
	user: React.PropTypes.object.isRequired
};

const RadiumHOC = Radium(ImageUploader);

function mapStateToProps(state){
	return {
		user: state.auth.user
	}
}

export default connect(mapStateToProps)(RadiumHOC);

// ================================

const comStyles = () => {
	return {
		mainview: {
			display: "flex",
			flexDirection: "column",
			justifyContent: "center",
			margin: "20px auto"
		},
		loginWarning: {
			width: "500px",
			borderRadius: "20px",
			backgroundColor: "rgba(0,0,0,0.05)",
			margin: "auto"
		},
		upload: {
			width: "500px",
			margin: "auto",
			"@media (max-width: 600px), and (max-height: 740px)": {
				width: "90%"
			}
		},
		dropbox: {
			width: "auto",
			display: "flex",
			flexDirection: "column",
			margin: "15px auto",
			backgroundColor: "rgba(0,0,0,0.05)",
			borderRadius: "20px",
			padding: "10px"
		},
		dropzone: {
			width: "75%",
			height: "100px",
			textAlign: "center",
			alignItems: "center",
			border: "3px dashed black",
			color: "black",
			padding: "10px",
			fontSize: "1rem",
			margin: "auto"
		},
		previewRow: {
			display: "flex",
			flexDirection: "row",
			justifyContent: "center",
			overflowX: "scroll",
			overflowY: "hidden",
			height: "70px",
			padding: "5px",
			margin: "5px"
		},
		errorMessage: {
			width: "500px",
			margin: "auto",
			"@media (max-width: 600px), and (max-height: 740px)": {
				width: "90%"
			}
		},
		loadingBox: {
			width: "500px",
			margin: "auto",
			display: "flex",
			flexDirection: "row",
			justifyContent: "center",
			alignItems: "center",
			padding: "10px",
			"@media (max-width: 600px), and (max-height: 740px)": {
				width: "90%"
			}
		},
		loadingGif: {
			width: "50px",
			height: "50px"
		},

		imgWithDeleteIcon: {
			position: "relative",
			color: "rgba(0,0,0,0)",
			":hover":{
				color: "rgba(256,256,256,1)"
			},
		},
		deleteIcon: {
			zIndex: "10",
			fontSize: "2rem",
			position: "absolute",
			top: "25%",
			left: "40%",
		},
		preview: {
			width: "auto",
			height: "80px",
			borderRadius: "0px"
		}
	}
}
