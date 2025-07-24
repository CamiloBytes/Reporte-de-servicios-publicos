# 🗺️ Mapa de Daños - Sistema de Reporte de Servicios Públicos

Una aplicación web interactiva para reportar y gestionar daños en servicios públicos de Barranquilla, Colombia. Los ciudadanos pueden reportar problemas como alcantarillas dañadas, semáforos averiados, baches en las calles, y más.

## ✨ Características

- **Mapa interactivo** con límites geográficos de Barranquilla
- **Reporte de daños** mediante formulario con geolocalización automática
- **Estados de seguimiento**: Pendiente, En reparación, Solucionado
- **Marcadores visuales** con códigos de color según el estado
- **Interfaz responsive** y fácil de usar
- **Alertas informativas** para mejorar la experiencia del usuario
- **Prevención de duplicados** en la misma ubicación

## 🛠️ Tecnologías Utilizadas

- **Frontend**: Vanilla JavaScript (ES6+), HTML5, CSS3
- **Mapa**: Leaflet.js con tiles de OpenStreetMap
- **Geocodificación**: API de Nominatim (OpenStreetMap)
- **Backend**: JSON Server (desarrollo)
- **Alertas**: SweetAlert2
- **Herramienta de construcción**: Vite
- **Estilos**: CSS personalizado

## 📋 Requisitos Previos

- Node.js (versión 18 o superior)
- npm o yarn

## 🚀 Instalación y Configuración

1. **Clonar el repositorio**
   ```bash
   git clone [URL_DEL_REPOSITORIO]
   cd reporte-de-servicios-publicos
   ```

2. **Instalar dependencias**
   ```bash
   npm install
   ```

3. **Iniciar el servidor de desarrollo**
   ```bash
   # Terminal 1: Servidor JSON (Backend)
   npx json-server public/db.json --port 3000

   # Terminal 2: Servidor de desarrollo (Frontend)
   npm run dev
   ```

4. **Abrir la aplicación**
   - Frontend: `http://localhost:5173`
   - API Backend: `http://localhost:3000`

## 📁 Estructura del Proyecto

```
reporte-de-servicios-publicos/
├── public/
│   ├── db.json              # Base de datos JSON
│   └── vite.svg             # Favicon
├── src/
│   └── js/
│       ├── alert.js         # Configuración de alertas
│       ├── config.js        # Configuración general
│       ├── mapa.js          # Lógica principal del mapa
│       └── utils.js         # Funciones utilitarias
├── index.html               # Página principal
├── package.json             # Dependencias y scripts
└── README.md               # Documentación
```

## 🎯 Uso de la Aplicación

### Para Ciudadanos (Reportar Daños)

1. **Completar el formulario**:
   - Ingresa el nombre del barrio
   - Especifica la dirección exacta

2. **Enviar reporte**:
   - Haz clic en "Reportar Daño"
   - El sistema geocodificará automáticamente la dirección
   - Se creará un marcador rojo en el mapa

### Para Administradores (Gestionar Estados)

1. **Ver reportes**: Los daños aparecen como círculos de colores en el mapa
2. **Cambiar estados**: Haz clic en cualquier marcador para:
   - Marcar como "En reparación" (amarillo)
   - Marcar como "Solucionado" (verde)

## 🎨 Estados y Códigos de Color

| Estado       | Color       | Descripción                        |
|--------      |--------     |-------------                       |
| Pendiente    | 🔴 Rojo     | Daño reportado, esperando atención |
| En reparación| 🟡 Amarillo | Daño en proceso de reparación      |
| Solucionado  | 🟢 Verde    | Daño completamente resuelto        |

## 🔧 Configuración

### Variables de Configuración (`src/js/config.js`)

```javascript
export const API_URL = "http://localhost:3000/daños";

export const ESTADOS = {
    pendiente: "red",
    reparacion: "yellow",
    solucionado: "green"
};
```

### Límites Geográficos

