# 🗺️ Damage Map - Public Services Reporting System

An interactive web application for reporting and managing public service damages in Barranquilla, Colombia. Citizens can report issues such as damaged sewers, broken traffic lights, road potholes, and more.

## ✨ Features

- **Interactive map** with Barranquilla geographical boundaries
- **Damage reporting** through form with automatic geolocation
- **Status tracking**: Pending, Under Repair, Resolved
- **Visual markers** with color codes based on status
- **Responsive interface** and user-friendly
- **Informative alerts** to enhance user experience
- **Duplicate prevention** at the same location

## 🛠️ Technologies Used

- **Frontend**: Vanilla JavaScript (ES6+), HTML5, CSS3
- **Map**: Leaflet.js with OpenStreetMap tiles
- **Geocoding**: Nominatim API (OpenStreetMap)
- **Backend**: JSON Server (development)
- **Alerts**: SweetAlert2
- **Build Tool**: Vite
- **Styling**: Custom CSS

## 📋 Prerequisites

- Node.js (version 18 or higher)
- npm or yarn

## 🚀 Installation and Setup

1. **Clone the repository**
   ```bash
   git clone [REPOSITORY_URL]
   cd reporte-de-servicios-publicos
   ```

2. **Install dependencies**
   ```bash
    npm install
   ```

3. **Start development server**
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
│   └── js/
│       ├── alert.js         # Alert configuration
│       ├── config.js        # General configuration
│       ├── mapa.js          # Main map logic
│       └── utils.js         # Utility functions
├── index.html               # Main page
├── package.json             # Dependencies and scripts
└── README.md               # Documentation
```

## 🎯 Application Usage

### For Citizens (Report Damage)

1. **Complete the form**:
   - Enter the neighborhood name
   - Specify the exact address

2. **Submit report**:
   - Click "Reportar Daño" (Report Damage)
   - The system will automatically geocode the address
   - A red marker will be created on the map

### For Administrators (Manage Status)

1. **View reports**: Damages appear as colored circles on the map
2. **Change status**: Click on any marker to:
   - Mark as "Under Repair" (yellow)
   - Mark as "Resolved" (green)

## 🎨 Status and Color Codes

| Status | Color | Description |
|--------|--------|-------------|
| Pending | 🔴 Red | Damage reported, awaiting attention |
| Under Repair | 🟡 Yellow | Damage being repaired |
| Resolved | 🟢 Green | Damage completely fixed |

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

The application is configured to operate only within Barranquilla limits:
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

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/daños` | Get all damages |
| POST | `/daños` | Create new report |
| PATCH | `/daños/:id` | Update damage status |
| DELETE | `/daños/:id` | Delete damage (optional) |

### Data Structure Example

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
- Spanish (default)
- English (interface can be adapted)

## 📊 Performance

- Lazy loading of map tiles
- Debounced search functionality
- Optimized marker clustering for large datasets
- Minimal bundle size with tree shaking

## 🐛 Known Issues

- Geocoding might be slow for some addresses
- Map performance with 1000+ markers needs optimization
- Mobile touch gestures could be improved

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 Authors

- **Camilo Parra** 
- **Keyner Barrio** 
- **Marta Garcia**
- **Jonathan Lopez** 
- **Reinaldo Leal** 
- **Luis Cera** 

## 🙏 Acknowledgments

- **OpenStreetMap** for cartographic data
- **Leaflet.js** for the mapping library
- **Nominatim** for geocoding services
- **Barranquilla Community** for inspiring this tool

---

## 📞 Support

For support, email rexleal360@gmail.com or join our Slack channel.


🌟 **Like the project?** Give it a star on GitHub!