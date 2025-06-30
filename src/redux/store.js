import { configureStore } from "@reduxjs/toolkit";
import counterReducer from "./counterSlice "; // Import reducer

export const store = configureStore({
  reducer: {
    counter: counterReducer, // ✅ Thêm reducer vào đây
  },
});

export default store;
