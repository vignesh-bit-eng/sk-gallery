import { useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

export default function UpiPayment({ amount, purpose, artworkId, onSuccess, onCancel }) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [transactionId, setTransactionId] = useState('');
  const [showQr, setShowQr] = useState(false);

  // UPI configuration
  const upiId = '6380528920@ybl'; // Usually a UPI handle, adjust if needed
  const name = 'SK Art Gallery';
  const upiUrl = `upi://pay?pa=${upiId}&pn=${encodeURIComponent(name)}&am=${amount}&cu=INR`;

  const handleSubmitTx = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.post('https://sk-gallery-1.onrender.com/api/transactions/submit', {
        transactionId,
        type: purpose,
        amount,
        artworkId
      }, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      alert('Payment submitted! Awaiting owner verification.');
      onSuccess();
    } catch (error) {
      alert('Failed to submit transaction ID');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl relative overflow-hidden">
        <h2 className="text-2xl font-bold mb-1 text-gray-900">Complete Payment</h2>
        <p className="text-gray-500 mb-6">Amount: <span className="font-semibold text-gray-900">₹{amount}</span></p>

        <div className="space-y-4">
          <a 
            href={upiUrl}
            className="w-full flex items-center justify-center gap-2 bg-green-600 text-white py-3 rounded-xl font-medium hover:bg-green-700 transition-colors shadow-sm"
          >
            Pay with UPI App
          </a>

          <div className="text-center">
            <button 
              onClick={() => setShowQr(!showQr)}
              className="text-sm text-red-600 font-medium hover:underline"
            >
              {showQr ? 'Hide QR Code Details' : 'Or pay manually using QR / UPI ID'}
            </button>
          </div>

          {showQr && (
            <div className="bg-gray-50 p-4 rounded-xl text-center border border-gray-200">
              <p className="text-sm text-gray-600 mb-2">Send ₹{amount} to:</p>
              <p className="font-mono text-lg font-bold text-gray-900 mb-4">{upiId}</p>
              <img 
                src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(upiUrl)}`} 
                alt="UPI QR Code"
                className="mx-auto rounded-lg shadow-sm border border-gray-100"
              />
            </div>
          )}

          <div className="border-t border-gray-100 pt-4 mt-4">
            <h3 className="font-medium text-gray-900 mb-3">After payment, verify here:</h3>
            <form onSubmit={handleSubmitTx} className="space-y-3">
              <input 
                type="text" 
                required 
                placeholder="Enter 12-digit UPI Transaction ID"
                value={transactionId}
                onChange={e => setTransactionId(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 font-mono"
              />
              <div className="flex gap-2">
                <button 
                  type="button"
                  onClick={onCancel}
                  className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={loading || !transactionId}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors disabled:opacity-50"
                >
                  {loading ? 'Submitting...' : 'Verify'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}


