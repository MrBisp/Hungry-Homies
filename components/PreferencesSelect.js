import { useState, useEffect } from 'react';

export default function PreferencesSelect({ value = [], onChange }) {
    const [preferences, setPreferences] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchPreferences = async () => {
            try {
                const response = await fetch('/api/preferences');
                const data = await response.json();
                setPreferences(data);
            } catch (error) {
                console.error('Error fetching preferences:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchPreferences();
    }, []);

    const handlePreferenceToggle = (preferenceId) => {
        const exists = value.some(p => p.preference_id === preferenceId);
        const updatedPreferences = exists
            ? value.filter(p => p.preference_id !== preferenceId)
            : [...value, { preference_id: preferenceId, is_available: true }];
        onChange(updatedPreferences);
    };

    if (isLoading) return <div>Loading preferences...</div>;

    return (
        <div className="grid grid-cols-2 gap-4">
            {preferences.map((preference) => (
                <button
                    key={preference.id}
                    type="button"
                    onClick={() => handlePreferenceToggle(preference.id)}
                    className={`flex items-center gap-3 p-3 rounded-lg border transition-colors
                        ${value.some(p => p.preference_id === preference.id)
                            ? 'bg-blue-50 border-blue-600 text-blue-700'
                            : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'}`}
                >
                    <span className="text-xl">{preference.icon}</span>
                    <span className="text-sm font-medium">{preference.description}</span>
                </button>
            ))}
        </div>
    );
}