// Mobile menu toggle
const hamburger = document.getElementById("hamburger")
const navMenu = document.getElementById("nav-menu")

hamburger.addEventListener("click", () => {
  navMenu.classList.toggle("active")
  
  // Animate hamburger
  hamburger.classList.toggle("active")
})

// Close mobile menu when clicking on a link
document.querySelectorAll(".nav-link").forEach((link) => {
  link.addEventListener("click", () => {
    navMenu.classList.remove("active")
    hamburger.classList.remove("active")
  })
})

// Close mobile menu when clicking outside
document.addEventListener("click", (e) => {
  if (!hamburger.contains(e.target) && !navMenu.contains(e.target)) {
    navMenu.classList.remove("active")
    hamburger.classList.remove("active")
  }
})

// Smooth scrolling for navigation links
document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
  anchor.addEventListener("click", function (e) {
    e.preventDefault()
    const target = document.querySelector(this.getAttribute("href"))
    if (target) {
      const offsetTop = target.offsetTop - 80 // Account for fixed navbar
      window.scrollTo({
        top: offsetTop,
        behavior: "smooth"
      })
    }
  })
})

// Enhanced navbar scroll effect
let lastScrollY = window.scrollY
const navbar = document.querySelector(".navbar")

window.addEventListener("scroll", () => {
  const currentScrollY = window.scrollY
  
  if (currentScrollY > 100) {
    navbar.style.background = "rgba(255, 255, 255, 0.95)"
    navbar.style.boxShadow = "0 4px 20px rgba(0, 0, 0, 0.1)"
  } else {
    navbar.style.background = "rgba(255, 255, 255, 0.85)"
    navbar.style.boxShadow = "none"
  }
  
  // Hide/show navbar on scroll
  if (currentScrollY > lastScrollY && currentScrollY > 200) {
    navbar.style.transform = "translateY(-100%)"
  } else {
    navbar.style.transform = "translateY(0)"
  }
  
  lastScrollY = currentScrollY
})

// Contact form handling with enhanced validation and UX
const contactForm = document.getElementById("contactForm")
let submitButton, originalButtonText, formFields;

if (contactForm) {
  submitButton = contactForm.querySelector('button[type="submit"]')
  originalButtonText = submitButton.innerHTML
}

// Form validation functions
function validateEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

function validatePhone(phone) {
  if (!phone) return true // Phone is optional
  const phoneRegex = /^[\+]?[0-9\s\-$$$$]{10,}$/
  return phoneRegex.test(phone)
}

function showFieldError(field, message) {
  // Remove existing error
  const existingError = field.parentNode.querySelector('.field-error')
  if (existingError) {
    existingError.remove()
  }
  
  // Add error styling
  field.style.borderColor = '#ef4444'
  field.style.boxShadow = '0 0 0 3px rgba(239, 68, 68, 0.1)'
  
  // Add error message
  const errorDiv = document.createElement('div')
  errorDiv.className = 'field-error'
  errorDiv.style.color = '#ef4444'
  errorDiv.style.fontSize = '12px'
  errorDiv.style.marginTop = '4px'
  errorDiv.textContent = message
  field.parentNode.appendChild(errorDiv)
}

function clearFieldError(field) {
  const existingError = field.parentNode.querySelector('.field-error')
  if (existingError) {
    existingError.remove()
  }
  field.style.borderColor = '#e5e7eb'
  field.style.boxShadow = 'none'
}

