import React from 'react'
import ProjectsCard from './ProjectsCard';
import ProjectPic from "../../assets/project-img.jpg";

const ProjectData = () => {
    let card = {
        projectTitle: 'Project Name',
        image: ProjectPic,
        content: 'lorem, ipsum dolor sit amet consectetur adipisicing elit. Quas ratione vel inventore labore commodi modi quos culpa aut saepe! Alias!',
        github: 'https://github.com/Saravanakumar1802/Pokemon-API',
        netify: 'https://pokemon-api-hackathon-b38.netlify.app/'

    }
    return (
        <section className="projects" id="projects">
            <div className='project_title'>
                <h1 className="projects-title">Some of My Recent Projects</h1>
            </div>
            <div className="projects-containers">
                <ProjectsCard data={card} />
                <ProjectsCard data={card} />
                <ProjectsCard data={card} />
                <ProjectsCard data={card} />
                <ProjectsCard data={card} />
                <ProjectsCard data={card} />

            </div>
        </section>
    )
}

export default ProjectData