import React, { useState, useEffect } from "react";
import {
  getProducts,
  getCoupons,
  getCustomers
} from "../api/posApi";
import {
  Button,
  Modal,
  Form,
  Row,
  Col,
  Table,
  Card,
  Spinner,
  Image
} from "react-bootstrap";
import { showSuccessToast, showErrorToast } from "../ultis/toastUtils";

function POSPage() {
  const URL_WEB = process.env.REACT_APP_WEB_URL;
  const URL_API = process.env.REACT_APP_API_URL;

  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [cart, setCart] = useState([]);

  const [coupons, setCoupons] = useState([]);
  const [selectedCoupon, setSelectedCoupon] = useState(null);

  const [showModal, setShowModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedSize, setSelectedSize] = useState("");
  const [selectedColor, setSelectedColor] = useState("");
  const [quantity, setQuantity] = useState(1);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [couponWarning, setCouponWarning] = useState("");

  const [customers, setCustomers] = useState([]);
  const [customerInfo, setCustomerInfo] = useState(null);
  const [selectedCustomerId, setSelectedCustomerId] = useState("");
  const [guestInfo, setGuestInfo] = useState({ full_name: "", phone: "" });
  const [note, setNote] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("COD");
  const [customerPay, setCustomerPay] = useState(0);

  const totalAmount = cart.reduce((s, i) => s + i.total, 0);

  // ==== Effects ====
  // Tìm kiếm sản phẩm
  useEffect(() => {
    if (!search.trim()) return setProducts([]);
    setLoading(true);
    const timer = setTimeout(() => {
      getProducts(search)
        .then(setProducts)
        .finally(() => setLoading(false));
    }, 500);
    return () => clearTimeout(timer);
  }, [search]);

  // Lấy coupon
  useEffect(() => {
    async function fetchCoupons() {
      try {
        const res = await getCoupons();
        setCoupons(Array.isArray(res?.coupons) ? res.coupons : []);
      } catch {
        setCoupons([]);
      }
    }
    fetchCoupons();
  }, []);

  // Lấy danh sách khách
  useEffect(() => {
    async function fetchCustomers() {
      try {
        const res = await getCustomers();
        setCustomers(Array.isArray(res?.customers) ? res.customers : []);
      } catch {
        setCustomers([]);
      }
    }
    fetchCustomers();
  }, []);

  // Cập nhật info khách khi chọn
  useEffect(() => {
    if (!selectedCustomerId) return setCustomerInfo(null);
    const found = customers.find(c => c.id === parseInt(selectedCustomerId));
    setCustomerInfo(found || null);
    setEmail(found?.email || "");
    setAddress(found?.address || "");
    setNote(found?.note || "");
  }, [selectedCustomerId, customers]);

  // Coupon warning
  useEffect(() => {
    if (!selectedCoupon) return setCouponWarning("");
    const total = cart.reduce((s, i) => s + i.total, 0);
    const minTotal = parseFloat(selectedCoupon.min_order_total);
    if (total < minTotal) {
      setCouponWarning(`⚠️ Mã "${selectedCoupon.code}" yêu cầu đơn hàng tối thiểu ${minTotal.toLocaleString()}đ.`);
    } else {
      setCouponWarning("");
    }
  }, [cart, selectedCoupon]);

  // ==== Handlers ====
  const handleAddClick = (product) => {
    setSelectedProduct(product);
    setSelectedSize("");
    setSelectedColor("");
    setQuantity(1);
    setShowModal(true);
  };

  const handleConfirmAddToCart = () => {
    if (!selectedSize) return showErrorToast("Sản phẩm","Vui lòng chọn size!");
    if (!selectedColor) return showErrorToast("Sản phẩm","Vui lòng chọn màu!");
    if (quantity > selectedProduct.stock) return showErrorToast("Sản phẩm",`Số lượng không đủ! Chỉ còn ${selectedProduct.stock}`);

    const item = {
      ...selectedProduct,
      size: selectedSize,
      color: selectedColor,
      quantity,
      total: selectedProduct.price * quantity
    };
    setCart([...cart, item]);
    setShowModal(false);
  };

  const removeItem = (idx) => {
    const newCart = [...cart];
    newCart.splice(idx, 1);
    setCart(newCart);
  };

  const handleCheckout = async () => {
    setIsSubmitting(true);
    let discount = 0;
    const total = cart.reduce((s, i) => s + i.total, 0);

    // Coupon tính toán
    if (selectedCoupon) {
      const minTotal = parseFloat(selectedCoupon.min_order_total || 0);
      if (total >= minTotal) {
        discount = selectedCoupon.discount_type === "percent"
          ? Math.floor((selectedCoupon.discount_value / 100) * total)
          : selectedCoupon.discount_value;
      } else {
        showErrorToast("Mã giảm giá", `❗ Mã "${selectedCoupon.code}" yêu cầu đơn hàng tối thiểu ${minTotal.toLocaleString()}đ.`);
        setIsSubmitting(false);
        return;
      }
    }

    if (!selectedCustomerId && (!guestInfo.full_name || !guestInfo.phone || !email || !address)) {
      showErrorToast("Khách hàng","Vui lòng nhập đầy đủ thông tin khách hàng.");
      setIsSubmitting(false);
      return;
    }

    const orderData = {
      items: cart.map(i => ({
        product_id: i.id,
        quantity: i.quantity,
        price: Number(i.price),
        name: i.name,
        size: i.size,
        color: i.color
      })),
      total,
      discount,
      shipping: 0,
      final_total: total - discount,
      coupon_id: selectedCoupon?.id || null,
      payment_method: paymentMethod,
      status: paymentMethod === "COD" ? "Chờ xử lý" : "Đang chờ thanh toán",
      note,
      address,
      customer_email: email,
      customer_name: selectedCustomerId ? customerInfo?.full_name : guestInfo.full_name,
      customer_phone: selectedCustomerId ? customerInfo?.phone : guestInfo.phone,
      customer_id: selectedCustomerId || null
    };

    try {
      const url = paymentMethod === "COD" ? `${URL_API}/orders/add` : `${URL_API}/orders/create-vnpay`;
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(orderData)
      });
      const data = await res.json();
      if (res.ok) {
        if (selectedCoupon && paymentMethod === "COD") {
          await fetch(`${URL_API}/coupons/use/${selectedCoupon.id}`, { method: "PATCH" });
        }
        setCart([]);
        setSelectedCoupon(null);
        setGuestInfo({ full_name: "", phone: "" });
        setSelectedCustomerId("");
        setEmail("");
        setAddress("");
        setNote("");
        setCustomerPay(0);
        if (paymentMethod === "VNPAY" && data.paymentUrl) window.location.href = data.paymentUrl;
        else showSuccessToast("Đặt hàng","Đơn hàng đã được tạo!");
      } else {
        showErrorToast("Lỗi", data.message || "Không rõ nguyên nhân.");
      }
    } catch {
      showErrorToast("Lỗi","Không thể gửi đơn hàng.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const finalAmount = totalAmount - (selectedCoupon?.discount_type === "percent"
    ? Math.round((totalAmount * selectedCoupon.discount_value)/100)
    : selectedCoupon?.discount_value || 0);
  const refund = customerPay - finalAmount;

  // ==== Render ====
  return (
    <Row className="p-4" style={{height:'100vh'}}>
      {/* Danh sách sản phẩm */}
      <Col md={7} style={{overflowY:'auto', height:'100%'}}>
        <Card className="mb-3 shadow-sm">
          <Card.Body>
            <h5>🔍 Tìm kiếm sản phẩm</h5>
            <Form.Control
              type="text"
              placeholder="Nhập tên sản phẩm..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </Card.Body>
        </Card>

        {loading && <div className="text-center py-4"><Spinner animation="border" /></div>}

        <Row xs={2} md={3} className="g-3">
          {products.map((product) => (
            <Col key={product.id}>
              <Card className="h-100 shadow-sm" onClick={() => handleAddClick(product)}>
                <Card.Img
                  src={`${URL_WEB}/uploads/${product.image}`}
                  style={{height:140, objectFit:"cover"}}
                />
                <Card.Body>
                  <Card.Title>{product.name}</Card.Title>
                  <Card.Text className="text-success fw-bold">
                    {Number(product.price).toLocaleString()}đ
                  </Card.Text>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      </Col>

      {/* Giỏ hàng & khách hàng */}
      <Col md={5} style={{overflowY:'auto', height:'100%'}}>
        {/* Giỏ hàng */}
        <Card className="mb-3 shadow-sm">
          <Card.Body>
            <h5>🛒 Giỏ hàng</h5>
            {cart.length === 0 ? <p className="text-muted">Chưa có sản phẩm</p> : (
              <Table responsive size="sm" className="text-center align-middle">
                <thead className="table-light">
                  <tr>
                    <th>Sản phẩm</th>
                    <th>SL</th>
                    <th>Chi tiết</th>
                    <th>Tổng</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {cart.map((item, idx)=>(
                    <tr key={idx}>
                      <td>{item.name}</td>
                      <td>{item.quantity}</td>
                      <td>{item.size}/{item.color}</td>
                      <td>{item.total.toLocaleString()}đ</td>
                      <td><Button size="sm" variant="danger" onClick={()=>removeItem(idx)}>✕</Button></td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            )}
          </Card.Body>
        </Card>

        {/* Khách hàng */}
        <Card className="mb-3 shadow-sm p-3">
          <h5>👤 Thông tin khách hàng</h5>
          <Form.Select
            value={selectedCustomerId}
            onChange={(e)=>setSelectedCustomerId(e.target.value)}
          >
            <option value="">-- Khách vãng lai --</option>
            {customers.map(c=>(
              <option key={c.id} value={c.id}>{c.full_name} - {c.phone}</option>
            ))}
          </Form.Select>

          {!selectedCustomerId && (
            <>
              <Form.Control className="mb-2" placeholder="Họ tên" value={guestInfo.full_name} onChange={(e)=>setGuestInfo({...guestInfo, full_name:e.target.value})} />
              <Form.Control className="mb-2" placeholder="SĐT" value={guestInfo.phone} onChange={(e)=>setGuestInfo({...guestInfo, phone:e.target.value})} />
              <Form.Control className="mb-2" placeholder="Email" value={email} onChange={(e)=>setEmail(e.target.value)} />
              <Form.Control className="mb-2" placeholder="Địa chỉ" value={address} onChange={(e)=>setAddress(e.target.value)} />
              <Form.Control className="mb-2" as="textarea" rows={2} placeholder="Ghi chú" value={note} onChange={(e)=>setNote(e.target.value)} />
            </>
          )}
        </Card>

       {/* Thanh toán */}
        <Card className="p-3 shadow-sm mb-3">
          <h5>💵 Thanh toán</h5>

          {/* Chọn mã giảm giá */}
          <Form.Select
            className="mb-2"
            value={selectedCoupon?.id || ""}
            onChange={(e) => {
              const found = coupons.find(c => c.id === parseInt(e.target.value));
              setSelectedCoupon(found || null);
            }}
          >
            <option value="">-- Chọn mã giảm giá --</option>
            {coupons.map(c => (
              <option key={c.id} value={c.id}>
                {c.code} - {c.discount_type === "percent" ? `${c.discount_value}%` : `${Number(c.discount_value).toLocaleString()}đ`}
              </option>
            ))}
          </Form.Select>
          {couponWarning && <small className="text-danger">{couponWarning}</small>}

          {/* Tổng tiền */}
          <div>💰 Tổng: <strong>{totalAmount.toLocaleString()}đ</strong></div>
          <div>➖ Giảm: <strong>{(totalAmount - finalAmount).toLocaleString()}đ</strong></div>
          <div>🧾 Thanh toán: <strong>{finalAmount.toLocaleString()}đ</strong></div>

          {/* Khách đưa */}
          <Form.Control
            type="number"
            className="my-2"
            placeholder="Khách đưa"
            value={customerPay}
            onChange={(e) => setCustomerPay(Number(e.target.value))}
          />
          <div>🔁 Trả lại: <strong style={{color: refund<0?'red':'green'}}>{refund>=0 ? refund.toLocaleString()+'đ' : "Chưa đủ"}</strong></div>

          <Button variant="success" className="w-100 mt-2" onClick={handleCheckout} disabled={isSubmitting}>
            {isSubmitting ? "Đang xử lý..." : "💰 Xác nhận thanh toán"}
          </Button>
        </Card>
      </Col>

      {/* Modal thêm sản phẩm */}
      <Modal show={showModal} onHide={()=>setShowModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>🛒 {selectedProduct?.name}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedProduct && (
            <>
              <div className="text-center mb-3">
                <Image src={`${URL_WEB}/uploads/${selectedProduct.image}`} fluid style={{maxHeight:200, objectFit:"contain"}} />
              </div>

              <div className="mb-3">
                <strong>📏 Chọn size:</strong>
                <div className="d-flex flex-wrap gap-2 mt-2">
                  {selectedProduct.size?.split(",").map((s,idx)=>(
                    <Button key={idx} size="sm" variant={selectedSize===s?"primary":"outline-primary"} onClick={()=>setSelectedSize(s)}>{s}</Button>
                  ))}
                </div>
              </div>

              <div className="mb-3">
                <strong>🎨 Chọn màu:</strong>
                <div className="d-flex flex-wrap gap-2 mt-2">
                  {selectedProduct.color?.split(",").map((c,idx)=>(
                    <Button key={idx} size="sm" variant={selectedColor===c?"secondary":"outline-secondary"} onClick={()=>setSelectedColor(c)}>{c}</Button>
                  ))}
                </div>
              </div>

              <Form.Group>
                <Form.Label>🔢 Số lượng</Form.Label>
                <Form.Control type="number" min={1} max={selectedProduct.stock} value={quantity} onChange={(e)=>setQuantity(Math.min(selectedProduct.stock, Math.max(1, parseInt(e.target.value)||1)))} />
                <small className="text-muted">Còn lại: {selectedProduct.stock}</small>
              </Form.Group>
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="outline-secondary" onClick={()=>setShowModal(false)}>Hủy</Button>
          <Button variant="success" onClick={handleConfirmAddToCart}>Thêm vào giỏ</Button>
        </Modal.Footer>
      </Modal>
    </Row>
  );
}

export default POSPage;
