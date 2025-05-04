import { useState, useCallback } from 'react';

/**
 * A custom hook to handle Kural layout alignment
 */
export const useKuralLayout = () => {
    const [textWidth, setTextWidth] = useState<number>(0);

    // Callback for when the kural text width changes
    const handleLayoutChange = useCallback((width: number) => {
        if (width > 0) {
            setTextWidth(width);
        }
    }, []);

    return {
        textWidth,
        handleLayoutChange
    };
};