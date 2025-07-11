import React from 'react';

const templates = [
  {
    id: 'landing',
    name: 'Landing Page',
    description: 'Modern landing page with hero section, features grid, and call-to-action',
    prompt: 'Modern landing page with hero section, features grid, and call-to-action',
    icon: '🚀',
    gradient: 'from-blue-500 to-purple-600'
  },
  {
    id: 'contact',
    name: 'Contact Form',
    description: 'Contact form with name, email, message fields and submit button',
    prompt: 'Contact form with name, email, message fields and submit button',
    icon: '📧',
    gradient: 'from-green-500 to-teal-600'
  },
  {
    id: 'dashboard',
    name: 'Dashboard',
    description: 'Admin dashboard with sidebar navigation and stats cards',
    prompt: 'Admin dashboard with sidebar navigation and stats cards',
    icon: '📊',
    gradient: 'from-orange-500 to-red-600'
  },
  {
    id: 'blog',
    name: 'Blog Layout',
    description: 'Blog homepage with post cards showing title, excerpt, and read more',
    prompt: 'Blog homepage with post cards showing title, excerpt, and read more',
    icon: '📝',
    gradient: 'from-pink-500 to-rose-600'
  },
  {
    id: 'portfolio',
    name: 'Portfolio',
    description: 'Portfolio page with project grid and modal previews',
    prompt: 'Portfolio page with project grid and modal previews',
    icon: '🎨',
    gradient: 'from-indigo-500 to-blue-600'
  }
];

const TemplateGallery = ({ onTemplateSelect }) => {
  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Choose a Template</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {templates.map((template) => (
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
    </div>
  );
};

export default TemplateGallery;