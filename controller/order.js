const formidable = require("formidable");

const Product = require("../model/product");
const Order = require("../model/order");


exports.createOrder = async(req,res)=>{
    const {orderItems,staff,student,totalAmount,school } = req.body;
    let order ;
    try { 
        order = await Order.create({orderItems,staff,student,totalAmount,school});

    } catch (err) {
        console.log(err);
        return res.status(500).json({ err: "Order Failed" });
    }
    orderItems.forEach(async (item) => {
        let product;
        try{
            // console.log(item.id);
            product = await Product.findById(item.id);
            // console.log(product);
            product.quantity -=item.quantity;
            product.save();
        }catch (err){
            console.log(err);

        }
    });

    res.json(order);
}
