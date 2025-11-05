const express = require('express');
const Page = require('../models/Page');
const Document = require('../models/Document');

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const { q, page = 1, limit = 10 } = req.query;
    
    if (!q) {
      return res.status(400).json({ error: 'Query parameter is required' });
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Text search with MongoDB text index
    const searchResults = await Page.find(
      { $text: { $search: q } },
      { score: { $meta: 'textScore' } }
    )
    .populate('documentId')
    .sort({ score: { $meta: 'textScore' } })
    .skip(skip)
    .limit(parseInt(limit));

    const total = await Page.countDocuments({ $text: { $search: q } });

    // Generate highlighted snippets
    const results = searchResults.map(page => {
      const text = page.text || '';
      const queryWords = q.toLowerCase().split(' ');
      
      // Find snippet around first match
      let snippet = '';
      let highlightedSnippet = '';
      
      for (const word of queryWords) {
        const index = text.toLowerCase().indexOf(word);
        if (index !== -1) {
          const start = Math.max(0, index - 100);
          const end = Math.min(text.length, index + word.length + 100);
          snippet = text.substring(start, end);
          
          // Highlight matches
          highlightedSnippet = snippet.replace(
            new RegExp(`(${queryWords.join('|')})`, 'gi'),
            '<mark>$1</mark>'
          );
          break;
        }
      }

      return {
        documentId: page.documentId._id,
        documentName: page.documentId.originalName,
        pageNumber: page.pageNumber,
        snippet: highlightedSnippet || text.substring(0, 200),
        confidence: page.confidence,
        score: page.score
      };
    });

    res.json({
      results,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      },
      query: q
    });

  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({ error: 'Search failed' });
  }
});

module.exports = router;