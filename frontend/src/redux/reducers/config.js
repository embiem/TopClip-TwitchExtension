
export const initialState = {
  data: {}
};

export default function configReducer(state = initialState, action) {
  switch (action.type) {
    case "SET_CONFIG":
      return {
        ...state,
        data: action.config
      };

    default:
      return state;
  }
}