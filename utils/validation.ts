// Validaciones nativas de JavaScript equivalentes al backend

export interface ValidationResult {
  isValid: boolean
  message?: string
}

export interface FormErrors {
  [key: string]: string
}

// Validación de nombre y apellido
export const validateName = (value: string, fieldName: string): ValidationResult => {
  if (!value || value.trim().length === 0) {
    return { isValid: false, message: `${fieldName} es requerido` }
  }

  if (value.length < 2) {
    return { isValid: false, message: `${fieldName} debe tener al menos 2 caracteres` }
  }

  if (value.length > 50) {
    return { isValid: false, message: `${fieldName} no puede exceder 50 caracteres` }
  }

  const nameRegex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/
  if (!nameRegex.test(value)) {
    return { isValid: false, message: `${fieldName} solo puede contener letras y espacios` }
  }

  return { isValid: true }
}

// Validación de fecha de nacimiento
export const validateBirthDate = (value: string): ValidationResult => {
  if (!value) {
    return { isValid: false, message: 'La fecha de nacimiento es requerida' }
  }

  const dateRegex = /^\d{4}-\d{2}-\d{2}$/
  if (!dateRegex.test(value)) {
    return { isValid: false, message: 'La fecha debe tener formato YYYY-MM-DD' }
  }

  const birthDate = new Date(value)
  const today = new Date()

  if (isNaN(birthDate.getTime())) {
    return { isValid: false, message: 'La fecha de nacimiento debe ser válida' }
  }

  if (birthDate > today) {
    return { isValid: false, message: 'La fecha de nacimiento no puede ser futura' }
  }

  const age = today.getFullYear() - birthDate.getFullYear()
  if (age < 0 || age > 120) {
    return { isValid: false, message: 'La fecha de nacimiento debe ser válida' }
  }

  return { isValid: true }
}

// Validación de DNI
export const validateDNI = (value: string): ValidationResult => {
  if (!value || value.trim().length === 0) {
    return { isValid: false, message: 'El DNI es requerido' }
  }

  // Remover espacios
  const cleanValue = value.replace(/\s/g, '')

  if (cleanValue.length < 7) {
    return { isValid: false, message: 'El DNI debe tener al menos 7 caracteres' }
  }

  if (cleanValue.length > 8) {
    return { isValid: false, message: 'El DNI no puede exceder 8 caracteres' }
  }

  const dniRegex = /^\d+$/
  if (!dniRegex.test(cleanValue)) {
    return { isValid: false, message: 'El DNI solo puede contener números' }
  }

  const dniNumber = parseInt(cleanValue, 10)
  if (dniNumber < 1000000 || dniNumber > 99999999) {
    return { isValid: false, message: 'El DNI debe estar entre 1000000 y 99999999' }
  }

  return { isValid: true }
}

// Validación de teléfono
export const validatePhone = (value: string): ValidationResult => {
  if (!value || value.trim().length === 0) {
    return { isValid: false, message: 'El teléfono es requerido' }
  }

  if (value.length < 8) {
    return { isValid: false, message: 'El teléfono debe tener al menos 8 caracteres' }
  }

  if (value.length > 20) {
    return { isValid: false, message: 'El teléfono no puede exceder 20 caracteres' }
  }

  const phoneRegex = /^[+]?[\d\s\-()]{8,20}$/
  if (!phoneRegex.test(value)) {
    return { isValid: false, message: 'El teléfono debe tener un formato válido' }
  }

  return { isValid: true }
}

// Validación de email
export const validateEmail = (value: string): ValidationResult => {
  if (!value || value.trim().length === 0) {
    return { isValid: false, message: 'El email es requerido' }
  }

  if (value.length > 100) {
    return { isValid: false, message: 'El correo no puede exceder 100 caracteres' }
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(value)) {
    return { isValid: false, message: 'Debe ser un correo electrónico válido' }
  }

  return { isValid: true }
}

// Validación completa del formulario
export const validatePlayerForm = (formData: any): { isValid: boolean; errors: FormErrors } => {
  const errors: FormErrors = {}

  // Validar nombre
  const firstNameResult = validateName(formData.firstName, 'El nombre')
  if (!firstNameResult.isValid) {
    errors.firstName = firstNameResult.message!
  }

  // Validar apellido
  const lastNameResult = validateName(formData.lastName, 'El apellido')
  if (!lastNameResult.isValid) {
    errors.lastName = lastNameResult.message!
  }

  // Validar fecha de nacimiento
  const birthDateResult = validateBirthDate(formData.birthDate)
  if (!birthDateResult.isValid) {
    errors.birthDate = birthDateResult.message!
  }

  // Validar DNI
  const dniResult = validateDNI(formData.dni)
  if (!dniResult.isValid) {
    errors.dni = dniResult.message!
  }

  // Validar teléfono
  const phoneResult = validatePhone(formData.phone)
  if (!phoneResult.isValid) {
    errors.phone = phoneResult.message!
  }

  // Validar email
  const emailResult = validateEmail(formData.email)
  if (!emailResult.isValid) {
    errors.email = emailResult.message!
  }

  // Validar posiciones
  if (formData.primaryPos === formData.secondaryPos) {
    errors.positions = 'La posición primaria y secundaria deben ser diferentes'
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  }
}

// Función para obtener mensaje de validación HTML5
export const getHTML5ValidationMessage = (input: HTMLInputElement): string => {
  if (input.validity.valueMissing) {
    return 'Este campo es requerido'
  }
  if (input.validity.tooShort) {
    return `Debe tener al menos ${input.minLength} caracteres`
  }
  if (input.validity.tooLong) {
    return `No puede exceder ${input.maxLength} caracteres`
  }
  if (input.validity.patternMismatch) {
    return input.getAttribute('data-error-message') || 'El formato no es válido'
  }
  if (input.validity.typeMismatch) {
    if (input.type === 'email') {
      return 'Debe ser un correo electrónico válido'
    }
  }
  return input.validationMessage
}