// Real-time validation
if (contactForm) {
  formFields = contactForm.querySelectorAll('input, textarea')
  formFields.forEach(field => {
  field.addEventListener('blur', () => {
    const value = field.value.trim()
    
    if (field.hasAttribute('required') && !value) {
      showFieldError(field, 'Este campo es obligatorio')
    } else if (field.type === 'email' && value && !validateEmail(value)) {
      showFieldError(field, 'Ingrese un correo electrónico válido')
    } else if (field.type === 'tel' && value && !validatePhone(value)) {
      showFieldError(field, 'Ingrese un número de teléfono válido')
    } else {
      clearFieldError(field)
    }
  })
  
  field.addEventListener('input', () => {
    if (field.style.borderColor === 'rgb(239, 68, 68)') {
      clearFieldError(field)
    }
  })
})

contactForm.addEventListener("submit", async (e) => {
  e.preventDefault()

  // Clear all previous errors
  formFields.forEach(clearFieldError)

  // Get form data
  const formData = new FormData(contactForm)
  const fullInputName = (formData.get("nombre") || "").toString().trim()
  
  // Split name into first and last to satisfy backend mandatory fields
  const nameParts = fullInputName.split(/\s+/)
  const nombre = nameParts[0] || ""
  const apellido = nameParts.length > 1 ? nameParts.slice(1).join(" ") : "-"
  
  const data = {
    nombre: nombre,
    apellido: apellido,
    telefono: (formData.get("telefono") || "").toString().trim(),
    email: (formData.get("email") || "").toString().trim(),
    asunto: (formData.get("asunto") || "").toString().trim(),
    mensaje: (formData.get("mensaje") || "").toString().trim(),
  }

  // Validation
  let hasErrors = false

  if (!fullInputName) {
    showFieldError(document.getElementById('nombre'), 'Este campo es obligatorio')
    hasErrors = true
  }

  if (!data.email) {
    showFieldError(document.getElementById('email'), 'El correo electrónico es obligatorio')
    hasErrors = true
  } else if (!validateEmail(data.email)) {
    showFieldError(document.getElementById('email'), 'Ingrese un correo electrónico válido')
    hasErrors = true
  }

  if (data.telefono && !validatePhone(data.telefono)) {
    showFieldError(document.getElementById('telefono'), 'Ingrese un número de teléfono válido')
    hasErrors = true
  }

  if (!data.mensaje) {
    showFieldError(document.getElementById('mensaje'), 'La descripción del caso es obligatoria')
    hasErrors = true
  }

  if (hasErrors) {
    // Scroll to first error
    const firstError = contactForm.querySelector('.field-error')
    if (firstError) {
      firstError.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }
    return
  }

  // Update UI to show submission is in progress
  submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Enviando...'
  submitButton.disabled = true
  submitButton.style.opacity = '0.7'

  // Add loading animation to form
  contactForm.style.opacity = '0.8'
  contactForm.style.pointerEvents = 'none'

  // Send data to Cloudflare Worker
  const workerUrl = "https://contact-form-ejrabogados.abogadosensaludarg.workers.dev/"

  try {
    const response = await fetch(workerUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      throw new Error(`Error del servidor: ${response.statusText}`)
    }

    // Success animation
    submitButton.innerHTML = '<i class="fas fa-check-circle"></i> ¡Enviado!'
    submitButton.style.background = '#005096'
    
    // Show success message
    showSuccessMessage()
    
    // Reset form after delay
    setTimeout(() => {
      contactForm.reset()
      clearAllFieldErrors()
    }, 2000)

  } catch (error) {
    console.error("Error al enviar el formulario:", error)
    
    // Error animation
    submitButton.innerHTML = '<i class="fas fa-exclamation-triangle"></i> Error al enviar'
    submitButton.style.background = 'linear-gradient(135deg, #b91c1c, #991b1b)'
    
    // Show error message
    showErrorMessage("Hubo un error al enviar su consulta. Por favor, intente de nuevo más tarde o contáctenos por WhatsApp.")
  
  } finally {
    // Restore form state after delay
    setTimeout(() => {
      submitButton.innerHTML = originalButtonText
      submitButton.disabled = false
      submitButton.style.opacity = '1'
      submitButton.style.background = '#003b6d'
      contactForm.style.opacity = '1'
      contactForm.style.pointerEvents = 'auto'
    }, 3000)
  }
})
} // End if (contactForm)

function clearAllFieldErrors() {
  formFields.forEach(clearFieldError)
}

function showSuccessMessage() {
  const message = createNotification(
    '¡Consulta enviada exitosamente!',
    'Nos pondremos en contacto contigo a la brevedad.',
    'success'
  )
  document.body.appendChild(message)
}

function showErrorMessage(text) {
  const message = createNotification(
    'Error al enviar',
    text,
    'error'
  )
  document.body.appendChild(message)
}

