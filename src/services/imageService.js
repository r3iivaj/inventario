import { supabase } from '../config/supabase'

export const imageService = {

  // Subir imagen al storage de Supabase
  async uploadImage(file, fileName) {
    try {
      // Generar un nombre único para el archivo
      const timestamp = Date.now()
      const uniqueFileName = `${timestamp}_${fileName.replace(/[^a-zA-Z0-9.-]/g, '_')}`
      
      console.log('Intentando subir imagen:', uniqueFileName, 'al bucket: productos-imagenes')
      
      const { data, error } = await supabase.storage
        .from('productos-imagenes')
        .upload(uniqueFileName, file, {
          cacheControl: '3600',
          upsert: false
        })

      if (error) {
        console.error('Error detallado de Supabase:', error)
        
        // Proporcionar mensajes de error más específicos
        let errorMessage = error.message
        let needsConfiguration = false
        
        if (error.message.includes('row-level security policy') || error.message.includes('policy')) {
          errorMessage = `🔐 Error de políticas de seguridad:

Las políticas RLS no están configuradas correctamente.

📋 Solución:
1. Ve al Dashboard de Supabase
2. Storage > productos-imagenes > Policies
3. Crea estas 4 políticas:

INSERT: auth.role() = 'authenticated'
SELECT: true  
UPDATE: auth.role() = 'authenticated'
DELETE: auth.role() = 'authenticated'`
          needsConfiguration = true
        } else if (error.message.includes('Unauthorized') || error.statusCode === '401') {
          errorMessage = '❌ No tienes permisos para subir imágenes. Asegúrate de estar autenticado con Google.'
          needsConfiguration = true
        } else if (error.message.includes('not found') || error.statusCode === '404') {
          errorMessage = '📁 El bucket "productos-imagenes" no existe o no es accesible. Verifica que esté creado y sea público.'
          needsConfiguration = true
        } else if (error.message.includes('Invalid bucket')) {
          errorMessage = '⚠️ Bucket inválido. Asegúrate de que el bucket "productos-imagenes" existe y está configurado como público.'
          needsConfiguration = true
        }
        
        return {
          success: false,
          error: errorMessage,
          needsConfiguration,
          originalError: error
        }
      }

      console.log('Imagen subida exitosamente:', data)

      // Obtener la URL pública de la imagen
      const { data: urlData } = supabase.storage
        .from('productos-imagenes')
        .getPublicUrl(uniqueFileName)

      console.log('URL pública generada:', urlData.publicUrl)

      return {
        success: true,
        url: urlData.publicUrl,
        path: uniqueFileName
      }
    } catch (error) {
      console.error('Error inesperado al subir imagen:', error)
      return {
        success: false,
        error: 'Error inesperado: ' + error.message,
        needsConfiguration: true
      }
    }
  },

  // Eliminar imagen del storage
  async deleteImage(imagePath) {
    try {
      // Extraer solo el nombre del archivo de la URL completa
      const fileName = imagePath.split('/').pop()
      
      const { error } = await supabase.storage
        .from('productos-imagenes')
        .remove([fileName])

      if (error) {
        throw error
      }

      return { success: true }
    } catch (error) {
      console.error('Error al eliminar imagen:', error)
      return {
        success: false,
        error: error.message
      }
    }
  },

  // Verificar si una URL es del storage de Supabase
  isSupabaseStorageUrl(url) {
    if (!url) return false
    return url.includes('supabase') && url.includes('storage')
  },

  // Extraer el path del archivo de una URL de Supabase Storage
  extractPathFromUrl(url) {
    if (!this.isSupabaseStorageUrl(url)) return null
    
    try {
      const urlParts = url.split('/storage/v1/object/public/productos-imagenes/')
      return urlParts[1] || null
    } catch (error) {
      return null
    }
  }
}