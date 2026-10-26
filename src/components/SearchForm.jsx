export default function SearchForm({ value, onChange, onSearch, loading }) {
  return (
    <form
      className="search-form"
      onSubmit={(event) => {
        event.preventDefault();
        onSearch();
      }}
    >
      <label htmlFor="number">Артикул детали</label>
      <div className="search-row">
        <div className="input-wrap">
          <input
            id="number"
            autoComplete="off"
            placeholder="Например, 01089"
            value={value}
            onChange={(event) => onChange(event.target.value)}
          />
          {value && (
            <button
              type="button"
              className="clear"
              aria-label="Очистить артикул"
              onClick={() => onChange("")}
            >
              ×
            </button>
          )}
        </div>
        <button
          className="primary"
          type="submit"
          disabled={!value.trim() || loading}
        >
          Найти
        </button>
      </div>
    </form>
  );
}
