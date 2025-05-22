import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import VisualImageTool from './visual-image-tool.js'

describe('VisualImageTool', () => {
  let container
  let imageElement
  let instance

  beforeEach(() => {
    container = document.createElement('div')
    document.body.appendChild(container)

    imageElement = document.createElement('img')
    imageElement.src = 'data:image/png;base64,iVBORw0KGgoAAAANSU'
    container.appendChild(imageElement)

    // Correction : passer l'option imageElement dans un objet options
    instance = new VisualImageTool({ imageElement })
  })

  afterEach(() => {
    if (instance) {
      instance.destroy && instance.destroy()
    }
    document.body.removeChild(container)
  })

  it('should initialize with default focus point', () => {
    const focusPoint = instance.getFocusPoint()
    expect(focusPoint).toEqual({ x: 0, y: 0 })
  })

  it('should toggle focus point', () => {
    const before = instance.getFocusPoint()
    instance.toggleFocusPoint()
    const after = instance.getFocusPoint()
    expect(after).not.toEqual(before)
  })

  it('should expose public API methods', () => {
    expect(typeof instance.getFocusPoint).toBe('function')
    expect(typeof instance.toggleFocusPoint).toBe('function')
    // Ajoutez ici d'autres méthodes publiques à tester
  })
})
