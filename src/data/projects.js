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

import jobHuntSm from '../assets/optimized/job-hunt-copilot-640.webp'
import jobHuntLg from '../assets/optimized/job-hunt-copilot-1280.webp'
import jhcHowSm from '../assets/optimized/jhc-how-it-works-640.webp'
import jhcHowLg from '../assets/optimized/jhc-how-it-works-1280.webp'
import jhcMatchesSm from '../assets/optimized/jhc-matches-640.webp'
import jhcMatchesLg from '../assets/optimized/jhc-matches-1280.webp'
import jhcDraftSm from '../assets/optimized/jhc-hr-draft-640.webp'
import jhcDraftLg from '../assets/optimized/jhc-hr-draft-1280.webp'
import jhcTrackerSm from '../assets/optimized/jhc-tracker-640.webp'
import jhcTrackerLg from '../assets/optimized/jhc-tracker-1280.webp'
import jhcUsageSm from '../assets/optimized/jhc-usage-640.webp'
import jhcUsageLg from '../assets/optimized/jhc-usage-1280.webp'

const shot = (sm, lg) => ({ sm, lg })

// The newest build, shown as a case study above the stacked windows.
export const spotlight = {
  id: 'job-hunt-copilot',
  kind: 'AI job-search assistant',
  badge: 'New · AI agents',
  title: 'Job Hunt Copilot',
  description:
    'Enter a role and your skills, and five agents search live LinkedIn and Naukri postings, score each job against your skills and rank them — then draft the message to HR for you.',
  note: 'Runs entirely on free tiers.',
  image: shot(jobHuntSm, jobHuntLg),
  preview: '/projects/job-hunt-copilot/preview.mp4',
  video: '/projects/job-hunt-copilot/demo.mp4',
  videoLength: '1:50',
  repo: 'https://github.com/Saravanakumar1802/jobhunt-agent',
  demo: 'https://jobhunt-agent-1.onrender.com/',
  stack: ['React 19', 'FastAPI', 'LangGraph', 'LiteLLM', 'MongoDB Atlas', 'Three.js', 'GSAP'],
  // The agent pipeline, in order; the last step is what you get back.
  agents: ['Search', 'Pre-filter', 'Analyse', 'Match', 'Rank'],
  output: 'Draft to HR',
  gallery: [
    { image: shot(jhcHowSm, jhcHowLg), caption: 'How it works — search, shortlist, read, rank' },
    { image: shot(jhcMatchesSm, jhcMatchesLg), caption: 'Ranked matches with skill gaps and AI reasoning' },
    { image: shot(jhcDraftSm, jhcDraftLg), caption: 'One click drafts the message to HR' },
    { image: shot(jhcTrackerSm, jhcTrackerLg), caption: 'Save jobs and track every application' },
    { image: shot(jhcUsageSm, jhcUsageLg), caption: 'Free-tier quotas and model usage, tracked live' },
  ],
}

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
