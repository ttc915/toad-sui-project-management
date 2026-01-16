import { Link } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Kanban, BarChart3, Shield, Zap, Lock, Sparkles } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import lightLogo from '../../images/bg-white.png';
import darkLogo from '../../images/bg-black.png';

const features = [
  {
    icon: <Shield className="w-6 h-6" />,
    title: 'On-chain Task History',
    description: 'Immutable audit trail of every status change and update on Sui blockchain',
  },
  {
    icon: <Sparkles className="w-6 h-6" />,
    title: 'AI Assistant Powered Workflows',
    description: 'Smart AI helps you manage tasks, suggest priorities, and analyze sprint progress',
  },
  {
    icon: <Kanban className="w-6 h-6" />,
    title: 'Kanban, List, Calendar & Timeline',
    description: 'Multiple views to visualize your work the way your team prefers',
  },
  {
    icon: <Lock className="w-6 h-6" />,
    title: 'Secure with Sui Object-based Ownership',
    description: 'Leverage Sui\'s object model for granular access control and permissions',
  },
];

const stats = [
  { value: '20k+', label: 'Projects Tracked' },
  { value: '99.9%', label: 'Uptime SLA' },
  { value: '50k+', label: 'On-chain Tasks' },
];

const pricingPlans = [
  {
    name: 'Free',
    price: '$0',
    period: 'forever',
    features: [
      'Up to 10 tasks',
      'Basic Kanban board',
      'Community support',
      'On-chain verification',
    ],
  },
  {
    name: 'Pro',
    price: '$12',
    period: 'per user/month',
    features: [
      'Unlimited tasks',
      'All view types',
      'AI assistant',
      'Priority support',
      'Advanced analytics',
      'Custom workflows',
    ],
    popular: true,
  },
  {
    name: 'Team',
    price: '$29',
    period: 'per user/month',
    features: [
      'Everything in Pro',
      'Team collaboration',
      'Admin controls',
      'SSO integration',
      'Dedicated support',
      'Custom contracts',
    ],
  },
];

