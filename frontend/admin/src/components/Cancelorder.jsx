import React ,{useState}from 'react'
import { useEffect } from 'react'
import axiosInstanceadmin from '../axios'
import Swal from 'sweetalert2';

const Retrun = () => {
    const[cancelorders,setcancelorders]=useState([])
    const[success,setsuccess]=useState(false)
   
     const [error, seterror] = useState('');
    useEffect(()=>{
            const fetchcancelorders=async()=>{
                try {
                    console.log("ewfhhwgfuhgu")
                    const response=await axiosInstanceadmin.get('/getcancelitem')
                    console.log("feteched cancel orders",response.data)
                    setcancelorders(response.data.reverse())
                    
                } catch (error) {
                    console.log("Error in fetching cancel orders", error);
                }
            }
            fetchcancelorders()
           
    },[])


    const handleFunction=async(id,actiontype)=>{
        console.log("handleFunction Id", id)
        console.log("handle Action type",actiontype)
            try {
                const response=await axiosInstanceadmin.patch(`/updatecancelordersrefundstatus/${id}`,{actiontype})
                console.log(response.data)


                // setcancelorders((prevorder) =>
                //     prevorder.map((order) =>
                //       order._id === id
                //         ? { ...order,returnstatus: actiontype }
                //         : order
                //     )
                //   );
                setcancelorders((prevOrders) => prevOrders.filter((order) => order._id !== id));
                setsuccess(true); // Mark the success state to show the result
                  
                  
            } catch (error) {
                
            }
    }

    const confirmRefund = (id) => {
      Swal.fire({
        title: 'Are you sure?',
        text: 'You are about to process a refund. This action cannot be undone.',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes, refund it!',
        cancelButtonText: 'Cancel'
        
      }).then((result) => {
        if (result.isConfirmed) {
          handleFunction(id, "Refund");
          Swal.fire(
            'Refunded!',
            'The refund has been processed successfully.',
            'success'
          );
        }
      });
    };
  return (
    <div>
      <h2>Cancel Orders</h2>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px' }}>
        {cancelorders.map((order, index) => (
          <div
            key={index}
            style={{
              border: '1px solid #ccc',
              borderRadius: '8px',
              padding: '16px',
              maxWidth: '300px',
              boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
            }}
          >
            <h3 style={{ marginBottom: '10px' }}>{order._id || 'Product Name'}</h3>
            
            <p>
              <strong>User ID:</strong> {order.userId._id}
            </p>
            <p>
              <strong>User Name:</strong> {order.userId.username}
            </p>
            <p>
              <strong>User Email:</strong> {order.userId.email}
            </p>
           
            <p>
              <strong>Total prive:</strong> {order.totalprice}
            </p>
            
            <button onClick={() => confirmRefund(order._id)}>Refund</button>
          </div>
        ))}
      </div>
    </div>
  )
}

export default Retrun
