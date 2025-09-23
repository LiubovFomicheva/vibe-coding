Original task:
Hackathon Challenge: BuddyMatch
Overview
BuddyMatch is a web application designed to help HR and veteran employees coordinate 
buddy matches for newcomers. The goal is to support onboarding and integration while 
ensuring fair distribution of buddy responsibilities.
Core Features (Baseline Scope)
• Buddy Profile Creation: Veteran employees can volunteer by creating a profile with: 
o Location
o Unit/team
o Tech stack
o Optional personal interests
• HR-Driven Matching Workflow:
o HR initiates buddy matches before the newcomer’s start date.
o Newcomers do not choose buddies themselves, to avoid information 
overload.
o Veteran employees can accept or reject match requests.
o The system tracks the number of active buddies per volunteer to prevent 
overload.
• Search & Filter for HR:
o Filter buddy profiles by location, unit, tech stack, and interests.
• Contact & Scheduling:
o Once matched, buddies and newcomers can message each other and 
optionally schedule intro meetings.
Optional Extensions (Stretch Goals)
• Relocation Buddy Support:
o Existing employees who have relocated can request a buddy to help them 
settle in.
• Office Buddy Support:
o Employees who feel disconnected (even after months at the company) can 
request a buddy to help integrate better.
• Feedback System:
o Newcomers can leave feedback after the buddy period to help HR improve 
the program.
• Buddy Load Dashboard:
o HR can monitor buddy distribution and availability.
Example User Stories
These user stories can help guide your development:
- As HR, I want to match newcomers with buddies before their start date so they feel 
supported from day one.
- As HR, I want to filter buddy profiles by location, unit, and tech stack so I can find 
the best match.
- As a buddy, I want to accept or reject match requests so I can manage my time and 
avoid overload.
- As HR, I want to see how many buddies each volunteer has so I can distribute 
matches fairly.
- As a relocated employee (optional), I want to request a buddy to help me settle into 
the new office.
- As an existing employee (optional), I want to find an office buddy so I can feel more 
connected to my team and location.
Evaluation Criteria
Projects will be evaluated based on three main aspects:
1. Functionality & Completeness (40%)
Focuses on whether the app meets the baseline scope and functions as intended (are all 
features implemented, any stretch goals implemented, are there bugs).
2. Creativity & Insights (40%)
Focuses on originality and how effectively participants leverage AI tools and agent-based 
coding techniques.
3. Presentation Quality (20%)
Focuses on the clarity, engagement, and professionalism of the demo video (is demo 
complete, clear, engaging, professional)

Clarification: use .Net, React+Typescript, Entity Framework Core, MySQL, and AI tools.

UI style: https://www.epam.com/

Technical Architecture Questions:
Project Structure: Should I create a monolithic application or separate projects (API backend + React frontend)? - Yes.
Database Setup: Do you want me to set up MySQL locally with Docker, or do you have a specific database connection/setup in mind? - use localdb
Authentication: What authentication approach should I implement? (ASP.NET Core Identity, JWT tokens, or something else?) - lets try JWT token. But for MVP auth can be skipped.


Functional Requirements Questions:

User Roles: Should I implement distinct roles for HR, Buddy (senior employee), and Newcomer?  - Yes

5. AI Integration: The evaluation mentions "AI tools and agent-based coding techniques" - what specific AI features would you like me to implement? For example:
   - Automatic buddy matching based on profiles? - Yes
   - Compatibility scoring? - Yes
   - Smart recommendations? - Yes

6. Profile Data: For buddy profiles, what specific fields should I include beyond location, unit/team, tech stack, and interests? Any validation requirements? - use also lamguage as facet.

UI/UX Questions:

EPAM Style: Should I closely replicate EPAM's design system from their website, or just use it as inspiration for a professional corporate look? - replicate EPAM style

Priority Features: Which features should I focus on first for the MVP? All core features, or should I prioritize certain workflows (like HR matching workflow)?  - all core feature, optional feature I will specify later.


