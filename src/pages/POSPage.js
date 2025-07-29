import React, { useState, useEffect } from "react";
import {
  getProducts,
  getCoupons,
  createOrder,
  getCustomers
} from "../api/posApi";
import {
  Button, Modal, Form, Row, Col, Table, Card, Spinner, Image
} from "react-bootstrap";
import { showSuccessToast ,showErrorToast} from "../ultis/toastUtils";

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
const discount = selectedCoupon?.discount_value || 0;
const finalAmount = totalAmount - discount;

const refund = customerPay - finalAmount;

  // Tìm kiếm sản phẩm
  useEffect(() => {
    if (search.trim().length === 0) {
      setProducts([]);
      return;
    }

    setLoading(true);
    const timer = setTimeout(() => {
      getProducts(search)
        .then(setProducts)
        .finally(() => setLoading(false));
    }, 500);

    return () => clearTimeout(timer);
  }, [search]);

  // Lấy mã giảm giá
  useEffect(() => {
    async function fetchCoupons() {
      try {
        const res = await getCoupons();
        setCoupons(Array.isArray(res?.coupons) ? res.coupons : []);
      } catch (err) {
        console.error("Lỗi lấy coupons:", err);
        setCoupons([]);
      }
    }

    fetchCoupons();
  }, []);
  // khách hàng
  useEffect(() => {
  async function fetchCustomers() {
    try {
      const res = await getCustomers();
      setCustomers(Array.isArray(res?.customers) ? res.customers : []);
    } catch (err) {
      console.error("Lỗi lấy danh sách khách hàng:", err);
      setCustomers([]);
    }
  }
  fetchCustomers();
}, []);
useEffect(() => {
  if (!selectedCustomerId) {
    setCustomerInfo(null);
    return;
  }

  const found = customers.find(c => c.id === parseInt(selectedCustomerId));
  setCustomerInfo(found || null);

  // Tự động cập nhật email, địa chỉ, ghi chú nếu có
  setEmail(found?.email || "");
  setAddress(found?.address || "");
  setNote(found?.note || "");
}, [selectedCustomerId, customers]);
  //coupon
useEffect(() => {
  if (!selectedCoupon) {
    setCouponWarning("");
    return;
  }

  const total = cart.reduce((sum, item) => sum + item.total, 0);
  const minTotal = parseFloat(selectedCoupon.min_order_total);

  if (total < minTotal) {
    setCouponWarning(`⚠️ Mã "${selectedCoupon.code}" yêu cầu đơn hàng tối thiểu ${minTotal.toLocaleString()}đ.`);
  } else {
    setCouponWarning("");
  }
}, [cart, selectedCoupon]);
  // Mở modal sản phẩm
  const handleAddClick = (product) => {
    setSelectedProduct(product);
    setSelectedSize("");
    setSelectedColor("");
    setQuantity(1);
    setShowModal(true);
  };

  // Thêm vào giỏ hàng
  const handleConfirmAddToCart = () => {
    if (!selectedSize || !selectedColor || quantity < 1) {
      showErrorToast("Sản phẩm", "Vui lòng chọn đầy đủ thông tin sản phẩm!");
      return;
    }

    const item = {
      ...selectedProduct,
      size: selectedSize,
      color: selectedColor,
      quantity,
      total: selectedProduct.price * quantity,
    };

    setCart([...cart, item]);
    setShowModal(false);
  };

  // Xoá khỏi giỏ
  const removeItem = (index) => {
    const updated = [...cart];
    updated.splice(index, 1);
    setCart(updated);
  };

  // Thanh toán
    const handleCheckout = async () => {
  setIsSubmitting(true); // 🟢 Bắt đầu loading

let discount = 0;
const total = cart.reduce((sum, item) => sum + item.total, 0);
const shipping = 0;

if (selectedCoupon) {
  const minTotal = parseFloat(selectedCoupon.min_order_total || 0);
  if (total >= minTotal) {
    if (selectedCoupon.discount_type === "percent") {
      discount = Math.floor((selectedCoupon.discount_value / 100) * total);
    } else {
      discount = selectedCoupon.discount_value;
    }
  } else {
    showErrorToast("Mã giảm giá",`❗ Mã "${selectedCoupon.code}" yêu cầu đơn hàng tối thiểu ${minTotal.toLocaleString()}đ.`);
    setIsSubmitting(false);
    return;
  }
}

 if (!selectedCustomerId && (!guestInfo.full_name || !guestInfo.phone || !email || !address)) {
  showErrorToast("Khách hàng","Vui lòng nhập đầy đủ thông tin khách hàng.");
  setIsSubmitting(false);
  return;
}

  const detailedItems = cart.map(item => ({
    product_id: item.id,
    quantity: item.quantity,
    price: Number(item.price),
    name: item.name,
    size: item.size,
    color: item.color,
  }));

  const orderData = {
    items: detailedItems,
    total,
    discount,
    shipping,
    final_total: total - discount + shipping,
    coupon_id: selectedCoupon?.id || null,
    payment_method: paymentMethod,
    status: paymentMethod === "COD" ? "Chờ xử lý" : "Đang chờ thanh toán",
    note,
    address,
    customer_email: email,
    customer_name: selectedCustomerId ? customerInfo?.full_name : guestInfo.full_name,
    customer_phone: selectedCustomerId ? customerInfo?.phone : guestInfo.phone,
    customer_id: selectedCustomerId || null,
  };

  try {
    if (paymentMethod === "COD") {
      const res = await fetch(`${URL_API}/orders/add`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(orderData),
      });

      const data = await res.json();

      if (res.ok) {
        if (selectedCoupon) {
          await fetch(`${URL_API}/coupons/use/${selectedCoupon.id}`, {
            method: "PATCH",
          });
        }
        setCart([]);
        setSelectedCoupon(null);
        setGuestInfo({ full_name: "", phone: "" });
        setSelectedCustomerId("");
        setEmail("");
        setAddress("");
        setNote("");
        setCustomerPay(0)
        showSuccessToast("Đặt hàng","Đơn hàng đã được tạo!");
      } else {
        showSuccessToast("❌ Lỗi khi tạo đơn hàng: " + (data.message || "Không rõ nguyên nhân."));
      }
    } else if (paymentMethod === "VNPAY") {
      const res = await fetch(`${URL_API}/orders/create-vnpay`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderData),
      });

      const data = await res.json();
      if (res.ok && data.paymentUrl) {
        window.location.href = data.paymentUrl;
      } else {
        showErrorToast("❌ Không tạo được link thanh toán.");
      }
    }
  } catch (err) {
    console.error("❌ Lỗi khi xử lý đơn hàng:", err);
    showErrorToast("❌ Không thể gửi đơn hàng.");
  } finally {
    setIsSubmitting(false); // 🔴 Kết thúc loading
  }
};

