import React from 'react'
import {
  Row,
  Col,
  OverlayTrigger,
  Tooltip
} from 'react-bootstrap'

import style from './style.scss'
import moment from 'moment'
import _ from 'lodash'
import ReactAudioPlayer from 'react-audio-player'

export default class Message extends React.Component {

  constructor() {
    super()
  }

  renderText() {
    return <p>{this.props.content.text}</p>
  }

  renderImage() {
    if(this.props.content["raw_message"] && this.props.content["raw_message"]["data"] && this.props.content["raw_message"]["data"]["url"]){
      return (
        <a target="_blank" href={this.props.content["raw_message"]["data"]["url"]}>
          <img src={this.props.content["raw_message"]["data"]["url"]} alt={this.props.content.text}/>
        </a>
      )
    } else {
      return <img src={this.props.content.text}/>
    }
    
  }

  renderVideo() {
    return <video controls>
      <source src={this.props.content.text} type="video/mp4" />
    </video>
  }

  renderAudio() {
    return <ReactAudioPlayer className={style.audio} src={this.props.content.text} />
  }

  renderPayload(){
    return <p>{_.includes(["undefined", "null"], String(this.props.content.payload_text)) ? '' : `${this.props.content.payload_text} / `}{this.props.content.text}</p>
  }

  renderContent() {
    const type = this.props.content.type

    if (type === "message" || type === "text") {
      return this.renderText()
    }
    else if (_.includes(["quick_reply", "postback", "template"], type)){
      return this.renderPayload()
    }
    else if (type === "image") {
      return this.renderImage()
    }
    else if (type === "video") {
      return this.renderVideo()
    }
    else if (type === "audio") {
      return this.renderAudio()
    }
    else if (type === "file"){
      if (this.props.content["raw_message"] && this.props.content["raw_message"]["data"]){
        if (this.props.content["raw_message"]["data"]["mime"].includes("image")){
          return this.renderImage()
        }
        else {
          return (
            <a href={this.props.content["raw_message"]["data"]["url"] || "#"}>{this.props.content.text}</a>
          )
        }
      }
      else {
        return (
            <a href="#">{this.props.content.text}</a>
          )
      }
    }
    return null;
  }

  renderMessageFromUser() {
    return (
      <div className={style.message + ' ' + style.fromUser}>
        {this.renderContent()}
      </div>
    )
  }

  renderMessageFromBot() {
    return (
      <div className={style.message + ' ' + style.fromBot}>
        {this.renderContent()}
        <span className={style.sentBy}>{this.props.content.sent_by || 'Bot'}</span>
      </div>
    )
  }

  renderMessage() {
    const date = moment(this.props.content.ts).format('DD MMM YYYY [at] LT')

    const tooltip = (
      <Tooltip id="tooltip">{date}</Tooltip>
    )

    if(this.props.content.direction === 'in') {
      return <OverlayTrigger placement="right" overlay={tooltip}>
        {this.renderMessageFromUser()}
      </OverlayTrigger>
    }

    return <OverlayTrigger placement="left" overlay={tooltip}>
      {this.renderMessageFromBot()}
    </OverlayTrigger>

  }

  render() {
    const renderedTypes = [
      "text",
      "message",
      "image",
      "video",
      "audio",
      "quick_reply",
      "postback",
      "template",
      "file"
    ]

    if (!_.includes(renderedTypes, this.props.content.type)) {
      return null
    }
    return (
      <Row>
        <Col md={12}>
          {this.renderMessage()}
        </Col>
      </Row>
    )
  }
}
