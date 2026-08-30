const skillsData = [
  {
    category: "Game Development",
    icon: "🎮",
    themeColor: "var(--accent-green)",
    themeRgb: "34, 197, 94",
    skills: [
      { name: "Unreal Engine 5", rating: 4 },
      { name: "Unity 6", rating: 4 },
      { name: "Blueprint Scripting", rating: 4 },
      { name: "VR/AR Integration", rating: 3 }
    ]
  },
  {
    category: "Programming",
    icon: "💻",
    themeColor: "var(--accent-blue)",
    themeRgb: "2, 132, 199",
    skills: [
      { name: "C++", rating: 4 },
      { name: "C#", rating: 4 },
      { name: "Python", rating: 3 },
      { name: "Data Structures & OOP", rating: 4 }
    ]
  },
  {
    category: "Game Design",
    icon: "🕹️",
    themeColor: "#eab308",
    themeRgb: "234, 179, 8",
    skills: [
      { name: "Gameplay Systems", rating: 4 },
      { name: "Game Mechanics", rating: 4 },
      { name: "Level Design", rating: 4 },
      { name: "Player Experience", rating: 3 },
      { name: "Visual Storytelling", rating: 3 }
    ]
  },
  {
    category: "Technical Art & 3D",
    icon: "🎨",
    themeColor: "#ff81df",
    themeRgb: "255, 129, 223",
    skills: [
      { name: "Blender 3D", rating: 4 },
      { name: "Skeletal Rigging & Animation", rating: 3 },
      { name: "Environment Art & Lighting", rating: 4 },
      { name: "Asset Optimization", rating: 3 }
    ]
  },
  {
    category: "Web Development",
    icon: "🌐",
    themeColor: "#38bdf8",
    themeRgb: "56, 189, 248",
    skills: [
      { name: "HTML5 & CSS3", rating: 4 },
      { name: "JavaScript", rating: 3 },
      { name: "Figma UI/UX", rating: 4 },
      { name: "Firebase", rating: 3 }
    ]
  },
  {
    category: "Tools & Workflow",
    icon: "⚙️",
    themeColor: "#8b5cf6",
    themeRgb: "139, 92, 246",
    skills: [
      { name: "Git / GitHub", rating: 4 },
      { name: "VS Code", rating: 4 },
      { name: "Unity / Unreal Editor", rating: 4 },
      { name: "Real-Time Rendering", rating: 3 }
    ]
  }
];

