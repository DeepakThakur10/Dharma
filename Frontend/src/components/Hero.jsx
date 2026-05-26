import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

/** @type {any} */
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2
    }
  }
};

/** @type {any} */
const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: /** @type {any} */ ({ duration: 0.5, ease: [0.22, 1, 0.36, 1] })
  }
};

function Hero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-white via-orange-50 to-coral-50 pt-20 pb-32">
      {/* Decorative background elements */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 0.05, scale: 1 }}
        transition={{ duration: 1.5 }}
        className="absolute top-0 right-0 w-96 h-96 bg-[#ff6b35] rounded-full blur-3xl"
      ></motion.div>
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 0.05, scale: 1 }}
        transition={{ duration: 1.5, delay: 0.5 }}
        className="absolute bottom-0 left-0 w-96 h-96 bg-[#ffa07a] rounded-full blur-3xl"
      ></motion.div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="text-center max-w-4xl mx-auto"
        >
          {/* Badge */}
          <motion.div variants={itemVariants} className="inline-flex items-center space-x-2 bg-orange-100 text-[#ff6b35] px-4 py-2 rounded-full text-sm font-semibold mb-8">
            <span className="w-2 h-2 bg-[#ff6b35] rounded-full animate-pulse"></span>
            <span>Trusted by 0 teams worldwide</span>
          </motion.div>

          {/* Main Headline */}
          <motion.h1 variants={itemVariants} className="text-5xl sm:text-6xl lg:text-7xl font-bold text-gray-900 mb-6 leading-tight">
            Manage Projects.
            <br />
            <span className="text-gradient">Collaborate Better.</span>
            <br />
            Deliver Faster.
          </motion.h1>

          {/* Subheading */}
          <motion.p variants={itemVariants} className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto leading-relaxed">
            The all-in-one project management platform that brings your team together.
            Plan, track, and collaborate on any project with ease.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link
              to="/register"
              className="px-8 py-4 gradient-primary text-white rounded-lg font-semibold text-lg hover:shadow-2xl hover:scale-105 transition-all duration-300 w-full sm:w-auto text-center"
            >
              Get Started Free
            </Link>
            <a
              href="#features"
              className="px-8 py-4 bg-white text-gray-900 rounded-lg font-semibold text-lg border-2 border-gray-200 hover:border-[#ff6b35] hover:shadow-lg transition-all duration-300 w-full sm:w-auto text-center"
            >
              View Features
            </a>
          </motion.div>

          {/* Stats */}
          <motion.div variants={itemVariants} className="grid grid-cols-3 gap-8 mt-20 max-w-3xl mx-auto">
            <div>
              <div className="text-4xl font-bold text-gradient mb-2">0</div>
              <div className="text-gray-600 font-medium">Active Teams</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-gradient mb-2">0%</div>
              <div className="text-gray-600 font-medium">Uptime</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-gradient mb-2">0/5</div>
              <div className="text-gray-600 font-medium">User Rating</div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

export default Hero;
