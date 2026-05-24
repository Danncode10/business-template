export const siteConfig = {
  name: process.env.NEXT_PUBLIC_SITE_NAME || "Dann Digital",
  githubUrl: process.env.NEXT_PUBLIC_GITHUB_URL || "https://github.com/Danncode10",
  description: "Help small businesses go digital. Build beautiful websites, capture leads, manage teams.",
  url: process.env.NEXT_PUBLIC_SITE_URL || "https://danndigital.vercel.app",
  // Social proof metrics (configurable per client)
  socialProof: {
    rating: "4.9",
    ratingSource: "Google",
    customers: "500+",
    yearsInBusiness: "10",
  },
  // Contact info (configurable per client)
  contact: {
    email: "hello@example.com",
    phone: "(555) 123-4567",
    address: "123 Business Street, City, State 12345",
    // Google Maps embed URL — to customize:
    // 1. Go to https://www.google.com/maps
    // 2. Search for your business address
    // 3. Click "Share" → "Embed a map"
    // 4. Copy the src= URL value and paste here
    googleMapsEmbedUrl: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3024.1234567890!2d-74.0060!3d40.7128!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zNDDCsDQyJzQ2LjEiTiA3NMKwMDAnMjEuNiJX!5e0!3m2!1sen!2sus!4v1234567890",
  },
  // Social links
  socials: {
    twitter: "#",
    instagram: "#",
    linkedin: "#",
  },
} as const;

/**
 * ─────────────────────────────────────────────────────────────────
 *  CREATOR REPOS — Central source of truth for GitHub repo display
 * ─────────────────────────────────────────────────────────────────
 *  These are the repositories of the DannFlow creator (Danncode10).
 *  They appear in two places:
 *    1. Landing page → Features > GitHub MCP tab
 *    2. Dashboard → Version Control Context tab
 *
 *  ⚙️  WANT TO SHOW YOUR OWN REPOS?
 *  Replace the list below with your own projects.
 *  Prompt your coding AI with:
 *
 *    "Use the GitHub MCP to fetch all public repos for <your-github-username>,
 *     pick the 20 most interesting ones (with descriptions), and update the
 *     creatorRepos array in src/lib/config.ts. Each entry needs:
 *     { name, url, description }"
 *
 *  Then update NEXT_PUBLIC_GITHUB_URL in your .env.local to your own GitHub profile.
 * ─────────────────────────────────────────────────────────────────
 */
export const creatorRepos = [
  { name: "Arduino-PySide6-OpenCV", url: "https://github.com/Danncode10/Arduino-PySide6-OpenCV-Learning-Journey", description: "Gesture-controlled Arduino with Python GUI — combines OpenCV hand tracking, PySide6 UI, and real-world hardware control." },
  { name: "LifeEase", url: "https://github.com/Danncode10/LifeEase", description: "Minimalist productivity app with Task Manager, School Planner & Health Tracker — React Native frontend + FastAPI + SQLite." },
  { name: "Smart-Water-Dispenser", url: "https://github.com/Danncode10/Smart-Water-Dispenser-Arduino-Based-", description: "Arduino-powered auto-dispenser using ultrasonic sensor and servo motor — hands-free and IoT-ready for public use." },
  { name: "map-dashboard", url: "https://github.com/Danncode10/map-dashboard", description: "Map Visualization Dashboard showing environmental maps and conservation data with interactive layers." },
  { name: "my-structure (DannFlow)", url: "https://github.com/Danncode10/my-structure", description: "High-performance Next.js SaaS starter with Supabase, TanStack Query, rate limiting, and AI-native Vibe Coding workflow." },
  { name: "Speed-Analysis-Algorithms", url: "https://github.com/Danncode10/Speed-Analysis-of-Searching-Algorithms", description: "Benchmarks 10 search algorithms in Jupyter — ranks execution time on random datasets with visual performance charts." },
  { name: "Essential-Electrical-Robotics", url: "https://github.com/Danncode10/Essential-Electrical-Components-for-CS-Robotics", description: "Hands-on Arduino robotics course covering resistors, capacitors, relays, and power control for real-world sensors and motors." },
  { name: "Particle-Pressure-Simulator", url: "https://github.com/Danncode10/Particle-Pressure-Simulator-", description: "Physics simulation of particle pressure dynamics — real-time visual rendering of gas particle behavior." },
  { name: "Student-Login-PHP-MySQL", url: "https://github.com/Danncode10/Student-Login-Registration-System-with-PHP-and-MySQL", description: "Full-stack auth system with PHP, MySQL & Bootstrap — password hashing, session management, and protected routes." },
  { name: "Algorithms-Final-Project", url: "https://github.com/Danncode10/Algorithms-Final-Project", description: "Solves 6 algorithm challenges from the 100 Algorithms Challenge series — each in its own Jupyter notebook with test cases." },
  { name: "Scatter-Turtle", url: "https://github.com/Danncode10/Scatter-Turtle", description: "Bet-based turtle racing game built with Python Turtle Graphics — randomized outcomes with interactive betting UI." },
  { name: "Snake-Game", url: "https://github.com/Danncode10/Snake-Game", description: "Classic Snake game reimplemented in Python — keyboard-controlled with collision detection and score tracking." },
  { name: "Ping-Pong-Game", url: "https://github.com/Danncode10/Ping-Pong-Game-Using-Python-and-Turtle-Graphics", description: "Two-player Ping Pong built with Python Turtle Graphics — includes ball physics and live score display." },
  { name: "Turtle-Crossing-Game", url: "https://github.com/Danncode10/Turtle-Crossing-Game", description: "Frogger-style crossing game in Python Turtle — increasing difficulty levels with car collision logic." },
  { name: "Leetcode-Daily", url: "https://github.com/Danncode10/Leetcode-Daily", description: "Daily LeetCode solutions tracking data structures & algorithms mastery — annotated with approach notes for interview prep." },
  { name: "Python-DSA-Competition", url: "https://github.com/Danncode10/Python-DSA-Competition", description: "Competitive DSA solutions for internal competition — optimized Python implementations with time/space analysis." },
  { name: "Learn-PySide6-GUI", url: "https://github.com/Danncode10/Learn-PySide6-Python-GUI-", description: "Learning journey through PySide6 GUI development — covers widgets, layouts, signals, and event-driven programming." },
  { name: "Link-To-QR-Code", url: "https://github.com/Danncode10/Link-To-QR-Code-using-Python", description: "Python utility to convert any URL into a downloadable QR code image — minimal setup, instant output." },
  { name: "Coding-Habit-21-Days", url: "https://github.com/Danncode10/Coding-Habit", description: "21-day coding challenge journal documenting daily progress, lessons learned, and habit formation for a GE Entrep project." },
  { name: "Cpp-Projects", url: "https://github.com/Danncode10/Cpp-projects", description: "Collection of C++ problem sets and mini-projects covering OOP, data structures, and foundational systems programming." },
];
