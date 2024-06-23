import React from 'react'
import './home.css'

const Social = () => {
  return (
    <div className="home_social">
      <a href="https://www.linkedin.com/in/s-saravanakumar-27aa78268/" className="home_social-icon" rel="noreferrer" target='_blank' >
        {/* <i className="uil uil-linkedin linked_in icon_size"></i> */}
        <img width="30" height="30" src="https://img.icons8.com/ios-glyphs/30/linkedin.png" alt="linkedin" />

      </a>
      <a href="https://github.com/Saravanakumar1802" className="home_social-icon" rel="noreferrer" target='_blank' >
        {/* <i className="uil uil-github github icon_size"></i> */}
        <img width="30" height="30" src="https://img.icons8.com/ios-glyphs/30/github.png" alt="github" />

      </a>

      <a href="https://twitter.com/SKLOGAN5" className="home_social-icon" rel="noreferrer" target='_blank' >
        <img width="30" height="30" src="https://img.icons8.com/ios-glyphs/30/twitter--v1.png" alt="twitter--v1" />
      </a>


    </div>
  )
}

export default Social