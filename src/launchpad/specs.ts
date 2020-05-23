import {range} from './utils'

import {Spec, InputGrid} from '../types/specs'

// Fixed-color lights.
export const Color = (color: number) => [0, color % 128]

// Flashing lights.
export const Flash = (A: number, B: number) => [1, A % 128, B % 128]

// Pulsing lights.
export const Pulse = (color: number) => [2, color % 128]

// RGB lights.
// prettier-ignore
export const RGB = (r: number, g: number, b: number) =>
  [3, r % 128, g % 128, b % 128]

/**
 * Specs are used for sending light change events
 * in bulk to the launchpad.
 */

// Specs for fixed-color lights.
export const ColorSpec = (note: number, color: number): Spec =>
  convertToSpec(note, Color(color))

// Specs for flashing lights.
export const FlashSpec = (note: number, A: number, B: number): Spec =>
  convertToSpec(note, Flash(A, B))

// Specs for pulsing lights.
export const PulseSpec = (note: number, color: number): Spec =>
  convertToSpec(note, Pulse(color))

// Specs for RGB lights.
export const RGBSpec = (note: number, r: number, g: number, b: number): Spec =>
  convertToSpec(note, RGB(r, g, b))

/**
 * Builds the midi grid.
 *
 * This is used for building the payload from the spec.
 */
export function buildMidiGrid(): number[][] {
  let midiGrid = []

  for (let i = 8; i >= 1; i--) {
    const b = i * 10
    midiGrid.push(range(b + 1, b + 8))
  }

  return midiGrid
}

export const midiGrid = buildMidiGrid()

export function convertToSpec(note: number, trait: number[]): Spec {
  let type = trait.slice(0, 1)
  let options = trait.slice(1)

  return [...type, note, ...options] as Spec
}

export function buildSpecFromGrid(grid: InputGrid): Spec[] {
  const specs: Spec[] = []

  for (let y = 0; y < 8; y++) {
    for (let x = 0; x < 8; x++) {
      let input = grid[y][x]
      const note = midiGrid[y][x]

      // If input is a number, parse as a simple color.
      // Otherwise, use the specified input as spec.
      if (typeof input === 'number') {
        specs.push(ColorSpec(note, input))
      } else if (Array.isArray(input)) {
        specs.push(convertToSpec(note, input))
      }
    }
  }

  return specs
}

/**
 * Builds a grid to fill the launchpad with a single color.
 * Used mostly for clearing the launchpad.
 *
 * @param spec color spec or color number
 */
export const buildFillGrid = (spec: number | Spec = 0) =>
  range(0, 8).map(() => range(0, 8).map(() => spec))
