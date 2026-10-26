export default function Loader({ children }) {
  return (
    <div className="state" role="status">
      <span className="spinner" aria-hidden="true" />
      {children}
    </div>
  );
}
