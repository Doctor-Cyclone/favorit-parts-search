import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { normalizeOffers, requestParts } from "../api/partsApi";
export const fetchBrands = createAsyncThunk(
  "parts/fetchBrands",
  async (number, { signal }) => {
    const goods = await requestParts({ number }, signal);
    return [...new Set(goods.map((item) => item.brand.trim()))];
  },
);
export const fetchOffers = createAsyncThunk(
  "parts/fetchOffers",
  async ({ number, brand }, { signal }) =>
    normalizeOffers(await requestParts({ number, brand }, signal)),
);
const initialState = {
  searchNumber: "",
  brands: [],
  selectedBrand: null,
  offers: [],
  brandsStatus: "idle",
  offersStatus: "idle",
  error: null,
  brandsRequestId: null,
  offersRequestId: null,
};
const partsSlice = createSlice({
  name: "parts",
  initialState,
  reducers: {
    setSearchNumber: (_, action) => ({
      ...initialState,
      searchNumber: action.payload,
    }),
    selectBrand(state, action) {
      state.selectedBrand = action.payload;
      state.offers = [];
      state.offersStatus = "idle";
      state.offersRequestId = null;
      state.error = null;
    },
  },
  extraReducers(builder) {
    builder
      .addCase(fetchBrands.pending, (state, action) => {
        state.brandsStatus = "loading";
        state.brandsRequestId = action.meta.requestId;
        state.error = null;
      })
      .addCase(fetchBrands.fulfilled, (state, action) => {
        if (state.brandsRequestId !== action.meta.requestId) return;
        state.brands = action.payload;
        state.brandsStatus = "succeeded";
      })
      .addCase(fetchBrands.rejected, (state, action) => {
        if (state.brandsRequestId !== action.meta.requestId) return;
        state.brandsStatus = action.meta.aborted ? "idle" : "failed";
        state.error = action.meta.aborted ? null : action.error.message;
      })
      .addCase(fetchOffers.pending, (state, action) => {
        state.offersStatus = "loading";
        state.offersRequestId = action.meta.requestId;
        state.error = null;
      })
      .addCase(fetchOffers.fulfilled, (state, action) => {
        if (state.offersRequestId !== action.meta.requestId) return;
        state.offers = action.payload;
        state.offersStatus = "succeeded";
      })
      .addCase(fetchOffers.rejected, (state, action) => {
        if (state.offersRequestId !== action.meta.requestId) return;
        state.offersStatus = action.meta.aborted ? "idle" : "failed";
        state.error = action.meta.aborted ? null : action.error.message;
      });
  },
});
export const { setSearchNumber, selectBrand } = partsSlice.actions;
export default partsSlice.reducer;
