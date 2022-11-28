import React from 'react'
import './footer.css'

const Footer = () => {
    return (
        <footer className='footer'>
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
                        <a href="#projects" className='footer_link'>Project</a>
                    </li>
                </ul>

                <div className="footer_social">

                    <a href="Javascript(void)" className="home_social-icon" target='_blank'>
                        <i className="uil uil-instagram insta f1 icon_size"></i>
                    </a>

                    <a href="Javascript(void)" className="home_social-icon" target='_blank'>
                        <i className="uil uil-linkedin linked_in f1  icon_size"></i>
                    </a>

                    <a href="Javascript(void)" className="home_social-icon" target='_blank'>
                        <i className="uil uil-github github  f1 icon_size"></i>
                    </a>

                    <a href="Javascript(void)" className="home_social-icon" target='_blank'>
                        <i className="uil uil-twitter linked_in f1 icon_size"></i>
                    </a>
                </div>
<hr className='contact_hr'/>
                <span className='footer_copy'>&#169; Copyright 2022. Made by Saravanakumar</span>
            </div>
        </footer>
    )
}

export default Footer