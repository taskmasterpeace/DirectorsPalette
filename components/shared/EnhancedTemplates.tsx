'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { 
  BookOpen, 
  Music, 
  Briefcase, 
  Palette,
  Zap,
  Sparkles,
  Film,
  Heart
} from 'lucide-react'

interface Template {
  id: string
  name: string
  description: string
  content: string
  additionalData?: Record<string, any>
}

interface EnhancedTemplatesProps {
  mode: 'story' | 'music-video' | 'commercial' | 'children-book'
  onTemplateSelect: (template: Template) => void
  isExpanded: boolean
  onToggle: () => void
}

const storyTemplates: Template[] = [
  {
    id: 'detective-thriller',
    name: 'Detective Thriller',
    description: 'Crime investigation with moral conflict',
    content: `Detective Sarah Chen received an anonymous tip about stolen artwork at the old warehouse district. As she approached the abandoned building on Fifth Street, rain began to fall, creating an ominous atmosphere. Inside, she discovered a sophisticated art theft operation, but the evidence pointed to someone she trusted.

Her partner Detective James Martinez had been acting strangely for weeks. Sarah found him in the warehouse's back room, standing before three priceless stolen paintings - Van Gogh's "Starry Night," Picasso's "Guernica," and Da Vinci's "Mona Lisa." In his hand was a red rose, the calling card of the art thief known as "The Curator."

"I'm sorry you had to find out this way," James said, his voice heavy with regret. "My daughter needs expensive cancer treatment. The insurance won't cover the experimental therapy that could save her life."

Sarah kept her weapon trained on her former partner, torn between duty and compassion. The stolen art was worth millions, but James's desperation was real. Rain drummed against the broken skylights above them as she faced the most difficult decision of her career.`
  },
  {
    id: 'sci-fi-adventure',
    name: 'Sci-Fi Space Adventure', 
    description: 'Intergalactic mission with alien contact',
    content: `Captain Elena Vasquez stared through the viewport of the starship Horizon at the mysterious planet Kepler-442b. After six months of interstellar travel, her crew of twelve had finally reached humanity's first contact with an alien civilization.

The planet's purple skies and floating crystal formations defied Earth's physics. Dr. Chen's scanner readings showed impossible energy signatures emanating from the towering spires in the distance. As the landing party prepared their gear, Communications Officer Torres picked up structured signals from the planet's surface.

"Captain, these aren't random transmissions," Torres reported. "There's definitely intelligence down there."

Elena made the decision to land near the largest crystal formation. The away team consisted of herself, Dr. Chen, Security Chief Rodriguez, and Linguist Dr. Patel. As their shuttle touched down on the crystalline surface, the spires began to glow with pulsing light patterns.

Three tall, luminescent beings emerged from the crystal structures. They moved with grace and purpose, their translucent forms shimmering with inner light. Dr. Patel's universal translator began processing their harmonic communication patterns.

The lead being approached Elena, extending what appeared to be a glowing crystal flower as a gesture of welcome. First contact protocols had prepared her for this moment, but nothing could have prepared her for the profound sense of peace that radiated from these ancient beings.`
  },
  {
    id: 'romantic-comedy',
    name: 'Romantic Comedy',
    description: 'Modern love story with comedic mishaps', 
    content: `Marketing executive Emma Thompson was having the worst Monday of her life. She'd missed her alarm, spilled coffee on her presentation materials, and arrived at the advertising agency to find her parking spot taken by a sleek red motorcycle.

The motorcycle belonged to Alex Rivera, the new creative director who everyone said was brilliant but impossible to work with. Emma had heard stories about his unconventional methods and perfectionist attitude. She definitely hadn't expected him to be annoyingly attractive while arguing about parking spaces.

Their first meeting was a disaster. Emma's carefully prepared campaign proposal for Thompson & Associates' biggest client fell flat when Alex pointed out three major flaws in her strategy. But when he offered to collaborate instead of compete, Emma found herself reluctantly intrigued by his creative vision.

Over late-night brainstorming sessions and too much takeout food, Emma and Alex discovered they made an incredible team. Their campaign concept for eco-friendly fashion brand "Green Threads" was innovative and compelling. But with the client presentation just days away, a series of comedic mishaps threatened to derail everything.

A power outage, a missing presentation file, and Emma's meddling best friend Sarah all conspired to create chaos. Yet through each crisis, Alex and Emma found themselves falling for each other, one laugh and one creative breakthrough at a time.`
  }
]

