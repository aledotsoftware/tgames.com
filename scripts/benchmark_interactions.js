import { performance } from 'perf_hooks';

const mockDb = {
    execute: async () => {
        // simulate some network/DB delay
        await new Promise(resolve => setTimeout(resolve, 5));
    }
};

async function currentApproach(interactions) {
    for (const { id, type } of interactions) {
        if (type === 'like') {
            await mockDb.execute(`UPDATE games SET upvote = upvote + 1 WHERE id = ?`, [id]);
        } else if (type === 'dislike') {
            await mockDb.execute(`UPDATE games SET downvote = downvote + 1 WHERE id = ?`, [id]);
        }
    }
}

// simulate the buffer
const buffer = new Map();
async function optimizedApproach(interactions) {
    for (const { id, type } of interactions) {
        const current = buffer.get(id) || { likes: 0, dislikes: 0 };
        if (type === 'like') {
            current.likes++;
        } else {
            current.dislikes++;
        }
        buffer.set(id, current);
    }

    // flush
    for (const [id, counts] of buffer.entries()) {
        if (counts.likes > 0 && counts.dislikes > 0) {
            await mockDb.execute(
                `UPDATE games SET upvote = upvote + ?, downvote = downvote + ? WHERE id = ?`,
                [counts.likes, counts.dislikes, id]
            );
        } else if (counts.likes > 0) {
            await mockDb.execute(
                `UPDATE games SET upvote = upvote + ? WHERE id = ?`,
                [counts.likes, id]
            );
        } else if (counts.dislikes > 0) {
            await mockDb.execute(
                `UPDATE games SET downvote = downvote + ? WHERE id = ?`,
                [counts.dislikes, id]
            );
        }
    }
}

async function run() {
    const interactions = Array.from({ length: 1000 }, () => ({
        id: Math.floor(Math.random() * 10) + 1, // 10 games
        type: Math.random() > 0.5 ? 'like' : 'dislike'
    }));

    const start1 = performance.now();
    await currentApproach(interactions);
    const end1 = performance.now();
    console.log(`Current Approach: ${(end1 - start1).toFixed(2)} ms`);

    const start2 = performance.now();
    await optimizedApproach(interactions);
    const end2 = performance.now();
    console.log(`Optimized Approach: ${(end2 - start2).toFixed(2)} ms`);
}

run();
