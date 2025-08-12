# 🔐 Configuración de Autenticación con Supabase

Este documento explica cómo configurar la autenticación en el sistema de inventario usando Supabase.

## 📋 Configuración Inicial

### 1. Variables de Entorno

Crea un archivo `.env` en la raíz del proyecto con las siguientes variables:

```env
# Configuración de Supabase
REACT_APP_SUPABASE_URL=tu_url_de_supabase_aqui
REACT_APP_SUPABASE_ANON_KEY=tu_clave_anonima_aqui
```

### 2. Obtener las Credenciales de Supabase

1. Ve a tu proyecto en [Supabase](https://supabase.com)
2. Navega a **Settings** → **API**
3. Copia la **Project URL** y pégala en `REACT_APP_SUPABASE_URL`
4. Copia la **anon public key** y pégala en `REACT_APP_SUPABASE_ANON_KEY`

### 3. Configurar Duración de Sesión en Supabase

Para configurar que las sesiones duren 24 horas:

1. Ve a tu proyecto en Supabase
2. Navega a **Authentication** → **Settings**
3. En la sección **Session Configuration**:
   - **JWT Expiry**: 86400 (24 horas en segundos)
   - **Refresh Token Expiry**: 604800 (7 días en segundos, para permitir renovación automática)

## 🚀 Características Implementadas

### Sistema de Autenticación
- ✅ **Login con email y contraseña**
- ✅ **Registro de nuevos usuarios**
- ✅ **Sesión persistente durante 24 horas**
- ✅ **Renovación automática de tokens**
- ✅ **Logout seguro**
- ✅ **Detección automática de sesión**

### Interfaz de Usuario
- ✅ **Formulario de login moderno con Tailwind CSS**
- ✅ **Soporte para tema oscuro/claro**
- ✅ **Validación de formularios**
- ✅ **Indicadores de carga**
- ✅ **Manejo de errores**
- ✅ **Mostrar/ocultar contraseña**
- ✅ **Responsive design**

### Integración con la Aplicación
- ✅ **Protección de rutas privadas**
- ✅ **Botón de logout en header**
- ✅ **Información del usuario en sidebar**
- ✅ **Navegación condicional**
- ✅ **Estado de carga global**

## 📱 Cómo Usar

### Para Usuarios Nuevos
1. Haz clic en "¿No tienes una cuenta? Regístrate"
2. Ingresa tu email y contraseña (mínimo 6 caracteres)
3. Haz clic en "Crear cuenta"
4. Cambia a modo login e inicia sesión

### Para Usuarios Existentes
1. Ingresa tu email y contraseña
2. Haz clic en "Iniciar sesión"
3. Tu sesión permanecerá activa durante 24 horas

### Cerrar Sesión
- **Desktop**: Haz clic en el botón "Salir" en el header
- **Mobile**: Abre el menú y haz clic en "Cerrar sesión"

## 🔒 Seguridad

### Configuración de Seguridad Implementada
- **Tokens JWT** con expiración automática
- **Refresh tokens** para renovación automática
- **Almacenamiento seguro** en localStorage
- **Validación de sesión** en cada carga de página
- **Logout seguro** que limpia todos los tokens

### Políticas de Seguridad Recomendadas
Para una implementación en producción, considera:
- Configurar RLS (Row Level Security) en Supabase
- Implementar políticas de acceso por usuario
- Configurar CORS apropiadamente
- Usar HTTPS en producción

## 🛠️ Estructura del Código

```
src/
├── contexts/
│   └── AuthContext.js          # Contexto de autenticación
├── components/
│   ├── Login.js                # Componente de login
│   ├── InventarioApp.js        # App principal (protegida)
│   └── ...
├── config/
│   └── supabase.js             # Configuración de Supabase
└── App.js                      # Componente raíz con autenticación
```

## 🔧 Configuración Avanzada

### Personalizar Duración de Sesión
En `src/config/supabase.js` puedes ajustar:
```javascript
refreshTokenTimeout: 86400000, // 24 horas en milisegundos
```

### Personalizar Comportamiento de Autenticación
En `src/contexts/AuthContext.js` puedes modificar:
- Manejo de errores
- Validaciones adicionales
- Callbacks de eventos de autenticación

## 📞 Soporte

Si tienes problemas con la autenticación:
1. Verifica que las variables de entorno estén configuradas correctamente
2. Asegúrate de que tu proyecto de Supabase esté activo
3. Revisa la configuración de JWT en Supabase
4. Verifica que la URL de Supabase sea correcta

## 🎨 Personalización

El sistema de autenticación está completamente integrado con:
- **Tailwind CSS** para estilos
- **Tema oscuro/claro** automático
- **Responsive design** para móviles
- **Iconos SVG** incluidos

¡Ya puedes usar el sistema de autenticación en tu aplicación de inventario! 🚀 