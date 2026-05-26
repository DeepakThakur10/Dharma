import { motion } from 'framer-motion';

function DashboardPreview() {
  return (
    <section className="py-24 bg-page overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4" style={{ color: 'var(--text)' }}>
            Powerful Dashboards for
            <span className="text-gradient"> Modern Teams</span>
          </h2>
          <p className="text-xl" style={{ color: 'var(--text-muted)' }}>
            Get a birds-eye view of all your projects and tasks in one place.
          </p>
        </motion.div>

        <div className="relative">
          {/* Main Preview Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 40 }}
            whileInView={{ opacity: 1, scale: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="rounded-3xl border-4 border-white shadow-2xl overflow-hidden bg-white"
            style={{ borderColor: 'var(--border)' }}
          >
            <div className="aspect-[16/10] bg-gray-50 flex items-center justify-center relative">
              {/* This is where the actual dashboard screenshot would go */}
              <div className="absolute inset-0 bg-gradient-to-br from-[#ff6b35]/10 to-transparent"></div>
              <img
                src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80&w=2070"
                alt="Dashboard Preview"
                className="w-full h-full object-cover opacity-90"
              />

              {/* Floating UI Elements (Decorative) */}
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="absolute -top-6 -right-6 w-64 h-24 bg-white rounded-2xl shadow-xl border border-gray-100 p-4 hidden lg:block"
                style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)' }}
              >
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-600 text-xl font-bold">✓</div>
                  <div>
                    <div className="h-2 w-32 bg-gray-200 rounded-full mb-2"></div>
                    <div className="h-2 w-20 bg-gray-100 rounded-full"></div>
                  </div>
                </div>
              </motion.div>

              <motion.div
                animate={{ y: [0, 10, 0] }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
                className="absolute -bottom-6 -left-6 w-64 h-32 bg-white rounded-2xl shadow-xl border border-gray-100 p-4 hidden lg:block"
                style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)' }}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="h-3 w-24 bg-gray-200 rounded-full"></div>
                  <div className="h-3 w-12 bg-[#ff6b35]/20 rounded-full"></div>
                </div>
                <div className="space-y-3">
                  <div className="h-2 w-full bg-gray-100 rounded-full"></div>
                  <div className="h-2 w-4/5 bg-gray-100 rounded-full"></div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

export default DashboardPreview;