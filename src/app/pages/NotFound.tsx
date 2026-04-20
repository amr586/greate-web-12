import { useNavigate } from 'react-router';

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 px-4">
      <div className="text-center max-w-md">
        <div className="mb-8">
          <h1 className="text-9xl font-bold text-gray-300 drop-shadow-lg">404</h1>
          <div className="w-24 h-1 bg-gradient-to-r from-blue-500 to-purple-500 mx-auto rounded-full"></div>
        </div>
        
        <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">الصفحة غير موجودة</h2>
        <p className="text-gray-600 text-lg mb-8">
          عذراً، الصفحة التي تبحث عنها غير موجودة أو تم نقلها.
        </p>
        
        <div className="flex gap-4 justify-center">
          <button
            onClick={() => navigate('/')}
            className="px-8 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg font-semibold hover:shadow-lg transition-all duration-300 hover:scale-105"
          >
            العودة للرئيسية
          </button>
          <button
            onClick={() => navigate('/properties')}
            className="px-8 py-3 bg-gray-800 text-white rounded-lg font-semibold hover:bg-gray-900 hover:shadow-lg transition-all duration-300"
          >
            العقارات
          </button>
        </div>

        <p className="text-gray-500 text-sm mt-12">
          إذا استمرت المشكلة، يرجى التواصل معنا عبر الواتساب أو البريد الإلكتروني.
        </p>
      </div>
    </div>
  );
}
