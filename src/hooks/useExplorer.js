import { useState, useEffect, useMemo } from 'react';
import { dbService } from '../services/dbService';

export function useExplorer() {
    const [activeTab, setActiveTab] = useState('tables');
    const [objects, setObjects] = useState([]);
    const [schemas, setSchemas] = useState(['public']);
    const [selectedSchema, setSelectedSchema] = useState('all');
    const [sortBy, setSortBy] = useState('name'); // 'name' | 'size' | 'rows'
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [error, setError] = useState(null);

    // Fetch schemas once
    useEffect(() => {
        async function loadSchemas() {
            try {
                const s = await dbService.getSchemas();
                setSchemas(s);
            } catch (e) {
                console.error('Schema load failed');
            }
        }
        loadSchemas();
    }, []);

    useEffect(() => {
        async function fetchData() {
            setIsLoading(true);
            setError(null);
            try {
                const data = await dbService.getObjects(activeTab, selectedSchema);
                setObjects(data);
            } catch (err) {
                setError('Failed to fetch database objects');
            } finally {
                setIsLoading(false);
            }
        }

        if (!searchQuery) {
            fetchData();
        }
    }, [activeTab, searchQuery, selectedSchema]);

    useEffect(() => {
        let timeoutId;
        if (searchQuery) {
            setIsLoading(true);
            timeoutId = setTimeout(async () => {
                try {
                    const results = await dbService.searchObjects(searchQuery);
                    setObjects(results);
                } catch (err) {
                    setError('Search failed');
                } finally {
                    setIsLoading(false);
                }
            }, 400);
        }
        return () => clearTimeout(timeoutId);
    }, [searchQuery]);

    const sortedObjects = useMemo(() => {
        return [...objects].sort((a, b) => {
            if (sortBy === 'name') return a.name.localeCompare(b.name);
            if (sortBy === 'rows') return (parseInt(b.rows) || 0) - (parseInt(a.rows) || 0);
            if (sortBy === 'size') {
                const getVal = (s) => parseFloat(s) || 0;
                return getVal(b.size) - getVal(a.size);
            }
            return 0;
        });
    }, [objects, sortBy]);

    return {
        activeTab,
        setActiveTab,
        objects: sortedObjects,
        schemas,
        selectedSchema,
        setSelectedSchema,
        sortBy,
        setSortBy,
        isLoading,
        searchQuery,
        setSearchQuery,
        error,
        stats: {
            count: objects.length,
            schema: selectedSchema === 'all' ? 'All Schemas' : `${selectedSchema} schema`
        }
    };
}
