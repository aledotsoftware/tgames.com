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
    assert(d.offset === 0, 'Default offset should be 0')

    // Valid values
    const v = validatePagination({ page: '2', limit: '50' })
    assert(v.page === 2, 'Valid page should be 2')
    assert(v.limit === 50, 'Valid limit should be 50')
    assert(v.offset === 50, 'Valid offset should be 50')

    // High page values
    const h = validatePagination({ page: '5', limit: '10' })
    assert(h.page === 5, 'High page should be 5')
    assert(h.limit === 10, 'Limit should be 10')
    assert(h.offset === 40, 'High page offset should be 40')

    // Large limit
    const l = validatePagination({ limit: '1000' })
    assert(l.limit === 100, 'Limit should be capped at 100')
    assert(l.offset === 0, 'Offset with large limit should be 0')

    // Large limit and valid page
    const lv = validatePagination({ page: '3', limit: '1000' })
    assert(lv.page === 3, 'Page should be 3')
    assert(lv.limit === 100, 'Limit should be capped at 100')
    assert(lv.offset === 200, 'Offset with large limit should use capped limit')

    // Negative values
    const n = validatePagination({ page: '-5', limit: '-10' })
    assert(n.page === 1, 'Negative page should be 1')
    assert(n.limit === 60, 'Negative limit should be 60')
    assert(n.offset === 0, 'Negative values offset should be 0')

    // Zero values
    const z = validatePagination({ page: '0', limit: '0' })
    assert(z.page === 1, 'Zero page should be 1')
    assert(z.limit === 60, 'Zero limit should be 60')
    assert(z.offset === 0, 'Zero values offset should be 0')

    // Non-numeric strings
    const s = validatePagination({ page: 'abc', limit: 'xyz' })
    assert(s.page === 1, 'Non-numeric page should be 1')
    assert(s.limit === 60, 'Non-numeric limit should be 60')
    assert(s.offset === 0, 'Non-numeric values offset should be 0')

    console.log('All tests passed!')
}

testPagination()
