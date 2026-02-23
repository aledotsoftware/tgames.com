export const useRecentlyPlayed = () => {
  const history = useState<any[]>('recently-played', () => [])

  const initHistory = () => {
    if (process.client) {
      const stored = localStorage.getItem('recently-played')
      if (stored) {
        try {
          history.value = JSON.parse(stored)
        } catch (e) {
          console.error('Failed to parse history', e)
        }
      }
    }
  }

  const addToRecentlyPlayed = (game: any) => {
    // Ideally we only store minimal info: id, title, slug, thumb
    // But for simplicity we store the whole object if it's small enough,
    // or destruct it here. The game object from API seems to have many fields.
    // Let's store just what's needed for the card: id, title, slug, thumb_*.

    const gameData = {
      id: game.id,
      title: game.title,
      slug: game.slug,
      thumb_1: game.thumb_1,
      thumb_2: game.thumb_2,
      thumb_small: game.thumb_small
    }

    // Remove if exists to move to top
    const newHistory = history.value.filter((g: any) => g.id !== gameData.id)

    // Add to front
    newHistory.unshift(gameData)

    // Limit to 5
    if (newHistory.length > 5) {
      newHistory.splice(5)
    }

    history.value = newHistory

    if (process.client) {
      localStorage.setItem('recently-played', JSON.stringify(newHistory))
    }
  }

  // Initialize on mount
  onMounted(() => {
    initHistory()
  })

  return {
    history,
    addToRecentlyPlayed
  }
}
