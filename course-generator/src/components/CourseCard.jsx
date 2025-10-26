import React, { useState, useEffect } from "react";
import {
  Lock,
  CheckCircle,
  Zap,
  Code,
  Server,
} from "lucide-react";
import { motion } from "framer-motion";

// Define a unique key prefix for local storage
const STORAGE_KEY_PREFIX = 'courseProgress_'; 

// 🎯 FIX: The component now accepts a 'userId' prop
const CourseCard = ({ course, userId }) => {
  // Ensure the course and its structure are valid before proceeding
  const courseId = course && course.id ? course.id : 'default-course';
  const activeUserId = userId ? userId : 'anonymous'; // Get the active user ID
  
  // Create a combined storage key for unique user progress per course
  const storageKey = `${STORAGE_KEY_PREFIX}${activeUserId}_${courseId}`;

  const hasValidStructure = course && course.structure && course.structure.levels;

  // ==========================================================
  // 1. STATE INITIALIZATION (Load from Local Storage) - IMPROVED
  // ==========================================================
  const [moduleLevels, setModuleLevels] = useState(() => {
    if (!hasValidStructure) {
        return [];
    }
    
    // --- Attempt to load saved progress specific to this user/course ---
    const savedProgress = localStorage.getItem(storageKey);
    if (savedProgress) {
        try {
            const parsedProgress = JSON.parse(savedProgress);
            
            // CRITICAL CHECK: Ensure the loaded data matches the current module count.
            if (parsedProgress.length === course.structure.levels.length) {
                // If counts match, USE THE SAVED PROGRESS. This prevents initial mock status from taking over.
                return parsedProgress;
            }
            // If counts do not match, fall through to re-initialize below.
            
        } catch (e) {
            console.error("Could not parse saved course progress:", e);
        }
    }
    
    // --- Fallback: Initialize fresh levels based on the course prop ---
    // Use the status that came from the Main.jsx mock data if available, otherwise default.
    return course.structure.levels.map((level, index) => ({
      ...level,
      // If the level object already contains a 'status' property (from the mock data), use it.
      // Otherwise, default to 'current' for the first module and 'locked' for the rest.
      status: level.status || (index === 0 ? 'current' : 'locked'), 
    }));
  });

  // ==========================================================
  // 2. EFFECT: SAVE STATE TO LOCAL STORAGE (on update)
  // ==========================================================
  useEffect(() => {
    // Only save if the state is initialized and we have a specific user/course key
    if (moduleLevels.length > 0 && activeUserId !== 'anonymous' && courseId !== 'default-course') {
        localStorage.setItem(storageKey, JSON.stringify(moduleLevels));
    }
    
    // Dependencies: moduleLevels (when progress changes) and the storageKey (if user/course switches)
  }, [moduleLevels, storageKey, activeUserId, courseId]); 
  
  // ==========================================================
  // 3. EFFECT: HANDLE EXTERNAL COURSE PROP CHANGES
  // ==========================================================
  useEffect(() => {
    if (hasValidStructure) {
        // If the structure changed (e.g., a new module was added), re-initialize.
        if (course.structure.levels.length !== moduleLevels.length) {
            // This will overwrite old state and trigger the save effect above.
            setModuleLevels(
                course.structure.levels.map((level, index) => ({
                    ...level,
                    status: level.status || (index === 0 ? 'current' : 'locked'),
                }))
            );
        }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [course.structure.levels, courseId, activeUserId]); 

  // ==========================================================
  // 🛑 Early Return
  // ==========================================================
  if (!hasValidStructure || moduleLevels.length === 0) {
    return (
      <div className="min-h-[800px] flex items-center justify-center bg-white/5 border border-white/10 p-6 rounded-2xl shadow-2xl text-gray-400">
        <p>Course structure is not available in the expected format.</p>
      </div>
    );
  }

  // ==========================================================
  // ⚙️ Component Logic (Visual/Interaction)
  // ==========================================================

  const getLevelStatus = (status) => {
    switch (status) {
      case "completed":
        return {
          icon: CheckCircle,
          color: "text-green-400",
          bg: "bg-green-600/20",
          border: "border-green-500",
          shadow: "shadow-green-500/30",
        };
      case "current":
        return {
          icon: Zap,
          color: "text-sky-400",
          bg: "bg-sky-600/20",
          border: "border-sky-500",
          shadow: "shadow-sky-500/50",
        };
      default: // 'locked'
        return {
          icon: Lock,
          color: "text-gray-500",
          bg: "bg-white/5",
          border: "border-gray-700",
          shadow: "shadow-gray-700/20",
        };
    }
  };

  const nodeVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: { type: "spring", stiffness: 100, damping: 10 },
    },
  };

  const robotVariants = {
    idle: {
      y: [0, -3, 0],
      transition: { duration: 1, repeat: Infinity, ease: "easeInOut" },
    },
  };

  const nodePositions = [
    { x: 10, y: 10 }, { x: 35, y: 25 }, { x: 15, y: 45 }, { x: 40, y: 60 }, 
    { x: 20, y: 80 }, { x: 50, y: 90 }, // Module 6 is at 90% height
    { x: 75, y: 75 }, { x: 60, y: 40 },
  ];

  const currentLevelIndex = moduleLevels.findIndex((l) => l.status === "current");
  const robotInitialPos = nodePositions[0]; 
  const robotTargetPos = nodePositions[currentLevelIndex !== -1 ? currentLevelIndex : 0];

  const getSvgPath = () => {
    if (nodePositions.length === 0) return "";
    let pathData = `M ${nodePositions[0].x} ${nodePositions[0].y}`;
    for (let i = 1; i < nodePositions.length; i++) {
      pathData += ` L ${nodePositions[i].x} ${nodePositions[i].y}`;
    }
    return pathData;
  };

  const svgPathD = getSvgPath();

  const handleCompleteModule = (indexToComplete) => {
    setModuleLevels((prevLevels) => {
      const newLevels = [...prevLevels];
      
      if (newLevels[indexToComplete]) {
        newLevels[indexToComplete].status = 'completed';
      }

      const nextIndex = indexToComplete + 1;
      if (nextIndex < newLevels.length && newLevels[nextIndex].status === 'locked') {
        newLevels[nextIndex].status = 'current';
      }
      return newLevels;
    });
  };

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      className="relative bg-[#0c131e] border border-white/10 p-6 rounded-2xl shadow-2xl min-h-[160vh] flex flex-col overflow-hidden"
    >
      <div
        className="absolute inset-0 z-0 opacity-10"
        style={{
          background:
            "repeating-linear-gradient(45deg, rgba(255,255,255,0.04) 0px, rgba(255,255,255,0.04) 1px, transparent 1px, transparent 10px)",
          backgroundSize: "40px 40px",
        }}
      ></div>

      <h2 className="relative z-10 text-3xl font-bold bg-gradient-to-r from-sky-400 to-indigo-500 bg-clip-text text-transparent mb-4">
        {course.structure.title || "Generated Learning Path"}
      </h2>
      <p className="relative z-10 text-gray-400 mb-6">
        Duration: {course.structure.duration || "N/A"}
      </p>

      <div
        className="relative flex-grow w-full h-full z-10"
        style={{ minHeight: "160vh" }} 
      >
        <motion.svg
          className="absolute inset-0 w-full h-full"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
        >
          <motion.path
            d={svgPathD}
            fill="none"
            stroke="url(#pathGradient)"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            variants={{
              hidden: { pathLength: 0 },
              visible: { pathLength: 1, transition: { duration: 2, ease: "easeInOut" } },
            }}
          />
          <defs>
            <linearGradient id="pathGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#00FFFF" />
              <stop offset="50%" stopColor="#8A2BE2" />
              <stop offset="100%" stopColor="#00FFFF" />
            </linearGradient>
          </defs>
        </motion.svg>

        {currentLevelIndex !== -1 && (
          <motion.div
            className="absolute z-40 transform -translate-x-1/2 -translate-y-1/2 w-16 h-16 flex items-center justify-center pointer-events-none"
            initial={{ left: `${robotInitialPos.x}%`, top: `${robotInitialPos.y}%` }}
            animate={{ left: `${robotTargetPos.x}%`, top: `${robotTargetPos.y}%` }}
            transition={{ duration: 1, type: "spring", stiffness: 50 }}
          >
            <motion.div
              className="w-10 h-10 rounded-full bg-indigo-500 border-2 border-white flex items-center justify-center shadow-lg"
              variants={robotVariants}
              animate="idle"
            >
              <Server size={24} className="text-white" />
            </motion.div>
            <div className="absolute -bottom-2 w-12 h-4 bg-gray-700/50 rounded-full blur-sm"></div>
          </motion.div>
        )}

        {moduleLevels.map((level, index) => {
          const status = getLevelStatus(level.status);
          const Icon = status.icon;
          const isCompleted = level.status === "completed";
          const isLocked = level.status === "locked";
          const pos = nodePositions[index];

          return (
            <motion.div
              key={level.id}
              variants={nodeVariants}
              custom={index}
              className="absolute w-60 p-4 rounded-xl transition-all duration-300 cursor-pointer z-30 flex items-center justify-center"
              style={{ left: `${pos.x}%`, top: `${pos.y}%`, transform: 'translate(-50%, -50%)' }}
              whileHover={!isLocked ? { scale: 1.05, boxShadow: `0 0 15px ${status.color.replace('text-', '')}B0` } : {}}
            >
              <div
                className={`p-4 rounded-xl shadow-xl ${status.bg} border ${status.border}/70 ${status.shadow} w-full`}
              >
                <div className="flex items-center justify-between gap-3 mb-2">
                  <h3 className="text-sm font-semibold text-white">
                    Module {level.id} ({level.description})
                  </h3>
                  <Icon size={20} className={status.color} />
                </div>
                <p className="text-lg font-bold text-white mb-1">
                  {level.title}
                </p>

                <div className="mt-3 flex items-center justify-end">
                  <label htmlFor={`complete-${level.id}`} className="flex items-center cursor-pointer text-gray-400 text-sm">
                    <input
                      type="checkbox"
                      id={`complete-${level.id}`}
                      className="form-checkbox h-4 w-4 text-sky-600 rounded-sm focus:ring-sky-500 mr-2 bg-gray-700 border-gray-600"
                      checked={isCompleted}
                      disabled={isLocked || isCompleted}
                      onChange={() => handleCompleteModule(index)}
                    />
                    {isCompleted ? "Completed" : (isLocked ? "Locked" : "Mark Complete")}
                  </label>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
};

export default CourseCard;