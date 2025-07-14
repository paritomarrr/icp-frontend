import React from "react";

interface ChipListProps {
  items: string[];
  onRemove: (item: string, idx: number) => void;
  className?: string;
}

const ChipList: React.FC<ChipListProps> = ({ items, onRemove, className = "" }) => (
  <div className={`flex flex-wrap gap-2 ${className}`}>
    {items.map((item, idx) => (
      <span key={item + idx} className="bg-gray-200 px-3 py-1 rounded-full flex items-center text-sm">
        {item}
        <button
          type="button"
          onClick={() => onRemove(item, idx)}
          className="ml-2 text-red-500 hover:text-red-700 focus:outline-none"
          aria-label={`Remove ${item}`}
        >
          &times;
        </button>
      </span>
    ))}
  </div>
);

export default ChipList; 