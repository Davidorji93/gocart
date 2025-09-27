import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";

// Async thunk
export const fetchProducts = createAsyncThunk(
  "product/fetchProduct",
  async ({ storedId } = {}, thunkAPI) => {
    try {
      const { data } = await axios.get(
        "/api/products" + (storedId ? `?storeId=${storedId}` : "")
      );
      return data.products;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data || error.message);
    }
  }
);

const productSlice = createSlice({
  name: "product",
  initialState: {
    list: [],
  },
  reducers: {
    setProduct: (state, action) => {
      state.list = action.payload;
    },
    clearProduct: (state) => {
      state.list = [];
    },
  },
  extraReducers: (builder) => {
    builder.addCase(fetchProducts.fulfilled, (state, action) => {
      state.list = action.payload;
    })
  }

});

export const { setProduct, clearProduct } = productSlice.actions;

export default productSlice.reducer;
