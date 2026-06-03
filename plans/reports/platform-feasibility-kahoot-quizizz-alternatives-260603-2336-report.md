# Platform Feasibility Report: Classroom Game Mechanics

**Date:** 2026-06-03  
**Project:** MLN111 Philosophy Course (Ô Chữ + Lật Tranh games)  
**Scope:** Vietnamese language, 5-team classroom, custom grid/image mechanics  

---

## Executive Summary

**Verdict: Must build custom web app.**

None of the existing platforms (Kahoot, Quizizz, Gimkit, Blooket, Mentimeter, Slido, Wordwall, Quizlet Live, Nearpod, Factile, Classtools, Genially) natively support **both** mechanics required:

1. **Crossword Buzzer (Ô Chữ):** No platform supports a live 7-row × 35-column crossword grid that reveals letters row-by-row as teams buzz in with correct answers, plus a vertical keyword detection mechanic.

2. **Image Reveal (Lật Tranh):** Only Kahoot (paid tier) and Classtools offer progressive image reveal, but neither ties reveal to team-based multiple-choice voting nor supports the "reveal one slice per correct answer" pattern with philosophy lesson overlay.

**Key Blocker:** Vietnamese language support is either unsupported or unconfirmed on most platforms. All platforms support team play in some form, but none integrate the two game mechanics into a single cohesive experience.

**Recommendation:** Proceed with custom Python/web build (project already in-flight). Integration with an existing platform would require custom API work and wouldn't solve the core game-mechanic gaps.

---

## Platform-by-Platform Assessment

| Platform | Buzz-in | Team Mode | Crossword Grid | Image Reveal | Viet Content | Free Tier | Verdict |
|----------|---------|-----------|----------------|--------------|--------------|-----------|---------|
| **Kahoot** | ❌ (not traditional) | ✅ (team) | ❌ | ⚠️ (paid) | ❌ | ✅ | Partial image reveal only; no crossword; buzz-in is not first-to-answer lockout |
| **Quizizz** | ❌ | ✅ (team) | ❌ | ❌ | ❌ | ✅ | Team mode works; no grid or image-reveal mechanics |
| **Gimkit** | ❌ | ✅ (squad) | ❌ | ❌ | ❌ | ✅ | Team play only; no custom grid or reveal mechanics |
| **Blooket** | ⚠️ (indirect) | ✅ (team) | ❌ | ❌ | ❌ | ✅ | 25+ game modes; none match crossword or image-reveal pattern |
| **Mentimeter** | ❌ | ⚠️ (polling only) | ❌ | ⚠️ (pin-on-image) | ❌ | ✅ | Polling tool; no game mechanics or reveal progression |
| **Slido** | ❌ | ⚠️ (polling only) | ❌ | ❌ | ❌ | ✅ | Polling/Q&A tool; no game mechanics |
| **Wordwall** | ✅ (buzzer) | ⚠️ (image quiz template) | ❌ | ⚠️ (image reveal template) | ❌ | ⚠️ | Buzzer and image quiz exist; no integration; no team scoring |
| **Quizlet Live** | ⚠️ (matching game) | ✅ (team match) | ❌ | ❌ | ❌ | ✅ | Team-based matching; no buzz-in or image mechanics |
| **Nearpod** | ❌ | ⚠️ (class-paced) | ❌ | ⚠️ (image poll) | ❌ | ⚠️ | Interactive but no game mechanics |
| **Factile (PlayFactile)** | ✅ (buzzer) | ✅ (team) | ⚠️ (Jeopardy grid) | ❌ | ❌ (no Viet) | ⚠️ | Best grid + buzzer match; supports 8 languages, NOT Vietnamese |
| **Classtools Image Reveal** | ❌ (manual turn-taking) | ✅ (team) | ❌ | ✅ (tile-based) | ❌ (unconfirmed) | ✅ | Strongest image-reveal option; no buzz-in or crossword |
| **Genially** | ❌ | ✅ (team quiz template) | ❌ | ❌ (hidden image template only) | ❌ | ⚠️ | Rich template library; no game mechanic integration |

**Legend:**  
✅ = Natively supported  
⚠️ = Partial/workaround only  
❌ = Not supported  

---

## Detailed Platform Notes

### **Kahoot** 
**Summary:** Live quiz with animation features; most mature platform.

