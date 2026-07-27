interface Props {
  categories: string[];
  active: string | null;
  onChange: (category: string | null) => void;
}

export function CategoryFilter({ categories, active, onChange }: Props) {
  return (
    <div className="category-filter" role="group" aria-label="Filter stops by category">
      <button type="button" className={`filter-chip${active === null ? " active" : ""}`} onClick={() => onChange(null)}>
        All
      </button>
      {categories.map((category) => (
        <button
          key={category}
          type="button"
          className={`filter-chip${active === category ? " active" : ""}`}
          onClick={() => onChange(active === category ? null : category)}
        >
          {category}
        </button>
      ))}
    </div>
  );
}
