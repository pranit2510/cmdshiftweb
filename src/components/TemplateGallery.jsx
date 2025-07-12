import React from 'react';

const templates = [
  // Business & Marketing
  {
    id: 'landing',
    name: 'Landing Page',
    description: 'Modern landing page with hero section, features grid, and call-to-action',
    prompt: 'Modern landing page with hero section, features grid, testimonials, and call-to-action buttons. Include smooth animations and mobile responsive design',
    icon: '🚀',
    gradient: 'from-blue-500 to-purple-600'
  },
  {
    id: 'saas-startup',
    name: 'SaaS Startup',
    description: 'Complete SaaS website with pricing table, features, and demo CTA',
    prompt: 'SaaS startup website with hero section, feature highlights with icons, pricing table with 3 tiers, customer testimonials carousel, FAQ section, and call-to-action for free trial',
    icon: '💎',
    gradient: 'from-violet-500 to-purple-600'
  },
  {
    id: 'restaurant',
    name: 'Restaurant Website',
    description: 'Restaurant site with menu, hours, location, and reservation form',
    prompt: 'Restaurant website with hero image, menu sections with prices, opening hours, location map, photo gallery, reservation form, and contact information. Use warm colors and appetizing design',
    icon: '🍽️',
    gradient: 'from-orange-500 to-red-600'
  },
  {
    id: 'real-estate',
    name: 'Real Estate Listing',
    description: 'Property listing site with search filters and property cards',
    prompt: 'Real estate website with property search filters (location, price, bedrooms), property cards with images and details, featured properties section, agent contact forms, and mortgage calculator',
    icon: '🏠',
    gradient: 'from-emerald-500 to-teal-600'
  },
  {
    id: 'fitness',
    name: 'Fitness Studio',
    description: 'Gym website with class schedule, trainers, and membership plans',
    prompt: 'Fitness studio website with class schedule grid, trainer profiles with photos, membership pricing plans, transformation gallery, class booking form, and motivational hero section',
    icon: '💪',
    gradient: 'from-red-500 to-pink-600'
  },

  // E-commerce & Retail
  {
    id: 'product-showcase',
    name: 'Product Showcase',
    description: 'Single product landing page with features and buy button',
    prompt: 'Product showcase page with large product images, feature highlights, customer reviews, price display, add to cart button, product specifications, and related products section',
    icon: '🛍️',
    gradient: 'from-purple-500 to-pink-600'
  },
  {
    id: 'online-store',
    name: 'Online Store',
    description: 'E-commerce homepage with product grid and shopping cart',
    prompt: 'E-commerce store with product grid, category filters, shopping cart, featured products carousel, sale banner, newsletter signup, and customer reviews section',
    icon: '🛒',
    gradient: 'from-green-500 to-emerald-600'
  },
  {
    id: 'fashion-boutique',
    name: 'Fashion Boutique',
    description: 'Stylish fashion store with lookbook and collections',
    prompt: 'Fashion boutique website with hero slideshow, collections grid, lookbook gallery, size guide, shopping features, Instagram feed integration, and elegant typography',
    icon: '👗',
    gradient: 'from-pink-500 to-purple-600'
  },

  // Professional Services
  {
    id: 'consulting',
    name: 'Consulting Firm',
    description: 'Professional consulting website with services and case studies',
    prompt: 'Consulting firm website with services overview, case studies with results, team profiles, client logos, contact form, industry expertise sections, and professional design',
    icon: '💼',
    gradient: 'from-gray-600 to-gray-800'
  },
  {
    id: 'law-firm',
    name: 'Law Firm',
    description: 'Legal services website with practice areas and attorney profiles',
    prompt: 'Law firm website with practice areas grid, attorney profiles with credentials, case results, client testimonials, consultation booking form, FAQ section, and professional navy design',
    icon: '⚖️',
    gradient: 'from-blue-800 to-blue-900'
  },
  {
    id: 'medical-clinic',
    name: 'Medical Clinic',
    description: 'Healthcare website with services, doctors, and appointment booking',
    prompt: 'Medical clinic website with services list, doctor profiles with specializations, appointment booking form, patient resources, insurance information, clinic hours, and calming design',
    icon: '🏥',
    gradient: 'from-teal-500 to-cyan-600'
  },
  {
    id: 'dental-practice',
    name: 'Dental Practice',
    description: 'Dentist website with services, before/after gallery, and booking',
    prompt: 'Dental practice website with services grid, before/after gallery, patient testimonials, appointment scheduler, insurance acceptance, team profiles, and friendly welcoming design',
    icon: '🦷',
    gradient: 'from-cyan-500 to-blue-600'
  },

  // Creative & Portfolio
  {
    id: 'portfolio',
    name: 'Creative Portfolio',
    description: 'Portfolio showcase with project grid and case studies',
    prompt: 'Creative portfolio with project grid, hover effects, case study pages, about section, skills list, client testimonials, contact form, and modern minimal design',
    icon: '🎨',
    gradient: 'from-indigo-500 to-purple-600'
  },
  {
    id: 'photography',
    name: 'Photography Portfolio',
    description: 'Photographer website with gallery and booking system',
    prompt: 'Photography portfolio with full-screen image gallery, portfolio categories, about the photographer, pricing packages, booking calendar, client galleries, and elegant design',
    icon: '📸',
    gradient: 'from-gray-700 to-gray-900'
  },
  {
    id: 'agency',
    name: 'Digital Agency',
    description: 'Creative agency with portfolio, services, and team',
    prompt: 'Digital agency website with animated hero, services grid, portfolio showcase, team members, client logos, process timeline, case studies, and bold creative design',
    icon: '🎯',
    gradient: 'from-orange-500 to-pink-600'
  },

  // Forms & Tools
  {
    id: 'contact',
    name: 'Contact Form',
    description: 'Professional contact form with validation and map',
    prompt: 'Contact page with form fields (name, email, phone, message), field validation, location map, business hours, social media links, and success message animation',
    icon: '📧',
    gradient: 'from-green-500 to-teal-600'
  },
  {
    id: 'survey',
    name: 'Survey Form',
    description: 'Multi-step survey with progress bar and various input types',
    prompt: 'Multi-step survey form with progress indicator, various input types (radio, checkbox, dropdown, text), validation, save progress feature, and results summary page',
    icon: '📋',
    gradient: 'from-blue-500 to-indigo-600'
  },
  {
    id: 'event-registration',
    name: 'Event Registration',
    description: 'Event signup page with ticket selection and payment',
    prompt: 'Event registration page with event details, ticket types and pricing, attendee information form, payment integration placeholder, confirmation page, and countdown timer',
    icon: '🎫',
    gradient: 'from-purple-500 to-indigo-600'
  },

  // Content & Media
  {
    id: 'blog',
    name: 'Blog Homepage',
    description: 'Blog layout with featured posts and categories',
    prompt: 'Blog homepage with featured post hero, recent posts grid, category filters, popular posts sidebar, newsletter signup, author bio section, and clean readable design',
    icon: '📝',
    gradient: 'from-amber-500 to-orange-600'
  },
  {
    id: 'news-magazine',
    name: 'News Magazine',
    description: 'Online magazine with article grid and breaking news',
    prompt: 'News magazine website with breaking news ticker, article grid by category, featured stories carousel, video section, trending topics, newsletter signup, and newspaper-style layout',
    icon: '📰',
    gradient: 'from-red-600 to-red-800'
  },
  {
    id: 'podcast',
    name: 'Podcast Website',
    description: 'Podcast site with episode player and show notes',
    prompt: 'Podcast website with latest episode player, episode list with descriptions, host bio, sponsors section, subscribe buttons for podcast platforms, and audio waveform design',
    icon: '🎙️',
    gradient: 'from-purple-600 to-purple-800'
  },
  {
    id: 'video-course',
    name: 'Online Course',
    description: 'Course landing page with curriculum and enrollment',
    prompt: 'Online course landing page with course overview video, curriculum outline, instructor bio, student testimonials, pricing with payment button, FAQ, and educational design',
    icon: '🎓',
    gradient: 'from-blue-600 to-indigo-700'
  },

  // Specialized
  {
    id: 'nonprofit',
    name: 'Nonprofit Organization',
    description: 'Charity website with donation form and impact stories',
    prompt: 'Nonprofit website with mission statement, donation form with suggested amounts, impact stories with photos, volunteer signup, upcoming events, annual report section, and inspiring design',
    icon: '❤️',
    gradient: 'from-pink-500 to-red-600'
  },
  {
    id: 'wedding',
    name: 'Wedding Website',
    description: 'Wedding site with RSVP, photos, and event details',
    prompt: 'Wedding website with couple story, event timeline and locations, RSVP form, photo gallery, registry links, accommodation info, countdown timer, and romantic elegant design',
    icon: '💑',
    gradient: 'from-pink-400 to-rose-600'
  },
  {
    id: 'dashboard',
    name: 'Analytics Dashboard',
    description: 'Data dashboard with charts, metrics, and filters',
    prompt: 'Analytics dashboard with sidebar navigation, KPI cards, line charts, bar graphs, data tables, date range picker, export buttons, and professional data visualization design',
    icon: '📊',
    gradient: 'from-cyan-600 to-blue-700'
  }
];

