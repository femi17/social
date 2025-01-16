import React, { useState } from 'react';
import { ArrowRight, Trophy, Users, Sparkles, Star, CheckCircle, Target, Zap, DollarSign, Award, Gift, TrendingUp, Facebook, Instagram, Twitter } from 'lucide-react';
import logo from '../assets/logo.png';
import { preregister } from '../apiUtils';

const stats = [
  { label: 'Market Size', value: '$100B+', description: 'Creator Economy' },
  { label: 'Active Creators', value: '10K+', description: 'And Growing' },
  { label: 'Categories', value: '7+', description: 'Creative Fields' },
  { label: 'Brand Partners', value: '50+', description: 'Ready to Collaborate' }
];

const categories = [
  'Music', 'Photography', 'Fashion', 'Art', 'Dance', 'Comedy', 'Modelling'
];

const problems = [
  {
    title: "The Waiting Game",
    description: "Spend months or years building an audience, only to be lost in the noise of traditional platforms.",
    icon: Target
  },
  {
    title: "Algorithm Dependency",
    description: "Success depends more on cracking platform algorithms than actual talent.",
    icon: Zap
  },
  {
    title: "Limited Recognition",
    description: "Rewards and opportunities reserved for top influencers and celebrities.",
    icon: DollarSign
  }
];

const benefits = [
  {
    title: "Fast-Track Recognition",
    description: "Get discovered based on your talent, not your follower count",
    icon: Award
  },
  {
    title: "Brand Partnerships",
    description: "Connect directly with brands looking for authentic creators",
    icon: Users
  },
  {
    title: "Competitive Rewards",
    description: "Win cash prizes, sponsorships, and exclusive opportunities",
    icon: Gift
  },
  {
    title: "Career Growth",
    description: "Eliminate the option of chance, get infront of top celebrities.",
    icon: TrendingUp
  }
];

const testimonials = [
  {
    name: "Mike R.",
    role: "Music Artist",
    content: "The league system is genius. It's like sports for creators. I love competing and improving my craft.",
    category: "Music"
  },
  {
    name: "Lisa T.",
    role: "Brand Manager",
    content: "We've found amazing talent through Scropoll. The competitive format makes it easy to spot genuine creators.",
    category: "Brand Partner"
  }
];

const faqs = [
  {
    question: "How do the leagues work?",
    answer: "Creators are placed in leagues based on their category and experience level. You compete in regular challenges, earn points, and can advance to higher leagues based on performance. Each league offers different rewards and opportunities."
  },
  {
    question: "What kinds of rewards can I win?",
    answer: "Rewards include cash prizes, brand collaboration opportunities, featured spots in our automated TV shows, exclusive merchandise, and recognition within your creative community."
  },
  {
    question: "How do I get started?",
    answer: "Simply sign up, choose your creative category, and you'll be placed in an appropriate league. You can start competing and showcasing your talent immediately."
  },
  {
    question: "Is Scropoll free to use?",
    answer: "Yes, Scropoll is free to join and participate in basic competitions. Premium features and additional opportunities are available through our subscription tiers."
  }
];

