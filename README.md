# Director's Palette
## AI-Powered Content Creation Platform
### A Machine King Labs Research Project

![Director's Palette](https://img.shields.io/badge/Research%20Project-Machine%20King%20Labs-blue?style=for-the-badge)
![Status](https://img.shields.io/badge/Status-Active%20Development-green?style=for-the-badge)
![License](https://img.shields.io/badge/License-Open%20Source-orange?style=for-the-badge)

---

## 🔬 **Research Mission**

**Machine King Labs** is an AI research laboratory dedicated to exploring the intersection of artificial intelligence and human creativity. **Director's Palette** represents our investigation into how AI can augment and enhance the creative process in storytelling, visual production, and content creation.

### **What We're Researching**
- **AI-Driven Narrative Analysis** - How AI can break down stories into visual components
- **Director-Specific Style Modeling** - Capturing unique directorial voices in AI generation
- **Multi-Modal Content Workflows** - Seamless integration of text, visual, and production elements
- **Human-AI Creative Collaboration** - Optimal patterns for AI-assisted creative work

### **Why Open Source?**
We believe the future of AI creativity tools should be **open, collaborative, and accessible**. This research platform is our contribution to the global creative community, and we invite developers, researchers, filmmakers, and creators to build upon our work.

---

## 🎬 **What Director's Palette Does**

Director's Palette transforms creative concepts into professional, production-ready shot lists using AI-powered director-specific styling. It bridges the gap between creative vision and practical production planning.

### **Core Capabilities**

#### 📚 **Story Mode**
Transform written stories into cinematic shot lists with director-specific styling.

**Features:**
- **AI Story Analysis** - Extracts characters, locations, and props automatically
- **Director Style Application** - Choose from Nolan, Tarantino, Fincher, Gerwig, and more
- **Reference Extraction** - Identifies story elements for consistent representation
- **Professional Export** - Generate production-ready shot lists

**Example Workflow:**
```
Story Input → Reference Extraction → Director Selection → Shot Generation → Export
```

#### 🎵 **Music Video Mode**  
Create comprehensive music video breakdowns with artist integration and visual storytelling.

**Features:**
- **Lyric Structure Analysis** - AI breaks down songs into visual sections
- **Artist Bank Integration** - Detailed artist profiles with visual descriptions
- **@artist Variable System** - Flexible artist representation (name vs description)
- **Music Video Director Styles** - Hype Williams, Michel Gondry, Spike Jonze, and more

**Example Workflow:**
```
Lyrics + Artist → Video Concept → Director Style → Section Generation → Export
```

#### 🖼️ **Post Production**
Generate reference images and manage visual assets for production.

**Features:**
- **Gen4 Image Generation** - Create reference images from text prompts
- **Reference Library** - Organize and manage visual assets
- **Shot Queue Management** - Process shots from Story/Music Video modes
- **Template-Based Prompts** - Use structured prompts for consistent results

#### 🎯 **Export System**
Professional export capabilities with advanced formatting and template support.

**Features:**
- **Bulk Export** - Export all shots with custom prefix/suffix formatting
- **Multiple Formats** - Text, numbered lists, JSON, CSV
- **Export Templates** - Pre-built formatting for different production needs
- **Variable Processing** - Smart @artist and @director replacement

---

## 🚀 **Getting Started**

### **Prerequisites**
- Node.js 18+ 
- npm or yarn
- OpenAI API key (for AI generation)
- Replicate API key (for image generation, optional)

### **Installation**

```bash
# Clone the repository
git clone https://github.com/taskmasterpeace/ImgPromptGen.git
cd ImgPromptGen

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Add your API keys to .env.local

# Run development server
npm run dev
```

### **Environment Variables**
```env
# Required for AI story/music video generation
OPENAI_API_KEY=sk-your-openai-key-here

# Optional for image generation
REPLICATE_API_TOKEN=r8-your-replicate-token-here

# Application configuration
NEXT_PUBLIC_APP_NAME=Director's Palette
```

### **Quick Start Guide**

#### **Generate Your First Story Shot List (5 minutes)**
1. **Enter a story** in the Story Mode textarea
2. **Select a director** (try Christopher Nolan or David Fincher)
3. **Click "Extract Story References"** to identify characters and locations
4. **Review and configure** extracted elements
5. **Generate shots** and review the results
6. **Export all shots** with professional formatting

#### **Create Your First Music Video (7 minutes)**
1. **Switch to Music Video mode**
2. **Enter song lyrics** (or use a sample template)
3. **Add artist information** from Artist Bank
4. **Include visual description** for the artist
5. **Generate video breakdown** and review sections
6. **Toggle between @artist and description views**
7. **Export all shots** with music video formatting

---

## 🧪 **Research Features**

### **AI-Powered Generation**
- **GPT-4 Integration** for intelligent content analysis and generation
- **Director-Specific Prompting** with carefully crafted style guidelines
- **Context-Aware Generation** that maintains consistency across shots
- **Multi-Stage Processing** for complex creative workflows

### **Template & Variable System**
- **Smart Templates** for rapid content creation and testing
- **Variable Replacement** with @artist, @director, @location tags
- **Export Templates** for professional formatting consistency
- **Prompt Templates** for image generation with tag replacement

### **Professional Workflows**
- **Bulk Operations** for production-scale projects
- **Multiple Export Formats** for different team members
- **Cross-Browser Compatibility** with clipboard and file operations
- **Mobile-Responsive Design** for field work and remote collaboration

---

## 🛠️ **Technical Architecture**

### **Built With**
- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript 5
- **UI**: React 19 + Tailwind CSS 4 + shadcn/ui
- **State Management**: Zustand with persistence
- **Database**: IndexedDB (browser-based)
- **AI**: OpenAI GPT-4 via AI SDK
- **Image Generation**: Replicate API

### **Key Components**
- **`/app`** - Next.js App Router with server actions
- **`/components`** - Modular React components with TypeScript
- **`/lib`** - Core business logic and utilities
- **`/stores`** - Zustand state management stores
- **`/hooks`** - Custom React hooks for common operations

### **Research-Focused Architecture**
- **Modular Design** - Easy to extend and experiment with
- **Comprehensive Testing** - Unit, integration, and functionality tests
- **Flexible Configuration** - Adaptable to different research directions
- **Open Standards** - Uses standard formats and protocols

---

## 📊 **Current Research Status**

### **Completed Research Areas** ✅
- **Director Style Modeling** - Successfully implemented 15+ director styles
- **Narrative Structure Analysis** - AI accurately breaks down stories into chapters
- **Music Video Generation** - Complete lyric-to-visual mapping system
- **Variable-Based Templating** - Flexible artist and element representation
- **Professional Export Workflows** - Production-ready output formats

### **Active Research Areas** 🔬
- **Artist Visual Consistency** - Maintaining character appearance across shots
- **Cross-Modal Generation** - Integrating text, image, and audio generation
- **Collaborative AI Workflows** - Multi-user creative sessions with AI
- **Template Learning** - AI learns from successful user templates
- **Performance Optimization** - Scaling to larger projects and teams

### **Future Research Directions** 🔮
- **Real-Time Collaboration** - Live multi-user editing with AI assistance
- **Advanced Image Generation** - Consistent character appearance across multiple images
- **Production Integration** - Direct export to professional video editing tools
- **Community Learning** - AI learns from open source community contributions
- **Multi-Language Support** - International creative collaboration

---

## 🤝 **Contributing to the Research**

We welcome contributions from researchers, developers, and creative professionals!

### **Ways to Contribute**
- **Code Contributions** - Features, bug fixes, performance improvements
- **Research Insights** - Share findings about AI-assisted creativity
- **Template Libraries** - Contribute story, music video, and export templates
- **Documentation** - Improve guides, add examples, translate content
- **Testing** - Help us test with real creative projects
- **Community Building** - Help others learn and use the platform

### **Getting Involved**
1. **Read our [Contributing Guide](CONTRIBUTING.md)**
2. **Check the [Development Setup](DEVELOPMENT.md)**
3. **Browse [Open Issues](https://github.com/taskmasterpeace/ImgPromptGen/issues)**
4. **Join our [Research Discussions](https://github.com/taskmasterpeace/ImgPromptGen/discussions)**

---

## 📈 **Research Impact & Metrics**

### **Platform Capabilities**
- **15+ Director Styles** implemented with unique characteristics
- **3 Major Workflow Modes** (Story, Music Video, Post Production)
- **100+ Professional Templates** for rapid content creation
- **4 Export Formats** supporting different production needs
- **Mobile-Responsive Design** for modern creative workflows

### **Technical Achievements**
- **Sub-second Export Processing** for production-scale projects
- **Cross-Browser Compatibility** with comprehensive fallbacks
- **Comprehensive Test Coverage** ensuring reliability
- **Professional Documentation** for contributor onboarding
- **Modular Architecture** enabling rapid feature development

---

## 📋 **Usage Examples**

### **Film Production**
```bash
# Generate professional shot list for indie film
Story: "Detective thriller with psychological elements"
Director: David Fincher
Export: Numbered list with technical specifications
Result: Production-ready shot list with crew requirements
```

### **Music Video Creation**
```bash
# Create music video breakdown for hip-hop track
Artist: Jay-Z (from Artist Bank)
Lyrics: [Verse/Chorus structure]
Director: Hype Williams
Export: JSON format with metadata for video team
```

### **Content Creator Workflow**
```bash
# Quick social media content planning
Template: "Hip-Hop Urban Vibe" 
Customization: Local artist and locations
Export: Social media optimized shot descriptions
Distribution: Instagram, TikTok, YouTube Shorts
```

---

## 🏢 **About Machine King Labs**

**Machine King Labs** is an AI research laboratory focused on practical applications of artificial intelligence in creative industries. Our research spans:

- **Creative AI Tools** - Platforms that enhance human creativity
- **Content Generation Systems** - Multi-modal AI for media production  
- **Human-AI Collaboration** - Optimizing creative partnerships with AI
- **Open Source Research** - Democratizing access to AI creativity tools

### **Our Research Philosophy**
We believe AI should **augment human creativity**, not replace it. Our tools are designed to handle the technical and repetitive aspects of creative work, freeing humans to focus on vision, emotion, and artistic expression.

### **Contact & Collaboration**
- **Research Inquiries**: research@machinekings.labs
- **Technical Support**: support@directorpalette.com
- **Community**: [GitHub Discussions](https://github.com/taskmasterpeace/ImgPromptGen/discussions)
- **Documentation**: [Complete Guides](docs/)

---

## 📄 **License**

This project is open source and available under the [MIT License](LICENSE).

### **Attribution**
When using Director's Palette in your projects or research, please include:
```
Powered by Director's Palette - Machine King Labs Research Project
https://github.com/taskmasterpeace/ImgPromptGen
```

---

## 🙏 **Acknowledgments**

- **OpenAI** for GPT-4 technology enabling intelligent content generation
- **Replicate** for image generation infrastructure
- **Vercel** for hosting and deployment platform
- **shadcn/ui** for beautiful, accessible UI components
- **The Open Source Community** for inspiring collaborative development

---

## 🔗 **Links & Resources**

- **📖 [Complete User Guide](DIRECTOR-PALETTE-GUIDE.md)** - Comprehensive application documentation
- **🧑‍💻 [Developer Reference](DEVELOPER-REFERENCE.md)** - Technical architecture and APIs
- **🎓 [Step-by-Step Tutorial](USER-WIZARD-GUIDE.md)** - Beginner-friendly walkthrough
- **🧪 [Research Documentation](docs/research/)** - Academic papers and findings
- **🤝 [Contributing Guidelines](CONTRIBUTING.md)** - How to contribute to the project
- **🐛 [Issue Tracker](https://github.com/taskmasterpeace/ImgPromptGen/issues)** - Bug reports and feature requests

---

**Built with ❤️ by the Machine King Labs Research Team**

*Director's Palette - Where AI meets human creativity*