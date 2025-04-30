import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { fetchAllFeesPool } from "./../../api/fees";
import { StateInterface } from "./types";

const initialState: StateInterface = {
	poolFees: [],
	isLoadingPoolFees: false,
	error: null,
};

export const fetchAllPoolFeesThunk = createAsyncThunk("fees/fetchPoolFees", async (_, thunkApi) => {
	try {
		const data = await fetchAllFeesPool();
		return data;
	} catch (error) {
		console.error(error);
		return thunkApi.rejectWithValue(error instanceof Error ? error.message : "Failed to fetch pool fees");
	}
});

const feesSlice = createSlice({
	name: "fees",
	initialState: initialState,
	reducers: {},
	extraReducers(builder) {
		builder.addCase(fetchAllPoolFeesThunk.fulfilled, (state, action) => {
			if (!action.payload) return;
			state.poolFees = action.payload;
			state.isLoadingPoolFees = false;
		});
		builder.addCase(fetchAllPoolFeesThunk.pending, (state, action) => {
			state.isLoadingPoolFees = true;
		});
		builder.addCase(fetchAllPoolFeesThunk.rejected, (state, action) => {
			state.isLoadingPoolFees = false;
			state.error = action.payload as string;
		});
	},
});

export default feesSlice.reducer;
