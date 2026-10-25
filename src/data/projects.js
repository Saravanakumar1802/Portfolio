import clipcloudSm from '../assets/optimized/clipcloud-640.webp'
import clipcloudLg from '../assets/optimized/clipcloud-1280.webp'
import openbookSm from '../assets/optimized/openbook-640.webp'
import openbookLg from '../assets/optimized/openbook-1280.webp'
import reviewRockerzSm from '../assets/optimized/review-rockerz-640.webp'
import reviewRockerzLg from '../assets/optimized/review-rockerz-1280.webp'
import moneyManagerSm from '../assets/optimized/money-manager-640.webp'
import moneyManagerLg from '../assets/optimized/money-manager-1280.webp'
import todoAppSm from '../assets/optimized/todo-app-640.webp'
import todoAppLg from '../assets/optimized/todo-app-1280.webp'
import portfolioSm from '../assets/optimized/portfolio-640.webp'
import portfolioLg from '../assets/optimized/portfolio-1280.webp'
import weatherApiSm from '../assets/optimized/weather-api-640.webp'
import weatherApiLg from '../assets/optimized/weather-api-1280.webp'
import linkTreeSm from '../assets/optimized/link-tree-640.webp'
import linkTreeLg from '../assets/optimized/link-tree-1280.webp'
import quoteGeneratorSm from '../assets/optimized/quote-generator-640.webp'
import quoteGeneratorLg from '../assets/optimized/quote-generator-1280.webp'
import digitalClockSm from '../assets/optimized/digital-clock-640.webp'
import digitalClockLg from '../assets/optimized/digital-clock-1280.webp'
import todoListSm from '../assets/optimized/todo-list-640.webp'
import todoListLg from '../assets/optimized/todo-list-1280.webp'
import gamingPageSm from '../assets/optimized/gaming-page-640.webp'
import gamingPageLg from '../assets/optimized/gaming-page-1280.webp'

const shot = (sm, lg) => ({ sm, lg })

