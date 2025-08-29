// Content examples for testing text chunking prototypes

export interface ContentExample {
  id: string
  title: string
  type: 'story' | 'lyrics' | 'children_book' | 'commercial'
  content: string
  description: string
  suggestedShotCount: number
}

export const CONTENT_EXAMPLES: ContentExample[] = [
  {
    id: 'story_library',
    title: 'The Last Library',
    type: 'story',
    description: 'Dystopian sci-fi story about discovering humanity\'s last physical books',
    suggestedShotCount: 8,
    content: `In the year 2087, when digital streams had consumed all knowledge, Maya Chen discovered something extraordinary hidden beneath the ruins of downtown Portland. A staircase, carved from ancient stone, descended into darkness where no blueprint showed it should exist. Her archaeological scanner detected massive hollow spaces below—impossibly large for any known structure.

As she descended, emergency lights flickered to life, revealing corridor after corridor lined with something she had only seen in historical documentaries: physical books. Thousands upon thousands of them, perfectly preserved in climate-controlled alcoves. The air smelled of aged paper and leather bindings, a scent that triggered genetic memories of humanity's past.

At the center of this underground labyrinth stood an elderly man, somehow still alive, tending to the collection with mechanical precision. He introduced himself as Marcus, the Last Librarian, guardian of humanity's written legacy. For seventy years, he had maintained this sanctuary while the world above forgot how to read physical text.

Marcus revealed the terrible truth: the digital purge of 2020 hadn't been an accident. Corporate algorithms had systematically eliminated physical books to control information flow. Only this library remained, protected by technology older and more reliable than any quantum server. Each book contained knowledge that had been scrubbed from the digital realm—scientific discoveries, philosophical treatises, artistic expressions deemed "incompatible" with the new order.

Maya faced an impossible choice. Return to the surface and report her discovery to the authorities, knowing they would destroy this last bastion of free knowledge? Or stay and become the next guardian, sacrificing her life above to preserve humanity's intellectual heritage? As she touched the spine of a forbidden physics textbook, she realized some responsibilities transcend individual desires.

The weight of ten thousand years of human thought pressed down on her shoulders as she made her decision.`
  },
  {
    id: 'rap_digital_dreams',
    title: 'Digital Dreams',
    type: 'lyrics',
    description: 'Rap song about breaking free from digital addiction',
    suggestedShotCount: 12,
    content: `[INTRO]
Yeah, uh, Phoenix rising from the code
Digital native, but I cracked the mode
They told us screens would set us free
But I can see what they can't see

[VERSE 1]
Grew up in the glow of LCD screens
Chasing virtual highs and silicon dreams
Instagram likes were my dopamine hits
Facebook friends but no real relationships
Mom said go outside, but the wifi's better here
Virtual reality replacing what's sincere
They promised connection, delivered isolation
Now I'm debugging my own damn situation
Looking for meaning in algorithmic feeds
While my soul's starving and my spirit bleeds

[HOOK]
Digital dreams got me hypnotized
Scrolling through life with my bloodshot eyes  
But I'm breaking free from this pixel prison
Time to live real before my life's missing
Digital dreams, digital dreams
Nothing's ever what it seems
Breaking chains from the machine
Living life, not just the screen

[VERSE 2] 
Remember when we used to talk face to face?
Before emoji hearts replaced human grace
Now we're zombies walking with our heads down
Swiping left and right through our home town
AI's writing songs, robots making art
While we lose touch with our human heart
They monetize our data, sell our souls
Turn our deepest fears into their goals
But I found the power button, I found the switch
Time to reclaim life from this digital glitch

[HOOK]
Digital dreams got me hypnotized
Scrolling through life with my bloodshot eyes  
But I'm breaking free from this pixel prison
Time to live real before my life's missing
Digital dreams, digital dreams
Nothing's ever what it seems
Breaking chains from the machine
Living life, not just the screen

[VERSE 3]
Now I'm teaching kids to look up at the stars
Instead of down at phones and avatar cars
Building real community, planting actual seeds
Addressing human wants, not algorithm needs
The revolution's not in the cloud or the code
It's in choosing love over the convenient road
Every conversation that we have in person
Every human moment makes the spell stop working
So I'll keep spitting truth through this microphone
Until the digital dreams leave us alone

[OUTRO]
Phoenix rising from the ashes of the feed
Planting human hope like a digital seed
The future's not in screens, it's in our hands
Time to build tomorrow with real human plans`
  },
  {
    id: 'children_book_benny',
    title: 'Benny\'s Magic Garden',
    type: 'children_book',
    description: 'Children\'s book about a rabbit who discovers a magical garden',
    suggestedShotCount: 8,
    content: `Once upon a time, in a sunny meadow at the edge of Whispering Woods, there lived a curious little rabbit named Benny. Benny had the softest brown fur and the biggest, most sparkly eyes you ever did see. Every morning, Benny would hop out of his cozy burrow and wonder what amazing adventures the day might bring.

One particularly bright Tuesday morning, Benny discovered something extraordinary behind the old twisted oak tree. There, hidden beneath a tangle of wild roses, was a tiny wooden door painted bright green with golden hinges that shimmered in the sunlight.

"How curious!" said Benny, twitching his pink nose. He had lived in this meadow his whole life, but he had never seen this little door before. Being a brave and adventurous rabbit, Benny gently pushed the door open with his paw.

Behind the door was the most beautiful garden Benny had ever imagined. Flowers of every color danced in the breeze, singing soft melodies that sounded like wind chimes. Carrots grew as tall as trees, their orange tops glowing like tiny suns. And in the very center of this magical place grew a magnificent sunflower that seemed to reach all the way to the clouds.

"Welcome, little rabbit," whispered the sunflower in a voice like summer rain. "I am Sophia, guardian of the Magic Garden. This special place appears only to those with kind hearts and curious minds." Benny's ears perked up with excitement as golden butterflies danced around his head.

Sophia explained that the Magic Garden needed a helper, someone to care for the singing flowers and share the garden's happiness with other woodland creatures. "But remember," she warned gently, "magic only works when it's shared with others, never kept for yourself alone."

Benny thought about all his friends back in the meadow - the shy field mice, the busy squirrels, and even the grumpy old owl who lived in the oak tree. They would all love to see such beautiful wonders! So Benny promised Sophia he would bring one friend each day to experience the garden's magic.

And from that day forward, Benny became the official Garden Guide, sharing the magic of friendship and wonder with everyone in Whispering Woods. The more friends he brought, the more the garden bloomed, teaching Benny that the greatest magic of all is sharing joy with others.`
  },
  {
    id: 'commercial_heyer_hired',
    title: 'Heyer Hired Commercial',
    type: 'commercial',
    description: 'Commercial script for job opportunity management platform',
    suggestedShotCount: 10,
    content: `[SCENE: Modern office space, diverse professionals collaborating]

NARRATOR (V.O.): In today's competitive job market, finding the right opportunity isn't just about what you know—it's about who finds you.

[SCENE: Split screen showing frustrated job seeker vs. overwhelmed hiring manager]

Meet Sarah, a brilliant data scientist lost in a sea of generic job boards. And David, a startup founder drowning in unqualified applications. Both searching, both missing each other completely.

[SCENE: Sleek interface revealing the Heyer Hired platform]

Introducing Heyer Hired—the intelligent job opportunity management platform that doesn't just connect candidates with jobs, it creates perfect professional matches.

[SCENE: AI visualization showing skill matching and culture fit analysis]

Our proprietary matching algorithm doesn't just scan resumes. It analyzes communication styles, cultural fit indicators, growth trajectory preferences, and even working schedule compatibility. We see beyond keywords to understand career DNA.

[SCENE: Sarah receiving personalized opportunity alerts on her phone]

For candidates like Sarah, Heyer Hired curates opportunities that align with your values, not just your skills. No more wasting time on positions that don't fit your life goals.

[SCENE: David reviewing pre-qualified candidate profiles with detailed insights]

For hiring managers like David, our platform delivers pre-qualified candidates with deep compatibility insights, reducing hiring time by 73% and improving employee retention rates significantly.

[SCENE: Sarah and David meeting for the first time, clearly excited about the opportunity]

But here's what makes Heyer Hired revolutionary—our Career Elevation Engine doesn't just find you a job, it maps your entire professional journey, suggesting skills to develop, connections to make, and opportunities to pursue for long-term career growth.

[SCENE: Dashboard showing career progression analytics and networking suggestions]

Whether you're actively job hunting or passively building your career network, Heyer Hired works continuously in the background, ensuring you never miss the opportunity that could change everything.

[SCENE: Montage of successful matches across different industries and career levels]

Join over 500,000 professionals who've elevated their careers with Heyer Hired. Because your next opportunity shouldn't be left to chance.

[FINAL SCENE: Logo and tagline appear]

Heyer Hired. Your Career, Elevated.

Visit heyerhired.com and discover where your skills could take you.`
  }
]

export function getExampleById(id: string): ContentExample | undefined {
  return CONTENT_EXAMPLES.find(example => example.id === id)
}

export function getExamplesByType(type: ContentExample['type']): ContentExample[] {
  return CONTENT_EXAMPLES.filter(example => example.type === type)
}