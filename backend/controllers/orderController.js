import Order from "../models/Order.js";

export const placeOrder = async (req, res) => {
  const { products, totalAmount, address } = req.body;
  try {
    const order = new Order({
      user: req.user.id,
      products,
      totalAmount,
      address,
      paymentStatus: "done", // for now we hardcode, later use Stripe
    });
    await order.save();
    res.status(201).json({ message: "Order placed successfully", order });
  } catch (err) {
    res.status(500).json({ message: "Order creation failed" });
  }
};

export const getUserOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user.id }).populate(
      "products.product"
    );
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch orders" });
  }
};
