# NORA CONTROL - Backend Architecture

Esta carpeta contiene el "cerebro" de la aplicación, separado de la interfaz de usuario para mejorar la mantenibilidad y escalabilidad.

## Estructura de Carpetas

- `lib/supabase`: Clientes de Supabase para Servidor y Cliente.
  - `server.ts`: Cliente para Server Actions y Server Components.
  - `client.ts`: Cliente para componentes del navegador.
- `lib/services`: Capa de lógica de negocio.
  - `base.service.ts`: Clase base para manejo de errores y respuestas.
  - `inventario.service.ts`: Ejemplo de servicio CRUD.
- `lib/actions`: Server Actions (Controllers).
  - `inventario.actions.ts`: Interfaz tipo "API" para el frontend.
- `lib/types`: Definiciones de TypeScript globales.

## Cómo usar

### Crear un nuevo servicio
1. Hereda de `BaseService`.
2. Implementa tus métodos asíncronos usando el cliente de `supabase/server`.
3. Exporta una instancia del servicio.

### Crear un Server Action
1. Crea un archivo en `lib/actions`.
2. Importa el servicio correspondiente.
3. Exclama `'use server'` al inicio.
4. Exporta funciones que llamen al servicio y manejen la revalidación de caché (usando `revalidatePath`).

### En el Frontend
Importa y llama a los Server Actions directamente en tus eventos o efectos.
