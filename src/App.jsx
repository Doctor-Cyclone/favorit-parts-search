import { useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchBrands,
  fetchOffers,
  selectBrand,
  setSearchNumber,
} from "./store/partsSlice";
import SearchForm from "./components/SearchForm";
import BrandList from "./components/BrandList";
import OffersTable from "./components/OffersTable";
import Loader from "./components/Loader";
import ErrorMessage from "./components/ErrorMessage";
export default function App() {
  const dispatch = useDispatch();
  const {
    searchNumber,
    brands,
    selectedBrand,
    offers,
    brandsStatus,
    offersStatus,
    error,
  } = useSelector((store) => store.parts);
  const brandsRequest = useRef(null);
  const offersRequest = useRef(null);
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchNumber.trim())
        brandsRequest.current = dispatch(fetchBrands(searchNumber.trim()));
    }, 450);
    return () => {
      clearTimeout(timer);
      brandsRequest.current?.abort();
    };
  }, [dispatch, searchNumber]);
  useEffect(() => () => offersRequest.current?.abort(), []);
  const changeNumber = (number) => {
    brandsRequest.current?.abort();
    offersRequest.current?.abort();
    dispatch(setSearchNumber(number));
  };
  const chooseBrand = (brand) => {
    offersRequest.current?.abort();
    dispatch(selectBrand(brand));
    offersRequest.current = dispatch(
      fetchOffers({ number: searchNumber.trim(), brand }),
    );
  };
  const retry = () => {
    if (selectedBrand) chooseBrand(selectedBrand);
    else brandsRequest.current = dispatch(fetchBrands(searchNumber.trim()));
  };
  return (
    <>
      <header className="topbar">
        <a className="logo" href="./" aria-label="Partline — главная">
          <span className="logo-mark" aria-hidden="true">
            p<span>↗</span>
          </span>
          partline<span className="logo-dot">.</span>
        </a>
        <span className="topbar-caption">Поиск автозапчастей</span>
        <span className="mode">
          <i />
          Favorit Parts API
        </span>
      </header>
      <main>
        <div className="intro">
          <div className="eyebrow">КАТАЛОГ ЗАПЧАСТЕЙ</div>
          <h1>
            Нужная деталь.
            <br />
            <span>Без лишних поисков.</span>
          </h1>
          <p>
            Производители, аналоги и наличие на складах — по одному артикулу.
          </p>
        </div>
        <SearchForm value={searchNumber} onChange={changeNumber} />
        {brandsStatus === "loading" && <Loader>Ищем производителей…</Loader>}
        {error && <ErrorMessage message={error} onRetry={retry} />}
        {brandsStatus === "succeeded" && brands.length > 0 && (
          <BrandList
            brands={brands}
            selectedBrand={selectedBrand}
            onSelect={chooseBrand}
          />
        )}
        {brandsStatus === "succeeded" && !brands.length && (
          <div className="empty-state">
            <span aria-hidden="true">⌕</span>
            <h2>Производители не найдены</h2>
            <p>Проверьте артикул или попробуйте другой номер детали.</p>
          </div>
        )}
        {offersStatus === "loading" && (
          <Loader>Загружаем предложения и аналоги…</Loader>
        )}
        {offersStatus === "succeeded" &&
          (offers.length ? (
            <OffersTable
              offers={offers}
              brand={selectedBrand}
              number={searchNumber.trim()}
            />
          ) : (
            <div className="empty-state">
              <h2>Предложений и аналогов пока нет</h2>
              <p>Попробуйте другого производителя или артикул.</p>
            </div>
          ))}
        {!searchNumber.trim() && (
          <div className="empty-state initial">
            <span aria-hidden="true">⌕</span>
            <h2>Начните с артикула</h2>
            <p>
              Сначала выберите производителя,
              <br />а мы соберём доступные предложения.
            </p>
          </div>
        )}
        <footer>
          <span>
            partline<span className="logo-dot">.</span>
          </span>
          <span>Данные о наличии и ценах · Favorit Parts</span>
          <span>React + Redux Toolkit</span>
        </footer>
      </main>
    </>
  );
}
