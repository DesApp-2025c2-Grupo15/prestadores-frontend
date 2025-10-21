# prestadores-frontend

Una aplicación frontend construida con **React** y **Ant Design** para la gestión de prestadores médicos. Permite a los prestadores gestionar solicitudes, turnos, pacientes y situaciones terapéuticas.

## Características principales

-  **Autenticación** de prestadores médicos
-  **Gestión de solicitudes** (Autorizaciones, Recetas, Reintegros)
-  **Gestión de pacientes** y afiliados
-  **Calendario de turnos** con filtros por especialidad
-  **Situaciones terapéuticas** con grupo familiar
-  **Dashboard** con resumen y estadísticas
-  **Historia clínica** con notas de turnos

## Comenzar

### Prerrequisitos
- Node.js (versión 16 o superior)
- npm o yarn

### Instalación
Clonar el repositorio e instalar dependencias:

```bash
git clone <url-del-repositorio>
cd prestadores-frontend
npm install
```

### Ejecutar la Aplicación
Para ejecutar en modo desarrollo:
```bash
npm run dev
```

La aplicación se levantará en el puerto 5173 (por defecto de Vite):
```
http://localhost:5173
```

## Estructura del Proyecto

```plaintext
prestadores-frontend/
├── src/
│   ├── components/
│   │   ├── Autorizaciones.jsx     # Gestión de autorizaciones
│   │   ├── Calendario.jsx         # Calendario de turnos
│   │   ├── Dashboard.jsx          # Panel principal con navegación
│   │   ├── DetalleModal.jsx       # Modal de detalles genérico
│   │   ├── EditorModal.jsx        # Modal de edición
│   │   ├── Inicio.jsx             # Página de inicio con dashboard
│   │   ├── Lista.jsx              # Componente lista reutilizable
│   │   ├── LogIn.jsx              # Pantalla de autenticación
│   │   ├── ObservationModal.jsx   # Modal para observaciones
│   │   ├── Pacientes.jsx          # Gestión de pacientes y afiliados
│   │   ├── Recetas.jsx            # Gestión de recetas
│   │   ├── Reintegros.jsx         # Gestión de reintegros
│   │   ├── Situaciones.jsx        # Situaciones terapéuticas
│   │   ├── StateChangeModal.jsx   # Modal cambio de estados
│   │   └── TurnosPendientes.jsx   # Lista de turnos pendientes
│   ├── services/
│   │   ├── afiliados.js           # API calls para afiliados
│   │   ├── api.js                 # Configuración base de axios
│   │   ├── authService.js         # Lógica de autenticación
│   │   ├── autorizaciones.js      # API calls para autorizaciones
│   │   ├── recetas.js             # API calls para recetas
│   │   ├── reintegros.js          # API calls para reintegros
│   │   ├── situaciones.js         # API calls para situaciones
│   │   └── turnos_pendientes.js   # API calls para turnos
│   ├── assets/                    # Recursos estáticos
│   ├── App.css                    # Estilos globales
│   ├── App.jsx                    # Definición de rutas principales
│   ├── index.css                  # Estilos del punto de entrada
│   └── main.jsx                   # Punto de entrada de React
├── package.json                   # Dependencias y scripts
└── README.md                      # Documentación del proyecto
```

## Funcionalidades por módulo

### Autenticación
- Login de prestadores médicos

### Solicitudes
- **Autorizaciones**: Procesamiento de solicitudes de autorización médica
- **Recetas**: Gestión de recetas médicas digitales  
- **Reintegros**: Procesamiento de solicitudes de reintegro

### Pacientes
- Búsqueda de afiliados por DNI, apellido o teléfono
- Visualización de datos del afiliado
- Acceso a historia clínica
- Gestión de grupo familiar

### Turnos
- **Calendario**: Vista mensual de turnos con filtros
- **Turnos Pendientes**: Lista de turnos por confirmar

### Situaciones Terapéuticas
- Gestión de situaciones médicas activas
- Visualización de grupo familiar
- Modificación de fechas y estados
- Alta, baja y modificación de situaciones

## Tecnologías utilizadas

- **React 18** - Biblioteca de interfaces de usuario
- **Vite** - Herramienta de build y desarrollo
- **Ant Design** - Biblioteca de componentes UI
- **React Router** - Navegación entre páginas
- **Axios** - Cliente HTTP para APIs
- **dayjs** - Manipulación de fechas