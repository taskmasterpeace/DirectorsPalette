# Test Lyrics - Ron-Ron "Respect the Check"

## Song Details
- **Artist**: Ron-Ron
- **Title**: Respect the Check
- **Genre**: Hip-Hop/Trap
- **Producer**: Enron Projects

## Full Lyrics

```
[Intro]
(Low, distorted vocal ad libs)
Yeah…
Enron Projects…
Ron-Ron…
We on't move less the money move…
Listen…Aye

[Chorus]
Respect the check, we don't bend, we don't fold
We gon' keep it runnin' till the bag can't hold
Respect the check, let the hustle unfold
Better come correct when you walk up in my zone

[Verse 1]
I'm countin' up digits, my circle always wit it
If it ain't about the bag, then I'm not driving to get it.
Call me out the trenches, born to hustle on the daily
Throwing Instagram threats, man these boys goin' crazy
They whisper in the corners, and they hoes outta pocket
I don't work for nobody on earth til that check get deposit
Came up from the bottom, now we flossin' in the city
She want my money, leave her looking silly

[Pre-Chorus]
Money talk, keep your mouth shut if you can't relate
Got no time for fakin' moves, we hold weight
From the block to the booth, keep the name ringin' true
Enron made me who I am, so I do what I do

[Chorus]
Respect the check, we don't bend, we don't fold
We gon' keep it runnin' till the bag can't hold
Respect the check, let the hustle unfold
Better come correct when you walk up in my zone

[Verse 2]
Demons on my shoulder, but the dream's in my hands
They wonder how I'm countin' up while they can't understand the bands
I wrote my own blueprint, you can't copy my brand
Put the fam on my back, turned the struggle into plans
Numbers never lie, that's the code I recite
I'll add it up in the morning and get some rest through tonight
We calm in the storm, you niggas will panic quickly
I see through the cap, so I move with caution

[Bridge]
Whispers in the dark, but that chatter never stops me
Level up the game, let the hustle be costly
Enron in my veins, keep the memory strong
We gon' shine out the mud, like we knew all along

[Chorus]
Respect the check, we don't bend, we don't fold
We gon' keep it runnin' till the bag can't hold
Respect the check, let the hustle unfold
Better come correct when you walk up in my zone

[Outro]
(Ambient ad libs, echoes)
Yeah…
Ron-Ron…
Remember: If you can't respect the check…
You can't stand where I stand…
Enron Projects… keep it locked.
```

## Test Plan

### Step 1: Enter Song Details
- Song Title: "Respect the Check"
- Artist Name: "Ron-Ron"
- Genre: "Hip-Hop/Trap"

### Step 2: Paste Lyrics
- Copy and paste the full lyrics above into the lyrics field

### Step 3: Select Director Style
- Choose a director that matches the hip-hop aesthetic (e.g., Hype Williams, Director X, or custom)

### Step 4: Add Video Concept (Optional)
- "Gritty street visuals mixed with luxury lifestyle shots, showing the journey from struggle to success"

### Step 5: Extract References
- Click "Extract Story References"
- Should identify song structure with Intro, Chorus, Verses, Pre-Chorus, Bridge, Outro

### Step 6: Configure References
- Review extracted locations, wardrobe, props
- Approve or modify as needed

### Step 7: Generate Final Breakdown
- Click "Generate Final Breakdown"
- Should produce shots with "@artist" replaced with "Ron-Ron"

### Expected Results
- Shots should display like: "Wide shot of Ron-Ron in streetwear..."
- NOT: "Wide shot of @artist in streetwear..."
- Each section should have 3-5 detailed shots
- Additional shots generator should work without errors

### Step 8: Test Additional Features
- Test copy buttons on individual shots
- Test multi-select mode
- Test "Generate Additional Shots" with collapsible UI
- Verify no React key prop errors in console

## Bug Fixes Applied
1. ✅ Fixed @artist placeholder replacement in shots
2. ✅ Fixed React key prop errors in EnhancedShotGenerator
3. ✅ Fixed copy functionality for both modes
4. ✅ Made additional shots section collapsible (starts collapsed)

## Notes
- The application should handle the structured lyrics format with clear section markers
- The hip-hop theme should generate appropriate urban/luxury visual references
- All shots should properly display "Ron-Ron" instead of "@artist"