**Buzz-In:**
- Does NOT support first-to-answer lockout. Team mode uses "team discussion" (5-second window) + leader submits one answer.
- Community has requested "quiz show buzzer" feature; request unfulfilled.

**Team Mode:**
- ✅ Full support. Teams pool member scores as average.

**Crossword Grid:**
- ❌ No native support.

**Image Reveal:**
- ✅ Available in **Kahoot Pro/Premium tiers only** (paid subscription required).
- Supports 3×3, 5×5, 8×8 grid reveal sizes.
- Reveal speed tied to question time limit.
- Progressive tile-by-tile reveal (top-left to bottom-right).

**Vietnamese Content:**
- No language-specific information found. Likely supports Unicode text but no confirmed Vietnamese UI.

**API / Customization:**
- No public API for custom mechanics; closed platform.

**Sources:**
- [Kahoot Team Experience](https://support.kahoot.com/hc/en-us/articles/4408679135891-Kahoot-game-play-in-team-mode)
- [Kahoot Image Features](https://support.kahoot.com/hc/en-us/articles/115002815387-Kahoot-images-How-to-use-images-and-GIFs)
- [Kahoot Experiences](https://support.kahoot.com/hc/en-us/articles/35636870654867-Kahoot-game-modes)

---

### **Quizizz (Now Wayground)**
**Summary:** Quiz platform with extensive question types; recently rebranded.

**Buzz-In:**
- ❌ Not supported.

**Team Mode:**
- ✅ Full support. Students answer individually; grading aggregated to teams.

**Crossword Grid:**
- ❌ No grid display feature. TriviaMaker (a Quizizz alternative) offers "Grid" game format, but Quizizz itself does not.

**Image Reveal:**
- ❌ No progressive reveal feature.
- Can add images to questions (context only).

**Vietnamese Content:**
- No confirmed support. Likely accepts Vietnamese text in questions/answers but no UI localization noted.

**API / Customization:**
- Closed platform; no public API for custom mechanics.

**Sources:**
- [Quizizz Team Mode](https://quizizz.fandom.com/wiki/Team_mode)
- [Game Settings](https://forwork-support.quizizz.com/hc/en-us/articles/360049472512-Game-Settings-for-Quizzes)
- [Question Types](https://forbusiness-support.wayground.com/hc/en-us/articles/360044402691-All-Questions-Types-on-Quizizz-for-Work)

---

### **Gimkit**
**Summary:** Game-centric platform with in-game currency and squad mechanics.

**Buzz-In:**
- ❌ Not traditional buzz-in. Squad-based (auto-assigned or manual); players answer to earn currency for squad purchases.

**Team Mode:**
- ✅ Squad mode is full team experience; earnings pooled.

**Crossword Grid:**
- ❌ No grid display.

**Image Reveal:**
- ❌ No progressive reveal.
- Supports image-choice questions (select image as answer).

**Vietnamese Content:**
- No confirmed support.

**API / Customization:**
- Closed platform.

**Sources:**
- [Gimkit Groups Mode](https://www.makerstations.io/gimkit-groups/)
- [Gimkit Complete Guide](https://easternherald.com/hub/gimkit/)
- [Gimkit 2D Game Modes](https://www.makerstations.io/gimkit-2d-game-modes/)

---

### **Blooket**
**Summary:** Game-centric platform with 25+ game modes.

**Buzz-In:**
- ❌ Game modes like Battle Royale have indirect competition (1v1 showdowns) but no traditional buzz-in mechanic.

**Team Mode:**
- ✅ All modes support team play.

**Crossword Grid:**
- ❌ None of the 25+ modes support a crossword grid. Related platforms (TriviaMaker) offer grid game format; Blooket does not.

**Image Reveal:**
- ❌ No progressive image reveal.

**Vietnamese Content:**
- No confirmed support.

**API / Customization:**
- Closed platform.

**Sources:**
- [Blooket Game Mode Previews](https://help.blooket.com/hc/en-us/articles/21408591795351-Blooket-Game-Mode-Previews)
- [Blooket Game Modes](https://blooketjoinzone.com/blooket-game-modes/)

---

### **Mentimeter**
**Summary:** Audience engagement / polling tool; not a game platform.

**Buzz-In:**
- ❌ Not applicable; polling tool.

**Team Mode:**
- ⚠️ Weak support. Can create polls and view aggregate responses; no team scoring or competition mechanics.

**Crossword Grid:**
- ❌ No grid support.

**Image Reveal:**
- ⚠️ Limited. Can add "pin-on-image" polls (pin point on image as response); NOT progressive reveal by question correctness.

**Vietnamese Content:**
- No confirmed support.

**API / Customization:**
- Closed platform.

**Sources:**
- [Mentimeter vs Slido Comparison](https://www.getapp.com/collaboration-software/a/mentimeter/compare/slido/)
- [Slido vs Mentimeter](https://www.capterra.com/compare/154051-160936/Slido-vs-Mentimeter)

---

### **Slido**
**Summary:** Audience engagement / polling tool (Cisco-owned); not a game platform.

**Buzz-In:**
- ❌ Not applicable; polling tool.

**Team Mode:**
- ⚠️ Weak support. Basic polling only; no team mechanics.

**Crossword Grid:**
- ❌ No grid support.

**Image Reveal:**
- ❌ No progressive reveal feature.

**Vietnamese Content:**
- No confirmed support.

**API / Customization:**
- Closed platform (enterprise SaaS).

**Sources:**
- [Slido](https://www.slido.com/)
- [Slido vs Mentimeter](https://www.capterra.com/compare/154051-160936/Slido-vs-Mentimeter)

---

### **Wordwall**
**Summary:** Template-based interactive learning tool; strong on quizzes and games.

**Buzz-In:**
- ✅ Buzzer feature exists. Handset-based or digital; first player to press highlighted. NOT team-based scoring; individual participants.

**Team Mode:**
- ⚠️ "Image quiz" and other templates exist but team scoring is NOT integrated with the buzzer mechanic.

**Crossword Grid:**
- ❌ No crossword grid. Offers various quiz/matching templates; no grid reveal.

**Image Reveal:**
- ⚠️ "Image reveal" template exists. Teachers reveal image slowly; students guess. NOT tied to multiple-choice questions or team scoring.

**Vietnamese Content:**
- No confirmed support. Likely accepts Vietnamese text but no UI localization noted.

**API / Customization:**
- Limited; template-based tool. No deep API access.

**Sources:**
- [Wordwall](https://wordwall.net/)
- [Wordwall Image Quiz Examples](https://wordwall.net/resource/1946839/places-in-town-picture-reveal)

---

### **Quizlet Live**
**Summary:** Team-based matching game built on Quizlet flashcard library.

**Buzz-In:**
- ❌ Matching-based game, not buzz-in. Teams race to match all terms; no first-to-answer mechanic.

**Team Mode:**
- ✅ Core mechanic; teams compete to match study sets.

**Crossword Grid:**
- ❌ No grid support.

**Image Reveal:**
- ❌ No image reveal.

**Vietnamese Content:**
- No confirmed support.

**API / Customization:**
- Closed platform; no custom mechanics.

**Sources:**
- [Quizlet Live Teams Mode](https://help.quizlet.com/hc/en-us/articles/360030985431-Starting-a-game-of-Classic-Quizlet-Live-in-teams-mode)

---

### **Nearpod**
**Summary:** Interactive presentation / lesson tool for teachers.

**Buzz-In:**
- ❌ Not a game platform.

**Team Mode:**
- ⚠️ Class-paced mode allows synchronized interaction; not team competition.

**Crossword Grid:**
- ❌ No grid support.

**Image Reveal:**
- ⚠️ Image polls available; NOT progressive reveal.

**Vietnamese Content:**
- No confirmed support.

**API / Customization:**
- Limited; presentation tool, not game engine.

**Sources:**
- [Nearpod Basic Features](https://quizlet.com/144631527/nearpod-basic-features-flash-cards/)

---

### **Factile (PlayFactile)** ⭐ **BEST HYBRID MATCH**
**Summary:** Jeopardy-style game maker with built-in buzzer and grid display.

**Buzz-In:**
- ✅ **Full support.** Virtual buzzers; first team to buzz locks others out. Similar to traditional Jeopardy.

**Team Mode:**
- ✅ **Full support.** Teams compete; scorekeeping integrated.

**Crossword Grid:**
- ⚠️ **Partial.** Supports Jeopardy-style 6×6 grid (categories × point values). **NOT a crossword grid.** Each cell is a question clue, not letters of a word. Cannot display 7×35 crossword with letter reveals.

**Image Reveal:**
- ❌ No progressive image reveal feature.

**Vietnamese Content:**
- ❌ **Supported languages: English, Spanish, French, German, Italian, Chinese, Arabic, Mandarin. Vietnamese NOT included.**

**Free Tier:**
- Limited free tier; paid plans required for full features.

**API / Customization:**
- No public API; closed platform.

**Assessment:**
Factile is the closest match for buzz-in + grid + team mechanics, **but Vietnamese language is unsupported** and the grid is Jeopardy-style (question clues), not a crossword letter grid. Would require paid subscription and doesn't solve the core game-mechanic gaps.

**Sources:**
- [PlayFactile](https://www.playfactile.com/)
- [Factile Features](https://www.playfactile.com/features/)
- [Factile Language Support](https://www.playfactile.com/support)

---

### **Classtools Image Reveal** ⭐ **BEST IMAGE REVEAL MATCH**
**Summary:** Free, open-ended image reveal tool built for classroom teachers.

**Buzz-In:**
- ❌ Manual turn-taking (not automated buzz-in). Teacher or student decides whose turn to reveal a tile.

**Team Mode:**
- ✅ **Full support.** Teams take turns uncovering tiles; first to correctly identify image wins.

**Crossword Grid:**
- ❌ No grid support.

**Image Reveal:**
- ✅ **Tile-based progressive reveal.** Upload image → adjust tile coverage → students uncover one tile per turn. Supports slow-reveal function and timed sequences.

**Vietnamese Content:**
- ❌ Unconfirmed. Likely accepts Vietnamese text in captions but no UI localization noted.

**Free Tier:**
- ✅ Completely free.

**API / Customization:**
- No API; web tool only. Cannot tie reveal to multiple-choice voting.

**Assessment:**
Classtools is excellent for the **Lật Tranh (Image Reveal)** mechanic IF you can work around the turn-taking model. However, it does NOT integrate with multiple-choice questions or tie reveals to correctness. Would require custom wrapper / integration work to achieve the full "5 questions → each correct answer reveals one slice" pattern.

**Sources:**
- [Classtools Image Reveal Tool](https://www.classtools.net/reveal/)
- [Classtools.net](https://www.classtools.net/)

---

### **Genially**
**Summary:** Rich interactive presentation and quiz template library.

**Buzz-In:**
- ❌ No buzzer mechanic.

**Team Mode:**
- ✅ "Team Quiz" template available; live team-based quizzes with leaderboard.

**Crossword Grid:**
- ❌ No grid support.

**Image Reveal:**
- ⚠️ "Hidden image quiz" template exists. Manual interaction (click to reveal); NOT progressive unlock tied to question correctness.

**Vietnamese Content:**
- No confirmed support.

**API / Customization:**
- Limited API; primarily template-based. Custom mechanics not feasible.

**Assessment:**
Genially offers beautiful templates and team-quiz support but lacks the core game mechanics (buzz-in, grid, progressive image reveal) required.

**Sources:**
- [Genially Quizzes](https://genially.com/templates/quizzes/)
- [Genially Team Quiz Template](https://genially.com/template/team-quiz/)

---

## Open-Source & Alternative Platforms

### **Buffer Buzzer (GitHub)**
- **Repo:** `github.com/bufferapp/buzzer`
- **Type:** Open-source buzzer app using WebSockets.
- **Verdict:** Buzzer only; no quiz, grid, or image mechanics.

### **Buzzonk, BuzzIn.live, Multibuzzer**
- **Type:** Simple online buzzer systems.
- **Verdict:** Buzzer mechanics only; no game integration.

### **Crossword Connect (Cromulent Labs), Planet Crossword (Hovercats)**
- **Type:** Multiplayer crossword games.
- **Verdict:** Crossword-only; no quiz or team scoring tied to answers.

### **Google I/O Crossword (Gemini + Flutter + Firebase)**
- **Type:** Open collaborative crossword.
- **Verdict:** Crossword-only; no quiz mechanics.

**Overall:** No open-source platform combines buzzer + crossword + image reveal + team scoring.

---

## Synthesis: Why Custom Build Necessary

1. **Crossword Buzzer (Ô Chữ):**
   - Requires **live 7×35 grid display with progressive letter reveal** tied to question correctness.
   - Requires **vertical keyword detection** (column 12 spells "YÊU NƯỚC").
   - Requires **team-based first-to-buzz lockout** for keyword guess.
   - **No platform supports this combination.** Factile has grid + buzz-in (Jeopardy style) but NOT a letter-grid with reveal mechanics.

2. **Image Reveal (Lật Tranh):**
   - Requires **5-part image slice reveal** triggered by correct answers to multiple-choice questions.
   - Requires **team-based voting** with simultaneous submission.
   - Requires **philosophy lesson text overlay** after all slices revealed.
   - **Only Kahoot (paid) and Classtools** offer progressive image reveal, but neither ties it to question correctness or team voting. Classtools uses manual turn-taking, not automatic reveal on correctness.

3. **Vietnamese Language:**
   - Most platforms support Unicode text (so you CAN display Vietnamese questions/answers).
   - But NO platform confirmed Vietnamese UI localization.
   - Factile explicitly does NOT support Vietnamese.

4. **Integration & Workflow:**
   - Even if you could combine Factile (buzz-in + grid) + Classtools (image reveal), they are separate platforms with no shared session/team data.

---

## Recommendation

**Proceed with custom web app development** (current Python project in `/home/than-minh/project/mln_game_full`).

**Rationale:**
- ✅ Existing Python backend is already in-flight (`core.py`, `host_game1.py`, `host_game2.py`, `data.py`).
- ✅ Custom build allows full control over Vietnamese UX, game mechanics, and team scoring.
- ✅ Faster iteration on classroom-specific features (philosophy lesson integration, specific image/crossword content).
- ❌ Kahoot/Quizizz/Blooket would require custom wrapper code without solving core mechanic gaps.
- ❌ Factile + Classtools hybrid is friction-heavy (two platforms, no data sync, both paid tiers needed).

**Next Steps:**
1. Finalize Python backend for both game modes (Game 1 & Game 2).
2. Build lightweight web frontend (React/Vue or Streamlit) for team client + host display.
3. Test with actual classroom (MLN111 group, 5 teams).
4. Consider hosting on Vercel, Railway, or self-hosted if offline play needed.

---

## Unresolved Questions

1. **Vietnamese language support — exact testing needed:** Does Kahoot, Quizizz, or others actually accept Vietnamese diacritics (ă, â, ê, ơ, ư, đ) correctly? Recommend manual test with sample questions.

2. **Classtools tile-reveal integration:** Can Classtools be embedded in an iframe and controlled via JavaScript? Possible workaround for image-reveal mechanic without rebuilding from scratch.

3. **Offline play requirement:** Does classroom have stable WiFi? If not, custom Electron/PWA build may be safer than SaaS platforms.

4. **Philosophy lesson content ownership:** Should the lesson text and images be editable by teacher post-deployment? If yes, requires a content-management layer (custom build necessary).

---

## Sources Cited

- [Kahoot Team Experience](https://support.kahoot.com/hc/en-us/articles/4408679135891-Kahoot-game-play-in-team-mode)
- [Kahoot Image Reveal](https://support.kahoot.com/hc/en-us/articles/115002815387-Kahoot-images-How-to-use-images-and-GIFs)
- [Quizizz Team Mode](https://quizizz.fandom.com/wiki/Team_mode)
- [Gimkit Groups](https://www.makerstations.io/gimkit-groups/)
- [Blooket Game Modes](https://help.blooket.com/hc/en-us/articles/21408591795351-Blooket-Game-Mode-Previews)
- [Mentimeter vs Slido](https://www.getapp.com/collaboration-software/a/mentimeter/compare/slido/)
- [Wordwall](https://wordwall.net/)
- [Quizlet Live](https://help.quizlet.com/hc/en-us/articles/360030985431-Starting-a-game-of-Classic-Quizlet-Live-in-teams-mode)
- [PlayFactile](https://www.playfactile.com/)
- [Classtools Image Reveal](https://www.classtools.net/reveal/)
- [Genially Quizzes](https://genially.com/templates/quizzes/)
- [Buffer Buzzer](https://github.com/bufferapp/buzzer)
- [Crossword Connect](https://www.cromulentlabs.com/cc.html)
- [Google I/O Crossword](https://developers.google.com/learn/pathways/solution-crossword)

---

**Report Generated:** 2026-06-03 23:36 UTC  
**Researcher:** Claude Code (Haiku 4.5)
