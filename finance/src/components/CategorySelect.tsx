import { useState } from "react";
import { Check, ChevronsUpDown, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useCategories } from "@/hooks/useApiTransactions";
import type { ApiCategory } from "@/services/api";

interface CategorySelectProps {
  value: string;
  onChange: (value: string) => void;
  onCreateNew?: () => void;
}

export function CategorySelect({ value, onChange, onCreateNew }: CategorySelectProps) {
  const [open, setOpen] = useState(false);
  const { data: categories, isLoading } = useCategories();

  const selectedCategory = categories?.find((cat) => cat.name === value);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
        >
          {selectedCategory ? (
            <span
              className="px-2 py-0.5 rounded text-xs font-medium"
              style={{
                backgroundColor: `${selectedCategory.color}20`,
                color: selectedCategory.color,
              }}
            >
              {selectedCategory.name}
            </span>
          ) : (
            <span className="text-muted-foreground">Selecionar categoria...</span>
          )}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[300px] p-0">
        <Command>
          <CommandInput placeholder="Buscar categoria..." />
          <CommandList>
            <CommandEmpty>
              <div className="p-4 text-center text-sm">
                <p className="text-muted-foreground mb-2">Nenhuma categoria encontrada</p>
                {onCreateNew && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setOpen(false);
                      onCreateNew();
                    }}
                    className="gap-2"
                  >
                    <Plus className="h-4 w-4" />
                    Criar nova categoria
                  </Button>
                )}
              </div>
            </CommandEmpty>
            <CommandGroup>
              {categories
                ?.sort((a, b) => a.name.localeCompare(b.name))
                .map((category) => (
                  <CommandItem
                    key={category.id}
                    value={category.name}
                    onSelect={(currentValue) => {
                      onChange(currentValue === value ? "" : currentValue);
                      setOpen(false);
                    }}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        value === category.name ? "opacity-100" : "opacity-0"
                      )}
                    />
                    <span
                      className="px-2 py-0.5 rounded text-xs font-medium"
                      style={{
                        backgroundColor: `${category.color}20`,
                        color: category.color,
                      }}
                    >
                      {category.name}
                    </span>
                  </CommandItem>
                ))}
            </CommandGroup>
          </CommandList>
          {onCreateNew && (
            <div className="border-t p-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setOpen(false);
                  onCreateNew();
                }}
                className="w-full gap-2 justify-start"
              >
                <Plus className="h-4 w-4" />
                Criar nova categoria
              </Button>
            </div>
          )}
        </Command>
      </PopoverContent>
    </Popover>
  );
}
