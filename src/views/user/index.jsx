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
      displayImg: 'block',
      agentsEngaged: []
    }

    this.getBrandImage = ::this.getBrandImage
  }

  onErrorLoadingImage() {
    this.setState({
      displayImg: 'none'
    })
  }

  getBrandImage(brandId) {
    const brandIcons = {
      1: 'https://box8.in/favicon.ico',
      13: 'https://mojopizza.in/favicon.ico',
    }

    return (
      <div>
        <img src={brandIcons[brandId]} className={style.brand_icon} />
      </div>
    );
  }


  render() {
    let dateFormatted = moment(this.props.session.last_event_on).fromNow()
    dateFormatted = dateFormatted.replace('minutes', 'mins').replace('seconds', 'secs')
    const agent = ["undefined", "null"].includes(String(this.props.session.sent_by)) ? 'Bot' : this.props.session.sent_by
    const userDisplayName = ["undefined", "null"].includes(String(this.props.session.phone_no)) ? (this.props.session.ip || this.props.session.full_name) : (this.props.session.full_name || this.props.session.ip)
    const textPrefix = this.props.session.direction === 'in' ? 'Customer: ' : `${agent}: `
    const subplatform = String(this.props.session.subplatform).toUpperCase()
    return (
      <div className={classnames(style.user, this.props.className)} onClick={this.props.setSession}>
        {this.props.session.paused == 1 ? <i className="material-icons">pause_circle_filled</i> : null}
        <div className={style.content}>
          <h3>
            {!["undefined", "null"].includes(subplatform) ? <span><img className={style.deviceIcon} src={`/${subplatform}.png`}/></span> : null} {userDisplayName.length > 10 ?  `${userDisplayName.substr(0, 10)}..` : userDisplayName} 
          </h3>
          <h4 className={this.props.session.direction === "in" ? style.waitingStyle : null}> {this.props.session.direction === "in" ? "Reply Awaited" : `Last Agent: ${this.props.session.sent_by || 'Bot'}`} </h4>
        </div>
        <div className={style.date}>
          <h5>{dateFormatted}</h5>
          { this.getBrandImage(this.props.session.brand_id) }
        </div>
      </div>
    )
  }
}
