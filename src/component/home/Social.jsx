import React from 'react'
import './home.css'

const Social = () => {
  return (
    <div className="home_social">
      <a href="https://www.instagram.com/sk._.logan/" className="home_social-icon" rel="noreferrer" target='_blank' >
        <i className="uil uil-instagram insta icon_size"></i>
      </a>

      <a href="https://github.com/Saravanakumar1802" className="home_social-icon" rel="noreferrer" target='_blank' >
        <i className="uil uil-github github icon_size"></i>
      </a>

      <a href="Javascript(void)" className="home_social-icon" rel="noreferrer" target='_blank' >
        <i className="uil uil-linkedin linked_in icon_size"></i>
      </a>

    </div>
  )
}

export default Social