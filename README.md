# NÖRA CONTROL — Sistema Integral de Gestión Gastronómica

![Versión](https://img.shields.io/badge/version-0.1.0-orange?style=for-the-badge)
![React](https://img.shields.io/badge/React-19-blue?style=for-the-badge&logo=react)
![Next.js](https://img.shields.io/badge/Next.js-15-black?style=for-the-badge&logo=nextdotjs)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.0-38B2AC?style=for-the-badge&logo=tailwindcss)

**NÖRA CONTROL** es una plataforma avanzada de gestión empresarial diseñada específicamente para el sector gastronómico. Enfocada en la eficiencia operativa, la plataforma centraliza el control de ventas (POS), la gestión de inventarios y la coordinación en tiempo real entre el salón y la cocina.

## 🚀 Características Principales

### 👨‍🍳 Panel de Cocina (KDS)
*   **Gestión de Comandas en Tiempo Real**: Visualización de órdenes pendientes con indicadores de urgencia basados en el tiempo transcurrido.
*   **Detalle Dinámico**: Pop-outs interactivos que muestran especificaciones de cada platillo y notas especiales del cliente.
*   **Historial de Órdenes**: Registro detallado de comandas completadas con filtros por fecha y búsqueda inteligente.

### 📦 Gestión de Inventario
*   **Control de Insumos**: Seguimiento preciso de materias primas con alertas visuales de stock mínimo (puntos de reorden).
*   **Multitab View**: Organización por insumos, menú de ventas y recetas para una administración segmentada.
*   **Interfaz Adaptativa**: Diseño optimizado para tablets de cocina y dispositivos móviles.

### 💰 Punto de Venta (Dashboard Cajero)
*   **Gestión de Mesas**: Control visual de órdenes abiertas, tiempos de atención y montos acumulados.
*   **Transacciones**: Flujo rápido de facturación y cierre de caja.

## 🛠️ Stack Tecnológico

*   **Framework**: [Next.js 15](https://nextjs.org/) (App Router)
*   **Lógica de UI**: [React 19](https://react.dev/)
*   **Estilos**: [Tailwind CSS 4.0](https://tailwindcss.com/) (Arquitectura basada en variables CSS nativas)
*   **Tipografía**: Inter & Material Symbols Outlined (Google Fonts)
*   **Iconografía**: Google Material symbols para una interfaz clara y profesional.

## 📱 Diseño y Arquitectura

El sistema sigue los más altos estándares de **UX/UI moderno**:
*   **Glassmorphism**: Uso de transparencias y desenfoques (*backdrop-blur*) para una estética premium.
*   **Responsive Pro**: Layouts flexibles que se adaptan automáticamente a cualquier resolución (Mobile, Tablet, Desktop).
*   **Dark Mode Nativo**: Paleta de colores `nora-blue-900` diseñada para reducir la fatiga visual en entornos de baja luz (cocinas/restaurantes).

## 📥 Instalación y Desarrollo

Para ejecutar el proyecto localmente, asegúrate de tener instalado [Node.js](https://nodejs.org/).

1.  **Clonar el repositorio**:
    ```bash
    git clone https://github.com/tu-usuario/nora_control.git
    cd nora_control
    ```

2.  **Instalar dependencias**:
    ```bash
    npm install
    ```

3.  **Iniciar el servidor de desarrollo**:
    ```bash
    npm run dev
    ```

4.  **Acceder a la aplicación**:
    Abre [http://localhost:3000](http://localhost:3000) en tu navegador.

## 📂 Estructura del Proyecto

```text
nora_control/
├── app/                    # Rutas y páginas de Next.js
│   ├── dashboardAdmin/     # Administración central
│   ├── dashboardCajero/    # Punto de venta y caja
│   ├── dashboardCocina/    # Gestión de preparación y comandas
│   └── ui/                 # Componentes reutilizables y lógica visual
├── public/                 # Recursos estáticos (imágenes, logos)
└── globals.css             # Definición de tokens de diseño y temas
```

## 🔒 Privacidad y Seguridad

Este sistema está diseñado para operar con roles definidos (Admin, Cajero, Cocinero), asegurando que cada usuario acceda únicamente a las herramientas necesarias para su función, optimizando la seguridad de los datos sensibles del negocio.

---
**Desarrollado con ❤️ por el equipo de NÖRA CONTROL CR**
