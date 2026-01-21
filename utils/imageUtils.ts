/**
 * Utilitarios para el manejo y compresión de imágenes
 */
import imageCompression from 'browser-image-compression'

export interface ImageCompressionOptions {
  maxSizeKB: number
  quality: number
  maxWidth?: number
  maxHeight?: number
}

/**
 * Comprime una imagen para que no exceda el tamaño máximo especificado
 * @param file - Archivo de imagen original
 * @param options - Opciones de compresión
 * @returns Promise con el archivo comprimido
 */
export async function compressImage(file: File, options: ImageCompressionOptions = { maxSizeKB: 80, quality: 0.5 }): Promise<File> {
  const { maxSizeKB, maxWidth = 300, maxHeight = 300 } = options

  // Si ya es menor al límite, devolverlo tal como está
  if (file.size <= maxSizeKB * 1024) {
    return file
  }

  try {
    // Configurar opciones de browser-image-compression con límites muy agresivos
    const compressionOptions = {
      maxSizeMB: (maxSizeKB * 0.9) / 1024, // 90% del límite para dar margen
      maxWidthOrHeight: Math.min(maxWidth, maxHeight), // Limitar dimensiones para reducir tamaño
      useWebWorker: true, // Usar Web Worker para mejor rendimiento
      fileType: 'image/jpeg', // JPEG para mejor compresión
      quality: Math.min(0.5, options.quality || 0.5), // Calidad máxima 0.5
      initialQuality: Math.min(0.5, options.quality || 0.5) // Calidad inicial máxima 0.5
    }

    // Comprimir usando la librería
    const compressedBlob = await imageCompression(file, compressionOptions)

    // Si después de la compresión sigue siendo muy grande, intentar una segunda pasada más agresiva
    let finalBlob = compressedBlob
    if (compressedBlob.size > maxSizeKB * 1024) {
      console.log('🔄 Segunda pasada de compresión necesaria...')
      const secondPassOptions = {
        ...compressionOptions,
        maxSizeMB: (maxSizeKB * 0.7) / 1024, // 30% más pequeño
        maxWidthOrHeight: Math.min(250, maxWidth * 0.8, maxHeight * 0.8), // Reducir más las dimensiones
        quality: Math.max(0.2, (options.quality || 0.5) * 0.6), // Reducir calidad aún más
        initialQuality: Math.max(0.2, (options.quality || 0.5) * 0.6)
      }
      finalBlob = await imageCompression(compressedBlob, secondPassOptions)

      // Si aún es muy grande, tercera pasada ultra agresiva
      if (finalBlob.size > maxSizeKB * 1024) {
        console.log('🔄 Tercera pasada ultra agresiva necesaria...')
        const thirdPassOptions = {
          ...compressionOptions,
          maxSizeMB: (maxSizeKB * 0.6) / 1024, // 40% más pequeño
          maxWidthOrHeight: 200, // Muy pequeño
          quality: 0.2, // Calidad mínima
          initialQuality: 0.2
        }
        finalBlob = await imageCompression(finalBlob, thirdPassOptions)
      }
    }

    // Convertir Blob a File para mantener compatibilidad
    const compressedFile = new File([finalBlob], file.name.replace(/\.(png|gif|bmp|webp)$/i, '.jpg'), {
      type: 'image/jpeg', // Forzar JPEG para mejor compresión
      lastModified: Date.now()
    })

    return compressedFile
  } catch (error) {
    console.error('❌ Error en browser-image-compression:', error)

    // En caso de error, devolver la imagen original
    return file
  }
}

/**
 * Valida si un archivo es una imagen válida
 * @param file - Archivo a validar
 * @returns true si es una imagen válida
 */
export function isValidImageFile(file: File): boolean {
  const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']
  return validTypes.includes(file.type)
}

/**
 * Formatea el tamaño de un archivo en un string legible
 * @param bytes - Tamaño en bytes
 * @returns String formateado (ej: "1.2 MB")
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes'

  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}
