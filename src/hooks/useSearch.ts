import { useState, useMemo, useCallback } from 'react';

export interface SearchMatch {
  index: number;
  start: number;
  end: number;
  text: string;
  lineNumber: number;
}

export interface UseSearchResult {
  query: string;
  setQuery: (query: string) => void;
  replaceText: string;
  setReplaceText: (text: string) => void;
  caseSensitive: boolean;
  setCaseSensitive: (value: boolean) => void;
  wholeWord: boolean;
  setWholeWord: (value: boolean) => void;
  matches: SearchMatch[];
  currentMatchIndex: number;
  setCurrentMatchIndex: (index: number) => void;
  goToNextMatch: () => void;
  goToPrevMatch: () => void;
  replace: () => string;
  replaceAll: () => string;
  currentMatch: SearchMatch | null;
}

/**
 * Hook for search and replace functionality
 */
export const useSearch = (content: string): UseSearchResult => {
  const [query, setQuery] = useState('');
  const [replaceText, setReplaceText] = useState('');
  const [caseSensitive, setCaseSensitive] = useState(false);
  const [wholeWord, setWholeWord] = useState(false);
  const [currentMatchIndex, setCurrentMatchIndex] = useState(0);

  // Find all matches
  const matches = useMemo(() => {
    if (!query || !content) return [];

    const matches: SearchMatch[] = [];
    let searchQuery = query;

    // Escape special regex characters
    searchQuery = searchQuery.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

    // Add word boundary if whole word is enabled
    if (wholeWord) {
      searchQuery = `\\b${searchQuery}\\b`;
    }

    const flags = caseSensitive ? 'g' : 'gi';
    const regex = new RegExp(searchQuery, flags);

    let match;
    while ((match = regex.exec(content)) !== null) {
      // Calculate line number
      const textBefore = content.substring(0, match.index);
      const lineNumber = textBefore.split('\n').length;

      matches.push({
        index: matches.length,
        start: match.index,
        end: match.index + match[0].length,
        text: match[0],
        lineNumber,
      });
    }

    return matches;
  }, [content, query, caseSensitive, wholeWord]);

  // Current match
  const currentMatch = useMemo(() => {
    if (matches.length === 0) return null;
    const index = Math.min(currentMatchIndex, matches.length - 1);
    return matches[index] || null;
  }, [matches, currentMatchIndex]);

  // Navigate to next match
  const goToNextMatch = useCallback(() => {
    if (matches.length === 0) return;
    setCurrentMatchIndex((prev) => (prev + 1) % matches.length);
  }, [matches.length]);

  // Navigate to previous match
  const goToPrevMatch = useCallback(() => {
    if (matches.length === 0) return;
    setCurrentMatchIndex((prev) => (prev - 1 + matches.length) % matches.length);
  }, [matches.length]);

  // Replace current match
  const replace = useCallback(() => {
    if (!currentMatch) return content;

    const newContent =
      content.substring(0, currentMatch.start) +
      replaceText +
      content.substring(currentMatch.end);

    return newContent;
  }, [content, currentMatch, replaceText]);

  // Replace all matches
  const replaceAll = useCallback(() => {
    if (matches.length === 0 || !query) return content;

    let searchQuery = query;
    searchQuery = searchQuery.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

    if (wholeWord) {
      searchQuery = `\\b${searchQuery}\\b`;
    }

    const flags = caseSensitive ? 'g' : 'gi';
    const regex = new RegExp(searchQuery, flags);

    return content.replace(regex, replaceText);
  }, [content, query, replaceText, caseSensitive, wholeWord, matches.length]);

  // Reset current match index when query changes
  const handleSetQuery = useCallback((newQuery: string) => {
    setQuery(newQuery);
    setCurrentMatchIndex(0);
  }, []);

  return {
    query,
    setQuery: handleSetQuery,
    replaceText,
    setReplaceText,
    caseSensitive,
    setCaseSensitive,
    wholeWord,
    setWholeWord,
    matches,
    currentMatchIndex,
    setCurrentMatchIndex,
    goToNextMatch,
    goToPrevMatch,
    replace,
    replaceAll,
    currentMatch,
  };
};

/**
 * Highlight search matches in content
 * Returns an array of segments with match status
 */
export interface ContentSegment {
  text: string;
  isMatch: boolean;
  isCurrentMatch: boolean;
  matchIndex: number;
}

export const getHighlightedContent = (
  content: string,
  matches: SearchMatch[],
  currentMatchIndex: number
): ContentSegment[] => {
  if (matches.length === 0) {
    return [{ text: content, isMatch: false, isCurrentMatch: false, matchIndex: -1 }];
  }

  const segments: ContentSegment[] = [];
  let lastEnd = 0;

  matches.forEach((match, index) => {
    // Add text before match
    if (match.start > lastEnd) {
      segments.push({
        text: content.substring(lastEnd, match.start),
        isMatch: false,
        isCurrentMatch: false,
        matchIndex: -1,
      });
    }

    // Add match
    segments.push({
      text: match.text,
      isMatch: true,
      isCurrentMatch: index === currentMatchIndex,
      matchIndex: index,
    });

    lastEnd = match.end;
  });

  // Add remaining text
  if (lastEnd < content.length) {
    segments.push({
      text: content.substring(lastEnd),
      isMatch: false,
      isCurrentMatch: false,
      matchIndex: -1,
    });
  }

  return segments;
};
