export default function ErrorMessage({ message, onRetry }) {
  return <div className="error" role="alert"><div><strong>Не получилось загрузить данные</strong><p>{message}</p></div><button className="secondary" onClick={onRetry}>Повторить</button></div>;
}