const gameProjectsData = [
  {
    id: "survivor",
    category: "game-design",
    title: "The Endless Survivor (Unity)",
    subtitle: "2.5D SURVIVAL GAME",
    desc: "A 2.5D Survival game where you have to survive in a forest full of monsters.",
    longDesc: "Survive in a dark, atmospheric forest infested with monsters.|Manage resources, health, and combat using responsive controls.|Features dynamic lighting, ambient soundscapes, and hand-crafted environment assets.",
    images: "public/game dev and design/Game.webp",
    tags: ["Unity", "Environment", "Storytelling", "C#", "Level Design"],
    link: "https://shoubhik-bhattacharya.itch.io/the-endless-survivor-god-of-the-forest",
    linkText: "Play Itch.io",
    // HUD Stats
    engine: "Unity",
    complexity: "85%",
    stage: "Playable Build",
    tools: "Unity 3D, C#, ProBuilder",
    logEntries: [
      "Level Design: Initial level layout and environment block-out designed.",
      "Player Controller: Custom C# player controller and inventory scripting complete.",
      "Atmosphere: Integrated 2D/3D dynamic lighting and dark ambient audio.",
      "Publishing: Final game compilation and publishing live on Itch.io."
    ],
    expertPillars: [
      { icon: "🎯", title: "Survival Systems & Loop Balance", desc: "Balanced real-time survival variables (health, stamina, hunger) against enemy spawning parameters to create a challenging gameplay loop." },
      { icon: "⚡", title: "Lighting & Audio Atmosphere", desc: "Designed dynamic lighting overlays combined with ambient sound loops inside ProBuilder to build a high-tension forest experience." }
    ],
    expertMetrics: [
      { val: "60 FPS", lbl: "Target Frame Rate" },
      { val: "Custom C#", lbl: "Player Controller" },
      { val: "ProBuilder", lbl: "Scene Modeling" }
    ]
  },
  {
    id: "campus-tour",
    category: "game-design",
    title: "VR Campus Tour",
    subtitle: "VR/XR EXPERIENCE",
    desc: "An immersive VR campus tour developed in Unreal Engine, exploring university grounds with high-fidelity environments.",
    longDesc: "Explore the university campus in a fully immersive 3D virtual reality tour.|Developed with Unreal Engine 5 leveraging high-fidelity architectural models and realistic lighting.|Features interactive nodes, spatial audio, and smooth locomotion setups.",
    images: "public/game dev and design/vr_campus_tour.webp",
    tags: ["Unreal Engine 5", "VR/AR", "3D Modeling", "Environment Design"],
    // HUD Stats
    engine: "Unreal Engine 5",
    complexity: "90%",
    stage: "VR Demonstration",
    tools: "UE5, VR Interaction Toolkit, 3D Models",
    logEntries: [
      "Blueprints Layout: Stitched campus blueprints into layout reference grids.",
      "High-poly Modeling: High-poly mesh modeling of main buildings directly inside Unreal Engine using built-in modeling tools.",
      "Lumen GI: Configured Lumen lighting environment for outdoor and indoor consistency.",
      "Locomotion Setup: Coded smooth teleport locomotion controls and interactive nodes."
    ],
    expertPillars: [
      { icon: "🕶️", title: "Locomotion Comfort Mechanics", desc: "Programmed precise teleport navigation interfaces inside VR Interaction Toolkit to eliminate simulator sickness." },
      { icon: "📐", title: "High-Fidelity CAD Scaling", desc: "Constructed detailed structures directly within Unreal Engine using built-in modeling toolsets mapped to real university coordinate blueprints for complete scale accuracy." }
    ],
    expertMetrics: [
      { val: "Lumen GI", lbl: "Unreal Engine Lighting" },
      { val: "Comfort", lbl: "VR Motion Comfort" },
      { val: "1:1 blueprints", lbl: "Spatial Fidelity" }
    ]
  },
  // for adding new project (here)
  {
    id: "the-royal-king",
    category: "game-design",
    title: "King Runner",
    subtitle: "ENDLESS RUNNER (UNITY 6)",
    desc: "A fast-paced 3D endless runner game built completely in Unity 6, inspired by Subway Surfers.",
    longDesc: "Endless runner mechanics built ground-up in Unity 6 inspired by Subway Surfers.|Dynamic procedural track chunk spawner with smooth continuous level generation.|Custom collectable scripts, modern New Input System integration, and sound design.|High performance graphics optimization for smooth gameplay and stylized environment design.",
    images: "public/game dev and design/royal_king.png",
    tags: ["Unity 6", "Endless Runner", "C#", "Graphics Optimization", "Sound Artist"],
    link: "https://shoubhik-bhattacharya.itch.io/king-runner",
    linkText: "Play Itch.io",
    // HUD Stats
    engine: "Unity 6",
    complexity: "58%",
    stage: "Playable Build",
    tools: "Unity 6, C#, New Input System",
    logEntries: [
      "Chunks Spawner: Built dynamic continuous level chunk generation and pooling.",
      "Collective Scripts: Programmed item collection logic, coins, and score multipliers.",
      "Player Inputs New: Integrated Unity 6 New Input System for responsive swipe and lane movement.",
      "Graphics Optimization: Optimized low-poly shaders, mesh batching, and performance metrics.",
      "Environment Design: Crafted medieval castle runway and environment assets.",
      "Sound Artist: Produced audio soundscapes, footsteps, and coin pickup sound effects."
    ],
    expertPillars: [
      { icon: "⚡", title: "Procedural Spawner Pooling", desc: "Engineered object pooling algorithms that instantiate obstacles dynamically ahead of the runner without causing garbage collection spikes." },
      { icon: "🎯", title: "Fluid Gesture Integration", desc: "Utilized Unity's New Input System to build swipe and lane-shifting movements, achieving responsive controls." }
    ],
    expertMetrics: [
      { val: "Zero GC", lbl: "Pooling Performance" },
      { val: "New Input", lbl: "Controls Stack" },
      { val: "Stylized", lbl: "Visual Aesthetic" }
    ]
  },
  // for adding new project (end)
  {
    id: "axe-man",
    category: "game-art",
    title: "Axe Man",
    subtitle: "CREATED IN BLENDER",
    desc: "A stylized low-poly character model of a woodsman wielding a powerful hammer-axe. Designed, modeled, and textured entirely in Blender.",
    longDesc: "Hand-crafted 3D low-poly character detailing.|Features fully optimized geometry, clean UV unwrapping, and custom stylized hand-painted textures.|Rigged and prepared for animation pipelines in game engines.",
    images: "public/model and animation/axe man/axe_man_0.webp,public/model and animation/axe man/axe_man_1.webp,public/model and animation/axe man/axe_man_2.webp,public/model and animation/axe man/axe_man_3.webp",
    tags: ["Blender", "3D Modeling", "Stylized Art", "Rigging"],
    // HUD Stats
    engine: "Blender Pipeline",
    complexity: "75%",
    stage: "Complete Character Rig",
    tools: "Blender",
    logEntries: [
      "Concept Art: Created character design sheets and reference alignment setups.",
      "Low-poly Topology: Modeled low-poly meshes keeping clean edge loop topology.",
      "UV Texturing: Unwrapped UV map projections and painted detailed color maps.",
      "Skeleton Rigging: Constructed complete armature bones with IK/FK constraints."
    ],
    expertPillars: [
      { icon: "🎨", title: "Stylized Deformation Topology", desc: "Sculpted clean model geometry inside Blender, organizing edge loops to support rig movements and joints." },
      { icon: "🖌️", title: "Hand-Painted Asset Texturing", desc: "Authored specialized diffuse overlays with hand-painted shading details to highlight asset depth." }
    ],
    expertMetrics: [
      { val: "Clean Quads", lbl: "Topology Standard" },
      { val: "IK / FK", lbl: "Rig Controls" },
      { val: "Low-Poly", lbl: "GPU Optimized" }
    ]
  },
  {
    id: "pichku",
    category: "game-art",
    title: "Pichku",
    subtitle: "CREATED IN BLENDER",
    desc: "A stylized character model of Pichku. Designed, modeled, and rendered entirely in Blender.",
    longDesc: "Charming stylized character art featuring optimized game topology.|Meticulously unwrapped UV layout and hand-painted texturing mapping.|Rigged armature suitable for production game animation pipelines.",
    images: "public/pichku/pichku_3.webp,public/pichku/pichku_0.webp,public/pichku/pichku_1.webp,public/pichku/pichku_2.webp,public/pichku/pichku_4.webp",
    tags: ["Blender", "3D Modeling", "Character Art", "Rendering"],
    link: "https://gamedev_shoubhik2.artstation.com/projects/1L1NZo",
    linkText: "Artstation",
    // HUD Stats
    engine: "Blender Cycles",
    complexity: "85%",
    stage: "Finished Model & Textures",
    tools: "Blender,Rigging",
    logEntries: [
      "Reference Grids: Sketched digital profile blueprints and reference setup grids.",
      "Stylized Sculpt: Sculpted clean stylized character mesh within Blender viewport.",
      "Substance Painter: Generated detailed texture overlays inside Substance Painter.",
      "Armature Setup: Assembled skeleton armature constraints and compiled final render shots."
    ],
    expertPillars: [
      { icon: "🐰", title: "Charming Character Design", desc: "Created whimsical asset outlines emphasizing clean facial and body features optimized for layout reads." },
      { icon: "🎨", title: "Substance Texturing Pipeline", desc: "Designed roughness-metallic shader layouts to define stylistic character appeal." }
    ],
    expertMetrics: [
      { val: "Blender Texture", lbl: "Texturing Pipeline" },
      { val: "Cycles 4K", lbl: "Render Quality" },
      { val: "Armature", lbl: "Rig Controls" }
    ]
  },
  {
    id: "cute-monster",
    category: "game-art",
    title: "Cute Monster",
    subtitle: "CREATED IN BLENDER",
    desc: "A whimsical, stylized character model of a cute monster with multi-angle renders and detailed textures.",
    longDesc: "High-fidelity 3D modeling and sculpting details in Blender.|Features expressive stylized elements, custom digital textures, and material shaders.|Ready for rig controls and animation cycles.",
    images: "public/model and animation/Monster/Untold Story(1).webp,public/model and animation/Monster/Cute_monster.webp,public/model and animation/Monster/Cute_monster2.webp,public/model and animation/Monster/Cute_monster3.webp,public/model and animation/Monster/Body.webp",
    tags: ["Blender", "3D Modeling", "Character Art", "Texturing"],
    link: "https://gamedev_shoubhik2.artstation.com/projects/vbNrNx",
    linkText: "ArtStation",
    // HUD Stats
    engine: "Blender Cycles",
    complexity: "82%",
    stage: "Fully Textured Rig",
    tools: "Blender,Rigging , Cycles",
    logEntries: [
      "Base Sculpting: Sculpted base mesh and refined anatomical details.",
      "Substance Texturing: Painted hand-crafted textures in Substance Painter.",
      "Face Rigging: Rigged facial expressions and body mechanics.",
      "Cycles Renders: Rendered final beauty shots in Blender Cycles."
    ],
    expertPillars: [
      { icon: "👹", title: "Character Design & Appeals", desc: "Structured visual curves with squash-and-stretch capabilities to deliver dynamic expressions." },
      { icon: "🎬", title: "Cinematic Lighting Setup", desc: "Authored multi-point studio light layers in Cycles to highlight material textures." }
    ],
    expertMetrics: [
      { val: "Cycles Render", lbl: "Engine Selection" },
      { val: "Rig Controls", lbl: "Animation Ready" },
      { val: "Stylized", lbl: "Creative Theme" }
    ]
  },
  {
    id: "magic-baby",
    category: "game-art",
    title: "Magic Baby",
    subtitle: "CREATED IN BLENDER",
    desc: "A whimsical, stylized character model of a magic baby with expressive features. Sculpted, textured, and rendered entirely in Blender.",
    longDesc: "Expressive stylized character design with focus on clean topology and soft-edge shading.|Hand-painted procedural textures for a magical, cartoony glow.|Perfect fit for stylized RPGs or animated narratives.",
    images: "public/model and animation/Magic baby/magic_baby_1.webp,public/model and animation/Magic baby/magic_baby_2.webp,public/model and animation/Magic baby/magic_baby_3.webp",
    tags: ["Blender", "Character Art", "Texturing", "Rendering"],
    // HUD Stats
    engine: "Blender Cycles",
    complexity: "70%",
    stage: "Rendered Model",
    tools: "Blender Sculpting, Cycles renderer",
    logEntries: [
      "Proportions Sculpt: Sculpted magic baby head and body outlines dynamically.",
      "Mesh Optimization: Re-topologized meshes for production-ready model limits.",
      "Shader Nodes: Crafted procedural glowing shader networks in Blender Node Editor.",
      "Cycles Pipeline: Set up dynamic studio cameras and Cycles rendering pipelines."
    ],
    expertPillars: [
      { icon: "✨", title: "Emissive Shader Workflows", desc: "Programmed specialized pulsing emission nodes to illuminate baby visual elements organically." },
      { icon: "📐", title: "Model Optimization Scale", desc: "Designed stylized proportions while keeping polygon limits low for real-time engines." }
    ],
    expertMetrics: [
      { val: "Emission", lbl: "Shader Type" },
      { val: "Low-Poly", lbl: "Real-time Target" },
      { val: "Cycles", lbl: "Visual Pipeline" }
    ]
  },
  {
    id: "car-driving-race",
    category: "game-design",
    title: "Car Driving Race",
    subtitle: "WEB HTML GAME DEV",
    desc: "A pixelated 2.5D environment car game where players collect coins. Easy to control with arrow keys (Only on desktop mode).",
    longDesc: "Race through a pixelated 2.5D environment.|Collect coins while navigating a high-speed highway.|Easy control scheme using arrow keys, optimized specifically for desktop mode.",
    images: "public/game dev and design/car_drive_racing.webp",
    tags: ["HTML+CSS", "JavaScript", "Game Dev", "2.5D"],
    link: "https://car-game-html-css-js.vercel.app/",
    linkText: "Play Online",
    github: "https://github.com/Shoubhik95/Car-Game-HTML-CSS-JS",
    // HUD Stats
    engine: "HTML5 / JS",
    complexity: "68%",
    stage: "Playable Build",
    tools: "HTML5, CSS3, JavaScript",
    logEntries: [
      "Road Simulation: Designed pixelated 2.5D environment assets and road simulation graphics.",
      "Arrow Controls: Developed keyboard arrow control mapping for responsive car steering.",
      "Score Mechanics: Implemented coin spawning, score calculations, and collision mechanics.",
      "Vercel Deployment: Deployed project repository to GitHub and live build to Vercel."
    ],
    expertPillars: [
      { icon: "🏎️", title: "Lightweight Game Loop", desc: "Built dynamic animation framing loops managing velocity thresholds and coin collection triggers." },
      { icon: "⌨️", title: "Sleek Controller Listening", desc: "Programmed active keyboard arrow listeners to handle vehicle horizontal steering." }
    ],
    expertMetrics: [
      { val: "Vanilla JS", lbl: "Zero Framework Load" },
      { val: "Arrow keys", lbl: "Control Format" },
      { val: "Sleek CSS", lbl: "Layout Stack" }
    ]
  }
];