La aplicación está configurada para operar únicamente dentro de los límites de Barranquilla:
- **Norte**: 11.05°N
- **Sur**: 10.89°N  
- **Este**: -74.72°W
- **Oeste**: -74.88°W

## 📱 Características Técnicas

### Validaciones Implementadas

- **Campos obligatorios**: Barrio y dirección son requeridos
- **Formato de texto**: Capitalización automática
- **Duplicados**: Prevención de reportes en la misma ubicación
- **Geocodificación**: Validación de direcciones existentes

### Funcionalidades del Mapa

- **Zoom limitado**: Entre niveles 10-18
- **Navegación restringida**: No se puede salir de Barranquilla
- **Marcadores interactivos**: Popups con información y acciones
- **Actualización en tiempo real**: Los cambios se reflejan inmediatamente

## 🚀 Scripts Disponibles

```bash
# Desarrollo
npm run dev          # Inicia servidor de desarrollo

# Producción
npm run build        # Construye la aplicación para producción
npm run preview      # Vista previa de la build de producción

# Base de datos
npx json-server public/db.json --port 3000  # Inicia API REST
```

## 🌐 Endpoints de la API

| Método | Endpoint     | Descripción               |
|--------|----------    |-----------------------     |
| GET    | `/daños`     | Obtener todos los daños   |
| POST   | `/daños`     | Crear nuevo reporte       |
| PATCH  | `/daños/:id` | Actualizar estado de daño |
| DELETE | `/daños/:id` | Eliminar daño (opcional)  |

### Ejemplo de Estructura de Datos

```json
{
  "id": "1",
  "direccion": "Calle 72#45-100, El Prado, Barranquilla, Colombia",
  "lat": 10.998609,
  "lon": -74.8020426,
  "estado": "pendiente"
}
```


## 📈 Mejoras Futuras

- [ ] **Autenticación de usuarios**
- [ ] **Categorías de daños** (Alcantarillado, Iluminación, Vías, etc.)
- [ ] **Subida de fotos** para los reportes
- [ ] **Notificaciones por email/SMS**
- [ ] **Dashboard administrativo** con estadísticas
- [ ] **API REST más robusta** con base de datos real
- [ ] **App móvil** complementaria
- [ ] **Integración con sistemas municipales**

## 🧪 Pruebas

```bash
# Ejecutar pruebas (cuando se implementen)
npm test

# Ejecutar pruebas en modo observador
npm run test:watch

# Ejecutar pruebas con cobertura
npm run test:coverage
```

## 🔒 Consideraciones de Seguridad

- Validación y sanitización de entradas
- Limitación de velocidad para endpoints de la API
- Configuración CORS para producción
- Autenticación para acciones administrativas

## 🌍 Internacionalización

Actualmente disponible en:
- Español (predeterminado)

## 📊 Rendimiento

- Carga perezosa de tiles del mapa
- Funcionalidad de búsqueda con debounce
- Clustering optimizado de marcadores para conjuntos de datos grandes
- Tamaño de bundle mínimo con tree shaking

## 🐛 Problemas Conocidos

- La geocodificación puede ser lenta para algunas direcciones
- El rendimiento del mapa con más de 1000 marcadores necesita optimización
- Los gestos táctiles móviles podrían mejorarse

## 📄 Licencia

Este proyecto está bajo la Licencia MIT - ver el archivo [LICENSE.md](LICENSE.md) para más detalles.

## 👥 Autores

- **Camilo Parra** 
- **Keyner Barrio** 
- **Luis Cera** 
- **Jonathan Lopes** 
- **Martha Garcia**
- **Reinaldo Leal** 


## 🙏 Agradecimientos

- **OpenStreetMap** por los datos cartográficos
- **Leaflet.js** por la librería de mapas
- **Nominatim** por el servicio de geocodificación
- **Comunidad de Barranquilla** por inspirar esta herramienta

🌟 **¿Te gusta el proyecto?** ¡Dale una estrella en GitHub!