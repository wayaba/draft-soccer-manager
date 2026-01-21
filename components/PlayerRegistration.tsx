import React, { useState, useRef } from 'react'
import { Player, PlayerReference, PositionNames, getAvailableSecondaryPositions } from '../types'
import { Plus, Search, Trash2, UserCircle, Database, Upload, X, AlertCircle } from 'lucide-react'
import Avatar from './Avatar'
import { compressImage, isValidImageFile, formatFileSize } from '../utils/imageUtils'
import { validatePlayerForm, validateName, validateBirthDate, validateDNI, validatePhone, validateEmail, FormErrors } from '../utils/validation'

interface Props {
  players: Player[]
  onAddPlayer: (p: Player) => void
  onDeletePlayer: (id: string) => void
}

const REFERENCES: PlayerReference[] = [
  'Padre de Alumno',
  'Ex Alumno Egresado >34',
  'Padre de Alumno Egresado',
  'Docente',
  'Invitado',
  'Padre de Alumno No Egresado',
  'Otro'
]

const FIRST_NAMES = [
  'Juan',
  'Bautista',
  'Mateo',
  'Santiago',
  'Ignacio',
  'Lucas',
  'Nicolas',
  'Julian',
  'Tomas',
  'Felipe',
  'Marcos',
  'Agustin',
  'Valentin',
  'Benjamin',
  'Joaquin'
]
const LAST_NAMES = [
  'González',
  'Rodriguez',
  'Gómez',
  'Fernández',
  'López',
  'Díaz',
  'Martínez',
  'Pérez',
  'García',
  'Sánchez',
  'Romero',
  'Álvarez',
  'Torres',
  'Ruiz',
  'Ramírez'
]

