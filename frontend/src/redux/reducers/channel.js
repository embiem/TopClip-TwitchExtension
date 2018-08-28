
export const initialState = {
  id: ""
};

export default function clipReducer(state = initialState, action) {
  switch (action.type) {
    case "SET_CHANNEL":
      return {
        ...state,
        id: action.id
      };

    default:
      return state;
  }
}