import React from 'react'
import ReactDOM from 'react-dom'
import { Button, Modal, FormGroup, Grid, Row, Col } from 'react-bootstrap'

import style from './style.scss'

export default class Ticket extends React.Component {
	constructor(){
		super()
		this.priorities = ["LOW", "MEDIUM", "HIGH", "URGENT"]
		this.categories = ["Others", "Tech", "Order Status", "Order Feedback", "Enquiry"]
		this.state = {
			showModal: false,
			mailBody: null,
			priority: "LOW",
			issueCategory: "Others"
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
		const subject_line = this.subject.value.length === 0 ? "Your ticket has been registered with Box8." : this.subject.value
		const mailData = {
			to: this.supportEmailId.value.split(','),
			cc: this.customerEmailId.value,
			subject: `#${this.state.priority} [${this.state.issueCategory}] ${subject_line}`,
			body: this.state.mailBody
		}
		this.getAxios().post('/api/createTicket', { message: mailData }).then(({data, status}) => {
			if(status === 200){
				::this.toggleModal()
			} else {
				this.errorMessage.innerText = data
			}
		});
	}

	getTicketBody(){
		const sessionId = this.props.currentSessionId
		this.getAxios().get('/api/botpress-hitl/sessions/' + sessionId)
	    .then(({ data }) => {
	    	let mailBody = "Dear Customer, \n\nThanks for contacting us. We have raised the issue at our end and will revert back to you shortly.\n\n==============Chat History=============="
	    	mailBody += data.reduce((body, message) => `${body} \n ${message.direction === "in" ? "Customer: " : "Agent: "} ${message.text}`, '')
			this.setState({
				mailBody: mailBody
			})
	    })
	}

	_handleMailBodyChange(newValue){
		this.setState({
			mailBody: newValue.target.value
		})
	}

	_selectPriority(newValue){
		this.setState({
			priority: newValue.target.value
		})
	}

	_selectIssueCategory(newValue){
		this.setState({
			issueCategory: newValue.target.value
		})
	}

	render(){
		return(
			<div>
				<Button bsSize="large" bsStyle="primary" onClick={::this.toggleModal}>Create Ticket</Button>
				<Modal show={this.state.showModal} keyboard={true} onEnter={::this.getTicketBody}>
					<Modal.Header>
						<Modal.Title componentClass="h3"> Create Ticket </Modal.Title>
						Mail will be sent to the customer as well the customer service team.
					</Modal.Header>
					 <Modal.Body>
						<form ref={(form) => this.ticketForm = form} className={style.formStyle}>
							<input type="text" placeholder="Customer Email ID" ref={(input) => this.customerEmailId = input} /> <br />
							<input type="text" placeholder="Support Team Email ID" defaultValue="abhishek@box8.in" ref={(input) => this.supportEmailId = input} /> <br />
							<div style={{"padding": "10px", "margin-top": "5px", "margin-bottom": "5px", "border": "2px solid rgb(238, 238, 238)"}}>
								<Grid style={{width: "100%"}}>
									<Row>
									<Col sm={2}> Priority </Col>
									<Col sm={4}>
										<select onChange={::this._selectPriority}>
										  {
										  	this.priorities.map(priority => {
										  		return <option value={priority}>{priority}</option>
										  	})
										  }
										</select>
									</Col>
									<Col sm={2}> Issue</Col>
									<Col sm={4}>
										<select onChange={::this._selectIssueCategory}>
										  {
										  	this.categories.map(category => {
										  		return <option value={category}>{category}</option>
										  	})
										  }
										</select>
									</Col>
									</Row>
								</Grid>
							</div>
							<input type="text" placeholder="Subject Line" ref={(input) => this.subject = input} /> <br />
							<textarea rows="10" value={this.state.mailBody} onChange={::this._handleMailBodyChange}/>
						</form>
					 </Modal.Body>
					 <Modal.Footer>
					 	<label className="pull-left" ref={(label) => this.errorMessage = label}> </label>
					 	<Button bsStyle="primary" onClick={::this.createTicket}> Create </Button>
					 	<Button onClick={::this.toggleModal}> Cancel </Button>
					 </Modal.Footer>
				</Modal>
			</div>
		)
	}
}