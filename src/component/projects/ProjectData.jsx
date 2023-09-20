import React from 'react'
import ProjectsCard from './ProjectsCard';

//ProjectCard Pics
import todoListProjectPic from "../../assets/todolist-mini-project.png"
// import pokemonApiProjectPic from "../../assets/pokemon-api.png"
import gamingPageProjectPic from "../../assets/gaming-page.png"
import portfoliopic from "../../assets/my_portfolio.png"
import moneyManager from '../../assets/money-manager.png'
import todoApp from '../../assets/todo-app.png'
import weatherAPI from '../../assets/weather API.png'
import youtube from '../../assets/YouTube.png'

const ProjectData = () => {
    let card = [{
        projectTitle: 'YouTube_Clone',
        projectSummary: 'This YouTube_Clone created using reactJs, nodejs, expressjs, MongoDb.',
        image: youtube,
        github: 'https://github.com/Saravanakumar1802/Youtube-Clone-Frontend',
        netify: 'https://youtube-clone-saravana.netlify.app/',
    },
    {
        projectTitle: 'My Portfolio',
        projectSummary: 'This portfolio created using react Js',
        image: portfoliopic,
        github: 'https://github.com/Saravanakumar1802/Portfolio',
        netify: 'https://portfolio-saravana.netlify.app/',
    },
    {
        projectTitle: 'TODO App',
        projectSummary: 'MERN stack ToDo App',
        image: todoApp,
        github: 'https://github.com/Saravanakumar1802/Fullstack-ToDo-App-Frontend',
        netify: 'https://mern-todo-app-saravana.netlify.app/',
    },
    {
        projectTitle: 'Weather API',
        projectSummary: 'I created Weather API using HTML,CSS,Javascript',
        image: weatherAPI,
        github: 'https://github.com/Saravanakumar1802/Weather_API',
        netify: 'https://weather-api-saravana.netlify.app/',
    },
    {
        projectTitle: 'Money_Manager',
        projectSummary: 'MERN stack Money manager App',
        image: moneyManager,
        github: 'https://github.com/Saravanakumar1802/Money-Manager-frontend',
        netify: 'https://money-manager-app-saravana.netlify.app/',
    },
    {
        projectTitle: 'Todo List',
        projectSummary: 'I created Todo List With Javascript Using Local Storage',
        image: todoListProjectPic,
        github: 'https://github.com/Saravanakumar1802/Todo-List',
        netify: 'https://todo-list-localstorage-saravana.netlify.app/',
    },
    {
        projectTitle: 'Gaming Page',
        projectSummary: 'Simple Gaming site uing HTML and Css',
        image: gamingPageProjectPic,
        github: 'https://github.com/Saravanakumar1802/Gaming-webpage',
        netify: 'https://gaming-page-saravana.netlify.app/',
    },
        // {
        //     projectTitle: 'Pokemon Api',
        //     projectSummary: 'Pokemon API using async/await, fetch and HTML, Css',
        //     image: pokemonApiProjectPic,
        //     github: 'https://github.com/Saravanakumar1802/Pokemon-API',
        //     netify: 'https://pokemon-api-hackathon-b38.netlify.app/',
        // }
    ]

    return (
        <section className="portfoilo" id="portfolio">
            <h5 className="projects-title ">Projects</h5>
            <h2 className='heading'>Some of my recent <span>Works</span></h2>
            <div className="portfolio-container">
                {card.map((carddata, id) => {

                    return <ProjectsCard data={carddata} key={id} />

                })}
            </div>
        </section>
    )
}

export default ProjectData