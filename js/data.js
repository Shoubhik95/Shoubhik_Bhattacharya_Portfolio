const skillsData = [
  {
    name: "Unity",
    status: "Active",
    statusClass: "border-emerald-text",
    bulletClass: "emerald",
    style: {
      from: "rgba(16, 185, 129, 0.1)",
      to: "rgba(6, 78, 59, 0.3)",
      border: "rgba(16, 185, 129, 0.2)",
      text: "#6ee7b7"
    },
    subskills: ["C# Programming", "2.5D/3D Gameplay", "Level Prototyping"]
  },
  {
    name: "Unreal Engine 5",
    status: "Active",
    statusClass: "border-amber-text",
    bulletClass: "amber",
    style: {
      from: "rgba(245, 158, 11, 0.1)",
      to: "rgba(120, 53, 4, 0.3)",
      border: "rgba(245, 158, 11, 0.2)",
      text: "#fde047"
    },
    subskills: ["Blueprint Scripting", "Sequencer Cinematics", "Niagara VFX", "Metahuman"]
  },
  {
    name: "Environment Design",
    status: "Active",
    statusClass: "border-sky-text",
    bulletClass: "sky",
    style: {
      from: "rgba(14, 165, 233, 0.1)",
      to: "rgba(8, 47, 73, 0.3)",
      border: "rgba(14, 165, 233, 0.2)",
      text: "#7dd3fc"
    },
    subskills: ["High-Fidelity Worlds", "Atmospheric Lighting", "Material Shading"]
  },
  {
    name: "Animation & Cinematics",
    status: "Active",
    statusClass: "border-pink-text",
    bulletClass: "pink",
    style: {
      from: "rgba(236, 72, 153, 0.1)",
      to: "rgba(131, 24, 67, 0.3)",
      border: "rgba(236, 72, 153, 0.2)",
      text: "#fbcfe8"
    },
    subskills: ["Sequencer Camera Cuts", "MetaHuman Setup", "Timeline Keyframing"]
  },
  {
    name: "3D Modelling",
    status: "Active",
    statusClass: "border-indigo-text",
    bulletClass: "indigo",
    style: {
      from: "rgba(99, 102, 241, 0.1)",
      to: "rgba(49, 46, 129, 0.3)",
      border: "rgba(99, 102, 241, 0.2)",
      text: "#c7d2fe"
    },
    subskills: ["Stylized Low-Poly", "Asset Sculpting", "Blender Pipeline"]
  },
  {
    name: "VR/AR",
    status: "Active",
    statusClass: "border-teal-text",
    bulletClass: "teal",
    style: {
      from: "rgba(20, 184, 166, 0.1)",
      to: "rgba(19, 78, 74, 0.3)",
      border: "rgba(20, 184, 166, 0.2)",
      text: "#99f6e4"
    },
    subskills: ["Locomotion", "XR Interaction Toolkit", "Spatial UI/UX"]
  },
  {
    name: "Rigging",
    status: "Active",
    statusClass: "border-rose-text",
    bulletClass: "rose",
    style: {
      from: "rgba(244, 63, 94, 0.1)",
      to: "rgba(136, 19, 55, 0.3)",
      border: "rgba(244, 63, 94, 0.2)",
      text: "#fecdd3"
    },
    subskills: ["Skeletal Weighting", "IK/FK Controls", "Blendshapes"]
  },
  {
    name: "Python",
    status: "Active",
    statusClass: "border-yellow-text",
    bulletClass: "yellow",
    style: {
      from: "rgba(234, 179, 8, 0.1)",
      to: "rgba(113, 63, 4, 0.3)",
      border: "rgba(234, 179, 8, 0.2)",
      text: "#fef08a"
    },
    subskills: ["Pipeline Automation", "Utility Tools"]
  },
  {
    name: "C++",
    status: "Active",
    statusClass: "border-blue-text",
    bulletClass: "blue",
    style: {
      from: "rgba(59, 130, 246, 0.1)",
      to: "rgba(30, 58, 138, 0.3)",
      border: "rgba(59, 130, 246, 0.2)",
      text: "#bfdbfe"
    },
    subskills: ["OOP Fundamentals", "Unreal API Programming", "Data Structures"]
  },
  {
    name: "C#",
    status: "Active",
    statusClass: "border-violet-text",
    bulletClass: "violet",
    style: {
      from: "rgba(139, 92, 246, 0.1)",
      to: "rgba(76, 29, 149, 0.3)",
      border: "rgba(139, 92, 246, 0.2)",
      text: "#ddd6fe"
    },
    subskills: ["Unity API Scripting", "Design Patterns", "DotNet Architecture"]
  },
  {
    name: "HTML+CSS",
    status: "Active",
    statusClass: "border-orange-text",
    bulletClass: "orange",
    style: {
      from: "rgba(249, 115, 22, 0.1)",
      to: "rgba(124, 45, 18, 0.3)",
      border: "rgba(249, 115, 22, 0.2)",
      text: "#fed7aa"
    },
    subskills: ["Modern Layouts", "Aesthetic UI Design", "Responsive Sites"]
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
    images: "public/game dev and design/Game.png",
    tags: ["Unity", "Environment", "Storytelling", "C#", "Level Design"],
    link: "https://shoubhik-bhattacharya.itch.io/the-endless-survivor-god-of-the-forest",
    linkText: "Play Itch.io",
    // HUD Stats
    engine: "Unity",
    complexity: "85%",
    stage: "Playable Build",
    tools: "Unity 3D, C#, ProBuilder",
    logEntries: [
      "Initial level layout and environment block-out designed.",
      "Custom C# player controller and inventory scripting complete.",
      "Integrated 2D/3D dynamic lighting and dark ambient audio.",
      "Final game compilation and publishing live on Itch.io."
    ]
  },
  {
    id: "campus-tour",
    category: "game-design",
    title: "VR Campus Tour",
    subtitle: "VR/XR EXPERIENCE",
    desc: "An immersive VR campus tour developed in Unreal Engine, exploring university grounds with high-fidelity environments.",
    longDesc: "Explore the university campus in a fully immersive 3D virtual reality tour.|Developed with Unreal Engine 5 leveraging high-fidelity architectural models and realistic lighting.|Features interactive nodes, spatial audio, and smooth locomotion setups.",
    images: "public/game dev and design/vr_campus_tour.jpg",
    tags: ["Unreal Engine 5", "VR/AR", "3D Modeling", "Environment Design"],
    // HUD Stats
    engine: "Unreal Engine 5",
    complexity: "90%",
    stage: "VR Demonstration",
    tools: "UE5, VR Interaction Toolkit, Lumen",
    logEntries: [
      "Stitched campus blueprints into layout reference grids.",
      "High-poly mesh modeling of main buildings inside Blender.",
      "Configured Lumen lighting environment for outdoor and indoor consistency.",
      "Coded smooth teleport locomotion controls and interactive nodes."
    ]
  },
  {
    id: "axe-man",
    category: "game-art",
    title: "Axe Man",
    subtitle: "CREATED IN BLENDER",
    desc: "A stylized low-poly character model of a woodsman wielding a powerful hammer-axe. Designed, modeled, and textured entirely in Blender.",
    longDesc: "Hand-crafted 3D low-poly character detailing.|Features fully optimized geometry, clean UV unwrapping, and custom stylized hand-painted textures.|Rigged and prepared for animation pipelines in game engines.",
    images: "public/model and animation/axe man/axe_man_0.png,public/model and animation/axe man/axe_man_1.png,public/model and animation/axe man/axe_man_2.png,public/model and animation/axe man/axe_man_3.png",
    tags: ["Blender", "3D Modeling", "Stylized Art", "Rigging"],
    // HUD Stats
    engine: "Blender Pipeline",
    complexity: "75%",
    stage: "Complete Character Rig",
    tools: "Blender, Substance Painter",
    logEntries: [
      "Created character design sheets and reference alignment setups.",
      "Modeled low-poly meshes keeping clean edge loop topology.",
      "Unwrapped UV map projections and painted detailed color maps.",
      "Constructed complete armature bones with IK/FK constraints."
    ]
  },
  {
    id: "pichku",
    category: "game-art",
    title: "Pichku",
    subtitle: "CREATED IN BLENDER",
    desc: "A whimsical, stylized character model of Pichku. Designed, modeled, and rendered entirely in Blender.",
    longDesc: "Charming stylized character art featuring optimized game topology.|Meticulously unwrapped UV layout and hand-painted texturing mapping.|Rigged armature suitable for production game animation pipelines.",
    images: "public/pichku/pichku_3.png,public/pichku/pichku_0.png,public/pichku/pichku_1.png,public/pichku/pichku_2.png,public/pichku/pichku_4.png",
    tags: ["Blender", "3D Modeling", "Character Art", "Rendering"],
    // HUD Stats
    engine: "Blender Cycles",
    complexity: "85%",
    stage: "Finished Model & Textures",
    tools: "Blender, Substance Painter",
    logEntries: [
      "Sketched digital profile blueprints and reference setup grids.",
      "Sculpted clean stylized character mesh within Blender viewport.",
      "Generated detailed texture overlays inside Substance Painter.",
      "Assembled skeleton armature constraints and compiled final render shots."
    ]
  },
  {
    id: "cute-monster",
    category: "game-art",
    title: "Cute Monster",
    subtitle: "CREATED IN BLENDER",
    desc: "A whimsical, stylized character model of a cute monster with multi-angle renders and detailed textures.",
    longDesc: "High-fidelity 3D modeling and sculpting details in Blender.|Features expressive stylized elements, custom digital textures, and material shaders.|Ready for rig controls and animation cycles.",
    images: "public/model and animation/Monster/Untold Story(1).png,public/model and animation/Monster/Cute_monster.png,public/model and animation/Monster/Cute_monster2.png,public/model and animation/Monster/Cute_monster3.png,public/model and animation/Monster/Body.png",
    tags: ["Blender", "3D Modeling", "Character Art", "Texturing"],
    link: "https://gamedev_shoubhik2.artstation.com/projects/vbNrNx",
    linkText: "ArtStation",
    // HUD Stats
    engine: "Blender Cycles",
    complexity: "80%",
    stage: "Fully Textured Rig",
    tools: "Blender, Substance, Cycles",
    logEntries: [
      "Sculpted base mesh and refined anatomical details.",
      "Painted hand-crafted textures in Substance Painter.",
      "Rigged facial expressions and body mechanics.",
      "Rendered final beauty shots in Blender Cycles."
    ]
  },
  {
    id: "magic-baby",
    category: "game-art",
    title: "Magic Baby",
    subtitle: "CREATED IN BLENDER",
    desc: "A whimsical, stylized character model of a magic baby with expressive features. Sculpted, textured, and rendered entirely in Blender.",
    longDesc: "Expressive stylized character design with focus on clean topology and soft-edge shading.|Hand-painted procedural textures for a magical, cartoony glow.|Perfect fit for stylized RPGs or animated narratives.",
    images: "public/model and animation/Magic baby/magic_baby_1.png,public/model and animation/Magic baby/magic_baby_2.png,public/model and animation/Magic baby/magic_baby_3.png",
    tags: ["Blender", "Character Art", "Texturing", "Rendering"],
    // HUD Stats
    engine: "Blender Cycles",
    complexity: "70%",
    stage: "Rendered Model",
    tools: "Blender Sculpting, Cycles renderer",
    logEntries: [
      "Sculpted magic baby head and body outlines dynamically.",
      "Re-topologized meshes for production-ready model limits.",
      "Crafted procedural glowing shader networks in Blender Node Editor.",
      "Set up dynamic studio cameras and Cycles rendering pipelines."
    ]
  }
];