const musicVideoTemplates: Template[] = [
  {
    id: 'hip-hop-anthem',
    name: 'Hip-Hop Anthem',
    description: 'Success story from struggle to triumph',
    content: 'Song: "Rise Above" by MC Phoenix\n\n[Verse 1]\nStarted from the bottom of a broken neighborhood\nEvery door closed, misunderstood\nBut I kept grinding through the sleepless nights\nBuilding my dreams under streetlight sights\n\n[Pre-Chorus]\nThey said I\'d never make it past these city blocks\nBut every setback just made my ambition rock\n\n[Chorus]\nRise above, never looking back\nFrom the ground up, staying on track\nEvery struggle was a lesson learned\nNow I rise above, bridges burned\n\n[Verse 2]\nNow the city lights reflect my success\nPenthouse view, but I\'ll never forget\nWhere I came from, who believed in me\nThis is my moment, this is my victory\n\n[Bridge]\nTo everyone who said it couldn\'t be done\nWatch me rise above, I\'ve only just begun\nFrom the basement to the top of the game\nRemember my story, remember my name\n\n[Final Chorus]\nRise above, never looking back\nFrom the ground up, staying on track\nEvery struggle was a lesson learned\nNow I rise above, bridges burned\nYeah, I rise above, it\'s my turn',
    additionalData: {
      artistName: 'MC Phoenix',
      genre: 'Hip-Hop',
      concept: 'Visual journey from struggle in underground/basement settings to success in penthouse/city views',
      visualStyle: 'Urban cinematography with dramatic lighting contrasts, slow-motion success moments, and authentic street culture'
    }
  },
  {
    id: 'pop-anthem',
    name: 'Pop Love Anthem',
    description: 'Uplifting love song with summer vibes',
    content: 'Song: "Golden Summer" by Luna Star\n\n[Verse 1]\nDriving down the coastline with the windows down\nYour hand in mine, we own this town\nSunset painting colors in your eyes\nThis moment feels like paradise\n\n[Pre-Chorus]\nEvery heartbeat matches the radio\nEvery mile feels like home\n\n[Chorus]\nGolden summer, you and me\nLiving wild and feeling free\nEvery day\'s a new adventure\nIn this golden summer weather\nGolden summer, hearts on fire\nYou\'re my only desire\nMake this moment last forever\nIn our golden summer weather\n\n[Verse 2]\nBeach bonfires and midnight talks\nDancing barefoot on the docks\nPromises written in the sand\nFuture planned with your hand in my hand\n\n[Bridge]\nWhen the seasons change and summers fade\nI\'ll remember every choice we made\nEvery laugh and every kiss we shared\nEvery moment shows how much we cared\n\n[Final Chorus]\nGolden summer, you and me\nLiving wild and feeling free\nEvery day\'s a new adventure\nIn this golden summer weather\nGolden summer, never end\nWith my lover and my best friend\nMake this moment last forever\nIn our golden summer weather',
    additionalData: {
      artistName: 'Luna Star',
      genre: 'Pop',
      concept: 'Bright, colorful summer romance with coastal settings and warm golden hour lighting',
      visualStyle: 'Vibrant colors, natural lighting, beach and summer aesthetics, joyful and energetic cinematography'
    }
  }
]

