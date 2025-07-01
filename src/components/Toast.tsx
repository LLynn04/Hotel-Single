// import React, { useEffect } from 'react';

// type ToastProps = {
//   message: string;
//   type: 'success' | 'error';
//   onClose: () => void;
// };

// const Toast: React.FC<ToastProps> = ({ message, type, onClose }) => {
//   useEffect(() => {
//     const timer = setTimeout(() => onClose(), 4000); // auto close after 4 sec
//     return () => clearTimeout(timer);
//   }, [onClose]);

//   return (
//     <div
//       className={`fixed top-5 right-5 z-50 px-6 py-3 rounded shadow-lg text-white font-semibold
//         ${type === 'success' ? 'bg-green-500' : 'bg-red-600'}`}
//       role="alert"
//     >
//       {message}
//     </div>
//   );
// };

// export default Toast;
