# ShipX - Transport Management System

A modern, responsive Transport Management System dashboard built with React, Tailwind CSS, and React Bootstrap.

## Features

- **Dark Theme UI**: Modern dark theme with purple accents matching the ShipX design
- **Responsive Sidebar & Navbar**: Fully responsive navigation that works on mobile, tablet, and desktop
- **Add Order Modal**: Functional modal with form validation for adding new orders
- **File Upload**: Working image file upload in Settings with format validation (PNG, JPG, JPEG, SVG)
- **Role-Based Dashboards**: Support for Agent, Finance, and Admin roles (to be implemented)
- **Toast Notifications**: User-friendly notifications for actions

## Tech Stack

- **React 18**: UI library
- **React Router**: Client-side routing
- **Tailwind CSS**: Utility-first CSS framework
- **React Bootstrap**: UI component library
- **React Toastify**: Toast notifications
- **React Icons**: Icon library
- **Vite**: Build tool and dev server

## Installation

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

3. Build for production:
```bash
npm run build
```

## Project Structure

```
TMS/
├── src/
│   ├── components/
│   │   ├── Sidebar.jsx       # Responsive sidebar navigation
│   │   ├── Navbar.jsx        # Top navigation bar
│   │   ├── AddOrderModal.jsx # Add order modal with form
│   │   └── Layout.jsx        # Main layout wrapper
│   ├── pages/
│   │   ├── Dashboard.jsx     # Dashboard page
│   │   ├── Products.jsx      # Products page with AI insights
│   │   └── Settings.jsx      # Settings page with file upload
│   ├── App.jsx               # Main app component with routing
│   ├── main.jsx              # Entry point
│   └── index.css             # Global styles and Tailwind imports
├── doces/                    # Documentation files
├── package.json
├── tailwind.config.js        # Tailwind configuration
└── vite.config.js            # Vite configuration
```

## Features Implemented

### ✅ UI Theme
- Dark theme with purple accents
- Consistent color palette across all components
- Smooth animations and transitions

### ✅ Responsive Sidebar
- Collapsible sidebar with smooth animations
- Mobile-responsive with overlay
- Active state highlighting
- ShipX AI upgrade card

### ✅ Responsive Navbar
- Search functionality
- Notifications dropdown
- User profile dropdown
- Add Order button

### ✅ Add Order Modal
- Form with validation (Order Name, Order ID, Description, Quantity)
- Error handling and inline error messages
- Success toast notifications
- Dismissible by close button, cancel, or clicking outside

### ✅ Settings Page
- Functional file upload button
- Image format validation (PNG, JPG, JPEG, SVG)
- File preview functionality
- Error handling for invalid formats
- File size validation (5MB limit)

## Color Palette

- **Primary Dark**: `#1a1a1a` - Sidebar and main backgrounds
- **Primary**: `#2d2d2d` - Cards and secondary backgrounds
- **Accent Purple**: `#9333ea` - Primary actions and highlights
- **Text Primary**: `#ffffff` - Main text
- **Text Secondary**: `#a0a0a0` - Secondary text
- **Text Muted**: `#6b6b6b` - Muted text

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Development

The project uses Vite for fast development and building. The dev server runs on `http://localhost:3000` by default.

## License

MIT

