// Keplerian orbital elements for planets (simplified, J2000 epoch)
// a: semi-major axis (AU), e: eccentricity, i: inclination (deg),
// L: mean longitude (deg), longPeri: longitude of perihelion (deg),
// longNode: longitude of ascending node (deg)
// Rates are per century.
// Physical data: axial tilt (deg), rotation period (Earth hours)

// Sun data for "About Me" modal
export const SUN_DATA = {
  name: 'Sun',
  label: 'About Me',
  description: 'Full-stack developer passionate about creating immersive web experiences.',
  color: '#ffaa00',
  emissive: '#ff6600',
  atmosphereColor: '#ffcc44',
  radius: 695700, // Real sun radius in km
  visualRadius: 109, // Visual radius in scene units (109x Earth)
  axialTilt: 7.25,
  siderealDay: 609.12, // ~25 Earth days at equator
  details: {
    tech: ['React', 'Three.js', 'Node.js', 'TypeScript', 'Python', 'WebGL'],
    description:
      'Experienced full-stack developer specializing in 3D web experiences, real-time applications, and creative coding. Passionate about astronomy, physics simulations, and pushing the boundaries of what\'s possible on the web.',
  },
};

const planetData = {
  mercury: {
    name: 'Mercury',
    label: 'Contact Terminal',
    description: 'Direct communication channel — email, socials, and more.',
    color: '#b5b5b5',
    emissive: '#333333',
    atmosphereColor: '#aaaaaa',
    radius: 0.35,
    axialTilt: 0.034, // Nearly no tilt
    siderealDay: 1407.6, // 58.6 Earth days
    details: {
      tech: ['Email', 'LinkedIn', 'GitHub', 'Twitter'],
      description: 'Get in touch through any of these channels.',
    },
    orbital: {
      a: 0.38709927, aRate: 0.00000037,
      e: 0.20563593, eRate: 0.00001906,
      i: 7.00497902, iRate: -0.00594749,
      L: 252.25032350, LRate: 149472.67411175,
      longPeri: 77.45779628, longPeriRate: 0.16047689,
      longNode: 48.33076593, longNodeRate: -0.12534081,
    },
  },
  venus: {
    name: 'Venus',
    label: 'Dating App',
    description: 'A modern dating application with real-time matching and chat.',
    color: '#e8cda0',
    emissive: '#4a3520',
    atmosphereColor: '#ffcc66',
    radius: 0.6,
    axialTilt: 177.4, // Retrograde rotation
    siderealDay: 5832.5, // 243 Earth days (retrograde)
    details: {
      tech: ['React Native', 'Firebase', 'Node.js', 'Socket.io'],
      description:
        'Full-stack dating app with swipe mechanics, real-time messaging, and AI-powered matching algorithm.',
    },
    orbital: {
      a: 0.72333566, aRate: 0.00000390,
      e: 0.00677672, eRate: -0.00004107,
      i: 3.39467605, iRate: -0.00078890,
      L: 181.97909950, LRate: 58517.81538729,
      longPeri: 131.60246718, longPeriRate: 0.00268329,
      longNode: 76.67984255, longNodeRate: -0.27769418,
    },
  },
  earth: {
    name: 'Earth',
    label: 'Voting Website',
    description: 'Secure blockchain-based voting platform for transparent elections.',
    color: '#4488ff',
    emissive: '#112244',
    atmosphereColor: '#6699ff',
    radius: 0.65,
    axialTilt: 23.44, // 23.44 degrees
    siderealDay: 23.9345, // 23 hours 56 minutes
    details: {
      tech: ['React', 'Solidity', 'Ethereum', 'Tailwind CSS'],
      description:
        'Decentralized voting platform built on Ethereum blockchain ensuring transparent, tamper-proof elections with real-time results.',
    },
    orbital: {
      a: 1.00000261, aRate: 0.00000562,
      e: 0.01671123, eRate: -0.00004392,
      i: -0.00001531, iRate: -0.01294668,
      L: 100.46457166, LRate: 35999.37244981,
      longPeri: 102.93768193, longPeriRate: 0.32327364,
      longNode: 0.0, longNodeRate: 0.0,
    },
  },
  mars: {
    name: 'Mars',
    label: 'E-Commerce Platform',
    description: 'Full-featured online marketplace with AI recommendations.',
    color: '#cc4422',
    emissive: '#331100',
    atmosphereColor: '#ff6633',
    radius: 0.5,
    axialTilt: 25.19,
    siderealDay: 24.6229, // Slightly longer than Earth
    details: {
      tech: ['Next.js', 'Stripe', 'PostgreSQL', 'Redis'],
      description:
        'Scalable e-commerce platform with AI product recommendations, real-time inventory, and seamless payment integration.',
    },
    orbital: {
      a: 1.52371034, aRate: 0.00001847,
      e: 0.09339410, eRate: 0.00007882,
      i: 1.84969142, iRate: -0.00813131,
      L: -4.55343205, LRate: 19140.30268499,
      longPeri: -23.94362959, longPeriRate: 0.44441088,
      longNode: 49.55953891, longNodeRate: -0.29257343,
    },
  },
  jupiter: {
    name: 'Jupiter',
    label: 'AI Dashboard',
    description: 'Enterprise AI analytics dashboard with real-time data visualization.',
    color: '#cc9966',
    emissive: '#332211',
    atmosphereColor: '#ddaa77',
    radius: 1.2,
    axialTilt: 3.13,
    siderealDay: 9.9250, // Fast rotation
    details: {
      tech: ['Python', 'TensorFlow', 'D3.js', 'FastAPI'],
      description:
        'Enterprise-grade analytics dashboard powered by machine learning models, featuring real-time data streams and interactive visualizations.',
    },
    orbital: {
      a: 5.20288700, aRate: -0.00011607,
      e: 0.04838624, eRate: -0.00013253,
      i: 1.30439695, iRate: -0.00183714,
      L: 34.39644051, LRate: 3034.74612775,
      longPeri: 14.72847983, longPeriRate: 0.21252668,
      longNode: 100.47390909, longNodeRate: 0.20469106,
    },
  },
  saturn: {
    name: 'Saturn',
    label: 'Social Media App',
    description: 'Next-gen social platform with AR filters and content creation tools.',
    color: '#ddcc88',
    emissive: '#332200',
    atmosphereColor: '#eedd99',
    radius: 1.0,
    axialTilt: 26.73,
    siderealDay: 10.656, // Fast rotation
    hasRings: true,
    details: {
      tech: ['Flutter', 'GraphQL', 'AWS', 'TensorFlow Lite'],
      description:
        'Feature-rich social media platform with AR camera filters, short-form video, and AI-powered content recommendation engine.',
    },
    orbital: {
      a: 9.53667594, aRate: -0.00125060,
      e: 0.05386179, eRate: -0.00050991,
      i: 2.48599187, iRate: 0.00193609,
      L: 49.95424423, LRate: 1222.49362201,
      longPeri: 92.59887831, longPeriRate: -0.41897216,
      longNode: 113.66242448, longNodeRate: -0.28867794,
    },
  },
  neptune: {
    name: 'Neptune',
    label: 'Cloud Infrastructure',
    description: 'Automated cloud deployment and monitoring solution.',
    color: '#3366cc',
    emissive: '#0a1133',
    atmosphereColor: '#4477dd',
    radius: 0.85,
    axialTilt: 28.32,
    siderealDay: 16.11,
    details: {
      tech: ['Terraform', 'Kubernetes', 'Go', 'Prometheus'],
      description:
        'Infrastructure-as-code platform with automated deployment pipelines, real-time monitoring, and self-healing capabilities.',
    },
    orbital: {
      a: 30.06992276, aRate: 0.00026291,
      e: 0.00859048, eRate: 0.00005105,
      i: 1.77004347, iRate: -0.00508664,
      L: -55.12002969, LRate: 786.54360060,
      longPeri: 44.96476227, longPeriRate: -0.32241464,
      longNode: 131.78422574, longNodeRate: -0.00508664,
    },
  },
};

export default planetData;