const commercialTemplates: Template[] = [
  {
    id: 'tech-startup',
    name: 'Tech Startup Launch',
    description: 'Revolutionary app launch campaign',
    content: `Brand: StreamlineAI
Product: Revolutionary productivity app that uses AI to automate workflow management
Target Audience: Busy professionals, entrepreneurs, and small business owners aged 25-45
Campaign Goals: Build awareness for app launch, drive downloads, position as must-have productivity tool

Key Messages:
• Get 4 hours back every day with AI automation
• Seamless integration with existing tools and workflows  
• Trusted by 10,000+ beta users and growing rapidly
• Free trial with premium features unlocked

Brand Personality: Innovative, efficient, trustworthy, forward-thinking
Platform Focus: LinkedIn, YouTube, Instagram (professional content)
Call-to-Action: "Download free trial and reclaim your time"

Constraints: Budget under $100K, shoot in major cities, authentic testimonials, demonstrate actual app usage, 30-60 second videos optimized for social media platforms`,
    additionalData: {
      industry: 'Technology',
      budget: '$100K',
      timeline: '30 days',
      platforms: ['LinkedIn', 'YouTube', 'Instagram']
    }
  },
  {
    id: 'luxury-brand',
    name: 'Luxury Heritage Brand',
    description: 'Premium positioning campaign',
    content: `Brand: Meridian Watches
Product: Limited edition Swiss timepiece collection celebrating 150 years of craftsmanship  
Target Audience: Affluent collectors and luxury enthusiasts aged 35-65, annual income $200K+
Campaign Goals: Reinforce heritage positioning, drive limited edition sales, establish premium brand perception

Key Messages:
• 150 years of Swiss watchmaking excellence and tradition
• Only 1,000 pieces worldwide - exclusive collector's edition
• Hand-crafted by master artisans using time-honored techniques
• Investment-grade timepieces that appreciate in value

Brand Personality: Timeless, sophisticated, exclusive, masterful
Platform Focus: YouTube (long-form brand storytelling), print, luxury lifestyle publications  
Call-to-Action: "Discover timeless craftsmanship - exclusively at select boutiques"

Constraints: Ultra-premium production values required, shoot in Switzerland, feature actual craftspeople, heritage workshop settings, classical musical score, 90-120 second format for premium brand storytelling`,
    additionalData: {
      industry: 'Luxury Goods',
      budget: '$500K',
      timeline: '60 days', 
      platforms: ['YouTube', 'Print', 'Luxury Publications']
    }
  }
]

const childrenBookTemplates: Template[] = [
  {
    id: 'friendship-adventure',
    name: 'Friendship Adventure',
    description: 'Animal friends learning about kindness',
    content: `Little Rabbit Rosie loved exploring the Enchanted Forest behind her cozy burrow. One sunny morning, she discovered a tiny bluebird named Chip sitting sadly on a low branch, unable to fly because of his injured wing.

"Don't worry, little friend," Rosie said gently. "I'll help you get better." She carefully picked up Chip and brought him to her burrow, where she made a soft nest from flower petals and moss.

Every day, Rosie brought Chip fresh berries and told him funny stories to cheer him up. She introduced him to her other forest friends - Benny the wise old owl, Luna the playful squirrel, and Max the friendly hedgehog. They all took turns keeping Chip company.

After two weeks, Chip's wing was completely healed. He flapped his wings with joy and soared high above the treetops. "Thank you, Rosie!" he chirped happily. "Your kindness saved me!"

From that day forward, Chip visited Rosie every morning, and they explored the Enchanted Forest together. Rosie learned that helping others always makes your own heart feel warm and happy.

The End.`,
    additionalData: {
      theme: 'Friendship and kindness to animals',
      characterCount: 5,
      pageCount: 6
    }
  },
  {
    id: 'ocean-adventure',
    name: 'Ocean Adventure',
    description: 'Underwater exploration and courage',
    content: `Captain Finn the seahorse was the bravest explorer in all of Coral Reef City. With his magical submarine shaped like a giant shell, he traveled to the deepest parts of the ocean where few sea creatures dared to venture.

One day, Princess Pearl the mermaid came to Finn with urgent news. "Captain Finn! The Golden Treasure of Poseidon has been stolen by the Shadow Shark. Without it, our coral reefs will lose their beautiful colors!"

Captain Finn gathered his crew: Ollie the wise octopus, Sparkles the electric eel, and Chomper the friendly dolphin. Together, they set off on a quest to the mysterious Midnight Depths where the Shadow Shark lived.

The journey was filled with wonders and challenges. They swam through forests of glowing jellyfish, solved riddles from ancient sea turtles, and crossed the Bridge of Dancing Seahorses. When they reached the Shadow Shark's lair, they discovered he wasn't evil at all - just lonely and misunderstood.

"I took the treasure because I wanted friends to visit me," the Shadow Shark explained sadly. "Everyone is afraid of me because I look scary."

Captain Finn had a wonderful idea. "Why don't you come live near Coral Reef City? We'd love to have you as our friend!" The Shadow Shark was so happy that he gladly returned the Golden Treasure, and the coral reefs bloomed with color once again.

The End.`,
    additionalData: {
      theme: 'Courage and understanding differences',
      characterCount: 6,
      pageCount: 8
    }
  }
]