export const projects = {
  featured: [
    {
      id: 'clipcloud',
      tier: 'flagship',
      kind: 'Video platform',
      title: 'ClipCloud',
      description:
        'A full-stack video workflow that brings publishing, discovery, and Firebase services into one connected product.',
      image: shot(clipcloudSm, clipcloudLg),
      repo: 'https://github.com/Saravanakumar1802/Youtube-Clone-Frontend',
      serverRepo: 'https://github.com/Saravanakumar1802/Youtube-Clone-Backend',
      demo: 'https://youtube-clone-saravana.netlify.app/',
      stack: ['React', 'Node.js', 'Express', 'MongoDB', 'Firebase'],
    },
    {
      id: 'openbook',
      tier: 'flagship',
      kind: 'Book platform',
      title: 'OpenBook',
      description:
        'A MERN book platform with Firebase authentication, built as independent client and server applications.',
      image: shot(openbookSm, openbookLg),
      repo: 'https://github.com/Saravanakumar1802/OpenBook-App-Client',
      serverRepo: 'https://github.com/Saravanakumar1802/OpenBook-App-Server',
      demo: 'https://openbook-app-saravana.netlify.app/',
      stack: ['MERN', 'Firebase Auth'],
    },
    {
      id: 'money-manager',
      tier: 'flagship',
      kind: 'Finance application',
      title: 'Money Manager',
      description:
        'A financial-management application pairing a dedicated React frontend with a Node, Express, and MongoDB backend.',
      image: shot(moneyManagerSm, moneyManagerLg),
      repo: 'https://github.com/Saravanakumar1802/Money-Manager-frontend',
      serverRepo: 'https://github.com/Saravanakumar1802/Money-Manager-backend',
      demo: 'https://money-manager-app-saravana.netlify.app/',
      stack: ['MongoDB', 'Express', 'React', 'Node.js'],
    },
    {
      id: 'review-rockerz',
      tier: 'flagship',
      kind: 'Movie interface',
      title: 'Review Rockerz',
      description: 'A focused React movie-review experience shaped with hooks and Material UI.',
      image: shot(reviewRockerzSm, reviewRockerzLg),
      repo: 'https://github.com/Saravanakumar1802/Movie-Site',
      demo: 'https://movie-site-saravana.netlify.app/',
      stack: ['React', 'Hooks', 'Material-UI'],
    },
    {
      id: 'todo-app',
      tier: 'lab',
      kind: 'Task manager',
      title: 'TODO App',
      description: 'A full-stack task manager for organizing and maintaining everyday work.',
      image: shot(todoAppSm, todoAppLg),
      repo: 'https://github.com/Saravanakumar1802/Fullstack-ToDo-App-Frontend',
      serverRepo: 'https://github.com/Saravanakumar1802/Fullstack-ToDo-backend',
      demo: 'https://mern-todo-app-saravana.netlify.app/',
      stack: ['MongoDB', 'Express', 'React', 'Node.js'],
    },
    {
      id: 'portfolio',
      tier: 'lab',
      kind: 'Creative development',
      title: 'My Portfolio',
      description:
        'This site — a hand-built 3D studio in React Three Fiber with a procedural character, GSAP choreography and an OS-style interface.',
      image: shot(portfolioSm, portfolioLg),
      repo: 'https://github.com/Saravanakumar1802/Portfolio',
      demo: 'https://portfolio-saravana.netlify.app/',
      stack: ['React', 'Three.js', 'R3F', 'GSAP'],
    },
    {
      id: 'weather-api',
      tier: 'lab',
      kind: 'API experiment',
      title: 'Weather API',
      description: 'A lightweight weather lookup powered by live API data and vanilla JavaScript.',
      image: shot(weatherApiSm, weatherApiLg),
      repo: 'https://github.com/Saravanakumar1802/Weather_API',
      demo: 'https://weather-api-saravana.netlify.app/',
      stack: ['HTML', 'CSS', 'JavaScript'],
    },
    {
      id: 'link-tree',
      tier: 'lab',
      kind: 'Identity page',
      title: 'Link-Tree',
      description: 'A compact link-in-bio page that brings personal destinations into one focused interface.',
      image: shot(linkTreeSm, linkTreeLg),
      repo: 'https://github.com/Saravanakumar1802/Link-tree',
      demo: 'https://link-tree-saravana.netlify.app/',
      stack: ['HTML5', 'CSS', 'JavaScript'],
    },
    {
      id: 'quote-generator',
      tier: 'lab',
      kind: 'JavaScript experiment',
      title: 'Quote Generator',
      description: 'A small JavaScript experiment that presents a fresh random quote on demand.',
      image: shot(quoteGeneratorSm, quoteGeneratorLg),
      repo: 'https://github.com/Saravanakumar1802/Random_Quote_Generator',
      demo: 'https://quote-generator-api-saravana.netlify.app/',
      stack: ['HTML', 'CSS', 'JavaScript'],
    },
  ],
  mini: [
    {
      id: 'digital-clock',
      tier: 'lab',
      kind: 'Time utility',
      title: 'Digital Clock',
      description: 'A real-time clock built with foundational HTML, CSS, and JavaScript.',
      image: shot(digitalClockSm, digitalClockLg),
      repo: 'https://github.com/Saravanakumar1802/Digital-Clock',
      demo: 'https://digital-clock-saravana.netlify.app/',
      stack: ['HTML', 'CSS', 'JavaScript'],
    },
    {
      id: 'todo-list',
      tier: 'lab',
      kind: 'Local utility',
      title: 'Todo List',
      description: 'A lightweight task list with localStorage-backed persistence.',
      image: shot(todoListSm, todoListLg),
      repo: 'https://github.com/Saravanakumar1802/Todo-List',
      demo: 'https://todo-list-localstorage-saravana.netlify.app/',
      stack: ['JavaScript', 'localStorage'],
    },
    {
      id: 'gaming-page',
      tier: 'lab',
      kind: 'Landing page',
      title: 'Gaming Page',
      description: 'A gaming-themed landing page composed with HTML and CSS.',
      image: shot(gamingPageSm, gamingPageLg),
      repo: 'https://github.com/Saravanakumar1802/Gaming-webpage',
      demo: 'https://gaming-page-saravana.netlify.app/',
      stack: ['HTML', 'CSS'],
    },
  ],
}
