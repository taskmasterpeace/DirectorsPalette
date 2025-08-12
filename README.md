# 🎬 Director's Palette (ImgPromptGen)

> AI-powered visual story and music video breakdown tool for directors, filmmakers, and creative professionals

[![Next.js](https://img.shields.io/badge/Next.js-15.2.4-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)](https://www.typescriptlang.org/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

## 📖 Overview

Director's Palette is a sophisticated web application that helps creative professionals generate detailed shot breakdowns for stories and music videos using AI. It applies director-specific visual styles to create professional, production-ready shot lists.

### ✨ Key Features

- **🎭 Dual Mode Operation**: Story mode for narrative films, Music Video mode for music productions
- **🎨 Director Styles**: 20+ curated director profiles (Kubrick, Nolan, Fincher, etc.) plus custom creation
- **📝 AI-Powered Generation**: Intelligent shot breakdowns with director-specific visual language
- **🎵 Music Video Tools**: Lyrics analysis, treatment generation, performance ratio optimization
- **👤 Artist Profiles**: Comprehensive artist management with visual preferences and brand identity
- **🔖 Reference System**: Smart tagging for locations, wardrobe, props with @mentions
- **💾 Session Persistence**: Auto-saves work with localStorage and IndexedDB
- **🎯 Additional Shots**: Generate extra coverage with specific categories (action, closeup, etc.)

## 🚀 Quick Start

### Prerequisites

- Node.js 18.0 or higher
- npm or pnpm package manager
- OpenAI API key (for AI generation features)

### Installation

```bash
# Clone the repository
git clone https://github.com/taskmasterpeace/ImgPromptGen.git
cd ImgPromptGen

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local and add your OpenAI API key:
# OPENAI_API_KEY=your-api-key-here

# Run development server
npm run dev
```

Visit `http://localhost:3000` to start using the application.

### Production Build

```bash
# Build for production
npm run build

# Start production server
npm run start
```

## 🎯 Usage

### Story Mode

1. **Enter Your Story**: Paste or type your narrative text
2. **Select Director**: Choose from curated directors or create custom style
3. **Configure Options**: 
   - Enable/disable camera movements
   - Include color palette descriptions
   - Add lighting details
4. **Generate Breakdown**: Get detailed shot-by-shot breakdown with director's visual style
5. **Add References**: Use @tags for consistent character/location references
6. **Generate Additional Shots**: Request specific coverage types

### Music Video Mode

1. **Input Song Details**: Add lyrics, artist name, genre
2. **Select Director**: Choose music video director style
3. **Configure Production**:
   - Set locations (@warehouse, @rooftop, etc.)
   - Define wardrobe (@streetwear, @formal, etc.)
   - Add props (@motorcycle, @neon_sign, etc.)
4. **Generate Treatments**: Get 3 unique video concepts
5. **Create Shot List**: Generate detailed breakdown per song section
6. **Adjust Performance Ratio**: Balance performance vs narrative shots

## 🏗️ Architecture

### Tech Stack

- **Framework**: Next.js 15.2.4 with App Router
- **Language**: TypeScript 5
- **UI Components**: React 19 + Tailwind CSS 4 + shadcn/ui
- **State Management**: Zustand with persist middleware
- **Database**: IndexedDB for local storage
- **AI Integration**: OpenAI GPT-4 via AI SDK
- **Styling**: Tailwind CSS with custom animations

### Project Structure

```
ImgPromptGen/
├── app/                    # Next.js App Router pages
│   ├── page.tsx           # Main application page
│   ├── actions/           # Server actions for AI operations
│   ├── artist-bank/       # Artist profile management
│   ├── director-library/  # Director profiles
│   └── projects/          # Project management
├── components/            # React components
│   ├── ui/               # shadcn/ui base components
│   ├── containers/       # Container components
│   ├── story/           # Story mode components
│   └── music-video/     # Music video components
├── hooks/                # Custom React hooks
│   ├── useSessionManagement.ts
│   ├── useStoryGeneration.ts
│   └── useMusicVideoGeneration.ts
├── lib/                  # Core business logic
│   ├── *-db.ts          # Database operations
│   ├── *-types.ts       # TypeScript definitions
│   └── prompts-mv.ts    # AI prompt templates
├── stores/              # Zustand state stores
│   ├── app-store.ts
│   ├── story-store.ts
│   └── music-video-store.ts
└── config/              # Configuration files
    └── constants.ts     # App constants
```

## 🎨 Director Styles

### Film Directors
- **Christopher Nolan**: IMAX, practical effects, non-linear narratives
- **Stanley Kubrick**: Symmetrical compositions, one-point perspective
- **David Fincher**: Dark, precise, digital cinematography
- **Terrence Malick**: Natural light, handheld, magic hour
- **Wong Kar-wai**: Neon colors, slow motion, urban melancholy

### Music Video Directors
- **Spike Jonze**: Surreal, playful, conceptual
- **Chris Cunningham**: Dark, visceral, technical innovation
- **Michel Gondry**: Handmade effects, whimsical, colorful
- **Hype Williams**: Fish-eye lens, vibrant colors, hip-hop aesthetic
- **David LaChapelle**: Hyper-saturated, pop art, theatrical

## 📚 API Reference

### Server Actions

#### `generateBreakdown(story, directorId, options)`
Generate story breakdown with director style
- `story`: Story text
- `directorId`: Director profile ID
- `options`: Camera, color, lighting preferences

#### `generateFullMusicVideoBreakdown(params)`
Generate complete music video treatment
- `params.lyrics`: Song lyrics
- `params.directorId`: Director style
- `params.config`: Production configuration

#### `generateAdditionalShots(params)`
Generate extra coverage shots
- `params.categories`: Shot types needed
- `params.customRequest`: Specific requirements

## 🔧 Configuration

### Environment Variables

```env
# Required
OPENAI_API_KEY=your-openai-api-key

# Optional
NEXT_PUBLIC_APP_URL=http://localhost:3000
ENABLE_RATE_LIMITING=true
MAX_REQUESTS_PER_MINUTE=60
```

### Customization

Edit `config/constants.ts` to modify:
- Default prompt templates
- Shot categories
- Director style attributes
- UI configuration

## 🧪 Testing

```bash
# Run test suite
node run-feature-tests.js

# Test specific features
node comprehensive-feature-test.js
```

### Test Coverage
- ✅ Camera movement controls
- ✅ Director style variations
- ✅ Reference system (@tags)
- ✅ Additional shots generation
- ✅ Session persistence
- ✅ Error boundaries

## 🚢 Deployment

### Vercel (Recommended)

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/taskmasterpeace/ImgPromptGen)

1. Click the deploy button
2. Add your `OPENAI_API_KEY` in environment variables
3. Deploy

### Manual Deployment

```bash
# Build the application
npm run build

# Start production server
npm run start
```

### Docker

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

## 🐛 Troubleshooting

### Common Issues

#### "Module not found: fs/promises"
This warning is harmless and occurs because Next.js tries to bundle server-only modules. The app handles this gracefully with fallbacks.

#### "Maximum update depth exceeded"
Fixed in latest version. Update to the latest commit if experiencing this issue.

#### Build fails on Vercel
Ensure all environment variables are set in Vercel dashboard, particularly `OPENAI_API_KEY`.

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines

- Follow existing code style
- Add tests for new features
- Update documentation
- Ensure build passes

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) - React framework
- [shadcn/ui](https://ui.shadcn.com/) - UI components
- [OpenAI](https://openai.com/) - AI capabilities
- [Zustand](https://github.com/pmndrs/zustand) - State management
- [Tailwind CSS](https://tailwindcss.com/) - Styling

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/taskmasterpeace/ImgPromptGen/issues)
- **Discussions**: [GitHub Discussions](https://github.com/taskmasterpeace/ImgPromptGen/discussions)
- **Email**: support@directorpalette.com

## 🚀 Roadmap

- [ ] Export to PDF/Final Draft format
- [ ] Storyboard image generation
- [ ] Team collaboration features
- [ ] Mobile app development
- [ ] Integration with production tools
- [ ] Custom prompt library management
- [ ] Multi-language support
- [ ] Video reference library

---

<p align="center">Built with ❤️ by creative professionals for creative professionals</p>