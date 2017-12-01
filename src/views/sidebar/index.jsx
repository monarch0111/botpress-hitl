import React from 'react'
import {
  Col,
  OverlayTrigger,
  Tooltip,
  Popover,
  Button,
  Grid,
  Row
} from 'react-bootstrap'

import Toggle from 'react-toggle'
import classnames from 'classnames'

import 'react-toggle/style.css'
import style from './style.scss'

import User from '../user'

export default class Sidebar extends React.Component {

  constructor() {
    super()

    this.state = {
      allPaused: false,
      filter: true
    }

    this.platformElements = {}
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

    if(!this.state[value.subplatform]){
      return null
    }
    
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

  renderFilter (){
    if(["call_center", "call_center_head"].includes(localStorage.getItem('bp/agentRole'))) {return null}
    const filterTooltip = (
      <Tooltip id="tooltip">Show only paused conversations</Tooltip>
    )
    const filterStyle = {
      color: this.props.filter ? '#56c0b2' : '#666666'
    }
    return (
      <div className={style.filter}>
        <OverlayTrigger placement="top" overlay={filterTooltip}>
          <i className="material-icons" style={filterStyle} onClick={::this.toggleFilter}>bookmark</i>
        </OverlayTrigger>
      </div>
    )
  }

  toggleAcceptChat(subplatform) {
    const current_state = this.state[`${subplatform}`]
    this.setState({
      [`${subplatform}`]: !current_state
    })
  }

  componentDidMount() {
    const subplatforms = [...new Set(this.props.sessions.sessions.map(obj => obj.subplatform))]
    subplatforms.forEach(platform => {
      this.setState({
        [`${platform}`]: true
      })
    })
  }

  renderPlatformSelector() {
    const subplatforms = [...new Set(this.props.sessions.sessions.map(obj => obj.subplatform))]
    subplatforms.forEach(platform => {
      if(["undefined", "null"].includes(String(this.state[`${platform}`]))){
        this.setState({
          [`${platform}`]: true
        })
      }
    })

    const popoverClickRootClose = (
      <Popover id="popover-trigger-click-root-close" title="Select Platforms">
        {subplatforms.map(subplatform => {
          return (
            <div id={subplatform}>
            <Grid style={{width: "100%"}}>
              <Row>
                <Col sm={6}>
                  {subplatform} 
                </Col>
                <Col sm={6}>
                  <Toggle key={subplatform} index={subplatform} className={classnames(style.toggle, style.enabled)} checked={this.state[`${subplatform}`]} onChange={this.toggleAcceptChat.bind(this, subplatform)}/>    
                </Col>
              </Row>
            </Grid>
            </div>
          )
        })}
      </Popover>
    )

    return (
      <div>
        <OverlayTrigger trigger="click" rootClose placement="bottom" overlay={popoverClickRootClose}>
          <Button bsStyle="primary">Accept Chat From</Button>
        </OverlayTrigger>
      </div>
    )
  }

  render() {

    const dynamicHeightUsersDiv = {
      height: innerHeight - 160
    }

    return (
      <div className={style.sidebar}>
        <div className={style.header}>
          {::this.renderFilter()}
        </div>
        <div style={{
            "position": "absolute",
            "right": "2px",
            "top": "14px"
          }} >
          {::this.renderPlatformSelector()}
        </div>
        <div className={style.users} style={dynamicHeightUsersDiv}>
          {::this.renderUsers()}
        </div>
      </div>
    )
  }

}
