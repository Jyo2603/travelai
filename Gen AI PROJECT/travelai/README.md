# 🌍 TravelAI - AI-Powered Travel Planning Application

An intelligent travel planning application that leverages AI to provide personalized travel recommendations, itinerary generation, and real-time travel assistance.

![TravelAI Banner](https://via.placeholder.com/800x200/4F46E5/FFFFFF?text=TravelAI+-+Smart+Travel+Planning)

## ✨ Features

### 🤖 AI-Powered Recommendations
- **Personalized Destinations**: Get travel suggestions based on your preferences, budget, and travel style
- **Smart Itinerary Generation**: AI creates detailed day-by-day itineraries with activities, restaurants, and attractions
- **Intelligent Chat Assistant**: Real-time travel advice and recommendations through conversational AI

### 🎯 User Experience
- **Modern Glass-Morphism UI**: Beautiful, responsive design with Tailwind CSS
- **User Onboarding**: Comprehensive preference collection for personalized experiences
- **Profile Management**: Save and manage your travel preferences and history
- **Multi-Platform Support**: Works seamlessly on desktop, tablet, and mobile devices

### 🔧 Technical Features
- **Vector Database**: Advanced user profiling and similarity matching
- **LangChain Integration**: Sophisticated AI conversation management
- **Real-time Processing**: Instant recommendations and chat responses
- **Secure Authentication**: User account management and data protection

## 🚀 Tech Stack

- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS with custom glass-morphism components
- **AI/ML**: OpenAI GPT-4, LangChain
- **State Management**: Zustand
- **Routing**: React Router DOM
- **Authentication**: Firebase Auth (configured)
- **Database**: Vector embeddings with localStorage persistence
- **Build Tool**: Vite with TypeScript support

## 📋 Prerequisites

Before running this application, make sure you have:

- **Node.js** (v16 or higher)
- **npm** or **yarn** package manager
- **OpenAI API Key** (for AI features)
- **Git** (for version control)

## ⚡ Quick Start

### 1. Clone the Repository
```bash
git clone https://github.com/Jyo2603/travelai.git
cd travelai
```

### 2. Install Dependencies
```bash
npm install
# or
yarn install
```

### 3. Environment Setup
Create a `.env` file in the root directory:
```env
VITE_OPENAI_API_KEY=your_openai_api_key_here
VITE_APP_NAME=TravelAI
```

### 4. Start Development Server
```bash
npm run dev
# or
yarn dev
```

The application will be available at `http://localhost:5173`

## 🔧 Configuration

### OpenAI API Setup
1. Visit [OpenAI Platform](https://platform.openai.com/)
2. Create an account and generate an API key
3. Add your API key to the `.env` file
4. Ensure you have sufficient credits for API usage

### Firebase Setup (Optional)
If you want to use Firebase authentication:
1. Create a Firebase project
2. Enable Authentication
3. Add your Firebase config to `src/config/firebase.ts`

## 📱 Usage

### Getting Started
1. **Landing Page**: Introduction to TravelAI features
2. **Sign Up/Login**: Create your account or sign in
3. **Onboarding**: Complete your travel preferences
4. **Dashboard**: View personalized recommendations
5. **Chat Assistant**: Get real-time travel advice
6. **Itinerary Planning**: Generate detailed travel plans

### Key Features Usage

#### 🎯 Personalized Recommendations
- Complete the onboarding process with your preferences
- View AI-generated destination suggestions on the dashboard
- Filter recommendations by budget, duration, and interests

#### 💬 AI Chat Assistant
- Click the chat icon to open the AI assistant
- Ask questions about destinations, activities, or travel tips
- Get contextual responses based on your profile and preferences

#### 📅 Itinerary Generation
- Select a destination from recommendations
- AI generates a detailed day-by-day itinerary
- Includes activities, restaurants, attractions, and local insights

## 🏗️ Project Structure

```
travelai/
├── public/                 # Static assets
├── src/
│   ├── components/         # Reusable UI components
│   ├── pages/             # Application pages
│   ├── services/          # AI and backend services
│   │   ├── langchainService.ts    # LangChain AI integration
│   │   ├── authService.ts         # Authentication service
│   │   └── ...
│   ├── hooks/             # Custom React hooks
│   ├── types/             # TypeScript type definitions
│   ├── utils/             # Helper functions
│   ├── state/             # State management
│   └── config/            # Configuration files
├── .env.example           # Environment variables template
├── package.json           # Dependencies and scripts
└── README.md             # Project documentation
```

## 🔑 Environment Variables

Create a `.env` file with the following variables:

```env
# Required
VITE_OPENAI_API_KEY=your_openai_api_key

# Optional
VITE_APP_NAME=TravelAI
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
```

## 🚀 Deployment

### Vercel (Recommended)
1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy automatically

### Netlify
1. Build the project: `npm run build`
2. Deploy the `dist` folder to Netlify
3. Configure environment variables

### Manual Deployment
```bash
npm run build
# Upload the dist/ folder to your hosting provider
```

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

### Development Guidelines
- Follow TypeScript best practices
- Use Tailwind CSS for styling
- Write meaningful commit messages
- Test your changes thoroughly
- Update documentation as needed

## 📝 Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint
npm run type-check   # Run TypeScript checks
```

## 🐛 Troubleshooting

### Common Issues

**API Key Issues**
- Ensure your OpenAI API key is valid and has sufficient credits
- Check that the environment variable is properly set
- Verify the API key format (starts with 'sk-')

**Build Errors**
- Clear node_modules and reinstall: `rm -rf node_modules && npm install`
- Check Node.js version compatibility
- Ensure all environment variables are set

**AI Features Not Working**
- Verify OpenAI API key is configured
- Check browser console for error messages
- Ensure you have internet connectivity

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **OpenAI** for providing the GPT-4 API
- **LangChain** for AI conversation management
- **Tailwind CSS** for the beautiful UI framework
- **React Team** for the amazing frontend framework

## 📞 Support

If you have any questions or need help:

- 📧 Email: [your-email@example.com]
- 🐛 Issues: [GitHub Issues](https://github.com/Jyo2603/travelai/issues)
- 💬 Discussions: [GitHub Discussions](https://github.com/Jyo2603/travelai/discussions)

---

**Made with ❤️ by [Jyo2603](https://github.com/Jyo2603)**

⭐ If you found this project helpful, please give it a star on GitHub!
