import React, { createContext, useState, useEffect, useReducer } from 'react';
import api from '../lib/api';
import { jwtDecode } from 'jwt-decode';
import FullPageLoader from '../components/common/FullPageLoader.jsx'; // <-- 1. استيراد اللودر

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
  const [loading, setLoading] = useState(true); // <-- هذا هو المتحكم باللودر

  useEffect(() => {
    const token = localStorage.getItem('spot_token');
    if (token) {
      try {
        const decodedToken = jwtDecode(token);
        if (decodedToken.exp * 1000 < Date.now()) {
          localStorage.removeItem('spot_token');
          dispatch({ type: 'LOGOUT' });
          setLoading(false); // <-- إيقاف اللودر
        } else {
          api.get('/auth/me')
            .then(res => {
              dispatch({ type: 'LOGIN', payload: res.data });
            })
            .catch(() => {
              localStorage.removeItem('spot_token');
              dispatch({ type: 'LOGOUT' });
            })
            .finally(() => {
              setLoading(false); // <-- إيقاف اللودر
            });
        }
      } catch (error) {
        localStorage.removeItem('spot_token');
        dispatch({ type: 'LOGOUT' });
        setLoading(false); // <-- إيقاف اللودر
      }
    } else {
      setLoading(false); // <-- إيقاف اللودر (إذا لم يكن هناك توكن)
    }
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
      {/* 2. عرض اللودر إذا كان 'loading' صحيحاً، وإلا اعرض التطبيق */}
      {loading ? <FullPageLoader /> : children}
    </AuthContext.Provider>
  );
};

export default AuthContext;