const TemplateGallery = ({ onTemplateSelect }) => {
  const [selectedCategory, setSelectedCategory] = React.useState('all');
  
  // Extract unique categories
  const categories = [
    { id: 'all', name: 'All Templates', count: templates.length },
    { id: 'business', name: 'Business & Marketing', count: 5 },
    { id: 'ecommerce', name: 'E-commerce & Retail', count: 3 },
    { id: 'professional', name: 'Professional Services', count: 4 },
    { id: 'creative', name: 'Creative & Portfolio', count: 3 },
    { id: 'forms', name: 'Forms & Tools', count: 3 },
    { id: 'content', name: 'Content & Media', count: 4 },
    { id: 'specialized', name: 'Specialized', count: 3 }
  ];
  
  // Map templates to categories
  const templateCategories = {
    'landing': 'business',
    'saas-startup': 'business',
    'restaurant': 'business',
    'real-estate': 'business',
    'fitness': 'business',
    'product-showcase': 'ecommerce',
    'online-store': 'ecommerce',
    'fashion-boutique': 'ecommerce',
    'consulting': 'professional',
    'law-firm': 'professional',
    'medical-clinic': 'professional',
    'dental-practice': 'professional',
    'portfolio': 'creative',
    'photography': 'creative',
    'agency': 'creative',
    'contact': 'forms',
    'survey': 'forms',
    'event-registration': 'forms',
    'blog': 'content',
    'news-magazine': 'content',
    'podcast': 'content',
    'video-course': 'content',
    'nonprofit': 'specialized',
    'wedding': 'specialized',
    'dashboard': 'specialized'
  };
  
  // Filter templates based on selected category
  const filteredTemplates = selectedCategory === 'all' 
    ? templates 
    : templates.filter(template => templateCategories[template.id] === selectedCategory);
  
  return (
    <div className="p-6">
      {/* Category Filter */}
      <div className="mb-8">
        <div className="flex flex-wrap gap-2 justify-center">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                selectedCategory === category.id
                  ? 'bg-blue-600 text-white shadow-lg scale-105'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {category.name} ({category.count})
            </button>
          ))}
        </div>
      </div>
      
      {/* Template Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTemplates.map((template) => (
          <button
            key={template.id}
            onClick={() => onTemplateSelect(template.prompt)}
            className="group relative overflow-hidden rounded-xl p-6 text-left transition-all duration-300 hover:scale-105 hover:shadow-2xl"
          >
            <div className={`absolute inset-0 bg-gradient-to-br ${template.gradient} opacity-90 transition-opacity duration-300 group-hover:opacity-100`} />
            <div className="relative z-10">
              <div className="text-4xl mb-3">{template.icon}</div>
              <h3 className="text-xl font-semibold text-white mb-2">
                {template.name}
              </h3>
              <p className="text-white/90 text-sm leading-relaxed">
                {template.description}
              </p>
            </div>
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/30 transform scale-x-0 transition-transform duration-300 group-hover:scale-x-100" />
          </button>
        ))}
      </div>
      
      {/* Results count */}
      <div className="mt-6 text-center text-sm text-gray-500">
        Showing {filteredTemplates.length} templates
      </div>
    </div>
  );
};

export default TemplateGallery;