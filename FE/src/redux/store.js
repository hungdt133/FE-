import { createStore, applyMiddleware } from "redux";
import thunk from "redux-thunk";
import logger from "redux-logger";

const initialState = {
  user: {
    isLoggedIn: false,
    userId: null,
    firstName: "",
    loginName: "",
    token: null
  },
};

const reducer = (state = initialState, action) => {
  switch (action.type) {
    case "LOGIN":
      return {
        ...state,
        user: {
          isLoggedIn: true,
          userId: action.payload.user._id,
          firstName: action.payload.user.first_name,
          loginName: action.payload.user.login_name,
          token: action.payload.token
        },
      };
    case "LOGOUT":
      // Clear token from localStorage on logout
      localStorage.removeItem('token');
      return {
        ...state,
        user: {
          isLoggedIn: false,
          userId: null,
          firstName: "",
          loginName: "",
          token: null
        },
      };
    default:
      return state;
  }
};

// Check for existing token on app load
const token = localStorage.getItem('token');
if (token) {
  initialState.user.token = token;
  initialState.user.isLoggedIn = true;
}

const store = createStore(reducer, applyMiddleware(thunk, logger));

export default store;
