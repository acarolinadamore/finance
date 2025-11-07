import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useFinanceStore } from "@/store/useFinanceStore";
import dayjs from "dayjs";

export const YearPicker = () => {
  const { selectedYear, setSelectedYear, selectedMonth, setSelectedMonth } = useFinanceStore();

  const handlePrevYear = () => {
    const newYear = selectedYear - 1;
    setSelectedYear(newYear);

    // Atualizar o mês para manter o mês atual mas com o novo ano
    const currentMonth = dayjs(selectedMonth).month(); // 0-11
    const newMonth = dayjs().year(newYear).month(currentMonth).format('YYYY-MM');
    setSelectedMonth(newMonth);
  };

  const handleNextYear = () => {
    const newYear = selectedYear + 1;
    setSelectedYear(newYear);

    // Atualizar o mês para manter o mês atual mas com o novo ano
    const currentMonth = dayjs(selectedMonth).month(); // 0-11
    const newMonth = dayjs().year(newYear).month(currentMonth).format('YYYY-MM');
    setSelectedMonth(newMonth);
  };

  const handleToday = () => {
    const today = new Date();
    setSelectedYear(today.getFullYear());
    setSelectedMonth(dayjs().format('YYYY-MM'));
  };

  return (
    <div className="flex items-center gap-2">
      <Button
        variant="outline"
        size="icon"
        onClick={handlePrevYear}
        className="h-9 w-9"
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>

      <Button
        variant="outline"
        onClick={handleToday}
        className="min-w-[100px] font-semibold"
      >
        {selectedYear}
      </Button>

      <Button
        variant="outline"
        size="icon"
        onClick={handleNextYear}
        className="h-9 w-9"
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  );
};
