interface YearSelectorProps {
  years: number[];
  selected: number;
  onChange: (year: number) => void;
}

const YearSelector = ({ years, selected, onChange }: YearSelectorProps) => (
  <div className="flex flex-wrap gap-2">
    {years.map((year) => (
      <button
        key={year}
        onClick={() => onChange(year)}
        className={`rounded-md px-4 py-2 text-sm font-semibold transition-all ${
          selected === year
            ? "bg-[#00ED64] text-black shadow-md"   // selected: neon green
            : "border border-gray-700 bg-gray-800 text-gray-300 hover:bg-gray-700" // not selected: dark gray with hover effect
        }`}
      >
        {year}
      </button>
    ))}
  </div>
);

export default YearSelector;
