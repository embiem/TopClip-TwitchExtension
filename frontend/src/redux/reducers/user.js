export const initialState = {
  clientId: "",
  token: "",
  userId: ""
};

export default function userReducer(state = initialState, action) {
  switch (action.type) {
    case "SET_USER_INFO":
      return {
        ...state,
        clientId: action.clientId,
        token: action.token,
        userId: action.userId
      };

    default:
      return state;
  }
}
