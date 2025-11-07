import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Check, X } from "lucide-react";
import { useState, useRef } from "react";
import { CardManager } from "./CardManager";
import { useFinanceStore } from "@/store/useFinanceStore";
import { Button } from "@/components/ui/button";

const MONTH_NAMES = [
  'Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun',
  'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'
];

export function CreditCardMonthlyTable() {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

  const { cards, cardMonthlyExpenses, updateCardMonthlyExpense, selectedMonth, selectedYear } = useFinanceStore();

  // Extrair mês atual do selectedMonth (formato: YYYY-MM)
  const currentMonth = selectedMonth ? parseInt(selectedMonth.split('-')[1]) - 1 : new Date().getMonth();
  const currentYear = selectedYear;

  // Gerar array de 12 meses a partir do mês atual
  const generateMonths = () => {
    const months = [];
    for (let i = 0; i < 12; i++) {
      const monthIndex = (currentMonth + i) % 12;
      const yearOffset = Math.floor((currentMonth + i) / 12);
      const year = currentYear + yearOffset;
      months.push({
        name: MONTH_NAMES[monthIndex],
        monthIndex: monthIndex,
        year: year,
        displayName: MONTH_NAMES[monthIndex] // Apenas o nome do mês
      });
    }
    return months;
  };

  const months = generateMonths();

  const [editingCell, setEditingCell] = useState<{ cardId: string; month: number; year: number } | null>(null);
  const [editValue, setEditValue] = useState('');

  const handleEditStart = (cardId: string, monthIndex: number, year: number) => {
    const key = `${year}-${monthIndex}`;
    const currentValue = cardMonthlyExpenses[cardId]?.[key] || 0;
    setEditValue(currentValue.toString());
    setEditingCell({ cardId, month: monthIndex, year });
  };

  const handleEditSave = () => {
    if (editingCell) {
      updateCardMonthlyExpense(editingCell.cardId, editingCell.year, editingCell.month, parseFloat(editValue) || 0);
      setEditingCell(null);
    }
  };

  const handleEditCancel = () => {
    setEditingCell(null);
    setEditValue('');
  };

  const getMonthTotal = (monthIndex: number, year: number) => {
    const key = `${year}-${monthIndex}`;
    return cards.reduce((sum, card) => {
      return sum + (cardMonthlyExpenses[card.id]?.[key] || 0);
    }, 0);
  };

  const getCardTotal = (cardId: string) => {
    return months.reduce((sum, month) => {
      const key = `${month.year}-${month.monthIndex}`;
      return sum + (cardMonthlyExpenses[cardId]?.[key] || 0);
    }, 0);
  };

  const getGrandTotal = () => {
    return cards.reduce((sum, card) => sum + getCardTotal(card.id), 0);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!scrollContainerRef.current) return;
    setIsDragging(true);
    setStartX(e.pageX - scrollContainerRef.current.offsetLeft);
    setScrollLeft(scrollContainerRef.current.scrollLeft);
  };

  const handleMouseLeave = () => {
    setIsDragging(false);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !scrollContainerRef.current) return;
    e.preventDefault();
    const x = e.pageX - scrollContainerRef.current.offsetLeft;
    const walk = (x - startX) * 2; // Velocidade do scroll
    scrollContainerRef.current.scrollLeft = scrollLeft - walk;
  };

  return (
    <Card className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">Gastos Mensais por Cartão</h3>
        <CardManager />
      </div>

      <div
        ref={scrollContainerRef}
        className="overflow-x-auto scrollbar-hide select-none"
        style={{
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
          cursor: isDragging ? 'grabbing' : 'grab'
        }}
        onMouseDown={handleMouseDown}
        onMouseLeave={handleMouseLeave}
        onMouseUp={handleMouseUp}
        onMouseMove={handleMouseMove}
      >
        <style>{`
          .scrollbar-hide::-webkit-scrollbar {
            display: none;
          }
        `}</style>
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b-2">
              <th className="p-3 text-left font-semibold sticky left-0 bg-slate-100 z-20">
                Cartão
              </th>
              {months.map((month, index) => (
                <th key={index} className="p-3 text-center font-semibold min-w-[100px] whitespace-nowrap">
                  {month.displayName}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {cards.map((card) => (
              <tr key={card.id} className="border-b hover:bg-muted/30">
                <td className="p-3 sticky left-0 bg-slate-50 z-20">
                  <div className="flex items-center gap-2">
                    <span
                      className="px-3 py-1 rounded text-sm font-medium"
                      style={{
                        backgroundColor: `${card.color}20`,
                        color: card.color,
                      }}
                    >
                      {card.nickname}
                    </span>
                  </div>
                </td>
                {months.map((month, index) => {
                  const key = `${month.year}-${month.monthIndex}`;
                  const isEditing = editingCell?.cardId === card.id && editingCell?.month === month.monthIndex && editingCell?.year === month.year;
                  const amount = cardMonthlyExpenses[card.id]?.[key] || 0;

                  return (
                    <td
                      key={index}
                      className="p-3 text-center cursor-pointer hover:bg-muted/50"
                      onClick={() => !isEditing && handleEditStart(card.id, month.monthIndex, month.year)}
                    >
                      {isEditing ? (
                        <div className="flex items-center gap-1 justify-center">
                          <Input
                            type="number"
                            step="0.01"
                            value={editValue}
                            onChange={(e) => setEditValue(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') handleEditSave();
                              if (e.key === 'Escape') handleEditCancel();
                            }}
                            className="w-24 h-8 text-center"
                            autoFocus
                          />
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEditSave();
                            }}
                          >
                            <Check className="h-4 w-4 text-green-600" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEditCancel();
                            }}
                          >
                            <X className="h-4 w-4 text-red-600" />
                          </Button>
                        </div>
                      ) : (
                        <span className="font-medium text-red-400">
                          R$ {amount.toFixed(2)}
                        </span>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
            <tr className="border-t-2 bg-slate-100 font-bold">
              <td className="p-3 sticky left-0 bg-slate-100 z-20">Total por Mês</td>
              {months.map((month, index) => (
                <td key={index} className="p-3 text-center whitespace-nowrap text-red-400">
                  R$ {getMonthTotal(month.monthIndex, month.year).toFixed(2)}
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
    </Card>
  );
}