As a Business Analyst, reviewing the requirements and your answers, I need to clarify several critical business process questions:

## Business Process & Data Model Questions:

1. **Employee Lifecycle Management**:
   - How do we identify who is a "newcomer" vs "veteran employee"? - base on employee start date and title. "veteran" in company more than 3y and having title A3 level at least.
   - When does someone stop being a "newcomer" (30 days, 90 days, 6 months)? - 6 months.

2. **Buddy Capacity & Load Balancing**:
   - What's the maximum number of active newcomers one buddy can handle simultaneously? - 3.
   - How do we define "active buddy relationship" - is there a time limit (3 months, 6 months)? - 3months
   - Should the system automatically end buddy relationships after a certain period? - 1year

3. **Matching Algorithm Business Rules**:
   - What's the priority order for matching criteria? (Location > Tech Stack > Interests?) - tech stack > location > interests
   - Should location matching be mandatory or just preferred? - preferred
   - Can cross-team/cross-unit matches happen if same-team buddies aren't available? - yes

4. **Request & Approval Workflow**:
   - Can HR modify/reassign matches after a buddy accepts? - it should be possible
   - What happens if no buddies accept a match request within a timeframe? - hr should get notification and resolve situation manual. Add all information in the system.
   - Should there be escalation processes for urgent matches? - no

5. **Data Sources & Integration**:
   - Will employee data (location, unit, tech stack) be imported from existing HR systems? - yes. For MVP - lets use just JSON file
   - Or should employees manually enter all profile information? - no
   - How do we handle organizational changes (team moves, location changes)? - sync with externak hr system (not for mvp)

6. **Notifications & Communication**:
   - What notification channels should we support (email, in-app, Slack/Teams integration)? - email + teams
   - Should buddies get reminders about their active newcomers? - yes


As a Technical Lead, reviewing the requirements with all clarifications, I have these technical implementation questions:

## Technical Architecture & Implementation Questions:

1. **Database Strategy**:
   - You mentioned LocalDB, but requirements specify MySQL. Should I use SQL Server LocalDB instead of MySQL, or set up MySQL locally? - use something more preferable for .Net and Visual stusio, without extra installation.
   - Do you want Entity Framework Code First with migrations, or Database First approach? - Code first.

2. **AI Integration Technical Details**:
   - For compatibility scoring and matching algorithms - should I integrate with external AI services (OpenAI, Azure AI) or implement custom scoring logic? - for MVP lets use custom.
   - What's the expected complexity of the matching algorithm? Simple weighted scoring or more sophisticated ML models? - for MVP - simple.

3. **External Integrations**:
   - For Teams notifications - should I implement actual Teams webhook integration, or mock it for the MVP? - mock for MVP
   - For email notifications - SMTP configuration or mock email service for demo? - mock for demo.
   - JSON file for HR data import - what's the expected schema/structure? - let screated on scratch, you can ask following questuon later.

4. **Performance & Scalability Considerations**:
   - Real-time features needed (SignalR for messaging, live notifications)? - if I can demostrate it on my local machine - lets try.

5. **Solution Structure**:
   - Folder structure preference: Clean Architecture, N-Layer, or simple Web API + React? - Web API + React
   - Should I create separate projects for Domain, Infrastructure, Application layers? - keep it simple, to be able to read not-developer

6. **Development & Demo Considerations**:
   - Seed data strategy - how many sample employees, buddies, matches should I create? - 10
   - Deployment target - local development only, or should I prepare for cloud deployment? - mvp - only local
   - Do you need Docker containers for easy demo setup? - no

Add sprcial feature for hackatone:
Leaderboards 📊
Monthly Rankings:
"Top Mentors" - Highest points this month
"Rising Stars" - Biggest point increase
"Consistency Champions" - Most regular activity
"Newcomer Heroes" - Highest newcomer satisfaction scores
All-Time Rankings:
"Hall of Fame" - Top 10 all-time mentors
"Badge Collectors" - Most badges earned
"Team Champions" - Best performing te