import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, LogOut, BookOpen, X, Trash2, Bookmark, BookmarkCheck, XCircle } from "lucide-react"; 
import CourseCard from "../components/CourseCard"; 
import CourseLoadingTour from "../components/CourseLoadingTour"; 

const HISTORY_LIMIT = 30;
const GENERATION_DELAY = 3000; // 3 seconds delay for the tour

// --- Mock Course Data (The old JSON is replaced with a single template for demo) ---
// In a real app, this mockCompletion would be the raw text response from an API
const mockCompletionTemplate = (topic) => `Course: ${topic} Masterclass
Duration: 8 weeks
Modules:
- Week 1: Introduction to ${topic} Basics
- Week 2: Core Concepts & Syntax
- Week 3: Advanced Techniques & Libraries
- Week 4: DOM Manipulation/Data Handling
- Week 5: Responsive Design/Project Setup
- Week 6: APIs & External Services
- Week 7: Mini Project & Debugging
- Week 8: Final Capstone & Review`;

// Helper function to parse the raw text output into a structured format (as requested)
const parseCourseDetails = (prompt, completionString) => {
    const lines = completionString.split('\n');
    let title = prompt;
    let duration = "8 weeks"; // Default
    const levels = [];
    let isModules = false;

    lines.forEach(line => {
        if (line.startsWith('Course:')) {
            title = line.replace('Course:', '').trim();
        } else if (line.startsWith('Duration:')) {
            duration = line.replace('Duration:', '').trim();
        } else if (line.startsWith('Modules:')) {
            isModules = true;
        } else if (isModules && line.startsWith('-')) {
            const match = line.match(/- (Week \d+): (.+)/);
            if (match) {
                const [, week, moduleTitle] = match;
                
                // 🛑 FIX APPLIED HERE: REMOVE ALL HARDCODED STATUS ASSIGNMENTS.
                // By removing the 'status' key when parsing, we force CourseCard to 
                // check local storage OR default to a fresh start (Module 1 current).
                
                levels.push({
                    id: levels.length + 1, // Use new index as ID
                    title: moduleTitle.trim(),
                    description: week, // Using week for context in the level map card
                    // status is deliberately OMITTED now
                });
            }
        }
    });

    return { title, duration, levels };
};
// ----------------------------------------------------------------------------------

