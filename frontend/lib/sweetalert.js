import Swal from 'sweetalert2';

export const Toast = Swal.mixin({
  toast: true,
  position: 'top-end',
  showConfirmButton: false,
  timer: 3000,
  timerProgressBar: true,
});

export const Alert = Swal.mixin({
  confirmButtonColor: '#0D9488',
  cancelButtonColor: '#94A3B8',
  borderRadius: '12px',
});
