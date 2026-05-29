import React from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { 
  ShieldCheck, 
  Zap, 
  Users, 
  Smartphone, 
  Lock, 
  TrendingUp,
  ArrowRight,
  CheckCircle2,
  Star,
  Building2,
  CreditCard,
  PiggyBank,
  HeadphonesIcon,
  Sun,
  Moon
} from 'lucide-react';

export const Landing = () => {
  const { isAuthenticated } = useAuth();
  const { isDark, toggleTheme } = useTheme();

  // Redirect authenticated users to dashboard
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 bg-white dark:bg-slate-900 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <Building2 className="w-8 h-8 text-amber-500" />
              <span className="text-xl font-bold">NUMS Bank</span>
            </div>
            <div className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100">Features</a>
              <a href="#services" className="text-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100">Services</a>
              <a href="#testimonials" className="text-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100">Testimonials</a>
              <a href="#contact" className="text-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100">Contact</a>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={toggleTheme}
                className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 transition-colors"
              >
                {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>
              <Link to="/login" className="text-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100">
                Login
              </Link>
              <Link to="/login" className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-sm font-medium transition-colors">
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img 
            src="/src/assets/nums_bank_banner.webp" 
            alt="NUMS Bank Banner" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-white/80 via-white/40 to-transparent dark:from-slate-950/80 dark:via-slate-950/40 dark:to-transparent" />
        </div>
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 rounded-full text-sm font-medium mb-6">
                <Zap className="w-4 h-4" />
                <span>Trusted by 1M+ customers</span>
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6">
                Banking Made <span className="text-amber-500">Simple</span> & Secure
              </h1>
              <p className="text-lg text-slate-600 dark:text-slate-400 mb-8">
                Experience the future of banking with NUMS Bank. Fast transactions, 
                secure payments, and 24/7 support - all in one place.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link to="/login" className="px-6 py-3 bg-amber-500 hover:bg-amber-600 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2">
                  Open Account
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link to="/login" className="px-6 py-3 border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg font-medium transition-colors">
                  Learn More
                </Link>
              </div>
              <div className="flex items-center gap-8 mt-10">
                <div className="flex -space-x-3">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="w-10 h-10 rounded-full bg-slate-300 dark:bg-slate-700 border-2 border-white dark:border-slate-900 flex items-center justify-center text-xs font-medium text-slate-700 dark:text-slate-300">
                      {i}
                    </div>
                  ))}
                </div>
                <div>
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <Star key={i} className="w-4 h-4 fill-amber-500 text-amber-500" />
                    ))}
                  </div>
                  <p className="text-sm text-slate-600 dark:text-slate-400">4.9/5 from 10k+ reviews</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 sm:px-6 lg:px-8 bg-white dark:bg-slate-900">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Why Choose NUMS Bank?</h2>
            <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
              We combine cutting-edge technology with exceptional service to deliver a banking experience like no other.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: ShieldCheck,
                title: "Bank-Grade Security",
                description: "256-bit encryption and multi-factor authentication keep your money safe."
              },
              {
                icon: Zap,
                title: "Instant Transfers",
                description: "Send money instantly to any bank account, 24/7, with zero delays."
              },
              {
                icon: Smartphone,
                title: "Mobile First",
                description: "Manage everything from your phone with our intuitive mobile app."
              },
              {
                icon: Users,
                title: "24/7 Support",
                description: "Our dedicated team is always ready to help you with any queries."
              },
              {
                icon: Lock,
                title: "Privacy First",
                description: "Your data is never shared. We prioritize your privacy above all."
              },
              {
                icon: TrendingUp,
                title: "Smart Analytics",
                description: "Track your spending patterns and get personalized financial insights."
              }
            ].map((feature, index) => (
              <div key={index} className="bg-slate-50 dark:bg-slate-800 rounded-2xl p-6 hover:shadow-lg transition-shadow border border-slate-200 dark:border-slate-700">
                <div className="w-12 h-12 bg-amber-100 dark:bg-amber-900/30 rounded-xl flex items-center justify-center mb-4">
                  <feature.icon className="w-6 h-6 text-amber-600 dark:text-amber-400" />
                </div>
                <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                <p className="text-slate-600 dark:text-slate-400">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="py-20 px-4 sm:px-6 lg:px-8 bg-slate-50 dark:bg-slate-950">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Our Services</h2>
            <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
              Comprehensive banking solutions designed for your financial success.
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-8">
            {[
              {
                title: "Savings Account",
                description: "High-interest savings account with no minimum balance requirement.",
                features: ["4% p.a. interest", "Zero maintenance charges", "Free debit card"]
              },
              {
                title: "Current Account",
                description: "Perfect for businesses with unlimited transactions and overdraft facility.",
                features: ["Unlimited transactions", "Overdraft facility", "Business loans"]
              },
              {
                title: "Personal Loans",
                description: "Quick approval personal loans at competitive interest rates.",
                features: ["Up to ₹10 lakh", "Flexible tenure", "Quick disbursal"]
              },
              {
                title: "Credit Cards",
                description: "Premium credit cards with exclusive rewards and cashback offers.",
                features: ["0% foreign markup", "Airport lounge access", "Reward points"]
              }
            ].map((service, index) => (
              <div key={index} className="bg-white dark:bg-slate-900 rounded-2xl p-8 border border-slate-200 dark:border-slate-800 shadow-sm">
                <h3 className="text-xl font-semibold mb-3">{service.title}</h3>
                <p className="text-slate-600 dark:text-slate-400 mb-4">{service.description}</p>
                <ul className="space-y-2">
                  {service.features.map((feature, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-20 px-4 sm:px-6 lg:px-8 bg-white dark:bg-slate-900">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">What Our Customers Say</h2>
            <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
              Join thousands of satisfied customers who trust NUMS Bank for their financial needs.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                name: "Rahul Sharma",
                role: "Business Owner",
                content: "NUMS Bank has transformed how I manage my business finances. The instant transfers and excellent support have been game-changers.",
                rating: 5
              },
              {
                name: "Priya Patel",
                role: "Software Engineer",
                content: "The mobile app is incredibly intuitive. I can do everything from my phone - from paying bills to investing. Highly recommended!",
                rating: 5
              },
              {
                name: "Amit Kumar",
                role: "Freelancer",
                content: "Best banking experience I've ever had. The interest rates on savings are competitive and the customer service is top-notch.",
                rating: 5
              }
            ].map((testimonial, index) => (
              <div key={index} className="bg-slate-50 dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-500 text-amber-500" />
                  ))}
                </div>
                <p className="text-slate-600 dark:text-slate-400 mb-6">{testimonial.content}</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-amber-100 dark:bg-amber-900/30 rounded-full flex items-center justify-center font-bold text-amber-700 dark:text-amber-400">
                    {testimonial.name.charAt(0)}
                  </div>
                  <div>
                    <p className="font-semibold">{testimonial.name}</p>
                    <p className="text-sm text-slate-500">{testimonial.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-gradient-to-r from-amber-500 to-amber-600 rounded-3xl p-12 text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Ready to Start Banking Smarter?
            </h2>
            <p className="text-lg text-white/90 mb-8">
              Open your account in minutes and experience the future of banking today.
            </p>
            <Link to="/login" className="inline-flex items-center gap-2 px-8 py-4 bg-white hover:bg-slate-100 text-amber-600 rounded-lg font-medium transition-colors">
              Get Started Now
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-20 px-4 sm:px-6 lg:px-8 bg-slate-50 dark:bg-slate-950">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12">
            <div>
              <h2 className="text-3xl font-bold mb-4">Get in Touch</h2>
              <p className="text-slate-600 dark:text-slate-400 mb-8">
                Have questions? We'd love to hear from you. Send us a message and we'll respond as soon as possible.
              </p>
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-amber-100 dark:bg-amber-900/30 rounded-xl flex items-center justify-center">
                    <HeadphonesIcon className="w-6 h-6 text-amber-600 dark:text-amber-400" />
                  </div>
                  <div>
                    <p className="font-semibold">24/7 Support</p>
                    <p className="text-sm text-slate-600 dark:text-slate-400">1800-123-4567</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-amber-100 dark:bg-amber-900/30 rounded-xl flex items-center justify-center">
                    <Building2 className="w-6 h-6 text-amber-600 dark:text-amber-400" />
                  </div>
                  <div>
                    <p className="font-semibold">Head Office</p>
                    <p className="text-sm text-slate-600 dark:text-slate-400">Mumbai, Maharashtra, India</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-8 shadow-sm border border-slate-200 dark:border-slate-800">
              <form className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Name</label>
                  <input type="text" className="w-full px-4 py-3 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500" placeholder="Your name" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Email</label>
                  <input type="email" className="w-full px-4 py-3 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500" placeholder="your@email.com" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Message</label>
                  <textarea rows="4" className="w-full px-4 py-3 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500" placeholder="Your message"></textarea>
                </div>
                <button type="submit" className="w-full px-6 py-3 bg-amber-500 hover:bg-amber-600 text-white rounded-lg font-medium transition-colors">
                  Send Message
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 dark:bg-slate-950 text-white py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Building2 className="w-8 h-8 text-amber-500" />
                <span className="text-xl font-bold">NUMS Bank</span>
              </div>
              <p className="text-slate-400 text-sm">
                Your trusted partner for all banking needs. Secure, fast, and reliable.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Products</h4>
              <ul className="space-y-2 text-sm text-slate-400">
                <li><a href="#" className="hover:text-white">Savings Account</a></li>
                <li><a href="#" className="hover:text-white">Current Account</a></li>
                <li><a href="#" className="hover:text-white">Personal Loans</a></li>
                <li><a href="#" className="hover:text-white">Credit Cards</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-sm text-slate-400">
                <li><a href="#" className="hover:text-white">About Us</a></li>
                <li><a href="#" className="hover:text-white">Careers</a></li>
                <li><a href="#" className="hover:text-white">Press</a></li>
                <li><a href="#" className="hover:text-white">Contact</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-slate-400">
                <li><a href="#" className="hover:text-white">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-white">Terms of Service</a></li>
                <li><a href="#" className="hover:text-white">Security</a></li>
                <li><a href="#" className="hover:text-white">Compliance</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-slate-800 pt-8 text-center text-sm text-slate-400">
            <p>&copy; 2024 NUMS Bank. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
