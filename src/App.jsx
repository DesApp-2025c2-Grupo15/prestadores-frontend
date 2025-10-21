import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom"
import Login from "./components/LogIn"
import Dashboard from "./components/Dashboard"
import Pacientes from "./components/Pacientes"
import TurnosPendientes from "./components/TurnosPendientes"
import Calendario from "./components/Calendario"
import Inicio from "./components/Inicio"
import Recetas from "./components/Recetas"
import Reintegros from "./components/Reintegros"
import Autorizaciones from "./components/Autorizaciones"
import Situaciones from "./components/Situaciones"

function App() {
  return (
    <Router>
      <Routes>
        {/* Redirige automáticamente a /login al entrar a / */}
        <Route path="/" element={<Navigate to="/login" replace />} />

        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />}>
          <Route index element={<Inicio />} /> 
          <Route path="inicio" element={<Inicio />} />
          <Route path="pacientes" element={<Pacientes />} />
          <Route path="turnospendientes" element={<TurnosPendientes />} />
          <Route path="calendario" element={<Calendario />} />
          <Route path="recetas" element={<Recetas />} />
          <Route path="reintegros" element={<Reintegros />} />
          <Route path="autorizaciones" element={<Autorizaciones />} />
          <Route path="situaciones" element={<Situaciones />} />

        </Route>
      </Routes>
    </Router>
  )
}

export default App
