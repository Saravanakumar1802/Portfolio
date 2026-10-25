import { FaGithub, FaLinkedinIn, FaXTwitter, FaWhatsapp } from 'react-icons/fa6'
import { SiLeetcode } from 'react-icons/si'

export const site = {
  name: 'Saravanakumar',
  firstName: 'Saravana',
  displayName: 'Saravana Kumar',
  location: 'Tamil Nadu, India',
  timeZone: 'Asia/Kolkata',
  roles: ['Full-stack developer', 'Web designer', 'AI integrations'],
  experienceYears: 2.3,
  tagline:
    'I design interfaces, build the systems behind them, and integrate AI into real workflows — from PDF data extraction to contract analysis.',
  greeting: ['Hi, I’m Saravana 👋', 'Full-stack developer · Web designer · AI integrations'],
  // Random lines the character says when clicked.
  quips: [
    'Shipping something new tonight.',
    'Coffee count: 3. Bugs: 0. Probably.',
    'Want to build something together?',
    'React on the front, Node at the back.',
    'Prompt engineering is just API design with feelings.',
    'This whole room is built in code.',
  ],
  about: {
    file: 'about.txt',
    heading: 'Designer’s eye, engineer’s hands.',
    paragraphs: [
      'I’m Saravanakumar — a full-stack developer and web designer based in India. I spend my days between Figma frames, React components, Node services and the database that ties them together.',
      'Over 2.3 years at Mavdero Tech Services I’ve shipped product features end to end: shaping the interface, building the API, and integrating AI into real workflows — extracting structured data from PDFs and analysing contracts with LLMs.',
      'I care about the details people feel but rarely notice — motion that explains, layouts that breathe, and systems that stay fast.',
    ],
    now: [
      { label: 'Building', value: 'AI document workflows (PDF + contracts)' },
      { label: 'Learning', value: 'WebGL & creative 3D on the web' },
      { label: 'Stack', value: 'React · Node · MongoDB' },
    ],
  },
  roleCards: [
    {
      title: 'Full-stack dev',
      note: 'React + Node + Mongo, shipped as one product.',
      copy: 'React interfaces, Node and Express APIs, MongoDB and MySQL data — built and shipped as one product.',
    },
    {
      title: 'Web design',
      note: 'Clear layouts and motion that explains.',
      copy: 'Visual systems, responsive layouts and motion that make interfaces clear and memorable.',
    },
    {
      title: 'AI integrations',
      note: 'PDF data extraction & contract analysis with LLMs.',
      copy: 'LLM-powered PDF data extraction and contract analysis, wired into real product workflows.',
    },
  ],
  experience: {
    company: 'Mavdero Tech Services',
    title: 'Full Stack Developer',
    period: '2024 — Present',
    summary:
      'Working across the whole product: interface design, React front ends, Node and Express services, data modelling, and AI integrations for document workflows.',
    // Each branch is drawn as a lane in the commit graph.
    branches: [
      {
        id: 'interface',
        label: 'feat/interface',
        title: 'Interface & design',
        copy: 'Turned product requirements into responsive, animated React experiences with a consistent visual system.',
        commits: ['Design system tokens', 'Responsive dashboards', 'Motion & micro-interactions'],
      },
      {
        id: 'systems',
        label: 'feat/systems',
        title: 'APIs & data',
        copy: 'Built Node and Express services, REST APIs and the MongoDB / MySQL models behind them.',
        commits: ['Auth & roles', 'REST endpoints', 'Query optimisation'],
      },
      {
        id: 'ai',
        label: 'feat/ai',
        title: 'AI integrations',
        copy: 'Integrated LLMs into document workflows — extracting structured data from PDFs and analysing contracts for key terms, dates and risks.',
        commits: ['AI data extraction from PDFs', 'Contract analysis pipeline', 'Structured output + validation'],
      },
      {
        id: 'shipping',
        label: 'release/main',
        title: 'Shipping',
        copy: 'Followed features from first sketch to deployment so screen, API and database arrive together.',
        commits: ['Code review', 'Deploy pipelines', 'Production support'],
      },
    ],
  },
  education: {
    status: 'Graduated',
    degree: 'B.E. Computer Science & Engineering',
    school: 'Mookambigai College of Engineering',
    summary:
      'The computer-science foundation behind my web work — algorithms, databases and networks — that led me into full-stack development.',
  },
  stats: [
    { value: 2.3, decimals: 1, suffix: ' yrs', unit: 'yrs', label: 'Building professionally', short: 'Experience' },
    { value: 12, decimals: 0, suffix: '+', unit: '+', label: 'Projects shipped', short: 'Projects' },
    {
      value: 3,
      decimals: 0,
      suffix: '',
      label: 'Disciplines — dev, design, AI integrations',
      short: 'Dev · Design · AI',
    },
  ],
  email: 'saravana1802kumar@gmail.com',
  whatsapp: { label: '+91 82484 63245', href: 'https://wa.me/918248463245', icon: FaWhatsapp },
  resumeUrl: '/Saravana-Cv.pdf',
  emailjs: {
    serviceId: 'service_i4w2usm',
    templateId: 'template_kunr1eo',
    publicKey: 'HvKK0Z6FbhX-0Fsu5',
  },
  socials: [
    { name: 'GitHub', handle: '@Saravanakumar1802', href: 'https://github.com/Saravanakumar1802', icon: FaGithub },
    {
      name: 'LeetCode',
      handle: '@Saravanakumar1802',
      href: 'https://leetcode.com/u/Saravanakumar1802/',
      icon: SiLeetcode,
    },
    {
      name: 'LinkedIn',
      handle: 's-saravanakumar',
      href: 'https://www.linkedin.com/in/s-saravanakumar-27aa78268/',
      icon: FaLinkedinIn,
    },
    { name: 'X', handle: '@SKLOGAN5', href: 'https://twitter.com/SKLOGAN5', icon: FaXTwitter },
  ],
}
