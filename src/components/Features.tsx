
import { motion } from 'framer-motion'
import { Card, CardContent } from '@/components/ui/card'
import { Image, Youtube, FileText, Type, Sparkles } from 'lucide-react'

const features = [
  {
    icon: Image,
    title: "Image to Quiz",
    description: "Upload any image and our AI analyzes visual content to create relevant, engaging questions instantly.",
    color: "bg-blue-500"
  },
  {
    icon: Youtube,
    title: "YouTube to Quiz",
    description: "Transform video content into comprehensive quizzes by simply pasting a YouTube URL.",
    color: "bg-red-500"
  },
  {
    icon: FileText,
    title: "PDF to Quiz",
    description: "Convert documents, research papers, and PDFs into interactive assessments with perfect accuracy.",
    color: "bg-green-500"
  },
  {
    icon: Type,
    title: "Text to Quiz",
    description: "Turn any written content, articles, or notes into engaging quizzes in seconds.",
    color: "bg-purple-500"
  },
  {
    icon: Sparkles,
    title: "Prompt to Quiz",
    description: "Generate custom quizzes from simple text prompts - perfect for any topic or subject.",
    color: "bg-orange-500"
  }
]

const Features = () => {
  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-black mb-6">
            Five Powerful Ways to Create Quizzes
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Our AI understands multiple content formats and transforms them into engaging, 
            interactive quizzes tailored to your specific needs.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              whileHover={{ 
                scale: 1.05,
                rotateX: 5,
                rotateY: 5,
              }}
              className="group cursor-pointer"
            >
              <Card className="h-full border-2 border-gray-100 hover:border-black transition-all duration-300 hover:shadow-2xl bg-white">
                <CardContent className="p-8 text-center">
                  <motion.div
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    className={`w-16 h-16 ${feature.color} rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:shadow-lg transition-all duration-300`}
                  >
                    <feature.icon className="w-8 h-8 text-white" />
                  </motion.div>
                  <h3 className="text-2xl font-bold text-black mb-4 group-hover:text-gray-800 transition-colors">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed group-hover:text-gray-700 transition-colors">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default Features
