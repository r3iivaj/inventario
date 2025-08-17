# 📋 ConfirmationModal - Componente de Confirmación

Un modal reutilizable y elegante para confirmaciones con estilos modernos y múltiples tipos de alerta.

## 🚀 Características

- **4 tipos de modal**: warning, danger, info, success
- **Diseño moderno**: Glassmorphism, sombras, animaciones
- **Accesibilidad**: Tecla Escape, focus automático, backdrop
- **Responsive**: Funciona en mobile y desktop
- **Customizable**: Textos, iconos y colores personalizables
- **Modo oscuro**: Soporte completo para dark mode

## 📖 Uso Básico

```jsx
import ConfirmationModal from './ConfirmationModal'

const [showModal, setShowModal] = useState(false)

const handleConfirm = () => {
  // Tu lógica aquí
  console.log('Acción confirmada')
}

<ConfirmationModal
  isOpen={showModal}
  onClose={() => setShowModal(false)}
  onConfirm={handleConfirm}
  title="Confirmar acción"
  message="¿Estás seguro?"
  confirmText="Sí"
  cancelText="No"
  type="warning"
/>
```

## 🎨 Tipos Disponibles

### 1. **Warning** (Advertencia)
```jsx
<ConfirmationModal
  type="warning"
  title="Confirmar cambios"
  message="Los cambios no guardados se perderán"
  confirmText="Continuar"
  cancelText="Cancelar"
/>
```
- **Icono**: ⚠️
- **Color**: Amarillo
- **Uso**: Cambios que pueden tener consecuencias

### 2. **Danger** (Peligro)
```jsx
<ConfirmationModal
  type="danger"
  title="Eliminar elemento"
  message="Esta acción no se puede deshacer"
  confirmText="Eliminar"
  cancelText="Cancelar"
/>
```
- **Icono**: 🗑️
- **Color**: Rojo
- **Uso**: Acciones destructivas (eliminar, resetear)

### 3. **Info** (Información)
```jsx
<ConfirmationModal
  type="info"
  title="Copiar elemento"
  message="Se creará una copia del elemento actual"
  confirmText="Copiar"
  cancelText="Cancelar"
/>
```
- **Icono**: ℹ️
- **Color**: Azul
- **Uso**: Acciones informativas (copiar, duplicar)

### 4. **Success** (Éxito)
```jsx
<ConfirmationModal
  type="success"
  title="Operación completada"
  message="¿Quieres realizar otra operación?"
  confirmText="Continuar"
  cancelText="Finalizar"
/>
```
- **Icono**: ✅
- **Color**: Verde
- **Uso**: Confirmaciones positivas

## 🛠️ Props Disponibles

| Prop | Tipo | Default | Descripción |
|------|------|---------|-------------|
| `isOpen` | boolean | `false` | Controla si el modal está visible |
| `onClose` | function | - | Función llamada al cerrar el modal |
| `onConfirm` | function | - | Función llamada al confirmar |
| `title` | string | "Confirmar acción" | Título del modal |
| `message` | string/JSX | "¿Estás seguro...?" | Mensaje del modal |
| `confirmText` | string | "Confirmar" | Texto del botón de confirmación |
| `cancelText` | string | "Cancelar" | Texto del botón de cancelar |
| `type` | string | "warning" | Tipo de modal (warning/danger/info/success) |

## 💡 Ejemplos Avanzados

### Con JSX en el mensaje
```jsx
<ConfirmationModal
  type="danger"
  title="Eliminar Producto"
  message={
    <>
      ¿Eliminar <strong>"{producto.nombre}"</strong>?
      <br /><br />
      <span className="text-sm text-gray-500">
        Esta acción eliminará:
      </span>
      <ul className="text-sm mt-2 space-y-1">
        <li>• Toda la información del producto</li>
        <li>• Sus imágenes asociadas</li>
        <li>• Su historial de ventas</li>
      </ul>
    </>
  }
  confirmText="Sí, eliminar"
  cancelText="Cancelar"
/>
```

### Para confirmaciones de navegación
```jsx
<ConfirmationModal
  type="warning"
  title="Cambios sin guardar"
  message="Tienes cambios sin guardar. ¿Quieres salir sin guardar?"
  confirmText="Salir sin guardar"
  cancelText="Continuar editando"
/>
```

### Para acciones de éxito
```jsx
<ConfirmationModal
  type="success"
  title="¡Operación exitosa!"
  message="El producto se ha guardado correctamente. ¿Quieres crear otro?"
  confirmText="Crear otro"
  cancelText="Finalizar"
/>
```

## ⌨️ Atajos de Teclado

- **Escape**: Cierra el modal (equivale a cancelar)
- **Enter**: Confirma la acción (focus automático en botón confirmar)
- **Tab**: Navegación entre botones

## 🎭 Características UX

- **Backdrop blur**: Efecto de desenfoque de fondo
- **Prevent scroll**: Evita scroll de la página cuando está abierto
- **Auto focus**: Focus automático en el botón de confirmación
- **Click outside**: Permite cerrar haciendo clic fuera del modal
- **Animaciones**: Transiciones suaves de entrada y salida
- **Responsive**: Se adapta a pantallas pequeñas

## 🔧 Personalización

### Colores personalizados
Para crear tipos personalizados, modifica el objeto `typeConfig` en el componente:

```jsx
const typeConfig = {
  custom: {
    icon: '🎨',
    iconBg: 'bg-purple-100 dark:bg-purple-900/30',
    iconColor: 'text-purple-600 dark:text-purple-400',
    confirmBg: 'bg-purple-600 hover:bg-purple-700',
    confirmText: 'text-white'
  }
}
```

### Estilos CSS
El componente usa Tailwind CSS. Para personalizaciones específicas, puedes:
- Crear clases CSS personalizadas
- Usar props de className (si se agregan)
- Modificar directamente las clases Tailwind

## 🏆 Buenas Prácticas

1. **Textos claros**: Usa mensajes descriptivos y específicos
2. **Iconos apropiados**: Cada tipo tiene su icono adecuado
3. **Botones específicos**: "Eliminar" vs "Sí", "Crear copia" vs "Confirmar"
4. **Información relevante**: Muestra qué se va a afectar
5. **Escape fácil**: Siempre permite cancelar de múltiples formas
6. **Confirmación doble**: Para acciones críticas, considera confirmación adicional

## 🎯 Casos de Uso Típicos

- ✅ Eliminar productos, usuarios, archivos
- ✅ Copiar/duplicar elementos
- ✅ Navegar con cambios sin guardar  
- ✅ Resetear formularios
- ✅ Cerrar sesión
- ✅ Cambiar configuraciones importantes
- ✅ Confirmar transacciones
- ✅ Publicar contenido