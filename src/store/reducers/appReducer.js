const initialState = {
  loading: false,
  error: null,
};

const appReducer = (state = initialState, action) => {
  switch (action.type) {
    case "SET_LOADING":
      return { ...state, loading: action.payload };
    case "SET_ERROR":
      return { ...state, error: action.payload };
    default:
      return state;
  }
};

export default appReducer;
