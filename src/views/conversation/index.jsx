import React from 'react'
import {
  Tooltip,
  OverlayTrigger
} from 'react-bootstrap'
import Toggle from 'react-toggle'
import classnames from 'classnames'

import 'react-toggle/style.css'
import style from './style.scss'

import Message from '../message'

import Ticket from '../ticket'
import Typing from '../typing'

export default class Conversation extends React.Component {
  constructor() {
    super()

    this.state = { loading: true, messages: null, agentsActive: [], currentAgent: localStorage.getItem("bp/agentName") }
    this.appendMessage = ::this.appendMessage
  }

  scrollToBottom() {
    const messageScrollDiv = this.refs.innerMessages
    if (messageScrollDiv) {
      messageScrollDiv.scrollTop = messageScrollDiv.scrollHeight
    }
  }

  componentDidMount() {
    this.props.bp.events.on('hitl.message', this.appendMessage)
  }

  componentWillUnmount() {
    this.props.bp.events.off('hitl.message', this.appendMessage)
  }

  appendMessage(message) {
    if (this.state.messages && this.props.data && this.props.data.id === message.session_id) {
      let dataToBeUpdated = { messages: [...this.state.messages, message] }
      if(!this.state.agentsActive.includes(message.sent_by)){
        dataToBeUpdated['agentsActive'] = [...this.state.agentsActive, message.sent_by]
      }
      this.setState(dataToBeUpdated)
      setTimeout(::this.scrollToBottom, 50)
    }
  }

  togglePaused() {
    this.props.data.props = !this.props.data.props
    const sessionId = this.props.data.id
    const action = !!this.props.data.paused ? 'unpause' : 'pause'
    this.getAxios().post(`/api/botpress-hitl/sessions/${sessionId}/${action}`)
  }

  getAxios() {
    return this.props.bp.axios
  }

  componentWillReceiveProps(nextProps) {
    let newData = this.props.data
    if (nextProps.data) {
      newData = nextProps.data
    }

    if (newData && newData.id){
      this.fetchSessionMessages(newData.id)
    }
  }

  fetchSessionMessages(sessionId) {
    this.setState({ loading: true })

    return this.getAxios().get('/api/botpress-hitl/sessions/' + sessionId)
    .then(({ data }) => {
      this.setState({
        agentsActive: Array.from(new Set(data.map(message => message.sent_by || "Bot"))),
        loading: false,
        messages: data
      })
      setTimeout(::this.scrollToBottom, 50)
    })
  }

  renderHeader() {
    const pausedTooltip = <Tooltip id="pausedTooltip">Pause this conversation</Tooltip>
    const userDisplayName = ["undefined", "null"].includes( String(this.props.data.phone_no) )  ? (this.props.data.ip || this.props.data.full_name) : `${this.props.data && this.props.data.full_name}${this.props.data && this.props.data.phone_no && ' / ' + this.props.data.phone_no}`

    return (
      <div>
        <h3>
          {
            this.props.data && this.props.data.phone_no
            ? <a target="_blank" href={`http://ops.box8.co.in/#/customer?phone=${this.props.data.phone_no}&brand_id=1`}> {userDisplayName} </a>
            : userDisplayName
          }
          {this.props.data && !!this.props.data.paused
            ? <span className={style.pausedWarning}>Paused</span>
            : null}
        </h3>
        <OverlayTrigger placement="left" overlay={pausedTooltip}>
          <div className={style.toggleDiv}>
            <Toggle className={classnames(style.toggle, style.enabled)}
              checked={this.props.data && !this.props.data.paused}
              onChange={::this.togglePaused}/>
          </div>
        </OverlayTrigger>
        <div style={{
            "position": "absolute",
            "right": "10px",
            "top": "10px"
          }} >
            <Ticket bp={this.props.bp} defaultCustomerEmailId={this.props.data.email} currentSessionId={this.props.data.session_id}/>
        </div>
      </div>
    )
  }

  renderMessages() {
    const dynamicHeightStyleInnerMessageDiv = {
      maxHeight: innerHeight - 210
    }

    return (
      <div>
      <div className={style.agentDetails} style={{ "backgroundColor": "#7581d9d9"}}> 
        Agents Engaged: <strong>  {this.state.agentsActive.join(", ")} </strong>
      </div>
      <div className={style.innerMessages}
        id="innerMessages"
        ref="innerMessages"
        style={dynamicHeightStyleInnerMessageDiv}>
        {this.state.messages && this.state.messages.map((m, i) => {
          return <Message key={i} content={m}/>
        })}
      </div>
      </div>
    )
  }

  sendMessage (message) {
    this.props.sendMessage(message)
  }

  joinChat(){
    this.setState({
      agentsActive: [...this.state.agentsActive, this.state.currentAgent]
    })
  }

  renderTypeArea() {
    let allowed = (this.state.agentsActive.includes(this.state.currentAgent) || this.state.agentsActive.join("") === "Bot")
    return(
      <Typing joinChat={::this.joinChat} agentsEngaged={this.state.agentsActive} allowed={allowed} sendMessage={::this.sendMessage}/>
    )
  }

  render() {
    const dynamicHeightStyleMessageDiv = {
      height: innerHeight - 210
    }

    return (
      <div className={style.conversation}>
        <div className={style.header}>
          {this.props.data ? ::this.renderHeader() : null}
        </div>
        <div className={style.messages} style={dynamicHeightStyleMessageDiv}>
          {this.props.data ? ::this.renderMessages() : null}
        </div>
        {::this.renderTypeArea()}
      </div>
    )
  }
}
