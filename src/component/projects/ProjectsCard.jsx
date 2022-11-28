import React from 'react';
import './projects.css';

const ProjectsCard = (props) => {
    return (

        <div className="project-container project-card">
            <img
                src={props.data.image}
                alt="Project_Image"
                loading="lazy"
                className="project-pic"
            />
            <h3 className="project-title">{props.data.projectTitle}</h3>
            <p className="project-details">{props.data.content}</p>

            <div className="project_links">
                <a href={props.data.netify} target="_blank" rel="noreferrer" className="project-link">Demo
                    <i className="project_preview uil uil-arrow-up-right"></i>
                </a>
                <a href={props.data.github} target="_blank" rel="noreferrer" className="project-link">Source Code
                    <i className="project_github uil uil-github"></i>
                </a>
            </div>

        </div>
    )
}

export default ProjectsCard