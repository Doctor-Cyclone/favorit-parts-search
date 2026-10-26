export default function SearchForm({ value, onChange, isDemo }) {
  return <section className="panel search-panel" aria-labelledby="search-title">
    <div className="section-heading"><span className="step">01</span><div><h2 id="search-title">Найдём нужную деталь</h2><p>Введите артикул — подберём производителей и предложения.</p></div></div>
    <label htmlFor="number">Артикул детали</label>
    <div className="input-wrap"><span aria-hidden="true">⌕</span><input id="number" autoComplete="off" placeholder="Например, 01089" value={value} onChange={(event) => onChange(event.target.value)} />{value && <button className="clear" aria-label="Очистить артикул" onClick={() => onChange('')}>×</button>}</div>
    <div className="search-hint"><span>Поиск начнётся автоматически</span><span>450 мс после ввода</span></div>
    {isDemo && <div className="examples">Попробуйте:{['01089', '7160500039S', 'OC90'].map((number) => <button key={number} onClick={() => onChange(number)}>{number} ↗</button>)}</div>}
  </section>;
}
