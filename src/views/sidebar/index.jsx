import React from 'react'
import {
  Col,
  OverlayTrigger,
  Tooltip
} from 'react-bootstrap'

import Toggle from 'react-toggle'
import classnames from 'classnames'

import 'react-toggle/style.css'
import style from './style.scss'

import User from '../user'
import Ticket from '../ticket'

export default class Sidebar extends React.Component {

  constructor() {
    super()

    this.state = {
      allPaused: false,
      filter: true
    }
  }

  toggleAllPaused() {
    this.setState({
      allPaused: !this.state.allPaused
    })
    console.log("ACTION, Pause all:", this.state.allPaused)
  }

  toggleFilter() {
    this.props.toggleOnlyPaused()
  }

  renderUser(value) {
    const isCurrent = value.id === this.props.currentSession
    
    if (isCurrent || !this.props.filter || (this.props.filter && !!value.paused)) {
      return <User className={isCurrent ? style.current : ''} key={value.id} session={value} setSession={() => this.props.setSession(value.id)}></User>
    }
    return null
  }

  renderUsers() {
    const sessions = this.props.sessions.sessions

    if(sessions.length === 0) {
      return <p className={style.empty}>There's no conversation...</p>
    }
    return sessions.map(::this.renderUser)
  }

  render() {
    const filterTooltip = (
      <Tooltip id="tooltip">Show only paused conversations</Tooltip>
    )
    const filterStyle = {
      color: this.props.filter ? '#56c0b2' : '#666666'
    };

    const dynamicHeightUsersDiv = {
      height: innerHeight - 160
    }

    return (
      <div className={style.sidebar}>
        <div className={style.header}>
          <div className={style.filter}>
            <OverlayTrigger placement="top" overlay={filterTooltip}>
              <i className="material-icons" style={filterStyle} onClick={::this.toggleFilter}>bookmark</i>
            </OverlayTrigger>
          </div>
          <div style={{
            "position": "absolute",
            "right": "2px",
            "top": "10px"
          }} >
            <Ticket bp={this.props.bp} currentSessionId={this.props.currentSession}/>
          </div>
        </div>
        <div className={style.users} style={dynamicHeightUsersDiv}>
          {::this.renderUsers()}
        </div>
      </div>
    )
  }

}
