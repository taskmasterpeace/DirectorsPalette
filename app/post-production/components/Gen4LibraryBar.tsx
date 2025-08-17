import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Tag, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface ReferenceItem {
  id: string;
  url: string;
  tags: string[];
  category?: 'people' | 'places' | 'props' | 'uncategorized';
}

interface Props {
  items: ReferenceItem[];
  onSetRef: (url: string, slot: number) => void;
  onDelete: (id: string) => void;
  onUpdateTags: (id: string, tags: string[]) => void;
  onUpdateCategory: (id: string, category: string) => void;
}

export default function Gen4LibraryBar({ 
  items, 
  onSetRef, 
  onDelete, 
  onUpdateTags,
  onUpdateCategory 
}: Props) {
  const [editingTags, setEditingTags] = useState<string | null>(null);
  const [tagInput, setTagInput] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'people' | 'places' | 'props' | 'uncategorized'>('all');

  const filteredItems = selectedCategory === 'all' 
    ? items 
    : items.filter(item => item.category === selectedCategory || (!item.category && selectedCategory === 'uncategorized'));

  const handleAddTag = (itemId: string) => {
    if (tagInput.trim()) {
      const item = items.find(i => i.id === itemId);
      if (item) {
        const newTags = [...(item.tags || []), tagInput.trim()];
        onUpdateTags(itemId, newTags);
        setTagInput("");
      }
    }
  };

  const handleRemoveTag = (itemId: string, tagIndex: number) => {
    const item = items.find(i => i.id === itemId);
    if (item) {
      const newTags = item.tags.filter((_, i) => i !== tagIndex);
      onUpdateTags(itemId, newTags);
    }
  };

  const categories = [
    { value: 'all', label: 'All', color: 'bg-gray-500' },
    { value: 'people', label: 'People', color: 'bg-blue-500' },
    { value: 'places', label: 'Places', color: 'bg-green-500' },
    { value: 'props', label: 'Props', color: 'bg-purple-500' },
    { value: 'uncategorized', label: 'Uncategorized', color: 'bg-gray-400' },
  ];

  if (items.length === 0) return null;

  return (
    <div className="bg-gray-900/90 backdrop-blur-sm p-2 border-t">
      {/* Category Filter Tabs */}
      <div className="flex gap-2 mb-2">
        {categories.map(cat => (
          <Button
            key={cat.value}
            size="sm"
            variant={selectedCategory === cat.value ? "default" : "outline"}
            className="text-xs"
            onClick={() => setSelectedCategory(cat.value as any)}
          >
            <span className={`w-2 h-2 rounded-full ${cat.color} mr-1`} />
            {cat.label} ({cat.value === 'all' ? items.length : 
              items.filter(i => i.category === cat.value || (!i.category && cat.value === 'uncategorized')).length})
          </Button>
        ))}
      </div>

      {/* Reference Items */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {filteredItems.map((item) => (
          <div key={item.id} className="relative shrink-0 group">
            <img
              src={item.url}
              alt="ref"
              className="w-24 h-24 object-cover rounded border border-gray-600"
            />
            
            {/* Category Indicator */}
            <div className="absolute top-1 left-1">
              <select
                value={item.category || 'uncategorized'}
                onChange={(e) => onUpdateCategory(item.id, e.target.value)}
                className="bg-black/60 text-white text-[10px] rounded px-1 py-0.5 border border-gray-600"
              >
                <option value="people">People</option>
                <option value="places">Places</option>
                <option value="props">Props</option>
                <option value="uncategorized">Uncategorized</option>
              </select>
            </div>

            {/* Tags Display */}
            <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-[10px] px-1 py-0.5">
              <Popover open={editingTags === item.id} onOpenChange={(open) => setEditingTags(open ? item.id : null)}>
                <PopoverTrigger asChild>
                  <button className="flex items-center gap-1 w-full hover:bg-black/80 rounded">
                    <Tag className="w-3 h-3" />
                    <span className="truncate">
                      {item.tags?.length > 0 ? item.tags[0] : "Add tags"}
                      {item.tags?.length > 1 && ` +${item.tags.length - 1}`}
                    </span>
                  </button>
                </PopoverTrigger>
                <PopoverContent className="w-48 p-2">
                  <div className="space-y-2">
                    <div className="text-xs font-medium">Tags</div>
                    <div className="flex flex-wrap gap-1">
                      {item.tags?.map((tag, idx) => (
                        <div key={idx} className="bg-gray-200 rounded px-1.5 py-0.5 text-xs flex items-center gap-1">
                          {tag}
                          <button
                            onClick={() => handleRemoveTag(item.id, idx)}
                            className="hover:text-red-500"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                    <div className="flex gap-1">
                      <Input
                        value={tagInput}
                        onChange={(e) => setTagInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            handleAddTag(item.id);
                          }
                        }}
                        placeholder="Add tag..."
                        className="h-7 text-xs"
                      />
                      <Button
                        size="sm"
                        onClick={() => handleAddTag(item.id)}
                        className="h-7 px-2"
                      >
                        Add
                      </Button>
                    </div>
                  </div>
                </PopoverContent>
              </Popover>
            </div>

            {/* Slot Selection Buttons */}
            <div className="absolute top-1 right-1 flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              {[1, 2, 3].map((slot) => (
                <Button
                  key={slot}
                  size="sm"
                  className="h-5 w-5 p-0 text-[10px] bg-blue-600 hover:bg-blue-700"
                  title={`Set as reference ${slot}`}
                  onClick={() => onSetRef(item.url, slot - 1)}
                >
                  {slot}
                </Button>
              ))}
              <Button
                size="sm"
                variant="destructive"
                className="h-5 w-5 p-0 text-[10px]"
                onClick={() => onDelete(item.id)}
                title="Delete"
              >
                ×
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}