# Mejora del Sistema de Foco en Productos

## Problema Resuelto

Anteriormente, al modificar el precio de un producto (usando los botones +€0.50 / -€0.50) o al editar un producto mediante el formulario de edición, la página se actualizaba y el foco se posicionaba automáticamente en el campo de búsqueda. Esto causaba que el usuario perdiera la referencia visual del producto que acababa de editar.

## Solución Implementada

Se ha implementado un sistema de preservación de foco que mantiene la atención visual en el producto editado mediante:

### 1. Almacenamiento del ID del Producto
Cuando se realiza una acción de edición (cambio de precio o edición completa), se guarda el ID del producto en `sessionStorage`:

```javascript
sessionStorage.setItem('focusProductId', producto.id)
```

### 2. Identificadores Únicos en el DOM
Cada tarjeta de producto ahora tiene identificadores únicos:

```html
<div 
  id="producto-{id}"
  data-producto-id="{id}"
  tabIndex="-1"
>
```

### 3. Restauración del Foco
Después de actualizar el producto, el sistema:
- Busca el elemento del producto en el DOM
- Hace scroll suave hasta centrar el producto en la pantalla
- Establece el foco visual en el producto
- Limpia el ID almacenado en sessionStorage

```javascript
productoElement.scrollIntoView({ behavior: 'smooth', block: 'center' })
productoElement.focus()
```

### 4. Estilos Visuales de Foco
Se agregaron estilos CSS para destacar el producto enfocado:

```css
[data-producto-id]:focus {
  outline: 3px solid #3b82f6;
  outline-offset: 2px;
  box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.2);
}
```

## Archivos Modificados

### 1. `ProductoCard.js`
- **Función `actualizarPrecio`**: Guarda el ID del producto antes de actualizar
- **Elemento raíz**: Añadidos atributos `id`, `data-producto-id` y `tabIndex`

### 2. `InventarioApp.js`
- **`handleProductoActualizado`**: Restaura el foco al producto si hay un ID en sessionStorage
- **`handleEditarProducto`**: Guarda el ID del producto antes de abrir el formulario
- **`handleProductoEditado`**: Guarda el ID del producto después de editarlo
- **Nuevo `useEffect`**: Detecta cuando los productos se actualizan y restaura el foco

### 3. `ProductoCard.css`
- Añadidos estilos para el estado `:focus` con soporte para modo oscuro

## Comportamiento

### Escenario 1: Cambio de Precio (+€0.50 / -€0.50)
1. Usuario hace clic en +€0.50 o -€0.50
2. Se guarda el ID del producto
3. Se actualiza el precio
4. La página se re-renderiza
5. El sistema busca el producto y lo enfoca automáticamente
6. El usuario ve el producto destacado con un borde azul brillante

### Escenario 2: Edición Completa del Producto
1. Usuario hace clic en "Editar"
2. Se guarda el ID del producto
3. Se abre el formulario de edición
4. Usuario modifica datos y guarda
5. Se cierra el formulario
6. La lista se actualiza
7. El sistema enfoca automáticamente el producto editado

### Escenario 3: Fallback al Buscador
Si por alguna razón no se encuentra el producto (ej: fue eliminado, filtrado, etc.), el sistema vuelve al comportamiento anterior y enfoca el campo de búsqueda.

## Ventajas

✅ **Mejor UX**: El usuario no pierde de vista el producto que está editando
✅ **Feedback Visual**: El borde azul indica claramente qué producto fue modificado
✅ **Navegación Suave**: El scroll automático centra el producto en la pantalla
✅ **Compatibilidad**: Funciona con teclado (tab) y mouse
✅ **Modo Oscuro**: Los estilos se adaptan al tema oscuro
✅ **Sin Interferencias**: Si no hay producto para enfocar, se mantiene el comportamiento anterior

## Notas Técnicas

- Se usa `sessionStorage` en lugar de `localStorage` para que el ID no persista entre sesiones
- El `tabIndex="-1"` permite que el div reciba foco programáticamente sin afectar la navegación con teclado
- El timeout de 300ms permite que el DOM se actualice completamente antes de buscar el elemento
- El `behavior: 'smooth'` proporciona una animación suave de scroll
- El `block: 'center'` asegura que el producto quede centrado verticalmente en la pantalla

## Fecha de Implementación
24 de diciembre de 2025
