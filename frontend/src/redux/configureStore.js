import * as redux from 'redux';
import createSagaMiddleware from 'redux-saga'

// import reducers & sagas
import rootReducer from './reducers';
import rootSaga from './sagas'

const sagaMiddleware = createSagaMiddleware();

export const configure = (initialState = {}) => {
  // combine all reducers into a single one
  const reducer = redux.combineReducers(rootReducer);

  // use the combined reducer to create the store
  // also apply redux-thunk middleware and devToolsExtension
  const store = redux.createStore(
    reducer,
    initialState,
    redux.compose(
      redux.applyMiddleware(sagaMiddleware),
      window.devToolsExtension ? window.devToolsExtension() : f => f
    )
  );

  sagaMiddleware.run(rootSaga)

  return store;
};