import { describe, it, expect } from 'vitest'
import { validatePagination } from '../../../server/utils/pagination'

describe('validatePagination', () => {
    it('should use default values for an empty query', () => {
        const result = validatePagination({})
        expect(result).toEqual({ page: 1, limit: 60, offset: 0 })
    })

    it('should correctly parse standard valid values', () => {
        const result = validatePagination({ page: '2', limit: '50' })
        expect(result).toEqual({ page: 2, limit: 50, offset: 50 })
    })

    it('should correctly parse numbers passed directly', () => {
        const result = validatePagination({ page: 3, limit: 20 })
        expect(result).toEqual({ page: 3, limit: 20, offset: 40 })
    })

    it('should cap the limit at 100', () => {
        const result = validatePagination({ page: '1', limit: '1000' })
        expect(result).toEqual({ page: 1, limit: 100, offset: 0 })
    })

    it('should handle large limits correctly with other pages', () => {
        const result = validatePagination({ page: '3', limit: '1000' })
        expect(result).toEqual({ page: 3, limit: 100, offset: 200 })
    })

    it('should return default values for negative inputs', () => {
        const result = validatePagination({ page: '-5', limit: '-10' })
        expect(result).toEqual({ page: 1, limit: 60, offset: 0 })
    })

    it('should return default values for zero inputs', () => {
        const result = validatePagination({ page: '0', limit: '0' })
        expect(result).toEqual({ page: 1, limit: 60, offset: 0 })
    })

    it('should return default values for non-numeric strings', () => {
        const result = validatePagination({ page: 'abc', limit: 'xyz' })
        expect(result).toEqual({ page: 1, limit: 60, offset: 0 })
    })

    it('should handle float values by parsing them as integers', () => {
        const result = validatePagination({ page: '2.5', limit: '10.9' })
        expect(result).toEqual({ page: 2, limit: 10, offset: 10 })
    })

    it('should handle missing page field', () => {
        const result = validatePagination({ limit: '30' })
        expect(result).toEqual({ page: 1, limit: 30, offset: 0 })
    })

    it('should handle missing limit field', () => {
        const result = validatePagination({ page: '4' })
        expect(result).toEqual({ page: 4, limit: 60, offset: 180 })
    })

    it('should fallback to 1 and 60 when passed NaN inputs directly', () => {
        const result = validatePagination({ page: NaN, limit: NaN })
        expect(result).toEqual({ page: 1, limit: 60, offset: 0 })
    })

    it('should handle undefined values gracefully', () => {
        const result = validatePagination({ page: undefined, limit: undefined })
        expect(result).toEqual({ page: 1, limit: 60, offset: 0 })
    })

    it('should handle null values gracefully', () => {
        const result = validatePagination({ page: null, limit: null })
        expect(result).toEqual({ page: 1, limit: 60, offset: 0 })
    })
})
