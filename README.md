# prestadores-frontend
Una aplicación frontend construida con **React**, **Vite** y **Ant Design**, que permite a los usuarios iniciar sesión y acceder a un panel de control.  

## Comenzar

### Instalación
Clonar el repositorio e instalar dependencias:

```bash
git clone
cd prestadores-frontend
npm install

```
### Ejecutar la Aplicacion
Para ejecutar: npm run dev
La aplicación se levantará en el puerto 5173 (por defecto de Vite):


### Desarrollo
Estructura del Proyecto

```plaintext
prestadores-frontend/
├── src/
│   ├── public/
│   ├── components/
│   │   ├── LogIn.jsx             # Pantalla de Login 
│   │   ├── Dashboard.jsx         # Pantalla del Dashboard
│   │   ├── Calendario.jsx        # Componente Calendario
│   │   ├── Pacientes.jsx         # Componente Pacientes
│   │   ├── Solicitudes.jsx       # Componente Solicitudes
│   │   └── Turnos_Pendientes.jsx # Componente Turnos Pendientes
│   ├── services/
│   │   └── authService.js        # Lógica de autenticación con backend
│   ├── App.css                   # Diseño del app
│   ├── App.jsx                   # Definición de rutas principales
│   ├── index.css                 # Diseño del index
│   └── main.jsx                  # Punto de entrada de la aplicación
├── package.json                  # Dependencias del proyecto
└── README.md                     # Documentación del proyecto
```

### Rutas
/ → Página de Login
/dashboard → Panel de control (post login)

