'use client';

import { Edit3, Save, X } from 'lucide-react';
import { useItineraryEdit } from '@/app/contexts/ItineraryEditContext';
import { useState } from 'react';

interface EditModeHeaderProps {
  itineraryId: string;
  onSave: () => Promise<void>;
}

export default function EditModeHeader({ itineraryId, onSave }: EditModeHeaderProps) {
  const { isEditMode, setIsEditMode, hasUnsavedChanges, setHasUnsavedChanges } = useItineraryEdit();
  const [saving, setSaving] = useState(false);

  /**
   * Toggle edit mode
   */
  const handleToggleEdit = () => {
    if (isEditMode && hasUnsavedChanges) {
      const confirmDiscard = confirm('You have unsaved changes. Discard them?');
      if (!confirmDiscard) return;

      // Reset to original data
      window.location.reload(); // Simple way to reset
    }

    setIsEditMode(!isEditMode);
  };

  /**
   * Save changes
   */
  const handleSave = async () => {
    setSaving(true);
    try {
      await onSave();
      setHasUnsavedChanges(false);
      setIsEditMode(false);
      alert('Changes saved successfully!');
    } catch (error) {
      console.error('[Edit Mode] Save failed:', error);
      alert('Failed to save changes. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  /**
   * Cancel editing
   */
  const handleCancel = () => {
    if (hasUnsavedChanges) {
      const confirmDiscard = confirm('Discard all changes?');
      if (!confirmDiscard) return;
    }

    setIsEditMode(false);
    window.location.reload(); // Reset to saved state
  };

  return (
    <div className="w-full">
      {!isEditMode ? (
        <button
          onClick={handleToggleEdit}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 min-h-[44px] bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
        >
          <Edit3 className="w-4 h-4 flex-shrink-0" />
          <span>Edit Trip</span>
        </button>
      ) : (
        <div className="flex flex-col gap-2 w-full">
          {/* Save and Cancel buttons - side by side */}
          <div className="flex gap-2">
            <button
              onClick={handleSave}
              disabled={!hasUnsavedChanges || saving}
              className="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 min-h-[44px] bg-green-600 hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors text-sm"
            >
              <Save className="w-4 h-4 flex-shrink-0" />
              <span className="truncate">{saving ? 'Saving...' : 'Save'}</span>
            </button>

            <button
              onClick={handleCancel}
              disabled={saving}
              className="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 min-h-[44px] bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-900 dark:text-gray-100 rounded-lg font-medium transition-colors text-sm"
            >
              <X className="w-4 h-4 flex-shrink-0" />
              <span>Cancel</span>
            </button>
          </div>

          {/* Unsaved changes indicator */}
          {hasUnsavedChanges && (
            <p className="text-xs text-orange-500 dark:text-orange-400 font-medium text-center">
              • Unsaved changes
            </p>
          )}
        </div>
      )}
    </div>
  );
}