const Main = () => {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(null);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [query, setQuery] = useState("");
  const [error, setError] = useState("");
  const [toast, setToast] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showCourseMap, setShowCourseMap] = useState(false); 
  
  // 🎯 Add the user's ID here for easy access
  const activeUserId = currentUser?.id || null;

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("currentUser"));
    if (!user) navigate("/login");
    if (user && !user.savedCourses) {
        user.savedCourses = [];
        updateUserInLocalStorage(user);
    }
    setCurrentUser(user);
  }, [navigate]);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(""), 2400);
    return () => clearTimeout(t);
  }, [toast]);

  const updateUserInLocalStorage = (updatedUser) => {
    let users = JSON.parse(localStorage.getItem("users")) || [];
    const updatedUsers = users.map(u => u.id === updatedUser.id ? updatedUser : u);
    localStorage.setItem("users", JSON.stringify(updatedUsers));
    localStorage.setItem("currentUser", JSON.stringify(updatedUser));
    setCurrentUser(updatedUser);
  }

  const normalize = (s = "") => s.trim().toLowerCase();

  const handleSearch = () => {
    if (!query.trim()) {
      setError("Please enter a course topic before generating.");
      return;
    }
    setError("");
    
    // Create an immediate course object (without final structure) to pass to the tour
    const initialCourse = {
        prompt: query.trim(),
        courseId: query.trim().replace(/\s/g, '-') + Date.now(),
        structure: { title: query.trim(), duration: "8 weeks", levels: [] } 
    };
    setSelectedCourse(initialCourse);
    
    setIsLoading(true); // START THE TOUR/LOADING
    setShowCourseMap(false); // Ensure map is hidden before generation

    // Simulate course generation with a delay
    setTimeout(() => {
      
      const mockCompletion = mockCompletionTemplate(query.trim());
      // 🎯 parseCourseDetails no longer adds a status, fixing the overwrite issue
      const { title, duration, levels } = parseCourseDetails(query.trim(), mockCompletion);

      const finalResult = {
          prompt: query.trim(),
          courseId: initialCourse.courseId,
          structure: { title, duration, levels }
      };

      setSelectedCourse(finalResult);

      if (currentUser) {
        let existingCourses = currentUser.courses || [];
        const normFinal = normalize(finalResult.prompt);
        const existsIndex = existingCourses.findIndex(
            (c) => normalize(c.prompt) === normFinal
        );

        let newCourses;
        if (existsIndex !== -1) {
          // If it exists, move it to the top
          newCourses = [existingCourses[existsIndex], ...existingCourses.slice(0, existsIndex), ...existingCourses.slice(existsIndex + 1)];
          setToast("Course moved to top of history.");
        } else {
          // If new, add to the top
          newCourses = [finalResult, ...existingCourses];
          setToast("Course added to your generated history.");
        }

        if (newCourses.length > HISTORY_LIMIT)
          newCourses = newCourses.slice(0, HISTORY_LIMIT);

        const updatedUser = { ...currentUser, courses: newCourses };
        updateUserInLocalStorage(updatedUser);
      }

      setIsLoading(false); // END THE TOUR/LOADING
      setShowCourseMap(true); // SHOW THE FULL-SCREEN MAP
    }, GENERATION_DELAY);
  };
  
  const handleLogout = () => {
    localStorage.removeItem("currentUser");
    navigate("/login");
  };
  
  const handleClearHistory = () => {
    if (!currentUser || currentUser.courses.length === 0) return;
    const updatedUser = { ...currentUser, courses: [] };
    updateUserInLocalStorage(updatedUser);
    setSelectedCourse(null); 
    setShowCourseMap(false);
    setToast("Your generated course history has been cleared.");
  };

  const isCourseSaved = selectedCourse ? (currentUser?.savedCourses || []).some(c => c.courseId === selectedCourse.courseId) : false;

  const handleToggleSave = () => {
    if (!selectedCourse || !currentUser) return;
    
    let savedCourses = currentUser.savedCourses || [];
    const existingIndex = savedCourses.findIndex(c => c.courseId === selectedCourse.courseId);

    let updatedSavedCourses;
    let newToast;

    if (existingIndex !== -1) {
        updatedSavedCourses = savedCourses.filter(c => c.courseId !== selectedCourse.courseId);
        newToast = "Course removed from your saved list.";
    } else {
        updatedSavedCourses = [selectedCourse, ...savedCourses];
        newToast = "Course saved successfully!";
    }

    const updatedUser = { ...currentUser, savedCourses: updatedSavedCourses };
    updateUserInLocalStorage(updatedUser);
    setToast(newToast);
  }

  const handleRemoveSaved = (courseId) => {
    if (!currentUser) return;

    let savedCourses = currentUser.savedCourses || [];
    const updatedSavedCourses = savedCourses.filter(c => c.courseId !== courseId);
    
    const updatedUser = { ...currentUser, savedCourses: updatedSavedCourses };
    updateUserInLocalStorage(updatedUser);
    setToast("Course removed from saved list.");
  }
  
  const handleSelectCourse = (course) => {
      setSelectedCourse(course);
      setSidebarOpen(false);
      setShowCourseMap(true); // Show map when selecting from sidebar
  }

  // --- START OF LAYOUT ---
  return (
    <div className="min-h-screen flex flex-col bg-[#060c14] text-white">
      
      {/* 1. Loading Tour Component (Full Screen) */}
      <AnimatePresence>
        {isLoading && (
            <CourseLoadingTour 
                // Pass the query and initial duration to be displayed in the animation
                courseQuery={selectedCourse?.prompt || query}
                duration={selectedCourse?.structure?.duration || "8 weeks"} 
            />
        )}
      </AnimatePresence>
      
      {/* 2. Full-Screen Course Map View */}
      <AnimatePresence>
        {showCourseMap && selectedCourse && (
            <motion.div
                key="course-map-view"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-30 bg-[#060c14] p-4 sm:p-8 overflow-y-auto"
            >
                <div className="max-w-7xl mx-auto">
                    {/* Header for the Map View */}
                    <div className="flex justify-between items-center mb-6 pt-4">
                        <h1 className="text-3xl font-extrabold bg-gradient-to-r from-sky-400 to-indigo-500 bg-clip-text text-transparent">
                            {selectedCourse.structure?.title || "Generated Course Map"}
                        </h1>
                        <div className="flex items-center space-x-4">
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.97 }}
                                onClick={handleToggleSave}
                                className={`px-4 py-2 rounded-full text-sm font-semibold transition shadow-lg flex items-center gap-2 ${
                                    isCourseSaved 
                                        ? 'bg-sky-500 text-white' 
                                        : 'bg-white/10 text-sky-400 border border-sky-400/50 hover:bg-white/20'
                                }`}
                            >
                                {isCourseSaved ? <BookmarkCheck size={18} /> : <Bookmark size={18} />}
                                {isCourseSaved ? 'Saved' : 'Save Course'}
                            </motion.button>
                            <button 
                                onClick={() => setShowCourseMap(false)} 
                                className="p-2 text-white/70 hover:text-white transition rounded-full bg-white/5"
                                title="Close Course Map"
                            >
                                <X size={24} />
                            </button>
                        </div>
                    </div>
                    
                    {/* CourseCard now receives the userId */}
                    <CourseCard course={selectedCourse} userId={activeUserId} />
                </div>
            </motion.div>
        )}
      </AnimatePresence>


      {/* 3. Hamburger Menu Button (Disabled during loading) */}
      <button
        className="fixed top-4 left-4 z-50 flex items-center justify-center w-10 h-10 p-1 bg-gradient-to-r from-sky-500 to-indigo-600 rounded-full shadow-lg"
        onClick={() => setSidebarOpen(true)}
        disabled={isLoading || showCourseMap} 
      >
        <Menu className="w-6 h-6" />
      </button>

      {/* 4. Slide-In Sidebar Overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSidebarOpen(false)} className="fixed inset-0 bg-black/50 z-40" />
            <motion.aside
              initial={{ x: -300 }} animate={{ x: 0 }} exit={{ x: -300 }} transition={{ duration: 0.3 }}
              className="fixed top-0 left-0 bottom-0 w-72 bg-white/10 backdrop-blur-md border-r border-white/20 p-6 flex flex-col gap-6 z-50"
            >
                <div className="flex justify-between items-center mb-4">
                    <h1 className="text-2xl font-extrabold bg-gradient-to-r from-sky-400 to-indigo-500 bg-clip-text text-transparent">COURSEHUB</h1>
                    <button onClick={() => setSidebarOpen(false)} className="text-white hover:text-gray-300"><X size={24} /></button>
                </div>
                {currentUser && (
                  <div className="flex flex-col gap-3 bg-white/5 border border-white/10 rounded-xl p-4 shadow-lg">
                    <h2 className="text-lg font-semibold">{currentUser.name} 🎓</h2>
                    <p className="text-gray-400 text-sm">Courses Generated: <span className="text-sky-400 font-semibold">{currentUser.courses?.length || 0}</span></p>
                    <p className="text-gray-400 text-sm">Courses Saved: <span className="text-sky-400 font-semibold">{currentUser.savedCourses?.length || 0}</span></p>
                    {currentUser.courses?.length > 0 && (<button onClick={handleClearHistory} className="mt-2 flex items-center gap-2 bg-red-600/30 hover:bg-red-600/50 px-3 py-2 rounded-lg font-semibold transition text-sm text-red-300"><Trash2 size={16} /> Clear History</button>)}
                    <button onClick={handleLogout} className="mt-2 flex items-center gap-2 bg-indigo-600/30 hover:bg-indigo-600/50 px-3 py-2 rounded-lg font-semibold transition text-sm"><LogOut size={16} /> Logout</button>
                  </div>
                )}
                {currentUser && currentUser.savedCourses?.length > 0 && (
                  <div className="flex-1 flex flex-col gap-2 overflow-y-auto">
                    <h3 className="text-gray-300 font-semibold mb-2 border-b border-sky-400/20 pb-2"><BookmarkCheck size={16} className="inline mr-1 text-sky-400" /> Saved Courses</h3>
                    {currentUser.savedCourses.map((course) => (
                        <motion.div key={course.courseId} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.05 }} 
                            className="bg-white/5 hover:bg-white/10 cursor-pointer rounded-lg p-3 text-sm text-gray-200 truncate flex justify-between items-center"
                        >
                          <span className="truncate" onClick={() => handleSelectCourse(course)}>{course.prompt}</span>
                          <button onClick={(e) => { e.stopPropagation(); handleRemoveSaved(course.courseId); }} className="text-red-400 hover:text-red-300 p-1 rounded-full ml-2" title="Remove saved course">
                              <XCircle size={16} />
                          </button>
                        </motion.div>
                    ))}
                  </div>
                )}
                {currentUser && currentUser.courses?.length > 0 && (
                  <div className="flex-1 flex flex-col gap-2 overflow-y-auto mt-4">
                    <h3 className="text-gray-300 font-semibold mb-2 border-b border-white/10 pb-2">Your History</h3>
                    {currentUser.courses.slice(0, HISTORY_LIMIT).map((course, idx) => (
                        <motion.div key={course.courseId || idx} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: idx * 0.05 }} 
                            className="bg-white/5 hover:bg-white/10 cursor-pointer rounded-lg p-3 text-sm text-gray-200 truncate"
                            onClick={() => handleSelectCourse(course)}
                        >
                          {course.prompt}
                        </motion.div>
                    ))}
                  </div>
                )}
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* 5. Main Content Area (Hidden if map is showing) */}
      {!showCourseMap && (
        <main className="flex-1 flex flex-col items-center justify-start px-8 py-10 pt-20 relative">
          <h1 className="text-5xl font-extrabold text-white mb-8 text-center">AI Course Generator</h1>
          {/* Search */}
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="w-full max-w-2xl bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl shadow-xl p-6 mb-6"
          >
            <div className="flex flex-col sm:flex-row gap-4">
              <input
                type="text"
                placeholder="Enter a course topic (e.g., Web Development)"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="flex-1 px-4 py-3 rounded-xl text-white bg-white/5 placeholder-gray-400 border border-white/10 focus:outline-none focus:ring-2 focus:ring-sky-500 transition"
                disabled={isLoading}
              />
              <motion.button
                whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }}
                onClick={handleSearch}
                className="bg-gradient-to-r from-sky-500 to-indigo-600 px-6 py-3 rounded-xl font-semibold flex items-center justify-center gap-2 shadow-lg"
                disabled={isLoading}
              >
                <BookOpen size={18} />
                {isLoading ? 'Generating...' : 'Generate'}
              </motion.button>
            </div>
            {error && <p className="text-red-400 text-sm mt-3">{error}</p>}
          </motion.div>

        </main>
      )}

      {/* 6. Toast */}
      <div className="fixed bottom-6 right-6 z-50">
        <AnimatePresence>
          {toast && (
            <motion.div
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }}
              className="bg-gradient-to-r from-sky-500 to-indigo-600 text-white px-4 py-2 rounded-lg shadow-lg"
            >
              {toast}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Main;