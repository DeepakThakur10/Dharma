import { motion } from 'framer-motion';

const features = [
  { id: 1, icon: '📋', title: 'Task Management', description: 'Create, assign, and track tasks with ease. Set priorities and deadlines to keep your team aligned.' },
  { id: 2, icon: '📊', title: 'Project Tracking', description: 'Monitor project progress in real-time with visual dashboards and progress indicators.' },
  { id: 3, icon: '👥', title: 'Team Collaboration', description: 'Invite team members, assign roles, and collaborate seamlessly on shared projects.' },
  { id: 4, icon: '💬', title: 'Real-Time Chat', description: 'Communicate with your team instantly through project-based group chat channels.' },
  { id: 5, icon: '🔔', title: 'Smart Notifications', description: 'Stay informed with real-time notifications for task updates, mentions, and deadlines.' },
  { id: 6, icon: '🔖', title: 'Bookmarks', description: 'Save important tasks and notes for quick access. Never lose track of what matters.' },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: "easeOut" }
  }
};

function Features() {
  return (
    <section id="features" className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
            Everything You Need to
            <span className="text-gradient"> Succeed</span>
          </h2>
          <p className="text-xl text-gray-600">
            Powerful features designed to streamline your workflow and boost productivity.
          </p>
        </motion.div>

        {/* Features Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {features.map((feature) => (
            <motion.div
              key={feature.id}
              variants={itemVariants}
              whileHover={{ y: -5, shadow: "0 20px 25px -5px rgb(0 0 0 / 0.1)" }}
              className="bg-white p-8 rounded-2xl border-2 border-gray-100 hover:border-[#ff6b35] transition-colors duration-300 cursor-pointer group"
            >
              {/* Icon */}
              <div className="w-16 h-16 gradient-primary rounded-xl flex items-center justify-center mb-6 text-3xl group-hover:scale-110 transition-transform duration-300">
                {feature.icon}
              </div>

              {/* Title */}
              <h3 className="text-2xl font-bold text-gray-900 mb-3 group-hover:text-[#ff6b35] transition-colors">
                {feature.title}
              </h3>

              {/* Description */}
              <p className="text-gray-600 leading-relaxed">
                {feature.description}
              </p>

              {/* Hover Accent */}
              <div className="mt-6 flex items-center text-[#ff6b35] font-semibold opacity-0 group-hover:opacity-100 transition-opacity">
                Learn more
                <svg className="w-5 h-5 ml-2 group-hover:translate-x-2 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mt-16"
        >
          <p className="text-gray-600 mb-6 text-lg">
            Ready to transform how your team works?
          </p>
          <button className="px-8 py-4 gradient-primary text-white rounded-lg font-semibold text-lg hover:shadow-2xl hover:scale-105 transition-all duration-300">
            Start Your Free Trial
          </button>
        </motion.div>
      </div>
    </section>
  );
}

export default Features;
