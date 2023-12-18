import React from 'react'
import ProjectsCard from './ProjectsCard';

import 'animate.css';
import { Container, Row, Col, Tab, Nav } from "react-bootstrap";


//ProjectCard Pics
import todoListProjectPic from "../../assets/todolist-mini-project.png"
// import chatApp from "../../assets/chat app.png"
// import pokemonApiProjectPic from "../../assets/pokemon-api.png"
import gamingPageProjectPic from "../../assets/gaming-page.png"
import portfoliopic from "../../assets/my_portfolio.png"
import movieApp from "../../assets/movie site.jpeg"
import moneyManager from '../../assets/money-manager.png'
import todoApp from '../../assets/todo-app.png'
import weatherAPI from '../../assets/weather API.png'
import QuoteGenerator from '../../assets/Quote.png'
import youtube from '../../assets/YouTube.png'
import linktree from '../../assets/linkTree.png'
import clock from '../../assets/digitalClock.png'
import bookApp from '../../assets/openBook.jpeg'

const ProjectData = () => {
    let card = [{
        projectTitle: 'Clip_Cloud App',
        projectSummary: 'This Clip_Cloud App created using reactJs, nodejs, expressjs, MongoDb and Firebase.',
        image: youtube,
        github: 'https://github.com/Saravanakumar1802/Youtube-Clone-Frontend',
        githubServer: 'https://github.com/Saravanakumar1802/Youtube-Clone-Backend',
        netify: 'https://youtube-clone-saravana.netlify.app/',
    },
    {
        projectTitle: 'OpenBook App',
        projectSummary: 'I developed a Book Site. Combining MongoDB, Express.js, React, and Node.js, and firebase Auth.',
        image: bookApp,
        github: 'https://github.com/Saravanakumar1802/OpenBook-App-Client',
        githubServer: 'https://github.com/Saravanakumar1802/OpenBook-App-Server',
        netify: 'https://openbook-app-saravana.netlify.app/',
    },
    {
        projectTitle: 'Review Rockerz',
        projectSummary: 'Created Movie review site using react Js, react hooks, Material-UI',
        image: movieApp,
        github: 'https://github.com/Saravanakumar1802/Movie-Site',
        netify: 'https://movie-site-saravana.netlify.app/',
    },
    {

        projectTitle: 'Money_Manager',
        projectSummary: 'Money Manager App is a web-based financial management application built using the MERN stack',
        image: moneyManager,
        github: 'https://github.com/Saravanakumar1802/Money-Manager-frontend',
        githubServer: 'https://github.com/Saravanakumar1802/Money-Manager-backend',
        netify: 'https://money-manager-app-saravana.netlify.app/',
    },
    {
        projectTitle: 'TODO App',
        projectSummary: 'MERN stack ToDo App It allows users to manage their tasks efficiently',
        image: todoApp,
        github: 'https://github.com/Saravanakumar1802/Fullstack-ToDo-App-Frontend',
        githubServer: 'https://github.com/Saravanakumar1802/Fullstack-ToDo-backend',
        netify: 'https://mern-todo-app-saravana.netlify.app/',
    },
    {
        projectTitle: 'My Portfolio',
        projectSummary: 'A portfolio built with React.js. It is a dynamic and responsive.I additionally used emailJs and tostify etc..',
        image: portfoliopic,
        github: 'https://github.com/Saravanakumar1802/Portfolio',
        netify: 'https://portfolio-saravana.netlify.app/',
    },
    {
        projectTitle: 'Weather API',
        projectSummary: 'I created Weather API using HTML,CSS,Javascript',
        image: weatherAPI,
        github: 'https://github.com/Saravanakumar1802/Weather_API',
        netify: 'https://weather-api-saravana.netlify.app/',
    },
    {
        projectTitle: 'Link-Tree',
        projectSummary: 'I Created linkTree uing HTML5, Css, Js. Its a single-page website presenting a collection of links.',
        image: linktree,
        github: 'https://github.com/Saravanakumar1802/Link-tree',
        netify: 'https://link-tree-saravana.netlify.app/',
    },

    // {
    //     projectTitle: 'LetsChat App',
    //     projectSummary: 'Created Chat App using react Js, react hooks, ChatEngine and FirebaseAuth',
    //     image: chatApp,
    //     github: 'https://github.com/Saravanakumar1802/Chat_App',
    //     netify: 'https://chat-app-saravana.netlify.app/',
    // },
    // {
    //     projectTitle: 'Pokemon Api',
    //     projectSummary: 'Pokemon API using async/await, fetch and HTML, Css',
    //     image: pokemonApiProjectPic,
    //     github: 'https://github.com/Saravanakumar1802/Pokemon-API',
    //     netify: 'https://pokemon-api-hackathon-b38.netlify.app/',
    // }
    {
        projectTitle: 'Quote Generator',
        projectSummary: 'I created Quote API using HTML,CSS,Javascript',
        image: QuoteGenerator,
        github: 'https://github.com/Saravanakumar1802/Random_Quote_Generator',
        netify: 'https://quote-generator-api-saravana.netlify.app/',
    },
    ]

    let card2 = [
        {
            projectTitle: 'Digital Clock',
            projectSummary: 'I Created Digital Clock using HTML, Css, Javascript',
            image: clock,
            github: 'https://github.com/Saravanakumar1802/Digital-Clock',
            netify: 'https://digital-clock-saravana.netlify.app/',
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
    ]

    return (
        <section className="project portfoilo" id="projects">
            <h5 className="projects-title ">Projects</h5>
            <h2 className='heading'>Some of my recent <span>Works</span></h2>


            <Container>
                <Row>
                    <Col size={12}>
                        <Tab.Container id="projects-tabs" defaultActiveKey="first">
                            <Nav variant="pills" className="nav-pills mb-5 justify-content-center align-items-center" id="pills-tab">
                                <Nav.Item>
                                    <Nav.Link defaultValue="first" eventKey="first">Tab 1</Nav.Link>
                                </Nav.Item>
                                <Nav.Item>
                                    <Nav.Link eventKey="second">Tab 2</Nav.Link>
                                </Nav.Item>
                                <Nav.Item>
                                    <Nav.Link eventKey="third">Soon</Nav.Link>
                                </Nav.Item>
                            </Nav>
                            <Tab.Content id="slideInUp">
                                <Tab.Pane eventKey="first">
                                    <Row>
                                        <div className="portfolio-container">
                                            {card.map((carddata, id) => {

                                                return <ProjectsCard data={carddata} key={id} />

                                            })}
                                        </div>
                                    </Row>
                                </Tab.Pane>
                                <Tab.Pane eventKey="second">
                                    <div className="portfolio-container">
                                        {card2.map((carddata, id) => {

                                            return <ProjectsCard data={carddata} key={id} />

                                        })}
                                    </div>
                                </Tab.Pane>
                                <Tab.Pane eventKey="third">
                                    <h1 style={{ textAlign: "center", padding: "30px" }}>Coming Soon✨...</h1>
                                </Tab.Pane>
                            </Tab.Content>
                        </Tab.Container>
                    </Col>
                </Row>
            </Container>


        </section >
    )
}

export default ProjectData