export default function LandingPage() {
  const [formData, setFormData] = useState({ username: '', email: '', category: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
  
    try {
      const response = await preregister(formData);
      
      // Check for both 200 and 201 status codes for success
      if (response && (response.status === 200 || response.status === 201)) {
        setMessage('Thanks for joining! We\'ll notify you when Scropoll launches.');
        setFormData({ username: '', email: '', category: '' });
      } else {
        setMessage('Something went wrong. Please try again.');
      }
    } catch (error) {
      setMessage('Connection error. Please try again later.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 opacity-70" />
        <div className="relative container mx-auto px-4 pt-24 pb-16">
          <div className="text-center">

            <img src={logo} alt="Logo" className="mx-auto h-12 w-auto mb-2" />
            <div className="inline-flex items-center px-4 py-2 bg-blue-50 rounded-full mb-8">
              <Star className="w-4 h-4 text-blue-500 mr-2" />
              <span className="text-sm font-medium text-blue-600">Join the revolution in digital entertainment</span>
            </div>
            
            <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600">
              Where Creativity Meets Competition <br />
              <span className="text-sm font-medium text-blue-600">Creator Economy + Sport Industry</span>
            </h1>
            
            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto mt-12">
              {stats.map((stat, index) => (
                <div key={index} className="bg-white bg-opacity-90 backdrop-blur-sm rounded-xl p-6 shadow-lg">
                  <div className="text-2xl font-bold text-blue-600">{stat.value}</div>
                  <div className="text-sm font-medium text-gray-800">{stat.label}</div>
                  <div className="text-xs text-gray-500">{stat.description}</div>
                </div>
              ))}
            </div>

            {/* Social Media Links - New Addition */}
            <div className="flex justify-center gap-4 mt-10">
              <span className="text-sm font-medium mt-2 text-blue-600">Follow us on social</span>
              <a 
              href="https://facebook.com/scropoll" 
              target="_blank" 
              rel="noopener noreferrer"
              className="p-2 rounded-full bg-blue-600 text-white hover:bg-blue-700 transition-colors duration-300"
              aria-label="Follow us on Facebook"
              >
              <Facebook className="w-5 h-5" />
              </a>
              <a 
              href="https://instagram.com/scropoll" 
              target="_blank" 
              rel="noopener noreferrer"
              className="p-2 rounded-full bg-gradient-to-br from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700 transition-colors duration-300"
              aria-label="Follow us on Instagram"
              >
              <Instagram className="w-5 h-5" />
              </a>
              <a 
              href="https://twitter.com/scropoll" 
              target="_blank" 
              rel="noopener noreferrer"
              className="p-2 rounded-full bg-black text-white hover:bg-gray-800 transition-colors duration-300"
              aria-label="Follow us on X (Twitter)"
              >
              <Twitter className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Problem Section */}
      <div className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">The Creator's Struggle</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Traditional platforms make it nearly impossible for new creators to break through and earn recognition. It’s frustrating, waiting for your turn, hoping to get noticed.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {problems.map((problem, index) => (
              <div key={index} className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-8 shadow-sm">
                <problem.icon className="w-12 h-12 text-red-500 mb-4" />
                <h3 className="text-xl font-semibold mb-2">{problem.title}</h3>
                <p className="text-gray-600">{problem.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Solution Section */}
      <div className="py-20 bg-gradient-to-b from-blue-50 to-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">The Scropoll Solution</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              We've reimagined how creators can succeed by combining the excitement of sports competition with creative expression.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300">
              <Trophy className="w-12 h-12 text-yellow-500 mb-4" />
              <h3 className="text-xl font-semibold mb-2">League-Based Competition</h3>
              <p className="text-gray-600">Compete in your category, avoid relegation, and gain recognition based on your talent, not your follower count.</p>
            </div>

            <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300">
              <Users className="w-12 h-12 text-blue-500 mb-4" />
              <h3 className="text-xl font-semibold mb-2">Brand Partnerships</h3>
              <p className="text-gray-600">Get discovered by brands looking for authentic creators. No more waiting for opportunities to find you.</p>
            </div>

            <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300">
              <Sparkles className="w-12 h-12 text-purple-500 mb-4" />
              <h3 className="text-xl font-semibold mb-2">Exclusive Rewards</h3>
              <p className="text-gray-600">Win cash prizes, sponsorships, and exclusive opportunities as you showcase your talent and creativity.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Benefits Section */}
      <div className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Why Choose Scropoll?</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Discover the benefits of joining Scropoll and start your journey to recognition and success.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {benefits.map((benefit, index) => (
              <div key={index} className="bg-gray-50 rounded-2xl p-8 shadow-md">
                <benefit.icon className="w-12 h-12 text-green-500 mb-4" />
                <h3 className="text-xl font-semibold mb-2">{benefit.title}</h3>
                <p className="text-gray-600">{benefit.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Testimonials Section */}
      <div className="py-20 bg-gradient-to-b from-blue-50 to-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">What Creators Are Saying</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Hear from creators who have experienced the Scropoll difference.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-white rounded-2xl p-6 shadow-md">
                <p className="text-gray-600 italic mb-4">"{testimonial.content}"</p>
                <div className="font-semibold">{testimonial.name}</div>
                <div className="text-gray-500">{testimonial.role}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Frequently Asked Questions</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Have questions? We've got answers!
            </p>
          </div>
          
          <div className="max-w-5xl mx-auto">
            {faqs.map((faq, index) => (
              <div key={index} className="mb-4 border-b py-4">
                <h3 className="font-semibold text-gray-800">{faq.question}</h3>
                <p className="text-gray-600">{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Signup Section */}
      <div className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-md mx-auto">
            <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl shadow-xl p-8">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold mb-2">Join the Creator Revolution</h2>
                <p className="text-gray-600">Be among the first to experience Scropoll</p>
              </div>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Username</label>
                  <input
                    type="text"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    required
                    value={formData.username}
                    onChange={(e) => setFormData({...formData, username: e.target.value})}
                    placeholder="Choose your username"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                  <input
                    type="email"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    placeholder="Enter your email"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                  <select
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white"
                    required
                    value={formData.category}
                    onChange={(e) => setFormData({...formData, category: e.target.value})}
                  >
                    <option value="">Select your creative field</option>
                    {categories.map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-4 rounded-xl hover:from-blue-700 hover:to-purple-700 flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isSubmitting ? 'Joining...' : (
                    <>
                      Join the Revolution <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
              
              {message && (
                <div className="mt-6 text-center">
                  <div className="inline-flex items-center px-4 py-2 bg-green-50 rounded-full">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                    <span className="text-sm font-medium text-green-600">{message}</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}