export const validatePagination = (query: any) => {
    let page = parseInt(query.page as string) || 1
    let limit = parseInt(query.limit as string) || 60

    // Ensure valid positive integers
    if (page < 1) page = 1
    if (limit < 1) limit = 60

    // Cap the limit to a maximum of 100
    if (limit > 100) limit = 100

    const offset = (page - 1) * limit

    return { page, limit, offset }
}
