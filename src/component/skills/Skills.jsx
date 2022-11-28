import React from 'react'
import './skills.css'
import HtmlIcon from "../../assets/icons8-html-5-48.png";
import CssIcon from "../../assets/icons8-css3-48.png";
import javascriptIcon from "../../assets/icons8-javascript.png";
import BootstrapIcon from "../../assets/icons8-bootstrap-48.png";
import ReactIcon from "../../assets/icons8-react-native-48.png";
import NodeIcon from "../../assets/icons8-nodejs-48.png";

const Skills = () => {
    return (
        <div className='skill_container' id='skill'>
            <div className="skills">
                <h1 className='skill_title_color'>My Skills</h1>
            </div>

            <div className="skill_icons">
                <img src={HtmlIcon} className="skill_img html" alt="..." />
                <img src={CssIcon} className="skill_img css" alt="..." />
                <img src={javascriptIcon} className="skill_img js" alt="..." />
                <img src={BootstrapIcon} className="skill_img bootstrap" alt="..." />
                <img src={ReactIcon} className="skill_img react" alt="..." />
                <img src={NodeIcon} className="skill_img node" alt="..." />
            </div>
        </div>
    )
}

export default Skills