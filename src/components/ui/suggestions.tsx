import React, { useState } from 'react';
import { Check, X, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface SuggestionsProps {
  suggestions: any;
  onAccept: (accepted: any) => void;
  onSkip?: () => void;
  type: 'array' | 'string' | 'competitors';
  title: string;
  description?: string;
}

export const Suggestions: React.FC<SuggestionsProps> = ({
  suggestions,
  onAccept,
  onSkip,
  type,
  title,
  description
}) => {
  const [selectedItems, setSelectedItems] = useState<any>(type === 'string' ? (typeof suggestions === 'string' ? suggestions : '') : []);
  const [customInput, setCustomInput] = useState('');

  const handleAccept = () => {
    console.log('Suggestions handleAccept called with:', { type, selectedItems });
    if (type === 'string') {
      onAccept(selectedItems);
    } else if (type === 'array') {
      onAccept(selectedItems);
    } else if (type === 'competitors') {
      onAccept(selectedItems);
    }
  };

  const handleItemToggle = (item: any) => {
    console.log('handleItemToggle called with:', { type, item });
    if (type === 'array') {
      setSelectedItems((prev: any[]) => {
        const exists = prev.find(i => i === item);
        if (exists) {
          return prev.filter(i => i !== item);
        } else {
          return [...prev, item];
        }
      });
    } else if (type === 'competitors') {
      setSelectedItems((prev: any[]) => {
        const exists = prev.find((i: any) => i.name === item.name);
        if (exists) {
          return prev.filter((i: any) => i.name !== item.name);
        } else {
          return [...prev, item];
        }
      });
    }
  };

  const handleAddCustom = () => {
    if (customInput.trim()) {
      if (type === 'array') {
        setSelectedItems((prev: any[]) => [...prev, customInput.trim()]);
      } else if (type === 'competitors') {
        // For competitors, expect format: "Name (URL)"
        const match = customInput.match(/^(.+?)\s*\((.+?)\)$/);
        if (match) {
          setSelectedItems((prev: any[]) => [...prev, { name: match[1].trim(), url: match[2].trim() }]);
        } else {
          // Default to name only
          setSelectedItems((prev: any[]) => [...prev, { name: customInput.trim(), url: '' }]);
        }
      }
      setCustomInput('');
    }
  };

  const renderSuggestions = () => {
    if (type === 'string') {
      return (
        <div className="space-y-3">
          <textarea
            value={selectedItems}
            onChange={(e) => setSelectedItems(e.target.value)}
            className="w-full min-h-[120px] p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Edit the generated content..."
          />
        </div>
      );
    }

    if (type === 'array') {
      return (
        <div className="space-y-3">
          <div className="flex flex-wrap gap-2">
            {suggestions.map((item: string, index: number) => (
              <Badge
                key={index}
                variant={selectedItems.includes(item) ? "default" : "outline"}
                className={cn(
                  "cursor-pointer transition-all",
                  selectedItems.includes(item) && "bg-blue-600 text-white"
                )}
                onClick={() => handleItemToggle(item)}
              >
                {item}
                {selectedItems.includes(item) && <Check className="w-3 h-3 ml-1" />}
              </Badge>
            ))}
          </div>
          
          <div className="flex gap-2">
            <input
              type="text"
              value={customInput}
              onChange={(e) => setCustomInput(e.target.value)}
              placeholder="Add custom item..."
              className="flex-1 px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              onKeyPress={(e) => e.key === 'Enter' && handleAddCustom()}
            />
            <Button size="sm" onClick={handleAddCustom}>Add</Button>
          </div>
        </div>
      );
    }

    if (type === 'competitors') {
      return (
        <div className="space-y-3">
          <div className="space-y-2">
            {suggestions.map((item: any, index: number) => (
              <div
                key={index}
                className={cn(
                  "p-3 border rounded-lg cursor-pointer transition-all",
                  selectedItems.find((i: any) => i.name === item.name)
                    ? "border-blue-600 bg-blue-50"
                    : "border-gray-200 hover:border-gray-300"
                )}
                onClick={() => handleItemToggle(item)}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{item.name}</p>
                    <p className="text-sm text-gray-600">{item.url}</p>
                  </div>
                  {selectedItems.find((i: any) => i.name === item.name) && (
                    <Check className="w-4 h-4 text-blue-600" />
                  )}
                </div>
              </div>
            ))}
          </div>
          
          <div className="flex gap-2">
            <input
              type="text"
              value={customInput}
              onChange={(e) => setCustomInput(e.target.value)}
              placeholder="Add competitor (Name (URL))..."
              className="flex-1 px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              onKeyPress={(e) => e.key === 'Enter' && handleAddCustom()}
            />
            <Button size="sm" onClick={handleAddCustom}>Add</Button>
          </div>
        </div>
      );
    }

    return null;
  };

  return (
    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-6">
      <div className="flex items-center gap-2 mb-4">
        <Sparkles className="w-5 h-5 text-blue-600" />
        <h3 className="text-lg font-semibold text-blue-900">{title}</h3>
      </div>
      
      {description && (
        <p className="text-sm text-blue-700 mb-4">{description}</p>
      )}
      
      {renderSuggestions()}
      
      <div className="flex gap-3 mt-6">
        <Button onClick={handleAccept} className="bg-blue-600 hover:bg-blue-700">
          <Check className="w-4 h-4 mr-2" />
          Accept Suggestions
        </Button>
        {onSkip && (
          <Button variant="outline" onClick={onSkip}>
            <X className="w-4 h-4 mr-2" />
            Skip
          </Button>
        )}
      </div>
    </div>
  );
}; 