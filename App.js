import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";

const api = axios.create({ baseURL: "http://localhost:8080" });

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [searchId, setSearchId] = useState("");
  const [searchedOrder, setSearchedOrder] = useState(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [pageNo, setPageNo] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  const fetchOrders = async (page = 0) => {
    try {
      const res = await api.get(`/admin/orders?pageNo=${page}`);
      setOrders(res.data.content);
      setPageNo(res.data.number);
      setTotalPages(res.data.totalPages);
      setTotalElements(res.data.totalElements);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const searchOrder = async (e) => {
    e.preventDefault();
    try {
      const res = await api.get(`/admin/search-order`, { params: { orderId: searchId } });
      setSearchedOrder(res.data);
      setErrorMsg("");
    } catch (e) {
      setSearchedOrder(null);
      setErrorMsg(e.response?.data || "Order not found");
    }
  };

  const updateStatus = async (id, status) => {
    try {
      await api.post(`/admin/update-order-status`, { id, st: status });
      if (searchedOrder) {
        setSearchedOrder({ ...searchedOrder, status });
      } else {
        setOrders(orders.map(o => o.id === id ? { ...o, status } : o));
      }
    } catch (e) {
      console.error(e);
    }
  };

  const OrderRow = ({ o }) => (
    <tr>
      <td>{o.orderId}</td>
      <td>
        Name : {o.orderAddress.firstName} {o.orderAddress.lastName}<br />
        Email : {o.orderAddress.email}<br />
        Mobno: {o.orderAddress.mobileNo}<br />
        Address : {o.orderAddress.address}<br />
        City : {o.orderAddress.city}<br />
        State : {o.orderAddress.state}, {o.orderAddress.pincode}
      </td>
      <td>{o.orderDate}</td>
      <td>{o.product.title}</td>
      <td>
        Quantity : {o.quantity}<br />
        Price : {o.price}<br />
        Total Price : {o.quantity * o.price}
      </td>
      <td>{o.status}</td>
      <td>
        <select className="form-control mb-1" onChange={(e) => updateStatus(o.id, e.target.value)} disabled={o.status === 'Cancelled' || o.status === 'Delivered'}>
          <option>--select--</option>
          <option value="In Progress">In Progress</option>
          <option value="Order Received">Order Received</option>
          <option value="Product Packed">Product Packed</option>
          <option value="Out for Delivery">Out for Delivery</option>
          <option value="Delivered">Delivered</option>
          <option value="Cancelled">Cancelled</option>
        </select>
      </td>
    </tr>
  );

  return (
    <div className="container-fluid mt-5 p-1">
      <div className="row">
        <p className="text-center fs-3 mt-2">All Orders</p>
        <hr />
        <Link to="/admin/" className="text-decoration-none">
          <i className="fa-solid fa-arrow-left"></i> Back
        </Link>
        <div className="col-md-4 p-4">
          <form onSubmit={searchOrder}>
            <div className="row">
              <div className="col">
                <input type="text" className="form-control" name="orderId" placeholder="Enter order id" value={searchId} onChange={e => setSearchId(e.target.value)} />
              </div>
              <div className="col">
                <button className="btn btn-primary col">Search</button>
              </div>
            </div>
          </form>
        </div>
        <div className="col-md-12 ps-4 pe-4">
          <table className="table table-bordered card-sh">
            <thead className="table-light">
              <tr>
                <th>Order Id</th>
                <th>Deliver Details</th>
                <th>Date</th>
                <th>Product Details</th>
                <th>Price</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {searchedOrder ? (
                searchedOrder ? <OrderRow o={searchedOrder} /> : <p className="fs-3 text-center text-danger">{errorMsg}</p>
              ) : (
                orders.map(o => <OrderRow key={o.id} o={o} />)
              )}
            </tbody>
          </table>
          {!searchedOrder && (
            <div className="row">
              <div className="col-md-4">Total Orders : {totalElements}</div>
              <div className="col-md-6">
                <nav aria-label="Page navigation example">
                  <ul className="pagination">
                    <li className={`page-item ${pageNo === 0 ? 'disabled' : ''}`}>
                      <button className="page-link" onClick={() => fetchOrders(pageNo - 1)} aria-label="Previous">&laquo;</button>
                    </li>
                    {Array.from({ length: totalPages }, (_, i) => (
                      <li key={i} className={`page-item ${pageNo === i ? 'active' : ''}`}>
                        <button className="page-link" onClick={() => fetchOrders(i)}>{i + 1}</button>
                      </li>
                    ))}
                    <li className={`page-item ${pageNo === totalPages - 1 ? 'disabled' : ''}`}>
                      <button className="page-link" onClick={() => fetchOrders(pageNo + 1)} aria-label="Next">&raquo;</button>
                    </li>
                  </ul>
                </nav>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
