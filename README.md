# Smart Med Tracker

A modern, real-time hospital bed and oxygen cylinder availability tracking system built with **Next.js 15**, **TypeScript**, **Tailwind CSS**, and **Supabase**.

## 🏥 Features

- **Real-time Availability Tracking**: View current bed and oxygen cylinder availability across multiple hospitals
- **Role-based Access**: Different interfaces for patients (view-only) and administrators (can update data)
- **User Profile Management**: Advanced profile editing with personal data management
  - Edit personal information (name, age, gender, phone number, address)
  - Role-specific fields (hospital name for admins)
  - Real-time profile updates with validation
  - Secure profile data handling
- **Modern UI**: Clean, responsive design with Tailwind CSS
- **Mobile-First Design**: Fully responsive with working mobile navigation
- **Type Safety**: Full TypeScript implementation
- **Server-Side Rendering**: Fast loading with Next.js App Router
- **Authentication System**: Secure login/signup with role-based access
- **Dark Mode Support**: Toggle between light and dark themes

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- Supabase account (free tier available)

### Installation

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Configure environment variables**:
   ```bash
   cp .env.local.example .env.local
   ```
   
   Update `.env.local` with your Supabase credentials:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your_project_url_here
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
   ```

3. **Set up Supabase** (see SUPABASE_SETUP.md for detailed instructions):
   - Create a Supabase project
   - Set up the database tables
   - Configure Row Level Security

4. **Start the development server**:
   ```bash
   npm run dev
   ```

5. **Open your browser** and navigate to `http://localhost:3000`

## 📁 Project Structure

```
Smart Med Tracker/
├── app/                    # Next.js 13+ App Router
│   ├── about/              # About page
│   ├── auth/               # Authentication page
│   ├── contact/            # Contact page
│   ├── dashboard/          # Dashboard page
│   ├── profile/            # User profile management
│   ├── globals.css         # Global styles
│   ├── layout.tsx          # Root layout
│   └── page.tsx            # Home page
├── components/             # Reusable React components
│   ├── AuthGuard.tsx       # Authentication protection
│   ├── ThemeProvider.tsx   # Dark/light theme provider
│   └── ThemeToggle.tsx     # Theme toggle component
├── lib/                    # Utility functions and configs
│   ├── useAuth.ts          # Authentication hooks
│   ├── useAuthFixed.ts     # Enhanced auth hook
│   └── useTheme.ts         # Theme management
├── public/                 # Static assets
├── .env.local.example      # Environment variables template
├── next.config.js          # Next.js configuration
├── tailwind.config.js      # Tailwind CSS configuration
├── tsconfig.json           # TypeScript configuration
└── README.md               # This file
```

## 🛠 Technology Stack

- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Deployment**: Vercel (ready)

## 🎯 Current Status

**✅ Phase 1: Project Foundation & Supabase Setup**
- Modern Next.js 15 setup with TypeScript
- Supabase integration configured
- Development environment ready

**✅ Phase 2: Frontend Development**
- Clean, modern UI with Tailwind CSS
- Responsive design for all devices
- Type-safe React components

**🔄 Phase 3: Backend Integration**
- Supabase authentication implemented
- Database queries ready
- Role-based access control

**⏳ Phase 4: Deployment**
- Vercel deployment configuration ready
- Environment variables setup
- Production optimizations

## � Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint

## 👥 User Roles

- **Patient**: Can view hospital availability, locations, and manage personal profile
- **Hospital Admin**: Can update hospital bed and oxygen availability, manage hospital information, and profile

## 🗄 Database Structure

The system uses three main tables:
- `hospitals`: Hospital information and locations
- `availability`: Real-time bed and oxygen availability  
- `profiles`: User role management and personal information (name, age, sex, phone_number, hospital_name, address)

## 🎨 UI Features

- Clean, modern Next.js interface
- Advanced profile management system
- Tailwind CSS styling system
- Color-coded availability indicators
- Real-time data updates
- Mobile-responsive design with working navigation
- Dark/Light theme support
- Smooth animations and transitions
- TypeScript for better development experience

## 🔒 Security

- Row Level Security (RLS) enabled on all tables
- Role-based access control
- Secure authentication with Supabase Auth
- Environment variables for sensitive data

## 📱 Browser Support

- Modern browsers with ES6+ support
- Chrome, Firefox, Safari, Edge

## 🐛 Troubleshooting

1. **Environment variables not working**: Make sure `.env.local` file exists and contains correct Supabase credentials
2. **Build errors**: Ensure all TypeScript types are correct
3. **Authentication issues**: Verify Supabase project settings and RLS policies

## 📚 Next Steps

1. Complete Supabase setup using `SUPABASE_SETUP.md`
2. Add your environment variables
3. Test the application locally
4. Deploy to Vercel

## 🚀 Deployment

Ready for deployment to Vercel:

```bash
npm run build
```

The app is optimized for Vercel's platform with automatic deployments from Git.

## 🤝 Contributing

This is a learning project showcasing modern Next.js development practices.

## 📄 License

ISC License - see package.json for details.
