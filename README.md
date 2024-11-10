# Warpspace Chrome Extension

![](https://media0.giphy.com/media/v1.Y2lkPTc5MGI3NjExdDM5bnVxdzRwZnZoanVvcmxmcnBiYnl6cDVvbXlncGtiZHV4c3JiOSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/2sRU2RZ6Ty0mqVitDM/giphy.gif)

*This is just code I've written for myself; no guarantees about performance / security; use at your own risk*

This is a Chrome extension I use for organizing tabs, naming windows, and performing full-text search over every webpage I've ever visited. A small image preview is roughly 10kb, and the full-text + inverted index entries for a typical webpage are about the same, meaning this is actually feasible!

## Search

Search works in two stages: there's a standard stemmer-lexer-inverted index retrieval component, and then a fuzzy-matching + heuristic re-ranker. For the first stage, I use Jaccard distance over trigrams for titles / urls, and a pretty normal English tokenizer with prefix search for the full text, with some modifications for code. This means you can search any substring in a title / url, and any prefix of a token in a site body. 
