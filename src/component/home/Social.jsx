import React from 'react'
import './home.css'

const Social = () => {
  return (
    <div className="home_social">
      <a href="https://www.linkedin.com/in/s-saravanakumar-27aa78268/" className="home_social-icon" rel="noreferrer" target='_blank' >
        <i className="uil uil-linkedin linked_in icon_size"></i>
      </a>
      <a href="https://github.com/Saravanakumar1802" className="home_social-icon" rel="noreferrer" target='_blank' >
        <i className="uil uil-github github icon_size"></i>
      </a>

      <a href="https://twitter.com/SKLOGAN5" className="home_social-icon" rel="noreferrer" target='_blank' >
        <i className="uil uil-twitter linked_in icon_size"></i>
      </a>

    </div>
  )
}

export default Social