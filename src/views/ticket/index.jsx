import React from 'react'
import { Button, Modal, FormGroup } from 'react-bootstrap'

import style from './style.scss'

export default class Ticket extends React.Component {
	constructor(){
		super()
		this.state = {
			showModal: false,
			mailBody: null
		}
	}

	toggleModal(){
		const current_state = this.state.showModal
		this.setState ({
			showModal: !current_state
		})
	}

	getAxios() {
	    return this.props.bp.axios
	}

	createTicket(){
		const mailData = {
			to: this.customerEmailId.value,
			subject: this.subject.value,
			body: this.state.mailBody
		}
		console.log(mailData);
	   	// const transporter = Mailer.

	}

	getTicketBody(){
		const sessionId = this.props.currentSessionId
		this.getAxios().get('/api/botpress-hitl/sessions/' + sessionId)
	    .then(({ data }) => {
	    	let mailBody = "\n\n==============Chat History=============="
	    	mailBody += data.reduce((body, message) => `${body} \n ${message.direction === "in" ? "Customer: " : "Agent: "} ${message.text}`, '')
			this.setState({
				mailBody: mailBody
			})
	    })
	}

	render(){
		return(
			<div>
				<Button bsSize="large" onClick={::this.toggleModal}>Create Ticket</Button>
				<Modal show={this.state.showModal} keyboard={true} onEnter={::this.getTicketBody}>
					<Modal.Header>
						<Modal.Title componentClass="h3"> Create Ticket </Modal.Title>
						Mail will be sent to the customer as well the customer service team.
					</Modal.Header>
					 <Modal.Body>
						<form ref={(form) => this.ticketForm = form} className={style.formStyle}>
							<input type="email" placeholder="Customer Email ID" ref={(input) => this.customerEmailId = input} /> <br />
							<input type="text" placeholder="Subject Line" ref={(input) => this.subject = input} /> <br />
							<textarea rows="10" value={this.state.mailBody} />
						</form>
					 </Modal.Body>
					 <Modal.Footer>
					 	<Button bsStyle="primary" onClick={::this.createTicket}> Create </Button>
					 	<Button onClick={::this.toggleModal}> Cancel </Button>
					 </Modal.Footer>
				</Modal>
			</div>
		)
	}
}