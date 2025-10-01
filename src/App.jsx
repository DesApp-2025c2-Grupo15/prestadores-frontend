import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom"
import Login from "./components/LogIn"
import Dashboard from "./components/Dashboard"
import Solicitudes from "./components/Solicitudes"
import Pacientes from "./components/Pacientes"
import TurnosPendientes from "./components/TurnosPendientes"
import Calendario from "./components/Calendario"
import Inicio from "./components/Inicio"

function App() {
  return (
    <Router>
      <Routes>
        {/* Redirige automáticamente a /login al entrar a / */}
        <Route path="/" element={<Navigate to="/login" replace />} />

        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />}>
          <Route index element={<Pacientes />} /> 
          <Route path="inicio" element={<Inicio />} />
          <Route path="pacientes" element={<Pacientes />} />
          <Route path="solicitudes" element={<Solicitudes />} />
          <Route path="turnospendientes" element={<TurnosPendientes />} />
          <Route path="calendario" element={<Calendario />} />
        </Route>
      </Routes>
    </Router>
  )
}

export default App
