import { useEffect, useRef } from 'react';
import { usePage } from '@inertiajs/react';
import Swal from 'sweetalert2';

export default function GlobalAlert() {
  const { status, errors } = usePage().props;
  const shown = useRef({ status: '', error: '' });

  useEffect(() => {
    if (status && shown.current.status !== status) {
      Swal.fire({
        icon: 'success',
        title: status,
        showConfirmButton: false,
        timer: 1800,
      });
      shown.current.status = status;
    }
  }, [status]);

  useEffect(() => {
    const errorMsg = errors && typeof errors === 'object' && Object.values(errors).length > 0
      ? Object.values(errors).join(', ')
      : '';
    if (errorMsg && shown.current.error !== errorMsg) {
      Swal.fire({
        icon: 'error',
        title: 'Terjadi kesalahan',
        text: errorMsg,
      });
      shown.current.error = errorMsg;
    }
  }, [errors]);

  return null;
} 