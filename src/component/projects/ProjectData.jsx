import React from 'react'
import ProjectsCard from './ProjectsCard';

//ProjectCard Pics
// import ProjectPic from "../../assets/project-img.jpg";
import todoListProjectPic from "../../assets/todolist-mini-project.png"
import pokemonApiProjectPic from "../../assets/pokemon-api.png"
import gamingPageProjectPic from "../../assets/gaming-page.png"

const ProjectData = () => {
    let card = [{
        projectTitle: 'Pokemon Api',
        image: pokemonApiProjectPic,
        github: 'https://github.com/Saravanakumar1802/Pokemon-API',
        netify: 'https://pokemon-api-hackathon-b38.netlify.app/',
    },
    {
        projectTitle: 'Todo List',
        image: todoListProjectPic,
        github: 'https://github.com/Saravanakumar1802/Todo-List',
        netify: 'https://todo-list-localstorage-saravana.netlify.app/'
    },
    {
        projectTitle: 'Gaming Page',
        image: gamingPageProjectPic,
        github: 'https://github.com/Saravanakumar1802/Gaming-webpage',
        netify: 'https://gaming-page-saravana.netlify.app/',
    }]
    return (
        <section className="projects" id="projects">
            <div className='project_title'>
                <h5 className="projects-title">Projects</h5>
                <h1 classname='pro-titleh5'>Some of My recent Works</h1>
            </div>
            <div className="projects-containers">
                <ProjectsCard data={card[0]} />
                <ProjectsCard data={card[1]} />
                <ProjectsCard data={card[2]} />
                {/* <ProjectsCard data={card[2]} />
                <ProjectsCard data={card[2]} />
                <ProjectsCard data={card[2]} /> */}
            </div>
        </section>
    )
}

export default ProjectData