const webProjectsData = [
  {
    id: "littlebits",
    category: "web-projects",
    title: "LittleBits - College Club Hub",
    subtitle: "COLLEGE CLUB PORTAL",
    desc: "A digital campus hub to manage overcrowding, organize club events, facilitate student involvement, and streamline registration with easy-access entry passes.",
    longDesc: "Designed to handle campus event overcrowding and boost student engagement.|Allows coordinators to contact students, publish events, and track active communities.|Provides quick, easily accessible entry passes and simple event registration flows.",
    images: "public/image copy 3.webp",
    tags: ["HTML+CSS", "JavaScript", "College Club Hub", "Event Management"],
    link: "https://littlebitsclub.netlify.app/",
    linkText: "Visit Website",
    github: "https://github.com/amanrock1/LittleBits",
    // HUD Stats
    engine: "Web Browser",
    complexity: "92%",
    stage: "Live Production App",
    tools: "HTML5, CSS3, Vanilla JS, Netlify",
    logEntries: [
      "Collaborators: Co-created by Shoubhik Bhattacharya and Aman Kumar Prabhat.",
      "UI Dashboard: Designed dynamic grid-based community dashboard with modern gamified HUD theme.",
      "Access Portals: Developed secure authorization panel and coordinator contact portal.",
      "Tracker: Implemented live event seating tracker and dynamic entry pass generation.",
      "Deployments: Successfully integrated Git version control and hosted on Netlify."
    ],
    expertPillars: [
      { icon: "💼", title: "Complex Campus Telemetry", desc: "Built comprehensive hub components displaying club details, seating limits, and dynamic pass generation." },
      { icon: "⚡", title: "Responsive Grid Hierarchy", desc: "Designed layout templates using flexible CSS components to ensure readability across all devices." }
    ],
    expertMetrics: [
      { val: "Sub-1s Paint", lbl: "Performance Score" },
      { val: "Vanilla JS", lbl: "Scripting Core" },
      { val: "100% Flex", lbl: "Layout Architecture" }
    ]
  },
  {
    id: "virtual-tour",
    category: "web-projects",
    title: "Interactive 360 Virtual Tour",
    subtitle: "INTERACTIVE WEB",
    desc: "An immersive, web-based 360-degree virtual tour experience. Designed with interactivity in mind, allowing users to explore spaces seamlessly.",
    longDesc: "Built with modern web standards, featuring high-definition panoramic images.|Dynamic interactive hot-spots that show detailed popups and audio descriptions.|Responsive layout ensuring smooth navigation on both mobile and desktop screens.",
    images: "public/image copy.webp",
    tags: ["HTML+CSS", "360 Tour", "Interactive"],
    link: "https://360-virtual-campur-tour.vercel.app/",
    linkText: "Visit Website",
    // HUD Stats
    engine: "Web Browser (Pannellum)",
    complexity: "85%",
    stage: "Live Production App",
    tools: "HTML5, CSS3, Vanilla JS, Pannellum API",
    logEntries: [
      "Stitch Panoramas: Stitched panorama photo sets into projection maps.",
      "Semantic markup: Built semantic core web structure supporting desktop/mobile viewports.",
      "Coordinate Mapping: Coded click hotspot coordinates to load spatial context cards.",
      "Deployments: Hosted production builds via Netlify CI/CD pipeline integrations."
    ],
    expertPillars: [
      { icon: "🌐", title: "Pannellum Alignments", desc: "Structured seamless panoramic coordinate maps using the Pannellum API for full interactive views." },
      { icon: "📍", title: "Interactive Coordinates", desc: "Coded coordinate markers that prompt detailed popup context badges on cursor activation." }
    ],
    expertMetrics: [
      { val: "Pannellum", lbl: "API Platform" },
      { val: "Seamless", lbl: "Panoramic Stitch" },
      { val: "Adaptive", lbl: "Viewport Layout" }
    ]
  },
  {
    id: "tourism-project",
    category: "web-projects",
    title: "India Tourism Guider",
    subtitle: "TOURISM WEB APP",
    desc: "An interactive tourism guide web app showcasing beautiful destinations in India with a rich user interface.",
    longDesc: "A comprehensive guide designed to help travelers discover top locations, attractions, and cultural details.|Built using modern responsive design patterns and dynamic navigation.|Includes immersive galleries and curated travel information.",
    images: "public/tourism/tourism_0.webp,public/tourism/tourism_1.webp,public/tourism/tourism_2.webp,public/tourism/tourism_3.webp",
    tags: ["HTML+CSS", "JavaScript", "Responsive Design"],
    link: "https://ourchhattisgarhtourist.netlify.app/",
    linkText: "Visit Website",
    github: "https://github.com/Shoubhik95/Our-Chhattisgarh-tourist-website",
    // HUD Stats
    engine: "Web Browser",
    complexity: "80%",
    stage: "Live Production App",
    tools: "HTML5, CSS3, Vanilla JS",
    logEntries: [
      "Color Themes: Created responsive layout structures and color schemes for tourism assets.",
      "Search Engine: Implemented interactive navigation and destination search system.",
      "Transitions: Optimized image assets and UI transitions for smooth browsing.",
      "Deployments: Deployed to Netlify and performed cross-device testing."
    ],
    expertPillars: [
      { icon: "🕌", title: "Responsive Destination Grids", desc: "Developed intuitive filter-enabled menus matching user searches to locations." },
      { icon: "🖼️", title: "Media Optimization Layers", desc: "Optimized tourist location images and combined them with smooth styling states." }
    ],
    expertMetrics: [
      { val: "Sub-800ms", lbl: "Load Speed" },
      { val: "Mobile-First", lbl: "Layout Grid" },
      { val: "Zero Frame", lbl: "DOM Overhead" }
    ]
  },
  {
    id: "portfolio-project",
    category: "web-projects",
    title: "Gamer HUD Portfolio Website",
    subtitle: "PERSONAL PORTFOLIO",
    desc: "My personal portfolio website featuring a gamified HUD system, level progression, and 3D visual showcases.",
    longDesc: "Designed with a premium dark cyber-gamer theme, showcasing both game and web development work.|Includes real-time telemetry analytics, Firebase/LocalStorage integration for hiring profiles, and interactive 3D elements.|Features custom audio feedback on hover and click events.",
    images: "public/image.webp",
    tags: ["HTML+CSS", "JavaScript", "Gamified UI", "Firebase"],
    link: "./index.html",
    linkText: "Visit Portfolio",
    // HUD Stats
    engine: "Vanilla JS / Web",
    complexity: "95%",
    stage: "Live Portfolio",
    tools: "HTML5, CSS3, JS, Web Audio API, Firebase",
    logEntries: [
      "HUD Styling: Designed futuristic gamified HUD and theme variables.",
      "Sliders Layouts: Configured dynamic project cards and details modal with image sliders.",
      "Web Audio: Implemented custom Web Audio sound system and typing effect animations.",
      "Session Loggers: Integrated telemetry logger dashboard with real-time analytics tracking."
    ],
    expertPillars: [
      { icon: "🎮", title: "Interactive UI Modules", desc: "Constructed custom audio-feedback engines and gamified HUD grids for responsive player actions." },
      { icon: "⚙️", title: "Dynamic Local Analytics", desc: "Wrote lightweight local telemetry logging scripts that store viewer session parameters." }
    ],
    expertMetrics: [
      { val: "Web Audio", lbl: "Sound System" },
      { val: "Firebase", lbl: "Data Sync Score" },
      { val: "Vanilla", lbl: "Development Tech" }
    ]
  }
];

const certificatesData = [
  { src: "public/certificates/unity6_csharp_certificate.jpg", alt: "Complete C# Unity 3D Game Development in Unity 6" },
  { src: "public/certificates/unreal5_filmmaking_certificate.jpg", alt: "Master Filmmaking in Unreal Engine 5: A Complete Guide" },
  { src: "public/certificates/UC-67865291-b780-4726-a4e3-e0e2f13653da.jpg.webp", alt: "Unreal Engine 5 Modeling" },
  { src: "public/certificates/Screenshot_20260407_001427.jpg.webp", alt: "C++ Programming" },
  { src: "public/certificates/Screenshot_20260407_001439.jpg.webp", alt: "Python Essentials" },
  { src: "public/certificates/Coursera.webp", alt: "AR/VR/MR/XR" },
  { src: "public/certificates/vityarth-MVBr2jPIObAF.webp", alt: "Vityarthi Certification" }
];