function createNotification(title, text, type) {
  const notification = document.createElement('div')
  notification.className = `notification ${type}`
  notification.innerHTML = `
    <div class="notification-content">
      <div class="notification-icon">
        <i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-triangle'}"></i>
      </div>
      <div class="notification-text">
        <h4>${title}</h4>
        <p>${text}</p>
      </div>
      <button class="notification-close">
        <i class="fas fa-times"></i>
      </button>
    </div>
  `
  
  // Add styles
  notification.style.cssText = `
    position: fixed;
    top: 100px;
    right: 20px;
    background: white;
    border-radius: 4px;
    box-shadow: 0 10px 25px rgba(0, 59, 109, 0.15);
    border-left: 4px solid ${type === 'success' ? '#003b6d' : '#ef4444'};
    padding: 20px;
    max-width: 400px;
    z-index: 10000;
    transform: translateX(100%);
    transition: transform 0.3s ease;
  `
  
  // Add notification styles to head if not exists
  if (!document.querySelector('#notification-styles')) {
    const styles = document.createElement('style')
    styles.id = 'notification-styles'
    styles.textContent = `
      .notification-content {
        display: flex;
        align-items: flex-start;
        gap: 12px;
      }
      .notification-icon {
        width: 24px;
        height: 24px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
      }
      .notification.success .notification-icon {
        background: #f8fafc;
        color: #003b6d;
      }
      .notification.error .notification-icon {
        background: #fecaca;
        color: #991b1b;
      }
      .notification-text h4 {
        margin: 0 0 4px 0;
        font-size: 14px;
        font-weight: 600;
        color: #1f2937;
      }
      .notification-text p {
        margin: 0;
        font-size: 13px;
        color: #6b7280;
        line-height: 1.4;
      }
      .notification-close {
        background: none;
        border: none;
        color: #9ca3af;
        cursor: pointer;
        padding: 4px;
        margin-left: auto;
        border-radius: 4px;
        transition: all 0.2s ease;
      }
      .notification-close:hover {
        background: #f3f4f6;
        color: #6b7280;
      }
    `
    document.head.appendChild(styles)
  }
  
  // Show notification
  setTimeout(() => {
    notification.style.transform = 'translateX(0)'
  }, 100)
  
  // Auto hide after 5 seconds
  setTimeout(() => {
    hideNotification(notification)
  }, 5000)
  
  // Close button functionality
  notification.querySelector('.notification-close').addEventListener('click', () => {
    hideNotification(notification)
  })
  
  return notification
}

function hideNotification(notification) {
  notification.style.transform = 'translateX(100%)'
  setTimeout(() => {
    if (notification.parentNode) {
      notification.parentNode.removeChild(notification)
    }
  }, 300)
}

// Enhanced intersection observer for animations
const observerOptions = {
  threshold: 0.1,
  rootMargin: "0px 0px -50px 0px",
}

const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add("visible")
      
      // Add staggered animation for service cards
      if (entry.target.classList.contains('service-card')) {
        const cards = document.querySelectorAll('.service-card')
        const index = Array.from(cards).indexOf(entry.target)
        entry.target.style.animationDelay = `${index * 0.1}s`
      }
    }
  })
}, observerOptions)

// Enhanced scroll animations
document.addEventListener("DOMContentLoaded", () => {
  // Observar TODOS los elementos que tengan la clase fade-in en el HTML
  const fadeElements = document.querySelectorAll(".fade-in");
  fadeElements.forEach((el) => {
    observer.observe(el);
  });
  
  // Agregar animaciones a tarjetas que no tenían la clase explícita
  const extraElements = document.querySelectorAll(".service-card, .experience-card, .info-card, .hero-card, .profile-card-modern");
  extraElements.forEach((el) => {
    if (!el.classList.contains("fade-in")) {
      el.classList.add("fade-in");
      observer.observe(el);
    }
  });
});

