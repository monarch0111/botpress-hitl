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
      filter: true,
      filterUser: null
    }

    this.platformElements = {}
  }

  _filterUsers(newValue) {
    let {value} = newValue.target
    this.setState({
      filterUser: value
    })
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
    let sessions;
    if (!["undefined", "null", ""].includes(String(this.state.filterUser))){
      sessions = this.props.sessions.sessions.filter(session => {
        let {email, full_name, phone_no} = session
        return [email, full_name, phone_no].reduce((x, entity) => {
          return x + (!["null", "undefined", ""].includes(String(entity).toLowerCase()) && String(entity).toLowerCase().indexOf(this.state.filterUser) > -1) ? 1 : 0
        }, 0) > 0
      })
    }
    else{
      sessions = this.props.sessions.sessions 
    }

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
    const subplatforms = [...new Set(this.props.sessions.sessions.map(obj => String(obj.subplatform).toUpperCase()))]
    subplatforms.forEach(platform => {
      this.setState({
        [`${platform}`]: true
      })
    })
  }

  renderPlatformSelector() {
    const subplatforms = [...new Set(this.props.sessions.sessions.map(obj => String(obj.subplatform).toUpperCase()))]
    subplatforms.forEach(platform => {
      if(["UNDEFINED", "NULL"].includes(String(this.state[`${platform}`]).toUpperCase())){
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
                <Col sm={8}>
                  <span><img style={{width: "16px", height: "16px"}} src={`/${String(subplatform).toUpperCase()}.png`}/></span> {subplatform} 
                </Col>
                <Col sm={4}>
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

    const searchBar = {
      "height": "50px",
      "width": "100%",
      "padding": "15px",
      "color": "#666666",
      "fontSize": "16px",
      "borderStyle": "none",
      "borderBottom": "solid",
      "borderWidth": "1px",
      "borderBottomColor": "#d6d5d5",
      "outlineColor": "white"
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
          <div style={{
            "position": "sticky",
            "top": "0px",
            "zIndex": 1000}}> 
              <input type="text" style={searchBar} placeholder="Search... (Name / Email / Phone No) " onChange={::this._filterUsers}/> 
          </div>
          {::this.renderUsers()}
        </div>
      </div>
    )
  }

}
