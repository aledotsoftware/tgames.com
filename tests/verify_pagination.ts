import { validatePagination } from '../server/utils/pagination'

const assert = (condition: boolean, message: string) => {
    if (!condition) {
        throw new Error(message)
    }
}

const testPagination = () => {
    console.log('Testing validatePagination...')

    // Default values
    const d = validatePagination({})
    assert(d.page === 1, 'Default page should be 1')
    assert(d.limit === 60, 'Default limit should be 60')

    // Valid values
    const v = validatePagination({ page: '2', limit: '50' })
    assert(v.page === 2, 'Valid page should be 2')
    assert(v.limit === 50, 'Valid limit should be 50')

    // Large limit
    const l = validatePagination({ limit: '1000' })
    assert(l.limit === 100, 'Limit should be capped at 100')

    // Negative values
    const n = validatePagination({ page: '-5', limit: '-10' })
    assert(n.page === 1, 'Negative page should be 1')
    assert(n.limit === 60, 'Negative limit should be 60')

    // Zero values
    const z = validatePagination({ page: '0', limit: '0' })
    assert(z.page === 1, 'Zero page should be 1')
    assert(z.limit === 60, 'Zero limit should be 60')

    // Non-numeric strings
    const s = validatePagination({ page: 'abc', limit: 'xyz' })
    assert(s.page === 1, 'Non-numeric page should be 1')
    assert(s.limit === 60, 'Non-numeric limit should be 60')

    console.log('All tests passed!')
}

testPagination()
