import { useState } from 'react';
import { Button } from '../ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import { Filter, SortAsc, SortDesc, Calendar, Tag } from 'lucide-react';
import { CategoryPicker } from './CategoryPicker';
import { DatePicker } from '../ui/date-picker';

interface FilterMenuProps {
  onFilterChange: (filters: FilterOptions) => void;
}

export interface FilterOptions {
  sortBy: 'date' | 'priority' | 'name';
  sortOrder: 'asc' | 'desc';
  category?: string;
  dateRange?: {
    from: Date;
    to: Date;
  };
}

export function FilterMenu({ onFilterChange }: FilterMenuProps) {
  const [filters, setFilters] = useState<FilterOptions>({
    sortBy: 'date',
    sortOrder: 'desc',
  });

  const handleFilterChange = (newFilters: Partial<FilterOptions>) => {
    const updatedFilters = { ...filters, ...newFilters };
    setFilters(updatedFilters);
    onFilterChange(updatedFilters);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon">
          <Filter className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[200px]">
        <DropdownMenuLabel>Filtros</DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        <div className="p-2">
          <p className="text-sm font-medium mb-2">Ordenar por</p>
          <div className="space-y-1">
            <Button
              variant={filters.sortBy === 'date' ? 'default' : 'ghost'}
              size="sm"
              className="w-full justify-start"
              onClick={() => handleFilterChange({ sortBy: 'date' })}
            >
              <Calendar className="h-4 w-4 mr-2" />
              Data
            </Button>
            <Button
              variant={filters.sortBy === 'priority' ? 'default' : 'ghost'}
              size="sm"
              className="w-full justify-start"
              onClick={() => handleFilterChange({ sortBy: 'priority' })}
            >
              <Tag className="h-4 w-4 mr-2" />
              Prioridade
            </Button>
            <Button
              variant={filters.sortBy === 'name' ? 'default' : 'ghost'}
              size="sm"
              className="w-full justify-start"
              onClick={() => handleFilterChange({ sortBy: 'name' })}
            >
              {filters.sortOrder === 'asc' ? (
                <SortAsc className="h-4 w-4 mr-2" />
              ) : (
                <SortDesc className="h-4 w-4 mr-2" />
              )}
              Nome
            </Button>
          </div>
        </div>

        <DropdownMenuSeparator />
        
        <div className="p-2">
          <p className="text-sm font-medium mb-2">Categoria</p>
          <CategoryPicker
            value={filters.category}
            onChange={(category) => handleFilterChange({ category })}
          />
        </div>

        <DropdownMenuSeparator />
        
        <div className="p-2">
          <p className="text-sm font-medium mb-2">Período</p>
          <DatePicker
            selected={filters.dateRange?.from}
            onSelect={(date) =>
              handleFilterChange({
                dateRange: {
                  from: date || new Date(),
                  to: filters.dateRange?.to || new Date(),
                },
              })
            }
          />
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
