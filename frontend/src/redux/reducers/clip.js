
export const initialState = {
  data: undefined,
  topClipClicks: {}
};

export default function clipReducer(state = initialState, action) {
  switch (action.type) {
    case "SET_CLIP":
      return {
        ...state,
        data: action.clip
      };

    case "SET_TOP_CLIP_CLICKS":
      return {
        ...state,
        topClipClicks: action.topClipClicks
      };

    default:
      return state;
  }
}