import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuthStore } from '../store/auth.store';
import toast from 'react-hot-toast';

export const GoogleCallback = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const setTokens = useAuthStore((state) => state.setTokens);

  useEffect(() => {
    const hashParams = new URLSearchParams(window.location.hash.slice(1));
    const accessToken =
      hashParams.get('accessToken') || searchParams.get('accessToken');
    const refreshToken =
      hashParams.get('refreshToken') || searchParams.get('refreshToken');
    const error = hashParams.get('error') || searchParams.get('error');
    const returnedState = hashParams.get('state') || searchParams.get('state');
    const expectedState = sessionStorage.getItem('google-oauth-state');
    sessionStorage.removeItem('google-oauth-state');

    if (error) {
      toast.error('Đăng nhập Google thất bại. Vui lòng thử lại.');
      navigate('/login');
      return;
    }

    if (!expectedState || returnedState !== expectedState) {
      toast.error('Phiên đăng nhập Google không hợp lệ. Vui lòng thử lại.');
      navigate('/login');
      return;
    }

    if (accessToken && refreshToken) {
      window.history.replaceState(
        null,
        document.title,
        window.location.pathname,
      );
      setTokens(accessToken, refreshToken);
      toast.success('Đăng nhập Google thành công!');
      navigate('/education');
    } else {
      toast.error('Không nhận được token từ Google. Vui lòng thử lại.');
      navigate('/login');
    }
  }, [searchParams, setTokens, navigate]);

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #0f172a 100%)',
      }}
    >
      <div style={{ textAlign: 'center', color: 'white' }}>
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '48px',
            height: '48px',
            borderRadius: '50%',
            border: '3px solid rgba(59, 130, 246, 0.3)',
            borderTopColor: '#3b82f6',
            marginBottom: '16px',
            animation: 'spin 1s linear infinite',
          }}
        />
        <p style={{ fontSize: '16px', margin: 0 }}>Đang xử lý đăng nhập...</p>
      </div>
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};
