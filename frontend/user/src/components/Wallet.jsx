import React, { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import axiosInstanceuser from '../axios'
import './Wallet.css'
import{ToastContainer, toast} from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css';
import { persistor } from '../app/store';
import { useNavigate } from 'react-router';

const Wallet = () => {
  const userId = useSelector((state) => state.user.user._id)
  const [wallet, setWallet] = useState(null)
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showTransactions, setShowTransactions] = useState(false)
 const navigate=useNavigate()
  useEffect(() => {
    const fetchWallet = async () => {
      try {
        const response = await axiosInstanceuser.get(`fetchwallet/${userId}`)
        console.log("wallet", response.data.walletdoc)
        setWallet(response.data.walletdoc[0])
        setLoading(false)
      } catch (error) {
        if (error.response?.status === 403 && error.response?.data?.action === "logout") {
          toast.error("Your account is inactive. Logging out.")
          localStorage.removeItem("userId")
          await persistor.purge() // Uncomment if you have persistor configured
          navigate('/login') // Uncomment if you have navigation configured
        } else if (error.response && error.response.data.message) {
          setError(error.response.data.message)
        }
        setLoading(false)
      }
    }

    if (userId) {
      fetchWallet()
    }
  }, [userId])

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
  }

  const formatTransactionMethod = (method) => {
    return method === 'refundreturn' ? 'Refund (Return)' : 'Refund (Cancel)'
  }

  if (loading) {
    return <div className="wallet-loading">Loading wallet data...</div>
  }

  if (error) {
    return <div className="wallet-error">{error}</div>
  }

  return (
    <div className="wallet-container">
  <ToastContainer />
  <h2 className="wallet-title">Your Wallet</h2>
  {wallet && (
    <>
      <div className="wallet-balance">
        <h3>Current Balance</h3>
        <p className="balance-amount">Rs. {wallet.balance.toFixed(2)}</p>
      </div>

      <div className="wallet-transactions">
        <h3>Transaction History</h3>
        {wallet.transactions.length > 0 ? (
          <table className="transaction-table">
            <thead>
              <tr>
                <th>Transaction Date</th>
                <th>Transaction Method</th>
                <th>Amount</th>
              </tr>
            </thead>
            <tbody>
              {wallet.transactions.reverse().map((transaction) => (
                <tr key={transaction.transaction_id} className="transaction-item">
                  <td className="transaction-date">{formatDate(transaction.createdAt)}</td>
                  <td className="transaction-method">
                    {formatTransactionMethod(transaction.transactionmethod)}
                  </td>
                  <td
                    className={`transaction-amount ${
                      transaction.amount >= 0 ? 'positive' : 'negative'
                    }`}
                  >
                    {transaction.amount >= 0 ? '+' : '-'}Rs. {Math.abs(transaction.amount).toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="no-transactions">No transactions yet.</p>
        )}
      </div>
    </>
  )}
</div>

)}

export default Wallet

