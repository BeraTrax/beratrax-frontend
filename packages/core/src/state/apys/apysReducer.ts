import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { fetchApysApi } from "./../../api/apy";
import pools_json from "./../../config/constants/pools_json";
import { AddApyAction, AddApysAction, Apys, StateInterface } from "./types";

const apyObj: { [farmId: number]: Apys } = {};
pools_json.forEach((pool) => {
	apyObj[pool.id] = {
		apy: 0,
		compounding: 0,
		feeApr: 0,
		rewardsApr: 0,
	};
});

const initialState: StateInterface = { apys: apyObj, isLoading: false, isFetched: false, error: null };

export const fetchApys = createAsyncThunk("apys/fetchApys", async (_, thunkApi) => {
	try {
		const data = await fetchApysApi();
		const obj: { [farmId: number]: Apys } = {};
		data.forEach((vault: any) => {
			obj[vault.farmId] = vault.apys;
		});
		return obj;
	} catch (error) {
		console.error("Error in fetchApys", error);
		return thunkApi.rejectWithValue(error instanceof Error ? error.message : "Failed to fetch apys");
	}
});

const apysSlice = createSlice({
	name: "apys",
	initialState: initialState,
	reducers: {
		addApy: (state, action: PayloadAction<AddApyAction>) => {
			state.apys[action.payload.farmId] = action.payload.data;
		},
		addApys: (state, action: PayloadAction<AddApysAction>) => {
			state.apys = action.payload;
		},
	},
	extraReducers(builder) {
		builder.addCase(fetchApys.pending, (state) => {
			state.isLoading = true;
		});
		builder.addCase(fetchApys.fulfilled, (state, action) => {
			state.isLoading = false;
			state.isFetched = true;
			state.apys = { ...action.payload };
		});
		builder.addCase(fetchApys.rejected, (state, action) => {
			state.isLoading = false;
			state.isFetched = false;
			state.apys = apyObj;
			state.error = action.payload as string;
		});
	},
});

export const { addApy, addApys } = apysSlice.actions;

export default apysSlice.reducer;
