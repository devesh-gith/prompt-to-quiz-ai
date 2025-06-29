
import { motion } from 'framer-motion'
import { Upload, Brain, Sparkles, Share } from 'lucide-react'

const steps = [
  {
    icon: Upload,
    title: "Upload Your Content",
    description: "Choose from images, videos, PDFs, text, or simple prompts",
    color: "bg-blue-500"
  },
  {
    icon: Brain,
    title: "AI Analysis",
    description: "Our advanced AI processes and understands your content",
    color: "bg-purple-500"
  },
  {
    icon: Sparkles,
    title: "Quiz Generation",
    description: "Intelligent questions are automatically created and formatted",
    color: "bg-green-500"
  },
  {
    icon: Share,
    title: "Share & Engage",
    description: "Publish your quiz and track engagement with detailed analytics",
    color: "bg-orange-500"
  }
]

const HowItWorks = () => {
  return (
    <section className="py-20 bg-gray-50">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-black mb-6">
            How It Works
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Creating engaging quizzes has never been easier. Our AI does the heavy lifting 
            while you focus on what matters most - your content and audience.
          </p>
        </motion.div>

        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                viewport={{ once: true }}
                className="text-center relative"
              >
                {/* Connecting Line */}
                {index < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-12 left-full w-full h-0.5 bg-gray-300 z-0">
                    <motion.div
                      initial={{ scaleX: 0 }}
                      whileInView={{ scaleX: 1 }}
                      transition={{ duration: 0.8, delay: index * 0.2 + 0.5 }}
                      viewport={{ once: true }}
                      className="h-full bg-black origin-left"
                    />
                  </div>
                )}

                {/* Step Number */}
                <div className="relative z-10 mb-6">
                  <motion.div
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    className={`w-24 h-24 ${step.color} rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg`}
                  >
                    <step.icon className="w-10 h-10 text-white" />
                  </motion.div>
                  <div className="absolute -top-2 -right-2 w-8 h-8 bg-black text-white rounded-full flex items-center justify-center text-sm font-bold">
                    {index + 1}
                  </div>
                </div>

                <h3 className="text-xl font-bold text-black mb-3">
                  {step.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {step.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

export default HowItWorks
