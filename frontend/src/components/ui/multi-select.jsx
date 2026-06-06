import React from 'react';
import { Check, ChevronDown, X } from 'lucide-react';
import { Button } from './button';
import { Badge } from './badge';
import { Checkbox } from './checkbox';
import { Popover, PopoverContent, PopoverTrigger } from './popover';

export function MultiSelect({ options, value, onChange, placeholder, emptyText, 'data-testid': testId }) {
  const selected = Array.isArray(value) ? value : [];
  const selectedOptions = options.filter((option) => selected.includes(option.value));

  const toggleValue = (optionValue) => {
    onChange(selected.includes(optionValue)
      ? selected.filter((item) => item !== optionValue)
      : [...selected, optionValue]);
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button type="button" variant="outline" className="w-full justify-between min-h-10 h-auto" data-testid={testId}>
          <div className="flex flex-wrap gap-1 text-start">
            {selectedOptions.length > 0 ? selectedOptions.slice(0, 3).map((option) => (
              <Badge key={option.value} variant="secondary" className="gap-1">
                {option.label}
                <X className="w-3 h-3" onClick={(event) => { event.stopPropagation(); toggleValue(option.value); }} />
              </Badge>
            )) : <span className="text-muted-foreground">{placeholder}</span>}
            {selectedOptions.length > 3 && <Badge variant="secondary">+{selectedOptions.length - 3}</Badge>}
          </div>
          <ChevronDown className="h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-2" align="start">
        <div className="max-h-64 overflow-y-auto space-y-1">
          {options.length > 0 ? options.map((option) => (
            <div
              key={option.value}
              role="option"
              aria-selected={selected.includes(option.value)}
              tabIndex={0}
              className="flex w-full cursor-pointer items-center gap-2 rounded-md px-2 py-2 text-sm hover:bg-accent"
              onClick={() => toggleValue(option.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                  event.preventDefault();
                  toggleValue(option.value);
                }
              }}
              data-testid={`${testId}-option-${option.value}`}
            >
              <Checkbox checked={selected.includes(option.value)} className="pointer-events-none" />
              <span className="flex-1 text-start">{option.label}</span>
              {selected.includes(option.value) && <Check className="w-4 h-4 text-primary" />}
            </div>
          )) : <p className="py-6 text-center text-sm text-muted-foreground">{emptyText}</p>}
        </div>
      </PopoverContent>
    </Popover>
  );
}
