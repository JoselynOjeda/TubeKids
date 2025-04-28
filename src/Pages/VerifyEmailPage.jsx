import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';

const VerifyEmailPage = () => {
  const { token } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    const verifyEmail = async () => {
      try {
        const response = await fetch(`http://localhost:5000/api/users/verify/${token}`);
        const data = await response.json();

        if (response.ok) {
          if (data.alreadyVerified) {
            await Swal.fire({
              icon: 'info',
              title: 'Email already verified!',
              text: 'You can now log in.',
              confirmButtonColor: '#ff4b2b'
            });
          } else {
            await Swal.fire({
              icon: 'success',
              title: 'Email verified!',
              text: 'Your account is now verified!',
              confirmButtonColor: '#ff4b2b'
            });
          }
          navigate('/');
        } else {
          throw new Error(data.message || 'Invalid or expired token.');
        }
      } catch (error) {
        console.error("❌ Error en verificación:", error.message);
        await Swal.fire({
          icon: 'error',
          title: 'Error',
          text: error.message,
          confirmButtonColor: '#ff4b2b'
        });
        navigate('/');
      }
    };

    verifyEmail();
  }, [token, navigate]);

  return (
    <div style={{ textAlign: 'center', marginTop: '100px' }}>
      <h2>Verifying your email...</h2>
    </div>
  );
};

export default VerifyEmailPage;
