import { createStore, applyMiddleware } from "redux";
import { persistStore, persistReducer } from "redux-persist";
import { thunk } from "redux-thunk"; // Đảm bảo redux-thunk được cài và import đúng
import rootReducer from "./store/reducers/rootReducer"; // Đảm bảo đường dẫn đúng

import storage from "redux-persist/lib/storage"; // Redux-persist storage (localStorage hoặc sessionStorage)

const persistConfig = {
  key: "root",
  storage,
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

const store = createStore(persistedReducer, applyMiddleware(thunk)); // Dùng persistedReducer thay cho rootReducer trực tiếp
const persistor = persistStore(store);

export { store, persistor };
