import React from 'react';
import './projects.css';
import Button from 'react-bootstrap/Button';


const ProjectsCard = ({ data }) => {
    return (
        <div className="portfolio-box">
            <img src={data.image} alt="project-pic" loading="lazy" className='project-img' />
            <div className="portfolio-layer">
                <h4>{data.projectTitle}</h4>
                <p>{data.projectSummary}</p>
                <Button variant="primary" size="sm" className='projects-link-btn'>
                    <a href={data.netify} target="_blank" rel="noreferrer" className="project-link">Demo
                        <i className="project_preview uil uil-arrow-up-right"></i>
                    </a></Button> &nbsp;

                <Button variant="primary" size="sm" className='projects-link-btn'>
                    <a href={data.github} target="_blank" rel="noreferrer" className="project-link">Code
                        <i className="project_github uil uil-github"></i>
                    </a>
                </Button>
            </div>
        </div>
    )
}

export default ProjectsCard