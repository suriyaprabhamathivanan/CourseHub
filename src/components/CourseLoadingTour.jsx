import React from 'react';
import { motion } from 'framer-motion';
import { Code, Terminal, Server, TrendingUp, CheckCircle, Clock } from 'lucide-react'; 

// Added props: courseQuery and duration
const CourseLoadingTour = ({ courseQuery, duration }) => { 
    const tourMessages = [
        "Connecting to Neural Network Core...",
        `Analyzing query: "${courseQuery}"...`, // Use query here
        "Compiling course architecture and dependencies...",
        `Allocating resources for a ${duration} curriculum...`, // Use duration here
        "Rendering visual learning path...",
        "System initialization complete. View your path."
    ];
    
    // Total duration of the animation for timing the progress bar/steps
    const ANIMATION_TOTAL_DURATION = 3; // Must match GENERATION_DELAY in Main.jsx

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: ANIMATION_TOTAL_DURATION / tourMessages.length,
                delayChildren: 0.2
            }
        },
        exit: { opacity: 0 }
    };

    const itemVariants = {
        hidden: { opacity: 0, x: -20 },
        visible: {
            opacity: 1,
            x: 0,
            transition: { type: "tween", duration: 0.2 }
        }
    };

    return (
        <motion.div
            className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[#060c14] p-8 text-white overflow-hidden"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
        >
            <motion.div
                className="relative w-full max-w-lg flex flex-col items-center justify-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
            >
                {/* Enhanced Graphics: Code Rain Effect */}
                <div className="absolute inset-0 overflow-hidden opacity-10 pointer-events-none">
                    {Array.from({ length: 50 }).map((_, i) => (
                        <motion.div
                            key={i}
                            className="absolute text-green-400 text-xs font-mono whitespace-nowrap"
                            initial={{ y: -50, x: `${Math.random() * 100}%` }}
                            animate={{ y: '100vh' }}
                            transition={{ 
                                duration: 5 + Math.random() * 5, 
                                repeat: Infinity, 
                                delay: Math.random() * 5 
                            }}
                        >
                            {/* Short strings simulating code/data packets */}
                            {i % 3 === 0 ? '<DATA_STREAM/>' : '011010'}
                        </motion.div>
                    ))}
                </div>

                {/* Main Icon (Pulsing Terminal) */}
                <motion.div
                    className="relative z-10 p-8 bg-white/10 rounded-full backdrop-blur-md border-4 border-sky-400 shadow-xl"
                    animate={{ 
                        scale: [1, 1.05, 1],
                        boxShadow: ["0 0 20px #00FFFF", "0 0 40px #00FFFF", "0 0 20px #00FFFF"], 
                    }}
                    transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                >
                    <Terminal size={72} className="text-sky-400" />
                </motion.div>

                <h2 className="mt-8 text-4xl font-extrabold bg-gradient-to-r from-sky-400 to-indigo-500 bg-clip-text text-transparent">
                    AI Course Generation
                </h2>
                
                {/* Displaying Query and Duration */}
                <motion.div 
                    initial={{ opacity: 0, y: 10 }} 
                    animate={{ opacity: 1, y: 0 }} 
                    transition={{ delay: 0.5 }}
                    className="mt-4 flex items-center gap-4 text-gray-300"
                >
                    <div className="flex items-center gap-2 bg-white/5 p-2 rounded-lg border border-sky-500/30">
                        <Code size={16} className="text-indigo-400" />
                        <span className="font-semibold">{courseQuery}</span>
                    </div>
                    <div className="flex items-center gap-2 bg-white/5 p-2 rounded-lg border border-sky-500/30">
                        <Clock size={16} className="text-indigo-400" />
                        <span className="font-semibold">{duration}</span>
                    </div>
                </motion.div>


                {/* Progress Bar and Messages */}
                <div className="w-full mt-12">
                    <motion.div
                        className="h-2 bg-white/10 rounded-full overflow-hidden"
                    >
                        <motion.div
                            className="h-full bg-gradient-to-r from-sky-500 to-indigo-600"
                            initial={{ width: '0%' }}
                            animate={{ width: '100%' }}
                            transition={{ duration: ANIMATION_TOTAL_DURATION, ease: 'linear' }}
                        />
                    </motion.div>
                </div>
                
                {/* Animated Tour Messages */}
                <motion.div
                    className="mt-6 w-full max-h-48"
                    variants={containerVariants}
                >
                    {tourMessages.map((msg, index) => (
                        <motion.p
                            key={index}
                            className="text-gray-300 text-sm font-code font-medium mb-1 flex items-center gap-2"
                            variants={itemVariants}
                            custom={index}
                        >
                            {index < tourMessages.length - 1 ? <TrendingUp size={14} className="text-indigo-400" /> : <CheckCircle size={14} className="text-green-400" />}
                            <span className="text-white/80">{msg}</span>
                        </motion.p>
                    ))}
                </motion.div>
            </motion.div>
        </motion.div>
    );
};

export default CourseLoadingTour;