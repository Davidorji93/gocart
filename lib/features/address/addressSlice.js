import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'

export const fetchAddress = createAsyncThunk(
  "address/fetchAddress",
  async ({ getToken }, thunkAPI) => {
    try {
      const token = await getToken();
      const { data } = await axios.get("/api/address", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      // Adjust this line depending on API response
      return Array.isArray(data) ? data : data.addresses || [];
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data || error.message);
    }
  }
);


const addressSlice = createSlice({
    name: 'address',
    initialState: {
        list: [],
    },
    reducers: {
        addAddress: (state, action) => {
            state.list.push(action.payload)
        },
    },
    extraReducers: (builder) => {
        builder.addCase(fetchAddress.fulfilled, (state, action) => {
            state.list = action.payload;
        })
    }
})

export const { addAddress } = addressSlice.actions

export default addressSlice.reducer