# 🌍 Planora - AI-Powered Travel Planning Web Application

> **Final Year Project (FYP) - Computer Science**  
> **Sunway University | 2025**

Planora is an intelligent travel planning web application that generates personalized, day-by-day itineraries using Google Gemini AI. With a strong focus on cultural inclusivity, Planora offers features like halal food filtering, prayer times integration, mosque recommendations, dietary preferences, and accessibility options to cater to diverse traveler needs.

**🔗 Live Demo:** [planora-green.vercel.app](https://planora-green.vercel.app)

---

## ✨ Key Features

### 🤖 AI-Powered Itinerary Generation
- **Google Gemini AI Integration** for intelligent trip planning
- Personalized day-by-day itineraries based on user preferences
- Real-time activity recommendations with opening hours and pricing
- Dynamic budget allocation across days and activities

### 🕌 Cultural Inclusivity Features
- **Halal Food Filtering** - Automatically filters restaurants for halal options
- **Prayer Times Integration** - Islamic prayer times using Aladhan API
- **Mosque Recommendations** - Nearby mosque suggestions with distances
- **Dietary Preferences** - Vegetarian, vegan, gluten-free, and allergy filtering
- **Accessibility Options** - Wheelchair-accessible venue filtering

### 🗺️ Smart Trip Planning
- **Interactive Map View** - Google Maps integration with activity markers
- **Transportation Calculation** - Automatic route optimization and travel times
- **Hotel Recommendations** - Integration with Booking.com API
- **Weather Forecasting** - 5-day weather predictions for destinations
- **Multi-Currency Support** - Real-time currency conversion for 30+ currencies

### 👤 User Features
- **User Authentication** - Secure sign-in with Google OAuth (NextAuth.js v5)
- **Dashboard** - Manage saved itineraries and preferences
- **Itinerary Editing** - Add, remove, or modify activities
- **PDF Export** - Download itineraries for offline use
- **Share Itineraries** - Public URLs for sharing trip plans

---

## 🛠️ Tech Stack

### Frontend
- **Next.js 14** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first styling
- **Framer Motion** - Smooth animations
- **Lucide React** - Modern icon library

### Backend & APIs
- **Next.js API Routes** - Serverless backend
- **MongoDB** - NoSQL database for user data and itineraries
- **NextAuth.js v5** - Authentication with Google OAuth
- **Google Gemini AI** - Primary AI model for itinerary generation
- **Google Places API** - Venue information and recommendations
- **Google Maps API** - Interactive maps and directions
- **Google Geocoding API** - Location coordinate conversion
- **OpenWeatherMap API** - Weather forecasting
- **Booking.com API** - Hotel recommendations
- **Aladhan API** - Islamic prayer times
- **ExchangeRate-API** - Real-time currency conversion
- **Unsplash API** - Destination imagery

### Deployment
- **Vercel** - Hosting and continuous deployment
- **MongoDB Atlas** - Cloud database hosting

---

## 🔑 Key Innovations

### 4-Stage Post-Processing Pipeline
1. **Transportation Enrichment** - Calculates optimal routes using Google Directions API
2. **Meal Planning** - Strategically places breakfast, lunch, and dinner based on activity timing
3. **Mosque Integration** - Adds nearby mosques for Friday prayers and regular prayer times
4. **Activity Ordering** - Ensures logical flow with opening hours validation

### Hybrid AI Approach
- **Primary:** Google Gemini Flash (gemini-1.5-flash-002) for fast generation
- **Fallback:** Gemini Pro (gemini-1.5-pro-002) for complex requests
- Systematic validation of AI-generated content
- Real-time data integration to ensure accuracy

### Cultural Sensitivity
- Automatic halal restaurant filtering for Muslim travelers
- Prayer time calculations based on user location
- Respect for religious practices in itinerary planning
- Inclusive design for diverse cultural backgrounds

---

## 🎓 Academic Context

This project was developed as a Final Year Project (FYP) for the Bachelor of Computer Science program at Sunway University. The project underwent comprehensive User Acceptance Testing (UAT) with 31 participants, achieving a **97.4% satisfaction rate** and a perfect **Net Promoter Score of +100**.

---

## 👨‍💻 Author

**Ilyana Sofiya (yanasfya)**  
Computer Science Student  
Sunway University

---

**⭐ If you find this project interesting, please consider giving it a star!**

**🔗 Live Demo:** [planora-green.vercel.app](https://planora-green.vercel.app)
