export const componentTemplates = {
  buttons: {
    name: 'Buttons',
    icon: '🔘',
    components: [
      {
        id: 'primary-button',
        name: 'Primary Button',
        category: 'buttons',
        preview: '🟦',
        code: `<button className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors duration-200 shadow-md hover:shadow-lg">
  Click Me
</button>`
      },
      {
        id: 'ghost-button',
        name: 'Ghost Button',
        category: 'buttons',
        preview: '⬜',
        code: `<button className="px-6 py-3 border-2 border-gray-800 hover:bg-gray-800 hover:text-white text-gray-800 font-medium rounded-lg transition-all duration-200">
  Learn More
</button>`
      },
      {
        id: 'gradient-button',
        name: 'Gradient Button',
        category: 'buttons',
        preview: '🌈',
        code: `<button className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-medium rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5">
  Get Started
</button>`
      }
    ]
  },
  forms: {
    name: 'Forms',
    icon: '📝',
    components: [
      {
        id: 'contact-form',
        name: 'Contact Form',
        category: 'forms',
        preview: '📧',
        code: `<form className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-lg">
  <h2 className="text-2xl font-bold text-gray-800 mb-6">Contact Us</h2>
  
  <div className="mb-4">
    <label className="block text-gray-700 text-sm font-medium mb-2" htmlFor="name">
      Name
    </label>
    <input
      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      id="name"
      type="text"
      placeholder="Your Name"
    />
  </div>
  
  <div className="mb-4">
    <label className="block text-gray-700 text-sm font-medium mb-2" htmlFor="email">
      Email
    </label>
    <input
      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      id="email"
      type="email"
      placeholder="your@email.com"
    />
  </div>
  
  <div className="mb-6">
    <label className="block text-gray-700 text-sm font-medium mb-2" htmlFor="message">
      Message
    </label>
    <textarea
      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      id="message"
      rows="4"
      placeholder="Your message..."
    ></textarea>
  </div>
  
  <button
    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200"
    type="submit"
  >
    Send Message
  </button>
</form>`
      },
      {
        id: 'login-form',
        name: 'Login Form',
        category: 'forms',
        preview: '🔐',
        code: `<div className="max-w-sm mx-auto p-6 bg-white rounded-xl shadow-lg">
  <h2 className="text-2xl font-bold text-center text-gray-800 mb-8">Welcome Back</h2>
  
  <form>
    <div className="mb-4">
      <label className="block text-gray-700 text-sm font-medium mb-2" htmlFor="email">
        Email Address
      </label>
      <input
        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
        id="email"
        type="email"
        placeholder="Enter your email"
      />
    </div>
    
    <div className="mb-6">
      <label className="block text-gray-700 text-sm font-medium mb-2" htmlFor="password">
        Password
      </label>
      <input
        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
        id="password"
        type="password"
        placeholder="Enter your password"
      />
    </div>
    
    <div className="flex items-center justify-between mb-6">
      <label className="flex items-center">
        <input type="checkbox" className="mr-2" />
        <span className="text-sm text-gray-600">Remember me</span>
      </label>
      <a href="#" className="text-sm text-indigo-600 hover:text-indigo-800">
        Forgot password?
      </a>
    </div>
    
    <button
      className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200"
      type="submit"
    >
      Sign In
    </button>
  </form>
  
  <p className="text-center text-sm text-gray-600 mt-6">
    Don't have an account? 
    <a href="#" className="text-indigo-600 hover:text-indigo-800 ml-1">Sign up</a>
  </p>
</div>`
      },
      {
        id: 'newsletter-form',
        name: 'Newsletter Form',
        category: 'forms',
        preview: '📬',
        code: `<div className="max-w-xl mx-auto p-8 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl shadow-xl">
  <div className="text-center">
    <h3 className="text-2xl font-bold text-white mb-2">Stay Updated</h3>
    <p className="text-purple-100 mb-6">Get the latest news and updates delivered to your inbox</p>
  </div>
  
  <form className="flex flex-col sm:flex-row gap-3">
    <input
      type="email"
      placeholder="Enter your email"
      className="flex-1 px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-white"
    />
    <button
      type="submit"
      className="px-6 py-3 bg-white text-purple-600 font-semibold rounded-lg hover:bg-gray-100 transition-colors duration-200"
    >
      Subscribe
    </button>
  </form>
  
  <p className="text-center text-purple-100 text-sm mt-4">
    We respect your privacy. Unsubscribe at any time.
  </p>
</div>`
      }
    ]
  },
  cards: {
    name: 'Cards',
    icon: '🎴',
    components: [
      {
        id: 'feature-card',
        name: 'Feature Card',
        category: 'cards',
        preview: '✨',
        code: `<div className="max-w-sm p-6 bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300">
  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
    <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
    </svg>
  </div>
  
  <h3 className="text-xl font-semibold text-gray-800 mb-2">Lightning Fast</h3>
  <p className="text-gray-600">
    Experience blazing fast performance with our optimized infrastructure and cutting-edge technology.
  </p>
  
  <a href="#" className="inline-flex items-center text-blue-600 hover:text-blue-800 mt-4 font-medium">
    Learn more
    <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
    </svg>
  </a>
</div>`
      },
      {
        id: 'testimonial-card',
        name: 'Testimonial Card',
        category: 'cards',
        preview: '💬',
        code: `<div className="max-w-md p-6 bg-white rounded-xl shadow-lg">
  <div className="flex items-center mb-4">
    <img
      className="w-12 h-12 rounded-full object-cover"
      src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150"
      alt="Customer"
    />
    <div className="ml-4">
      <h4 className="text-lg font-semibold text-gray-800">Sarah Johnson</h4>
      <p className="text-gray-600 text-sm">CEO at TechCorp</p>
    </div>
  </div>
  
  <div className="mb-4">
    <div className="flex text-yellow-400">
      <svg className="w-5 h-5 fill-current" viewBox="0 0 20 20">
        <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z"/>
      </svg>
      <svg className="w-5 h-5 fill-current" viewBox="0 0 20 20">
        <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z"/>
      </svg>
      <svg className="w-5 h-5 fill-current" viewBox="0 0 20 20">
        <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z"/>
      </svg>
      <svg className="w-5 h-5 fill-current" viewBox="0 0 20 20">
        <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z"/>
      </svg>
      <svg className="w-5 h-5 fill-current" viewBox="0 0 20 20">
        <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z"/>
      </svg>
    </div>
  </div>
  
  <p className="text-gray-700 italic">
    "This product has completely transformed how we handle our business operations. The efficiency gains have been remarkable!"
  </p>
</div>`
      },
      {
        id: 'pricing-card',
        name: 'Pricing Card',
        category: 'cards',
        preview: '💰',
        code: `<div className="max-w-sm p-8 bg-white rounded-xl shadow-lg border-2 border-purple-500">
  <div className="text-center">
    <h3 className="text-2xl font-bold text-gray-800">Pro Plan</h3>
    <p className="text-gray-600 mt-2">Perfect for growing businesses</p>
    
    <div className="mt-6">
      <span className="text-4xl font-bold text-gray-800">$49</span>
      <span className="text-gray-600">/month</span>
    </div>
  </div>
  
  <ul className="mt-8 space-y-4">
    <li className="flex items-start">
      <svg className="w-5 h-5 text-green-500 mr-3 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
      </svg>
      <span className="text-gray-700">Unlimited projects</span>
    </li>
    <li className="flex items-start">
      <svg className="w-5 h-5 text-green-500 mr-3 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
      </svg>
      <span className="text-gray-700">Priority support</span>
    </li>
    <li className="flex items-start">
      <svg className="w-5 h-5 text-green-500 mr-3 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
      </svg>
      <span className="text-gray-700">Advanced analytics</span>
    </li>
  </ul>
  
  <button className="w-full mt-8 px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg transition-colors duration-200">
    Get Started
  </button>
</div>`
      }
    ]
  },
  navigation: {
    name: 'Navigation',
    icon: '🧭',
    components: [
      {
        id: 'navbar',
        name: 'Navigation Bar',
        category: 'navigation',
        preview: '📍',
        code: `<nav className="bg-white shadow-lg">
  <div className="max-w-6xl mx-auto px-4">
    <div className="flex justify-between items-center py-4">
      <div className="flex items-center">
        <a href="#" className="font-bold text-xl text-gray-800">YourBrand</a>
      </div>
      
      <div className="hidden md:flex items-center space-x-8">
        <a href="#" className="text-gray-700 hover:text-blue-600 transition-colors duration-200">Home</a>
        <a href="#" className="text-gray-700 hover:text-blue-600 transition-colors duration-200">About</a>
        <a href="#" className="text-gray-700 hover:text-blue-600 transition-colors duration-200">Services</a>
        <a href="#" className="text-gray-700 hover:text-blue-600 transition-colors duration-200">Contact</a>
        <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200">
          Get Started
        </button>
      </div>
      
      <div className="md:hidden">
        <button className="outline-none mobile-menu-button">
          <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </div>
    </div>
  </div>
</nav>`
      },
      {
        id: 'breadcrumb',
        name: 'Breadcrumb',
        category: 'navigation',
        preview: '🍞',
        code: `<nav className="flex" aria-label="Breadcrumb">
  <ol className="inline-flex items-center space-x-1 md:space-x-3">
    <li className="inline-flex items-center">
      <a href="#" className="inline-flex items-center text-sm font-medium text-gray-700 hover:text-blue-600">
        <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
          <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z"/>
        </svg>
        Home
      </a>
    </li>
    <li>
      <div className="flex items-center">
        <svg className="w-6 h-6 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd"/>
        </svg>
        <a href="#" className="ml-1 text-sm font-medium text-gray-700 hover:text-blue-600 md:ml-2">Products</a>
      </div>
    </li>
    <li aria-current="page">
      <div className="flex items-center">
        <svg className="w-6 h-6 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd"/>
        </svg>
        <span className="ml-1 text-sm font-medium text-gray-500 md:ml-2">Current Page</span>
      </div>
    </li>
  </ol>
</nav>`
      },
      {
        id: 'tabs',
        name: 'Tab Navigation',
        category: 'navigation',
        preview: '📑',
        code: `<div className="border-b border-gray-200">
  <nav className="-mb-px flex space-x-8" aria-label="Tabs">
    <a href="#" className="border-b-2 border-blue-500 py-2 px-1 text-sm font-medium text-blue-600">
      Profile
    </a>
    <a href="#" className="border-b-2 border-transparent py-2 px-1 text-sm font-medium text-gray-500 hover:text-gray-700 hover:border-gray-300">
      Settings
    </a>
    <a href="#" className="border-b-2 border-transparent py-2 px-1 text-sm font-medium text-gray-500 hover:text-gray-700 hover:border-gray-300">
      Notifications
    </a>
    <a href="#" className="border-b-2 border-transparent py-2 px-1 text-sm font-medium text-gray-500 hover:text-gray-700 hover:border-gray-300">
      Billing
    </a>
  </nav>
</div>`
      }
    ]
  },
  heroes: {
    name: 'Hero Sections',
    icon: '🦸',
    components: [
      {
        id: 'hero-centered',
        name: 'Centered Hero',
        category: 'heroes',
        preview: '🎯',
        code: `<section className="bg-gradient-to-br from-blue-50 to-indigo-100 py-20">
  <div className="max-w-4xl mx-auto px-4 text-center">
    <h1 className="text-5xl font-bold text-gray-800 mb-6">
      Build Something Amazing Today
    </h1>
    <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
      Transform your ideas into reality with our powerful platform. Start building in minutes, not hours.
    </p>
    <div className="flex flex-col sm:flex-row gap-4 justify-center">
      <button className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors duration-200 shadow-lg">
        Get Started Free
      </button>
      <button className="px-8 py-3 bg-white hover:bg-gray-50 text-gray-800 font-medium rounded-lg transition-colors duration-200 shadow-lg">
        Watch Demo
      </button>
    </div>
  </div>
</section>`
      },
      {
        id: 'hero-split',
        name: 'Split Hero',
        category: 'heroes',
        preview: '↔️',
        code: `<section className="bg-white py-20">
  <div className="max-w-6xl mx-auto px-4">
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
      <div>
        <h1 className="text-4xl lg:text-5xl font-bold text-gray-800 mb-6">
          Your Success Story Starts Here
        </h1>
        <p className="text-lg text-gray-600 mb-8">
          Join thousands of businesses that trust our platform to power their growth. Get started in minutes with our intuitive tools.
        </p>
        <div className="flex flex-col sm:flex-row gap-4">
          <button className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition-colors duration-200">
            Start Free Trial
          </button>
          <button className="px-6 py-3 border-2 border-gray-300 hover:border-gray-400 text-gray-700 font-medium rounded-lg transition-colors duration-200">
            Learn More
          </button>
        </div>
      </div>
      <div className="relative">
        <img 
          src="https://images.unsplash.com/photo-1551434678-e076c223a692?w=600&h=400&fit=crop" 
          alt="Hero" 
          className="rounded-lg shadow-2xl"
        />
        <div className="absolute -bottom-6 -left-6 w-72 h-72 bg-indigo-100 rounded-lg -z-10"></div>
      </div>
    </div>
  </div>
</section>`
      },
      {
        id: 'hero-video',
        name: 'Video Hero',
        category: 'heroes',
        preview: '🎬',
        code: `<section className="relative bg-gray-900 h-screen flex items-center">
  <div className="absolute inset-0 overflow-hidden">
    <video 
      className="w-full h-full object-cover opacity-30"
      autoPlay
      loop
      muted
    >
      <source src="https://www.w3schools.com/html/mov_bbb.mp4" type="video/mp4" />
    </video>
  </div>
  
  <div className="relative z-10 max-w-4xl mx-auto px-4 text-center">
    <h1 className="text-5xl lg:text-6xl font-bold text-white mb-6">
      Experience the Future
    </h1>
    <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
      Revolutionary technology meets exceptional design. Discover what's possible when innovation has no limits.
    </p>
    <button className="px-8 py-4 bg-white hover:bg-gray-100 text-gray-900 font-semibold rounded-lg transition-colors duration-200 shadow-xl">
      Explore Now
    </button>
  </div>
</section>`
      }
    ]
  }
}

// Helper function to get all components as a flat array
export const getAllComponents = () => {
  const allComponents = []
  Object.values(componentTemplates).forEach(category => {
    allComponents.push(...category.components)
  })
  return allComponents
}

// Helper function to search components
export const searchComponents = (query) => {
  const lowercaseQuery = query.toLowerCase()
  const allComponents = getAllComponents()
  
  return allComponents.filter(component => 
    component.name.toLowerCase().includes(lowercaseQuery) ||
    component.category.toLowerCase().includes(lowercaseQuery) ||
    component.code.toLowerCase().includes(lowercaseQuery)
  )
}