// Enhanced service cards interactions
document.querySelectorAll(".service-card").forEach((card, index) => {
  // Hover effects
  card.addEventListener("mouseenter", () => {
    card.style.transform = "translateY(-12px) scale(1.02)"
    card.style.transition = "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)"
  })

  card.addEventListener("mouseleave", () => {
    card.style.transform = "translateY(0) scale(1)"
  })
  
  // Click animation
  card.addEventListener("click", (e) => {
    if (!e.target.closest('.service-btn')) {
      const ripple = document.createElement("span")
      const rect = card.getBoundingClientRect()
      const size = Math.max(rect.width, rect.height)
      const x = e.clientX - rect.left - size / 2
      const y = e.clientY - rect.top - size / 2

      ripple.style.cssText = `
        position: absolute;
        width: ${size}px;
        height: ${size}px;
        left: ${x}px;
        top: ${y}px;
        background: radial-gradient(circle, rgba(0, 59, 109, 0.1) 0%, transparent 70%);
        border-radius: 50%;
        transform: scale(0);
        animation: ripple-effect 0.6s linear;
        pointer-events: none;
        z-index: 1;
      `

      card.style.position = 'relative'
      card.appendChild(ripple)

      setTimeout(() => {
        ripple.remove()
      }, 600)
    }
  })
})

// Add ripple effect animation
if (!document.querySelector('#ripple-styles')) {
  const rippleStyles = document.createElement('style')
  rippleStyles.id = 'ripple-styles'
  rippleStyles.textContent = `
    @keyframes ripple-effect {
      to {
        transform: scale(4);
        opacity: 0;
      }
    }
  `
  document.head.appendChild(rippleStyles)
}

// Enhanced button interactions
document.querySelectorAll(".btn-primary, .btn-outline").forEach((button) => {
  button.addEventListener("mouseenter", () => {
    button.style.transform = "translateY(-2px)"
  })
  
  button.addEventListener("mouseleave", () => {
    if (!button.disabled) {
      button.style.transform = "translateY(0)"
    }
  })
})

// Parallax effect for hero section
window.addEventListener('scroll', () => {
  const scrolled = window.pageYOffset
  const heroPattern = document.querySelector('.hero-pattern')
  const contactPattern = document.querySelector('.contact-pattern')
  
  if (heroPattern) {
    heroPattern.style.transform = `translateY(${scrolled * 0.5}px)`
  }
  
  if (contactPattern) {
    contactPattern.style.transform = `translateY(${scrolled * 0.3}px)`
  }
})

// Enhanced loading states
window.addEventListener('load', () => {
  document.body.classList.add('loaded')
  
  // Animate elements on load
  const heroElements = document.querySelectorAll('.hero-title, .hero-description, .hero-buttons')
  heroElements.forEach((el, index) => {
    el.style.opacity = '0'
    el.style.transform = 'translateY(30px)'
    
    setTimeout(() => {
      el.style.transition = 'all 0.8s cubic-bezier(0.4, 0, 0.2, 1)'
      el.style.opacity = '1'
      el.style.transform = 'translateY(0)'
    }, index * 200)
  })
})

// Console welcome message with enhanced styling
console.log(`
%c🏛️ Roitman & Asociados - Sitio Web Profesional
%c📧 Para consultas: contacto@ejrabogados.com.ar
%c⚖️ Asesoramiento Legal Integral
%c🚀 Sitio desarrollado con tecnologías modernas`,
'color: #003b6d; font-size: 16px; font-weight: bold;',
'color: #6b767e; font-size: 14px;',
'color: #1f2937; font-size: 14px;',
'color: #4b5563; font-size: 12px;'
)

// Performance monitoring
if ('performance' in window) {
  window.addEventListener('load', () => {
    setTimeout(() => {
      const perfData = performance.getEntriesByType('navigation')[0]
      console.log(`⚡ Página cargada en ${Math.round(perfData.loadEventEnd - perfData.fetchStart)}ms`)
    }, 0)
  })
}

// Error handling
window.addEventListener('error', (e) => {
  console.error('Error en el sitio web:', e.error)
})

// Service worker registration (if available)
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    // Uncomment when service worker is implemented
    // navigator.serviceWorker.register('/sw.js')
    //   .then(registration => console.log('SW registered'))
    //   .catch(error => console.log('SW registration failed'))
  })
}