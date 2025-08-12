# 🔐 Configuración de Autenticación con Google

Esta guía te ayudará a configurar la autenticación con Google para tu aplicación de inventario usando Supabase y Google Cloud Console.

## 📋 Pasos de Configuración

### 1. Configurar Google Cloud Console

#### Paso 1.1: Crear un Proyecto en Google Cloud Console
1. Ve a [Google Cloud Console](https://console.cloud.google.com/)
2. Haz clic en "Seleccionar proyecto" → "Nuevo proyecto"
3. Nombra tu proyecto (ej: "inventario-zrunk3d")
4. Haz clic en "Crear"

#### Paso 1.2: Habilitar la API de Google+
1. En el menú lateral, ve a **APIs y servicios** → **Biblioteca**
2. Busca "Google+ API" y selecciónala
3. Haz clic en "Habilitar"

#### Paso 1.3: Configurar la Pantalla de Consentimiento OAuth
1. Ve a **APIs y servicios** → **Pantalla de consentimiento OAuth**
2. Selecciona **Externo** (para usuarios fuera de tu organización)
3. Completa la información requerida:
   - **Nombre de la aplicación**: "INVENTARIO ZRUNK3D"
   - **Email de soporte del usuario**: tu email
   - **Dominio de la aplicación**: (opcional por ahora)
   - **Email de contacto del desarrollador**: tu email
4. Haz clic en "Guardar y continuar"
5. En **Alcances**, haz clic en "Guardar y continuar" (sin agregar alcances adicionales)
6. En **Usuarios de prueba**, agrega tu email y otros emails que quieras que puedan probar
7. Haz clic en "Guardar y continuar"

#### Paso 1.4: Crear Credenciales OAuth 2.0
1. Ve a **APIs y servicios** → **Credenciales**
2. Haz clic en **+ CREAR CREDENCIALES** → **ID de cliente de OAuth 2.0**
3. Selecciona **Aplicación web**
4. Nombra tu cliente OAuth (ej: "Inventario Web Client")
5. En **Orígenes de JavaScript autorizados**, agrega:
   - `http://localhost:3000` (para desarrollo)
   - Tu dominio de producción cuando lo tengas
6. En **URI de redirección autorizados**, agrega:
   - La URL de callback de Supabase (la obtienes en el siguiente paso)
7. Haz clic en "Crear"
8. **IMPORTANTE**: Guarda el **Client ID** y **Client Secret** que aparecen

### 2. Configurar Supabase

#### Paso 2.1: Obtener la URL de Callback
1. Ve a tu proyecto en [Supabase](https://supabase.com)
2. Navega a **Authentication** → **Providers**
3. Busca **Google** en la lista de proveedores
4. Copia la **Callback URL** que aparece (algo como: `https://tu-proyecto.supabase.co/auth/v1/callback`)

#### Paso 2.2: Volver a Google Cloud Console
1. Ve de vuelta a **Google Cloud Console** → **APIs y servicios** → **Credenciales**
2. Haz clic en el cliente OAuth que creaste
3. En **URI de redirección autorizados**, agrega la URL de callback de Supabase que copiaste
4. Haz clic en "Guardar"

#### Paso 2.3: Configurar Google en Supabase
1. En Supabase, ve a **Authentication** → **Providers**
2. Busca **Google** y haz clic para configurarlo
3. Activa el toggle **Enable sign in with Google**
4. Completa los campos:
   - **Client ID**: El Client ID de Google Cloud Console
   - **Client Secret**: El Client Secret de Google Cloud Console
5. Haz clic en "Save"

### 3. Variables de Entorno

Tu archivo `.env` debe contener:

```env
# Configuración de Supabase (ya existentes)
REACT_APP_SUPABASE_URL=tu_url_de_supabase_aqui
REACT_APP_SUPABASE_ANON_KEY=tu_clave_anonima_aqui

# No necesitas agregar las credenciales de Google aquí
# Supabase las maneja internamente
```

### 4. Configuración de Dominio para Producción

Cuando despliegues a producción:

#### En Google Cloud Console:
1. Ve a **Credenciales** → Tu cliente OAuth
2. En **Orígenes de JavaScript autorizados**, agrega:
   - `https://tu-dominio.com`
3. En **URI de redirección autorizados**, asegúrate de que esté:
   - `https://tu-proyecto.supabase.co/auth/v1/callback`

#### En Supabase:
1. Ve a **Authentication** → **URL Configuration**
2. Configura la **Site URL** a tu dominio de producción
3. Agrega tu dominio a **Additional Redirect URLs** si es necesario

## 🚀 Características Implementadas

### Interfaz de Usuario
- ✅ **Botón principal "Continuar con Google"** con logo oficial
- ✅ **Login tradicional como opción secundaria**
- ✅ **Diseño moderno y responsive**
- ✅ **Estados de carga diferenciados**
- ✅ **Manejo de errores específico para Google**
- ✅ **Tema oscuro/claro completo**

### Funcionalidad de Autenticación
- ✅ **OAuth 2.0 con Google**
- ✅ **Sesión persistente de 24 horas**
- ✅ **Renovación automática de tokens**
- ✅ **Logout seguro**
- ✅ **Fallback a login tradicional**

### Experiencia de Usuario
- ✅ **Un solo clic para autenticarse**
- ✅ **No necesidad de recordar contraseñas**
- ✅ **Información del usuario desde Google**
- ✅ **Proceso de autenticación rápido**

## 🔒 Seguridad

### Configuración de Seguridad
- **OAuth 2.0 estándar** con flujo de autorización
- **Tokens JWT seguros** manejados por Supabase
- **HTTPS obligatorio** en producción
- **Validación de dominio** en Google Cloud Console
- **Alcances mínimos** necesarios (perfil básico)

### Políticas de Privacidad
Google requiere que tengas:
- Política de privacidad publicada
- Términos de servicio (recomendado)
- Uso transparente de los datos del usuario

## 🛠️ Desarrollo y Testing

### Para Desarrollo Local
1. Asegúrate de que `http://localhost:3000` esté en los orígenes autorizados
2. Usa usuarios de prueba agregados en Google Cloud Console
3. La aplicación estará en modo "En desarrollo" hasta que publiques

### Para Publicar la Aplicación
1. Completa toda la información en la pantalla de consentimiento
2. Agrega política de privacidad y términos de servicio
3. Solicita verificación de Google (si planeas tener muchos usuarios)

## 📱 Flujo de Usuario

### Experiencia del Usuario
1. **Usuario hace clic en "Continuar con Google"**
2. **Se abre popup/redirección a Google**
3. **Usuario selecciona su cuenta Google**
4. **Google solicita permisos (solo la primera vez)**
5. **Usuario es redirigido de vuelta a la aplicación**
6. **Sesión iniciada automáticamente por 24 horas**

### Información Obtenida de Google
- Nombre completo
- Email
- Foto de perfil
- ID único de Google

## 🔧 Solución de Problemas

### Errores Comunes

#### "Error 400: redirect_uri_mismatch"
- Verifica que la URL de callback de Supabase esté en las URI de redirección autorizadas
- Asegúrate de que no haya espacios extra o caracteres especiales

#### "Error 403: access_denied"
- Verifica que el usuario esté en la lista de usuarios de prueba
- Asegúrate de que la aplicación esté configurada correctamente

#### "Error: Invalid client"
- Verifica que el Client ID y Client Secret sean correctos en Supabase
- Asegúrate de que las credenciales no hayan expirado

#### "Error de CORS"
- Verifica que tu dominio esté en los orígenes autorizados de Google
- Asegúrate de usar HTTPS en producción

### Logs de Depuración
- Revisa los logs en **Supabase** → **Authentication** → **Logs**
- Revisa los logs en **Google Cloud Console** → **APIs y servicios** → **Credenciales**

## 📞 Recursos Adicionales

- [Documentación OAuth 2.0 de Google](https://developers.google.com/identity/protocols/oauth2)
- [Documentación de Supabase Auth](https://supabase.com/docs/guides/auth)
- [Guía de verificación de aplicaciones de Google](https://support.google.com/cloud/answer/7454865)

## 🎉 ¡Listo!

Una vez completados todos los pasos, tu aplicación tendrá:
- ✅ Autenticación con Google como método principal
- ✅ Login tradicional como respaldo
- ✅ Sesiones de 24 horas
- ✅ Interfaz moderna y responsive
- ✅ Manejo seguro de tokens

¡Tu sistema de autenticación con Google está listo para usar! 🚀 