const webProjectsData = [
  {
    id: "virtual-tour",
    category: "web-projects",
    title: "Interactive 360 Virtual Tour",
    subtitle: "INTERACTIVE WEB",
    desc: "An immersive, web-based 360-degree virtual tour experience. Designed with interactivity in mind, allowing users to explore spaces seamlessly.",
    longDesc: "Built with modern web standards, featuring high-definition panoramic images.|Dynamic interactive hot-spots that show detailed popups and audio descriptions.|Responsive layout ensuring smooth navigation on both mobile and desktop screens.",
    images: "public/web-project-screenshot.jpg",
    tags: ["HTML+CSS", "360 Tour", "Interactive"],
    link: "https://interactive-360-virtual-tour.netlify.app/",
    video: "public/virtual-tour-recording.mp4",
    linkText: "Visit Website",
    // HUD Stats
    engine: "Web Browser (Pannellum)",
    complexity: "85%",
    stage: "Live Production App",
    tools: "HTML5, CSS3, Vanilla JS, Pannellum API",
    logEntries: [
      "Stitched panorama photo sets into projection maps.",
      "Built semantic core web structure supporting desktop/mobile viewports.",
      "Coded click hotspot coordinates to load spatial context cards.",
      "Hosted production builds via Netlify CI/CD pipeline integrations."
    ]
  },
  {
    id: "tourism-project",
    category: "web-projects",
    title: "India Tourism Guider",
    subtitle: "TOURISM WEB APP",
    desc: "An interactive tourism guide web app showcasing beautiful destinations in India with a rich user interface.",
    longDesc: "A comprehensive guide designed to help travelers discover top locations, attractions, and cultural details.|Built using modern responsive design patterns and dynamic navigation.|Includes immersive galleries and curated travel information.",
    images: "public/tourism/tourism_0.png,public/tourism/tourism_1.png,public/tourism/tourism_2.png,public/tourism/tourism_3.png",
    tags: ["HTML+CSS", "JavaScript", "Responsive Design"],
    link: "https://ourchhattisgarhtourist.netlify.app/",
    linkText: "Visit Website",
    // HUD Stats
    engine: "Web Browser",
    complexity: "80%",
    stage: "Live Production App",
    tools: "HTML5, CSS3, Vanilla JS",
    logEntries: [
      "Created responsive layout structures and color schemes for tourism assets.",
      "Implemented interactive navigation and destination search system.",
      "Optimized image assets and UI transitions for smooth browsing.",
      "Deployed to Netlify and performed cross-device testing."
    ]
  },
  {
    id: "portfolio-project",
    category: "web-projects",
    title: "Gamer HUD Portfolio Website",
    subtitle: "PERSONAL PORTFOLIO",
    desc: "My personal portfolio website featuring a gamified HUD system, level progression, and 3D visual showcases.",
    longDesc: "Designed with a premium dark cyber-gamer theme, showcasing both game and web development work.|Includes real-time telemetry analytics, Firebase/LocalStorage integration for hiring profiles, and interactive 3D elements.|Features custom audio feedback on hover and click events.",
    images: "public/image.png",
    tags: ["HTML+CSS", "JavaScript", "Gamified UI", "Firebase"],
    link: "./index.html",
    linkText: "Visit Portfolio",
    // HUD Stats
    engine: "Vanilla JS / Web",
    complexity: "95%",
    stage: "Live Portfolio",
    tools: "HTML5, CSS3, JS, Web Audio API, Firebase",
    logEntries: [
      "Designed futuristic gamified HUD and theme variables.",
      "Configured dynamic project cards and details modal with image sliders.",
      "Implemented custom Web Audio sound system and typing effect animations.",
      "Integrated telemetry logger dashboard with real-time analytics tracking."
    ]
  }
];

const certificatesData = [
  { src: "public/certificates/UC-67865291-b780-4726-a4e3-e0e2f13653da.jpg.jpeg", alt: "Unreal Engine 5 Modeling" },
  { src: "public/certificates/Screenshot_20260407_001427.jpg.jpeg", alt: "C++ Programming" },
  { src: "public/certificates/Screenshot_20260407_001439.jpg.jpeg", alt: "Python Essentials" },
  { src: "public/certificates/Coursera.jpg", alt: "AR/VR/MR/XR" },
  { src: "public/certificates/vityarth-MVBr2jPIObAF.png", alt: "Vityarthi Certification" }
];
