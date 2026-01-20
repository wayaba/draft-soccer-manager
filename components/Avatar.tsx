'use client'

import React, { useState } from 'react'

interface AvatarProps {
  src?: string
  alt?: string
  firstName?: string
  lastName?: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
  className?: string
}

const sizeClasses = {
  sm: 'text-xs',
  md: 'text-sm',
  lg: 'text-sm',
  xl: 'text-lg'
}

const fallbackSizeClasses = {
  sm: 'w-6 h-6',
  md: 'w-8 h-8',
  lg: 'w-10 h-10',
  xl: 'w-16 h-16'
}

const sizePx = {
  sm: 24,
  md: 32,
  lg: 40,
  xl: 64
}

export default function Avatar({ src, alt, firstName = '', lastName = '', size = 'lg', className = '' }: AvatarProps) {
  const [imageError, setImageError] = useState(false)

  const initials = `${firstName.charAt(0)?.toUpperCase() || ''}${lastName.charAt(0)?.toUpperCase() || ''}`
  const fullName = `${firstName} ${lastName}`.trim()
  const altText = alt || `Avatar de ${fullName}` || 'Avatar'

  const baseClasses = `rounded-full object-cover border border-gray-200 dark:border-gray-600 ${sizeClasses[size]}`
  const fallbackClasses = `rounded-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center ${fallbackSizeClasses[size]} ${sizeClasses[size]}`

  if (!src || imageError) {
    return (
      <div className={`${fallbackClasses} ${className}`}>
        <span className="text-gray-500 dark:text-gray-400 font-medium">{initials || '?'}</span>
      </div>
    )
  }

  return (
    <img
      src={src}
      alt={altText}
      width={sizePx[size]}
      height={sizePx[size]}
      className={`${baseClasses} ${className}`}
      style={{ width: `${sizePx[size]}px`, height: `${sizePx[size]}px` }}
      onError={() => setImageError(true)}
    />
  )
}