const templates = {
  'story': storyTemplates,
  'music-video': musicVideoTemplates, 
  'commercial': commercialTemplates,
  'children-book': childrenBookTemplates
}

export function EnhancedTemplates({ mode, onTemplateSelect, isExpanded, onToggle }: EnhancedTemplatesProps) {
  const modeTemplates = templates[mode]
  
  const getModeIcon = () => {
    switch (mode) {
      case 'story': return <Film className="w-5 h-5 text-blue-400" />
      case 'music-video': return <Music className="w-5 h-5 text-purple-400" />
      case 'commercial': return <Briefcase className="w-5 h-5 text-emerald-400" />
      case 'children-book': return <BookOpen className="w-5 h-5 text-rose-400" />
    }
  }

  const getModeColor = () => {
    switch (mode) {
      case 'story': return 'blue'
      case 'music-video': return 'purple'
      case 'commercial': return 'emerald' 
      case 'children-book': return 'rose'
    }
  }

  const color = getModeColor()

  if (!isExpanded) {
    return (
      <Button
        onClick={onToggle}
        variant="outline"
        className={cn(
          "w-full border-2 transition-all",
          color === 'blue' && "border-blue-600 text-blue-400 hover:bg-blue-600/10",
          color === 'purple' && "border-purple-600 text-purple-400 hover:bg-purple-600/10",
          color === 'emerald' && "border-emerald-600 text-emerald-400 hover:bg-emerald-600/10",
          color === 'rose' && "border-rose-600 text-rose-400 hover:bg-rose-600/10"
        )}
      >
        <Sparkles className="w-4 h-4 mr-2" />
        Quick Templates ({modeTemplates.length} available)
      </Button>
    )
  }

  return (
    <Card className="bg-slate-800/50 border-slate-700">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-white flex items-center gap-2">
            {getModeIcon()}
            Development Templates
          </CardTitle>
          <Button
            onClick={onToggle}
            variant="ghost"
            size="sm"
            className="text-slate-400 hover:text-white"
          >
            Collapse
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {modeTemplates.map((template) => (
            <button
              key={template.id}
              onClick={() => onTemplateSelect(template)}
              className={cn(
                "p-4 rounded-lg border transition-all text-left hover:scale-[1.02]",
                "bg-slate-700/50 border-slate-600 hover:border-slate-500"
              )}
            >
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Palette className={cn(
                    "w-4 h-4",
                    color === 'blue' && "text-blue-400",
                    color === 'purple' && "text-purple-400",
                    color === 'emerald' && "text-emerald-400",
                    color === 'rose' && "text-rose-400"
                  )} />
                  <h4 className="font-medium text-white text-sm">{template.name}</h4>
                </div>
                
                <p className="text-xs text-slate-300 leading-relaxed">
                  {template.description}
                </p>
                
                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <Zap className="w-3 h-3" />
                  <span>{template.content.length} chars</span>
                  {template.additionalData && (
                    <>
                      <span>•</span>
                      <span>Full metadata</span>
                    </>
                  )}
                </div>
              </div>
            </button>
          ))}
        </div>

        <div className="mt-4 p-3 bg-amber-900/20 rounded-lg border border-amber-500/30">
          <div className="flex items-center gap-2 text-amber-400 text-sm">
            <Heart className="w-4 h-4" />
            <span className="font-medium">Development Templates</span>
          </div>
          <p className="text-amber-300 text-xs mt-1">
            These templates contain rich, realistic content perfect for testing all application features and workflows.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}