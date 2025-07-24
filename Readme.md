# 🗺️ Damage Map - Public Services Reporting System

An interactive web application for reporting and managing damage to public services in Barranquilla, Colombia. Citizens can report issues such as damaged sewers, broken traffic lights, street potholes, and more.

## ✨ Features

- Interactive map with geographic boundaries of Barranquilla
- Damage reporting through forms with automatic geolocation
- Tracking states: Pending, Under Repair, Resolved
- Visual markers with color codes according to status
- Responsive and user-friendly interface
- Informative alerts to improve user experience
- Prevention of duplicates at the same location

## 🛠️ Technologies Used

- **Frontend:** Vanilla JavaScript (ES6+), HTML5, CSS3
- **Map:** Leaflet.js with OpenStreetMap tiles
- **Geocoding:** Nominatim API (OpenStreetMap)
- **Backend:** JSON Server (development)
- **Alerts:** SweetAlert2
- **Build Tool:** Vite
- **Styles:** Custom CSS

## 📋 Prerequisites

- Node.js (version 18 or higher)
- npm or yarn

## 🚀 Installation and Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/CamiloBytes/Reporte-de-servicios-publicos.git
   cd reporte-de-servicios-publicos
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   # Terminal 1: JSON Server (Backend)
   npx json-server public/db.json --port 3000

   # Terminal 2: Development Server (Frontend)
   npm run dev
   ```

4. **Open the application**
   - Frontend: `http://localhost:5173`
   - API Backend: `http://localhost:3000`

## 📁 Project Structure

```
reporte-de-servicios-publicos/
├── public/
│   ├── db.json              # JSON database
│   └── vite.svg             # Favicon
├── src/
│   ├── css/
│   │   ├── auth-forms-styles.css    # Authentication forms styles
│   │   ├── index-styles.css         # Main page styles
│   │   ├── map.css                  # Map styles
│   │   ├── style-dashboard.css      # Dashboard styles
│   │   └── styles.css               # General styles
│   ├── img/
│   │   └── iconic-removebg-preview.png  # Application logo
│   ├── js/
│   │   ├── maps/
│   │   │   ├── alert.js             # Map-specific alerts
│   │   │   ├── config.js            # Map configuration
│   │   │   ├── mapa.js              # Main map logic
│   │   │   └── utils.js             # Map utilities
│   │   ├── alert.js                 # General alert system
│   │   ├── api.js                   # REST API client
│   │   ├── auth.js                  # Authentication system
│   │   ├── auth-data.js             # Auth + data integration
│   │   ├── dashboard.js             # Dashboard logic
│   │   ├── data.js                  # Data management
│   │   ├── db-panel.js              # Database panel
│   │   ├── form.js                  # Form logic
│   │   ├── login.js                 # Login logic
│   │   └── main.js                  # Main functions
│   └── views/
│       ├── dashboard.html           # Control panel
│       ├── form.html                # Report form
│       └── login.html               # Login page
├── .gitignore                       # Files ignored by Git
├── index.html                       # Main page
├── package.json                     # Dependencies and scripts
├── package-lock.json                # Exact dependency versions
└── README.md                        # Documentation
```

## 🎯 Application Usage

### For Citizens (Report Damage)

1. **Complete the form**:
   - Enter the neighborhood name
   - Specify the exact address

2. **Submit report**:
   - Click "Report Damage"
   - The system will automatically geocode the address
   - A red marker will be created on the map

### For Administrators (Manage States)

1. **View reports**: Damage appears as colored circles on the map
2. **Change states**: Click on any marker to:
   - Mark as "Under Repair" (yellow)
   - Mark as "Resolved" (green)

## 🎨 States and Color Codes

| State | Color | Description |
|-------|-------|-------------|
| Pending | 🔴 Red | Damage reported, awaiting attention |
| Under Repair | 🟡 Yellow | Damage in repair process |
| Resolved | 🟢 Green | Damage completely resolved |

## 🔧 Configuration

### Configuration Variables (`src/js/config.js`)
```javascript
export const API_URL = "http://localhost:3000/daños";

export const ESTADOS = {
    pendiente: "red",
    reparacion: "yellow",
    solucionado: "green"
};
```

### Geographic Boundaries
The application is configured to operate only within Barranquilla's limits:
- **North**: 11.05°N
- **South**: 10.89°N  
- **East**: -74.72°W
- **West**: -74.88°W

## 📱 Technical Features

### Implemented Validations

- **Required fields**: Neighborhood and address are mandatory
- **Text format**: Automatic capitalization
- **Duplicates**: Prevention of reports at the same location
- **Geocoding**: Validation of existing addresses

### Map Functionalities

- **Limited zoom**: Between levels 10-18
- **Restricted navigation**: Cannot leave Barranquilla boundaries
- **Interactive markers**: Popups with information and actions
- **Real-time updates**: Changes are reflected immediately

## 🚀 Available Scripts

```bash
# Development
npm run dev          # Start development server

# Production
npm run build        # Build application for production
npm run preview      # Preview production build

# Database
npx json-server public/db.json --port 3000  # Start REST API
```

## 🌐 API Endpoints

| Method | Endpoint     | Description               |
|--------|----------    |-----------------------     |
| GET    | `/daños`     | Get all damage reports   |
| POST   | `/daños`     | Create new report       |
| PATCH  | `/daños/:id` | Update damage state |
| DELETE | `/daños/:id` | Delete damage (optional)  |

### Example Data Structure
```json
{
  "id": "1",
  "direccion": "Calle 72#45-100, El Prado, Barranquilla, Colombia",
  "lat": 10.998609,
  "lon": -74.8020426,
  "estado": "pendiente"
}
```

## 📈 Future Improvements

- [ ] **User authentication**
- [ ] **Damage categories** (Sewerage, Lighting, Roads, etc.)
- [ ] **Photo upload** for reports
- [ ] **Email/SMS notifications**
- [ ] **Administrative dashboard** with statistics
- [ ] **More robust REST API** with real database
- [ ] **Complementary mobile app**
- [ ] **Integration with municipal systems**

## 🧪 Testing

```bash
# Run tests (when implemented)
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

## 🔒 Security Considerations

- Input validation and sanitization
- Rate limiting for API endpoints
- CORS configuration for production
- Authentication for administrative actions

## 🌍 Internationalization

Currently available in:
- **Spanish** (default)

## 📊 Performance

- Lazy loading of map tiles
- Debounced search functionality
- Optimized marker clustering for large datasets
- Minimal bundle size with tree shaking

## 🐛 Known Issues

- Geocoding can be slow for some addresses
- Map performance with 1000+ markers needs optimization
- Mobile touch gestures could be improved

## 📄 License

This project is under the MIT License - see the [LICENSE.md](LICENSE.md) file for more details.

## 👥 Authors

- Camilo Parra
- Keyner Barrio
- Luis Cera
- Jonathan Lopes
- Martha Garcia
- Reinaldo Leal

## 🙏 Acknowledgments

- OpenStreetMap for cartographic data
- Leaflet.js for the mapping library
- Nominatim for geocoding service
- Barranquilla community for inspiring this tool

🌟 **Like the project?** Give it a star on GitHub!
