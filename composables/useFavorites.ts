export const useFavorites = () => {
  const favorites = useState('favorites', () => [])

  const loadFavorites = () => {
    if (process.client) {
      const stored = localStorage.getItem('tudex_favorites')
      if (stored) {
        try {
          favorites.value = JSON.parse(stored)
        } catch (e) {
          console.error('Error parsing favorites from localStorage', e)
          favorites.value = []
        }
      }
    }
  }

  const saveFavorites = () => {
    if (process.client) {
      localStorage.setItem('tudex_favorites', JSON.stringify(favorites.value))
    }
  }

  const isFavorite = (gameId) => {
    return favorites.value.some(g => g.id === gameId)
  }

  const toggleFavorite = (game) => {
    const index = favorites.value.findIndex(g => g.id === game.id)
    if (index === -1) {
      // Add minimal game info
      favorites.value.push({
        id: game.id,
        slug: game.slug,
        title: game.title,
        thumb_1: game.thumb_1,
        thumb_2: game.thumb_2,
        thumb_small: game.thumb_small
      })
    } else {
      favorites.value.splice(index, 1)
    }
    saveFavorites()
  }

  return {
    favorites,
    loadFavorites,
    isFavorite,
    toggleFavorite
  }
}