const PlayerRegistration: React.FC<Props> = ({ players, onAddPlayer, onDeletePlayer }) => {
  console.log('🏗️ PlayerRegistration component rendered')
  console.log('🎮 Props received:', { playersCount: players.length, onAddPlayer: typeof onAddPlayer, onDeletePlayer: typeof onDeletePlayer })

  const [searchTerm, setSearchTerm] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [selectedImage, setSelectedImage] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string>('')
  const [isCompressing, setIsCompressing] = useState(false)
  const [formErrors, setFormErrors] = useState<FormErrors>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const formRef = useRef<HTMLFormElement>(null)

  const [formData, setFormData] = useState<Partial<Player>>({
    primaryPos: 1,
    secondaryPos: 2,
    reference: 'Otro'
  })

  // Función helper para obtener error de un campo específico
  const getFieldError = (fieldName: string): string | undefined => {
    return formErrors[fieldName]
  }

  // Función para validar un campo específico en tiempo real
  const validateFieldOnChange = (fieldName: string, value: any) => {
    let validationResult

    switch (fieldName) {
      case 'firstName':
        validationResult = validateName(value, 'El nombre')
        break
      case 'lastName':
        validationResult = validateName(value, 'El apellido')
        break
      case 'birthDate':
        validationResult = validateBirthDate(value)
        break
      case 'dni':
        validationResult = validateDNI(value)
        break
      case 'phone':
        validationResult = validatePhone(value)
        break
      case 'email':
        validationResult = validateEmail(value)
        break
      default:
        return
    }

    setFormErrors((prev) => {
      const newErrors = { ...prev }
      if (validationResult.isValid) {
        delete newErrors[fieldName]
      } else {
        newErrors[fieldName] = validationResult.message!
      }
      return newErrors
    })
  }

  // Función para calcular la edad
  const calculateAge = (birthDate: string): number => {
    if (!birthDate) return 0
    const birth = new Date(birthDate)
    const today = new Date()
    let age = today.getFullYear() - birth.getFullYear()
    const monthDiff = today.getMonth() - birth.getMonth()

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--
    }

    return age
  }

  // Función para manejar la selección de imagen
  const handleImageSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Validar que sea una imagen
    if (!isValidImageFile(file)) {
      alert('Por favor selecciona un archivo de imagen válido (JPEG, PNG, WEBP, GIF)')
      return
    }

    setIsCompressing(true)
    try {
      // Comprimir la imagen con límites muy agresivos para evitar errores 413
      const compressedFile = await compressImage(file, {
        maxSizeKB: 80, // Límite muy conservador para evitar errores del servidor (límite: 100KB)
        quality: 0.5, // Calidad reducida para mayor compresión
        maxWidth: 300, // Máximo 300px de ancho
        maxHeight: 300 // Máximo 300px de alto
      })

      // Crear preview
      const reader = new FileReader()
      reader.onload = (e) => {
        const result = e.target?.result as string
        setImagePreview(result)
      }
      reader.readAsDataURL(compressedFile)

      setSelectedImage(compressedFile)

      console.log(`📸 Imagen comprimida:`)
      console.log(`  Original: ${formatFileSize(file.size)}`)
      console.log(`  Comprimida: ${formatFileSize(compressedFile.size)}`)
      console.log(`  Reducción: ${Math.round((1 - compressedFile.size / file.size) * 100)}%`)
    } catch (error) {
      console.error('Error al comprimir imagen:', error)
      alert('Error al procesar la imagen. Por favor intenta con una imagen más pequeña.')
    } finally {
      setIsCompressing(false)
    }
  }

  // Función para remover imagen seleccionada
  const handleRemoveImage = () => {
    setSelectedImage(null)
    setImagePreview('')
  }

  const handleSubmit = (e: React.FormEvent) => {
    console.log('🔥 HANDLESUBMIT EJECUTADO - EVENT:', e)
    // Prevenir envío del formulario
    e.preventDefault()

    console.log('🚀 Iniciando validación del formulario...')

    // PASO 1: Preparar datos para validación
    const dataToValidate = {
      firstName: formData.firstName?.trim() || '',
      lastName: formData.lastName?.trim() || '',
      birthDate: formData.birthDate || '',
      dni: formData.dni?.trim() || '',
      phone: formData.phone?.trim() || '',
      email: formData.email?.trim() || '',
      primaryPos: Number(formData.primaryPos),
      secondaryPos: Number(formData.secondaryPos),
      reference: formData.reference || 'Otro'
    }

    console.log('📋 Datos a validar:', dataToValidate)

    // PASO 2: Validar TODOS los campos y recopilar errores
    const validationErrors: FormErrors = {}

    // Validación de nombre
    const nameValidation = validateName(dataToValidate.firstName, 'El nombre')
    if (!nameValidation.isValid) {
      validationErrors.firstName = nameValidation.message!
      console.log('❌ Error en nombre:', nameValidation.message)
    }

    // Validación de apellido
    const lastNameValidation = validateName(dataToValidate.lastName, 'El apellido')
    if (!lastNameValidation.isValid) {
      validationErrors.lastName = lastNameValidation.message!
      console.log('❌ Error en apellido:', lastNameValidation.message)
    }

    // Validación de fecha de nacimiento
    const birthDateValidation = validateBirthDate(dataToValidate.birthDate)
    if (!birthDateValidation.isValid) {
      validationErrors.birthDate = birthDateValidation.message!
      console.log('❌ Error en fecha:', birthDateValidation.message)
    }

    // Validación de DNI
    const dniValidation = validateDNI(dataToValidate.dni)
    if (!dniValidation.isValid) {
      validationErrors.dni = dniValidation.message!
      console.log('❌ Error en DNI:', dniValidation.message)
    }

    // Validación de teléfono
    const phoneValidation = validatePhone(dataToValidate.phone)
    if (!phoneValidation.isValid) {
      validationErrors.phone = phoneValidation.message!
      console.log('❌ Error en teléfono:', phoneValidation.message)
    }

    // Validación de email
    const emailValidation = validateEmail(dataToValidate.email)
    if (!emailValidation.isValid) {
      validationErrors.email = emailValidation.message!
      console.log('❌ Error en email:', emailValidation.message)
    }

    // Validación de posiciones
    if (dataToValidate.primaryPos === dataToValidate.secondaryPos) {
      validationErrors.positions = 'Las posiciones primaria y secundaria deben ser diferentes'
      console.log('❌ Error en posiciones: son iguales')
    }

    // PASO 3: Si hay errores de validación, mostrarlos y DETENER el proceso
    if (Object.keys(validationErrors).length > 0) {
      console.log('🛑 ERRORES ENCONTRADOS - DETENIENDO ENVÍO')
      console.log('📝 Lista de errores:', validationErrors)

      // Actualizar estado con errores para mostrar en la UI
      setFormErrors(validationErrors)

      // Opcional: Mostrar alerta con resumen de errores
      const errorList = Object.values(validationErrors).join('\n• ')
      alert(`❌ Errores de validación encontrados:\n\n• ${errorList}`)

      // IMPORTANTE: No continuar con el proceso
      return
    }

    // PASO 4: Si llegamos aquí, no hay errores de validación
    console.log('✅ Validación exitosa - Continuando con verificaciones adicionales...')

    // Limpiar errores anteriores
    setFormErrors({})

    // Iniciar proceso de envío
    setIsSubmitting(true)

    // Verificar DNI duplicado
    const existingPlayerDNI = players.find((p) => p.dni === dataToValidate.dni)
    if (existingPlayerDNI) {
      console.log('❌ DNI duplicado encontrado')
      setFormErrors({ dni: 'Ya existe un jugador registrado con ese DNI' })
      setIsSubmitting(false)
      alert('Ya existe un jugador registrado con ese DNI')
      return
    }

    // Verificar email duplicado
    const existingPlayerEmail = players.find((p) => p.email.toLowerCase() === dataToValidate.email.toLowerCase())
    if (existingPlayerEmail) {
      console.log('❌ Email duplicado encontrado')
      setFormErrors({ email: 'Ya existe un jugador registrado con ese email' })
      setIsSubmitting(false)
      alert('Ya existe un jugador registrado con ese email')
      return
    }

    // PASO 5: Todo válido - Crear y agregar jugador
    console.log('🎉 Todos los campos válidos - Creando jugador...')

    const newPlayer: Player = {
      id: crypto.randomUUID(),
      dni: dataToValidate.dni,
      firstName: dataToValidate.firstName,
      lastName: dataToValidate.lastName,
      birthDate: dataToValidate.birthDate,
      phone: dataToValidate.phone,
      email: dataToValidate.email,
      primaryPos: dataToValidate.primaryPos,
      secondaryPos: dataToValidate.secondaryPos,
      reference: (dataToValidate.reference as PlayerReference) || 'Otro',
      role: 'JUGADOR',
      avatar: imagePreview || undefined
    }

    console.log('✅ Jugador creado exitosamente:', newPlayer)

    // Ejecutar la acción de agregar jugador (esto sería el "request al backend")
    onAddPlayer(newPlayer)

    // Limpiar formulario después del éxito
    setFormData({ primaryPos: 1, secondaryPos: 2, reference: 'Otro' })
    setSelectedImage(null)
    setImagePreview('')
    setFormErrors({})
    setIsSubmitting(false)
    setShowForm(false)

    console.log('🏁 Proceso completado exitosamente')
  }

  const simulatePlayers = () => {
    const availablePositions = [1, 2, 3, 4, 5, 7, 8, 9, 10, 11]
    for (let i = 0; i < 20; i++) {
      const fName = FIRST_NAMES[Math.floor(Math.random() * FIRST_NAMES.length)]
      const lName = LAST_NAMES[Math.floor(Math.random() * LAST_NAMES.length)]
      const pPos = availablePositions[Math.floor(Math.random() * availablePositions.length)]
      const availableSecondary = availablePositions.filter((pos) => pos !== pPos)
      const sPos = availableSecondary[Math.floor(Math.random() * availableSecondary.length)]

      // Fix: Added missing 'role' property (1-based line 62 area)
      const newPlayer: Player = {
        id: crypto.randomUUID(),
        dni: Math.floor(10000000 + Math.random() * 40000000).toString(),
        firstName: fName,
        lastName: lName,
        birthDate: `19${Math.floor(70 + Math.random() * 30)}-0${Math.floor(1 + Math.random() * 8)}-${Math.floor(10 + Math.random() * 18)}`,
        phone: `11${Math.floor(10000000 + Math.random() * 80000000)}`,
        email: `${fName.toLowerCase()}.${lName.toLowerCase()}@example.com`,
        primaryPos: pPos,
        secondaryPos: sPos,
        reference: REFERENCES[Math.floor(Math.random() * REFERENCES.length)],
        role: 'JUGADOR'
      }
      onAddPlayer(newPlayer)
    }
  }

  const filteredPlayers = players.filter((p) => `${p.firstName} ${p.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) || p.dni.includes(searchTerm))

  console.log('🔄 Component state:', {
    showForm,
    isSubmitting,
    formErrorsCount: Object.keys(formErrors).length,
    filteredPlayersCount: filteredPlayers.length
  })

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h2 className="text-3xl font-bold text-slate-800">Registro de Jugadores</h2>
          <p className="text-slate-500">Base de datos central del torneo.</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={simulatePlayers}
            className="bg-slate-100 text-slate-600 px-5 py-2.5 rounded-xl font-semibold flex items-center gap-2 hover:bg-slate-200 transition-colors border border-slate-200"
          >
            <Database size={18} /> Simular 20 Jugadores
          </button>
          <button
            onClick={() => {
              console.log('📝 Botón "Registrar Jugador" clickeado, showForm actual:', showForm)
              setShowForm(!showForm)
              if (!showForm) {
                // Limpiar errores al abrir el formulario
                setFormErrors({})
              } else {
                // Limpiar formulario y errores al cerrar
                setFormData({ primaryPos: 1, secondaryPos: 2, reference: 'Otro' })
                setSelectedImage(null)
                setImagePreview('')
                setFormErrors({})
              }
            }}
            className="bg-emerald-600 text-white px-5 py-2.5 rounded-xl font-semibold flex items-center gap-2 hover:bg-emerald-700 transition-colors shadow-md shadow-emerald-200"
          >
            {showForm ? (
              'Cerrar Formulario'
            ) : (
              <>
                <Plus size={20} /> Registrar Jugador
              </>
            )}
          </button>
        </div>
      </div>

      {showForm && (
        <div className="bg-white p-8 rounded-3xl shadow-xl border border-slate-100 mb-8 animate-in fade-in slide-in-from-top-4 duration-300">
          {console.log('📋 Formulario siendo renderizado')}
          <form onSubmit={handleSubmit} noValidate className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">Nombre</label>
              <div className="relative">
                <input
                  name="firstName"
                  type="text"
                  className={`w-full p-3 rounded-xl border focus:ring-2 focus:ring-emerald-500 outline-none transition-colors ${
                    getFieldError('firstName') ? 'border-red-500 bg-red-50' : 'border-slate-200'
                  }`}
                  value={formData.firstName || ''}
                  onChange={(e) => {
                    const value = e.target.value
                    setFormData({ ...formData, firstName: value })
                  }}
                  placeholder="Ingrese el nombre"
                />
                {getFieldError('firstName') && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    <AlertCircle size={18} className="text-red-500" />
                  </div>
                )}
              </div>
              {getFieldError('firstName') && (
                <p className="text-red-600 text-xs mt-1 flex items-center gap-1">
                  <AlertCircle size={14} />
                  {getFieldError('firstName')}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">Apellido</label>
              <div className="relative">
                <input
                  name="lastName"
                  type="text"
                  className={`w-full p-3 rounded-xl border focus:ring-2 focus:ring-emerald-500 outline-none transition-colors ${
                    getFieldError('lastName') ? 'border-red-500 bg-red-50' : 'border-slate-200'
                  }`}
                  value={formData.lastName || ''}
                  onChange={(e) => {
                    const value = e.target.value
                    setFormData({ ...formData, lastName: value })
                  }}
                  placeholder="Ingrese el apellido"
                />
                {getFieldError('lastName') && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    <AlertCircle size={18} className="text-red-500" />
                  </div>
                )}
              </div>
              {getFieldError('lastName') && (
                <p className="text-red-600 text-xs mt-1 flex items-center gap-1">
                  <AlertCircle size={14} />
                  {getFieldError('lastName')}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">DNI</label>
              <div className="relative">
                <input
                  name="dni"
                  type="text"
                  className={`w-full p-3 rounded-xl border focus:ring-2 focus:ring-emerald-500 outline-none transition-colors ${
                    getFieldError('dni') ? 'border-red-500 bg-red-50' : 'border-slate-200'
                  }`}
                  value={formData.dni || ''}
                  onChange={(e) => {
                    const value = e.target.value
                    setFormData({ ...formData, dni: value })
                  }}
                  placeholder="Ej: 12345678"
                />
                {getFieldError('dni') && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    <AlertCircle size={18} className="text-red-500" />
                  </div>
                )}
              </div>
              {getFieldError('dni') && (
                <p className="text-red-600 text-xs mt-1 flex items-center gap-1">
                  <AlertCircle size={14} />
                  {getFieldError('dni')}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">Fecha Nacimiento</label>
              <div className="relative">
                <input
                  name="birthDate"
                  type="date"
                  className={`w-full p-3 rounded-xl border focus:ring-2 focus:ring-emerald-500 outline-none transition-colors ${
                    getFieldError('birthDate') ? 'border-red-500 bg-red-50' : 'border-slate-200'
                  }`}
                  value={formData.birthDate || ''}
                  onChange={(e) => {
                    const value = e.target.value
                    setFormData({ ...formData, birthDate: value })
                  }}
                />
                {getFieldError('birthDate') && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    <AlertCircle size={18} className="text-red-500" />
                  </div>
                )}
              </div>
              {getFieldError('birthDate') && (
                <p className="text-red-600 text-xs mt-1 flex items-center gap-1">
                  <AlertCircle size={14} />
                  {getFieldError('birthDate')}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">Celular</label>
              <div className="relative">
                <input
                  name="phone"
                  type="tel"
                  className={`w-full p-3 rounded-xl border focus:ring-2 focus:ring-emerald-500 outline-none transition-colors ${
                    getFieldError('phone') ? 'border-red-500 bg-red-50' : 'border-slate-200'
                  }`}
                  value={formData.phone || ''}
                  onChange={(e) => {
                    const value = e.target.value
                    setFormData({ ...formData, phone: value })
                  }}
                  placeholder="Ej: +54 9 11 1234-5678 ó 1123456789"
                />
                {getFieldError('phone') && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    <AlertCircle size={18} className="text-red-500" />
                  </div>
                )}
              </div>
              {getFieldError('phone') && (
                <p className="text-red-600 text-xs mt-1 flex items-center gap-1">
                  <AlertCircle size={14} />
                  {getFieldError('phone')}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">Email</label>
              <div className="relative">
                <input
                  name="email"
                  type="email"
                  className={`w-full p-3 rounded-xl border focus:ring-2 focus:ring-emerald-500 outline-none transition-colors ${
                    getFieldError('email') ? 'border-red-500 bg-red-50' : 'border-slate-200'
                  }`}
                  value={formData.email || ''}
                  onChange={(e) => {
                    const value = e.target.value
                    setFormData({ ...formData, email: value })
                  }}
                  placeholder="ejemplo@correo.com"
                />
                {getFieldError('email') && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    <AlertCircle size={18} className="text-red-500" />
                  </div>
                )}
              </div>
              {getFieldError('email') && (
                <p className="text-red-600 text-xs mt-1 flex items-center gap-1">
                  <AlertCircle size={14} />
                  {getFieldError('email')}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">Posición Primaria</label>
              <select
                className="w-full p-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none"
                value={formData.primaryPos}
                onChange={(e) => {
                  const newPrimaryPos = Number(e.target.value)
                  const availableSecondary = getAvailableSecondaryPositions(newPrimaryPos)
                  const firstAvailableSecondary = Number(Object.keys(availableSecondary)[0])
                  setFormData({
                    ...formData,
                    primaryPos: newPrimaryPos,
                    secondaryPos: firstAvailableSecondary
                  })
                }}
              >
                {Object.entries(PositionNames).map(([val, name]) => (
                  <option key={val} value={val}>
                    {name}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">Posición Secundaria</label>
              <div className="relative">
                <select
                  className={`w-full p-3 rounded-xl border focus:ring-2 focus:ring-emerald-500 outline-none transition-colors ${
                    formData.primaryPos === formData.secondaryPos ? 'border-yellow-500 bg-yellow-50' : 'border-slate-200'
                  }`}
                  value={formData.secondaryPos}
                  onChange={(e) => setFormData({ ...formData, secondaryPos: Number(e.target.value) })}
                  disabled={!formData.primaryPos}
                >
                  {Object.entries(getAvailableSecondaryPositions(formData.primaryPos || 1)).map(([val, name]) => (
                    <option key={val} value={val}>
                      {name}
                    </option>
                  ))}
                </select>
                {formData.primaryPos === formData.secondaryPos && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    <AlertCircle size={18} className="text-yellow-600" />
                  </div>
                )}
              </div>
              {formData.primaryPos === formData.secondaryPos && (
                <p className="text-yellow-600 text-xs mt-1 flex items-center gap-1">
                  <AlertCircle size={14} />
                  La posición secundaria debe ser diferente a la primaria
                </p>
              )}
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">Referencia</label>
              <select
                className="w-full p-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none"
                value={formData.reference}
                onChange={(e) => setFormData({ ...formData, reference: e.target.value as PlayerReference })}
              >
                {REFERENCES.map((ref) => (
                  <option key={ref} value={ref}>
                    {ref}
                  </option>
                ))}
              </select>
            </div>

            {/* Campo para avatar */}
            <div className="md:col-span-3 space-y-4 pt-4 border-t border-slate-100">
              <label className="text-sm font-semibold text-slate-700">Foto del Jugador (Opcional)</label>

              {!imagePreview ? (
                <div className="flex items-center justify-center w-full">
                  <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-slate-300 border-dashed rounded-xl cursor-pointer bg-slate-50 hover:bg-slate-100 transition-colors">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      {isCompressing ? (
                        <div className="flex items-center gap-2 text-slate-600">
                          <div className="w-5 h-5 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
                          <span className="text-sm">Comprimiendo imagen...</span>
                        </div>
                      ) : (
                        <>
                          <Upload className="w-8 h-8 mb-2 text-slate-400" />
                          <p className="mb-2 text-sm text-slate-500">
                            <span className="font-semibold">Haz clic para subir</span> o arrastra aquí
                          </p>
                          <p className="text-xs text-slate-400">PNG, JPG, WEBP (MAX. 80KB - se comprime automáticamente)</p>
                        </>
                      )}
                    </div>
                    <input type="file" className="hidden" accept="image/*" onChange={handleImageSelect} disabled={isCompressing} />
                  </label>
                </div>
              ) : (
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <img src={imagePreview} alt="Preview" className="w-20 h-20 rounded-full object-cover border-2 border-slate-200" />
                    <button
                      type="button"
                      onClick={handleRemoveImage}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                    >
                      <X size={14} />
                    </button>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-slate-700">Imagen lista</p>
                    <p className="text-xs text-slate-500">{selectedImage ? formatFileSize(selectedImage.size) : ''}</p>
                    <button
                      type="button"
                      onClick={() => {
                        const input = document.createElement('input')
                        input.type = 'file'
                        input.accept = 'image/*'
                        input.onchange = (e) => handleImageSelect(e as any)
                        input.click()
                      }}
                      className="text-emerald-600 hover:text-emerald-700 text-sm font-medium mt-1"
                    >
                      Cambiar imagen
                    </button>
                  </div>
                </div>
              )}
            </div>
            <div className="md:col-span-3 pt-4 border-t border-slate-100 flex justify-between items-center">
              {Object.keys(formErrors).length > 0 && (
                <div className="flex items-center gap-2 text-red-600">
                  <AlertCircle size={16} />
                  <span className="text-sm font-medium">
                    {Object.keys(formErrors).length} error{Object.keys(formErrors).length > 1 ? 'es' : ''} de validación
                  </span>
                </div>
              )}
              <div className="flex-1" />
              <button
                type="submit"
                disabled={isSubmitting}
                onClick={(e) => {
                  console.log('🎯 BUTTON CLICKED! Event:', e)
                  console.log('🔍 Button disabled?', isSubmitting)
                  console.log('🔍 Form errors:', formErrors)
                }}
                className="bg-emerald-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-emerald-700 transition-all shadow-lg disabled:bg-slate-400 disabled:cursor-not-allowed disabled:shadow-none flex items-center gap-2"
              >
                {isSubmitting && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
                {isSubmitting ? 'Registrando...' : 'Confirmar Alta'}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              placeholder="Buscar por nombre o DNI..."
              className="w-full pl-10 pr-4 py-2.5 bg-white rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none text-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="text-sm text-slate-500 font-medium">
            Mostrando {filteredPlayers.length} de {players.length} jugadores
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 text-slate-500 text-xs font-bold uppercase tracking-wider">
                <th className="px-6 py-4">Jugador</th>
                <th className="px-6 py-4">DNI / Edad</th>
                <th className="px-6 py-4">Posiciones</th>
                <th className="px-6 py-4">Tipo</th>
                {/* <th className="px-6 py-4 text-center">Acción</th> */}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredPlayers.map((p) => (
                <tr key={p.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center justify-center">
                        <Avatar src={p.avatar} firstName={p.firstName} lastName={p.lastName} size="lg" />
                      </div>
                      <div>
                        <p className="font-bold text-slate-800">
                          {p.lastName}, {p.firstName}
                        </p>
                        <p className="text-xs text-slate-400">{p.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600">
                    <p className="font-mono">{p.dni}</p>
                    <p className="text-xs text-slate-400">{calculateAge(p.birthDate)} años</p>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col gap-1">
                      <span className="px-2 py-1 bg-emerald-100 text-emerald-700 rounded-md text-[10px] font-bold w-fit uppercase">
                        P: {PositionNames[p.primaryPos]}
                      </span>
                      <span className="px-2 py-1 bg-slate-100 text-slate-600 rounded-md text-[10px] font-bold w-fit uppercase">
                        S: {PositionNames[p.secondaryPos]}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-slate-600 font-medium">
                      {p.role === 'JUGADOR' ? 'Jugador' : p.role === 'DELEGADO' ? 'Delegado' : p.role === 'ADMIN' ? 'Administrador' : 'N/A'}
                    </span>
                  </td>
                  {/* <td className="px-6 py-4 text-center">
                    <button onClick={() => onDeletePlayer(p.id)} className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all">
                      <Trash2 size={18} />
                    </button>
                  </td> */}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default PlayerRegistration
