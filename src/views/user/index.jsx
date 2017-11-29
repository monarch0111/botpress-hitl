import React from 'react'
import {
  Col
} from 'react-bootstrap'
import moment from 'moment'
import classnames from 'classnames'

import style from './style.scss'

export default class User extends React.Component {

  constructor() {
    super()

    this.state = {
      displayImg: 'block'
    }
  }

  onErrorLoadingImage() {
    this.setState({
      displayImg: 'none'
    })
  }

  render() {
    const imgStyle = {
      display: this.state.displayImg
    }

    let dateFormatted = moment(this.props.session.last_event_on).fromNow()
    dateFormatted = dateFormatted.replace('minutes', 'mins').replace('seconds', 'secs')

    const agent = ["undefined", "null"].includes( String(this.props.session.sent_by))  ? 'Bot' : this.props.session.sent_by
    const userDisplayName = ["undefined", "null"].includes( String(this.props.session.phone_no) )  ? (this.props.session.ip || this.props.session.full_name) : (this.props.session.full_name || this.props.session.ip)
    const textPrefix = this.props.session.direction === 'in' ? 'Customer: ' : `${agent}: `

    return (
      <div className={classnames(style.user, this.props.className)} onClick={this.props.setSession}>
        {this.props.session.paused == 1 ? <i className="material-icons">pause_circle_filled</i> : null}
        <div className={style.imgContainer}>
          <img src={this.props.session.user_image_url} onError={::this.onErrorLoadingImage} style={imgStyle}/>
        </div>
        <div className={style.content}>
          <h3>
            {!["undefined", "null"].includes(this.props.session.subplatform) ? <span className={style[`${this.props.session.subplatform}`]}>{this.props.session.subplatform}</span> : null} {userDisplayName} 
          </h3>
          <h4><span className={style.textPrefix}>{textPrefix}</span>{this.props.session.text}</h4>
        </div>
        <div className={style.date}>
          <h5>{dateFormatted}</h5>
        </div>
      </div>
    )
  }
}
