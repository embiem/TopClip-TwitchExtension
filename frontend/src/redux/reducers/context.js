
export const initialState = {
  theme: "light"
};

export default function contextReducer(state = initialState, action) {
  switch (action.type) {
    case "SET_CONTEXT":
      return {
        ...state,
        ...action.context
      };

    default:
      return state;
  }
}