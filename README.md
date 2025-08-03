## NotesBuddy : A Nextjs + Sanity based notes sharing platform.

Welcome to Notes Buddy, a web platform designed for students to read and share college notes easily. Built with a modern tech stack, it ensures an easy-to-use, visually appealing, and responsive experience.

![HeroSectionImage](https://i.postimg.cc/8PvmSp4y/localhost-3000.png)

### Features :

- Sanity CMS with Caching
- Notes system, PYQ's, one shots
- Quiz system (admin + user side)
- Flashcards (admin + user side)
- Premium purchase system, with history & upgrading the plan with razorpay
- User profile management with on-boarding system
- Referral system
- wallet system
- Coupon / Discount system
- Ai Chat with custom agents based on the subject
- Admin panel for managing the platform and more!

### Contributors

<a href="https://github.com/ramxcodes/NotesBuddy/graphs/contributors">
  <img src="https://contrib.rocks/image?repo=ramxcodes/NotesBuddy" />
</a>

### Tech Stack

**Frontend:**

- **Next.js 15.3.3** - React framework with App Router
- **React 19** - UI library with latest features
- **TypeScript** - Type-safe JavaScript
- **Tailwind CSS 4** - Utility-first CSS framework
- **Motion** - Animation library
- **shadcn/ui** - Pre-built components
- **Lenis** - Smooth scroll library
- **React Hook Form** - Form management with Zod validation

**Backend & Database:**

- **Prisma** - Database ORM with PostgreSQL
- **Better Auth** - Modern authentication system
- **Next.js API Routes** - Server-side endpoints

**Content Management:**

- **Sanity CMS** - Headless content management
- **Portable Text** - Rich text content
- **next-sanity** - Sanity integration for Next.js

**AI & Chat:**

- **Google Gemini AI** - AI chat functionality
- **Custom AI agents** - Subject-specific chatbots

**Payment & Premium:**

- **Razorpay** - Payment gateway
- **Hierarchical tier system** - Premium access control

**Development Tools:**

- **Bun** - Package manager and runtime
- **ESLint** - Code linting
- **Prettier** - Code formatting
- **Husky** - Git hooks
- **Turbopack** - Fast bundler

## Contributing & Installation

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/ramxcodes/NotesBuddy.git

    # For Windows

    ren NotesBuddy notes-buddy

    # For Mac/Linux

    mv NotesBuddy notes-buddy

    cd notes-buddy
   ```

2. **Install dependencies**

```bash
bun install
```

3. **Environment Setup**
   Create a `.env.local` file with the following variables:

   ```env
   # Database
   DATABASE_URL="postgresql://..."

   # Sanity
   NEXT_PUBLIC_SANITY_PROJECT_ID="your_project_id"
   NEXT_PUBLIC_SANITY_DATASET="production"
   SANITY_API_TOKEN="your_api_token"

   # Better Auth
   BETTER_AUTH_SECRET="your_auth_secret"
   BETTER_AUTH_URL="http://localhost:3000"

   # Razorpay
   RAZORPAY_KEY_ID="your_razorpay_key"
   RAZORPAY_KEY_SECRET="your_razorpay_secret"

   <!-- Check .env.example for all the vars -->

   ```

4. **Database Setup**

   ```bash
   bun prisma migrate dev
   bun prisma generate
   ```

5. **Start development server**

   ```bash
   bun dev
   ```

6. **Access Sanity Studio**
   Visit `http://localhost:3000/studio` for content management

### Folder Structure

```
src/
├── app/                          # Next.js App Router
│   ├── (admin)/                  # Admin dashboard routes
│   ├── (auth)/                   # Authentication pages
│   ├── (modals)/                 # Modal routes
│   ├── (staticPages)/            # Static pages
│   ├── (user)/                   # User dashboard routes
│   ├── api/                      # API endpoints
│   │   ├── ai/                   # AI chat endpoints
│   │   ├── auth/                 # Authentication API
│   │   ├── flashcard/            # Flashcard actions
│   │   ├── premium/              # Premium & payment API
│   │   └── user/                 # User management API
│   └── global.css                # Global styles
├── cache/                        # Caching utilities
│   ├── admin.ts                  # Admin data caching
│   ├── notes.ts                  # Notes caching
│   ├── premium.ts                # Premium data caching
│   └── user.ts                   # User data caching
├── components/                   # React components
│   ├── admin/                    # Admin dashboard components
│   ├── ai/                       # AI chat components
│   ├── auth/                     # Authentication components
│   ├── chat/                     # Chat interface
│   ├── core/                     # Core UI components
│   ├── flashcard/                # Flashcard components
│   ├── landing/                  # Landing page components
│   ├── note/                     # Note display components
│   ├── premium/                  # Premium & payment components
│   ├── profile/                  # User profile components
│   ├── quiz/                     # Quiz system components
│   └── ui/                       # shadcn/ui components
├── dal/                          # Data Access Layer
│   ├── ai/                       # AI chat queries
│   ├── coupon/                   # Coupon & discount queries
│   ├── flashcard/                # Flashcard data access
│   ├── note/                     # Notes queries
│   ├── premium/                  # Premium system queries
│   ├── quiz/                     # Quiz system queries
│   ├── referral/                 # Referral system queries
│   └── user/                     # User management queries
├── hooks/                        # Custom React hooks
│   ├── use-audio-recording.ts    # Audio recording hook
│   ├── use-debounce.ts           # Debounce utility
│   ├── use-mobile.ts             # Mobile detection
│   └── use-scroll-progress.ts    # Scroll progress tracking
├── lib/                          # Utility libraries
│   ├── auth/                     # Authentication utilities
│   ├── db/                       # Database utilities
│   ├── razorpay/                 # Payment integration
│   ├── search/                   # Search functionality
│   └── user/                     # User utilities
├── sanity/                       # Sanity CMS configuration
├── types/                        # TypeScript type definitions
└── utils/                        # Utility functions
    ├── academic-config.ts        # Academic hierarchy config
    ├── ai-system-prompt.ts       # AI system prompts
    ├── config.ts                 # App configuration
    ├── constant.ts               # Application constants
    └── helpers.ts                # Helper functions
```

### Naming Conventions

**Files & Folders:**

- Use `kebab-case` for file and folder names
- Component files use `PascalCase` (e.g., `UserProfile.tsx`)
- Utility files use `kebab-case` (e.g., `user-profile.ts`)
- API routes use `kebab-case` folders with `route.ts` files

**Components:**

- React components use `PascalCase`
- Component props interfaces end with `Props`
- Custom hooks start with `use` prefix

**Database & API:**

- Database models use `PascalCase` (Prisma convention)
- API endpoints use `camelCase` for functions
- Enum values use `UPPER_SNAKE_CASE`

**Variables & Functions:**

- Use `camelCase` for variables and functions
- Constants use `UPPER_SNAKE_CASE`
- Boolean variables start with `is`, `has`, `can`, `should`

**Academic Hierarchy:**

- University: `MEDICAPS`, `IPS`
- Degree: `BTECH_CSE`, `BTECH_IT`
- Year: `FIRST_YEAR`, `SECOND_YEAR`, etc.
- Semester: `FIRST_SEMESTER`, `SECOND_SEMESTER`, etc.

### Contribution

1. **Fork the repository** and clone your fork
2. **Make your contribution** and raise PR.
3. **Follow the coding standards**:
   - Use TypeScript for all new code
   - Follow the established folder structure
   - Add proper error handling
   - Include loading and error states for UI components
4. **Database Changes**:
   - Create migrations for schema changes: `bun prisma migrate dev --name your_migration_name`
5. **Testing**:
   - Test your changes locally
   - Ensure all existing functionality works
6. **Commit Guidelines**:
   - Use conventional commits: `feat:`, `fix:`, `docs:`, `style:`, `refactor:`, `test:`, `chore:`
   - Write clear, descriptive commit messages
7. **Submit a Pull Request**:
   - Provide a clear description of changes
   - Link any related issues
   - Include screenshots for UI changes

**Development Guidelines:**

- Use server actions for data mutations
- Implement proper caching strategies
- Follow the established DAL (Data Access Layer) pattern
- Use Zod for data validation
- Implement proper error boundaries
- Follow accessibility best practices
- Optimize for performance and SEO
