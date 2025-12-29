# Resumen del Proyecto

Esta es una aplicación web Next.js diseñada para un sistema de seguimiento de autobuses. La aplicación facilita el seguimiento de la ubicación de los autobuses en tiempo real, la autenticación de usuarios (para conductores y estudiantes) y la gestión de datos relacionados con los autobuses. Utiliza Supabase para sus servicios de backend, incluyendo la gestión de la base de datos, la autenticación y las funciones en tiempo real. El frontend está construido con React y TypeScript, y estilizado con Tailwind CSS.

---

## <img src="https://cdn.simpleicons.org/nextdotjs/black" alt="Next.js" width="20" height="20" /> Tecnologías Clave

- **Framework:** Next.js
- **Lenguaje:** <img src="https://cdn.simpleicons.org/typescript/blue" alt="TypeScript" width="20" height="20" /> TypeScript
- **Backend:** <img src="https://cdn.simpleicons.org/supabase/green" alt="Supabase" width="20" height="20" /> Supabase (PostgreSQL, Auth, Realtime)
- **Estilos:** <img src="https://cdn.simpleicons.org/tailwindcss/cyan" alt="Tailwind CSS" width="20" height="20" /> Tailwind CSS
- **Componentes UI:** <img src="https://cdn.simpleicons.org/radixui/black" alt="Radix UI" width="20" height="20" /> Radix UI, componentes personalizados
- **Mapa:** <img src="https://cdn.simpleicons.org/leaflet/green" alt="Leaflet" width="20" height="20" /> Leaflet

---

# Construcción y Ejecución

Para ejecutar la aplicación localmente, sigue estos pasos:

1.  **Instalar Dependencias:**

    ```bash
    npm install
    ```

2.  **Ejecutar el Servidor de Desarrollo:**

    ```bash
    npm run dev
    ```

    Esto iniciará el servidor de desarrollo de Next.js, típicamente en `http://localhost:3000`.

3.  **Construir para Producción:**

    ```bash
    npm run build
    ```

4.  **Iniciar el Servidor de Producción:**
    ```bash
    npm run start
    ```

---

## Supabase

El proyecto utiliza Supabase para su backend. La configuración se puede encontrar en `supabase/config.toml`. Para ejecutar los servicios de Supabase localmente, necesitarás la CLI de Supabase.

- **Iniciar servicios de Supabase:**
  ```bash
  supabase start
  ```
- **Detener servicios de Supabase:**
  ```bash
  supabase stop
  ```

---

# Convenciones de Desarrollo

- **Estilos:** El proyecto utiliza Tailwind CSS para los estilos. Se prefieren las clases de utilidad sobre el CSS personalizado.
- **Componentes:** Los componentes de UI reutilizables se encuentran en `src/components`.
- **Cliente Supabase:** El cliente de Supabase se inicializa en `src/utils/supabase/client.ts` para el lado del cliente y en `src/utils/supabase/server.ts` para el lado del servidor.
- **Autenticación:** La autenticación es manejada por Supabase Auth. El formulario de inicio de sesión se puede encontrar en `src/components/login-form.tsx`.
- **Protección de Rutas:** La ruta `/chofer` está protegida mediante middleware. Los usuarios no autenticados que intenten acceder a esta ruta serán redirigidos a la página de inicio de sesión (`/Auth/login`).
- **Migraciones de Base de Datos:** Los cambios en el esquema de la base de datos se gestionan a través de migraciones ubicadas en el directorio `supabase/migrations`.

---

# Esquema de la Base de Datos

El esquema de la base de datos se gestiona a través de Supabase y se define en los archivos de migración SQL ubicados en `supabase/migrations`. Las tablas principales son:

- **`profiles`**: Almacena información del usuario, incluyendo su rol (`chofer` o `estudiante`). Esta tabla está vinculada a la tabla `auth.users`.
- **`buses`**: Contiene información sobre los autobuses, como el número de unidad y la capacidad. Cada autobús tiene asignado un conductor (`driver_id`).
- **`routes`**: Define las rutas de los autobuses, incluyendo el nombre de la ruta y el horario.
- **`stops`**: Representa las paradas de autobús a lo largo de una ruta, con sus coordenadas geográficas (`lat`, `lng`) y orden.
- **`bus_locations`**: Almacena las coordenadas geográficas en tiempo real de los autobuses. Esta tabla está configurada para que Supabase Realtime transmita las actualizaciones de ubicación.

---

# Roles de Usuario y Flujos de Trabajo

La aplicación define dos roles de usuario principales:

- **`chofer` (Conductor):** Los conductores pueden iniciar sesión en la aplicación para compartir la ubicación de su autobús en tiempo real.
  - Después de iniciar sesión, el conductor es llevado al panel de control del conductor.
  - Si el conductor tiene un autobús asignado, puede comenzar o dejar de compartir su ubicación.
  - Si el conductor no tiene un autobús asignado, se le solicita que registre uno.
- **`estudiante` (Estudiante):** La página principal de la aplicación sirve como la vista del estudiante. Aquí, pueden:
  - Ver un mapa con las ubicaciones en tiempo real de todos los autobuses activos.
  - Ver una lista de los autobuses disponibles.
  - Rastrear los autobuses para estimar sus tiempos de llegada.

---

# Funcionalidad en Tiempo Real

La aplicación proporciona seguimiento de autobuses en tiempo real utilizando Supabase Realtime.

- **Transmisión de Ubicaciones:** El componente `DriverTracker`, utilizado por los conductores que han iniciado sesión, es responsable de capturar las coordenadas geográficas del conductor y enviarlas a la tabla `bus_locations` en la base de datos de Supabase.

- **Recepción de Actualizaciones:** El componente `mapview.tsx`, que es la vista principal para los estudiantes, se suscribe a la tabla `bus_locations` utilizando un canal de Supabase Realtime.
  - Cuando se inserta una nueva ubicación en la tabla, Supabase envía una notificación a todos los clientes suscritos.
  - El componente `mapview.tsx` recibe los nuevos datos de ubicación y actualiza los marcadores de los autobuses en el mapa en tiempo real.
  - El componente también dibuja polilíneas en el mapa para representar el recorrido de cada autobús.

---

# Capturas de Pantalla

Aquí puedes añadir capturas de pantalla de tu proyecto para ilustrar las diferentes funcionalidades y la interfaz de usuario.

- **Página Principal (Estudiante):**
  ![Captura de pantalla de la página principal para estudiantes](/path/to/image.png)

- **Panel de Control del Conductor:**
  ![Captura de pantalla del panel de control del conductor](/path/to/imagecopy2.png)

- **Formulario de Registro/Inicio de Sesión:**
  ![Captura de pantalla del formulario de autenticación](/path/to/imagecopy3.png)

- **Gestión de Autobuses (Admin):**
  ![Captura de pantalla de la gestión de autobuses por el admin](/path/to/imagecopy4.png)

- **Otra Característica Importante:**
  ![Descripción de la otra característica importante](/path/to/imagecopy2.png)
