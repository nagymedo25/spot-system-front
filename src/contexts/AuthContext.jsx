import React, { createContext, useState, useEffect, useReducer } from 'react';
import api from '../lib/api';
import { jwtDecode } from 'jwt-decode';

const AuthContext = createContext();

const authReducer = (state, action) => {
  switch (action.type) {
    case 'LOGIN':
      return { user: action.payload };
    case 'LOGOUT':
      return { user: null };
    default:
      return state;
  }
};

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, {
    user: null,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('spot_token');
    if (token) {
      try {
        const decodedToken = jwtDecode(token);
        if (decodedToken.exp * 1000 < Date.now()) {
          localStorage.removeItem('spot_token');
          dispatch({ type: 'LOGOUT' });
        } else {
          api.get('/auth/me')
            .then(res => {
              dispatch({ type: 'LOGIN', payload: res.data });
            })
            .catch(() => {
              localStorage.removeItem('spot_token');
              dispatch({ type: 'LOGOUT' });
            });
        }
      } catch (error) {
        localStorage.removeItem('spot_token');
        dispatch({ type: 'LOGOUT' });
      }
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    const response = await api.post('/auth/login', { email, password });
    const { token, ...user } = response.data;
    localStorage.setItem('spot_token', token);
    dispatch({ type: 'LOGIN', payload: user });
    return user;
  };

  const logout = () => {
    localStorage.removeItem('spot_token');
    dispatch({ type: 'LOGOUT' });
  };

  return (
    <AuthContext.Provider value={{ ...state, dispatch, login, logout, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export default AuthContext;