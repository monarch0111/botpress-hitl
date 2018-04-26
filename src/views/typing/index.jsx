import React from 'react'

import style from './style.scss'

export default class Typing extends React.Component {

  constructor() {
    super()

    this.state = {
      message: ''
    }
  }

  handleChange(event) {
    this.setState({
      message: event.target.value
    });
  }

  handleKeyPress(event) {
    if (event.key === 'Enter' && !event.shiftKey) {
      this.props.sendMessage(this.state.message)
      event.preventDefault()
      this.setState({
        message: ''
      });
      return false
    }
  }

  render() {
    return (
      <div className={style.typing}>
        { this.props.allowed
           ? <textarea placeholder="Use Shift + Enter to change line. Enter to send." value={this.state.message} onChange={::this.handleChange} onKeyPress={::this.handleKeyPress} />
           : (
            <div style={{"color": "white", "fontSize": "14px"}}>
              <center>
                <strong> Agents {this.props.agentsEngaged.join(", ")} are already having conversation. Would you like to join? </strong> <br/>
                <button onClick={this.props.joinChat} className={style.joinChat}>Yes, Join</button> </center> </div>
            )
        }
      </div>
    )
  }
}
