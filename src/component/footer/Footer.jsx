import React from 'react'
import './footer.css'

const Footer = () => {
    return (
        <footer className='footer'>
            <div className="waves">
                <div className="wave" id="wave1"></div>
                <div className="wave" id="wave2"></div>
                <div className="wave" id="wave3"></div>
                <div className="wave" id="wave4"></div>
            </div>
            <div className='footer_container container'>

                <h1 className='footer_title'>SARAVANAKUMAR</h1>

                <ul className='footer_list'>
                    <li>
                        <a href="#home" className='footer_link'>Home</a>
                    </li>

                    <li>
                        <a href="#about" className='footer_link'>About</a>
                    </li>

                    <li>
                        <a href="#portfolio" className='footer_link'>Project</a>
                    </li>
                </ul>

                <div className="footer_social">

                    {/* <a href="https://www.instagram.com/sk._.logan/" className="home_social-icon" rel="noreferrer" target='_blank'>
                        <i className="uil uil-instagram insta f1 icon_size"></i>
                    </a> */}

                    <a href="https://www.linkedin.com/in/s-saravanakumar-27aa78268/" className="home_social-icon" rel="noreferrer" target='_blank'>
                        <i className="uil uil-linkedin linked_in f1 f2 icon_size"></i>
                    </a>

                    <a href="https://twitter.com/SKLOGAN5" className="home_social-icon" rel="noreferrer" target='_blank'>
                        <i className="uil uil-twitter linked_in f1 f2 icon_size"></i>
                    </a>

                    <a href="https://github.com/Saravanakumar1802" className="home_social-icon" rel="noreferrer" target='_blank'>
                        <i className="uil uil-github github  f1 f3_github icon_size"></i>
                    </a>
                </div>
                <hr className='contact_hr' />
                <span className='footer_copy'>&#169; Copyright 2022. Made by Saravanakumar</span>
            </div>
        </footer>
    )
}

export default Footer