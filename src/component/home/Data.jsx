import React from 'react'
// import myResume from '../../assets/Saravana-Cv.pdf';
import { Typewriter } from 'react-simple-typewriter'
const Data = () => {
    return (
        <div className="home_data" id='home'>
            <h1 className="home_title">Hey, I'm Saravanakumar<span className='hand'>👋</span></h1>

            <h2 className='typewriter-text1'>

                <span className='typewriter-text' style={{ fontWeight: 'bold' }}>
                    <Typewriter
                        loop
                        cursor
                        cursorStyle="_"
                        typeSpeed={70}
                        deleteSpeed={50}
                        delaySpeed={1000}
                        words={[' Front-End Developer', ' MERN Stack Developer']}
                    />
                </span>
            </h2>


            <p className="home_description">I'm creative Front-end Developer from india and
                I'm very passionate and dedicated to my work.</p>
            <div className='button1'>


                <a download='Saravana-Cv' target="_blank" rel="noreferrer" href='https://drive.google.com/file/d/1CROrWhp9T2jrF2yhAHq4DZzl3IcvAMN1/view?usp=sharing' className='resume-btn'>
                    <div className="left"></div>
                    Resume
                    <div className="right"></div>
                </a>
            </div>

        </div>
    )
}

export default Data