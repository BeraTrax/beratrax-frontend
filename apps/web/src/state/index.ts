import { combineReducers, configureStore } from "@reduxjs/toolkit";
import { TypedUseSelectorHook, useDispatch, useSelector } from "react-redux";
import { persistStore, persistReducer, FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER } from "redux-persist";
import storage from "redux-persist/lib/storage";
import apysReducer from "./apys/apysReducer";
import settingsReducer from "./settings/settingsReducer";
import farmsReducer from "./farms/farmsReducer";
import errorReducer from "./error/errorReducer";
import internetReducer from "./internet/internetReducer";
import rampReducer from "./ramp/rampReducer";
import accountReducer from "./account/accountReducer";
import feesReducer from "./fees/feesReducer";
import { getPersistConfig } from "redux-deep-persist";
import transactionsReducer from "./transactions/transactionsReducer";
import notificationReducer from "./notification/notifiactionReducer";
import tokensReducer from "./tokens/tokensReducer";

const rootReducer = combineReducers({
    account: accountReducer,
    settings: settingsReducer,
    internet: internetReducer,
    error: errorReducer,
    apys: apysReducer,
    farms: farmsReducer,
    ramp: rampReducer,
    fees: feesReducer,
    transactions: transactionsReducer,
    notification: notificationReducer,
    tokens: tokensReducer,
});

const persistConfig = getPersistConfig({
    key: "root",
    storage,
    version: 6,
    whitelist: [
        "settings.theme",
        "settings.showTokenDetailedBalances",
        "settings.supportChat",
        "account.earnTraxTermsAgreed",
        "account.referrerCode",
        "ramp.bridgeStates.USDC_POLYGON_TO_ARBITRUM_USDC.socketSourceTxHash",
        "ramp.bridgeStates.ETH_POLYGON_TO_ARBITRUM_ETH.socketSourceTxHash",
        "farms.farmDetailInputOptions.showInUsd",
        "tokens.decimals",
        "tokens.prices",
    ],
    rootReducer, // your root reducer must be also passed here
});

export const persistedReducer = persistReducer(persistConfig, rootReducer);

const store = configureStore({
    // devTools: process.env.NODE_ENV !== "production",
    devTools: true,
    reducer: persistedReducer,
    middleware(getDefaultMiddleware) {
        return getDefaultMiddleware({
            serializableCheck: {
                ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
            },
        });
    },
});

export default store;

export type RootState = ReturnType<typeof store.getState>;

export const persistor = persistStore(store);
export type AppDispatch = typeof store.dispatch;
export const useAppDispatch = () => useDispatch<AppDispatch>(); // Export a hook that can be reused to resolve types
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
