# Hospital Bed Tracker

A modern, real-time hospital bed and oxygen cylinder availability tracking system built with **Next.js 15**, **TypeScript**, **Tailwind CSS**, and **Supabase**.

## 🏥 Features

- **Real-time Availability Tracking**: View current bed and oxygen cylinder availability across multiple hospitals
- **Role-based Access**: Different interfaces for patients (view-only) and administrators (can update data)
- **Modern UI**: Clean, responsive design with Tailwind CSS
- **Type Safety**: Full TypeScript implementation
- **Server-Side Rendering**: Fast loading with Next.js App Router

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
Hospital Bed/
├── app/                    # Next.js 13+ App Router
│   ├── dashboard/          # Dashboard page
│   ├── globals.css         # Global styles
│   ├── layout.tsx          # Root layout
│   └── page.tsx            # Home/login page
├── components/             # Reusable React components
├── lib/                    # Utility functions and configs
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

- **Patient**: Can view hospital availability and locations
- **Admin**: Can update hospital bed and oxygen availability

## 🗄 Database Structure

The system uses three main tables:
- `hospitals`: Hospital information and locations
- `availability`: Real-time bed and oxygen availability
- `profiles`: User role management

## 🎨 UI Features

- Clean, modern Next.js interface
- Tailwind CSS styling system
- Color-coded availability indicators
- Real-time data updates
- Mobile-responsive design
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
