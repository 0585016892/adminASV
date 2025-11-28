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

  const [showProductModal, setShowProductModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
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

  useEffect(() => {
    if (!selectedCustomerId) return setCustomerInfo(null);
    const found = customers.find(c => c.id === parseInt(selectedCustomerId));
    setCustomerInfo(found || null);
    setEmail(found?.email || "");
    setAddress(found?.address || "");
    setNote(found?.note || "");
  }, [selectedCustomerId, customers]);

  useEffect(() => {
    if (!selectedCoupon) return setCouponWarning("");
    const total = cart.reduce((s, i) => s + i.total, 0);
    const minTotal = parseFloat(selectedCoupon.min_order_total);
    if (total < minTotal) {
      setCouponWarning(`Mã "${selectedCoupon.code}" yêu cầu đơn hàng tối thiểu ${minTotal.toLocaleString()}đ.`);
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
    setShowProductModal(true);
  };

  const handleConfirmAddToCart = () => {
    if (!selectedSize) return showErrorToast("Vui lòng chọn size!");
    if (!selectedColor) return showErrorToast("Vui lòng chọn màu!");
    if (quantity > selectedProduct.stock) return showErrorToast(`Số lượng không đủ! Chỉ còn ${selectedProduct.stock}`);

    const item = {
      ...selectedProduct,
      size: selectedSize,
      color: selectedColor,
      quantity,
      total: selectedProduct.price * quantity
    };
    setCart([...cart, item]);
    setShowProductModal(false);
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

    if (selectedCoupon) {
      const minTotal = parseFloat(selectedCoupon.min_order_total || 0);
      if (total >= minTotal) {
        discount = selectedCoupon.discount_type === "percent"
          ? Math.floor((selectedCoupon.discount_value / 100) * total)
          : selectedCoupon.discount_value;
      } else {
        showErrorToast(`Mã "${selectedCoupon.code}" yêu cầu đơn hàng tối thiểu ${minTotal.toLocaleString()}đ.`);
        setIsSubmitting(false);
        return;
      }
    }

    if (!selectedCustomerId && (!guestInfo.full_name || !guestInfo.phone || !email || !address)) {
      showErrorToast("Vui lòng nhập đầy đủ thông tin khách hàng.");
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
        setShowPaymentModal(false);
        if (paymentMethod === "VNPAY" && data.paymentUrl) window.location.href = data.paymentUrl;
        else showSuccessToast("Đơn hàng đã được tạo!");
      } else {
        showErrorToast(data.message || "Không rõ nguyên nhân.");
      }
    } catch {
      showErrorToast("Không thể gửi đơn hàng.");
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
      {/* Sản phẩm */}
      <Col md={7} style={{overflowY:'auto', height:'100%'}}>
        <Card className="mb-3 shadow-sm">
          <Card.Body>
            <h5>Tìm kiếm sản phẩm</h5>
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
          {products.map(product => (
            <Col key={product.id}>
              <Card className="h-100 shadow-sm cursor-pointer" onClick={() => handleAddClick(product)}>
                <Card.Img
                  src={`${URL_WEB}/uploads/${product.image}`}
                  style={{height:140, objectFit:"cover"}}
                />
                <Card.Body>
                  <Card.Title>{product.name}</Card.Title>
                  <Card.Text className="text-success fw-bold">
                    {Number(product.price).toLocaleString()} đ
                  </Card.Text>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      </Col>

      {/* Giỏ hàng */}
      <Col md={5} style={{overflowY:'auto', height:'100%'}}>
        <Card className="mb-3 shadow-sm">
          <Card.Body>
            <h5>Giỏ hàng</h5>
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
                  {cart.map((item, idx) => (
                    <tr key={idx}>
                      <td>{item.name}</td>
                      <td>{item.quantity}</td>
                      <td>{item.size}/{item.color}</td>
                      <td>{item.total.toLocaleString()} đ</td>
                      <td>
                        <Button size="sm" variant="danger" onClick={()=>removeItem(idx)}>Xóa</Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            )}

            {cart.length > 0 && (
              <Button className="mt-2 w-100" variant="primary" onClick={()=>setShowPaymentModal(true)}>
                Thanh toán
              </Button>
            )}
          </Card.Body>
        </Card>
      </Col>

      {/* Modal sản phẩm */}
      <Modal show={showProductModal} onHide={()=>setShowProductModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>{selectedProduct?.name}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedProduct && (
            <>
              <div className="text-center mb-3">
                <Image src={`${URL_WEB}/uploads/${selectedProduct.image}`} fluid style={{maxHeight:200, objectFit:"contain"}} />
              </div>
              <div className="mb-3">
                <strong>Chọn size:</strong>
                <div className="d-flex flex-wrap gap-2 mt-2">
                  {selectedProduct.size?.split(",").map((s,idx)=>(
                    <Button key={idx} size="sm" variant={selectedSize===s?"primary":"outline-primary"} onClick={()=>setSelectedSize(s)}>{s}</Button>
                  ))}
                </div>
              </div>

              <div className="mb-3">
                <strong>Chọn màu:</strong>
                <div className="d-flex flex-wrap gap-2 mt-2">
                  {selectedProduct.color?.split(",").map((c,idx)=>(
                    <Button key={idx} size="sm" variant={selectedColor===c?"secondary":"outline-secondary"} onClick={()=>setSelectedColor(c)}>{c}</Button>
                  ))}
                </div>
              </div>

              <Form.Group>
                <Form.Label>Số lượng</Form.Label>
                <Form.Control type="number" min={1} max={selectedProduct.stock} value={quantity} onChange={(e)=>setQuantity(Math.min(selectedProduct.stock, Math.max(1, parseInt(e.target.value)||1)))} />
                <small className="text-muted">Còn lại: {selectedProduct.stock}</small>
              </Form.Group>
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="outline-secondary" onClick={()=>setShowProductModal(false)}>Hủy</Button>
          <Button variant="success" onClick={handleConfirmAddToCart}>Thêm vào giỏ</Button>
        </Modal.Footer>
      </Modal>

      {/* Modal thanh toán */}
      <Modal show={showPaymentModal} onHide={()=>setShowPaymentModal(false)} centered size="lg" >
        <Modal.Header closeButton>
          <Modal.Title>Thanh toán</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Row>
            <Col md={6}>
              <h6>Thông tin khách hàng</h6>
              <Form.Select
                value={selectedCustomerId}
                onChange={(e)=>setSelectedCustomerId(e.target.value)}
              >
                <option value="">Khách vãng lai</option>
                {customers.map(c=>(
                  <option key={c.id} value={c.id}>{c.full_name} - {c.phone}</option>
                ))}
              </Form.Select>

              {!selectedCustomerId && (
                <>
                  <Form.Control className="my-2" placeholder="Họ tên" value={guestInfo.full_name} onChange={(e)=>setGuestInfo({...guestInfo, full_name:e.target.value})} />
                  <Form.Control className="my-2" placeholder="SĐT" value={guestInfo.phone} onChange={(e)=>setGuestInfo({...guestInfo, phone:e.target.value})} />
                  <Form.Control className="my-2" placeholder="Email" value={email} onChange={(e)=>setEmail(e.target.value)} />
                  <Form.Control className="my-2" placeholder="Địa chỉ" value={address} onChange={(e)=>setAddress(e.target.value)} />
                  <Form.Control className="my-2" as="textarea" rows={2} placeholder="Ghi chú" value={note} onChange={(e)=>setNote(e.target.value)} />
                </>
              )}
            </Col>

            <Col md={6}>
              <h6>Thông tin thanh toán</h6>
              <Form.Select className="mb-2" value={selectedCoupon?.id || ""} onChange={(e) => {
                const found = coupons.find(c => c.id === parseInt(e.target.value));
                setSelectedCoupon(found || null);
              }}>
                <option value="">Chọn mã giảm giá</option>
                {coupons.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.code} - {c.discount_type === "percent" ? `${c.discount_value}%` : `${Number(c.discount_value).toLocaleString()}đ`}
                  </option>
                ))}
              </Form.Select>
              {couponWarning && <small className="text-danger">{couponWarning}</small>}

              <div className="my-2">Tổng: <strong>{totalAmount.toLocaleString()} đ</strong></div>
              <div>Giảm: <strong>{(totalAmount - finalAmount).toLocaleString()} đ</strong></div>
              <div>Thanh toán: <strong>{finalAmount.toLocaleString()} đ</strong></div>

              <Form.Control
                type="number"
                className="my-2"
                placeholder="Khách đưa"
                value={customerPay}
                onChange={(e) => setCustomerPay(Number(e.target.value))}
              />
              <div>Trả lại: <strong style={{color: refund<0?'red':'green'}}>{refund>=0 ? refund.toLocaleString()+' đ' : "Chưa đủ"}</strong></div>

              <Form.Select className="my-2" value={paymentMethod} onChange={(e)=>setPaymentMethod(e.target.value)}>
                <option value="COD">Thanh toán khi nhận hàng</option>
                <option value="VNPAY">Thanh toán VNPAY</option>
              </Form.Select>

              <Button className="w-100 mt-2" variant="success" onClick={handleCheckout} disabled={isSubmitting}>
                {isSubmitting ? "Đang xử lý..." : "Xác nhận thanh toán"}
              </Button>
            </Col>
          </Row>
        </Modal.Body>
      </Modal>
    </Row>
  );
}

export default POSPage;
