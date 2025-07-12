// components/TagsInput.tsx
import { useState } from 'react';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { X } from 'lucide-react';

interface TagsInputProps {
  value: string[];
  onChange: (tags: string[]) => void;
  placeholder?: string;
}

export const TagsInput = ({ value, onChange, placeholder }: TagsInputProps) => {
  const [input, setInput] = useState('');

  const addTag = () => {
    const trimmed = input.trim();
    if (trimmed && !value.includes(trimmed)) {
      onChange([...value, trimmed]);
      setInput('');
    }
  };

  const removeTag = (tag: string) => {
    onChange(value.filter(t => t !== tag));
  };

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2">
        {value.map(tag => (
          <div key={tag} className="flex items-center bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm">
            {tag}
            <button type="button" onClick={() => removeTag(tag)} className="ml-1">
              <X className="w-3 h-3" />
            </button>
          </div>
        ))}
      </div>
      <div className="flex gap-2">
        <Input
          placeholder={placeholder}
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && addTag()}
        />
        <Button type="button" onClick={addTag} size="sm">Add</Button>
      </div>
    </div>
  );
};