console.log(customers);

  return (
    <Row className="p-4">
      {/* 🔍 Tìm kiếm sản phẩm */}
      <Col md={7}>
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

        {loading && (
          <div className="text-center py-4">
            <Spinner animation="border" variant="primary" />
          </div>
        )}

        <div style={{ maxHeight: "80%", overflowY: "auto" }} className="p-2 border rounded bg-light">
         <Row xs={2} md={3} className="g-3">
  {products.map((product) => (
    <Col key={product.id}>
      <Card className="h-100 shadow-sm">
        <Card.Img
          variant="top"
          src={`${URL_WEB}/uploads/${product.image}`}
          style={{ height: 140, objectFit: "cover" }}
        />
        <Card.Body>
          <Card.Title>{product.name}</Card.Title>
          <Card.Text className="text-success fw-bold">
            {Number(product.price).toLocaleString()}đ
          </Card.Text>
        </Card.Body>
        <Card.Footer className="text-center">
          <Button
            variant="outline-primary"
            size="sm"
            onClick={() => handleAddClick(product)}
          >
            ➕ Thêm vào giỏ
          </Button>
        </Card.Footer>
      </Card>
    </Col>
  ))}
        </Row>

        </div>
      </Col>

      {/* 🛒 Giỏ hàng */}
      <Col md={5}>
        <Card className="mb-3 shadow-sm">
          <Card.Body>
            <h5 className="mb-3">🛒 Giỏ hàng</h5>
            {cart.length === 0 ? (
              <p className="text-muted">Chưa có sản phẩm nào trong giỏ</p>
            ) : (
              <Table responsive bordered size="sm" className="align-middle text-center">
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
                      <td>{item.total.toLocaleString()}đ</td>
                      <td>
                        <Button
                          size="sm"
                          variant="danger"
                          onClick={() => removeItem(idx)}
                        >
                          ✕
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            )}
          </Card.Body>
        </Card>

          <Form.Group className="mb-3">
            <Form.Label>👤 Khách hàng</Form.Label>
            <Form.Select
              value={selectedCustomerId}
              onChange={(e) => setSelectedCustomerId(e.target.value)}
            >
              <option value="">-- Khách vãng lai --</option>
              {customers.map((cus) => (
                <option key={cus.id} value={cus.id}>
                  {cus.full_name} - {cus.phone}
                </option>
              ))}
            </Form.Select>
          </Form.Group>
           {customerInfo && (
                    <div className="border p-3 rounded bg-white shadow-sm mt-3">
                      <h6 className="mb-3 text-primary">
                        <i className="bi bi-person-lines-fill me-2"></i>Thông tin khách hàng
                      </h6>
                      <div className="row mb-2">
                        <div className="col-12 col-md-6 mb-2">
                          <i className="bi bi-envelope-fill me-2 text-muted"></i>
                          <strong>Email:</strong> {customerInfo.email}
                        </div>
                        <div className="col-12 col-md-6 mb-2">
                          <i className="bi bi-geo-alt-fill me-2 text-muted"></i>
                          <strong>Địa chỉ:</strong> {customerInfo.address}
                        </div>
                      </div>
                      {customerInfo.note && (
                        <div className="mt-2">
                          <i className="bi bi-journal-text me-2 text-muted"></i>
                          <strong>Ghi chú:</strong> {customerInfo.note}
                        </div>
                      )}
                    </div>
                  )}


          {/* Nếu là khách vãng lai thì hiển thị form nhập tên/sđt */}
                {!selectedCustomerId && (
                  <>
                    <Row className="mb-3">
                      <Col md={6}>
                        <Form.Floating className="mb-2">
                          <Form.Control
                            value={guestInfo.full_name}
                            onChange={(e) => setGuestInfo({ ...guestInfo, full_name: e.target.value })}
                            placeholder="👤 Họ tên"
                          />
                          <label>👤 Họ tên</label>
                        </Form.Floating>
                      </Col>

                      <Col md={6}>
                        <Form.Floating className="mb-2">
                          <Form.Control
                            value={guestInfo.phone}
                            onChange={(e) => setGuestInfo({ ...guestInfo, phone: e.target.value })}
                            placeholder="📱 Số điện thoại"
                          />
                          <label>📱 Số điện thoại</label>
                        </Form.Floating>
                      </Col>
                    </Row>

                    <Row className="mb-3">
                      <Col md={6}>
                        <Form.Floating className="mb-2">
                          <Form.Control
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="📧 Email"
                          />
                          <label>📧 Email</label>
                        </Form.Floating>
                      </Col>

                      <Col md={6}>
                        <Form.Floating className="mb-2">
                          <Form.Control
                            value={address}
                            onChange={(e) => setAddress(e.target.value)}
                            placeholder="🏠 Địa chỉ"
                          />
                          <label>🏠 Địa chỉ</label>
                        </Form.Floating>
                      </Col>
                    </Row>

                    <Form.Group className="mb-3">
                      <Form.Label>📝 Ghi chú</Form.Label>
                      <Form.Control
                        as="textarea"
                        rows={2}
                        value={note}
                        onChange={(e) => setNote(e.target.value)}
                        placeholder="Nhập ghi chú nếu có..."
                      />
                    </Form.Group>
                  </>
                )}

                <Form.Group className="mb-4">
                  <Form.Label className="fw-bold">
                    🎁 Mã giảm giá
                  </Form.Label>
                  <Form.Select
                    value={selectedCoupon?.id || ""}
                    onChange={(e) => {
                      const id = parseInt(e.target.value);
                      const coupon = coupons.find(c => c.id === id);
                      setSelectedCoupon(coupon || null);
                    }}
                    className="shadow-sm rounded"
                  >
                    <option value="">-- Chọn mã giảm giá --</option>
                    {coupons.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.code} (
                        {c.discount_type === "percent"
                          ? `Giảm ${c.discount_value}%`
                          : `Giảm ${parseFloat(c.discount_value).toLocaleString()}đ`}
                        )
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>

                <Form.Group className="mb-4">
                  <Form.Label className="fw-bold">
                    💳 Phương thức thanh toán
                  </Form.Label>
                  <Form.Select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="shadow-sm rounded"
                  >
                    <option value="COD">📦 Thanh toán khi nhận hàng (COD)</option>
                    <option value="VNPAY">🏦 Thanh toán qua VNPAY</option>
                  </Form.Select>
                </Form.Group>

          <Card className="p-3 mt-3 border-0 shadow-sm">
                <Card.Title>💵 Thanh toán</Card.Title>

                {/* Tổng tiền */}
                <div className="mb-2">
                  💰 Tổng tiền:{" "}
                  <strong>
                    {cart.reduce((s, i) => s + i.total, 0).toLocaleString()}đ
                  </strong>
                </div>

                {/* Giảm giá */}
                <div className="mb-2">
                  ➖ Giảm:{" "}
                  <strong>
                    {(() => {
                      const total = cart.reduce((s, i) => s + i.total, 0);
                      if (!selectedCoupon) return "0đ";
                      if (selectedCoupon.discount_type === "percent") {
                        return `${Math.round((total * selectedCoupon.discount_value) / 100).toLocaleString()}đ`;
                      } else {
                        return `${parseFloat(selectedCoupon.discount_value).toLocaleString()}đ`;
                      }
                    })()}
                  </strong>
                </div>

                {/* Thành tiền */}
                <div className="mb-3">
                  🧾 Thanh toán:{" "}
                  <strong>
                    {(() => {
                      const total = cart.reduce((s, i) => s + i.total, 0);
                      let discount = 0;
                      if (selectedCoupon) {
                        if (selectedCoupon.discount_type === "percent") {
                          discount = Math.round((total * selectedCoupon.discount_value) / 100);
                        } else {
                          discount = selectedCoupon.discount_value;
                        }
                      }
                      const finalAmount = Math.max(total - discount, 0);
                      return finalAmount.toLocaleString() + "đ";
                    })()}
                  </strong>
                </div>

                {/* Khách đưa */}
                <Form.Group className="mb-2">
                  <Form.Label>💵 Khách đưa</Form.Label>
                  <Form.Control
                    type="number"
                    placeholder="Nhập số tiền khách đưa"
                    value={customerPay}
                    onChange={(e) => setCustomerPay(Number(e.target.value))}
                  />
                </Form.Group>

                {/* Trả lại */}
                <div className="mb-0">
                  🔁 Trả lại:{" "}
                  <strong style={{ color: (() => {
                    const total = cart.reduce((s, i) => s + i.total, 0);
                    let discount = 0;
                    if (selectedCoupon) {
                      if (selectedCoupon.discount_type === "percent") {
                        discount = Math.round((total * selectedCoupon.discount_value) / 100);
                      } else {
                        discount = selectedCoupon.discount_value;
                      }
                    }
                    const finalAmount = Math.max(total - discount, 0);
                    return customerPay - finalAmount < 0 ? "red" : "green";
                  })() }}>
                    {(() => {
                      const total = cart.reduce((s, i) => s + i.total, 0);
                      let discount = 0;
                      if (selectedCoupon) {
                        if (selectedCoupon.discount_type === "percent") {
                          discount = Math.round((total * selectedCoupon.discount_value) / 100);
                        } else {
                          discount = selectedCoupon.discount_value;
                        }
                      }
                      const finalAmount = Math.max(total - discount, 0);
                      const refund = customerPay - finalAmount;
                      return refund >= 0 ? refund.toLocaleString() + "đ" : "Chưa đủ";
                    })()}
                  </strong>
                </div>
              </Card>
 <Button
          variant="success"
          className="w-100"
          disabled={isSubmitting}
          onClick={handleCheckout}
        >
          {isSubmitting ? (
            <>
              <Spinner animation="border" size="sm" className="me-2" />
              Đang xử lý...
            </>
          ) : (
            "💰 Xác nhận thanh toán"
          )}
        </Button>
      </Col>

      {/* 📦 Modal thêm vào giỏ */}
<Modal show={showModal} onHide={() => setShowModal(false)} centered size="md">
  <Modal.Header closeButton>
    <Modal.Title>🛒 {selectedProduct?.name}</Modal.Title>
  </Modal.Header>
  <Modal.Body>
    {selectedProduct && (
      <>
        {/* Ảnh sản phẩm */}
        <div className="text-center mb-4">
          <Image
            src={`${URL_WEB}/uploads/${selectedProduct?.image}`}
            fluid
            className="border rounded shadow-sm"
            style={{ maxHeight: "220px", objectFit: "contain" }}
          />
        </div>

        {/* Chọn Size */}
        <div className="mb-3">
          <strong>📏 Chọn size:</strong>
          <div className="d-flex flex-wrap gap-2 mt-2">
            {selectedProduct.size?.split(",").map((size, idx) => (
              <Button
                key={idx}
                variant={selectedSize === size ? "primary" : "outline-primary"}
                size="sm"
                className="rounded-pill px-3"
                onClick={() => setSelectedSize(size)}
              >
                {size}
              </Button>
            ))}
          </div>
        </div>

        {/* Chọn Màu */}
        <div className="mb-3">
          <strong>🎨 Chọn màu:</strong>
          <div className="d-flex flex-wrap gap-2 mt-2">
            {selectedProduct.color?.split(",").map((color, idx) => (
              <Button
                key={idx}
                variant={selectedColor === color ? "secondary" : "outline-secondary"}
                size="sm"
                className="rounded-pill px-3"
                onClick={() => setSelectedColor(color)}
              >
                {color}
              </Button>
            ))}
          </div>
        </div>

        {/* Nhập số lượng */}
        <Form.Group>
          <Form.Label>🔢 Số lượng</Form.Label>
          <Form.Control
            type="number"
            min={1}
            value={quantity}
            onChange={(e) =>
              setQuantity(Math.max(1, parseInt(e.target.value) || 1))
            }
          />
        </Form.Group>
      </>
    )}
  </Modal.Body>
  <Modal.Footer>
    <Button variant="outline-secondary" onClick={() => setShowModal(false)}>
      ❌ Hủy
    </Button>
    <Button variant="success" onClick={handleConfirmAddToCart}>
      ✅ Thêm vào giỏ
    </Button>
  </Modal.Footer>
</Modal>

    </Row>
  );
}

export default POSPage;
