import React from 'react'
import './About.css'

const About = () => {
    return (
        <div className="about_container" id='about' >
            <div className="about">
                <h1 className='abt_me'>About <span>Me</span></h1>


                <div className="about_content"><p>My name is <span style={{ color: "#3586FF" }}>Saravanakumar</span> and I have completed a Bachelor of Engineering, majoring in Computer Science at Mookambigai College of Engineering. I have a passion in <span style={{ color: "#3586FF" }}>Full Stack developing</span>.
                    I am eager to learn new technologies and frameworks and am excited to contribute my skills to a team of developers.
                </p>
                </div>
            </div>
        </div>
    )
}

export default About