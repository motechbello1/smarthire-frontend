import { motion } from 'framer-motion';
import { Brain, FileText, BarChart3, Shield, Zap, Users } from 'lucide-react';

const features = [
  {
    icon: Brain,
    title: 'BERT Semantic Matching',
    description: 'Advanced NLP understands Nigerian qualifications: NYSC, SIWES, WAEC/JAMB, and code-switched language.',
  },
  {
    icon: FileText,
    title: 'LIME Explanations',
    description: 'See exactly why each candidate ranked where they did. Top-5 feature attributions with R² ≥ 0.85 fidelity.',
  },
  {
    icon: Zap,
    title: 'Active Learning',
    description: 'Achieve 75% accuracy with just 20 labeled examples. Perfect for SMEs without historical hiring data.',
  },
  {
    icon: Shield,
    title: 'Fairness Auditing',
    description: 'Demographic parity and equalized odds across ethnicity and gender. Transparent bias monitoring.',
  },
  {
    icon: BarChart3,
    title: 'Real-Time Rankings',
    description: 'Upload CVs, get instant rankings with confidence scores. No more manual screening for weeks.',
  },
  {
    icon: Users,
    title: 'Nigerian Context',
    description: 'Trained on synthetic Nigerian CV corpus. Understands local education systems and career patterns.',
  },
];

export function Features() {
  return (
    <div className="py-20 bg-white dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl sm:text-5xl font-bold text-gray-900 dark:text-white mb-4">
            Why SmartHire AI?
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Built specifically for Nigerian recruitment, combining cutting-edge AI with cultural understanding.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              whileHover={{ y: -5 }}
              className="p-6 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:border-primary-500 dark:hover:border-primary-500 transition-all"
            >
              <div className="w-12 h-12 rounded-lg bg-primary-100 dark:bg-primary-900 flex items-center justify-center mb-4">
                <feature.icon className="h-6 w-6 text-primary-600 dark:text-primary-400" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                {feature.title}
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
