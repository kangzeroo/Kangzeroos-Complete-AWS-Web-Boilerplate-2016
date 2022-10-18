import React, {Component} from 'react';
import {connect} from 'react-redux';
import Radium from 'radium'
import { sendAWSEmail } from '../../api/aws/aws_ses'

class EmailSender extends Component {

  constructor(){
    super()
    this.state = {
      message: ''
    }
  }

	handleChange(attr, event){
		this.setState({
			[attr]: event.target.value
		})
	}

  sendEmail(){
    sendAWSEmail(this.props.senderEmail, this.state.message)
      .then((data)=>{
        console.log(data)
      })
  }

	render() {
		return (
			<div style={comStyles().mainview}>
        <form style={comStyles().form}>
          <div className='form-group' style={comStyles().section}>
            <label style={comStyles().formText}>Message</label>
            <input value={this.state.message} onChange={this.handleChange.bind(this, 'message')} type="text" className='form-control' style={comStyles().formInput} />
          </div>
          <div style={comStyles().section}>
            <div style={comStyles().senderEmail}>Sending message to: {this.props.senderEmail}</div>
            <button onClick={this.sendEmail.bind(this)}>Send Email</button>
          </div>
        </form>
			</div>
		)
	}
}

EmailSender.propTypes = {
  senderEmail: React.PropTypes.string.isRequired
}

function mapStateToProps(state){
	return {
    senderEmail: state.auth.user.email
	}
}

const RadiumHOC = Radium(EmailSender)

export default connect(
  mapStateToProps
)(RadiumHOC)

// ================================

const comStyles = () => {
	return {
		mainview: {
			textAlign: "center",
			padding: "20px"
		},
		form: {
			width: "500px",
			margin: "auto",
			"@media (max-width: 600px), and (max-height: 740px)": {
				width: "90%"
			}
		},
		formText: {
			color: "black",
			fontSize: "1.2rem",
			fontWeight: "bold",
		},
		formInput: {
			fontSize: "1.2rem",
			textAlign: "center",
			backgroundColor: "rgba(0,0,0,0.05)"
		},
    section: {

    },
    senderEmail: {

    }
	}
}