export function LandingPage() {
  const { theme } = useTheme();
  return (
    <div className="min-h-screen bg-[#F7F5F0]">
      <header className="border-b border-gray-200 bg-white/50 backdrop-blur-sm sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img
              src={theme === 'dark' ? darkLogo : lightLogo}
              alt="TOAD"
              className="w-10 h-10 rounded-lg object-cover"
            />
            <span className="text-xl font-bold text-gray-900">TOAD</span>
          </div>
          <nav className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-sm font-medium text-gray-600 hover:text-gray-900">Features</a>
            <a href="#pricing" className="text-sm font-medium text-gray-600 hover:text-gray-900">Pricing</a>
            <a href="#about" className="text-sm font-medium text-gray-600 hover:text-gray-900">About</a>
          </nav>
          <div className="flex items-center gap-3">
            <Link to="/app/analytics">
              <Button>Open App</Button>
            </Link>
          </div>
        </div>
      </header>

      <section className="max-w-7xl mx-auto px-6 py-20">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary-50 text-primary-700 rounded-full text-sm font-medium mb-6">
              <Shield className="w-4 h-4" />
              Built natively on Sui blockchain
            </div>
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
              TOAD – On-chain Workflows for Teams on Sui
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              Create boards, assign tasks, and track progress on-chain with Sui Move smart contracts.
            </p>
            <div className="flex gap-4">
              <Link to="/app/analytics">
                <Button size="lg" className="flex items-center gap-2">
                  Open App
                  <Zap className="w-4 h-4" />
                </Button>
              </Link>
              <Button variant="outline" size="lg">
                View on Sui Explorer
              </Button>
            </div>
            <div className="flex gap-8 mt-12">
              {stats.map((stat, idx) => (
                <div key={idx}>
                  <div className="text-3xl font-bold text-gray-900">{stat.value}</div>
                  <div className="text-sm text-gray-600">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="relative">
            <div className="absolute -top-4 -left-4 w-72 h-72 bg-primary-200 rounded-full blur-3xl opacity-30" />
            <div className="absolute -bottom-4 -right-4 w-72 h-72 bg-teal-200 rounded-full blur-3xl opacity-30" />
            <Card className="relative p-6 overflow-hidden">
              <div className="space-y-4">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-primary-600" />
                    <span className="font-semibold text-gray-900">In Progress</span>
                    <span className="text-sm text-gray-500">3</span>
                  </div>
                </div>
                <Card hover className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <span className="text-xs font-medium px-2 py-1 bg-teal-100 text-teal-700 rounded-full">Feature</span>
                    <Shield className="w-4 h-4 text-teal-600" />
                  </div>
                  <h4 className="font-semibold text-gray-900 mb-2">Design System</h4>
                  <div className="flex items-center gap-2">
                    <div className="flex -space-x-2">
                      <div className="w-6 h-6 rounded-full bg-gradient-to-br from-primary-400 to-teal-500 ring-2 ring-white" />
                      <div className="w-6 h-6 rounded-full bg-gradient-to-br from-teal-400 to-primary-500 ring-2 ring-white" />
                    </div>
                    <span className="text-xs text-gray-500">Due Dec 20</span>
                  </div>
                </Card>
                <Card className="p-4 bg-gradient-to-br from-primary-700 to-teal-600 text-white">
                  <div className="flex items-center gap-3 mb-2">
                    <BarChart3 className="w-5 h-5" />
                    <span className="font-semibold">77% On Track</span>
                  </div>
                  <p className="text-sm text-white/80">Sprint goals looking good</p>
                </Card>
              </div>
            </Card>
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-6 py-12 overflow-hidden">
        <div className="text-center mb-8">
          <h2 className="text-sm font-semibold text-primary-600 mb-2">Trusted by Builders on Sui</h2>
        </div>
        <div className="relative">
          <div className="flex gap-12 animate-scroll">
            {[...Array(2)].map((_, setIdx) => (
              <div key={setIdx} className="flex gap-12 items-center">
                {['SuiLabs', 'Mysten', 'Protocorp', 'Inawō', 'KiloScribe', 'DeepBook', 'Cetus', 'Turbos'].map((name) => (
                  <div key={`${setIdx}-${name}`} className="flex-shrink-0">
                    <Card className="px-8 py-4 hover:scale-105 transition-transform">
                      <div className="text-lg font-bold text-gray-700">{name}</div>
                    </Card>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="features" className="max-w-7xl mx-auto px-6 py-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">Everything your team needs in one place</h2>
          <p className="text-xl text-gray-600">All-in-one solution for task, project, and team management</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, idx) => (
            <Card key={idx} className="p-6 hover:shadow-xl transition-shadow">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-100 to-teal-100 flex items-center justify-center text-primary-600 mb-4">
                {feature.icon}
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">{feature.title}</h3>
              <p className="text-sm text-gray-600">{feature.description}</p>
            </Card>
          ))}
        </div>

        <div className="grid md:grid-cols-3 gap-6 mt-12">
          <Card className="p-8 bg-gradient-to-br from-primary-50 to-white">
            <Kanban className="w-10 h-10 text-primary-600 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Kanban Boards</h3>
            <p className="text-gray-600">Visualize workflow with drag-and-drop simplicity</p>
          </Card>
          <Card className="p-8 bg-gradient-to-br from-teal-50 to-white">
            <BarChart3 className="w-10 h-10 text-teal-600 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Analytics Dashboard</h3>
            <p className="text-gray-600">Track progress with beautiful charts and insights</p>
          </Card>
          <Card className="p-8 bg-gradient-to-br from-primary-50 to-white">
            <Sparkles className="w-10 h-10 text-primary-600 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">AI Assistant</h3>
            <p className="text-gray-600">Smart suggestions and automated workflows</p>
          </Card>
        </div>
      </section>


      <section id="pricing" className="max-w-7xl mx-auto px-6 py-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">Simple, Transparent Pricing</h2>
          <p className="text-xl text-gray-600">Choose the perfect plan for your team</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {pricingPlans.map((plan, idx) => (
            <Card key={idx} className={`p-8 ${plan.popular ? 'ring-2 ring-primary-600 relative' : ''}`}>
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-primary-600 text-white text-sm font-medium rounded-full">
                  Most Popular
                </div>
              )}
              <h3 className="text-xl font-bold text-gray-900 mb-2">{plan.name}</h3>
              <div className="mb-6">
                <span className="text-4xl font-bold text-gray-900">{plan.price}</span>
                <span className="text-gray-600 ml-2">/{plan.period}</span>
              </div>
              <ul className="space-y-3 mb-8">
                {plan.features.map((feature, featureIdx) => (
                  <li key={featureIdx} className="flex items-center gap-2 text-gray-600">
                    <div className="w-5 h-5 rounded-full bg-teal-100 flex items-center justify-center flex-shrink-0">
                      <div className="w-2 h-2 bg-teal-600 rounded-full" />
                    </div>
                    {feature}
                  </li>
                ))}
              </ul>
              <Button
                variant={plan.popular ? 'primary' : 'outline'}
                className="w-full"
              >
                Get Started
              </Button>
            </Card>
          ))}
        </div>
      </section>

      <footer className="border-t border-gray-200 bg-white">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-600 to-teal-600 flex items-center justify-center text-white font-bold text-lg">
                  T
                </div>
                <span className="text-xl font-bold text-gray-900">TOAD</span>
              </div>
              <p className="text-sm text-gray-600">Built for Sui Hackathons</p>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-4">Product</h4>
              <ul className="space-y-2">
                <li><a href="#" className="text-sm text-gray-600 hover:text-gray-900">Features</a></li>
                <li><a href="#" className="text-sm text-gray-600 hover:text-gray-900">Pricing</a></li>
                <li><a href="#" className="text-sm text-gray-600 hover:text-gray-900">Docs</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-4">Company</h4>
              <ul className="space-y-2">
                <li><a href="#" className="text-sm text-gray-600 hover:text-gray-900">About</a></li>
                <li><a href="#" className="text-sm text-gray-600 hover:text-gray-900">GitHub</a></li>
                <li><a href="#" className="text-sm text-gray-600 hover:text-gray-900">Privacy</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-4">Resources</h4>
              <ul className="space-y-2">
                <li><a href="#" className="text-sm text-gray-600 hover:text-gray-900">Sui Docs</a></li>
                <li><a href="#" className="text-sm text-gray-600 hover:text-gray-900">Community</a></li>
                <li><a href="#" className="text-sm text-gray-600 hover:text-gray-900">Support</a></li>
              </ul>
            </div>
          </div>
          <div className="mt-12 pt-8 border-t border-gray-200 text-center text-sm text-gray-600">
            © 2025 TOAD. Built natively on Sui blockchain. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
